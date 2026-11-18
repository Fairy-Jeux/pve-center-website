import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import CiderAccentPreview from './components/CiderAccentPreview.vue'
import DownloadHub from './components/DownloadHub.vue'
import ScreenshotGallery from './components/ScreenshotGallery.vue'
import BrandCatalog from './components/BrandCatalog.vue'
import EcosystemGrid from './components/EcosystemGrid.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('CiderAccentPreview', CiderAccentPreview)
    app.component('DownloadHub', DownloadHub)
    app.component('ScreenshotGallery', ScreenshotGallery)
    app.component('BrandCatalog', BrandCatalog)
    app.component('EcosystemGrid', EcosystemGrid)
  },
} satisfies Theme
