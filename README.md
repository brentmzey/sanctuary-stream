# ⛪ Sanctuary Stream

**Secure-by-Design church streaming control system — Control OBS from ANY device with native Rust performance.**

[![Latest Release](https://img.shields.io/github/v/release/brentmzey/sanctuary-stream?color=green&label=Latest%20Release&style=flat-square)](https://github.com/brentmzey/sanctuary-stream/releases/latest)
[![Build Status](https://img.shields.io/github/actions/workflow/status/brentmzey/sanctuary-stream/build-release.yml?branch=main&label=Build%20%26%20Release&style=flat-square)](https://github.com/brentmzey/sanctuary-stream/actions/workflows/build-release.yml)
[![Rust](https://img.shields.io/badge/Rust-monadic-orange?style=flat-square&logo=rust)](https://www.rust-lang.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue?style=flat-square)](https://www.typescriptlang.org/)

---

## 🏗️ How it Works: The Three Pillars

Sanctuary Stream is more than just an app; it's a complete ecosystem for secure, low-latency church production.

### 1. 🗄️ The Host (PocketBase)
The "Brain" of your operation. It stores your liturgy, announcements, and stream metadata.
- **Where to run:** Securely on [PocketHost.io](https://pockethost.io) or your own server.
- **Included in:** `backend-config.zip` (for manual setup).

### 2. 🔌 The Bridge (Native CLI)
The "Heart" of your sanctuary. It runs on the same machine as OBS and translates your remote commands into native OBS actions with zero latency.
- **Where to run:** Directly on the OBS computer (Mac/PC/Linux).
- **Download:** `sanctuary-win-x64.exe`, `sanctuary-macos-universal`, or `sanctuary-linux-x64`.

### 3. 📱 The Remote Controls (Tauri/Capacitor)
The "Eyes and Hands" for your volunteers. Native apps for every device that let you control the service from the pulpit, the soundboard, or the back of the room.
- **Downloads:** `.dmg` (Mac), `.msi` (Windows), `.deb/.AppImage` (Linux), `.apk` (Android), and `.ipa` (iOS).

---

## 🚀 Native Multi-Platform Support

| Component | Platform | Primary Download |
| :--- | :--- | :--- |
| **Desktop App** | Windows / Mac / Linux | `.msi` / `.dmg` / `.AppImage` |
| **Mobile App** | Android / iOS | `.apk` / `.ipa` (Internal) |
| **Native Bridge** | Win / Mac / Linux | `sanctuary-cli-*` |
| **Cloud Config** | PocketBase | `backend-config.zip` |

---

## 📖 Quick Start

### 🌟 For Parishes & Volunteers (No-Code)
1. **Download:** Get the latest installer for your OS from the [Releases](https://github.com/brentmzey/sanctuary-stream/releases) page.
2. **Install:** Drag to Applications (Mac) or run the Setup (Windows).
3. **Login:** Enter your church email address. The app will automatically discover your private secure server.
4. **Stream:** One-click to Go Live!

### 💻 For Developers & Tech Leads
We use `just` for a streamlined development experience.

```bash
# 1. Clone & Enter
git clone https://github.com/brentmzey/sanctuary-stream.git
cd sanctuary-stream
```bash
# 2. Automated Setup (Installs DB, Node, Rust components)
just setup

# 3. Start full monadic stack
just dev
```

### 💻 Developer Experience (DX)
Sanctuary Stream provides first-class support for **IntelliJ IDEA Ultimate** and **RustRover**:
- **One-Click Start:** Use the `🚀 Run All` configuration to boot the entire stack.
- **Native Debugging:** Set breakpoints in the Rust core while the UI is running.
- **Full Guide:** [**IDE Setup & Support**](docs/IDE_SETUP.md)

---


## ✨ Why Sanctuary Stream?

*   **⚡ High Performance:** Core logic is written in concurrent Rust for zero-latency OBS control.
*   **🔒 Secure-by-Design:** Monadic error handling and type-safe identifiers prevent common vulnerabilities.
*   **☁️ SaaS Orchestration:** Automatically routes users to parish-specific PocketHost instances.
*   **📱 Multi-Device:** Control your stream from a Desktop PC, an iPad, or a smartphone in real-time.

---

**Made with ❤️ for churches worldwide by [Brent Zey](https://brentzey.com)**

[![Support Me](https://img.shields.io/badge/Support-Me-orange?style=for-the-badge&logo=buymeacoffee)](https://buymeacoffee.com/brentmzey)
