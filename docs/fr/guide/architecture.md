# Architecture & Sécurité

PVE Command Center sépare son **plan de contrôle FastAPI** (`pve-panel`) de son interface **Web PWA**, de ses **applications Apple natives Swift 6** et de ses **clients Tauri / Capacitor** via des APIs REST typées, des flux temps réel WebSocket/SSE et des annonces Bonjour mDNS.

## Topologie du système

```text
+-----------------------------------------------------------------------------+
|                        Infrastructure Homelab                               |
|  Proxmox VE (:8006)  ·  Jellyfin / Plex / Jellyseerr / *arr / qBittorrent   |
|  Sondes Custom (http_rest, tcp_port, icmp_ping, json_metrics, webhook)      |
|  Stockage hôte & SMART (montage /host_mnt:ro)                               |
+--------------------------------------+--------------------------------------+
                                       |
                                       v
+-----------------------------------------------------------------------------+
|                   Plan de contrôle FastAPI (pve-panel :8000)                |
|                                                                             |
|  ConfigManager (config/config.yaml + hot-reload watchfiles + repli .env)    |
|  TailscaleSSOMiddleware (DualAuth ASGI : SSO loopback + Bearer/JWT)         |
|  StateStore (SQLite WAL state.db : états, incidents, heartbeats, APNs)      |
|  AlertEngine (boucle async : debounce, cooldown, mute, reprise DOWN -> UP)  |
|  NotificationDispatcher (APNs HTTP/2 .p8, Discord, Telegram, Generic JSON)  |
|  MDNSPublisher (_pvecenter._tcp.local.) & PairingRelayStore (PIN 6 chiffres)|
|  RealtimeBus (WS /api/ws/events + SSE /api/events/stream)                   |
+--------------------------------------+--------------------------------------+
                                       |
          +----------------------------+----------------------------+
          |                            |                            |
          v                            v                            v
    Web PWA Embarquée          Apps Apple Natives         Desktop & Android
  (React 19 + Tailwind)     (Swift 6 / SwiftUI / Charts) (Tauri v2 / Capacitor 8)
   Servie (/app/static)     SwiftData + Keychain + mDNS   Windows, Linux, Android
                            Appairage P-256 Apple TV      URL distante & System Tray
```

## Composants principaux

### 1. Backend FastAPI (`backend/app/main.py`)

Au démarrage du `lifespan` ASGI, le serveur initialise :

- **Clients HTTP mutualisés (`httpx.AsyncClient`)** : `pve_http` (respecte `proxmox.verify_ssl`, timeouts 5s/3s) et `media_http` (timeouts 3,5s/2,5s pour les services locaux).
- **`ConfigManager`** : charge `config/config.yaml`, résout les variables `${VAR_NAME}`, préserve les modèles lors des éditions depuis l’UI, écrit de manière atomique et surveille le disque via `watchfiles` pour notifier instantanément `RealtimeBus`, `AlertEngine` et `MDNSPublisher`.
- **`StateStore` (SQLite WAL)** : ouvre `state.db` (`STATE_DB_PATH=/app/config/state.db`) avec :
  - `PRAGMA journal_mode=WAL`
  - `PRAGMA synchronous=NORMAL`
  - `PRAGMA foreign_keys=ON`
  - Protégé par un verrou réentrant (`threading.RLock`) et exposé en asynchrone pour `service_states`, `incidents`, `webhook_heartbeats` et `apns_devices`.
- **Service de la SPA Web** : distribue le bundle React 19 depuis `/app/static` (ou `frontend/dist`) avec l’en-tête `Cache-Control: no-store, no-cache, must-revalidate, max-age=0` sur les fichiers `.html`.

### 2. Modèle de sécurité DualAuth ASGI (`tailscale_auth.py`)

`TailscaleSSOMiddleware` évalue chaque connexion `http` et `websocket` entrante :

| Origine client | Mécanisme vérifié | Clients typiques |
|---|---|---|
| **Loopback** (`127.0.0.1`, `::1`, `localhost`, `::ffff:127.0.0.1`) | En-tête `Tailscale-User-Login` validé contre `security.allowed_tailscale_users` (si `tailscale_sso_enabled: true`), OU jeton `Bearer`, OU `dev_auth_bypass: true` (dev uniquement) | Tailscale Serve HTTPS (`*.ts.net`), dev local |
| **Hors loopback / LAN / WS / SSE** | `Authorization: Bearer <token>` (ou `?token=<token>` pour `/api/events/stream` et `/api/ws/*`), comparé en temps constant contre les hash SHA-256 de `security.api_tokens` (`pve_...`) ou vérifié en JWT session HMAC-HS256 | iPhone, iPad, Mac, Apple TV, Windows, Linux, Android |

