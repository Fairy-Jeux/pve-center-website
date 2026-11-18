# Installation & Déploiement

PVE Command Center (`pve-panel`) peut être déployé automatiquement via le script **`install.sh`** (recommandé sur hôte Proxmox VE ou serveur Linux/LXC) ou manuellement avec **Docker Compose**.

## Option 1 — Installateur automatisé (`install.sh`)

Exécutez `install.sh` en `root` directement sur votre **hôte Proxmox VE** ou dans un conteneur **Linux / LXC** existant :

```bash
git clone https://github.com/PVE-Center/pve-panel.git pve-panel
cd pve-panel
chmod +x install.sh
sudo ./install.sh
```

Le script détecte automatiquement la présence de `pveversion` et adapte le déploiement :

### Mode A : Hôte Proxmox VE (`pveversion` détecté)

Sur un nœud Proxmox VE, `install.sh` orchestre la création complète d’un LXC dédié :

1. Propose de créer un conteneur LXC Debian 12 (pré-remplit le prochain `VMID` via `pvesh get /cluster/nextid`, le stockage `rootdir` et `vztmpl`), RAM (`1024` Mo par défaut), disque (`8G` par défaut), bridge (`vmbr0`), IP (`dhcp` ou CIDR statique + passerelle), utilisateurs Tailscale autorisés et compte propriétaire protégé.
2. Télécharge si besoin le template `debian-12-standard` via `pveam` et crée un LXC non privilégié prêt pour Docker :
   ```text
   --features "nesting=1,keyctl=1" --unprivileged 1 --onboot 1 --cores 2
   ```
3. Ajoute le montage en lecture seule des disques hôtes dans `/etc/pve/lxc/<VMID>.conf` :
   ```text
   lxc.mount.entry: /mnt host_mnt none rbind,ro,create=dir 0 0
   ```
4. Crée le rôle Proxmox restreint **`PanelRole`** (`Sys.Audit VM.Audit Datastore.Audit VM.PowerMgmt`) et le jeton API isolé **`root@pam!pve-panel`** (`--privsep 1`).
5. Copie le dépôt dans `/opt/pve-panel` du conteneur, génère un `SESSION_SECRET` aléatoire de 32 octets, configure `.env` avec `PANEL_SELF_VMID=<VMID>`, puis exécute `install.sh --in-container` à l’intérieur du LXC.

### Mode B : Serveur Linux / LXC existant

Dans un conteneur LXC ou sur un serveur Linux standard (ou avec `--in-container`) :

1. Installe **Docker Engine** & **Docker Compose** (via `get.docker.com`) et **Tailscale** si manquants.
2. Prépare `./config` (`chmod 700`) et initialise `config/config.yaml` (`chmod 600`), `.env` et `services.yaml` s’ils n’existent pas.
3. Construit et lance la stack (`docker compose up -d --build`).
4. Connecte `tailscale up` et active `tailscale serve --bg http://127.0.0.1:8000`.
5. Met à jour `server.public_url` dans `config/config.yaml` avec l’URL `https://<nom>.<tailnet>.ts.net` et affiche le lien d’appairage Apple `pvecenter://connect?...`.

#### Options CLI disponibles

```bash
./install.sh [OPTIONS]
  --in-container             Forcer le mode serveur Linux / LXC existant (Mode B)
  --ts-hostname <nom>        Nom d'hôte Tailscale souhaité
  --allowed-users <emails>   Email(s) Tailscale autorisés séparés par des virgules
  --pve-node <noeud>         Nom du nœud Proxmox VE par défaut
  -h, --help                 Afficher l'aide
```

---

## Option 2 — Docker Compose manuel

```bash
git clone https://github.com/PVE-Center/pve-panel.git pve-panel
cd pve-panel
mkdir -p config
cp config/config.example.yaml config/config.yaml
cp .env.example .env
cp services.example.yaml services.yaml
docker compose up -d --build
```

### Dockerfile multi-stage

