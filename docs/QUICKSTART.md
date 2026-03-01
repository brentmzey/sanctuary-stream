# ⚡ Sanctuary Stream - 5-Minute Quickstart

Get up and running in 5 minutes or less!

---

## 🚀 Quick Commands

```bash
# 1. Clone and install
git clone <repo-url> sanctuary-stream
cd sanctuary-stream
npm install

# 2. Set admin password
export PB_SANCTUARY_STREAM_ADMIN_PASSWORD_LOCAL="admin123456"

# 3. Run setup (creates database, users, configs)
npm run setup

# 4. Start everything
npm run dev
```

**Access:**
- Frontend: http://localhost:5173
- PocketBase: http://127.0.0.1:8090/_
- Login: `pastor@local.dev` / `pastor123456`

---

## 📝 What Just Happened?

### `npm install`
- Installed root dependencies
- Installed frontend dependencies (React + Vite)
- Installed bridge dependencies (Node.js service)
- Downloaded PocketBase binary

### `npm run setup`
- Started PocketBase server
- Created admin account
- Applied database migrations (3 collections: users, commands, streams)
- Created test users (pastor, bridge)
- Generated `.env` files

### `npm run dev`
- Started PocketBase on port 8090
- Started Bridge service (connects to OBS)
- Started Frontend on port 5173
- All running concurrently, auto-restart on changes

## 🧙 Zero-Config Setup Wizard

**New in v0.1.0!** You no longer need to manually edit `.env` files for the frontend.

If the app starts without configuration, it will automatically launch the **Setup Wizard**:
1. **Connect:** Point to your PocketBase backend.
2. **Login:** Authenticate with your church credentials.
3. **Initialize:** Create your stream record with one click.

The app saves your `STREAM_ID` and settings locally, so you're ready for every future service.

---

## 🎯 Next Steps

### 1. Read the Onboarding Guide
For a full walkthrough of the new setup process, see:
**[USER_ONBOARDING.md](./USER_ONBOARDING.md)** 🧙

### 2. Connect Real OBS
```bash
# In OBS Studio:
# Tools > WebSocket Server Settings
# - Enable WebSocket server
# - Server Port: 4455
# - Authentication: Disabled (local dev)

# Bridge will auto-connect to OBS
```

### 2. Or Use Mock OBS
```bash
# Separate terminal
npm run mock:obs

# Bridge connects to mock OBS at ws://127.0.0.1:4455
# Simulates stream start/stop without real OBS
```

### 3. Test Streaming
1. Open http://localhost:5173
2. Login: `pastor@local.dev` / `pastor123456`
3. Click "Start Streaming"
4. Watch status update in real-time

---

## 🛠️ Common Commands

```bash
# Development
npm run dev              # Start all services
npm run dev:app          # Frontend only
npm run dev:bridge       # Bridge only
npm run dev:pocketbase   # Database only

# Testing
npm test                 # Run all tests
npm run lint             # Lint code
npm run typecheck        # TypeScript checking
npm run validate         # Full validation (CI)

# Building
npm run build            # Build for production
npm run build:app        # Frontend only
npm run build:bridge     # Bridge only

# Maintenance
npm run clean            # Clean build artifacts
npm run clean:all        # Nuclear option (delete all node_modules)
npm run setup            # Re-run setup (idempotent)
```

---

## 🔧 Troubleshooting

### Port 8090 in use?
```bash
lsof -ti:8090 | xargs kill -9
npm run setup
```

### Can't connect to OBS?
```bash
# Use mock OBS for testing
npm run mock:obs
```

### Reset everything?
```bash
npm run clean:all
rm -rf pocketbase/local/pb_data
npm install
npm run setup
npm run dev
```

---

## 📚 Full Documentation

- **[BUILD_AND_RUN.md](./BUILD_AND_RUN.md)** - Complete build & development guide
- **[OBS_INTEGRATION.md](./OBS_INTEGRATION.md)** - Essential OBS configuration
- **[USER_GUIDE.md](./USER_GUIDE.md)** - Complete installation guide
- **[COMPLETE_GUIDE.md](./COMPLETE_GUIDE.md)** - Technical deep-dive & walkthrough
- **[INDEX.md](./INDEX.md)** - Full documentation index

---

## ✅ System Requirements

- Node.js 18+ and npm
- macOS, Linux, or Windows
- 2GB RAM minimum
- Optional: OBS Studio (or use mock)

---

**Ready in 5 minutes!** 🎉
