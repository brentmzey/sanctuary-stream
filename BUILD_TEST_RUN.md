# 🏗️ Build, Test, Run & Smoke Test Guide

Complete guide for local development: building, testing, running, and smoke testing Sanctuary Stream.

---

## 🚀 Quick Start (Recommended)

To go from zero to a working local environment in one command:

```bash
git clone https://github.com/sanctuary-stream/sanctuary-stream.git
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

## 🏗️ Building

### Quick Build (All Workspaces)
```bash
npm run build
```

**Output:**
- `sanctuary-app/dist/` - Production-ready frontend
- `sanctuary-bridge/dist/` - Bridge service bundle

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