- **Connexion Session (`POST /api/auth/login`)** : accepte soit un `api_token` (`token`), soit le code `admin_pin` (vérifié contre `security.admin_pin_hash`) et délivre un JWT HMAC-HS256 valide `86400`s (24h). Protégé contre le brute-force (`10` échecs par fenêtre de `60`s → HTTP `429`).
- **Routes publiques cadrées** :
  - `GET /api/health`
  - `POST /api/auth/login`
  - `/api/pairing/*` (protégé par PIN + rate-limit)
  - `GET /api/onboarding/status`
  - `POST /api/custom-services/{service_id}/webhook` (vérifié par `auth_token` si configuré)
  - Routes SPA statiques `GET`/`HEAD` hors `/api` et `/assets/*`
  - Routes de premier démarrage (`/api/onboarding*`, `/api/setup/status`, `/api/setup/test-service`, `/api/setup/config`, `/api/discovery/lan`) **uniquement lorsque `is_configured() == false`**. Une fois configuré, `/api/onboarding/init` exige un jeton/session `admin`.

### 3. Moteur d’alertes SQLite (`alert_engine.py`)

La boucle asynchrone `AlertEngine` exécute un cycle déterministe :

1. **Ordonnancement** : s’éveille toutes les `min(alerts.check_interval_seconds, 15)` secondes (ou immédiatement lors d’un rechargement YAML) et teste les `custom_services` actifs dont `refresh_interval_seconds` est échu.
2. **Verrouillage par service** : utilise un `asyncio.Lock` par `service_id` pour éviter toute concurrence entre le polling périodique et les webhooks entrants.
3. **Debounce anti-faux positifs** : incrémente `consecutive_failures` à chaque échec ; ne passe à `down` et ne crée un incident SQLite qu’après `alert_policy.consecutive_failures` échecs (par défaut `3`).
4. **Cooldown & Mute** : respecte `alert_policy.cooldown_seconds` (`300`s par défaut) et la fenêtre `muted_until` (`Mute 1h`) avant d’envoyer les notifications sortantes.
5. **Reprise automatique (`DOWN → UP`)** : lorsqu’un service en panne répond de nouveau (`ok=True, status="up"`), clôture les incidents ouverts en base SQLite, publie `alert_resolved` et notifie les canaux actifs (sauf si muté).

### 4. Télémétrie temps réel (`RealtimeBus` — WebSocket & SSE)

`RealtimeBus` diffuse des enveloppes JSON normalisées en `snake_case` à tous les abonnés :

```json
{
  "type": "service_status_changed",
  "timestamp": "2026-11-18T09:30:00Z",
  "payload": {
    "service_id": "adguard-home",
    "service_name": "AdGuard Home",
    "previous_status": "up",
    "status": "down",
    "latency_ms": 4000,
    "message": "HTTP timeout"
  }
}
```

- **WebSocket (`WS /api/ws/events`)** : ferme avec le code `4401` si non authentifié ; émet un événement `ping` toutes les `25`s et accepte `"pong"` ou `{"type": "pong"}`.
- **SSE (`GET /api/events/stream`)** : envoie `: connected` à l’ouverture, `: keepalive` toutes les `25`s et `data: <json>\n\n` à chaque événement (`X-Accel-Buffering: no`).
- **Types d’événements** : `ping`, `config_reloaded`, `service_status_changed`, `alert_triggered`, `alert_resolved`, `incident_acknowledged`, `pairing_completed`.

### 5. Appairage chiffré Apple TV (`ECDH P-256 + HKDF + AES-256-GCM`)

Pour transférer URL et jeton Bearer de l’iPhone/Mac vers l’Apple TV sans saisie laborieuse à la télécommande, `PairingCryptoService` et `PairingRelayStore` implémentent un chiffrement authentifié de bout en bout sur deux transports :

```text
Apple TV (Récepteur)                                    iPhone / Mac (Émetteur)
────────────────────                                    ───────────────────────
1. Génère une paire éphémère P-256 ECDH
2. Génère un PIN à 6 chiffres (TTL 300s / 5 min)
3. Publie _pvepair._tcp.local. (Bonjour)
   ET/OU POST /api/pairing/sessions ──────────────────> 4. Découvre via Bonjour
                                                            ou saisit le PIN (Relais)
5. Échange de clés publiques <────────────────────────> 6. Dérive une clé 256 bits :
                                                            HKDF-SHA256(
                                                              secret = ECDH(sk, pk),
                                                              salt = "pvecenter-pairing-salt-v1:<PIN>",
                                                              info = "pvecenter-pairing-aes256gcm-v1:<PIN>"
                                                            )
                                                         7. Chiffre en AES-256-GCM
8. Déchiffre et vérifie le tag GCM <────────────────────    (URL, Nom, Bearer Token)
   (trame Bonjour OU GET /api/pairing/sessions/{pin}/payload)
9. Enregistre le profil dans SwiftData & le jeton dans Keychain
```

- **Transport local Bonjour (`_pvepair._tcp.local.`)** : utilise `NWListener` / `NWConnection` (`includePeerToPeer = true`) avec trames JSON préfixées sur 4 octets big-endian (`hello` → `bundle` → `ack`, taille max 1 Mio).
- **Repli Relais HTTPS (`/api/pairing/sessions/*`)** : fonctionne à travers différents VLAN ou via Tailscale. Protégé contre le brute-force (`10` échecs / `60`s → HTTP `429` avec `Retry-After`) et à lecture unique (l’appel `/payload` supprime aussitôt la session de la mémoire du serveur). Le serveur n’a jamais accès ni au code PIN ni aux identifiants en clair.
