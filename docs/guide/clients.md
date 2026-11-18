# Multi-Platform Clients & Build Guides

PVE Command Center provides dedicated client applications across Apple ecosystems, Windows/Linux desktops, Android devices, and web browsers. All native clients share the same **Liquid Glass** & **Cider Studio** aesthetics, support **Demo Mode**, and connect over **LAN HTTP**, **Bonjour mDNS**, or **Tailscale HTTPS**.

---

## Apple Native (`iOS / iPadOS / macOS / tvOS`) {#apple-native}

**Repository:** [`Fairy-Jeux/pve-center-apple`](https://github.com/Fairy-Jeux/pve-center-apple)

A single **Swift 6** / **SwiftUI** codebase (`PVECenter.xcodeproj` & `Package.swift`) targeting:

- **iPhone & iPad (`iOS 27.0`)**: Liquid Glass TabView, `.sensoryFeedback`, `AVCaptureSession` QR scanner (`pvecenter://`), SwiftData cache, Keychain credential storage, and interactive local/APNs notifications (`Mute 1h`, `Test`).
- **macOS (`macOS 27.0`)**: `NavigationSplitView`, menu bar popover (`MenuBarExtra`) displaying live CPU/RAM/qBittorrent speeds/Jellyfin streams & Turtle Mode toggle, keyboard shortcuts (`⌘R`, `⌘L`, `⌘;`, `⌘1`–`⌘6`), and ad-hoc `/Applications/PVE Center.app` packaging.
- **Apple TV (`tvOS 27.0`)**: 10-foot dark glass Focus Engine UI (`TVGlassCardButtonStyle`), live WebSocket alert banners (`activeTVBanner`), and zero-typing encrypted PIN pairing. {#apple-tv}

### Apple Build & Run Commands

```bash
git clone https://github.com/Fairy-Jeux/pve-center-apple.git
cd pve-center-apple

# Verify Swift 6 package build (macOS)
swift build

# Build & install native /Applications/PVE Center.app (Xcode)
./scripts/install-mac.sh

# Or package via SwiftPM + AppIcon.icns
./scripts/build-macos-app.sh

# Launch iOS or Apple TV Simulator
./scripts/run-iphone-sim.sh
./scripts/run-appletv-sim.sh

# Deploy to physical iPhone, iPad, or Apple TV (USB or Wi-Fi paired)
./scripts/deploy-device.sh --list
./scripts/deploy-device.sh -t <TEAM_ID> -p ios
./scripts/deploy-device.sh -t <TEAM_ID> -p tvos -d <APPLE_TV_UDID>
```

### App Store, APNs `.p8` & Sideloading

- **Free Personal Apple Account**: `aps-environment` is intentionally **not forced** in `project.pbxproj`, so any developer can build and run on personal iOS/tvOS devices immediately using Automatic Signing, AltStore, **SideStore** (Wi-Fi auto-refresh), or Sideloadly.
- **Paid Apple Developer Program ($99/year)**: Enable the **Push Notifications** capability in Xcode on target `PVECenter` (`io.ac.pvepanel.app`), create an APNs key (`AuthKey_<KEY_ID>.p8`), place it in `./config/AuthKey.p8` on your `pve-panel` server, and configure `notifications.apns` in `config/config.yaml`.

---

## Desktop (`Windows & Linux — Tauri v2`) {#desktop-tauri}

**Repository:** [`Fairy-Jeux/pve-center-clients`](https://github.com/Fairy-Jeux/pve-center-clients)

The desktop client wraps the React 19 + Tailwind CSS UI inside a **Tauri v2** Rust shell (`src-tauri/`, Bundle ID `io.github.pvepanel.desktop`, `1280×820` default window) with a native **System Tray** icon (Show/Hide window & Quit) and `localStorage`-persisted remote server profiles so you can point the desktop app to any LAN IP or `https://*.ts.net` URL.

### Prerequisites

- **Node.js 22+** & `npm`
- **Rust & Cargo** (`rustup`)
- **Linux**: WebKitGTK & libappindicator development headers (`libwebkit2gtk-4.1-dev`, `libayatana-appindicator3-dev`, `librsvg2-dev`, `patchelf` on Debian/Ubuntu)
- **Windows**: Visual Studio C++ Build Tools & WebView2 (bundled via `embedBootstrapper`)

### Desktop Build Commands

```bash
git clone https://github.com/Fairy-Jeux/pve-center-clients.git
cd pve-center-clients
npm ci

# Run live Tauri v2 dev window
npm run tauri:dev

# Linux: build .AppImage and .deb packages
./scripts/build-desktop.sh
# Outputs under src-tauri/target/release/bundle/
```

On **Windows (PowerShell)**:

```powershell
git clone https://github.com/Fairy-Jeux/pve-center-clients.git
cd pve-center-clients
.\scripts\build-windows.ps1
# Generates .exe (NSIS) and .msi installers under src-tauri\target\release\bundle\
```

---

## Android (`Capacitor 8`) {#android-capacitor}

**Repository:** [`Fairy-Jeux/pve-center-clients`](https://github.com/Fairy-Jeux/pve-center-clients)

The Android client packages the React 19 PWA with **Capacitor 8** (`@capacitor/android ^8.6.2`, App ID `io.github.pvepanel.app`, `CapacitorHttp` enabled) and pre-configures `AndroidManifest.xml` + `capacitor.config.ts` (`androidScheme: 'http'`, `cleartext: true`, `allowMixedContent: true`) so both local `http://192.168.x.x:8000` homelab IPs and `https://*.ts.net` Tailscale URLs work reliably.

### Prerequisites

- **Node.js 22+** & `npm`
- **Java JDK 17+** & **Android SDK** (or Android Studio)

### Android Build Commands

```bash
git clone https://github.com/Fairy-Jeux/pve-center-clients.git
cd pve-center-clients
npm ci

# Sync web assets and build debug APK
./scripts/build-android.sh --debug

# Build release APK or Android App Bundle (.aab)
./scripts/build-android.sh --release
./scripts/build-android.sh --aab

# Or use npm scripts directly
npm run cap:sync
npm run android:build
```

Compiled `.apk` and `.aab` outputs are generated under `android/app/build/outputs/`.

---

## Web PWA (Safari, Chrome, Edge, Firefox)

No separate build is required for browser access: `pve-panel` serves the compiled React 19 PWA directly at `http://<LAN_IP>:8000` or `https://<hostname>.<tailnet>.ts.net`.

- **iPhone / iPad Safari**: Open your Tailscale HTTPS URL → **Share** → **Add to Home Screen** for a full-screen standalone Liquid Glass PWA.
- **Desktop Chromium / Edge**: Click **Install App** in the address bar.
