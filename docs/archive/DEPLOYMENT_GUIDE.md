# 🚀 Sanctuary Stream - Complete Build, Test & Deployment Guide

**Build once, deploy everywhere - ANY platform**

---

## 🎯 Quick Reference

| Platform | Build Command | Deploy Target | Time | Cost |
|----------|--------------|---------------|------|------|
| 🌐 **Web** | `npm run build:app` | Vercel/Netlify | 1 min | $0 |
| 🖥️ **Desktop** | `npm run build:desktop` | GitHub Releases | 15 min | $0 |
| 📱 **iOS** | `npm run build:ios` | App Store | 30 min | $99/year |
| 🤖 **Android** | `npm run build:android` | Play Store | 30 min | $25 once |
| ⚙️ **Bridge** | `npm run build:bridge` | Any server | 1 sec | $0 |

---

## 🏗️ Build Everything

### Prerequisites

```bash
# Required for all platforms
node --version    # v18.0.0 or higher
npm --version     # 9.0.0 or higher

# Platform-specific (only if building that platform)
# macOS: Xcode Command Line Tools
xcode-select --install

# Windows: Visual Studio C++ Build Tools
# Download: https://visualstudio.microsoft.com/downloads/

# Linux: Build essentials
sudo apt install build-essential libwebkit2gtk-4.0-dev \
  libssl-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev
```

### 1️⃣ Build All Workspaces (Web + Bridge)

```bash
# Build everything at once
npm run build

# Or individually
npm run build:app      # Web app only
npm run build:bridge   # Bridge only
```

**Output:**
- ✅ `sanctuary-app/dist/` - Production web bundle
- ✅ `sanctuary-bridge/dist/` - Bridge service

**Time:** ~30 seconds

---

## 🌐 Web Deployment (Easiest - Start Here!)

### Option 1: Vercel (Recommended)

```bash
cd sanctuary-app

# Install Vercel CLI
npm install -g vercel

# Deploy (first time - interactive)
vercel

# Deploy to production
vercel --prod
```

**Result:** https://sanctuary-stream.vercel.app (or your custom domain)

**Cost:** $0 (free tier includes unlimited sites)

---

### Option 2: Netlify

```bash
cd sanctuary-app

# Install Netlify CLI
npm install -g netlify-cli

# Deploy
npm run build
netlify deploy --prod --dir=dist
```

**Result:** https://sanctuary-stream.netlify.app

**Cost:** $0 (free tier)

---

### Option 3: Any Static Host

```bash
cd sanctuary-app
npm run build

# Upload the dist/ folder to:
# - GitHub Pages
# - Cloudflare Pages
# - AWS S3 + CloudFront
# - Firebase Hosting
# - Any web server (nginx, Apache)
```

**Time to deploy:** 1-5 minutes

---

## 🖥️ Desktop Deployment

### Build for macOS

```bash
cd sanctuary-app

# Universal binary (Intel + Apple Silicon)
npm run tauri:build:mac
```

**Output:** `src-tauri/target/release/bundle/macos/`
- ✅ `Sanctuary Stream.app` - Application bundle
- ✅ `Sanctuary Stream_*.dmg` - Installer (distribute this)

**Requirements:**
- macOS 10.13+ to build
- Xcode Command Line Tools
- Target: macOS 10.13+ (all Intel & Apple Silicon Macs)

**Size:** ~15-20 MB

**Time:** 3-5 minutes

---

### Build for Windows

```bash
cd sanctuary-app

# Windows 64-bit installer
npm run tauri:build:win
```

**Output:** `src-tauri/target/release/bundle/msi/`
- ✅ `Sanctuary Stream_*.msi` - Installer (distribute this)
- ✅ `Sanctuary Stream.exe` - Portable executable

**Requirements:**
- Windows 10/11 to build
- Visual Studio C++ Build Tools
- Target: Windows 10/11 64-bit

**Size:** ~10-15 MB

**Time:** 3-5 minutes

---

### Build for Linux

```bash
cd sanctuary-app

# All Linux formats
npm run tauri:build:linux
```

**Output:** `src-tauri/target/release/bundle/`
- ✅ `sanctuary-stream_*.deb` - Debian/Ubuntu (apt install)
- ✅ `sanctuary-stream_*.AppImage` - Universal (no install needed)

**Requirements:**
- Ubuntu 20.04+ or equivalent to build
- webkit2gtk, libssl, libgtk dependencies
- Target: Most Linux distros (2016+)

**Size:** ~15-20 MB

**Time:** 3-5 minutes

---

### Distribute Desktop Apps

#### Option 1: GitHub Releases (Recommended - Free)

