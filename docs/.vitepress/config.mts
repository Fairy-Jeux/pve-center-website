import { defineConfig } from 'vitepress'

const REPOS = {
  server: 'https://github.com/PVE-Center/pve-panel',
  apple: 'https://github.com/PVE-Center/pve-center-apple',
  clients: 'https://github.com/PVE-Center/pve-center-clients',
  website: 'https://github.com/PVE-Center/pve-center-website',
}

const serverSvg =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="6" rx="2"/><rect x="3" y="14" width="18" height="6" rx="2"/><circle cx="7" cy="7" r="1" fill="currentColor"/><circle cx="7" cy="17" r="1" fill="currentColor"/></svg>'

const appleSvg =
  '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.05.28.05.43zm4.565 15.71c-.03.07-.463 1.58-1.518 3.12-.945 1.34-1.94 2.71-3.43 2.71-1.517 0-1.9-.88-3.63-.88-1.698 0-2.302.91-3.67.91-1.377 0-2.332-1.26-3.428-2.8-1.287-1.82-2.323-4.63-2.323-7.28 0-4.28 2.797-6.55 5.552-6.55 1.448 0 2.675.95 3.6.95.865 0 2.222-1.01 3.902-1.01.613 0 2.886.06 4.374 2.19-.13.09-2.383 1.37-2.383 4.19 0 3.26 2.854 4.42 2.955 4.45z"/></svg>'

const desktopSvg =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="14" height="11" rx="2"/><path d="M6 19h6M9 15v4"/><rect x="17" y="9" width="5" height="10" rx="1.2"/></svg>'

