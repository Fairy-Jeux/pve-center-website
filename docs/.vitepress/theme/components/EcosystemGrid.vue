<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    lang?: 'en' | 'fr'
  }>(),
  {
    lang: 'en',
  }
)

const repos = [
  {
    name: 'PVE-Center/pve-panel',
    roleEn: 'Core Server & Embedded Web UI',
    roleFr: 'Serveur Principal & UI Web Embarquée',
    stack: 'FastAPI · Python 3.12 · SQLite WAL · React 19 · Docker',
    descEn:
      'Declarative config.yaml + watchfiles hot-reload, DualAuth ASGI security, AlertEngine, mDNS publisher, pairing relay, and install.sh for Proxmox VE LXC.',
    descFr:
      'Configuration déclarative config.yaml + hot-reload watchfiles, sécurité DualAuth ASGI, AlertEngine, mDNS, relais d’appairage et install.sh Proxmox VE LXC.',
    url: 'https://github.com/PVE-Center/pve-panel',
  },
  {
    name: 'PVE-Center/pve-center-apple',
    roleEn: 'Native Apple Multi-Platform Apps',
    roleFr: 'Applications Apple Natives Multi-Plateformes',
    stack: 'Swift 6 · SwiftUI · SwiftData · Keychain · CryptoKit',
    descEn:
      'Unified Xcode 27 / SwiftPM project for iPhone, iPad, macOS (MenuBarExtra), and Apple TV (tvOS 27.0) with P-256 ECDH PIN pairing and Demo Mode.',
    descFr:
      'Projet unifié Xcode 27 / SwiftPM pour iPhone, iPad, macOS (MenuBarExtra) et Apple TV (tvOS 27.0) avec appairage PIN P-256 ECDH et Mode Démo.',
    url: 'https://github.com/PVE-Center/pve-center-apple',
  },
  {
    name: 'PVE-Center/pve-center-clients',
    roleEn: 'Windows, Linux & Android Clients',
    roleFr: 'Clients Windows, Linux & Android',
    stack: 'Tauri v2 · Rust · Capacitor 8 · React 19 · Tailwind',
    descEn:
      'Desktop installers (.msi/.exe for Windows, .AppImage/.deb for Linux) with System Tray, plus Android .apk with LAN cleartext and Tailscale HTTPS support.',
    descFr:
      'Installeurs desktop (.msi/.exe Windows, .AppImage/.deb Linux) avec System Tray, et .apk Android compatible LAN HTTP local et HTTPS Tailscale.',
    url: 'https://github.com/PVE-Center/pve-center-clients',
  },
  {
    name: 'PVE-Center/pve-center-website',
    roleEn: 'Showcase & Bilingual Docs Portal',
    roleFr: 'Vitrine & Portail de Documentation Bilingue',
    stack: 'VitePress · Vue 3 · Liquid Glass CSS · GitHub Pages',
    descEn:
      'Official EN/FR documentation, API & config.yaml reference, per-platform download hub, and interactive Cider accent theme preview.',
    descFr:
      'Documentation officielle EN/FR, référence API & config.yaml, hub de téléchargement multi-plateformes et aperçu interactif des thèmes Cider.',
    url: 'https://github.com/PVE-Center/pve-center-website',
  },
]
</script>

<template>
  <div class="ecosystem-grid">
    <article v-for="repo in repos" :key="repo.name" class="glass-card ecosystem-card">
      <div class="ecosystem-repo">{{ repo.name }}</div>
      <div class="platform-name" style="font-size: 0.98rem;">
        {{ props.lang === 'fr' ? repo.roleFr : repo.roleEn }}
      </div>
      <div class="format-badges">
        <span class="format-badge">{{ repo.stack }}</span>
      </div>
      <p class="platform-desc">
        {{ props.lang === 'fr' ? repo.descFr : repo.descEn }}
      </p>
      <div class="platform-actions" style="margin-top: auto; padding-top: 0.4rem;">
        <a
          class="download-btn secondary"
          :href="repo.url"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ props.lang === 'fr' ? 'Voir sur GitHub →' : 'View on GitHub →' }}
        </a>
      </div>
    </article>
  </div>
</template>