```bash
# Tag your release
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0

# GitHub Actions will automatically:
# 1. Build for macOS, Windows, Linux
# 2. Create GitHub Release
# 3. Upload all binaries

# Users download from:
# https://github.com/brentmzey/sanctuary-stream/releases
```

**Cost:** $0 (GitHub free tier)

---

#### Option 2: Direct Download

```bash
# Upload to your web server
scp sanctuary-stream.dmg user@server:/var/www/downloads/
scp sanctuary-stream.msi user@server:/var/www/downloads/
scp sanctuary-stream.AppImage user@server:/var/www/downloads/

# Users download from:
# https://yoursite.com/downloads/
```

---

#### Option 3: Package Managers

**Homebrew (macOS):**
```bash
# Create Homebrew Cask (community maintained)
# https://docs.brew.sh/How-to-Create-and-Maintain-a-Tap
```

**Chocolatey (Windows):**
```bash
# Submit to Chocolatey
# https://docs.chocolatey.org/en-us/create/create-packages
```

**Snap/Flatpak (Linux):**
```bash
# Submit to Snapcraft
# https://snapcraft.io/docs/creating-a-snap

# Or create Flatpak
# https://docs.flatpak.org/en/latest/first-build.html
```

---

## 📱 Mobile Deployment

### iOS (App Store)

#### Prerequisites
```bash
# 1. Install Xcode from Mac App Store
# 2. Install Xcode Command Line Tools
xcode-select --install

# 3. Get Apple Developer Account ($99/year)
# https://developer.apple.com/programs/

# 4. Setup certificates and provisioning profiles
# Xcode → Settings → Accounts → Add Apple ID
```

#### Build & Deploy

```bash
cd sanctuary-app

# Option A: Tauri (Native Rust + WebView)
npm run tauri:ios:init   # First time only
npm run tauri:ios:build

# Option B: Capacitor (Hybrid Web)
npm run cap:build:ios
```

**Output:** Xcode project opens automatically

**In Xcode:**
1. Select "Any iOS Device" as target
2. Product → Archive
3. Distribute App → App Store Connect
4. Upload to App Store

**TestFlight Beta (before full release):**
1. Upload build to App Store Connect
2. Add to TestFlight
3. Invite testers via email (up to 10,000)

**Full App Store Release:**
1. Create app listing in App Store Connect
2. Add screenshots, description, keywords
3. Submit for review (1-3 days)
4. Goes live after approval

**Requirements:**
- macOS with Xcode 14+
- Apple Developer Program ($99/year)
- Target: iOS 13.0+

**Cost:** $99/year

**Time:** 30 min build + 1-3 days review

---

### Android (Play Store)

#### Prerequisites
```bash
# 1. Install Android Studio
# Download: https://developer.android.com/studio

# 2. Install Android SDK
# Android Studio → Tools → SDK Manager
# Install: Android SDK 26+ (Android 8.0+)

# 3. Install Java JDK 11+
java --version  # Should be 11 or higher

# 4. Get Google Play Console Account ($25 one-time)
# https://play.google.com/console/signup
```

#### Build & Deploy

```bash
cd sanctuary-app

# Option A: Tauri (Native Rust + WebView)
npm run tauri:android:init    # First time only
npm run tauri:android:build

# Option B: Capacitor (Hybrid Web)
npm run cap:build:android
```

**Output:** Android Studio project opens automatically

**In Android Studio:**
1. Build → Generate Signed Bundle / APK
2. Choose "Android App Bundle" (for Play Store)
3. Create or select signing key
4. Build release bundle

**Play Store Upload:**
1. Open Google Play Console
2. Create new app
3. Upload `.aab` bundle
4. Create store listing (screenshots, description)
5. Submit for review (few hours to 1 day)

**Direct APK Distribution (No Play Store):**
```bash
# Build APK instead of bundle
# In Android Studio: Build → Generate Signed APK
# Share .apk file directly (users enable "Unknown Sources")
```

**Requirements:**
- Android Studio
- Android SDK 26+
- Java JDK 11+
- Google Play Console ($25 one-time)

**Cost:** $25 one-time

**Time:** 30 min build + few hours review

---

## ⚙️ Bridge Deployment (OBS Connection Service)

### Option 1: Local Installation (Most Common)

```bash
# On streaming computer (where OBS runs)
cd sanctuary-bridge

# Install dependencies
npm install

# Configure environment
cp .env.example .env
nano .env  # Edit with your PocketBase URL, etc.

# Build
npm run build

# Run
npm start
```

**Run as Background Service:**

#### Windows (NSSM - Recommended)
```bash
# Install NSSM
choco install nssm

# Create service
nssm install SanctuaryBridge "C:\Program Files\nodejs\node.exe" "C:\sanctuary-stream\sanctuary-bridge\dist\index.js"
nssm set SanctuaryBridge AppDirectory "C:\sanctuary-stream\sanctuary-bridge"
nssm set SanctuaryBridge Start SERVICE_AUTO_START

# Start service
nssm start SanctuaryBridge
```

