# 🚀 Build, Test & Deploy Guide

Complete guide for building, testing, and deploying Sanctuary Stream to all platforms.

---

## Quick Start

### One-Command Deploy (Recommended)

```bash
# Full pipeline: test, build, commit, push, and create release
./scripts/build-test-deploy.sh --version v0.1.1
```

### Step-by-Step (Manual Control)

```bash
# 1. Test only
./scripts/build-test-deploy.sh --skip-build --skip-deploy

# 2. Build locally
./scripts/build-test-deploy.sh --skip-deploy

# 3. Deploy without local build
./scripts/build-test-deploy.sh --skip-build --version v0.1.1

# 4. Dry run (see what would happen)
./scripts/build-test-deploy.sh --dry-run --version v0.1.1
```

---

## 📋 Complete Pipeline

### 1️⃣ Install Dependencies

```bash
# Root project
npm install

# Frontend app
cd sanctuary-app
npm install
cd ..
```

**What it does:**
- Installs all Node.js dependencies
- Sets up Tauri, React, TypeScript, etc.
- Prepares build tools

---

### 2️⃣ Run Linters

```bash
# Root project
npm run lint

# Frontend app
cd sanctuary-app
npm run lint
cd ..
```

**What it checks:**
- Code style (ESLint)
- TypeScript errors
- Unused imports
- Best practices

---

### 3️⃣ Run Type Checking

```bash
cd sanctuary-app
npm run typecheck
# OR manually:
npx tsc --noEmit
cd ..
```

**What it validates:**
- TypeScript type safety
- Interface consistency
- Type compatibility

---

### 4️⃣ Run Tests

```bash
# Root project tests
npm test

# Frontend app tests
cd sanctuary-app
npm test
cd ..
```

**What it tests:**
- Unit tests (Vitest)
- Component tests
- Integration tests

---

### 5️⃣ Verify Platform Support

```bash
./scripts/verify-platform-support.sh
```

**What it verifies:**
- ✅ All 6 platforms configured
- ✅ WebSocket support enabled
- ✅ Backend access configured
- ✅ Mobile fallbacks ready

Expected output:
```
✅ Passed:   24
⚠️  Warnings: 0
❌ Failed:   0
```

---

### 6️⃣ Build Locally (Optional)

```bash
# Build web frontend
cd sanctuary-app
npm run build

# Build specific desktop platforms
npm run tauri:build:mac    # macOS Universal
npm run tauri:build:win    # Windows x64
npm run tauri:build:linux  # Linux (Deb + AppImage)

# Build mobile platforms
npm run tauri:ios:build    # iOS
npm run tauri:android:build # Android

# OR use Capacitor fallback
npm run cap:build:ios      # iOS (web-based)
npm run cap:build:android  # Android (web-based)

cd ..
```

**Build outputs:**
```
sanctuary-app/dist/                           # Web build
sanctuary-app/src-tauri/target/release/       # Desktop builds
sanctuary-app/gen/apple/                      # iOS (Tauri)
sanctuary-app/gen/android/                    # Android (Tauri)
sanctuary-app/ios/App/build/                  # iOS (Capacitor)
sanctuary-app/android/app/build/outputs/      # Android (Capacitor)
```

---

### 7️⃣ Commit Changes

```bash
git add -A
git commit -m "Your commit message"
```

**Best practices:**
- Use semantic commit messages
- Reference issues if applicable
- Keep commits focused

Example:
```bash
git commit -m "✅ Add WebSocket auto-reconnection

- Exponential backoff (1s → 30s)
- Network state monitoring
- All platforms supported

Fixes #123"
```

---

### 8️⃣ Push to GitHub

```bash
git push origin main
```

**What happens:**
- Code pushed to GitHub
- GitHub Actions NOT triggered yet (no tag)
- Web app auto-deploys to Vercel (if on main branch)

---

### 9️⃣ Create Release Tag

```bash
# Create and push tag
git tag -a v0.1.1 -m "Release v0.1.1

✅ All platforms with real-time WebSocket access
✅ HD/4K streaming support
✅ 245+ backend support"

git push origin v0.1.1
```

**What triggers:**
- ✅ GitHub Actions workflow starts
- ✅ Builds all 6 platforms in parallel
- ✅ Creates GitHub Release with binaries
- ✅ Makes downloads publicly available

---

### 🔟 Monitor GitHub Actions

```bash
# Open in browser
open https://github.com/brentmzey/sanctuary-stream/actions

# OR watch from terminal
gh run list --limit 5
gh run watch
```

