---
layout: home

hero:
  name: PVE Command Center
  text: Cockpit Proxmox VE & Homelab Temps Réel
  tagline: Serveur FastAPI déclaratif, Web PWA Liquid Glass React 19, apps Apple natives Swift 6 (iOS, macOS, tvOS) et clients Windows, Linux & Android.
  image:
    src: /icon-512.png
    alt: Logo PVE Command Center
  actions:
    - theme: brand
      text: Téléchargements
      link: /fr/#telechargements
    - theme: alt
      text: Bien démarrer
      link: /fr/guide/getting-started
    - theme: alt
      text: Référence Config & API
      link: /fr/reference/configuration

features:
  - icon: 🖥️
    title: Proxmox VE & Stockage SMART
    details: Supervision CPU/RAM/rootfs, contrôle LXC & VM QEMU avec garde-fou panel_self_vmid, pools MergerFS et santé disques SMART (/host_mnt:ro).
  - icon: ⚙️
    title: config.yaml Déclaratif + Hot-Reload
    details: Source unique YAML avec interpolation ${VAR_NAME}, préservation des modèles, écriture atomique, watchfiles et repli automatique .env + services.yaml.
  - icon: 📡
    title: LAN Zéro-Config, QR & Appairage Apple TV
    details: Annonce Bonjour _pvecenter._tcp.local., scan mDNS LAN, QR Code pvecenter:// et transfert chiffré vers Apple TV par PIN à 6 chiffres (CryptoKit P-256 ECDH + AES-256-GCM).
  - icon: 🔔
    title: AlertEngine SQLite & Push Multi-Canaux
    details: 5 protocoles (http_rest, tcp_port, icmp_ping, json_metrics, webhook_ingest), historique SQLite WAL, debounce/cooldown, Mute 1h, APNs (.p8), Discord, Telegram et ntfy/Gotify.
  - icon: 🛡️
    title: Modèle de Sécurité DualAuth ASGI
    details: Vérification loopback Tailscale Serve SSO combinée aux jetons Bearer SHA-256 en temps constant, JWT HMAC-HS256 et connexion par PIN administrateur protégée anti brute-force.
  - icon: ✨
    title: Design Liquid Glass & Cider Studio
    details: Thèmes Système, Clair et Obsidian Sombre avec 6 accents Cider, 28 icônes Homelab vectorielles, graphiques Swift Charts et Mode Démo interactif intégré.
---

<section id="telechargements" class="pve-section">
  <div class="pve-section-header">
    <span class="pve-eyebrow">Hub de Téléchargement Multi-Plateformes</span>
    <h2 class="pve-section-title">PVE Center sur Chaque Écran</h2>
    <p class="pve-section-subtitle">
      Déployez le serveur sur Proxmox VE ou Docker, puis connectez-vous depuis iPhone, iPad, Mac, Apple TV 4K, Windows, Linux, Android ou votre navigateur.
    </p>
  </div>

  <DownloadHub lang="fr" />
</section>

<section class="pve-section">
  <div class="pve-section-header">
    <span class="pve-eyebrow">Cider Studio &amp; Identité Visuelle</span>
    <h2 class="pve-section-title">Thèmes d’Accentuation Cider &amp; Catalogue d’Icônes Homelab</h2>
    <p class="pve-section-subtitle">
      Des tokens de design partagés entre Tailwind React 19 et SwiftUI <code>DesignTokens</code>, associés à la reconnaissance automatique de 28 services auto-hébergés.
    </p>
  </div>

  <CiderAccentPreview lang="fr" />
  <BrandCatalog lang="fr" />
</section>

<section class="pve-section">
  <div class="pve-section-header">
    <span class="pve-eyebrow">Galerie de Captures</span>
    <h2 class="pve-section-title">Swift 6 Natif &amp; Liquid Glass en Action</h2>
    <p class="pve-section-subtitle">
      Captures réelles de l’application Apple unifiée en Mode Clair, Mode Sombre Obsidian, Onboarding en 4 étapes et Apple TV 4K (tvOS 27).
    </p>
  </div>

  <ScreenshotGallery lang="fr" />
</section>

<section class="pve-section">
  <div class="pve-section-header">
    <span class="pve-eyebrow">Écosystème Open-Source en 4 Dépôts</span>
    <h2 class="pve-section-title">Architecture Modulaire PVE-Center</h2>
    <p class="pve-section-subtitle">
      Quatre dépôts distincts sous licence MIT pour garder les conteneurs serveur légers tout en offrant des clients natifs dédiés pour Apple, Desktop et Android.
    </p>
  </div>

  <EcosystemGrid lang="fr" />
</section>

<section class="pve-section" style="margin-bottom: 4rem;">
  <div class="glass-card">
    <div style="margin-bottom: 1rem;">
      <span class="pve-eyebrow" style="margin-bottom: 0.35rem;">Déploiement en 60 Secondes</span>
      <h3 style="margin: 0 0 0.35rem; font-size: 1.25rem; font-weight: 700;">Installateur Automatisé Proxmox VE LXC &amp; Docker</h3>
    </div>

```bash
git clone https://github.com/PVE-Center/pve-panel.git pve-panel
cd pve-panel
chmod +x install.sh
sudo ./install.sh
```

[Lire le guide complet d’installation →](/fr/guide/installation)

  </div>
</section>
