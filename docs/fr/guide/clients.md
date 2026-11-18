# Clients Multi-Plateformes & Guides de Compilation

PVE Command Center propose des applications clientes dédiées pour l’écosystème Apple, les ordinateurs Windows et Linux, les appareils Android et tout navigateur Web. Tous les clients partagent l’esthétique **Liquid Glass** & **Cider Studio** et se connectent indifféremment en **HTTP LAN**, via **Bonjour mDNS** ou en **HTTPS Tailscale**.

---

## Apple Natif (`iOS / iPadOS / macOS / tvOS`) {#apple-native}

**Dépôt :** [`PVE-Center/pve-center-apple`](https://github.com/PVE-Center/pve-center-apple)

Une base de code unique **Swift 6** / **SwiftUI** (`PVECenter.xcodeproj` & `Package.swift`) ciblant :

- **iPhone & iPad (`iOS 27.0`)** : `TabView` Liquid Glass, retour haptique `.sensoryFeedback`, scanner QR `AVCaptureSession` (`pvecenter://`), cache local SwiftData, trousseau Keychain et notifications locales/APNs interactives (`Mute 1h`, `Tester`).
- **macOS (`macOS 27.0`)** : `NavigationSplitView`, menu barre (`MenuBarExtra`) affichant CPU/RAM/débits qBittorrent/flux Jellyfin & mode Tortue, raccourcis clavier (`⌘R`, `⌘L`, `⌘;`, `⌘1`–`⌘6`) et installation native dans `/Applications/PVE Center.app`.
- **Apple TV (`tvOS 27.0`)** : interface 10-foot sombre haute lisibilité (`TVGlassCardButtonStyle`), bannières d’alertes temps réel WebSocket (`activeTVBanner`) et appairage chiffré sans saisie à la télécommande. {#apple-tv}

### Commandes de compilation et déploiement Apple

```bash
git clone https://github.com/PVE-Center/pve-center-apple.git
cd pve-center-apple

# Vérifier le package Swift 6 (macOS)
swift build

# Compiler et installer /Applications/PVE Center.app (via Xcode)
./scripts/install-mac.sh

# Ou empaqueter via SwiftPM + AppIcon.icns
./scripts/build-macos-app.sh

# Lancer les simulateurs iPhone ou Apple TV
./scripts/run-iphone-sim.sh
./scripts/run-appletv-sim.sh

# Déployer sur iPhone, iPad ou Apple TV physique (USB ou Wi-Fi)
./scripts/deploy-device.sh --list
./scripts/deploy-device.sh -t <TEAM_ID> -p ios
./scripts/deploy-device.sh -t <TEAM_ID> -p tvos -d <UDID_APPLE_TV>
```

### App Store, APNs `.p8` & Sideloading

- **Compte Apple gratuit (Personal Team)** : `aps-environment` n’est **pas forcé** dans `project.pbxproj`, permettant à quiconque de compiler et installer l’application sur ses appareils personnels via Signature Automatique Xcode, AltStore, **SideStore** (renouvellement auto en Wi-Fi) ou Sideloadly.
- **Apple Developer Program (99 $/an)** : ajoutez la capability **Push Notifications** dans Xcode sur la cible `PVECenter` (`io.ac.pvepanel.app`), générez une clé APNs (`AuthKey_<KEY_ID>.p8`), copiez-la dans `./config/AuthKey.p8` sur le serveur `pve-panel` et activez `notifications.apns` dans `config/config.yaml`.

---

## Desktop (`Windows & Linux — Tauri v2`) {#desktop-tauri}

**Dépôt :** [`PVE-Center/pve-center-clients`](https://github.com/PVE-Center/pve-center-clients)

Le client bureau encapsule l’interface React 19 + Tailwind CSS dans une coquille Rust **Tauri v2** (`src-tauri/`, Bundle ID `io.github.pvepanel.desktop`, fenêtre `1280×820` par défaut) dotée d’une icône **System Tray** native (Afficher/Masquer & Quitter) et d’un sélecteur de serveur distant persisté en `localStorage` compatible IP LAN et `https://*.ts.net`.

### Prérequis

- **Node.js 22+** & `npm`
- **Rust & Cargo** (`rustup`)
- **Linux** : paquets de développement WebKitGTK & libappindicator (`libwebkit2gtk-4.1-dev`, `libayatana-appindicator3-dev`, `librsvg2-dev`, `patchelf` sous Debian/Ubuntu)
- **Windows** : outils C++ Visual Studio & WebView2 (bootstrapper embarqué)

### Commandes de compilation Desktop

```bash
git clone https://github.com/PVE-Center/pve-center-clients.git
cd pve-center-clients
npm ci

# Lancer en mode développement Tauri v2
npm run tauri:dev

# Linux : compiler les paquets .AppImage et .deb
./scripts/build-desktop.sh
# Artefacts générés dans src-tauri/target/release/bundle/
```

Sous **Windows (PowerShell)** :

```powershell
git clone https://github.com/PVE-Center/pve-center-clients.git
cd pve-center-clients
.\scripts\build-windows.ps1
# Génère les installeurs .exe (NSIS) et .msi dans src-tauri\target\release\bundle\
```

---

## Android (`Capacitor 8`) {#android-capacitor}

**Dépôt :** [`PVE-Center/pve-center-clients`](https://github.com/PVE-Center/pve-center-clients)

Le client Android empaquette la PWA React 19 avec **Capacitor 8** (`@capacitor/android ^8.6.2`, App ID `io.github.pvepanel.app`, `CapacitorHttp` activé). `AndroidManifest.xml` et `capacitor.config.ts` (`androidScheme: 'http'`, `cleartext: true`, `allowMixedContent: true`) sont préconfigurés pour supporter aussi bien les IP LAN locales (`http://192.168.x.x:8000`) que les domaines HTTPS Tailscale (`https://*.ts.net`).

### Prérequis

- **Node.js 22+** & `npm`
- **Java JDK 17+** & **Android SDK** (ou Android Studio)

### Commandes de compilation Android

```bash
git clone https://github.com/PVE-Center/pve-center-clients.git
cd pve-center-clients
npm ci

# Synchroniser les assets Web et compiler l'APK debug
./scripts/build-android.sh --debug

# Compiler l'APK release ou l'App Bundle (.aab)
./scripts/build-android.sh --release
./scripts/build-android.sh --aab

# Ou via les scripts npm directs
npm run cap:sync
npm run android:build
```

Les fichiers `.apk` et `.aab` générés se trouvent sous `android/app/build/outputs/`.

---

## Web PWA (Safari, Chrome, Edge, Firefox)

Aucune compilation séparée n’est requise : `pve-panel` sert directement la PWA React 19 sur `http://<IP_LAN>:8000` ou `https://<hostname>.<tailnet>.ts.net`.

- **Safari iPhone / iPad** : ouvrez votre URL HTTPS Tailscale → **Partager** → **Sur l’écran d’accueil** pour installer la PWA Liquid Glass en mode plein écran.
- **Chrome / Edge Desktop** : cliquez sur **Installer l’application** dans la barre d’adresse.
