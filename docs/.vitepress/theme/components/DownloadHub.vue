<script setup lang="ts">
import { withBase } from 'vitepress'

const props = withDefaults(
  defineProps<{
    lang?: 'en' | 'fr'
  }>(),
  {
    lang: 'en',
  }
)

interface PlatformItem {
  id: string
  badge: string
  name: string
  tech: string
  formats: string[]
  descEn: string
  descFr: string
  primaryLabelEn: string
  primaryLabelFr: string
  primaryHref: string
  secondaryLabelEn: string
  secondaryLabelFr: string
  secondaryPath: string
}

const platforms: PlatformItem[] = [
  {
    id: 'macos',
    badge: 'MAC',
    name: 'macOS',
    tech: 'Swift 6 · SwiftUI · MenuBarExtra',
    formats: ['.app', '.dmg'],
    descEn:
      'Native macOS Universal app with MenuBar live CPU/RAM/qBittorrent popover, keyboard shortcuts (⌘R, ⌘1–6), and Keychain storage.',
    descFr:
      'Application macOS native avec popover MenuBarExtra (CPU/RAM/qBittorrent), raccourcis clavier (⌘R, ⌘1–6) et trousseau Keychain.',
    primaryLabelEn: 'Download macOS',
    primaryLabelFr: 'Télécharger macOS',
    primaryHref: 'https://github.com/PVE-Center/pve-center-apple/releases',
    secondaryLabelEn: 'Build Guide',
    secondaryLabelFr: 'Guide de build',
    secondaryPath: '/guide/clients#apple-native',
  },
  {
    id: 'ios',
    badge: 'iOS',
    name: 'iOS & iPadOS',
    tech: 'Swift 6 · SwiftData · CryptoKit',
    formats: ['.ipa', 'TestFlight', 'AltStore'],
    descEn:
      'Native iPhone & iPad companion with Bonjour mDNS discovery, pvecenter:// QR scanner, interactive notifications, and Demo Mode.',
    descFr:
      'Compagnon natif iPhone & iPad avec découverte Bonjour mDNS, scanner QR pvecenter://, notifications interactives et Mode Démo.',
    primaryLabelEn: 'Get iOS / iPadOS',
    primaryLabelFr: 'Obtenir iOS / iPadOS',
    primaryHref: 'https://github.com/PVE-Center/pve-center-apple/releases',
    secondaryLabelEn: 'Xcode & Sideloading',
    secondaryLabelFr: 'Xcode & Sideloading',
    secondaryPath: '/guide/clients#apple-native',
  },
  {
    id: 'tvos',
    badge: 'tvOS',
    name: 'Apple TV (tvOS)',
    tech: 'tvOS 27.0 · Focus Engine · 10-foot UI',
    formats: ['tvOS App', 'PIN Pairing'],
    descEn:
      'Living-room dashboard with custom dark glass focus cards, live WebSocket alert banners, and encrypted 6-digit PIN pairing from iPhone.',
    descFr:
      'Tableau de bord salon avec cartes Focus Engine haute lisibilité, bannières d’alertes WebSocket et appairage chiffré par PIN depuis iPhone.',
    primaryLabelEn: 'Get Apple TV',
    primaryLabelFr: 'Obtenir Apple TV',
    primaryHref: 'https://github.com/PVE-Center/pve-center-apple/releases',
    secondaryLabelEn: 'Pairing Guide',
    secondaryLabelFr: 'Guide appairage',
    secondaryPath: '/guide/clients#apple-tv',
  },
  {
    id: 'windows',
    badge: 'WIN',
    name: 'Windows',
    tech: 'Tauri v2 · Rust · React 19',
    formats: ['.msi', '.exe'],
    descEn:
      'Lightweight native desktop client powered by Tauri v2 with Windows System Tray show/hide toggle and remote PVE server profile switching.',
    descFr:
      'Client bureau léger propulsé par Tauri v2 avec icône de zone de notification Windows (System Tray) et profils serveurs distants.',
    primaryLabelEn: 'Download Windows',
    primaryLabelFr: 'Télécharger Windows',
    primaryHref: 'https://github.com/PVE-Center/pve-center-clients/releases',
    secondaryLabelEn: 'Desktop Docs',
    secondaryLabelFr: 'Doc Desktop',
    secondaryPath: '/guide/clients#desktop-tauri',
  },
  {
    id: 'linux',
    badge: 'LNX',
    name: 'Linux Desktop',
    tech: 'Tauri v2 · WebKitGTK · System Tray',
    formats: ['.AppImage', '.deb'],
    descEn:
      'Cross-distro desktop application for Linux workstations supporting LAN IP connections and Tailscale HTTPS Serve endpoints.',
    descFr:
      'Application bureau Linux multi-distributions avec System Tray natif, compatible IP LAN directe et endpoints HTTPS Tailscale Serve.',
    primaryLabelEn: 'Download Linux',
    primaryLabelFr: 'Télécharger Linux',
    primaryHref: 'https://github.com/PVE-Center/pve-center-clients/releases',
    secondaryLabelEn: 'Build AppImage / DEB',
    secondaryLabelFr: 'Compiler AppImage / DEB',
    secondaryPath: '/guide/clients#desktop-tauri',
  },
  {
    id: 'android',
    badge: 'AND',
    name: 'Android',
    tech: 'Capacitor 8 · React 19 PWA',
    formats: ['.apk', 'Gradle'],
    descEn:
      'Native Android wrapper with Capacitor HTTP, LAN cleartext support for local Proxmox subnets, and full Liquid Glass responsive touch UI.',
    descFr:
      'Application Android Capacitor 8 avec CapacitorHttp, trafic LAN HTTP local autorisé et interface tactile Liquid Glass complète.',
    primaryLabelEn: 'Download APK',
    primaryLabelFr: 'Télécharger APK',
    primaryHref: 'https://github.com/PVE-Center/pve-center-clients/releases',
    secondaryLabelEn: 'Android Guide',
    secondaryLabelFr: 'Guide Android',
    secondaryPath: '/guide/clients#android-capacitor',
  },
  {
    id: 'server',
    badge: 'PVE',
    name: 'Proxmox LXC / Docker',
    tech: 'FastAPI · Python 3.12 · SQLite WAL',
    formats: ['install.sh', 'Docker Compose'],
    descEn:
      'Core control plane serving REST, WebSocket/SSE telemetry, Bonjour mDNS, AlertEngine, and the embedded React 19 Web PWA.',
    descFr:
      'Cœur serveur servant l’API REST, WebSocket/SSE, Bonjour mDNS, AlertEngine et l’interface Web PWA React 19 embarquée.',
    primaryLabelEn: 'Server Repo',
    primaryLabelFr: 'Dépôt Serveur',
    primaryHref: 'https://github.com/PVE-Center/pve-panel',
    secondaryLabelEn: 'Install Guide',
    secondaryLabelFr: 'Guide d’installation',
    secondaryPath: '/guide/installation',
  },
]

