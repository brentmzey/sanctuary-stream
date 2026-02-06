# 🚀 Quick Start Guide

Get Sanctuary Stream running in minutes.

---

## 🎯 Deploy Everything (One Command)

```bash
./scripts/build-test-deploy.sh --version v0.1.1
```

**This single command will:**
1. ✅ Run all tests (linting, type checking, unit tests)
2. ✅ Verify platform support (24 automated checks)
3. ✅ Build frontend locally
4. ✅ Commit and push changes to GitHub
5. ✅ Create release tag
6. ✅ Trigger GitHub Actions
7. ✅ Build all 6 platforms in parallel (~20 minutes)
8. ✅ Create public release with binaries
9. ✅ Deploy web app to Vercel

**Total time:** ~25-30 minutes from start to finish.

---

## 🧪 Test Only

```bash
./scripts/build-test-deploy.sh --skip-build --skip-deploy
```

Runs all tests without building or deploying.

---

## 🏗️ Build Locally

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

After GitHub Actions completes (~20 minutes):

**Public downloads (no account needed):**
https://github.com/brentmzey/sanctuary-stream/releases

- 🍎 macOS: `Sanctuary-Stream-universal.dmg`
- 🪟 Windows: `Sanctuary-Stream-x64.msi`
- 🐧 Linux: `sanctuary-stream_amd64.deb` or `.AppImage`
- 📱 iOS: `Sanctuary-Stream.ipa`
- 🤖 Android: `sanctuary-stream-release.apk`
- 🌐 Web: https://sanctuary-stream.vercel.app

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

- **Complete Guide:** [docs/BUILD_DEPLOY_GUIDE.md](docs/BUILD_DEPLOY_GUIDE.md)
- **Platform Details:** [docs/PLATFORM_SUPPORT.md](docs/PLATFORM_SUPPORT.md)
- **User Guide:** [docs/USER_GUIDE.md](docs/USER_GUIDE.md)
- **Status Report:** [PLATFORM_STATUS.md](PLATFORM_STATUS.md)

---

## 🆘 Need Help?

- **Troubleshooting:** See [docs/BUILD_DEPLOY_GUIDE.md](docs/BUILD_DEPLOY_GUIDE.md#-troubleshooting)
- **GitHub Issues:** https://github.com/brentmzey/sanctuary-stream/issues
- **GitHub Actions:** https://github.com/brentmzey/sanctuary-stream/actions

---

**Ready? Let's go! 🚀**

```bash
./scripts/build-test-deploy.sh --version v0.1.1
```
