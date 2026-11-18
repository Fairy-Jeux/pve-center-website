<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    lang?: 'en' | 'fr'
  }>(),
  {
    lang: 'en',
  }
)

const brands = [
  { id: 'jellyfin', label: 'Jellyfin', color: '#aa5cc3' },
  { id: 'plex', label: 'Plex', color: '#e5a00d' },
  { id: 'jellyseerr', label: 'Jellyseerr', color: '#6366f1' },
  { id: 'radarr', label: 'Radarr', color: '#f59e0b' },
  { id: 'sonarr', label: 'Sonarr', color: '#0ea5e9' },
  { id: 'prowlarr', label: 'Prowlarr', color: '#f97316' },
  { id: 'qbittorrent', label: 'qBittorrent', color: '#2563eb' },
  { id: 'nextcloud', label: 'Nextcloud', color: '#0082c9' },
  { id: 'vaultwarden', label: 'Vaultwarden', color: '#175ddc' },
  { id: 'pelican', label: 'Pelican', color: '#10b981' },
  { id: 'proxmox', label: 'Proxmox VE', color: '#e57000' },
  { id: 'zoraxy', label: 'Zoraxy', color: '#14b8a6' },
  { id: 'npm', label: 'Nginx Proxy Manager', color: '#f15a24' },
  { id: 'uptime-kuma', label: 'Uptime Kuma', color: '#10b981' },
  { id: 'homepage', label: 'Homepage', color: '#6366f1' },
  { id: 'freebox', label: 'Freebox OS', color: '#e11d48' },
  { id: 'adguard', label: 'AdGuard Home', color: '#67b279' },
  { id: 'pihole', label: 'Pi-hole', color: '#ef4444' },
  { id: 'home-assistant', label: 'Home Assistant', color: '#18bcf2' },
  { id: 'grafana', label: 'Grafana', color: '#f46800' },
  { id: 'tailscale', label: 'Tailscale', color: '#38bdf8' },
  { id: 'cloudflare', label: 'Cloudflare', color: '#f38020' },
  { id: 'docker', label: 'Docker', color: '#2496ed' },
  { id: 'portainer', label: 'Portainer', color: '#13bef9' },
  { id: 'immich', label: 'Immich', color: '#f43f5e' },
  { id: 'traefik', label: 'Traefik', color: '#24a1c1' },
  { id: 'authentik', label: 'Authentik', color: '#fd4b2d' },
  { id: 'gitea', label: 'Gitea / Forgejo', color: '#609926' },
]
</script>

<template>
  <div class="glass-card" style="margin-top: 1.25rem;">
    <div style="text-align: center;">
      <p style="margin: 0 0 0.35rem; font-weight: 700;">
        {{
          props.lang === 'fr'
            ? 'Catalogue intégré de 28 icônes Homelab vectorielles + 20 symboles génériques'
            : 'Built-in Catalog of 28 Vector Homelab Brand Icons + 20 Generic Symbols'
        }}
      </p>
      <p style="margin: 0; font-size: 0.88rem; color: var(--vp-c-text-2);">
        {{
          props.lang === 'fr'
            ? 'Correspondance automatique par ID/nom ou sélection directe dans la PWA Web (lucide:*) et l’app Apple (sf:*).'
            : 'Automatic matching by service ID/name or direct selection across the Web PWA (lucide:*) and native Apple apps (sf:*).'
        }}
      </p>
    </div>

    <div class="brand-catalog-grid">
      <span v-for="b in brands" :key="b.id" class="brand-pill">
        <span class="brand-dot" :style="{ backgroundColor: b.color }" />
        <span>{{ b.label }}</span>
      </span>
    </div>
  </div>
</template>
