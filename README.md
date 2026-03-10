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

1. **Download:** Go to the [Releases page](https://github.com/sanctuary-stream/sanctuary-stream/releases) and download the pre-compiled executable for your platform.
2. **Configure:** Place a simple `config.json` next to the bridge to link it to your PocketBase instance.
3. **Stream:** Open the app on your iPad or PC and start streaming!

👉 **[Read the Full No-Code Guide](docs/SUPER_USER_CONFIGURATION.md)**

### 💻 Path B: The "SDK" & Developer Path
**Best for:** Contributors and ministries building bespoke streaming setups.

👉 **[Read the Developer Documentation](BUILD_TEST_RUN.md)** or follow the quickstart below:

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

- ✅ Start/stop streaming with one click
- ✅ Real-time status & health monitoring
- ✅ Professional video quality presets
- ✅ Secure-by-Design architecture
- ✅ Multi-platform support (Desktop, Mobile, Web)

---

**Made with ❤️ for churches worldwide**
