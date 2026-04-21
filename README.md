# ⛪ Sanctuary Stream

**The Zero-Trust, High-Performance Control System for OBS Studio.**  
*Built with concurrent Rust for zero-latency church production—Control your service from ANY device.*

[![Latest Release](https://img.shields.io/github/v/release/brentmzey/sanctuary-stream?color=green&label=Latest%20Release&style=flat-square)](https://github.com/brentmzey/sanctuary-stream/releases/latest)
[![Build Status](https://img.shields.io/github/actions/workflow/status/brentmzey/sanctuary-stream/build-release.yml?branch=main&label=Build%20%26%20Release&style=flat-square)](https://github.com/brentmzey/sanctuary-stream/actions/workflows/build-release.yml)
[![Rust](https://img.shields.io/badge/Rust-monadic-orange?style=flat-square&logo=rust)](https://www.rust-lang.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue?style=flat-square)](https://www.typescriptlang.org/)

---

## 🏗️ Architecture: The Three Pillars

Sanctuary Stream is an ecosystem designed for maximum reliability and minimum latency during live worship.

### 1. 🧠 The Brain (PocketBase)
The secure orchestration layer. It handles multi-tenant authentication, liturgical content, and command queuing.
- **Backend:** PocketBase (Golang)
- **Deployment:** [PocketHost.io](https://pockethost.io) or self-hosted.

### 2. 🫀 The Heart (Native Rust Bridge)
The high-performance hardware controller. It runs on your streaming machine, listening to the Brain and executing commands on OBS with microsecond precision.
- **Core:** Concurrent Rust (using `obws` and `tokio`).
- **Binary Targets:** macOS (Universal), Windows (x64), Linux.

### 3. 📱 The Hands (Remote Control Apps)
A premium, VMix-inspired production switcher for your volunteers. Control scenes, audio levels, and overlays from any tablet, phone, or laptop.
- **Frontend:** React + TailwindCSS.
- **Native Targets:** iOS, Android (Capacitor), Desktop (Tauri).

---

## 🎛️ VMix-Style Production Switcher

Sanctuary Stream features a professional-grade production interface accessible from any browser or native app:
- **Dual Monitor Panes**: Preview and Program monitors with live status badges.
- **Visual T-Bar**: Smooth, staged transitions for high-impact visual changes.
- **Real-time Audio Mixer**: Full channel strips with faders and VU meters.
- **Overlay Manager**: 8-slot bank for lower-thirds, announcements, and liturgy.

---

## 🚀 Quick Start

### 🌟 For Church Leads (No-Code)
1. **Download:** Get the latest installer for your OS from [Releases](https://github.com/brentmzey/sanctuary-stream/releases).
2. **Install:** Run the setup and sign in with your parish email.
3. **Configure:** Connect to your local OBS instance via the settings gear.
4. **Go Live!**

### 💻 For Developers (The Monadic Stack)
We use `just` for a unified DX. **Bun** is recommended for faster execution.

```bash
# Clone & Enter
git clone https://github.com/brentmzey/sanctuary-stream.git
cd sanctuary-stream

# Universal Setup (DB, Node, Rust)
just setup

# Launch Full Monadic Stack
just dev
```

---

## 📖 In-Depth Documentation

- [**🏗️ Architecture & Flow**](docs/ARCHITECTURE.md) - How commands travel from remote to hardware.
- [**💻 Developer Guide**](CONTRIBUTING.md) - Functional programming patterns and monadic error handling.
- [**🔒 Security & Privacy**](agents.md) - Bot policies and zero-trust design.

---

**Made with ❤️ for churches worldwide by [Brent Zey](https://brentzey.com)**
