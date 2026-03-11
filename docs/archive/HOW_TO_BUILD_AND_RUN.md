# 🚀 How to Build and Run Sanctuary Stream

**Simple guide - Get running in 7 minutes**

---

## ⚡ Quick Start (Recommended)

### Prerequisites
```bash
node --version  # Should be v18.0.0 or higher
npm --version   # Should be 9.0.0 or higher
```

### 1. Clone Repository
```bash
git clone https://github.com/brentmzey/sanctuary-stream.git
cd sanctuary-stream
```

### 2. Install Dependencies
```bash
npm install
```
**Time:** ~5 minutes (downloads packages)

### 3. Build Everything
```bash
npm run build
```
**Time:** ~30 seconds  
**Output:** Production-ready bundles in `dist/` folders

### 4. Run It!
```bash
./START.sh
```
**Time:** ~10 seconds  
**Result:** All services running!

### 5. Open in Browser
```
http://localhost:5173
```

**Login with:**
- Email: `support@sanctuarystream.com`
- Password: `sanctuary123456`

**Done!** 🎉

---

## 📋 Detailed Instructions

### Step 1: Install Dependencies

```bash
npm install
```

**What this does:**
- Installs all Node.js packages
- Downloads TypeScript, React, Vite, etc.
- Sets up workspace dependencies
- Takes about 5 minutes

**Troubleshooting:**
```bash
# If install fails, try:
rm -rf node_modules package-lock.json
npm install
```

---

### Step 2: Build the Project

```bash
npm run build
```

**What this does:**
- Compiles TypeScript → JavaScript
- Bundles React app with Vite
- Optimizes and minifies code
- Creates production-ready bundles

**Output:**
- `sanctuary-app/dist/` - Web app (252 KB → 74 KB gzipped)
- `sanctuary-bridge/dist/` - Bridge service
- `sanctuary-cli/` - CLI tools

**Verify build:**
```bash
ls -lh sanctuary-app/dist/
# Should see: index.html, assets/
```

---

### Step 3: Run the Services

#### Option A: One-Command Start (Easiest)
```bash
./START.sh
```

**What happens:**
1. ✅ Starts PocketBase (database)
2. ✅ Creates admin account (your email)
3. ✅ Starts Vite dev server (web app)
4. ✅ Shows URLs and credentials
5. ✅ Streams logs

**Output:**
```
✅ SANCTUARY STREAM IS LIVE!

📍 Open in browser:
   http://localhost:5173

🔐 Login Credentials:
   Email:    support@sanctuarystream.com
   Password: sanctuary123456

🆔 Process IDs: 12345 67890
```

**Stop services:**
```bash
# Press Ctrl+C, or:
kill 12345 67890  # Use PIDs from output
```

---

#### Option B: Manual Start (More Control)

**Terminal 1 - PocketBase:**
```bash
cd pocketbase
pocketbase serve --http=127.0.0.1:8090 --migrationsDir=local/pb_migrations
```

**Terminal 2 - Create Admin:**
```bash
cd pocketbase
pocketbase superuser upsert support@sanctuarystream.com sanctuary123456
cd ..
```

**Terminal 3 - Web App:**
```bash
cd sanctuary-app
npm run dev
```

**Access:**
- Web app: http://localhost:5173
- PocketBase admin: http://127.0.0.1:8090/_/

---

#### Option C: Development Mode with tmux

```bash
# Install tmux first (if needed)
brew install tmux  # macOS
# OR
sudo apt install tmux  # Linux

# Start everything in tmux
npm run dev:tmux
```

**Features:**
- All services in split panes
- Easy switching (Ctrl+B then 0-3)
- Persistent sessions

**Navigate:**
- `Ctrl+B` then `0` - PocketBase
- `Ctrl+B` then `1` - Bridge
- `Ctrl+B` then `2` - Web App
- `Ctrl+B` then `3` - Logs

**Exit:** `Ctrl+B` then `D` (detach)  
**Return:** `tmux attach -t sanctuary-stream`  
**Kill:** `tmux kill-session -t sanctuary-stream`

---

## 🧪 Testing

### Run All Tests
```bash
npm test
```

**Expected output:**
```
✓ sanctuary-app (122 tests) 100%
⚠ sanctuary-bridge (16/17 tests) 94%
✓ Total: 138/139 tests passed (99.3%)
```

### Run Specific Tests
```bash
npm run test:app       # Web app only
npm run test:bridge    # Bridge only
npm run test:e2e       # End-to-end tests
```

### Type Check
```bash
npm run typecheck
```
**Expected:** No output = success (0 errors)

### Lint
```bash
npm run lint
```
**Expected:** No warnings in production code

---

## 🏗️ Building for Production

### Build Web App
```bash
cd sanctuary-app
npm run build

# Preview production build
npm run preview
# Opens: http://localhost:4173
```

### Build Desktop Apps

**macOS:**
```bash
cd sanctuary-app
npm run tauri:build:mac
# Output: src-tauri/target/release/bundle/macos/*.dmg
# Time: ~5-10 minutes
```

**Windows:**
```bash
cd sanctuary-app
npm run tauri:build:win
# Output: src-tauri/target/release/bundle/msi/*.msi
# Time: ~5-10 minutes
```

