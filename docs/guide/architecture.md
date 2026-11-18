# Architecture & Security

PVE Command Center separates its stateful **FastAPI control plane** (`pve-panel`) from its reactive **Web PWA**, **Apple Swift 6 native apps**, and **Tauri / Capacitor clients** via typed REST APIs, real-time WebSocket/SSE streams, and local mDNS announcements.

## System Topology

```text
+-----------------------------------------------------------------------------+
|                        Homelab Infrastructure                               |
|  Proxmox VE (:8006)  ·  Jellyfin / Plex / Jellyseerr / *arr / qBittorrent   |
|  Custom Probes (http_rest, tcp_port, icmp_ping, json_metrics, webhook)      |
|  Host Storage & SMART (/host_mnt:ro bind mount)                             |
+--------------------------------------+--------------------------------------+
                                       |
                                       v
+-----------------------------------------------------------------------------+
|                    FastAPI Control Plane (pve-panel :8000)                  |
|                                                                             |
|  ConfigManager (config/config.yaml + watchfiles hot-reload + .env fallback) |
|  TailscaleSSOMiddleware (DualAuth ASGI: Loopback SSO + Bearer/JWT)          |
|  StateStore (SQLite WAL state.db: states, incidents, heartbeats, APNs)      |
|  AlertEngine (async loop: debounce, cooldown, mute, DOWN -> UP recovery)    |
|  NotificationDispatcher (APNs HTTP/2 .p8, Discord, Telegram, Generic JSON)  |
|  MDNSPublisher (_pvecenter._tcp.local.) & PairingRelayStore (6-digit PIN)   |
|  RealtimeBus (WS /api/ws/events + SSE /api/events/stream)                   |
+--------------------------------------+--------------------------------------+
                                       |
          +----------------------------+----------------------------+
          |                            |                            |
          v                            v                            v
  Embedded Web PWA             Apple Native Apps           Desktop & Android
  (React 19 + Tailwind)     (Swift 6 / SwiftUI / Charts)   (Tauri v2 / Capacitor 8)
  Served at /app/static     SwiftData + Keychain + mDNS    Windows, Linux, Android
                            P-256 ECDH Apple TV Pairing    Remote URL & System Tray
```

## Core Components

### 1. FastAPI Backend (`backend/app/main.py`)

During the ASGI `lifespan`, the server initializes and manages:

- **Pooled `httpx.AsyncClient` instances**: `pve_http` (honoring `proxmox.verify_ssl`, 5s/3s timeouts) and `media_http` (3.5s/2.5s timeouts for local homelab services).
- **`ConfigManager`**: Loads `config/config.yaml`, interpolates `${VAR_NAME}` environment placeholders, preserves templates during UI edits, writes atomically, and runs a `watchfiles` watcher that pushes `config_reloaded` events to `RealtimeBus`, `AlertEngine`, and `MDNSPublisher`.
- **`StateStore` (SQLite WAL)**: Opens `state.db` (`STATE_DB_PATH=/app/config/state.db`) with:
  - `PRAGMA journal_mode=WAL`
  - `PRAGMA synchronous=NORMAL`
  - `PRAGMA foreign_keys=ON`
  - Protected by a re-entrant lock (`threading.RLock`) and async wrappers for `service_states`, `incidents`, `webhook_heartbeats`, and `apns_devices`.
- **Static SPA Serving**: Serves the compiled React 19 bundle from `/app/static` (or `frontend/dist`) with `Cache-Control: no-store, no-cache, must-revalidate, max-age=0` on `.html` files so updates apply immediately without stale browser cache.

### 2. DualAuth ASGI Security Model (`tailscale_auth.py`)

`TailscaleSSOMiddleware` inspects every incoming `http` and `websocket` ASGI scope:

| Client Origin | Accepted Credentials | Typical Clients |
|---|---|---|
| **Loopback** (`127.0.0.1`, `::1`, `localhost`, `::ffff:127.0.0.1`) | `Tailscale-User-Login` verified against `security.allowed_tailscale_users` (when `tailscale_sso_enabled: true`), OR `Authorization: Bearer`, OR `dev_auth_bypass: true` (dev only) | Tailscale Serve HTTPS (`*.ts.net`), local dev |
| **Non-Loopback / LAN / WS / SSE** | `Authorization: Bearer <token>` (or `?token=<token>` on `/api/events/stream` and `/api/ws/*`), matched in constant time against SHA-256 hashes in `security.api_tokens` (`pve_...`) or verified as an HMAC-HS256 session JWT | iPhone, iPad, Mac, Apple TV, Windows, Linux, Android |

