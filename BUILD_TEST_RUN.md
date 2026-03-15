# 🏗️ Build, Test, Run & Smoke Test Guide

Complete guide for local development: building, testing, running, and smoke testing Sanctuary Stream.

---

## 🚀 Quick Start (Recommended)

To go from zero to a working local environment in one command:

```bash
git clone https://github.com/brentmzey/sanctuary-stream.git
cd sanctuary-stream
just setup
```

**What this does:**
- Installs all dependencies (Root, App, CLI)
- Downloads the correct **PocketBase** binary for your OS
- Initializes the database schema and test users
- Creates `.env` files for the App and the native Rust Bridge
- Runs a full validation check (Linting, Typechecking, Tests)

Once complete, start the environment:
```bash
just dev
```

---

## 🛠️ Essential Commands (`just`)

We use `just` as our primary command runner. It's like `make`, but modern.

| Command | Description |
|:--- | :--- |
| `just setup` | Full environment initialization (Run this first!) |
| `just dev` | Start the full stack (Database, Mock OBS, Rust Bridge, and UI) |
| `just test-all` | Run both Rust and TypeScript unit tests |
| `just build-app` | Build the web frontend |
| `just build-desktop` | Build the native desktop app (macOS/Windows/Linux) |
| `just sync-schemas` | (SaaS) Sync database schema across all parish instances |
| `just bump <version>` | Update version across all 11 configuration files |
| `just clean` | Remove all build artifacts and temporary files |

---

## 🧪 Testing

### Unit Tests
Verifies individual logic blocks in Rust and TypeScript.
```bash
just test-all
```

### End-to-End (E2E) Tests
Simulates a real user using a browser to log in and control the stream.
```bash
npm run test:e2e
```

---

## 🚀 Running Locally

### Start Everything
```bash
just dev
```

**Services Started:**
- **PocketBase**: http://127.0.0.1:8090 (Database & Admin UI)
- **Vite/React**: http://localhost:5173 (The Control UI)
- **Rust Bridge**: Native edge agent connecting OBS to the Cloud
- **Mock OBS**: Simulated OBS instance for testing without OBS installed

### Default Credentials
- **Email:** `admin@local.dev`
- **Password:** `admin123456`

---

## 📱 Mobile Builds (iOS & Android)
Requires **Xcode** (macOS only) or **Android Studio**.

```bash
cd sanctuary-app
# Build for iOS
npx cap run ios
# Build for Android
npx cap run android
```

---

## ✅ Quality Checks

Run the validation script before pushing to GitHub:
```bash
./scripts/validate.sh
```
