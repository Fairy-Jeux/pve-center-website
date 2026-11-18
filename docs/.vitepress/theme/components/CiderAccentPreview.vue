<script setup lang="ts">
import { onMounted, ref } from 'vue'

interface AccentPreset {
  id: string
  label: string
  labelFr: string
  hex: string
  secondaryHex: string
  rgb: string
  secondaryRgb: string
}

const props = withDefaults(
  defineProps<{
    lang?: 'en' | 'fr'
  }>(),
  {
    lang: 'en',
  }
)

const presets: AccentPreset[] = [
  {
    id: 'cyan',
    label: 'Cyan PVE',
    labelFr: 'Cyan PVE',
    hex: '#06b6d4',
    secondaryHex: '#6366f1',
    rgb: '6 182 212',
    secondaryRgb: '99 102 241',
  },
  {
    id: 'cider',
    label: 'Cider Ruby',
    labelFr: 'Cider Ruby',
    hex: '#fa233b',
    secondaryHex: '#ec4899',
    rgb: '250 35 59',
    secondaryRgb: '236 72 153',
  },
  {
    id: 'indigo',
    label: 'Indigo Studio',
    labelFr: 'Indigo Studio',
    hex: '#6366f1',
    secondaryHex: '#38bdf8',
    rgb: '99 102 241',
    secondaryRgb: '56 189 248',
  },
  {
    id: 'emerald',
    label: 'Emerald',
    labelFr: 'Émeraude',
    hex: '#10b981',
    secondaryHex: '#06b6d4',
    rgb: '16 185 129',
    secondaryRgb: '6 182 212',
  },
  {
    id: 'amber',
    label: 'Proxmox Amber',
    labelFr: 'Ambre Proxmox',
    hex: '#f59e0b',
    secondaryHex: '#ef4444',
    rgb: '245 158 11',
    secondaryRgb: '239 68 68',
  },
  {
    id: 'purple',
    label: 'Amethyst',
    labelFr: 'Améthyste',
    hex: '#a855f7',
    secondaryHex: '#ec4899',
    rgb: '168 85 247',
    secondaryRgb: '236 72 153',
  },
]

const activeId = ref<string>('cyan')

function applyPreset(preset: AccentPreset) {
  activeId.value = preset.id
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.style.setProperty('--accent-rgb', preset.rgb)
  root.style.setProperty('--accent-2-rgb', preset.secondaryRgb)
  root.style.setProperty('--accent-hex', preset.hex)
  root.style.setProperty('--accent-2-hex', preset.secondaryHex)
  try {
    window.localStorage.setItem('pve_docs_accent', preset.id)
  } catch {
    // Ignore storage errors in restricted environments
  }
}

onMounted(() => {
  try {
    const saved = window.localStorage.getItem('pve_docs_accent')
    const match = presets.find((p) => p.id === saved)
    if (match) applyPreset(match)
  } catch {
    // Ignore storage errors
  }
})
</script>

<template>
  <div class="glass-card" style="text-align: center;">
    <p style="margin: 0 0 0.4rem; font-weight: 700;">
      {{
        props.lang === 'fr'
          ? 'Aperçu en direct des 6 thèmes Cider & Liquid Glass'
          : 'Live Preview — 6 Cider & Liquid Glass Accent Themes'
      }}
    </p>
    <p style="margin: 0; font-size: 0.88rem; color: var(--vp-c-text-2);">
      {{
        props.lang === 'fr'
          ? 'Cliquez sur une palette pour teinter instantanément ce portail (identique au Web PWA et à l’app Apple native).'
          : 'Click any preset to tint this portal live — matching the Web PWA and native Apple SwiftUI apps.'
      }}
    </p>

    <div class="accent-bar">
      <button
        v-for="preset in presets"
        :key="preset.id"
        type="button"
        class="accent-chip"
        :class="{ active: activeId === preset.id }"
        :style="{ '--chip-hex': preset.hex }"
        @click="applyPreset(preset)"
      >
        <span
          class="accent-swatch"
          :style="{
            background: `linear-gradient(135deg, ${preset.hex}, ${preset.secondaryHex})`,
          }"
        />
        <span>{{ props.lang === 'fr' ? preset.labelFr : preset.label }}</span>
      </button>
    </div>

    <p style="margin: 0; font-size: 0.8rem; color: var(--vp-c-text-2);">
      {{
        props.lang === 'fr'
          ? 'Intensités de verre : Balanced · Cider (blur 38px) · Subtle  —  Densité : Confortable · Compact  —  Schéma : Système / Clair / Sombre'
          : 'Glass Intensities: Balanced · Cider (38px blur) · Subtle  —  Density: Comfortable · Compact  —  Scheme: System / Light / Dark'
      }}
    </p>
  </div>
</template>
