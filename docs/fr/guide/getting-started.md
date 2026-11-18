# Bien démarrer

**PVE Command Center** (**PVE Center**) est un cockpit d’exploitation temps réel pour **Proxmox VE**, le stockage **SMART / MergerFS**, les services **médias & \*arr**, la supervision de services personnalisés et les **alertes multi-canaux** — articulé autour d’un serveur FastAPI léger et de clients natifs multi-plateformes.

## Fonctionnalités principales

- **Pilotage Proxmox VE** : télémétrie temps réel du nœud (CPU, RAM, rootfs, uptime), pools de stockage et actions `start`, `stop`, `reboot`, `shutdown` sur les conteneurs LXC et VMs QEMU — avec garde-fou anti-auto-arrêt `panel_self_vmid`.
- **Stockage & santé SMART** : montage lecture seule de l’hôte (`/host_mnt:ro`) et corrélation entre occupation disque (`statvfs`), statut SMART Proxmox et labels/WWN personnalisés.
- **Médias, \*arr & Gestion d’utilisateurs** : widgets temps réel **Jellyfin**, **Plex**, **Radarr**, **Sonarr**, **Prowlarr** et **qBittorrent** (mode Tortue & pause/reprise de torrents), validation/refus des requêtes **Jellyseerr**, scan des bibliothèques et synchronisation complète des comptes Jellyfin ↔ Jellyseerr.
- **Configuration déclarative `config.yaml` & Hot-Reload** : fichier YAML unique avec interpolation `${VAR_NAME}` / `${VAR_NAME:-default}`, préservation des modèles, écriture atomique, rechargement à chaud via `watchfiles` et repli transparent `.env` + `services.yaml`.
- **Moteur d’alertes SQLite & Notifications** : 5 connecteurs (`http_rest`, `tcp_port`, `icmp_ping`, `json_metrics`, `webhook_ingest`), timeline d’incidents SQLite WAL (`state.db`), debounce (`consecutive_failures`), cooldown anti-spam, `Mute 1h` par service et détection automatique de reprise `DOWN → UP`.
- **LAN Zéro-Config & Appairage Apple TV chiffré** : publication Bonjour `_pvecenter._tcp.local.`, scan LAN automatique, QR Code `pvecenter://` et transfert de session **iPhone → Apple TV** chiffré par code PIN à 6 chiffres (`CryptoKit` P-256 ECDH + `HKDF-SHA256` + `AES-256-GCM`).

## L’écosystème en 4 dépôts

PVE Command Center est structuré en quatre dépôts open-source distincts sous licence MIT :

| Dépôt | Rôle | Stack technique |
|---|---|---|
| [`PVE-Center/pve-panel`](https://github.com/PVE-Center/pve-panel) | Serveur FastAPI, Web PWA embarquée, Docker et installateur Proxmox LXC | Python 3.12, FastAPI, SQLite WAL, React 19, Vite 6, Tailwind CSS |
| [`PVE-Center/pve-center-apple`](https://github.com/PVE-Center/pve-center-apple) | App Apple universelle native (iPhone, iPad, Mac & Apple TV `tvOS 27.0`) | Swift 6, SwiftUI, SwiftData, Keychain, Swift Charts, CryptoKit, Network.framework |
| [`PVE-Center/pve-center-clients`](https://github.com/PVE-Center/pve-center-clients) | Clients Desktop & Mobile basés sur l’UI React 19 | Tauri v2 (Rust + System Tray) Windows/Linux, Capacitor 8 Android |
| [`PVE-Center/pve-center-website`](https://github.com/PVE-Center/pve-center-website) | Vitrine vitale, hub de téléchargements et documentation bilingue EN/FR | VitePress 1.x, Vue 3, Liquid Glass CSS |

## Prérequis

### Côté Serveur (`pve-panel`)

- Un hôte **Proxmox VE 8+** (pour la création automatique du LXC via `install.sh` Mode A) **ou** un serveur Linux / LXC Debian/Ubuntu existant (Mode B ou Docker Compose manuel).
- **Docker Engine** & **Docker Compose v2** (installés automatiquement par `install.sh` si absents).
- Un compte **Tailscale** (optionnel, recommandé pour exposer l’interface en HTTPS via Tailscale Serve `*.ts.net` avec SSO automatique).
- Un **jeton API Proxmox restreint** (`root@pam!pve-panel` avec le rôle `PanelRole` : `Sys.Audit VM.Audit Datastore.Audit VM.PowerMgmt` — généré automatiquement en Mode A).

### Côté Clients (Optionnel)

- **Web PWA** : tout navigateur moderne (ou Safari *Sur l’écran d’accueil* sur iOS/iPadOS), servi directement par `pve-panel` sur le port `8000` ou via Tailscale HTTPS.
- **Apple Natif** : iOS 27 / iPadOS 27 / macOS 27 / tvOS 27 (Xcode 27+ et Swift 6.2 pour compiler depuis les sources ; fonctionne avec un compte Apple gratuit, ou Apple Developer Program pour le push APNs en arrière-plan).
- **Windows / Linux / Android** : installeurs précompilés via [`pve-center-clients` Releases](https://github.com/PVE-Center/pve-center-clients/releases), ou compilation locale avec Node.js 22+, Rust/Cargo (Tauri v2) ou Android SDK / Gradle (Capacitor 8).

## Onboarding initial & Mode Démo

1. Au premier démarrage (`is_configured == false`), l’ouverture de l’UI Web ou d’un client natif déclenche l’assistant **Onboarding en 4 étapes** :
   - **Étape 1 — Connexion & Identité** : nom du serveur, URL publique, découverte Bonjour/mDNS ou scan QR `pvecenter://`.
   - **Étape 2 — Sécurité & Accès** : activation du SSO Tailscale (`allowed_tailscale_users`), code **PIN administrateur** optionnel et génération de votre premier jeton API Bearer (`pve_...`).
   - **Étape 3 — Proxmox & Services Homelab** : saisie de l’hôte Proxmox et des applications médias/\*arr avec bouton **Tester** en direct (`POST /api/setup/test-service`).
   - **Étape 4 — Quick-Add LAN** : scan automatique des services `_http._tcp`, `_ssh._tcp` et `_smb._tcp` via `GET /api/discovery/lan` et écriture atomique de `config/config.yaml`.
2. **Mode Démo intégré** : dans l’application Apple native, touchez **« Explorer en Mode Démo »** dès l’accueil (ou depuis *Serveur & Connexion*) pour tester toutes les vues, graphiques Swift Charts, incidents et l’éditeur YAML en mémoire (`DemoDataStore`) sans serveur actif.

## Pour continuer

- [Installer le serveur avec `install.sh` ou Docker Compose →](/fr/guide/installation)
- [Découvrir l’architecture DualAuth et AlertEngine →](/fr/guide/architecture)
- [Configurer `config.yaml`, les sondes et les notifications →](/fr/reference/configuration)
- [Compiler et installer les clients Apple, Desktop & Android →](/fr/guide/clients)