#### macOS (launchd)
```bash
# Create plist file
cat > ~/Library/LaunchAgents/com.sanctuary.bridge.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.sanctuary.bridge</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/node</string>
        <string>/path/to/sanctuary-bridge/dist/index.js</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
</dict>
</plist>
EOF

# Load and start
launchctl load ~/Library/LaunchAgents/com.sanctuary.bridge.plist
```

#### Linux (systemd)
```bash
# Create service file
sudo nano /etc/systemd/system/sanctuary-bridge.service

# Add:
[Unit]
Description=Sanctuary Stream Bridge
After=network.target

[Service]
Type=simple
User=YOUR_USERNAME
WorkingDirectory=/path/to/sanctuary-bridge
ExecStart=/usr/bin/node /path/to/sanctuary-bridge/dist/index.js
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target

# Enable and start
sudo systemctl enable sanctuary-bridge
sudo systemctl start sanctuary-bridge
sudo systemctl status sanctuary-bridge
```

---

### Option 2: Docker (Portable)

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY sanctuary-bridge/package*.json ./
RUN npm ci --only=production
COPY sanctuary-bridge/dist ./dist

CMD ["node", "dist/index.js"]
```

```bash
# Build
docker build -t sanctuary-bridge .

# Run
docker run -d \
  --name sanctuary-bridge \
  --network host \
  -e POCKETBASE_URL=http://127.0.0.1:8090 \
  -e OBS_HOST=127.0.0.1 \
  -e OBS_PORT=4455 \
  sanctuary-bridge
```

---

### Option 3: Cloud VM (Remote - Not Recommended)

```bash
# Deploy to AWS EC2, DigitalOcean, etc.
# Note: OBS must be reachable (usually same machine)

# Upload files
scp -r sanctuary-bridge user@server:/opt/

# SSH and setup
ssh user@server
cd /opt/sanctuary-bridge
npm install
npm start

# Setup systemd service (same as Linux above)
```

**⚠️ Note:** Bridge should run on same machine as OBS for best performance.

---

## 🧪 Testing

### Run All Tests

```bash
# Root-level tests (all workspaces)
npm test

# Individual workspace tests
npm run test:app       # Frontend tests
npm run test:bridge    # Bridge tests

# End-to-end tests (full integration)
npm run test:e2e

# Coverage reports
npm run test:coverage
```

---

### Manual Testing Checklist

#### Web App
- [ ] Login/logout works
- [ ] Stream status displays
- [ ] Commands execute (Start/Stop)
- [ ] Video quality controls work
- [ ] Health monitor updates
- [ ] PWA installs correctly

#### Desktop App
- [ ] Installer works
- [ ] App launches
- [ ] Setup wizard completes
- [ ] All features work (same as web)
- [ ] Auto-updater works

#### Mobile App
- [ ] App installs
- [ ] Permissions granted (camera, mic if needed)
- [ ] All features work
- [ ] Push notifications (if enabled)
- [ ] Offline mode works

#### Bridge
- [ ] Connects to PocketBase
- [ ] Connects to OBS WebSocket
- [ ] Receives commands
- [ ] Executes OBS actions
- [ ] Reports status back
- [ ] Google Drive upload works

---

## 🔒 Code Signing (Optional but Recommended)

### macOS

```bash
# Sign with Apple Developer certificate
codesign --sign "Developer ID Application: Your Name (TEAM_ID)" \
  --deep --force --verify --verbose \
  "Sanctuary Stream.app"

# Notarize for macOS Gatekeeper
xcrun notarytool submit "Sanctuary Stream.dmg" \
  --apple-id "your@email.com" \
  --password "app-specific-password" \
  --team-id "TEAM_ID" \
  --wait

# Staple notarization ticket
xcrun stapler staple "Sanctuary Stream.dmg"
```

**Benefits:**
- ✅ No "unverified developer" warning
- ✅ Required for Mac App Store
- ✅ Users trust your app

**Cost:** Included in Apple Developer Program ($99/year)

---

### Windows

```bash
# Get code signing certificate
# Providers: DigiCert, Sectigo, SSL.com (~$100-400/year)

# Sign with signtool (from Windows SDK)
signtool sign /tr http://timestamp.digicert.com /td sha256 \
  /fd sha256 /a "Sanctuary Stream.msi"
