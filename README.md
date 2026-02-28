# ⛪ Sanctuary Stream

[![Build and Release](https://github.com/brentmzey/sanctuary-stream/actions/workflows/build-release.yml/badge.svg)](https://github.com/brentmzey/sanctuary-stream/actions/workflows/build-release.yml)
[![Platform Support](https://img.shields.io/badge/platform-macOS%20|%20Windows%20|%20Linux%20|%20iOS%20|%20Android-blue.svg)](#-platform-support)
[![Built with Rust](https://img.shields.io/badge/built%20with-Rust-brown.svg)](https://www.rust-lang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Zero-trust church streaming control system with a high-performance Rust engine.**

Sanctuary Stream provides a secure, reliable way for church media teams to manage OBS and streaming services remotely. Built with a "zero-trust" architecture, it ensures that only authorized personnel can control the broadcast from any device, anywhere.

---

## 🚀 Get Started Now

### 📥 Download Latest Installers
| Platform | Installer | Version |
| :--- | :--- | :--- |
| **macOS** | [Download .dmg](https://github.com/brentmzey/sanctuary-stream/releases/latest) | `v0.1.0-RC2` |
| **Windows** | [Download .msi](https://github.com/brentmzey/sanctuary-stream/releases/latest) | `v0.1.0-RC2` |
| **Linux** | [Download .deb](https://github.com/brentmzey/sanctuary-stream/releases/latest) | `v0.1.0-RC2` |
| **Mobile** | [iOS & Android Guides](./docs/INSTALLATION_DISTRIBUTION.md#mobile-installation) | `Coming Soon` |

### 🚨 [ADMIN: STEP-BY-STEP SETUP GUIDE](./docs/ADMIN_SETUP.md) 🚨
*New to the tech booth? Start here to set up your Station and Remote App.*

---

## 🏛️ High-Performance Architecture

The system has been fully migrated to a **Rust-based core**, providing industry-leading stability for live environments.

- **Rust Station Engine:** ~12MB idle memory, instant startup, and native OBS integration.
- **Zero-Trust Bridge:** No direct open ports. Commands are mediated through an encrypted PocketBase queue.
- **Multi-Cloud Sync:** Automatic recording uploads to Google Drive and real-time health metrics.
- **Universal Remote:** A beautiful, responsive React dashboard that runs on Web, iOS, and Android.

---

## 🛠️ Key Documentation

| Document | Purpose |
| :--- | :--- |
| **[Station Setup](./docs/STATION_SETUP.md)** | **Crucial:** How to configure the streaming computer (OBS + Rust Bridge). |
| **[User Guide](./docs/USER_GUIDE.md)** | Instructions for church volunteers and media teams. |
| **[SRVDD.md](./docs/SRVDD.md)** | Detailed architecture diagrams and design patterns. |
| **[DIBR.md](./DIBR.md)** | Deployment, Installation, Backout, and Rollback Guide. |
| **[CHANGELOG.md](./CHANGELOG.md)** | Track all versions and RC releases. |

---

## 💻 Developer Setup

If you want to contribute or build from source:

### 1. Requirements
- [Rust](https://rustup.rs/) (Stable)
- [Node.js](https://nodejs.org/) (v18+)
- [PocketBase](https://pocketbase.io/) (Included in `./pocketbase/local`)

### 2. Initialization
```bash
./scripts/setup.sh
```

### 3. Launch (Dev Mode)
- **Unified Dev:** `npm run dev:full`
- **Tauri UI:** `cd sanctuary-app && npm run tauri dev`

---

## 🛡️ Security & Reliability
- **Command Queue Pattern:** Prevents unauthorized direct access to OBS.
- **JWT Authentication:** Secure login for all technical staff.
- **Real-time Heartbeats:** Monitor the health of your streaming station from your phone.

## 📄 License
MIT License. Built with ❤️ for churches everywhere.
