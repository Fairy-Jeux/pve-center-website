# Configuration, Sondes & Notifications

PVE Command Center centralise sa configuration déclarative dans `config/config.yaml` (monté sur `/app/config/config.yaml` en Docker). Un modèle commenté complet est fourni dans [`config/config.example.yaml`](https://github.com/Fairy-Jeux/pve-panel/blob/main/config/config.example.yaml).

## Fonctionnement de `config.yaml`

- **Interpolation `${VAR_NAME}`** : utilisez `${VAR_NAME}` ou `${VAR_NAME:-default}` dans n’importe quelle valeur YAML (résolu depuis `os.environ` et `.env` au chargement).
- **Préservation des modèles** : les modifications effectuées depuis l’UI Web, l’éditeur Apple ou l’API (`preserve_templates=True`) conservent vos références `${VAR_NAME}` et vos secrets inchangés (`********`).
- **Écriture atomique & Hot-Reload** : chaque enregistrement passe par un fichier temporaire + `os.replace`, recalcule `content_hash`, déclenche `watchfiles` et diffuse `config_reloaded` sur WebSocket/SSE.
- **Repli transparent** : en l’absence de `config/config.yaml`, `ConfigManager` synthétise automatiquement la configuration depuis `.env` + `services.yaml`.

---

## Schéma `config.yaml` (`AppConfig`)

### Sections de premier niveau

| Clé | Rôle |
|---|---|
| `version` | Version du schéma (entier `>= 1`, actuellement `1`) |
| `server` | Identité serveur, adresse d’écoute HTTP, URL publique, paramètres Bonjour/mDNS |
| `security` | SSO Tailscale, utilisateurs autorisés, secret session, hash PIN admin, jetons Bearer |
| `proxmox` | URL API Proxmox VE, token, vérification SSL, nœud par défaut, `panel_self_vmid` |
| `integrations` | Applications intégrées (`jellyfin`, `jellyseerr`, `plex`, `radarr`, `sonarr`, `prowlarr`, `qbittorrent`) |
| `alerts` | Intervalle de contrôle, seuil d’échecs et cooldown par défaut de `AlertEngine` |
| `notifications` | Configuration APNs HTTP/2 `.p8` et webhooks sortants (`discord`, `telegram`, `generic`) |
| `categories` | Tuiles de services classées par catégorie et widgets associés |
| `custom_services` | Services personnalisés supervisés (`http_rest`, `tcp_port`, `icmp_ping`, `json_metrics`, `webhook_ingest`) |
| `storage_mounts` | Points de montage hôte sous `/host_mnt`, identifiants WWN et libellés |

### `server`

```yaml
server:
  id: "00000000-0000-4000-8000-000000000001"
  name: "PVE Command Center"
  listen_host: "0.0.0.0"
  listen_port: 8000
  public_url: "https://pve-panel.example.ts.net"
  mdns_enabled: true
  mdns_service_name: "PVE Command Center"
  mdns_service_type: "_pvecenter._tcp.local."
  refresh_interval_seconds: 5
```

### `security`

```yaml
security:
  tailscale_sso_enabled: true
  allowed_tailscale_users:
    - "admin@example.com"
  dev_auth_bypass: false
  protected_owner_username: "admin"
  session_secret: "${SESSION_SECRET}"
  admin_pin_hash: ""
  api_tokens:
    - id: "uuid"
      name: "iPhone Pro"
      token_hash: "<sha256-hex>"
      role: "admin" # admin | operator | viewer | device
      created_at: "2026-11-18T09:00:00Z"
```

### `proxmox` & `integrations`

```yaml
proxmox:
  host: "https://192.168.1.10:8006"
  token_id: "root@pam!pve-panel"
  token_secret: "${PVE_TOKEN_SECRET}"
  verify_ssl: false
  default_node: "pve"
  panel_self_vmid: 116   # Empêche l'arrêt/redémarrage accidentel du LXC hébergeant le panel

integrations:
  jellyfin:
    url: "http://192.168.1.26:8096"
    api_key: "${JELLYFIN_API_KEY}"
  jellyseerr:
    url: "http://192.168.1.31:5055"
    api_key: "${JELLYSEERR_API_KEY}"
  plex:
    url: "http://192.168.1.30:32400"
    token: "${PLEX_TOKEN}"
  radarr:
    url: "http://192.168.1.27:7878"
    api_key: "${RADARR_API_KEY}"
  sonarr:
    url: "http://192.168.1.28:8989"
    api_key: "${SONARR_API_KEY}"
  prowlarr:
    url: "http://192.168.1.29:9696"
    api_key: "${PROWLARR_API_KEY}"
  qbittorrent:
    url: "http://192.168.1.32:8090"
    username: "admin"
    password: "${QBIT_PASSWORD}"
```

### `alerts`

| Champ | Type | Défaut | Contraintes |
|---|---|---|---|
| `enabled` | `bool` | `true` | Active/désactive l’envoi global d’alertes |
| `default_consecutive_failures` | `int` | `3` | `1..100` |
| `default_cooldown_seconds` | `int` | `300` | `0..86400` |
| `check_interval_seconds` | `int` | `30` | `5..3600` (cadence de boucle plafonnée à `min(..., 15)`s) |

---

## Protocoles de sondes (`custom_services`)

Chaque entrée `custom_services` définit un `protocol` et une politique optionnelle `alert_policy` (`enabled`, `consecutive_failures`, `cooldown_seconds`) :

| Protocole | Comportement de la sonde | Paramètres clés |
|---|---|---|
| `http_rest` | Requête asynchrone `GET`/`HEAD` vérifiant le code HTTP (`200`, liste de codes, ou `0` pour `2xx–3xx`) | `url`, `health_url`, `internal_url`, `expected_status`, `verify_ssl`, `auth_type` (`none`, `bearer`, `basic`, `header`), `auth_token`, `auth_header_name` (`X-API-Key` par défaut) |
| `tcp_port` | Connexion socket TCP asynchrone (`asyncio.open_connection`) avec mesure de latence en ms | `host`, `port` (`1..65535`, requis) |
| `icmp_ping` | Sous-processus `ping -c 1` (`-W` en ms sous macOS, secondes sous Linux) avec extraction `rtt_ms` & `packet_loss` | `host` |
| `json_metrics` | Requête HTTP `GET` JSON + extraction par chemins pointés (`items[0].ok`, alias `users=stats.active_users`, séparés par virgule/point-virgule) | `health_url` / `url`, `json_metric_path`, `expected_status`, `auth_type`, `auth_token` |
| `webhook_ingest` | Réception push enregistrée dans SQLite `StateStore` ; passe `degraded` en attente du premier signal, puis `down` si le TTL expire | `POST /api/custom-services/{id}/webhook`, `webhook_ttl_seconds` (`10..86400`, défaut `300`), `auth_type` + `auth_token` optionnels |

### Exemple `json_metrics`

```yaml
custom_services:
  - id: "adguard-home"
    name: "AdGuard Home"
    description: "Filtrage DNS & DHCP"
    category: "Réseau"
    icon: "adguard"
    protocol: "json_metrics"
    health_url: "http://192.168.1.2/control/status"
    auth_type: "basic"
    auth_token: "${ADGUARD_AUTH_TOKEN}"
    json_metric_path: "running,version"
    expected_status: 200
    refresh_interval_seconds: 30
    alert_policy:
      enabled: true
      consecutive_failures: 2
      cooldown_seconds: 300
```

### Exemple de heartbeat `webhook_ingest`

Envoyez un battement périodique depuis un script cron, une tâche de sauvegarde ou un service externe :

```bash
curl -X POST https://pve-panel.example.ts.net/api/custom-services/nightly-backup/webhook \
  -H "Authorization: Bearer $WEBHOOK_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "up",
    "message": "Snapshot ZFS synchronisé",
    "ttl_seconds": 900,
    "metrics": { "transferred_gb": 12.4, "duration_sec": 48 }
  }'
```

En-têtes acceptés : `Authorization: Bearer ...`, `auth_header_name` personnalisé, `X-Webhook-Token`, `X-API-Key` ou paramètre `?token=`.

---

## Canaux de notifications (`notifications`)

### Notifications Push APNs (`.p8` optionnel)

Sans clé `.p8`, iOS et macOS affichent déjà des notifications locales interactives via WebSocket/SSE et Apple TV affiche des bannières temps réel. Avec une clé Apple Developer Program montée dans `/app/config/AuthKey.p8` :

```yaml
notifications:
  apns:
    enabled: true
    team_id: "ABCDE12345"
    key_id: "XYZ1234567"
    bundle_id: "io.ac.pvepanel.app"
    private_key_path: "/app/config/AuthKey.p8"
    use_sandbox: false # true pour Debug Xcode, false pour TestFlight / App Store
```

Les charges APNs incluent `category: "SERVICE_ALERT"` et `mutable-content: 1`, activant les actions rapides iOS/macOS (**Mute 1h**, **Tester**).

### Webhooks (`discord`, `telegram`, `generic`)

- **Discord (`type: "discord"`)** : génère des Rich Embeds colorés (`#EF4444` panne, `#F59E0B` dégradé, `#10B981` rétablissement).
- **Telegram (`type: "telegram"`)** : appelle l’API Bot `sendMessage` avec échappement `MarkdownV2` via `bot_token` et `chat_id`.
- **Générique (`type: "generic"`)** : compatible **ntfy**, **Gotify** et **Home Assistant** — envoie un JSON structuré (`event`, `title`, `message`, `severity`, `service_id`, `service_name`, `status`, `latency_ms`, `timestamp`, `incident_id`, `details`) avec `headers` personnalisés :

```yaml
notifications:
  webhooks:
    - id: "discord-ops"
      name: "Discord Homelab Alerts"
      type: "discord"
      enabled: true
      url: "${DISCORD_WEBHOOK_URL}"
      notify_on_down: true
      notify_on_recovery: true
      include_details: true

    - id: "telegram-ops"
      name: "Telegram Bot Alerts"
      type: "telegram"
      enabled: false
      bot_token: "${TELEGRAM_BOT_TOKEN}"
      chat_id: "${TELEGRAM_CHAT_ID}"

    - id: "ntfy-generic"
      name: "ntfy / Gotify / Home Assistant"
      type: "generic"
      enabled: false
      url: "https://ntfy.example.com/homelab"
      headers:
        Authorization: "Bearer ${NTFY_TOKEN}"
```

---

## Variables d’environnement (`.env`) & Repli `services.yaml`

Surcharges de chemins et de liaison réseau :

| Variable | Défaut | Rôle |
|---|---|---|
| `CONFIG_PATH` | `/app/config/config.yaml` (ou `./config/config.yaml`) | Chemin vers `config.yaml` |
| `STATE_DB_PATH` | `/app/config/state.db` | Chemin vers la base SQLite WAL |
| `ENV_FILE_PATH` | `/app/.env` (ou `./.env`) | Surcharge du chemin `.env` |
| `SERVICES_CONFIG_PATH` | `../services.yaml` | Fichier hérité catégories/stockage |
| `STATIC_DIR` | `/app/static` (ou `frontend/dist`) | Dossier de la SPA React 19 compilée |
| `LISTEN_HOST` / `LISTEN_PORT` | `0.0.0.0` / `8000` | Hôte et port d’écoute Uvicorn |

Toutes les variables de `.env.example` (`DEV_AUTH_BYPASS`, `ALLOWED_TAILSCALE_USERS`, `PROTECTED_OWNER_USERNAME`, `PVE_*`, `JELLYFIN_*`, `JELLYSEERR_*`, `PLEX_*`, `RADARR_*`, `SONARR_*`, `PROWLARR_*`, `QBIT_*`) restent utilisables à la fois comme repli et comme sources d’interpolation `${VAR}` dans `config.yaml`.

Le format hérité `services.yaml` suit exactement le modèle [`services.example.yaml`](https://github.com/Fairy-Jeux/pve-panel/blob/main/services.example.yaml).