```

**Benefits:**
- ✅ No SmartScreen warning
- ✅ Required for Microsoft Store
- ✅ Professional appearance

**Cost:** $100-400/year for certificate

---

## 📊 Build Size Reference

| Platform | Uncompressed | Compressed | Installer | Notes |
|----------|--------------|------------|-----------|-------|
| **Web** | 252 KB | 74 KB | N/A | Gzipped assets |
| **macOS** | ~40 MB | ~15 MB | ~15 MB (.dmg) | Universal binary |
| **Windows** | ~30 MB | ~10 MB | ~10 MB (.msi) | x64 only |
| **Linux** | ~35 MB | ~15 MB | ~15 MB | .deb or .AppImage |
| **iOS** | ~40 MB | ~15 MB | N/A | App Store handles |
| **Android** | ~50 MB | ~20 MB | ~20 MB (.aab) | Multiple ABIs |
| **Bridge** | ~5 MB | ~1 MB | N/A | Node.js required |

---

## 🎯 Recommended Deployment Strategy

### Phase 1: MVP Launch (Week 1)
```bash
# 1. Deploy web app (FREE)
cd sanctuary-app && npm run build
vercel --prod

# 2. Setup Bridge locally (FREE)
cd sanctuary-bridge && npm install && npm start

# 3. Test with real OBS
# 4. Share with initial users
```

**Cost:** $0  
**Time:** 1 hour  
**Users reach:** Web browser (any device)

---

### Phase 2: Desktop Apps (Week 2)
```bash
# 1. Push release tag
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0

# 2. Wait for GitHub Actions (~20 min)
# 3. Download builds from GitHub Releases
# 4. Test on clean machines
# 5. Share download links
```

**Cost:** $0  
**Time:** 1 day (including testing)  
**Users reach:** macOS, Windows, Linux

---

### Phase 3: Mobile Apps (Month 1-2)
```bash
# 1. Get developer accounts
# - Apple Developer: $99/year
# - Google Play Console: $25 one-time

# 2. Build and submit apps
npm run cap:build:ios
npm run cap:build:android

# 3. TestFlight/Beta track first
# 4. Gather feedback
# 5. Submit to stores
```

**Cost:** $124 (Apple + Google)  
**Time:** 2-4 weeks (includes review)  
**Users reach:** iOS, Android

---

### Phase 4: App Store Distribution (Optional)
```bash
# 1. Mac App Store (if desired)
# 2. Microsoft Store (if desired)
# 3. Snap Store / Flatpak (Linux)
```

**Cost:** Varies  
**Time:** 1-2 months  
**Users reach:** Official store users

---

## 🆘 Troubleshooting

### Build Fails

```bash
# Clean everything and rebuild
rm -rf node_modules sanctuary-app/node_modules sanctuary-bridge/node_modules
npm install
npm run build
```

### Desktop Build Fails

```bash
# macOS: Install Xcode tools
xcode-select --install

# Windows: Install Visual Studio
# Download from: https://visualstudio.microsoft.com/downloads/

# Linux: Install dependencies
sudo apt update && sudo apt install -y \
  libwebkit2gtk-4.0-dev libssl-dev libgtk-3-dev \
  libayatana-appindicator3-dev librsvg2-dev
```

### Mobile Build Fails

```bash
# iOS: Update Xcode and simulators
softwareupdate --install -a

# Android: Update Android SDK
# Android Studio → Tools → SDK Manager → Update

# Clear Capacitor cache
cd sanctuary-app
rm -rf android ios
npm run cap:sync
```

### Bridge Won't Connect

```bash
# Check .env configuration
cat sanctuary-bridge/.env

# Verify PocketBase is running
curl http://127.0.0.1:8090/api/health

# Verify OBS WebSocket is enabled
# OBS → Tools → WebSocket Server Settings
```

---

## 📚 Additional Resources

- **Installation Guide:** `INSTALLATION_GUIDE.md`
- **Station Setup:** `docs/STATION_SETUP.md`
- **OBS Integration:** `docs/OBS_INTEGRATION.md`
- **User Guide:** `docs/USER_GUIDE.md`
- **Platform Verification:** `PLATFORM_VERIFICATION.md`
- **Build Status:** `BUILD_DEPLOY_VERIFIED.md`

---

## ✅ Summary

**You can NOW:**
- ✅ Build for **ANY platform** (web, desktop, mobile)
- ✅ Test locally with full automation
- ✅ Deploy web app in 1 minute (FREE)
- ✅ Distribute desktop apps via GitHub (FREE)
- ✅ Submit to App Stores (requires accounts)
- ✅ Run Bridge anywhere (local, cloud, Docker)

**Total Cost:**
- Web + Desktop: **$0**
- + iOS: **$99/year**
- + Android: **$25 one-time**

**Your church can access Sanctuary Stream on ANY device they own! 🎉**

---

**Questions?** Everything is documented and tested. Ready to deploy! 🚀
