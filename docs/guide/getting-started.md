# Getting Started

**PVE Command Center** (**PVE Center**) is a real-time operations cockpit for **Proxmox VE**, **SMART / MergerFS disk arrays**, **media & \*arr stacks**, **custom service monitoring**, and **multi-channel alerting** — built around a lightweight FastAPI server and native multi-platform clients.

## Key Capabilities

- **Proxmox VE Hypervisor Control**: Real-time node CPU, RAM, rootfs, uptime, storage pool telemetry, and one-click `start`, `stop`, `reboot`, and `shutdown` actions for LXC containers and QEMU VMs — protected by `panel_self_vmid` so the panel never stops its own container.
- **Storage & SMART Visibility**: Mounts host drives read-only (`/host_mnt:ro`) and correlates filesystem usage (`statvfs`) with Proxmox SMART disk health and optional WWN/label mappings.
- **Media, \*arr & User Management**: Live widgets for **Jellyfin**, **Plex**, **Radarr**, **Sonarr**, **Prowlarr**, and **qBittorrent** (including Turtle Mode & torrent pause/resume), **Jellyseerr** request approval/decline, library scan triggers, and unified Jellyfin + Jellyseerr account provisioning & permission sync.
- **Declarative `config.yaml` + Hot-Reload**: Single YAML configuration file with `${VAR_NAME}` / `${VAR_NAME:-default}` interpolation, template preservation, atomic saves, `watchfiles` live reload, and seamless fallback to legacy `.env` + `services.yaml`.
- **Stateful Alert Engine**: 5 probe protocols (`http_rest`, `tcp_port`, `icmp_ping`, `json_metrics`, `webhook_ingest`), SQLite WAL incident timeline (`state.db`), debounce (`consecutive_failures`), anti-spam cooldown, per-service `Mute 1h`, and automatic `DOWN → UP` recovery notifications.
- **Zero-Config LAN & Encrypted Apple TV Pairing**: Automatic Bonjour mDNS advertisement (`_pvecenter._tcp.local.`), LAN discovery scanner, `pvecenter://` QR deep-linking, and end-to-end encrypted 6-digit PIN pairing from iPhone to Apple TV (`CryptoKit` P-256 ECDH + `HKDF-SHA256` + `AES-256-GCM`).

## The 4-Repository Ecosystem

PVE Command Center is organized into four focused open-source repositories under the MIT License:

| Repository | Purpose | Tech Stack |
|---|---|---|
| [`PVE-Center/pve-panel`](https://github.com/PVE-Center/pve-panel) | Core server, embedded Web PWA, Docker image, and automated Proxmox LXC installer | Python 3.12, FastAPI, SQLite WAL, React 19, Vite 6, Tailwind CSS |
| [`PVE-Center/pve-center-apple`](https://github.com/PVE-Center/pve-center-apple) | Native Apple universal app for iPhone, iPad, Mac, and Apple TV (`tvOS 27.0`) | Swift 6, SwiftUI, SwiftData, Keychain, Swift Charts, CryptoKit, Network.framework |
| [`PVE-Center/pve-center-clients`](https://github.com/PVE-Center/pve-center-clients) | Native desktop & Android clients built from the React 19 UI | Tauri v2 (Rust + System Tray) for Windows/Linux, Capacitor 8 for Android |
| [`PVE-Center/pve-center-website`](https://github.com/PVE-Center/pve-center-website) | Official showcase, download hub, and bilingual EN/FR documentation portal | VitePress 1.x, Vue 3, Liquid Glass CSS |

## Prerequisites

### Server Requirements (`pve-panel`)

- **Proxmox VE 8+** host (for automated LXC provisioning via `install.sh` Mode A) **or** any Linux host / existing Debian/Ubuntu LXC container (for `install.sh` Mode B or manual Docker Compose).
- **Docker Engine** & **Docker Compose v2** (`install.sh` installs them automatically if missing).
- **Tailscale** account (optional, recommended for HTTPS Tailscale Serve SSO via `*.ts.net` and remote access without port forwarding).
- **Proxmox API Token** (`root@pam!pve-panel` with restricted `PanelRole`: `Sys.Audit VM.Audit Datastore.Audit VM.PowerMgmt` — automatically created by `install.sh` Mode A).

### Client Requirements (Optional)

- **Web PWA**: Any modern browser (or Safari *Add to Home Screen* on iOS/iPadOS). Served directly by `pve-panel` on port `8000` (or via Tailscale HTTPS).
- **Apple Native**: iOS 27 / iPadOS 27 / macOS 27 / tvOS 27 (Xcode 27+ & Swift 6.2 when building from source; works with a free Personal Apple account or paid Apple Developer Program for APNs background push).
- **Windows / Linux / Android**: Download pre-built installers from [`pve-center-clients` Releases](https://github.com/PVE-Center/pve-center-clients/releases), or build locally with Node.js 22+, Rust/Cargo (Tauri v2), or Android SDK / Gradle (Capacitor 8).

## First-Run Onboarding & Demo Mode

1. On initial boot (`is_configured == false`), opening the Web UI or any native client launches the **4-Step Onboarding Wizard**:
   - **Step 1 — Connection & Identity**: Server name, public URL, Bonjour/mDNS discovery, or `pvecenter://` QR scan.
   - **Step 2 — Security & Access**: Enable Tailscale SSO (`allowed_tailscale_users`), set an optional **Admin PIN**, and mint your first `pve_...` Bearer API token.
   - **Step 3 — Proxmox & Homelab Apps**: Configure Proxmox host/token and media/\*arr integrations with live **Test** probes (`POST /api/setup/test-service`).
   - **Step 4 — Quick-Add LAN Discovery**: Scan local `_http._tcp`, `_ssh._tcp`, and `_smb._tcp` services via `GET /api/discovery/lan` and save `config/config.yaml`.
2. **Built-in Demo Mode**: On Apple native clients, tap **"Explorer en Mode Démo"** during onboarding (or in *Serveur & Connexion*) to explore every tab, chart, alert action, and YAML editor with realistic in-memory data (`DemoDataStore`) — no live server required.

## Next Steps

- [Install the server with `install.sh` or Docker Compose →](/guide/installation)
- [Explore the DualAuth security & AlertEngine architecture →](/guide/architecture)
- [Configure `config.yaml`, connectors & notification channels →](/reference/configuration)
- [Set up & build Apple, Desktop & Android clients →](/guide/clients)
