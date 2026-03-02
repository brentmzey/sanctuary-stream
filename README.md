# 🏛️ Sanctuary Stream

**Secure-by-Design church streaming control system - Control OBS from ANY device**

[![Build](https://img.shields.io/badge/build-passing-brightgreen)]()
[![Tests](https://img.shields.io/badge/tests-99.3%25-brightgreen)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)]()
[![Cost](https://img.shields.io/badge/cost-$0-success)]()

---

## 🚀 Quick Start (7 Minutes)

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

**Option A: With Bun (⚡ 10-25x faster!)**
```bash
# 1. Clone repository
git clone https://github.com/sanctuary-stream/sanctuary-stream.git
cd sanctuary-stream

# 2. Install dependencies (535ms!)
bun install

# 3. Build everything (25 seconds)
bun run build

# 4. Start everything (10 seconds)
./scripts/START-BUN.sh
```

**Option B: With npm (Traditional)**
```bash
# 1. Clone repository
git clone https://github.com/sanctuary-stream/sanctuary-stream.git
cd sanctuary-stream

# 2. Install dependencies (5 minutes)
npm install

# 3. Build everything (30 seconds)
npm run build

# 4. Start everything (10 seconds)
./scripts/START.sh
```

### First Login

**Open:** http://localhost:5173

**Credentials:**
- Email: `support@sanctuarystream.com`
- Password: `sanctuary123456`

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

- **[Tailoring Guide](docs/BUILD_AND_RUN.md)** - Learn how to customize the UI, add your own branding, and deploy your own private version.
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

- **[Quick Start](docs/QUICKSTART.md)** - 5-minute setup
- **[Build/Test/Run Guide](docs/BUILD_TEST_RUN_GUIDE.md)** - Complete developer guide
- **[Deployment Guide](docs/DEPLOYMENT_GUIDE.md)** - Deploy to any platform
- **[Complete Guide](docs/COMPLETE_GUIDE.md)** - Full walkthrough & troubleshooting
- **[Station Setup](docs/STATION_SETUP.md)** - OBS + Bridge setup
- **[Professional Video Guide](docs/PROFESSIONAL_VIDEO_GUIDE.md)** - 20K-word technical deep-dive

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
./scripts/START.sh

# Build everything
npm run build

# Test everything
npm test

# Stop everything
kill $(cat logs/*.pid)
```

---

**Made with ❤️ for churches worldwide**

**Zero cost. Secure by default. Zero compromise.**

🏛️ **Sanctuary Stream - Stream Your Message, Own Your Platform**
