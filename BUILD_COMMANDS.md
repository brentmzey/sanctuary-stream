# 🔨 BUILD & RUN COMMANDS

**The essential commands you need - copy/paste ready!**

---

## ⚡ FIRST TIME SETUP (Run Once)

```bash
# 1. Install dependencies
npm install

# 2. Set admin password (REQUIRED)
export PB_SANCTUARY_STREAM_ADMIN_PASSWORD_LOCAL="admin123456"

# 3. Setup everything (database, users, config)
npm run setup
```

**That's it! You're ready to run.**

---

## 🏃 RUN THE APP (Development)

```bash
# Start everything (recommended)
npm run dev
```

**This starts:**
- PocketBase database → http://127.0.0.1:8090
- Backend bridge service → http://localhost:3001
- Frontend app → http://localhost:5173

**Open:** http://localhost:5173  
**Login:** `pastor@local.dev` / `pastor123456`

---

## 🔨 BUILD FOR PRODUCTION

```bash
# Build everything
npm run build
```

**Output:**
- `sanctuary-app/dist/` - Frontend (ready to deploy)
- `sanctuary-bridge/dist/` - Backend (ready to deploy)

---

## 🧪 TEST BEFORE DEPLOYING

```bash
# Run full validation
npm run validate
```

**This runs:**
- Type checking ✓
- Linting ✓
- Tests ✓
- Production build ✓

---

## 🚀 DEPLOY (Choose One)

### Option 1: Vercel (Easiest)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy frontend
cd sanctuary-app
vercel --prod
```

### Option 2: Docker (All Services)

```bash
# Start everything in containers
docker-compose up -d

# Stop everything
docker-compose down
```

### Option 3: Desktop App

```bash
# Build desktop installers
cd sanctuary-app
npm run tauri build
```

**Outputs:**
- macOS: `src-tauri/target/release/bundle/macos/Sanctuary Stream.app`
- Windows: `src-tauri/target/release/bundle/msi/Sanctuary Stream_*.msi`
- Linux: `src-tauri/target/release/bundle/deb/sanctuary-stream_*.deb`

---

## 🎯 QUICK REFERENCE

| What | Command |
|------|---------|
| **Install** | `npm install` |
| **Setup** | `npm run setup` |
| **Run** | `npm run dev` |
| **Build** | `npm run build` |
| **Test** | `npm run validate` |
| **Deploy Web** | `vercel --prod` |
| **Deploy Docker** | `docker-compose up -d` |
| **Build Desktop** | `npm run tauri build` |

---

## 🔧 INDIVIDUAL SERVICES

If you need to run services separately:

```bash
# Terminal 1: Database
npm run dev:pocketbase

# Terminal 2: Backend
npm run dev:bridge

# Terminal 3: Frontend
npm run dev:app

# Terminal 4: Mock OBS (optional)
npm run mock:obs
```

---

## 🧹 CLEANUP

```bash
# Clean build artifacts
npm run clean

# Clean everything (including dependencies)
npm run clean:all
```

---

## ⚠️ TROUBLESHOOTING

**Problem:** Commands not found

```bash
# Reinstall dependencies
npm install
```

**Problem:** Setup fails

```bash
# Make sure admin password is set
export PB_SANCTUARY_STREAM_ADMIN_PASSWORD_LOCAL="admin123456"

# Clean and retry
npm run clean
npm run setup
```

**Problem:** Dev server won't start

```bash
# Kill existing processes
pkill -f pocketbase
pkill -f vite

# Restart
npm run dev
```

---

## 📚 MORE INFO

- **Full guide**: See `BUILD_AND_RUN.md`
- **Deployment**: See `DEPLOY.md`
- **Quick start**: See `QUICKSTART.md`

---

**TL;DR: `npm install` → `npm run setup` → `npm run dev` → Open http://localhost:5173** 🚀
