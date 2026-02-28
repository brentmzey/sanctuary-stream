# ⛪ Sanctuary Stream

**Zero-trust church streaming control system with real-time remote management.**

---

## 🚨 [INSTALLER & ADMIN: CLICK HERE FOR THE STEP-BY-STEP SETUP GUIDE](./docs/ADMIN_SETUP.md) 🚨

---

Sanctuary Stream provides a secure, reliable way for church media teams to manage OBS and streaming services remotely. Built with a "zero-trust" architecture, it ensures that only authorized personnel can control the broadcast.

---

## 🚀 Quick Start (Local Development)

### 1. Setup Environment
```bash
./scripts/setup.sh
```

### 2. Launch Services (Choose one)
- **iTerm2 (macOS):** `./scripts/dev-iterm.scpt` (Best for tabs)
- **Standard:** `npm run dev:full` (Best for single-terminal logs)
- **tmux:** `./scripts/dev-tmux.sh` (Best for persistent sessions)

### 3. Verify
Open [http://localhost:5173](http://localhost:5173) and login with:
- **Email:** `admin@local.dev`
- **Password:** `admin123456`

---

## 🛠️ Key Documentation

| Document | Purpose |
| :--- | :--- |
| **[CHANGELOG.md](./CHANGELOG.md)** | Track all versions and RC releases. |
| **[SRVDD.md](./docs/SRVDD.md)** | Service Runtime & Visual Design (Mermaid Architecture). |
| **[DIBR.md](./DIBR.md)** | Deployment, Installation, Backout, and Rollback Guide. |
| **[agents.md](./agents.md)** | AI & Bot interaction policy. |
| **[USER_GUIDE.md](./docs/USER_GUIDE.md)** | Detailed instructions for church volunteers. |

---

## 🏷️ Release & Build Strategy

We follow a strict release lifecycle to ensure stability:
- **Builds:** `x.xx.<epochMillis>` (e.g., `0.1.1770200000000`)
- **Release Candidates:** `x.xx.xx-RCx` (e.g., `0.1.0-RC1`)
- **Final Release:** `x.xx.xx` (e.g., `0.1.0`)

---

## 🛡️ Security Policy

Sanctuary Stream utilizes a command-queue pattern. No direct connections are made between the control app and the broadcast machine (OBS). All actions are mediated through an encrypted PocketBase instance.

## 📄 License
MIT License. See [LICENSE](./LICENSE) for details.
