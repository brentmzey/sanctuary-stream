# 🏛️ Sanctuary Stream

**Secure-by-Design church streaming control system - Control OBS from ANY device**

[![Latest Release](https://img.shields.io/github/v/release/brentmzey/sanctuary-stream?color=green&label=Latest%20Release)](https://github.com/brentmzey/sanctuary-stream/releases/latest)
[![Build and Release](https://github.com/brentmzey/sanctuary-stream/actions/workflows/build-release.yml/badge.svg)](https://github.com/brentmzey/sanctuary-stream/actions/workflows/build-release.yml)
[![Tests Status](https://github.com/brentmzey/sanctuary-stream/actions/workflows/ci.yml/badge.svg)](https://github.com/brentmzey/sanctuary-stream/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org/)

---

## 🚀 Latest Stable Releases (TRUE Releases)

For a ready-to-use version of Sanctuary Stream, download the official artifacts for your platform:

| Platform | Installer | Notes |
| :--- | :--- | :--- |
| **Windows** | [Download .msi](https://github.com/brentmzey/sanctuary-stream/releases/latest) | Installer with auto-update |
| **macOS** | [Download .dmg (Universal)](https://github.com/brentmzey/sanctuary-stream/releases/latest) | Intel & Apple Silicon support |
| **Linux** | [Download .AppImage / .deb](https://github.com/brentmzey/sanctuary-stream/releases/latest) | Universal Linux Support |
| **Android** | [Download .apk](https://github.com/brentmzey/sanctuary-stream/releases/latest) | Sideload to your control tablet |

> **💡 Looking for development builds?** See all [Nightly Releases](https://github.com/brentmzey/sanctuary-stream/releases).

---

## 📖 Quick Start & Installation Paths

Sanctuary Stream is designed for two distinct audiences. Choose the path that fits your technical comfort level:

### 🌟 Path A: The "No-Code" Default (For Parishes & Volunteers)
**Best for:** Churches that want a ready-to-use, secure streaming controller without touching code.

**One-Command Install (macOS/Linux):**
```bash
curl -sSL https://raw.githubusercontent.com/brentmzey/sanctuary-stream/main/install.sh | bash
```

**Manual Download:**
1. **Download:** Go to the [Releases page](https://github.com/brentmzey/sanctuary-stream/releases) and download the pre-compiled executable for your platform.
2. **Configure:** Place a simple `config.json` next to the bridge to link it to your PocketBase instance.
3. **Stream:** Open the app on your iPad or PC and start streaming!

👉 **[Read the Full No-Code Guide](docs/SUPER_USER_CONFIGURATION.md)**

### 💻 Path B: The "SDK" & Developer Path
**Best for:** Contributors and ministries building bespoke streaming setups.

👉 **[Read the Developer Documentation](BUILD_TEST_RUN.md)** or follow the quickstart below:

#### Installation

```bash
# 1. Clone repository
git clone https://github.com/brentmzey/sanctuary-stream.git
cd sanctuary-stream
```

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

- ✅ Start/stop streaming with one click
- ✅ Real-time status & health monitoring
- ✅ Professional video quality presets
- ✅ Secure-by-Design architecture
- ✅ Multi-platform support (Desktop, Mobile, Web)

---

**Made with ❤️ for churches worldwide**
