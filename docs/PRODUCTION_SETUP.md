# 🚀 Production Setup & Publishing Guide

This guide explains how to prepare, build, and distribute Sanctuary Stream for production.

## 📋 Prerequisites

Before you can publish your own releases, you need:
1.  **A GitHub Repository:** Fork this repository to your own account or organization.
2.  **A Backend (PocketBase):** Deploy a production PocketBase instance (e.g., on [PocketHost](https://pockethost.io), VPS, or dedicated server).
3.  **Vercel Account:** For hosting the web version (optional).
4.  **Apple/Google Developer Accounts:** For mobile app distribution (optional).

---

## 🔐 1. Configure GitHub Secrets

The automated build and release process (`.github/workflows/build-release.yml`) requires several secrets to sign and deploy the applications.

Go to: `Settings` → `Secrets and variables` → `Actions` → `New repository secret`.

### 🪟 Windows Signing (Optional)
- `WINDOWS_CERTIFICATE`: Base64-encoded `.pfx` or `.p12` certificate.
- `WINDOWS_CERTIFICATE_PASSWORD`: Password for the certificate.

### 🍎 macOS Signing (Optional)
- `APPLE_CERTIFICATE`: Base64-encoded signing certificate.
- `APPLE_CERTIFICATE_PASSWORD`: Password for the certificate.
- `APPLE_SIGNING_IDENTITY`: Your Developer ID Application name (e.g., `Developer ID Application: Your Name (TEAMID)`).
- `APPLE_ID`: Your Apple ID email.
- `APPLE_PASSWORD`: App-specific password for your Apple ID.
- `APPLE_TEAM_ID`: Your 10-character Team ID.

### 🌐 Web (Vercel)
- `VERCEL_TOKEN`: Your Vercel API token.
- `VERCEL_ORG_ID`: Your Vercel Organization ID.
- `VERCEL_PROJECT_ID`: Your Vercel Project ID.
- `VITE_PB_URL`: The URL of your production backend (e.g., `https://api.your-sanctuary.com`).

### 🤖 Android Signing
- `ANDROID_KEYSTORE_BASE64`: Base64-encoded `.jks` keystore file.
- `ANDROID_KEYSTORE_PASSWORD`: Password for the keystore.
- `ANDROID_KEY_ALIAS`: Alias name for the key.
- `ANDROID_KEY_PASSWORD`: Password for the key.
- `GOOGLE_PLAY_JSON_KEY`: JSON service account key for Google Play Console.

### 📱 iOS Signing
- `APPLE_PROVISIONING_PROFILE`: Base64-encoded provisioning profile.
- `FASTLANE_SESSION`: Fastlane session cookie for 2FA-enabled accounts.

---

## 🛠️ 2. Production Configuration

### Update Backend URL
Ensure your production clients connect to your production backend.

- **Web:** Set `VITE_PB_URL` in your GitHub Secrets or `.env.production`.
- **Desktop/Mobile:** Users can configure this in the **Settings** menu within the app or during the initial **Setup Wizard**.

### Versioning
Before a release, update the version number in:
- `package.json` (Root)
- `sanctuary-app/package.json`
- `sanctuary-app/src-tauri/tauri.conf.json`

---

## 🚢 3. Publishing a Release

### Option A: Automatic (Recommended)
The easiest way to publish is using the included automation script:

```bash
./scripts/build-test-deploy.sh --version v1.0.0
```

This script will:
1.  Run automated setup and dependency installation.
2.  Run the full validation suite (lint, typecheck, tests).
3.  Build all workspaces locally to ensure compilation.
4.  Commit any changes.
5.  Push to GitHub.
6.  Create and push a git tag (`v1.0.0`), triggering the **Build and Release** workflow.

### Option B: Manual Tagging
If you prefer manual control:

```bash
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

---

## 📦 4. Release Artifacts

Once the GitHub Action completes (~20 minutes), artifacts will be available in the **Releases** section of your repository:

- `Sanctuary-Stream-universal.dmg` (macOS)
- `Sanctuary-Stream-x64.msi` (Windows)
- `sanctuary-stream_amd64.deb` (Linux)
- `sanctuary-stream_amd64.AppImage` (Linux)

---

## 🔄 5. Managing Rollbacks

To rollback to a previous version:
1.  Go to the **Releases** page on GitHub.
2.  Find the previous stable version.
3.  Instruct your users to download the binaries from that specific release.
4.  If using Vercel, you can also "Promote" a previous deployment from the Vercel dashboard.

---

## ❓ Troubleshooting

- **Signing Errors:** Ensure your certificates are correctly base64-encoded and not expired.
- **CI/CD Failures:** Check the GitHub Actions logs. Most common issues are missing secrets or environment variables.
- **PocketBase Connection:** Ensure your backend has the correct CORS settings to allow connections from your web app domain.

---

📚 **Documentation Links:**
- [Developer Guide](../BUILD_TEST_RUN.md)
- [Architecture](../SRVDD.md)
- [Functional Style Guide](FUNCTIONAL_STYLE.md)