- **Session Login (`POST /api/auth/login`)**: Accepts either an `api_token` (`token`) or the `admin_pin` (verified against `security.admin_pin_hash`), returning a signed 24-hour (`86400`s) HMAC-HS256 JWT. Protected by an in-memory brute-force rate limiter (`10` failures per `60`s window -> HTTP `429`).
- **Public Exempt Routes**:
  - `GET /api/health`
  - `POST /api/auth/login`
  - `/api/pairing/*` (PIN-gated + rate-limited)
  - `GET /api/onboarding/status`
  - `POST /api/custom-services/{service_id}/webhook` (verified via optional service `auth_token`)
  - Non-`/api` `GET`/`HEAD` static SPA routes & `/assets/*`
  - First-run setup routes (`/api/onboarding*`, `/api/setup/status`, `/api/setup/test-service`, `/api/setup/config`, `/api/discovery/lan`) **strictly while `is_configured() == false`**. Once configured, `/api/onboarding/init` requires an authenticated `admin`.

### 3. Stateful Alert Engine (`alert_engine.py`)

The background `AlertEngine` runs a continuous async polling loop:

1. **Scheduling**: Wakes every `min(alerts.check_interval_seconds, 15)` seconds (or immediately on config reload) and evaluates enabled `custom_services` whose `refresh_interval_seconds` has elapsed.
2. **Per-Service Locking**: Acquires an `asyncio.Lock` per `service_id` to prevent race conditions between scheduled polls and incoming push webhooks.
3. **Debouncing**: Increments `consecutive_failures` on failed checks; transitions to `down` and opens an SQLite incident only when failures reach `alert_policy.consecutive_failures` (default `3`).
4. **Cooldown & Mute**: Enforces `alert_policy.cooldown_seconds` (default `300`s) and per-service `muted_until` windows (`Mute 1h`) before dispatching outbound alerts.
5. **Automatic Recovery**: When a previously `down` service returns `ok=True, status="up"`, `AlertEngine` resolves open incidents in SQLite, publishes `alert_resolved`, and dispatches recovery notifications.

### 4. Real-Time Telemetry (`RealtimeBus` — WebSocket & SSE)

`RealtimeBus` fans out canonical snake_case event envelopes to all connected subscribers:

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

- **WebSocket (`WS /api/ws/events`)**: Rejects unauthenticated scopes with close code `4401`; sends `ping` events every `25`s and accepts `"pong"` text or `{"type": "pong"}` JSON.
- **SSE (`GET /api/events/stream`)**: Sends `: connected` on open, `: keepalive` every `25`s, and `data: <json>\n\n` per event (`X-Accel-Buffering: no`).
- **Emitted Event Types**: `ping`, `config_reloaded`, `service_status_changed`, `alert_triggered`, `alert_resolved`, `incident_acknowledged`, `pairing_completed`.

### 5. Apple TV Encrypted Pairing (`ECDH P-256 + HKDF + AES-256-GCM`)

To transfer server URLs and Bearer API tokens from iPhone/Mac to Apple TV without typing on the Siri Remote, `PairingCryptoService` and `PairingRelayStore` implement end-to-end authenticated encryption over two transports:

```text
Apple TV (Receiver)                                     iPhone / Mac (Sender)
───────────────────                                     ─────────────────────
1. Generate ephemeral P-256 ECDH keypair
2. Generate 6-digit PIN (TTL 300s / 5 min)
3. Advertise _pvepair._tcp.local. (Bonjour)
   AND/OR POST /api/pairing/sessions ──────────────────> 4. Discover via Bonjour
                                                            or enter PIN via Relay
5. Exchange ephemeral public keys <────────────────────> 6. Derive 32-byte key:
                                                            HKDF-SHA256(
                                                              secret = ECDH(sk, pk),
                                                              salt = "pvecenter-pairing-salt-v1:<PIN>",
                                                              info = "pvecenter-pairing-aes256gcm-v1:<PIN>"
                                                            )
                                                         7. AES-256-GCM seal payload
8. Decrypt & verify GCM tag <───────────────────────────    (URL, Name, Bearer Token)
   (via Bonjour frame OR GET /api/pairing/sessions/{pin}/payload)
9. Save profile in SwiftData & token in Keychain
```

- **Local Bonjour Transport (`_pvepair._tcp.local.`)**: Uses `NWListener` / `NWConnection` with `includePeerToPeer = true` and 4-byte big-endian length-prefixed JSON frames (`hello` → `bundle` → `ack`, max frame 1 MiB).
- **HTTPS Relay Fallback (`/api/pairing/sessions/*`)**: Works across VLANs or Tailscale. Protected by brute-force rate limiting (`10` failures / `60`s → HTTP `429` with `Retry-After`) and one-time consumption (fetching `/payload` immediately purges the session from server RAM). The server never sees the PIN-derived symmetric key or plaintext token.
