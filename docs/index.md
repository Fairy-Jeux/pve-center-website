---
layout: home

hero:
  name: PVE Command Center
  text: Real-Time Proxmox VE & Homelab Cockpit
  tagline: Declarative FastAPI backend, Liquid Glass React 19 PWA, native Swift 6 Apple apps (iOS, macOS, tvOS), and Windows, Linux & Android clients.
  image:
    src: /icon-512.png
    alt: PVE Command Center Logo
  actions:
    - theme: brand
      text: Download Hub
      link: /#downloads
    - theme: alt
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: API & Config Reference
      link: /reference/configuration

features:
  - icon: 🖥️
    title: Proxmox VE & SMART Storage
    details: Monitor node CPU/RAM/rootfs, start/stop/reboot LXC & QEMU VMs with panel_self_vmid anti-self-shutdown guard, MergerFS pools, and SMART disk health (/host_mnt:ro).
  - icon: ⚙️
    title: Declarative config.yaml + Hot-Reload
    details: Single YAML source of truth with ${VAR_NAME} secret interpolation, template preservation, atomic saves, watchfiles hot-reload, and automatic .env + services.yaml fallback.
  - icon: 📡
    title: Zero-Config LAN, QR & Apple TV Pairing
    details: Publishes _pvecenter._tcp.local. via Bonjour mDNS, scans LAN services, generates pvecenter:// QR codes, and transfers server credentials to Apple TV via 6-digit PIN (CryptoKit P-256 ECDH + AES-256-GCM).
  - icon: 🔔
    title: Stateful AlertEngine & Multi-Channel Push
    details: 5 probe connectors (http_rest, tcp_port, icmp_ping, json_metrics, webhook_ingest), SQLite WAL incident timeline, debounce/cooldown, Mute 1h, APNs HTTP/2 (.p8), Discord, Telegram & ntfy/Gotify.
  - icon: 🛡️
    title: DualAuth ASGI Security
    details: Loopback Tailscale Serve SSO header verification combined with constant-time SHA-256 Bearer API tokens, HMAC-HS256 session JWTs, and rate-limited Admin PIN login.
  - icon: ✨
    title: Liquid Glass & Cider Studio UI
    details: Adaptive System, Light & Obsidian Dark modes with 6 Cider accent presets, 28 built-in Homelab vector brand icons, Swift Charts telemetry, and an in-memory interactive Demo Mode.
---

<section id="downloads" class="pve-section">
  <div class="pve-section-header">
    <span class="pve-eyebrow">Per-Platform Download Hub</span>
    <h2 class="pve-section-title">Run PVE Center on Every Screen</h2>
    <p class="pve-section-subtitle">
      Deploy the control plane on Proxmox VE or Docker, then connect from iPhone, iPad, Mac, Apple TV 4K, Windows, Linux, Android, or any browser.
    </p>
  </div>

  <DownloadHub lang="en" />
</section>

<section class="pve-section">
  <div class="pve-section-header">
    <span class="pve-eyebrow">Cider Studio &amp; Visual Identity</span>
    <h2 class="pve-section-title">Cider Accent Themes &amp; Homelab Icon Catalog</h2>
    <p class="pve-section-subtitle">
      Consistent design tokens shared across React 19 Tailwind CSS and SwiftUI <code>DesignTokens</code>, paired with automatic brand detection for 28 self-hosted apps.
    </p>
  </div>

  <CiderAccentPreview lang="en" />
  <BrandCatalog lang="en" />
</section>

<section class="pve-section">
  <div class="pve-section-header">
    <span class="pve-eyebrow">Screenshots Gallery</span>
    <h2 class="pve-section-title">Native Swift 6 &amp; Liquid Glass in Action</h2>
    <p class="pve-section-subtitle">
      Captured directly from the unified Apple build in Light Mode, Obsidian Dark Mode, 4-Step Onboarding, and Apple TV 4K (tvOS 27).
    </p>
  </div>

  <ScreenshotGallery lang="en" />
</section>

<section class="pve-section">
  <div class="pve-section-header">
    <span class="pve-eyebrow">4-Repository Open-Source Architecture</span>
    <h2 class="pve-section-title">The Fairy-Jeux PVE Center Ecosystem</h2>
    <p class="pve-section-subtitle">
      Cleanly separated repositories under the MIT License so server deployments stay lean while native Apple, desktop, and mobile clients evolve independently.
    </p>
  </div>

  <EcosystemGrid lang="en" />
</section>

<section class="pve-section" style="margin-bottom: 4rem;">
  <div class="glass-card">
    <div style="margin-bottom: 1rem;">
      <span class="pve-eyebrow" style="margin-bottom: 0.35rem;">60-Second Server Quickstart</span>
      <h3 style="margin: 0 0 0.35rem; font-size: 1.25rem; font-weight: 700;">Automated Proxmox VE LXC &amp; Docker Installer</h3>
    </div>

```bash
git clone https://github.com/Fairy-Jeux/pve-panel.git pve-panel
cd pve-panel
chmod +x install.sh
sudo ./install.sh
```

[Read the full installation guide →](/guide/installation)

  </div>
</section>
