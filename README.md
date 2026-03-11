# 🏛️ Sanctuary Stream

**Secure-by-Design church streaming control system - Control OBS from ANY device**

[![Build and Release](https://github.com/brentmzey/sanctuary-stream/actions/workflows/build-release.yml/badge.svg)](https://github.com/brentmzey/sanctuary-stream/actions/workflows/build-release.yml)
[![Tests](https://img.shields.io/badge/tests-passing-brightgreen)](https://github.com/brentmzey/sanctuary-stream/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org/)
[![Cost](https://img.shields.io/badge/cost-$0-success)]()

---

## 🚀 Quick Start & Installation Paths

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
