# 🚀 Production Setup & SaaS Publishing Guide (v0.4.0)

This guide details how to deploy and manage Sanctuary Stream in a production SaaS environment using the new **Rust-First monadic architecture**.

## 📋 SaaS Prerequisites

1.  **Master Registry Instance:** A centralized PocketBase instance (e.g., on [PocketHost](https://pockethost.io)) that stores the user-to-parish routing table.
2.  **Parish Instances:** Isolated PocketBase instances for each church (multi-tenancy).
3.  **GitHub Secrets:** Required for automated cross-platform builds and code signing.

---

## 🔐 1. SaaS Architecture Configuration

Sanctuary Stream 0.4.0 uses a **Discovery Layer** to handle 250+ PocketBase instances.

### Master Registry Setup
1.  Create a collection named `parish_lookup`.
2.  Add fields: `email` (string), `instance_url` (string), `parish_id` (relation).
3.  When a user logs in, the Rust core queries this registry to find their private parish URL.

### Global Schema Management
Use the native Rust CLI to keep all 250+ instances in sync:
```bash
# Set your master registry URL
export MASTER_REGISTRY_URL="https://registry.your-domain.com"
# Synchronize all parish schemas
just sync-schemas
```

---

## 🛠️ 2. Native Multi-Platform Deployment

The `.github/workflows/build-release.yml` now cross-compiles native Rust binaries for all platforms.

### Required GitHub Secrets
Go to: `Settings` → `Secrets` → `Actions`.

| Secret | Description |
| :--- | :--- |
| `APPLE_CERTIFICATE` | Base64 signing cert for Universal Mac App |
| `WINDOWS_CERTIFICATE` | Base64 signing cert for Windows Installer |
| `VITE_PB_URL` | Your Master Registry URL for the web build |
| `STREAM_ID` | Default fallback stream ID |

---

## 🚢 3. Publishing a Release

### Automated Workflow (Recommended)
1.  Ensure you are on the `main` branch.
2.  Run the version bump:
    ```bash
    just bump 0.4.0
    ```
3.  Push a tag to GitHub:
    ```bash
    git tag -a v0.4.0 -m "Release v0.4.0"
    git push origin v0.4.0
    ```

**GitHub Actions will then:**
- Compile the **Universal macOS DMG**.
- Compile the **Windows MSI** installer.
- Compile the **Linux AppImage**.
- Compile **Standalone Native CLI** binaries for all platforms.
- Bundle the **PocketBase Backend** configuration.

---

## 📦 4. Release Assets (The "Bullet-Proof" Package)

The following assets will be automatically attached to your GitHub Release:

- `sanctuary-stream.dmg` (Universal Mac)
- `sanctuary-stream-setup.msi` (Windows)
- `sanctuary-stream.AppImage` (Linux)
- `sanctuary-win-x64.exe` (Standalone Native Rust Bridge)
- `sanctuary-macos-universal` (Standalone Native Rust Bridge)
- `backend-config.zip` (Database Migrations & Schema)

---

## 📱 5. Mobile Distribution

### iOS
1.  `cd sanctuary-app && npx cap sync ios`
2.  Open `ios/App/App.xcworkspace` in Xcode.
3.  Archive and upload to TestFlight.

### Android
1.  `cd sanctuary-app && npx cap sync android`
2.  The GitHub Action will automatically produce a signed `.apk`.

---

📚 **Advanced Documentation:**
- [Monadic Rust Logic](../sanctuary-core/README.md)
- [Unified CLI Reference](../sanctuary-cli-rs/README.md)
- [E2E Testing Guide](../integration-tests/README.md)
