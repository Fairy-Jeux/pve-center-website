# Installation & Deployment

PVE Command Center (`pve-panel`) can be deployed via the automated **`install.sh`** script (recommended for Proxmox VE hosts and Debian/Ubuntu servers) or manually via **Docker Compose**.

## Option 1 — Automated Installer (`install.sh`)

Run `install.sh` as `root` directly on your **Proxmox VE host** or inside an existing **Linux / LXC** server:

```bash
git clone https://github.com/PVE-Center/pve-panel.git pve-panel
cd pve-panel
chmod +x install.sh
sudo ./install.sh
```

The script automatically detects whether `pveversion` is available and selects the right provisioning path:

### Mode A: Proxmox VE Host (`pveversion` detected)

When executed on a Proxmox VE host, `install.sh` automates the full container lifecycle:

1. Prompts for LXC parameters (auto-detecting `/cluster/nextid`, active `rootdir` storage, and `vztmpl` template storage), RAM (`1024` MB default), disk (`8G` default), bridge (`vmbr0`), network (`dhcp` or static CIDR + gateway), allowed Tailscale users, and protected owner username.
2. Downloads the latest `debian-12-standard` LXC template via `pveam` if needed and creates an unprivileged LXC with nesting & keyctl enabled:
   ```text
   --features "nesting=1,keyctl=1" --unprivileged 1 --onboot 1 --cores 2
   ```
3. Adds a read-only bind mount for host storage inspection to `/etc/pve/lxc/<VMID>.conf`:
   ```text
   lxc.mount.entry: /mnt host_mnt none rbind,ro,create=dir 0 0
   ```
4. Creates a dedicated restricted Proxmox role **`PanelRole`** with privileges `Sys.Audit VM.Audit Datastore.Audit VM.PowerMgmt` and issues the privilege-separated API token **`root@pam!pve-panel`** (`--privsep 1`).
5. Copies the repository into `/opt/pve-panel` inside the container, generates a 32-byte random `SESSION_SECRET`, populates `.env` with `PANEL_SELF_VMID=<VMID>`, and invokes `install.sh --in-container` inside the LXC.

### Mode B: Linux Server / Existing LXC

When executed inside a Linux machine or with `--in-container`:

1. Installs **Docker Engine** & **Docker Compose** (via `get.docker.com`) and **Tailscale** if absent.
2. Creates `./config` (`chmod 700`) and initializes `config/config.yaml` (`chmod 600`), `.env`, and `services.yaml` if not present.
3. Builds and starts the container (`docker compose up -d --build`).
4. Runs `tailscale up` and exposes the panel over HTTPS with `tailscale serve --bg http://127.0.0.1:8000`.
5. Updates `server.public_url` in `config/config.yaml` with the detected `https://<node>.<tailnet>.ts.net` URL and prints the `pvecenter://connect?...` Apple pairing link.

#### Supported CLI Flags

```bash
./install.sh [OPTIONS]
  --in-container             Force Linux / existing LXC mode (Mode B)
  --ts-hostname <name>       Desired Tailscale hostname
  --allowed-users <emails>   Comma-separated allowed Tailscale login emails
  --pve-node <node>          Default Proxmox VE node name
  -h, --help                 Show help
```

---

## Option 2 — Manual Docker Compose

```bash
git clone https://github.com/PVE-Center/pve-panel.git pve-panel
cd pve-panel
mkdir -p config
cp config/config.example.yaml config/config.yaml
cp .env.example .env
cp services.example.yaml services.yaml
docker compose up -d --build
```

### Multi-Stage Dockerfile Architecture

