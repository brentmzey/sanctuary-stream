# 📋 CHANGELOG - Sanctuary Stream

All notable changes to this project will be documented in this file.
The project follows **RC-based release naming** (x.xx.xx-RCx) until ready for full release.

---

## [0.1.0-RC1] - 2026-02-28
### ✨ Added
- **Infrastructure:** Initial local development automation with `scripts/setup.sh`.
- **Backend:** PocketBase schema initialization with test users and stream records.
- **Bridge:** Sanctuary-bridge implementation for OBS control via PocketBase commands.
- **App:** React-based control panel with stream health monitoring and quality settings.
- **Docs:** Comprehensive documentation suite (INDEX, USER_GUIDE, OBS_INTEGRATION).
- **Automation:** Support for `dev-tmux.sh`, `dev-iterm.scpt`, and `dev-simple.sh`.
- **E2E:** Playwright integration test suite covering login and dashboard verification.

### 🔧 Fixed
- **Env:** Missing `STREAM_ID` and `PB_URL` in local `.env` files.
- **Tauri:** CSP (Content Security Policy) updated for PocketHost cloud connectivity.

## [0.1.1] - 2026-03-11
### ✨ Added
- **Infrastructure:** Formal 4-step Release Workflow (Feature -> Dev -> Main -> Tag).
- **Automation:** Version bumping in `tauri.conf.json` and all workspace packages via `npm run release`.
- **Docs:** Full RELEASING guide and documentation for production environments.

### 🔧 Fixed
- **Versioning:** Synchronized versions across App, Bridge, and CLI to v0.1.1.
- **CI/CD:** Automated "Full Release" vs "Pre-release" logic based on Git tags.
