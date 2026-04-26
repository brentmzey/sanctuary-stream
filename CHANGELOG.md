# 📋 CHANGELOG - Sanctuary Stream

All notable changes to this project will be documented in this file.
The project follows **RC-based release naming** (x.xx.xx-RCx) until ready for full release.

---

## [Unreleased]
### 🔧 Fixed
- **Core:** Resolved Rust formatting issues (`cargo fmt`) that prevented automated setups from completing successfully.
- **Core:** Fixed a `clippy` `collapsible-match` warning in `sanctuary-core/src/bridge.rs` during setup pipeline linting.


## [0.3.1] - 2026-03-14
### ✨ Added
- **Test Coverage:** Achieved 99.5% line coverage for `sanctuary-bridge` and 95.5% for `sanctuary-app`.
- **Infrastructure:** Added standalone `sanctuary-bridge` executable builds for Windows, macOS, and Linux to GitHub Actions.
- **Verification:** New `acid-test.js` for full end-to-end command flow validation (PB -> Bridge -> OBS -> PB).
- **Mobile:** Verified iOS build compatibility via Capacitor and successful compilation for iPhone simulator.
- **Diagnostics:** New `scripts/verify-platform-support.sh` and `docs/ONBOARDING_AUDIT.md`.

### 🔧 Fixed
- **Database:** Fixed `executed: false` constraint in PocketBase `commands` collection.
- **Bridge:** Improved `config.json` lookup logic for portable executables.
- **Tests:** Forced `NODE_ENV=test` in bridge tests to prevent accidental production interference.
- **CI/CD:** Fixed bridge artifact omission in the `build-release.yml` workflow.

## [0.3.0] - 2026-03-13
### ✨ Added
- **Architecture:** Initial support for 245+ church backends with real-time updates.
- **Tauri:** Added desktop client support for macOS, Windows, and Linux.
- **Capacitor:** Added mobile app support for iOS and Android.

## [0.1.1] - 2026-03-11
### ✨ Added
- **Infrastructure:** Formal 4-step Release Workflow (Feature -> Dev -> Main -> Tag).
- **Automation:** Version bumping in `tauri.conf.json` and all workspace packages via `npm run release`.
- **Docs:** Full RELEASING guide and documentation for production environments.

### 🔧 Fixed
- **Versioning:** Synchronized versions across App, Bridge, and CLI to v0.1.1.
- **CI/CD:** Automated "Full Release" vs "Pre-release" logic based on Git tags.
