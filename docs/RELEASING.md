# Sanctuary Stream: Release & Distribution Guide

This document explains how to prepare and distribute Sanctuary Stream for both Path A (No-Code Default) and Path B (SDK/Developer).

---

## 1. Preparing Path A: Pre-compiled Binaries

Path A relies on providing ready-to-use binaries for users who don't want to build from source.

### A. Building the OBS Bridge (Desktop Service)
The bridge is a standalone executable that runs on the OBS machine.

1.  **Windows:** `cd sanctuary-bridge && bun run build:exe:windows`
2.  **macOS:** `cd sanctuary-bridge && bun run build:exe`
3.  **Linux:** `cd sanctuary-bridge && bun run build:exe:linux`

**Result:** Single binaries will be created in `sanctuary-bridge/dist/`. 
**Distribution:** Zip the binary with a `config.json.example` and upload to GitHub Releases.

### B. Building the App (Mobile & Desktop UI)
We use Tauri for Desktop and Capacitor for Mobile.

#### Desktop (Tauri)
1.  `cd sanctuary-app`
2.  `bun run tauri:build` (Builds for current OS)
    -   Produces `.msi` / `.exe` on Windows.
    -   Produces `.dmg` / `.app` on macOS.
    -   Produces `.deb` / `.AppImage` on Linux.

#### Mobile (Capacitor)
1.  **Android:** `cd sanctuary-app && bun run cap:build:android`
    -   Requires Android Studio / SDK. Produces a signed `.apk` or `.aab`.
2.  **iOS:** `cd sanctuary-app && bun run cap:ios`
    -   Requires Xcode / macOS. Opens the project in Xcode for archiving to TestFlight/App Store.

---

## 2. Preparing Path B: The Developer SDK

Path B focuses on ensuring the repository is a clean, well-tested framework for developers.

### A. Quality Standards (The 90% Rule)
Before any major version release, ensure the following commands pass:
1.  **Monorepo Test:** `bun run test`
2.  **Coverage Audit:** `bun run test:coverage` (Target: 90% across all modules)
3.  **Linting:** `bun run lint`
4.  **Type Check:** `bun run typecheck`

### B. Schema Export
Ensure the latest PocketBase schema is exported so developers can mirror your database structure instantly.
1.  Run local PocketBase.
2.  Go to Settings -> Export Collections.
3.  Save to `pocketbase/collections_export.json`.

---

## 3. The "No-Code" Configurable Bundle

When distributing a "Default" version to a parish, provide them with a **Sanctuary Setup Kit**:

1.  **`sanctuary-bridge.exe`**: The OBS connector.
2.  **`config.json`**: A template where they only need to fill in their `PB_URL` and `STREAM_ID`.
3.  **App Links**: Links to the iOS/Android app stores or the `.dmg` installer.

### Example `config.json` template:
```json
{
  "PB_URL": "https://your-church.pockethost.io",
  "STREAM_ID": "copy-id-from-pocketbase",
  "BRIDGE_EMAIL": "bridge@local.dev",
  "BRIDGE_PASS": "bridge123456",
  "OBS_URL": "ws://127.0.0.1:4455",
  "OBS_PASS": ""
}
```

## 4. The Standard Release Workflow

To ensure stability and a "True" release (rather than a development/nightly build), follow this strictly:

1.  **Feature/Fix Branch:** All work begins on `<feature-branch>`.
2.  **Merge to Development:** Pull Request into `development`. This triggers a "Development Build" in GitHub Actions for internal testing.
3.  **Merge to Main:** Once `development` is stable and tested, run the release script.
4.  **Tag & Cut Release:** Run `npm run release` from the `development` branch. 

The `npm run release` script automates steps 3 and 4 by:
- Bumping versions in all `package.json` and `tauri.conf.json` files.
- Merging `development` into `main`.
- Tagging the commit on `main` with `vX.Y.Z`.
- Pushing the tag, which triggers the CI to create a **Full Production Release**.

## 5. Automation Roadmap
- [ ] **GitHub Actions:** Automate the Tauri and Capacitor builds on every tag.
- [ ] **Code Signing:** Set up Apple/Microsoft developer certificates in CI secrets to avoid "Unidentified Developer" warnings.
- [ ] **Auto-Updates:** Enable the Tauri updater so Path A users get fixes automatically.
