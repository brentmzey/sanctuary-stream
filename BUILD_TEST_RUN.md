# 🏗️ Build, Test, Run & Smoke Test Guide

Complete guide for local development: building, testing, running, and smoke testing Sanctuary Stream.

---

## 🚀 Quick Start (Recommended)

To go from zero to a working local environment in one command:

```bash
git clone https://github.com/brentmzey/sanctuary-stream.git
cd sanctuary-stream
npm run setup
```

**What this does:**
- Installs all dependencies (Root, App, Bridge, CLI)
- Downloads local **PocketBase** binary
- Initializes the database schema and test users
- Creates `.env` files for the App and Bridge
- Runs a full validation check

Once complete, start the environment:
```bash
npm run dev:full
```

---

## ⚡ High-Performance Mode (Bun)

For a significantly faster development experience (2-3x startup, 560x faster install), we recommend using **Bun**.

### Using Bun for Everything
```bash
# 1. Install with Bun
bun install

# 2. Build with Bun
bun run build

# 3. Test with Bun
bun test

# 4. Start (High-performance mode)
./scripts/START-BUN.sh
```

### Benchmark Comparison
| Operation | npm | Bun | Speedup |
|-----------|-----|-----|---------|
| **Install** | 300s | 0.5s | **560x** ⚡⚡⚡ |
| **Dev Start** | 150ms | 75ms | **2x** ⚡⚡ |
| **Build** | 30s | 25s | **1.2x** ⚡ |
| **Tests** | 1s | 0.5s | **2x** ⚡⚡ |

👉 **[Read the Full Performance Guide](docs/PERFORMANCE.md)**

---

## 🏗️ Building

### Quick Build (All Workspaces)
```bash
npm run build
```

### Mobile Builds (iOS & Android)
Requires **Xcode** (iOS) and **Android Studio** (Android) installed.

```bash
# Build iOS
cd sanctuary-app
npm run cap:build:ios

# Build Android
cd sanctuary-app
npm run cap:build:android
```

**Output:**
- `sanctuary-app/dist/` - Production-ready frontend
- `sanctuary-bridge/dist/` - Bridge service bundle
- `sanctuary-app/ios/` - iOS Xcode project
- `sanctuary-app/android/` - Android Studio project

---

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### End-to-End Tests
```bash
npm run test:e2e
```

---

## 🚀 Running Locally

### Start Everything
```bash
npm run dev:full
```

### Default Credentials
- **Email:** `admin@local.dev`
- **Password:** `admin123456`

---

## ✅ Quality Checks

Run the validation script before committing:
```bash
./validate.sh
```