Le [`Dockerfile`](https://github.com/PVE-Center/pve-panel/blob/main/Dockerfile) repose sur deux étapes :

1. **Stage 1 (`node:22-alpine`)** : exécute `npm ci` et `npm run build` sur le frontend React 19 + TypeScript + Vite 6 + Tailwind CSS vers `dist/`.
2. **Stage 2 (`python:3.12-slim`)** : installe `iputils-ping` (pour les sondes `icmp_ping`) et `ca-certificates`, installe `backend/requirements.txt`, copie `backend/app` et les fichiers statiques vers `/app/static`, puis lance Uvicorn sur le port `8000` avec `--no-proxy-headers`.

### Réseau Docker : `host` vs `bridge` + Avahi

Par défaut, `docker-compose.yml` active `network_mode: host` pour deux raisons essentielles :

1. **Bonjour / mDNS natif** : la diffusion multicast `224.0.0.251:5353` (`_pvecenter._tcp.local.`) et le scan LAN (`GET /api/discovery/lan`) fonctionnent directement sur l’interface réseau de l’hôte.
2. **Vérification loopback exacte (`DualAuth`)** : avec `--no-proxy-headers`, les requêtes HTTPS issues de `tailscale serve` arrivent strictement depuis `127.0.0.1` / `::1` avec l’en-tête `Tailscale-User-Login`, tandis que le trafic LAN exige un jeton Bearer ou JWT.

Pour utiliser le mode `bridge` avec le pont D-Bus/Avahi de l’hôte :

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

::: warning Mode `bridge` et Tailscale Serve
En mode `bridge`, le trafic `tailscale serve` arrive depuis la passerelle Docker (ex. `172.17.0.1`) et non depuis `127.0.0.1`. Par sécurité, `TailscaleSSOMiddleware` n’accepte `Tailscale-User-Login` que depuis la boucle locale : utilisez un **jeton Bearer API** ou le **PIN administrateur** (`POST /api/auth/login`) en mode `bridge`.
:::

---

## Configuration de Tailscale Serve SSO

Pour exposer PVE Command Center en HTTPS sur votre Tailnet avec certificats automatiques et authentification par identité Tailscale :

```bash
tailscale up --advertise-tags=tag:panel --hostname=pve-panel
tailscale serve --bg http://127.0.0.1:8000
```

Exemple d’ACL Tailscale recommandée :

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

Vérifiez que `security.tailscale_sso_enabled: true` et que `security.allowed_tailscale_users` liste votre ou vos adresses Tailscale dans `config/config.yaml`.

---

## Découverte Bonjour / mDNS (`_pvecenter._tcp`)

Lorsque `server.mdns_enabled: true` (valeur par défaut), `MDNSPublisher` utilise `AsyncZeroconf` pour publier le service `_pvecenter._tcp.local.` sur l’adresse IPv4 LAN principale (`listen_port`, par défaut `8000`) avec les propriétés TXT suivantes :

| Clé TXT | Contenu |
|---|---|
| `id` | UUID `server.id` |
| `name` | `server.name` |
| `version` | Version du serveur (`1.0.0`) |
| `port` | `server.listen_port` |
| `https` | `"true"` si `server.public_url` commence par `https://`, sinon `"false"` |
| `public_url` | `server.public_url` (tronqué à 200 caractères) |

Le endpoint `GET /api/discovery/lan` effectue également un scan asynchrone borné (`_pvecenter._tcp.local.`, `_http._tcp.local.`, `_ssh._tcp.local.`, `_smb._tcp.local.`) pour détecter et ajouter en un clic les services de votre réseau local.

---

## Développement local (`DEV_AUTH_BYPASS`)

```bash
# 1. Compiler le frontend React / Vite
cd frontend && npm ci && npm run build && cd ..

# 2. Démarrer le backend FastAPI Python 3.12
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
DEV_AUTH_BYPASS=true uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000
```

::: danger Ne jamais activer `DEV_AUTH_BYPASS` en production
`security.dev_auth_bypass: true` (ou `DEV_AUTH_BYPASS=true`) court-circuite l’authentification pour les requêtes locales (`127.0.0.1` / `::1`). Laissez toujours ce paramètre à `false` en production.
:::