export default defineConfig({
  base: '/pve-center-website/',
  title: 'PVE Command Center',
  description:
    'Real-time cockpit for Proxmox VE, SMART/MergerFS storage, homelab services, and multi-channel alerting.',
  appearance: 'dark',
  lastUpdated: true,
  cleanUrls: true,

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/pve-center-website/icon.svg' }],
    ['link', { rel: 'apple-touch-icon', href: '/pve-center-website/apple-touch-icon.png' }],
    ['meta', { name: 'theme-color', content: '#030816' }],
    ['meta', { property: 'og:title', content: 'PVE Command Center' }],
    [
      'meta',
      {
        property: 'og:description',
        content:
          'FastAPI declarative server, React 19 Liquid Glass PWA, native Apple Swift 6 apps, and Windows/Linux/Android clients.',
      },
    ],
  ],

  themeConfig: {
    logo: '/icon-192.png',
    siteTitle: 'PVE Center',

    search: {
      provider: 'local',
      options: {
        locales: {
          fr: {
            translations: {
              button: {
                buttonText: 'Rechercher',
                buttonAriaLabel: 'Rechercher dans la documentation',
              },
              modal: {
                noResultsText: 'Aucun résultat pour',
                resetButtonTitle: 'Effacer la recherche',
                footer: {
                  selectText: 'sélectionner',
                  navigateText: 'naviguer',
                  closeText: 'fermer',
                },
              },
            },
          },
        },
      },
    },

    socialLinks: [
      {
        icon: { svg: serverSvg },
        link: REPOS.server,
        ariaLabel: 'GitHub — pve-panel (FastAPI Server & Web PWA)',
      },
      {
        icon: { svg: appleSvg },
        link: REPOS.apple,
        ariaLabel: 'GitHub — pve-center-apple (iOS, iPadOS, macOS & tvOS)',
      },
      {
        icon: { svg: desktopSvg },
        link: REPOS.clients,
        ariaLabel: 'GitHub — pve-center-clients (Windows, Linux & Android)',
      },
      {
        icon: 'github',
        link: REPOS.website,
        ariaLabel: 'GitHub — pve-center-website (Docs & Portal)',
      },
    ],
  },

  locales: {
    root: {
      label: 'English',
      lang: 'en-US',
      themeConfig: {
        nav: [
          { text: 'Downloads', link: '/#downloads' },
          { text: 'Getting Started', link: '/guide/getting-started' },
          { text: 'Installation', link: '/guide/installation' },
          { text: 'Architecture', link: '/guide/architecture' },
          {
            text: 'Reference',
            items: [
              { text: 'Configuration (YAML & Env)', link: '/reference/configuration' },
              { text: 'REST, WS & SSE API', link: '/reference/api' },
              { text: 'Clients & Build Guides', link: '/guide/clients' },
            ],
          },
          {
            text: 'Ecosystem',
            items: [
              { text: 'pve-panel (Server + Web)', link: REPOS.server },
              { text: 'pve-center-apple (Apple Native)', link: REPOS.apple },
              { text: 'pve-center-clients (Win/Linux/Android)', link: REPOS.clients },
              { text: 'pve-center-website (Portal)', link: REPOS.website },
            ],
          },
        ],
        sidebar: [
          {
            text: 'Guide',
            items: [
              { text: 'Getting Started', link: '/guide/getting-started' },
              { text: 'Installation & Deployment', link: '/guide/installation' },
              { text: 'Architecture & Security', link: '/guide/architecture' },
              { text: 'Multi-Platform Clients', link: '/guide/clients' },
            ],
          },
          {
            text: 'Reference',
            items: [
              { text: 'Configuration & Connectors', link: '/reference/configuration' },
              { text: 'API Reference (REST / WS / SSE)', link: '/reference/api' },
            ],
          },
        ],
        editLink: {
          pattern: `${REPOS.website}/edit/main/docs/:path`,
          text: 'Edit this page on GitHub',
        },
        docFooter: {
          prev: 'Previous page',
          next: 'Next page',
        },
        outline: {
          label: 'On this page',
          level: [2, 3],
        },
        footer: {
          message:
            'Released under the <a href="https://github.com/PVE-Center/pve-center-website/blob/main/LICENSE">MIT License</a>. Part of the PVE-Center ecosystem.',
          copyright: 'Copyright © 2026 PVE Command Center Contributors',
        },
      },
    },

    fr: {
      label: 'Français',
      lang: 'fr-FR',
      link: '/fr/',
      title: 'PVE Command Center',
      description:
        'Cockpit temps réel pour Proxmox VE, stockage SMART/MergerFS, services homelab et alertes multi-canaux.',
      themeConfig: {
        nav: [
          { text: 'Téléchargements', link: '/fr/#telechargements' },
          { text: 'Démarrage', link: '/fr/guide/getting-started' },
          { text: 'Installation', link: '/fr/guide/installation' },
          { text: 'Architecture', link: '/fr/guide/architecture' },
          {
            text: 'Référence',
            items: [
              { text: 'Configuration (YAML & Env)', link: '/fr/reference/configuration' },
              { text: 'API REST, WS & SSE', link: '/fr/reference/api' },
              { text: 'Clients & Compilation', link: '/fr/guide/clients' },
            ],
          },
          {
            text: 'Écosystème',
            items: [
              { text: 'pve-panel (Serveur + Web)', link: REPOS.server },
              { text: 'pve-center-apple (Apple Natif)', link: REPOS.apple },
              { text: 'pve-center-clients (Win/Linux/Android)', link: REPOS.clients },
              { text: 'pve-center-website (Portail)', link: REPOS.website },
            ],
          },
        ],
        sidebar: [
          {
            text: 'Guides',
            items: [
              { text: 'Bien démarrer', link: '/fr/guide/getting-started' },
              { text: 'Installation & Déploiement', link: '/fr/guide/installation' },
              { text: 'Architecture & Sécurité', link: '/fr/guide/architecture' },
              { text: 'Clients Multi-Plateformes', link: '/fr/guide/clients' },
            ],
          },
          {
            text: 'Référence Technique',
            items: [
              { text: 'Configuration & Connecteurs', link: '/fr/reference/configuration' },
              { text: 'Référence API (REST / WS / SSE)', link: '/fr/reference/api' },
            ],
          },
        ],
        editLink: {
          pattern: `${REPOS.website}/edit/main/docs/:path`,
          text: 'Modifier cette page sur GitHub',
        },
        docFooter: {
          prev: 'Page précédente',
          next: 'Page suivante',
        },
        outline: {
          label: 'Sur cette page',
          level: [2, 3],
        },
        lastUpdated: {
          text: 'Mis à jour le',
        },
        darkModeSwitchLabel: 'Apparence',
        lightModeSwitchTitle: 'Passer au thème clair',
        darkModeSwitchTitle: 'Passer au thème sombre',
        sidebarMenuLabel: 'Menu',
        returnToTopLabel: 'Haut de page',
        langMenuLabel: 'Langue',
        footer: {
          message:
            'Distribué sous <a href="https://github.com/PVE-Center/pve-center-website/blob/main/LICENSE">licence MIT</a>. Écosystème open-source PVE-Center.',
          copyright: 'Copyright © 2026 PVE Command Center Contributors',
        },
      },
    },
  },
})
