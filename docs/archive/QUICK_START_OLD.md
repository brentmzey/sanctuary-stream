# 🚀 Quick Start Guide

Get Sanctuary Stream running in minutes.

---

## 🎯 **NEW: Auto-Deploy on Push to Main!**

**Just push to `main` and everything builds automatically!**

```bash
git push origin main
```

**What happens automatically (~25 minutes):**
1. ✅ Builds all 6 platforms (macOS, Windows, Linux, iOS, Android, Web)
2. ✅ Runs all tests
3. ✅ Creates development release on GitHub
4. ✅ Uploads iOS to TestFlight
5. ✅ Uploads Android to Google Play Internal
6. ✅ Deploys web to Vercel
7. ✅ Packages backend configuration

**No manual steps required!**

---

## 📦 Deploy Everything (Automated)

### Option 1: Push to Main (Recommended)
```bash
# Make your changes
git add .
git commit -m "Add new feature"
git push origin main

# Wait ~25 minutes - everything builds automatically!
```

### Option 2: Create Production Release
```bash
# For production releases (not development builds)
git tag -a v0.1.1 -m "Release v0.1.1"
git push origin v0.1.1

# Triggers production deployment
```

### Option 3: Use Helper Script (Manual Control)
```bash
# Full control with testing and verification
./scripts/build-test-deploy.sh --version v0.1.1
```

---

## 🧪 Test Only

```bash
./scripts/build-test-deploy.sh --skip-build --skip-deploy
```

Runs all tests without building or deploying.

---

## 🏗️ Build Locally (Optional)

```bash
# Web frontend
cd sanctuary-app && npm run build

# Desktop (macOS)
cd sanctuary-app && npm run tauri:build:mac

# Mobile (iOS)
cd sanctuary-app && npm run tauri:ios:build
```

---

## 📦 Download Binaries

After push to `main` completes (~25 minutes):

**Automatic development builds:**
https://github.com/sanctuary-stream/sanctuary-stream/releases

**Production releases (tags):**
https://github.com/sanctuary-stream/sanctuary-stream/releases/latest

- 🍎 macOS: `Sanctuary-Stream-universal.dmg`
- 🪟 Windows: `Sanctuary-Stream-x64.msi`
- 🐧 Linux: `sanctuary-stream_amd64.deb` or `.AppImage`
- 📱 iOS: Available on TestFlight (auto-uploaded)
- 🤖 Android: Available on Google Play Internal (auto-uploaded)
- 🌐 Web: https://sanctuary-stream.vercel.app

---

## 📱 Mobile App Stores

### iOS (TestFlight)
**Automatic:** Uploaded on every push
**Manual:** Log into App Store Connect to promote

### Android (Google Play)
**Automatic:** Uploaded to Internal Track on every push
**Manual:** Log into Play Console to promote

---

## ✅ Verify Everything Works

```bash
./scripts/verify-platform-support.sh
```

Expected output:
```
✅ Passed:   24
⚠️  Warnings: 0
❌ Failed:   0

🎉 ALL PLATFORMS HAVE REAL-TIME ACCESS!
```

---

## 📚 More Information

- **Auto-Deploy Guide:** [docs/AUTO_DEPLOY_GUIDE.md](docs/AUTO_DEPLOY_GUIDE.md) ⭐ **NEW**
- **Complete Build Guide:** [docs/BUILD_DEPLOY_GUIDE.md](docs/BUILD_DEPLOY_GUIDE.md)
- **Platform Details:** [docs/PLATFORM_SUPPORT.md](docs/PLATFORM_SUPPORT.md)
- **User Guide:** [docs/USER_GUIDE.md](docs/USER_GUIDE.md)
- **Status Report:** [PLATFORM_STATUS.md](PLATFORM_STATUS.md)

---

## 🆘 Need Help?

- **Troubleshooting:** See [docs/BUILD_DEPLOY_GUIDE.md](docs/BUILD_DEPLOY_GUIDE.md#-troubleshooting)
- **GitHub Issues:** https://github.com/sanctuary-stream/sanctuary-stream/issues
- **GitHub Actions:** https://github.com/sanctuary-stream/sanctuary-stream/actions

---

## 🎯 Daily Workflow

```bash
# 1. Make changes
vim sanctuary-app/src/...

# 2. Commit and push
git add .
git commit -m "Add feature"
git push origin main

# 3. Wait ~25 minutes - everything builds automatically!

# 4. Download from:
#    https://github.com/sanctuary-stream/sanctuary-stream/releases

# 5. Test on all platforms
```

---

**Ready? Just push to main! 🚀**

```bash
git push origin main
```

**Everything deploys automatically. No manual steps required.**