The [`Dockerfile`](https://github.com/PVE-Center/pve-panel/blob/main/Dockerfile) uses a two-stage build:

1. **Stage 1 (`node:22-alpine`)**: Installs frontend dependencies (`npm ci`) and compiles the React 19 + TypeScript + Vite 6 + Tailwind PWA into `dist/`.
2. **Stage 2 (`python:3.12-slim`)**: Installs `iputils-ping` (for `icmp_ping` service checks) and `ca-certificates`, installs Python dependencies from `backend/requirements.txt`, copies `backend/app` and static assets to `/app/static`, and starts Uvicorn on port `8000` with `--no-proxy-headers`.

### Network Mode: `host` vs `bridge` + Avahi

By default, `docker-compose.yml` configures `network_mode: host` for two technical reasons:

1. **Native Bonjour / mDNS**: Multicast `224.0.0.251:5353` announcements (`_pvecenter._tcp.local.`) and LAN discovery scans (`GET /api/discovery/lan`) work directly on the host network interface without multicast routing quirks.
2. **Exact Loopback Verification (`DualAuth`)**: With `--no-proxy-headers`, HTTPS traffic proxied by `tailscale serve` arrives strictly from `127.0.0.1` / `::1` with the `Tailscale-User-Login` header, whereas non-loopback LAN clients must present a Bearer token or session JWT.

If you prefer `bridge` mode with host `avahi-daemon` D-Bus socket forwarding:

```yaml
services:
  pve-panel:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: pve-panel
    restart: unless-stopped
    ports:
      - "${LISTEN_PORT:-8000}:8000"
    environment:
      - CONFIG_PATH=/app/config/config.yaml
      - STATE_DB_PATH=/app/config/state.db
      - LISTEN_HOST=0.0.0.0
      - LISTEN_PORT=8000
    volumes:
      - ./config:/app/config:rw
      - /host_mnt:/host_mnt:ro
      - /var/run/dbus:/var/run/dbus
      - /var/run/avahi-daemon/socket:/var/run/avahi-daemon/socket
```

::: warning Bridge Mode & Tailscale Serve
In `bridge` mode, traffic from host `tailscale serve` arrives via the Docker bridge gateway (e.g. `172.17.0.1`) rather than `127.0.0.1`. Because `TailscaleSSOMiddleware` only trusts `Tailscale-User-Login` from loopback IPs, authenticate clients using **Bearer API tokens** or **Admin PIN** (`POST /api/auth/login`) when running in `bridge` mode.
:::

---

## Tailscale Serve SSO Setup

To expose PVE Command Center securely on your Tailnet with automatic HTTPS certificates and identity headers:

```bash
tailscale up --advertise-tags=tag:panel --hostname=pve-panel
tailscale serve --bg http://127.0.0.1:8000
```

Recommended Tailscale ACL snippet restricting access to your admin email:

```json
{
  "tagOwners": {
    "tag:panel": ["admin@example.com"]
  },
  "acls": [
    {
      "action": "accept",
      "src": ["admin@example.com"],
      "dst": ["tag:panel:*"]
    }
  ]
}
```

Ensure `security.tailscale_sso_enabled: true` and `security.allowed_tailscale_users` contains your exact Tailscale login email(s) in `config/config.yaml`.

---

## Bonjour / mDNS Discovery (`_pvecenter._tcp`)

When `server.mdns_enabled: true` (default), `MDNSPublisher` uses `AsyncZeroconf` to register `_pvecenter._tcp.local.` on the primary non-loopback LAN IPv4 address (`listen_port`, default `8000`) with the following TXT record metadata:

| TXT Key | Value |
|---|---|
| `id` | `server.id` UUID |
| `name` | `server.name` |
| `version` | Server version (`1.0.0`) |
| `port` | `server.listen_port` |
| `https` | `"true"` when `server.public_url` starts with `https://`, else `"false"` |
| `public_url` | `server.public_url` (up to 200 chars) |

The server also exposes `GET /api/discovery/lan` to browse `_pvecenter._tcp.local.`, `_http._tcp.local.`, `_ssh._tcp.local.`, and `_smb._tcp.local.` on the LAN so you can quick-add discovered homelab services during onboarding.

---

## Local Development (`DEV_AUTH_BYPASS`)

```bash
# 1. Build frontend assets
cd frontend && npm ci && npm run build && cd ..

# 2. Run FastAPI backend with Python 3.12
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
DEV_AUTH_BYPASS=true uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000
```

::: danger Never Enable `DEV_AUTH_BYPASS` in Production
`security.dev_auth_bypass: true` (or `DEV_AUTH_BYPASS=true`) disables authentication for loopback `127.0.0.1` / `::1` requests. Always keep it `false` in production deployments.
:::