function docHref(path: string): string {
  const prefixed = props.lang === 'fr' ? `/fr${path}` : path
  return withBase(prefixed)
}
</script>

<template>
  <div class="platform-grid">
    <article v-for="item in platforms" :key="item.id" class="glass-card platform-card">
      <div>
        <div class="platform-card-head">
          <div class="platform-title-wrap">
            <span class="platform-icon-pill">{{ item.badge }}</span>
            <div>
              <div class="platform-name">{{ item.name }}</div>
              <div class="platform-tech">{{ item.tech }}</div>
            </div>
          </div>
        </div>

        <div class="format-badges" style="margin: 0.75rem 0;">
          <span v-for="fmt in item.formats" :key="fmt" class="format-badge">{{ fmt }}</span>
        </div>

        <p class="platform-desc">
          {{ props.lang === 'fr' ? item.descFr : item.descEn }}
        </p>
      </div>

      <div class="platform-actions">
        <a
          class="download-btn primary"
          :href="item.primaryHref"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ props.lang === 'fr' ? item.primaryLabelFr : item.primaryLabelEn }}
        </a>
        <a class="download-btn secondary" :href="docHref(item.secondaryPath)">
          {{ props.lang === 'fr' ? item.secondaryLabelFr : item.secondaryLabelEn }}
        </a>
      </div>
    </article>
  </div>
</template>