**Build jobs (run in parallel):**
1. `build-macos` (~15 min)
2. `build-windows` (~10 min)
3. `build-linux` (~10 min)
4. `build-ios` (~20 min)
5. `build-android` (~15 min)
6. `build-web` (~3 min)

**Total time:** ~20-25 minutes

---

## 🎯 Common Workflows

### Development Workflow

```bash
# 1. Make changes to code
vim sanctuary-app/src/components/MyComponent.tsx

# 2. Run dev server
cd sanctuary-app
npm run dev

# 3. Test in browser
open http://localhost:5173

# 4. Run tests
npm test

# 5. Commit and push
cd ..
git add -A
git commit -m "Add new feature"
git push origin main
```

### Release Workflow

```bash
# 1. Update version in package.json
vim sanctuary-app/package.json
# Change: "version": "0.1.1"

# 2. Run full pipeline
./scripts/build-test-deploy.sh --version v0.1.1

# 3. Monitor GitHub Actions
open https://github.com/brentmzey/sanctuary-stream/actions

# 4. Wait for builds to complete (~20 min)

# 5. Download and test binaries
open https://github.com/brentmzey/sanctuary-stream/releases
```

### Hotfix Workflow

```bash
# 1. Create hotfix branch
git checkout -b hotfix/websocket-reconnect

# 2. Make fix
vim sanctuary-app/src/lib/pocketbase.ts

# 3. Test fix
cd sanctuary-app && npm test && cd ..

# 4. Commit and push
git add -A
git commit -m "🔥 Fix WebSocket reconnection bug"
git push origin hotfix/websocket-reconnect

# 5. Create PR on GitHub
gh pr create --title "Fix WebSocket reconnection" --body "Fixes #456"

# 6. After merge, create patch release
git checkout main
git pull
./scripts/build-test-deploy.sh --version v0.1.2
```

---

## 🏗️ GitHub Actions Workflow

### Trigger Conditions

**Automatic:**
- Tag push matching `v*` (e.g., `v0.1.0`)

**Manual:**
- Workflow dispatch on GitHub Actions UI

### Build Matrix

```yaml
jobs:
  build-macos:
    runs-on: macos-latest
    outputs: Sanctuary-Stream-universal.dmg, .app
  
  build-windows:
    runs-on: windows-latest
    outputs: Sanctuary-Stream-x64.msi, .exe
  
  build-linux:
    runs-on: ubuntu-latest
    outputs: sanctuary-stream_amd64.deb, .AppImage
  
  build-ios:
    runs-on: macos-latest
    outputs: Sanctuary-Stream.ipa, .app
  
  build-android:
    runs-on: ubuntu-latest
    outputs: sanctuary-stream-release.apk, .aab
  
  build-web:
    runs-on: ubuntu-latest
    outputs: Web app → Vercel deployment
  
  create-release:
    runs-on: ubuntu-latest
    needs: [all build jobs]
    outputs: GitHub Release with all binaries
```

### Required Secrets

Set these in GitHub repository settings (`Settings > Secrets and variables > Actions`):

**Apple (iOS/macOS):**
- `APPLE_CERTIFICATE` - Base64 encoded certificate
- `APPLE_CERTIFICATE_PASSWORD` - Certificate password
- `APPLE_SIGNING_IDENTITY` - Signing identity name
- `APPLE_TEAM_ID` - Apple Developer Team ID
- `APPLE_ID` - Apple ID email
- `APPLE_PASSWORD` - App-specific password
- `APPLE_PROVISIONING_PROFILE` - Base64 encoded profile

**Android:**
- `ANDROID_KEYSTORE_BASE64` - Base64 encoded keystore
- `ANDROID_KEYSTORE_PASSWORD` - Keystore password
- `ANDROID_KEY_ALIAS` - Key alias
- `ANDROID_KEY_PASSWORD` - Key password

**Windows (Optional):**
- `WINDOWS_CERTIFICATE` - Base64 encoded certificate
- `WINDOWS_CERTIFICATE_PASSWORD` - Certificate password

**PocketBase (Web deployment):**
- `VITE_POCKETBASE_URL` - Default backend URL

---

## 📦 Release Artifacts

### Desktop

**macOS:**
```
Sanctuary-Stream-universal.dmg (Universal Binary)
└─ Intel + Apple Silicon
└─ Size: ~50-80 MB
└─ Install: Drag to Applications folder
```

**Windows:**
```
Sanctuary-Stream-x64.msi (MSI Installer)
Sanctuary-Stream-x64-setup.exe (NSIS Installer)
└─ x64 architecture
└─ Size: ~60-90 MB
└─ Install: Run installer
```

