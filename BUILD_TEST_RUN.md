# 🏗️ Build, Test, Run & Smoke Test Guide

Complete guide for local development: building, testing, running, and smoke testing Sanctuary Stream.

---

## 📋 Prerequisites

- **Node.js:** 18.0.0 or higher ([Download](https://nodejs.org/))
- **npm:** 9.0.0 or higher (included with Node)
- **Git:** For cloning and version control
- **Optional - Bun:** 1.0.0+ for faster builds ([Download](https://bun.sh/))

Check your versions:
```bash
node --version    # Should be >= 18.0.0
npm --version     # Should be >= 9.0.0
git --version     # Any recent version
```

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
- Downloads/Verifies local **PocketBase** binary
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
cd /Users/brentzey/sanctuary-stream
npm run build
```

**What happens:**
- Builds `sanctuary-app` (React + Vite frontend)
- Builds `sanctuary-bridge` (Node.js backend service)
- Bundles all dependencies
- Creates optimized distribution artifacts

**Output:**
- `sanctuary-app/dist/` - Production-ready frontend
- `sanctuary-bridge/dist/` - Bridge service bundle

### Build Individual Workspaces
```bash
# Build only the app
npm run build:app

# Build only the bridge
npm run build:bridge
```

### Build with Bun (⚡ Faster)
```bash
# Install bun first (if not already installed)
brew install oven-sh/bun/bun

# Then run builds with bun
bun run build
```

**Bun vs npm build time:** ~25s vs ~40s

---

## 🧪 Testing

### Run All Tests
```bash
npm test
```

**Expected output:**
```
✅ sanctuary-app: 122/122 tests (100%)
✅ sanctuary-bridge: 16/17 tests (94%)
✅ Total: 138/139 tests (99.3%)
```

### Test Individual Workspaces
```bash
# Test only the app
npm run test:app

# Test only the bridge
npm run test:bridge
```

### Test Coverage
```bash
npm run test:coverage
```

Generates coverage reports in:
- `sanctuary-app/coverage/`
- `sanctuary-bridge/coverage/`

### Type Checking (TypeScript)
```bash
npm run typecheck
```

**Expected:** 0 errors (strict mode)

### Linting
```bash
# Check for linting issues
npm run lint

# Fix automatically
npm run lint:fix
```

**Expected:** 0 errors, 0 warnings

---

## 🚀 Running Locally

### Start Everything (All Services)

#### Option A: Simple Start (Recommended)
```bash
npm run dev
```

**Services started:**
- 🔵 **PocketBase** (8090) - Database & Auth
- 🟢 **Sanctuary App** (5173) - Frontend UI
- 🟡 **Sanctuary Bridge** - Real-time service (background)

**Expected console output:**
```
[0] PocketBase server started at http://127.0.0.1:8090
[1] ✅ Sanctuary Bridge started successfully
[2] VITE v5.x ready in xxx ms
[2] 
[2] ➜  Local:   http://localhost:5173/
```

Open browser → http://localhost:5173

#### Option B: Full Stack with Mock OBS
```bash
npm run dev:full
```

Starts everything including a mock OBS server on port 4455 (useful for testing without actual OBS).

#### Option C: With Terminal Multiplexing (tmux/iTerm)
```bash
npm run dev:tmux   # Linux/macOS with tmux
npm run dev:iterm  # macOS with iTerm2
```

**Stop all services:**
```bash
# Press Ctrl+C in the terminal
# Or kill manually:
killall node pocketbase
```

### Start Individual Services

**PocketBase only:**
```bash
npm run dev:pocketbase
```

**Sanctuary Bridge only:**
```bash
cd sanctuary-bridge && npm run dev
```

**Sanctuary App only:**
```bash
cd sanctuary-app && npm run dev
```

### Default Credentials (Local Development)

When all services start, you can login at http://localhost:5173:

- **Email:** `admin@local.dev`
- **Password:** `admin123456`

Alternative test users created during setup:
- **Pastor:** `pastor@local.dev` / `pastor123456`
- **Tech/Bridge:** `bridge@local.dev` / `bridge123456`
- **Support:** `support@sanctuarystream.com` / `sanctuary123456`

---

## 🔍 Smoke Tests

Smoke tests are quick validation checks to ensure the system works end-to-end.

### 1. Pre-Commit Validation (5 minutes)

Run the validation script before committing:

```bash
./validate.sh
```

**Expected:** All 6 steps pass with ✅

**What it checks:**
1. TypeScript compilation
2. ESLint linting
3. Unit tests
4. Code formatting
5. Build success
6. Security audit

If any step fails → Fix locally before committing.

### 2. Local Build Smoke Test (3 minutes)

```bash
npm run build && echo "✅ Build successful"
```

**Verify:**
- ✅ No errors in console
- ✅ `sanctuary-app/dist/` exists
- ✅ `sanctuary-bridge/dist/` exists
- ✅ All assets present

### 3. Local Dev Server Smoke Test (3 minutes)

```bash
npm run dev &
sleep 5  # Wait for services to start
```

**Check services are running:**
```bash
# PocketBase (port 8090)
curl http://localhost:8090/_/

# Frontend (port 5173)
curl http://localhost:5173/ | head -20
```

**Visual verification:**
1. Open http://localhost:5173 in browser
2. Check console (F12) for errors
3. Verify logo, animations, and layout render
4. Test login with credentials above

**Stop services:**
```bash
npm run clean  # Kill all processes
```

### 4. Type & Lint Smoke Test (2 minutes)

```bash
npm run typecheck && npm run lint && echo "✅ Type checking and linting passed"
```

**Expected:** 0 errors, 0 warnings

### 5. Unit Test Smoke Test (5 minutes)

```bash
npm test
```

**Expected:** All tests pass

### 6. End-to-End Test (Optional, 10 minutes)

```bash
npm run test:e2e
```

Runs Playwright integration tests if configured.

---

## ✅ Complete Pre-Commit Checklist

Before committing code, run:

```bash
# 1. Clean install (optional, only if dependencies changed)
npm ci

# 2. Full validation
./validate.sh

# 3. Build all workspaces
npm run build

# 4. Run all tests
npm test

# 5. Type check
npm run typecheck

# 6. Lint
npm run lint

# 7. If all pass:
git add -A
git commit -m "your commit message"
git push origin your-branch
```

---

## 🐛 Troubleshooting

### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::8090`

```bash
# Find and kill the process
lsof -i :8090
kill -9 <PID>

# Or kill all node processes
killall node pocketbase
```

### npm Test Failures

```bash
# Clean install and retry
rm -rf node_modules package-lock.json
npm ci
npm test
```

### Build Errors

```bash
# Clear caches
npm cache clean --force
rm -rf sanctuary-app/dist sanctuary-bridge/dist

# Rebuild
npm run build
```

### TypeScript Errors After Fixes

```bash
# Verify all files
npm run typecheck

# Check specific workspace
npm run typecheck --workspace=sanctuary-app
```

### Node Modules Issues

```bash
# Full clean
npm run clean:all

# Fresh install
npm install

# Rebuild
npm run build
```

---

## 📊 Quick Commands Reference

| Command | Purpose |
|---------|---------|
| `npm run build` | Build all workspaces |
| `npm test` | Run all tests |
| `npm run dev` | Start all services locally |
| `npm run typecheck` | TypeScript compilation check |
| `npm run lint` | ESLint check |
| `npm run lint:fix` | Auto-fix linting issues |
| `npm run validate` | Run pre-commit validation |
| `npm run clean` | Remove build artifacts |
| `npm run clean:all` | Remove build + node_modules |
| `./validate.sh` | Pre-commit validation script |

---

## 📚 Related Documentation

- **[README.md](README.md)** - Project overview
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - How to contribute
- **[CHANGELOG.md](CHANGELOG.md)** - Version history
- **[docs/FUNCTIONAL_STYLE.md](docs/FUNCTIONAL_STYLE.md)** - Code style guide

See `./docs/` directory for additional guides on:
- Deployment and production setup
- Configuration and administration
- Testing and quality assurance

---

## 🚀 Next Steps

Once you've verified everything works:

1. **Read [CONTRIBUTING.md](CONTRIBUTING.md)** to understand our coding standards
2. **Check [docs/FUNCTIONAL_STYLE.md](docs/FUNCTIONAL_STYLE.md)** for code style
3. **Look at [GitHub Issues](https://github.com/sanctuary-stream/sanctuary-stream/issues)** for features to work on
4. **Join discussions** at [GitHub Discussions](https://github.com/sanctuary-stream/sanctuary-stream/discussions)

---

**Last Updated:** 2026-03-08  
**Status:** ✅ Ready for local development
