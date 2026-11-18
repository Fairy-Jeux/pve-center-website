# Configuration, Probes & Notifications

PVE Command Center stores its declarative configuration in `config/config.yaml` (mounted to `/app/config/config.yaml` in Docker). A complete annotated reference lives in [`config/config.example.yaml`](https://github.com/Fairy-Jeux/pve-panel/blob/main/config/config.example.yaml).

## Declarative `config.yaml` Features

- **Environment Variable Interpolation**: Use `${VAR_NAME}` or `${VAR_NAME:-default}` anywhere in YAML values (resolved from `os.environ` and `.env` at load time).
- **Template Preservation**: Saving updates through the Web UI, Apple YAML editor, or REST APIs (`preserve_templates=True`) keeps your `${VAR_NAME}` placeholders and unedited literal secrets (`********` masked sentinel) intact.
- **Atomic Persistence & Hot-Reload**: Every write uses a temporary file + `os.replace`, updates `content_hash`, triggers `watchfiles` reload, and broadcasts `config_reloaded` over WebSocket/SSE.
- **Zero-Friction Legacy Fallback**: If `config/config.yaml` does not exist yet, `ConfigManager` synthesizes an in-memory `AppConfig` from `.env` + `services.yaml`.

---

## `config.yaml` Schema Reference (`AppConfig`)

### Top-Level Sections

| Key | Description |
|---|---|
| `version` | Schema version (integer `>= 1`, currently `1`) |
| `server` | Server identity, HTTP bind address, public URL, Bonjour/mDNS settings |
| `security` | DualAuth SSO, allowed Tailscale users, session secret, Admin PIN hash, Bearer tokens |
| `proxmox` | Proxmox VE API endpoint, API token, SSL verification, default node, `panel_self_vmid` |
| `integrations` | Built-in homelab apps (`jellyfin`, `jellyseerr`, `plex`, `radarr`, `sonarr`, `prowlarr`, `qbittorrent`) |
| `alerts` | Global AlertEngine polling interval, failure threshold, and cooldown defaults |
| `notifications` | APNs HTTP/2 `.p8` push settings and outbound webhook channels (`discord`, `telegram`, `generic`) |
| `categories` | Categorized dashboard service cards and live widget assignments |
| `custom_services` | Extensible monitored services (`http_rest`, `tcp_port`, `icmp_ping`, `json_metrics`, `webhook_ingest`) |
| `storage_mounts` | Host mount paths under `/host_mnt`, WWN identifiers, and display labels |

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
  panel_self_vmid: 116   # Prevents self-shutdown/stop/reboot of the panel container

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

| Field | Type | Default | Constraints |
|---|---|---|---|
| `enabled` | `bool` | `true` | Enables/disables global AlertEngine dispatches |
| `default_consecutive_failures` | `int` | `3` | `1..100` |
| `default_cooldown_seconds` | `int` | `300` | `0..86400` |
| `check_interval_seconds` | `int` | `30` | `5..3600` (loop tick capped at `min(..., 15)`s) |

---

## Probe Protocols (`custom_services`)

Every `custom_services` entry accepts a `protocol` and optional per-service `alert_policy` (`enabled`, `consecutive_failures`, `cooldown_seconds`):

| Protocol | Probe Behavior | Key Fields |
|---|---|---|
| `http_rest` | Async `GET`/`HEAD` request checking status match (`200`, list of codes, or `0` for `2xx–3xx`) | `url`, `health_url`, `internal_url`, `expected_status`, `verify_ssl`, `auth_type` (`none`, `bearer`, `basic`, `header`), `auth_token`, `auth_header_name` (default `X-API-Key`) |
| `tcp_port` | Async TCP socket connect (`asyncio.open_connection`) measuring connect latency in ms | `host`, `port` (`1..65535`, required) |
| `icmp_ping` | Single-packet `ping -c 1` subprocess (`-W` ms on macOS, sec on Linux) parsing `rtt_ms` & `packet_loss` | `host` |
| `json_metrics` | HTTP `GET` JSON + dotted-path extraction (supports brackets like `items[0].ok`, aliases like `users=stats.active_users`, comma/semicolon-separated) | `health_url` / `url`, `json_metric_path`, `expected_status`, `auth_type`, `auth_token` |
| `webhook_ingest` | Passive push heartbeat stored in SQLite `StateStore`; marks `degraded` until first heartbeat, then `down` if TTL expires | `POST /api/custom-services/{id}/webhook`, `webhook_ttl_seconds` (`10..86400`, default `300`), optional `auth_type` + `auth_token` |

### `json_metrics` Example

```yaml
custom_services:
  - id: "adguard-home"
    name: "AdGuard Home"
    description: "DNS Filtering & DHCP"
    category: "Network"
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

### `webhook_ingest` Heartbeat Example

Send periodic heartbeats from cron jobs, backup scripts, or external runners:

```bash
curl -X POST https://pve-panel.example.ts.net/api/custom-services/nightly-backup/webhook \
  -H "Authorization: Bearer $WEBHOOK_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "up",
    "message": "ZFS snapshot synced",
    "ttl_seconds": 900,
    "metrics": { "transferred_gb": 12.4, "duration_sec": 48 }
  }'