**Linux:**
```
sanctuary-stream_amd64.deb (Debian/Ubuntu)
└─ Install: sudo dpkg -i sanctuary-stream_amd64.deb

sanctuary-stream_amd64.AppImage (Universal)
└─ Install: chmod +x *.AppImage && ./sanctuary-stream*.AppImage
```

### Mobile

**iOS:**
```
Sanctuary-Stream.ipa (iOS App)
└─ Install: Xcode, TestFlight, or App Store
└─ Size: ~40-60 MB
└─ Requires: iOS 13+
```

**Android:**
```
sanctuary-stream-release.apk (Direct Install)
└─ Install: Enable "Unknown sources" and install

sanctuary-stream-release.aab (Google Play)
└─ Install: Via Google Play Store
└─ Size: ~30-50 MB
└─ Requires: Android 7.0+
```

### Web

**Progressive Web App:**
```
https://sanctuary-stream.vercel.app
└─ Auto-updates on deployment
└─ Installable on all platforms
└─ Offline support via Service Worker
```

---

## 🔧 Troubleshooting

### Build Failures

**"Module not found"**
```bash
# Clean and reinstall
rm -rf node_modules sanctuary-app/node_modules
npm install
cd sanctuary-app && npm install && cd ..
```

**"Type errors"**
```bash
# Run type checking
cd sanctuary-app
npm run typecheck
# Fix errors shown
```

**"Tauri build failed"**
```bash
# Check Rust is installed
rustc --version

# Update Rust
rustup update

# Clean Tauri cache
cd sanctuary-app
rm -rf src-tauri/target
npm run tauri:build
```

### GitHub Actions Failures

**Check logs:**
```bash
# Via GitHub CLI
gh run list --limit 5
gh run view <run-id> --log

# Or visit:
# https://github.com/brentmzey/sanctuary-stream/actions
```

**Common issues:**
- Missing secrets (check repository settings)
- Node version mismatch (workflow uses 18)
- Rust toolchain issues (auto-installed by workflow)

### Platform Verification Failures

```bash
# Run verification
./scripts/verify-platform-support.sh

# If failed, check specific config files:
cat sanctuary-app/src-tauri/tauri.conf.json | grep -A 10 "http"
cat sanctuary-app/capacitor.config.ts
cat sanctuary-app/src/lib/pocketbase.ts | grep -i websocket
```

---

## 📊 Build Status Monitoring

### Check Release Status

```bash
# List releases
gh release list

# View specific release
gh release view v0.1.1

# Download release assets
gh release download v0.1.1
```

### Check Deployment Status

**Vercel (Web):**
```bash
# Install Vercel CLI
npm i -g vercel

# Check deployments
vercel list

# View logs
vercel logs sanctuary-stream
```

**GitHub Pages (Alternative):**
```bash
# Check if deployed
curl -I https://brentmzey.github.io/sanctuary-stream
```

---

## ✨ Summary

### Full Pipeline Command

```bash
./scripts/build-test-deploy.sh --version v0.1.1
```

**This will:**
1. ✅ Check prerequisites (git, node, npm)
2. ✅ Install dependencies
3. ✅ Run linting
4. ✅ Run type checking
5. ✅ Run tests
6. ✅ Verify platform support (24 checks)
7. ✅ Build local frontend
8. ✅ Commit uncommitted changes
9. ✅ Push to GitHub
10. ✅ Create and push release tag
11. ✅ Trigger GitHub Actions
12. ✅ Build all 6 platforms on GitHub
13. ✅ Create public release
14. ✅ Deploy web app to Vercel

**Timeline:**
- Local pipeline: ~2-5 minutes
- GitHub Actions: ~20-25 minutes
- **Total: ~25-30 minutes from commit to public release**

### Quick Reference

```bash
# Development
npm run dev                    # Start dev server
npm test                       # Run tests
npm run lint                   # Run linters

# Building
npm run build                  # Build web frontend
npm run tauri:build            # Build desktop app
npm run cap:build:ios          # Build iOS (Capacitor)
npm run cap:build:android      # Build Android (Capacitor)

# Deployment
./scripts/build-test-deploy.sh --version v0.1.1   # Full pipeline
git tag -a v0.1.1 -m "Release" && git push --tags # Manual tag

# Verification
./scripts/verify-platform-support.sh   # Check platform config
gh run watch                           # Monitor GitHub Actions
```

---

**🚀 Ready to deploy? Run:**
```bash
./scripts/build-test-deploy.sh --version v0.1.1
```
