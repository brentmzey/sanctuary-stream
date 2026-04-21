# 🚀 Complete Installation Guide - Sanctuary Stream

**From zero to streaming in 30 minutes**

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Install (Most Users)](#quick-install-most-users)
3. [Detailed Installation](#detailed-installation)
4. [Platform-Specific Builds](#platform-specific-builds)
5. [Configuration](#configuration)
6. [First-Time Setup](#first-time-setup)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

| Software | Version | Download | Purpose |
|----------|---------|----------|---------|
| **Node.js** | 18+ | https://nodejs.org | Run bridge & build apps |
| **npm** | 9+ | (included with Node) | Package manager |
| **Git** | Latest | https://git-scm.com | Clone repository |
| **OBS Studio** | 28+ | https://obsproject.com | Streaming software |

### Optional (For Specific Platforms)

| Software | Platform | Download |
|----------|----------|----------|
| **Rust** | macOS/Windows/Linux Desktop | https://rustup.rs |
| **Xcode** | macOS/iOS | Mac App Store |
| **Android Studio** | Android | https://developer.android.com/studio |
| **Visual Studio** | Windows Desktop | https://visualstudio.microsoft.com |

### System Requirements

**Minimum**:
- CPU: Intel i5 / AMD Ryzen 5
- RAM: 8 GB
- Storage: 10 GB free
- Internet: 9 Mbps upload (for 1080p streaming)

**Recommended**:
- CPU: Intel i7 / AMD Ryzen 7
- RAM: 16 GB
- Storage: SSD with 50 GB free
- Internet: 15+ Mbps upload
- GPU: NVIDIA GTX 1650+ / AMD RX 570+ / Intel QuickSync

---

## Quick Install (Most Users)

**Choose your operating system:**

<details>
<summary><b>🪟 Windows (Click to expand)</b></summary>

### 1. Install Prerequisites

```powershell
# Install Node.js 18+
# Download from: https://nodejs.org
# Run installer with default options

# Verify installation
node --version    # Should show v18.x.x or higher
npm --version     # Should show 9.x.x or higher

# Install Git
# Download from: https://git-scm.com/download/win
# Run installer with default options
```

### 2. Clone & Install

```powershell
# Open PowerShell or Command Prompt

# Clone repository
git clone https://github.com/brentmzey/sanctuary-stream.git
cd sanctuary-stream

# Install dependencies (takes 2-5 minutes)
npm install

# Build everything
npm run build
```

### 3. Setup PocketBase

```powershell
# Download PocketBase for Windows
# Visit: https://pocketbase.io/docs/
# Extract to: sanctuary-stream/pocketbase/local/

# Start PocketBase
cd pocketbase\local
.\pocketbase.exe serve

# Open http://127.0.0.1:8090/_/
# Create admin account when prompted
```

### 4. Install OBS Studio

```powershell
# Download OBS Studio
# Visit: https://obsproject.com/download

# Install OBS
# Run installer with default options

# Enable WebSocket
# OBS → Tools → WebSocket Server Settings
# Enable: ☑ Enable WebSocket server
# Server Port: 4455
# Password: (leave blank for local testing)
```

### 5. Start Services

```powershell
# Terminal 1: PocketBase (already running)

# Terminal 2: Bridge
cd sanctuary-bridge
npm start

# Terminal 3: Web App (development)
cd sanctuary-app
npm run dev
# Open: http://localhost:5173
```

**✅ Done! Skip to [First-Time Setup](#first-time-setup)**

</details>

<details>
<summary><b>🍎 macOS (Click to expand)</b></summary>

### 1. Install Prerequisites

```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js 18+
brew install node@18

# Verify installation
node --version    # Should show v18.x.x or higher
npm --version     # Should show 9.x.x or higher

# Git should be pre-installed, but verify:
git --version
```

### 2. Clone & Install

```bash
# Open Terminal

# Clone repository
git clone https://github.com/brentmzey/sanctuary-stream.git
cd sanctuary-stream

# Install dependencies (takes 2-5 minutes)
npm install

# Build everything
npm run build
```

### 3. Setup PocketBase

```bash
# Download PocketBase for macOS
cd pocketbase/local
curl -L -o pocketbase.zip https://github.com/pocketbase/pocketbase/releases/download/v0.22.0/pocketbase_0.22.0_darwin_amd64.zip

# Extract
unzip pocketbase.zip
chmod +x pocketbase

# Start PocketBase
./pocketbase serve

# Open http://127.0.0.1:8090/_/
# Create admin account when prompted
```

### 4. Install OBS Studio

```bash
# Option 1: Homebrew
brew install --cask obs

# Option 2: Download directly
# Visit: https://obsproject.com/download
# Drag OBS.app to Applications folder

# Enable WebSocket
# OBS → Tools → WebSocket Server Settings
# Enable: ☑ Enable WebSocket server
# Server Port: 4455
# Password: (leave blank for local testing)
```

### 5. Start Services

```bash
# Terminal 1: PocketBase (already running)

# Terminal 2: Bridge
cd sanctuary-bridge
npm start

# Terminal 3: Web App (development)
cd sanctuary-app
npm run dev
# Open: http://localhost:5173
```

**✅ Done! Skip to [First-Time Setup](#first-time-setup)**

</details>

<details>
<summary><b>🐧 Linux (Ubuntu/Debian) (Click to expand)</b></summary>

### 1. Install Prerequisites

```bash
# Update package list
sudo apt update

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version    # Should show v18.x.x or higher
npm --version     # Should show 9.x.x or higher

# Install Git (if not installed)
sudo apt install -y git

# Install dependencies for desktop builds (optional)
sudo apt install -y \
  libwebkit2gtk-4.0-dev \
  build-essential \
  curl \
  wget \
  libssl-dev \
  libgtk-3-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev
```

### 2. Clone & Install

```bash
# Clone repository
git clone https://github.com/brentmzey/sanctuary-stream.git
cd sanctuary-stream

# Install dependencies (takes 2-5 minutes)
npm install

# Build everything
npm run build
```

### 3. Setup PocketBase

```bash
# Download PocketBase for Linux
cd pocketbase/local
wget https://github.com/pocketbase/pocketbase/releases/download/v0.22.0/pocketbase_0.22.0_linux_amd64.zip

# Extract
unzip pocketbase_0.22.0_linux_amd64.zip
chmod +x pocketbase

# Start PocketBase
./pocketbase serve

# Open http://127.0.0.1:8090/_/
# Create admin account when prompted
```

### 4. Install OBS Studio

```bash
# Add OBS PPA
sudo add-apt-repository ppa:obsproject/obs-studio
sudo apt update

# Install OBS
sudo apt install -y obs-studio

# Enable WebSocket
# OBS → Tools → WebSocket Server Settings
# Enable: ☑ Enable WebSocket server
# Server Port: 4455
# Password: (leave blank for local testing)
```

### 5. Start Services

```bash
# Terminal 1: PocketBase (already running)

# Terminal 2: Bridge
cd sanctuary-bridge
npm start

# Terminal 3: Web App (development)
cd sanctuary-app
npm run dev
# Open: http://localhost:5173
```

**✅ Done! Skip to [First-Time Setup](#first-time-setup)**

</details>

---

## Detailed Installation

### Step 1: Clone Repository

```bash
# Using HTTPS
git clone https://github.com/brentmzey/sanctuary-stream.git

# OR using SSH (if you have SSH keys set up)
git clone git@github.com:brentmzey/sanctuary-stream.git

# Navigate to directory
cd sanctuary-stream
```

### Step 2: Install Dependencies

```bash
# Install all packages (monorepo)
npm install

# This installs:
# - sanctuary-app dependencies
# - sanctuary-bridge dependencies
# - shared library dependencies
# - Development tools

# Expected time: 2-5 minutes depending on internet speed
```

### Step 3: Setup Environment Variables

```bash
# Copy example environment files
cp .env.example .env
cp sanctuary-app/.env.example sanctuary-app/.env
cp sanctuary-bridge/.env.example sanctuary-bridge/.env

# Edit .env files with your settings
# (See Configuration section below)
```

### Step 4: Initialize Database

```bash
# Start PocketBase (in separate terminal)
cd pocketbase/local
./pocketbase serve

# In another terminal, initialize schema
cd sanctuary-stream
node pocketbase/schema-init.ts local

# This creates:
# - Required collections (users, commands, streams)
# - Test user accounts (for local development)
# - Default stream record
```

### Step 5: Build Projects

```bash
# Build everything
npm run build

# Or build individually:
npm run build:app      # Build web app
npm run build:bridge   # Build bridge service

# Or run in development mode:
npm run dev            # Runs both app and bridge in dev mode
```

---

## Platform-Specific Builds

### Web App (Browser)

```bash
cd sanctuary-app

# Development (hot reload)
npm run dev
# Opens http://localhost:5173

# Production build
npm run build
# Output: dist/ folder

# Preview production build
npm run preview
# Opens http://localhost:4173
```

**Deploy to**:
- Vercel: `npx vercel --prod`
- Netlify: Drag `dist/` folder to netlify.com/drop
- GitHub Pages: Push `dist/` to `gh-pages` branch

---

### Desktop Apps (Tauri)

#### Prerequisites for Desktop

<details>
<summary><b>macOS Desktop Prerequisites</b></summary>

```bash
# Install Xcode Command Line Tools
xcode-select --install

# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# Verify
rustc --version
cargo --version
```

</details>

<details>
<summary><b>Windows Desktop Prerequisites</b></summary>

```powershell
# Install Visual Studio C++ Build Tools
# Download: https://visualstudio.microsoft.com/downloads/
# Select: Desktop development with C++

# Install Rust
# Download: https://win.rustup.rs/x86_64
# Run installer with default options

# Verify (restart terminal first)
rustc --version
cargo --version
```

</details>

<details>
<summary><b>Linux Desktop Prerequisites</b></summary>

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# Install build dependencies
sudo apt install -y \
  libwebkit2gtk-4.0-dev \
  build-essential \
  curl \
  wget \
  libssl-dev \
  libgtk-3-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev

# Verify
rustc --version
cargo --version
```

</details>

#### Build Desktop Apps

```bash
cd sanctuary-app

# macOS (Universal binary: Intel + Apple Silicon)
npm run tauri:build:mac
# Output: src-tauri/target/release/bundle/dmg/

# Windows (x86_64)
npm run tauri:build:win
# Output: src-tauri/target/release/bundle/msi/

# Linux (deb and AppImage)
npm run tauri:build:linux
# Output: src-tauri/target/release/bundle/deb/
#         src-tauri/target/release/bundle/appimage/

# Development (hot reload)
npm run tauri:dev
```

**Build time**: 2-5 minutes first time, 30-60 seconds after
**Output size**: 8-15 MB depending on platform

---

### Mobile Apps (Capacitor)

#### Prerequisites for Mobile

<details>
<summary><b>iOS Prerequisites</b></summary>

```bash
# Requirements:
# - macOS computer
# - Xcode 14+ (from Mac App Store)
# - Apple Developer Account (for device testing/distribution)

# Install CocoaPods
sudo gem install cocoapods

# Install iOS dependencies
cd sanctuary-app
npm install @capacitor/ios
npx cap add ios

# Verify Xcode installation
xcodebuild -version
```

</details>

<details>
<summary><b>Android Prerequisites</b></summary>

```bash
# Download Android Studio
# Visit: https://developer.android.com/studio

# Install Android Studio with default options
# Install Android SDK 26+ (Android 8.0+)

# Set ANDROID_HOME environment variable
# Linux/macOS:
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools

# Windows:
setx ANDROID_HOME "C:\Users\YourName\AppData\Local\Android\Sdk"
setx PATH "%PATH%;%ANDROID_HOME%\tools;%ANDROID_HOME%\platform-tools"

# Install Android dependencies
cd sanctuary-app
npm install @capacitor/android
npx cap add android
```

</details>

#### Build Mobile Apps

```bash
cd sanctuary-app

# Build web assets first
npm run build

# iOS
npm run cap:sync ios
npm run cap:ios
# Opens Xcode → Click "Run" button

# Android
npm run cap:sync android
npm run cap:android
# Opens Android Studio → Click "Run" button

# To create release builds:
# iOS: Xcode → Product → Archive → Distribute App
# Android: Build → Generate Signed Bundle/APK
```

---

## Configuration

### Environment Variables

#### `.env` (Root)

```bash
# PocketBase URL
PB_URL=http://127.0.0.1:8090

# Stream ID (get this from PocketBase after initialization)
STREAM_ID=your_stream_id_here

# Admin password for PocketBase initialization
PB_SANCTUARY_STREAM_ADMIN_PASSWORD_LOCAL=your_secure_password

# Optional: For production
PB_URL_PRODUCTION=https://your-pocketbase.pockethost.io
PB_SANCTUARY_STREAM_ADMIN_PASSWORD_PRODUCTION=production_password
```

#### `sanctuary-app/.env`

```bash
# PocketBase API URL
VITE_PB_URL=http://127.0.0.1:8090

# Stream ID
VITE_STREAM_ID=your_stream_id_here

# Optional: YouTube API key (for metadata)
VITE_YOUTUBE_API_KEY=your_youtube_api_key
```

#### `sanctuary-bridge/.env`

```bash
# PocketBase URL
PB_URL=http://127.0.0.1:8090

# Stream ID
STREAM_ID=your_stream_id_here

# OBS WebSocket (default)
OBS_WS_URL=ws://127.0.0.1:4455
OBS_WS_PASSWORD=

# Optional: Google Drive backup
GOOGLE_DRIVE_CREDENTIALS_PATH=./google-credentials.json
GOOGLE_DRIVE_FOLDER_ID=your_folder_id

# Log level
LOG_LEVEL=info
```

### OBS WebSocket Configuration

```bash
# In OBS Studio:
# 1. Tools → WebSocket Server Settings
# 2. Enable WebSocket server: ☑
# 3. Server Port: 4455 (default)
# 4. Server Password: (leave blank for local, or set and add to .env)
# 5. Click "Apply" then "OK"
```

---

## First-Time Setup

### 1. Start All Services

```bash
# Terminal 1: PocketBase
cd pocketbase/local
./pocketbase serve

# Terminal 2: Bridge
cd sanctuary-bridge
npm start

# Terminal 3: Web App
cd sanctuary-app
npm run dev
```

### 2. Access Admin UI

```bash
# Open browser to: http://127.0.0.1:8090/_/

# Create admin account:
Email: admin@local.dev
Password: (your secure password)

# This is your PocketBase admin account
```

### 3. Initialize Database Schema

```bash
# In a new terminal
cd sanctuary-stream
node pocketbase/schema-init.ts local

# This creates:
# ✅ Collections (users, commands, streams)
# ✅ Test users (admin@local.dev, pastor@local.dev)
# ✅ Default stream record

# IMPORTANT: Copy the STREAM_ID from output
# Add it to your .env files
```

### 4. Login to App

```bash
# Open: http://localhost:5173

# For first-time setup, use Setup Wizard
# OR login with test credentials:

Email: admin@local.dev
Password: admin123456

# Other test users:
# pastor@local.dev / pastor123456
# bridge@local.dev / bridge123456
```

### 5. Configure OBS Connection

```bash
# In the app:
# 1. Ensure OBS is running
# 2. Bridge should auto-connect
# 3. Check bridge terminal for "✅ Connected to OBS"

# If connection fails:
# - Verify OBS WebSocket is enabled
# - Check port 4455 is not blocked
# - Verify password matches (if set)
```

### 6. Test Video Quality Controls

```bash
# In the app:
# 1. Go to Stream Control tab
# 2. Click "🎬 Video Quality"
# 3. Try "High Quality" preset
# 4. Click "Apply to OBS"
# 5. Check bridge terminal for success message
```

### 7. Test Streaming

```bash
# In OBS:
# 1. Settings → Stream
# 2. Service: YouTube - RTMPS
# 3. Server: Primary YouTube ingest server
# 4. Stream Key: (get from YouTube Studio)

# In the app:
# 1. Click "Start Streaming" button
# 2. Watch Health Monitor
# 3. Verify stream appears on YouTube

# When done:
# 1. Click "Stop Streaming"
```

---

## Troubleshooting

### Common Issues

<details>
<summary><b>Error: "Cannot find module '@shared/option'"</b></summary>

**Solution**:
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

</details>

<details>
<summary><b>Error: "Port 8090 already in use"</b></summary>

**Solution**:
```bash
# Find process using port 8090
# Linux/macOS:
lsof -ti:8090 | xargs kill -9

# Windows:
netstat -ano | findstr :8090
taskkill /PID <PID> /F
```

</details>

<details>
<summary><b>Bridge can't connect to OBS</b></summary>

**Checklist**:
1. ✅ OBS is running
2. ✅ WebSocket server is enabled (Tools → WebSocket Server Settings)
3. ✅ Port 4455 is correct
4. ✅ Password matches (or is blank)
5. ✅ Firewall allows connection

**Test manually**:
```bash
# Install wscat
npm install -g wscat

# Test connection
wscat -c ws://127.0.0.1:4455
# Should show: Connected
```

</details>

<details>
<summary><b>PocketBase admin UI won't load</b></summary>

**Solution**:
```bash
# Verify PocketBase is running
curl http://127.0.0.1:8090/api/health
# Should return: {"code":200,"message":"API is healthy","data":{}}

# If not running, start it:
cd pocketbase/local
./pocketbase serve

# Check logs for errors
```

</details>

<details>
<summary><b>Build fails with "Cannot find Rust"</b></summary>

**Solution**:
```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Restart terminal
source $HOME/.cargo/env

# Verify
rustc --version
cargo --version

# Try build again
npm run tauri:build
```

</details>

<details>
<summary><b>"ENOSPC: System limit for number of file watchers reached"</b></summary>

**Solution (Linux only)**:
```bash
# Increase file watcher limit
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

</details>

---

## Production Deployment

### Deploy Web App to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
cd sanctuary-app
vercel --prod

# Set environment variables in Vercel dashboard:
# VITE_PB_URL=https://your-pocketbase.pockethost.io
# VITE_STREAM_ID=your_stream_id
```

### Deploy PocketBase to PocketHost

```bash
# 1. Sign up at https://pockethost.io
# 2. Create new instance
# 3. Upload schema:
#    - Export from local: pocketbase/collections_export.json
#    - Import in PocketHost admin UI
# 4. Update .env files with new URL
```

### Run Bridge as System Service

<details>
<summary><b>Linux (systemd)</b></summary>

```bash
# Create service file
sudo nano /etc/systemd/system/sanctuary-bridge.service

# Paste:
[Unit]
Description=Sanctuary Stream Bridge
After=network.target

[Service]
Type=simple
User=youruser
WorkingDirectory=/path/to/sanctuary-stream/sanctuary-bridge
ExecStart=/usr/bin/node dist/index.js
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target

# Enable and start
sudo systemctl enable sanctuary-bridge
sudo systemctl start sanctuary-bridge
sudo systemctl status sanctuary-bridge
```

</details>

<details>
<summary><b>macOS (launchd)</b></summary>

```bash
# Create plist file
nano ~/Library/LaunchAgents/com.sanctuary.bridge.plist

# Paste:
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.sanctuary.bridge</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/node</string>
        <string>/path/to/sanctuary-stream/sanctuary-bridge/dist/index.js</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
</dict>
</plist>

# Load service
launchctl load ~/Library/LaunchAgents/com.sanctuary.bridge.plist
```

</details>

<details>
<summary><b>Windows (NSSM)</b></summary>

```powershell
# Download NSSM
# Visit: https://nssm.cc/download

# Install service
nssm install SanctuaryBridge "C:\Program Files\nodejs\node.exe"
nssm set SanctuaryBridge AppDirectory "C:\path\to\sanctuary-stream\sanctuary-bridge"
nssm set SanctuaryBridge AppParameters "dist\index.js"
nssm set SanctuaryBridge AppEnvironmentExtra "NODE_ENV=production"
nssm set SanctuaryBridge Start SERVICE_AUTO_START

# Start service
nssm start SanctuaryBridge
```

</details>

---

## Next Steps

### After Installation

1. ✅ **Test Everything** - Run a test stream with OBS
2. ✅ **Configure Quality** - Set video/audio settings for your needs
3. ✅ **Setup YouTube** - Connect OBS to your YouTube channel
4. ✅ **Invite Team** - Create accounts for pastors/techs
5. ✅ **Read Docs** - Check `/docs` folder for guides

### Resources

- **Video Quality Guide**: `docs/PROFESSIONAL_VIDEO_GUIDE.md`
- **Performance Tuning**: `PERFORMANCE_OPTIMIZATIONS.md`
- **Platform Builds**: `MULTI_PLATFORM_BUILD_STATUS.md`
- **Troubleshooting**: This guide's Troubleshooting section

---

## Support

**Issues?** Open a GitHub issue with:
- Your OS and version
- Node.js version (`node --version`)
- Error messages (full output)
- Steps to reproduce

**Questions?** Check existing documentation first, then open a discussion on GitHub.

---

## 🎉 You're Done!

Your Sanctuary Stream is now installed and ready to use!

**Start streaming your church services in professional quality! 🎥**

---

**Last updated**: 2026-02-28
**Version**: 0.1.0