```

Accepted webhook auth headers: `Authorization: Bearer ...`, custom `auth_header_name`, `X-Webhook-Token`, `X-API-Key`, or `?token=` query parameter.

---

## Notification Channels (`notifications`)

### APNs Push Notifications (Optional `.p8`)

Without an `.p8` key, iOS/macOS still receive interactive local notifications via WebSocket/SSE and Apple TV displays real-time banners. With an Apple Developer Program `.p8` key mounted at `/app/config/AuthKey.p8`:

```yaml
notifications:
  apns:
    enabled: true
    team_id: "ABCDE12345"
    key_id: "XYZ1234567"
    bundle_id: "io.ac.pvepanel.app"
    private_key_path: "/app/config/AuthKey.p8"
    use_sandbox: false # true for Xcode Debug, false for TestFlight / App Store
```

APNs payloads include `category: "SERVICE_ALERT"` and `mutable-content: 1`, enabling iOS/macOS quick actions (**Mute 1h**, **Test**).

### Webhooks (`discord`, `telegram`, `generic`)

- **Discord (`type: "discord"`)**: Sends Rich Embeds colored `#EF4444` (down), `#F59E0B` (degraded), or `#10B981` (up/recovery).
- **Telegram (`type: "telegram"`)**: Calls Telegram Bot API `sendMessage` with `MarkdownV2` escaping using `bot_token` and `chat_id`.
- **Generic (`type: "generic"`)**: Compatible with **ntfy**, **Gotify**, and **Home Assistant** webhooks — posts structured JSON (`event`, `title`, `message`, `severity`, `service_id`, `service_name`, `status`, `latency_ms`, `timestamp`, `incident_id`, `details`) plus custom `headers`:

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

## Environment Variables (`.env`) & Legacy `services.yaml`

Container and runtime path overrides:

| Variable | Default | Purpose |
|---|---|---|
| `CONFIG_PATH` | `/app/config/config.yaml` (or `./config/config.yaml`) | Path to declarative YAML config |
| `STATE_DB_PATH` | `/app/config/state.db` | Path to SQLite WAL state & incidents DB |
| `ENV_FILE_PATH` | `/app/.env` (or `./.env`) | Optional override for `.env` location |
| `SERVICES_CONFIG_PATH` | `../services.yaml` | Legacy categories/storage file path |
| `STATIC_DIR` | `/app/static` (or `frontend/dist`) | Compiled React 19 SPA directory |
| `LISTEN_HOST` / `LISTEN_PORT` | `0.0.0.0` / `8000` | Uvicorn bind host & port |

All `.env.example` service variables (`DEV_AUTH_BYPASS`, `ALLOWED_TAILSCALE_USERS`, `PROTECTED_OWNER_USERNAME`, `PVE_HOST`, `PVE_NODE`, `PVE_TOKEN_ID`, `PVE_TOKEN_SECRET`, `PVE_VERIFY_SSL`, `PANEL_SELF_VMID`, `JELLYFIN_*`, `JELLYSEERR_*`, `PLEX_*`, `RADARR_*`, `SONARR_*`, `PROWLARR_*`, `QBIT_*`) remain supported both as fallback settings and as `${VAR}` interpolation sources inside `config.yaml`.

Legacy `services.yaml` (`categories` + `storage_mounts`) follows the structure documented in [`services.example.yaml`](https://github.com/Fairy-Jeux/pve-panel/blob/main/services.example.yaml).
