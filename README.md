# ⛪ Sanctuary Stream

**Secure-by-Design church streaming control system — Control OBS from ANY device with native Rust performance.**

[![Latest Release](https://img.shields.io/github/v/release/brentmzey/sanctuary-stream?color=green&label=Latest%20Release&style=flat-square)](https://github.com/brentmzey/sanctuary-stream/releases/latest)
[![Build Status](https://img.shields.io/github/actions/workflow/status/brentmzey/sanctuary-stream/build-release.yml?branch=main&label=Build%20%26%20Release&style=flat-square)](https://github.com/brentmzey/sanctuary-stream/actions/workflows/build-release.yml)
[![Rust](https://img.shields.io/badge/Rust-monadic-orange?style=flat-square&logo=rust)](https://www.rust-lang.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue?style=flat-square)](https://www.typescriptlang.org/)

---

## 🚀 Native Multi-Platform Support

Sanctuary Stream 0.4.0 is built on a **"Rust-First" architecture**, moving the heavy lifting (networking, concurrency, and safety) into a shared native core.

| Platform | Installer | Architecture |
| :--- | :--- | :--- |
| **Windows** | [Download .msi](https://github.com/brentmzey/sanctuary-stream/releases/latest) | Native x64 |
| **macOS** | [Download .dmg](https://github.com/brentmzey/sanctuary-stream/releases/latest) | Universal (Intel & Apple Silicon) |
| **Linux** | [Download .AppImage](https://github.com/brentmzey/sanctuary-stream/releases/latest) | Native x64 |
| **CLI/Bridge** | [Download Binary](https://github.com/brentmzey/sanctuary-stream/releases/latest) | Native Rust (Win/Mac/Linux) |

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
