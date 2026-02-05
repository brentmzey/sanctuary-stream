# Sanctuary Stream

**Zero-Trust Church Streaming Control System**

[![Build Status](https://github.com/brentmzey/sanctuary-stream/workflows/Build%20and%20Release/badge.svg)](https://github.com/brentmzey/sanctuary-stream/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Remote control for OBS Studio. Built with Tauri + Rust. Runs everywhere.

---

## 🚀 Quick Start

```bash
# 1. Clone and install
git clone git@github.com:brentmzey/sanctuary-stream.git
cd sanctuary-stream
npm install

# 2. Configure
export PB_SANCTUARY_STREAM_ADMIN_PASSWORD_LOCAL="admin123456"

# 3. Setup
npm run setup

# 4. Run
npm run dev
```

**Access:** http://localhost:5173  
**Login:** `pastor@local.dev` / `pastor123456`

**📖 Full guide:** [docs/QUICKSTART.md](./docs/QUICKSTART.md)

---

## 🎥 Video & Audio Quality

**Professional streaming with free, open-source software:**

### Video
- ✅ **1080p @ 30fps** - Recommended for churches
- ✅ **720p @ 30fps** - Lower bandwidth option
- ✅ **4K @ 60fps** - Ultra HD (if bandwidth permits)
- ✅ **Hardware encoding** - GPU-accelerated (NVENC, AMD, QuickSync)

### Audio
- ✅ **48 kHz sample rate** - Broadcast standard
- ✅ **AAC codec** - Best compatibility
- ✅ **Stereo/Mono** - Your choice
- ✅ **160-320 kbps** - Professional quality

### Integration
- ✅ **OBS Studio** - Industry-standard free software
- ✅ **All platforms** - YouTube, Facebook, custom RTMP
- ✅ **Multi-streaming** - Broadcast to multiple platforms simultaneously
- ✅ **100% Free** - No subscriptions, no hidden costs

**📖 Complete guide:** [docs/OBS_INTEGRATION.md](./docs/OBS_INTEGRATION.md)

---

## 📥 Installation (For End Users)

**Download pre-built apps:**

### Desktop
- 🍎 [macOS (Universal)](https://github.com/brentmzey/sanctuary-stream/releases/latest) - Intel & Apple Silicon
- 🪟 [Windows 10/11](https://github.com/brentmzey/sanctuary-stream/releases/latest) - MSI Installer
- 🐧 [Linux](https://github.com/brentmzey/sanctuary-stream/releases/latest) - DEB & AppImage

### Mobile
- 📱 **iOS** - Coming to App Store
- 🤖 **Android** - Coming to Google Play

### Web
- 🌐 **Progressive Web App** - [sanctuary-stream.vercel.app](https://sanctuary-stream.vercel.app)

**📖 Complete guide:** [docs/USER_GUIDE.md](./docs/USER_GUIDE.md)

---

## 📱 Platforms Supported

| Platform | Status | Type |
|----------|--------|------|
| macOS (Universal) | ✅ | Desktop |
| Windows (10/11) | ✅ | Desktop |
| Linux (Ubuntu/Debian/etc) | ✅ | Desktop |
| iOS (13.0+) | ✅ | Mobile |
| Android (7.0+) | ✅ | Mobile |
| Web (All browsers) | ✅ | PWA |

**One codebase. Six platforms.**

---

## ✨ Features

### 🎥 Professional Streaming
- ✅ **HD/4K Video** - 1080p @ 30fps (or 4K with bandwidth)
- ✅ **Broadcast Audio** - 48 kHz, AAC codec, professional quality
- ✅ **OBS Studio Integration** - Industry-standard free software
- ✅ **Multi-platform** - YouTube, Facebook, anywhere
- ✅ **Free Forever** - Open source, no subscriptions

### 🎛️ Remote Control
- ✅ **Remote OBS Control** - Start/stop streaming from anywhere
- ✅ **Real-Time Sync** - All devices stay synchronized
- ✅ **Multi-User** - Admin, pastor, tech roles
- ✅ **Multi-Device** - Desktop, mobile, web

### 🔒 Technical Excellence
- ✅ **Secure** - Memory-safe Rust backend
- ✅ **Fast** - 50-80 MB RAM, 5-10 MB binary
- ✅ **Functional** - Pure functions, immutable data
- ✅ **Type-Safe** - Strict TypeScript + Rust

---

## 🏗️ Architecture

```
React + TypeScript (Frontend)
         ↓
  Tauri + Rust (Backend)
         ↓
  PocketBase (Database)
         ↓
OBS WebSocket (Bridge)
```

**Principles:**
- Pure functions
- Immutable data
- Type safety
- Zero side effects

---

## 📚 Documentation

**Essential Guides:** (in [`./docs`](./docs))

### For Users
- [QUICKSTART.md](./docs/QUICKSTART.md) - 5-minute setup
- [USER_GUIDE.md](./docs/USER_GUIDE.md) - Complete installation & OBS setup

### For Developers
- [FUNCTIONAL_STYLE.md](./docs/FUNCTIONAL_STYLE.md) - ⚠️ **REQUIRED READING**
- [BUILD_AND_RUN.md](./docs/BUILD_AND_RUN.md) - Development guide

### For DevOps
- [CI_CD_SUMMARY.md](./docs/CI_CD_SUMMARY.md) - Automated builds
- [GITHUB_SETUP.md](./docs/GITHUB_SETUP.md) - Repository setup

**See [docs/README.md](./docs/README.md) for complete index**

---

## 🛠️ Tech Stack

- **Frontend:** React 18 + TypeScript 5 + Vite 7 + Tailwind CSS
- **Backend:** Rust + Tauri 1.6 + Tokio
- **Database:** PocketBase (SQLite + Realtime)
- **Bridge:** Node.js + OBS WebSocket

---

## 🚀 Build & Deploy

```bash
# Development
npm run dev              # All services
npm run tauri:dev        # Desktop app

# Build
npm run build            # Web
npm run tauri:build:mac  # macOS
npm run tauri:build:win  # Windows
npm run tauri:build:linux # Linux

# CI/CD (Automated)
git tag v1.0.0
git push origin v1.0.0
# → Builds all platforms automatically
```

**📖 CI/CD Guide:** [docs/CI_CD_SUMMARY.md](./docs/CI_CD_SUMMARY.md)

---

## 🤝 Contributing

1. Read [docs/FUNCTIONAL_STYLE.md](./docs/FUNCTIONAL_STYLE.md) - **REQUIRED**
2. Fork repository
3. Create feature branch
4. Write pure functional code
5. Run `npm run validate`
6. Submit PR

**See [CONTRIBUTING.md](./CONTRIBUTING.md) for details**

---

## 📄 License

MIT License - Free for any purpose

See [LICENSE](./LICENSE) for details

---

## 🆘 Support

- 📖 [Documentation](./docs)
- 🐛 [Issues](https://github.com/brentmzey/sanctuary-stream/issues)
- 💬 [Discussions](https://github.com/brentmzey/sanctuary-stream/discussions)

---

## 🙏 Credits

Built with ❤️ for churches worldwide

**Technologies:** [Tauri](https://tauri.app/) • [Rust](https://rust-lang.org/) • [React](https://react.dev/) • [PocketBase](https://pocketbase.io/)

---

**⭐ Star this repo if you find it useful!**

**🚀 Built for churches. Universal platforms. Functional programming.**
