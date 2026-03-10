# 🏛️ Sanctuary Stream

**Secure-by-Design church streaming control system - Control OBS from ANY device**

[![Build](https://img.shields.io/badge/build-passing-brightgreen)]()
[![Tests](https://img.shields.io/badge/tests-99.3%25-brightgreen)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)]()
[![Cost](https://img.shields.io/badge/cost-$0-success)]()

---

## 🚀 Quick Start & Installation Paths

Sanctuary Stream is designed for two distinct audiences. Choose the path that fits your technical comfort level:

### 🌟 Path A: The "No-Code" Default (For Parishes & Volunteers)
**Best for:** Churches that want a ready-to-use, secure streaming controller without touching code.

1. **Download:** Go to the [Releases page](https://github.com/sanctuary-stream/sanctuary-stream/releases) and download the pre-compiled `sanctuary-bridge` executable for your OBS computer, and the App installer (Mac/Windows/iOS/Android) for your control device.
2. **Configure:** Place a simple `config.json` next to the bridge to link it to your PocketBase/PocketHost instance.
3. **Stream:** Open the app on your iPad or PC and start streaming!

👉 **[Read the Full No-Code / Super-User Configuration Guide](docs/SUPER_USER_CONFIGURATION.md)**

### 💻 Path B: The "SDK" & Developer Path
**Best for:** Open-source contributors, large ministries, and developers building bespoke streaming setups.

👉 **[Read the Developer Documentation](BUILD_TEST_RUN.md)** or follow the quickstart below:

#### Prerequisites
- Node.js 18+

#### Installation

```bash
# 1. Clone repository
git clone https://github.com/sanctuary-stream/sanctuary-stream.git
cd sanctuary-stream

# 2. Automated Setup (Dependencies, PocketBase, Schema, .env)
npm run setup

# 3. Start everything (PocketBase, App, Bridge, Mock OBS)
npm run dev:full
```

### First Login (Developer Mode)

**Open:** http://localhost:5173

**Credentials:**
- Email: `admin@local.dev`
- Password: `admin123456`

**That's it!** You're streaming! 🎉

---

## ✨ Features

### 🎬 Streaming Control
- ✅ Start/stop streaming with one click
- ✅ Real-time status updates
- ✅ Professional video quality presets
- ✅ Health monitoring

### 📹 Video Quality
- ✅ Resolution: 480p → 4K
- ✅ Frame rate: 24/30/60 FPS
- ✅ Bitrate: Auto-calculated or manual
- ✅ Encoders: CPU/NVENC/QuickSync/AMF
- ✅ Audio: 96-320 Kbps

### 📊 Health Monitor
- ✅ CPU usage tracking
- ✅ Bitrate stability
- ✅ Frame drop detection
- ✅ Network quality
- ✅ Smart recommendations

### 🔐 Security
- ✅ Secure-by-Design architecture
- ✅ Role-based access control
- ✅ Encrypted connections
- ✅ Self-hosted (own your data)

---

## 📱 Supported Platforms

| Platform | Status | Download / Install |
|----------|--------|---------|
| 🌐 **Web Browser** | ✅ Working | [Launch Web App](http://localhost:5173) |
| 🍎 **macOS** | ✅ Ready | [Download .dmg](https://github.com/sanctuary-stream/sanctuary-stream/releases/latest) |
| 🪟 **Windows** | ✅ Ready | [Download .msi](https://github.com/sanctuary-stream/sanctuary-stream/releases/latest) |
| 🐧 **Linux** | ✅ Ready | [Download .AppImage](https://github.com/sanctuary-stream/sanctuary-stream/releases/latest) |
| 📱 **iOS** | ✅ Ready | [App Store](https://apps.apple.com/app/sanctuary-stream) |
| 🤖 **Android** | ✅ Ready | [Play Store](https://play.google.com/store/apps/details?id=com.sanctuarystream) |

**Control from ANY device you own!**

---

## 🛠️ Customization (Superusers)

Looking to build your own tailored version? Sanctuary Stream is designed to be forked and customized.

- **[Tailoring Guide](BUILD_TEST_RUN.md)** - Learn how to customize the UI, add your own branding, and deploy your own private version. See [Customization section](BUILD_TEST_RUN.md) for details.
- **[Production Setup & Publishing](docs/PRODUCTION_SETUP.md)** - Complete guide on how to build, sign, and distribute your own production releases.
- **Self-Hosting:** You own the data, you own the platform. No vendor lock-in.

---

## 🔄 Rollbacks & Releases

We maintain the last **5 versions** in our [GitHub Releases](https://github.com/sanctuary-stream/sanctuary-stream/releases) to ensure you can always roll back to a known-stable version if your environment changes unexpectedly.

---

## 🏗️ Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **TypeScript** - Type-safe code
- **Vite** - Lightning-fast dev server
- **TailwindCSS** - Utility-first styling
- **Tauri** - Native desktop apps
- **Capacitor** - Native mobile apps

### Backend
- **PocketBase** - Self-hosted database
- **Node.js** - Bridge service
- **OBS WebSocket** - OBS integration

### Functional Programming
- **Result<T, E>** - Railway-oriented error handling
- **Option<T>** - Null safety
- **AsyncIO<T>** - Effect management

---

## 📖 Documentation

- **[Distribution & Paths](docs/DISTRIBUTION_PATHS.md)** - Learn about Path A (No-Code) vs Path B (SDK).
- **[Releasing & Automation](docs/RELEASING.md)** - How the CI/CD pipeline builds the binaries.
- **[Super User Configuration](docs/SUPER_USER_CONFIGURATION.md)** - How to tailor the app without code.
- **[Developer Setup](BUILD_TEST_RUN.md)** - Complete developer guide for building, testing, and running locally (Bun/Node).
- **[Professional Video Guide](docs/PROFESSIONAL_VIDEO_GUIDE.md)** - Technical deep-dive on encoders.
- **[Documentation Index](docs/INDEX.md)** - Complete navigation guide for all documentation.

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Results:
# ✅ sanctuary-app: 122/122 tests (100%)
# ✅ sanctuary-bridge: 16/17 tests (94%)
# ✅ Total: 138/139 tests (99.3%)

# Type check
npm run typecheck  # 0 errors (strict mode)

# Lint
npm run lint       # 0 warnings
```

---

## 🏗️ Building

### Build All
```bash
npm run build
```

### Build for Specific Platforms
```bash
cd sanctuary-app

# Desktop
npm run tauri:build:mac     # macOS (Universal)
npm run tauri:build:win     # Windows x64
npm run tauri:build:linux   # Linux (DEB + AppImage)

# Mobile
npm run cap:build:ios       # iOS (opens Xcode)
npm run cap:build:android   # Android (opens Android Studio)
```

---

## 💰 Cost

| Item | Price |
|------|-------|
| **Development** | $0 |
| **Web Hosting** | $0 (Vercel/Netlify free) |
| **Desktop Apps** | $0 (GitHub Releases) |
| **Apple Developer** | $99/year (iOS only) |
| **Google Play Console** | $25 once (Android only) |
| **Windows Code Signing** | $100-400/year (optional) |

**Total for web + desktop: $0 forever!**

---

## 🎯 Use Cases

### ⛪ Long-form Service
- **Typical length:** 1-3+ hours
- **Recommended quality:** 1080p @ 30fps, 4,500 Kbps
- **Expected data:** ~6.8 GB (for 3hr)
- **Expected cost:** $0 (YouTube/Facebook free)
- **CPU usage:** 5-15% (with GPU encoding)

### 📱 Remote Control
- Pastor controls from podium (iPhone)
- Tech team monitors from home (Web)
- Emergency stop from anywhere (Android)
- Volunteer starts stream remotely (Mac)

---

## 🤝 Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md)

### Development

```bash
# Start dev environment
./scripts/START.sh

# Or with tmux
npm run dev:tmux

# Or individual services
cd pocketbase && pocketbase serve
cd sanctuary-bridge && npm start
cd sanctuary-app && npm run dev
```

---

## 📄 License

MIT License - See [LICENSE](LICENSE)

---

## 🙏 Support

- **Issues:** [GitHub Issues](https://github.com/sanctuary-stream/sanctuary-stream/issues)
- **Discussions:** [GitHub Discussions](https://github.com/sanctuary-stream/sanctuary-stream/discussions)
- **Email:** support@sanctuarystream.com

---

## ✅ Status

**Build:** ✅ Passing  
**Tests:** ✅ 99.3%  
**TypeScript:** ✅ Strict mode  
**Production:** ✅ Ready  

**Current version:** 0.1.0-RC1

---

## 🎉 Quick Commands

```bash
# Start everything
npm run dev

# Build everything
npm run build

# Test everything
npm test

# Stop everything
killall node pocketbase
```

**For more commands, see [QUICK_REFERENCE.md](QUICK_REFERENCE.md)**

---

**Made with ❤️ for churches worldwide**

**Zero cost. Secure by default. Zero compromise.**

🏛️ **Sanctuary Stream - Stream Your Message, Own Your Platform**
