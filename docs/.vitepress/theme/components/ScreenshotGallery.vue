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
</script>

<template>
  <div>
    <div class="screenshot-grid">
      <div class="glass-card screenshot-card">
        <img
          :src="withBase('/screenshots/iphone-onboarding.png')"
          :alt="
            props.lang === 'fr'
              ? 'Assistant Onboarding iPhone en 4 étapes'
              : 'iPhone 4-Step Onboarding Wizard'
          "
        />
        <div class="screenshot-caption">
          <strong>
            {{
              props.lang === 'fr'
                ? 'Onboarding 4 étapes (iOS)'
                : '4-Step Onboarding (iOS)'
            }}
          </strong>
          <span>
            {{
              props.lang === 'fr'
                ? 'Découverte Bonjour, QR Code pvecenter://, API Token & Mode Démo'
                : 'Bonjour Discovery, QR Code pvecenter://, API Token & Demo Mode'
            }}
          </span>
        </div>
      </div>

      <div class="glass-card screenshot-card">
        <img
          :src="withBase('/screenshots/iphone-demo-light.png')"
          :alt="
            props.lang === 'fr'
              ? 'Tableau de bord iPhone en mode clair Liquid Glass'
              : 'iPhone Dashboard in Light Liquid Glass Mode'
          "
        />
        <div class="screenshot-caption">
          <strong>
            {{
              props.lang === 'fr'
                ? 'Vue Poste — Mode Clair'
                : 'Cockpit Overview — Light Mode'
            }}
          </strong>
          <span>
            {{
              props.lang === 'fr'
                ? 'Liquid Glass lumineux, bannières d’attention & baie Proxmox'
                : 'Luminous Liquid Glass, attention banners & Proxmox rack matrix'
            }}
          </span>
        </div>
      </div>

      <div class="glass-card screenshot-card">
        <img
          :src="withBase('/screenshots/iphone-demo-dark.png')"
          :alt="
            props.lang === 'fr'
              ? 'Tableau de bord iPhone en mode sombre Obsidian'
              : 'iPhone Dashboard in Obsidian Dark Mode'
          "
        />
        <div class="screenshot-caption">
          <strong>
            {{
              props.lang === 'fr'
                ? 'Vue Poste — Mode Sombre'
                : 'Cockpit Overview — Dark Mode'
            }}
          </strong>
          <span>
            {{
              props.lang === 'fr'
                ? 'Thème Obsidian, états LXC/VM en direct & baies disques'
                : 'Obsidian theme, live LXC/VM badges & disk bay telemetry'
            }}
          </span>
        </div>
      </div>
    </div>

    <div class="glass-card screenshot-tv">
      <img
        :src="withBase('/screenshots/appletv-overview.png')"
        :alt="
          props.lang === 'fr'
            ? 'PVE Center sur Apple TV 4K (tvOS 27)'
            : 'PVE Center on Apple TV 4K (tvOS 27)'
        "
      />
      <div class="screenshot-caption" style="margin-top: 0.9rem;">
        <strong>
          {{
            props.lang === 'fr'
              ? 'Apple TV 4K (tvOS 27) — Expérience 10-foot UI native'
              : 'Apple TV 4K (tvOS 27) — Native 10-Foot UI Experience'
          }}
        </strong>
        <span>
          {{
            props.lang === 'fr'
              ? 'Focus Engine sombre haute lisibilité, alertes temps réel WebSocket et appairage PIN chiffré P-256 ECDH depuis l’iPhone.'
              : 'High-contrast dark glass Focus Engine, live WebSocket alert banners, and P-256 ECDH encrypted PIN pairing from iPhone.'
          }}
        </span>
      </div>
    </div>
  </div>
</template>