**Linux:**
```bash
cd sanctuary-app
npm run tauri:build:linux
# Output: src-tauri/target/release/bundle/deb/*.deb
#         src-tauri/target/release/bundle/appimage/*.AppImage
# Time: ~5-10 minutes
```

### Build Mobile Apps

**iOS:**
```bash
cd sanctuary-app
npm run cap:build:ios
# Opens Xcode - click "Archive"
# Time: ~10-15 minutes
```

**Android:**
```bash
cd sanctuary-app
npm run cap:build:android
# Opens Android Studio - click "Build Bundle"
# Time: ~10-15 minutes
```

---

## 🚀 Deployment

### Deploy Web App to Vercel
```bash
cd sanctuary-app
npm install -g vercel
vercel --prod
```
**Result:** Live URL (e.g., sanctuary-stream.vercel.app)

### Deploy to Netlify
```bash
cd sanctuary-app
npm install -g netlify-cli
npm run build
netlify deploy --prod --dir=dist
```

### Distribute Desktop Apps
**Option 1:** GitHub Releases
```bash
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
# GitHub Actions builds all platforms automatically
```

**Option 2:** Direct download
- Share .dmg/.msi/.AppImage files directly
- Users double-click to install

---

## 🔧 Common Commands

```bash
# INSTALL
npm install                    # Install dependencies

# BUILD
npm run build                  # Build everything
npm run build:app             # Build web app only
npm run build:bridge          # Build bridge only

# TEST
npm test                      # Run all tests
npm run test:app              # Test web app
npm run test:bridge           # Test bridge
npm run test:e2e              # End-to-end tests
npm run typecheck             # Type check
npm run lint                  # Lint code

# RUN
./START.sh                    # Start everything (recommended)
npm run dev:simple            # Alternative start
npm run dev:tmux              # With tmux
npm run dev                   # With concurrently

# CLEAN
rm -rf node_modules */node_modules  # Remove deps
rm -rf */dist                        # Remove builds
npm install                          # Reinstall
```

---

## 🆘 Troubleshooting

### Build Fails
```bash
# Clean and rebuild
rm -rf node_modules sanctuary-app/node_modules sanctuary-bridge/node_modules
npm install
npm run build
```

### Port Already in Use
```bash
# Kill processes on ports
lsof -ti:8090 | xargs kill -9  # PocketBase
lsof -ti:5173 | xargs kill -9  # Vite
```

### PocketBase Won't Start
```bash
# Check if PocketBase is installed
which pocketbase

# If not found:
brew install pocketbase  # macOS
# OR download from https://pocketbase.io
```

### Services Start But Can't Login
```bash
# Recreate admin
cd pocketbase
pocketbase superuser upsert support@sanctuarystream.com sanctuary123456
cd ..
```

### Build Takes Forever
```bash
# Check Node.js version
node --version  # Should be v18+

# Update if needed
nvm install 18
nvm use 18
```

---

## 📊 System Requirements

### Minimum
- **OS:** macOS 10.13+, Windows 10+, Ubuntu 20.04+
- **Node.js:** v18.0.0+
- **RAM:** 4 GB
- **Disk:** 2 GB free space
- **Network:** Internet (for initial install)

### Recommended
- **OS:** macOS 13+, Windows 11, Ubuntu 22.04+
- **Node.js:** v20.0.0+
- **RAM:** 8 GB
- **Disk:** 5 GB free space
- **CPU:** 4+ cores

### For Building Desktop Apps
- **macOS builds:** Xcode Command Line Tools
- **Windows builds:** Visual Studio C++ Build Tools
- **Linux builds:** build-essential, webkit2gtk

### For Building Mobile Apps
- **iOS:** macOS with Xcode 14+
- **Android:** Android Studio + Android SDK 26+

---

## 🎯 Quick Reference

| What | Command | Time |
|------|---------|------|
| Install | `npm install` | 5 min |
| Build | `npm run build` | 30 sec |
| Test | `npm test` | 1 sec |
| Run | `./START.sh` | 10 sec |
| Open | http://localhost:5173 | instant |

**Total time from clone to running:** 7 minutes

---

## ✅ Success Checklist

After running, you should see:

- [x] ✅ PocketBase serving on :8090
- [x] ✅ Web app serving on :5173
- [x] ✅ Admin account created
- [x] ✅ Can login to web app
- [x] ✅ Can access PocketBase admin

**Open:** http://localhost:5173  
**Login:** support@sanctuarystream.com / sanctuary123456  
**Works!** ✅

---

## 📚 Additional Resources

- **Quick Start:** [QUICK_START.md](QUICK_START.md)
- **Complete Guide:** [BUILD_TEST_RUN_GUIDE.md](BUILD_TEST_RUN_GUIDE.md)
- **Deployment:** [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- **Setup & Demo:** [COMPLETE_SETUP_DEMO.md](COMPLETE_SETUP_DEMO.md)

---

## 🎉 You're Done!

**If you can see this, you're ready:**
- PocketBase health check: http://127.0.0.1:8090/api/health
- Web app title: http://localhost:5173

**Next steps:**
1. Open http://localhost:5173
2. Login with your email
3. Click "Start Streaming"
4. Stream your service! 🎬

**Questions?** Check the docs or create an issue!

---

**Happy Streaming! 🏛️✨**
