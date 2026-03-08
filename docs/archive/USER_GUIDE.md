# 📥 Installation & User Guide

**Complete guide to installing and using Sanctuary Stream with OBS Studio**

---

## 🎯 What is Sanctuary Stream?

Sanctuary Stream is a **zero-trust church streaming control system** that lets you remotely control OBS Studio for live streaming church services. It works on desktop, mobile, and web with real-time updates across all devices.

**Perfect for:**
- Churches with remote tech teams
- Multi-campus churches
- Churches with multiple streaming locations
- Anyone who wants secure, remote OBS control

---

## 📋 Prerequisites

### Required Software

**1. OBS Studio (Required)**
- Download: https://obsproject.com/download
- Version: 28.0 or later
- Platforms: Windows, macOS, Linux

**2. OBS WebSocket Plugin**
- Included with OBS Studio 28+
- Enable in OBS: **Tools → WebSocket Server Settings**
- Set a password (you'll need this later)

**3. Sanctuary Stream (Choose one)**
- Desktop app (recommended for tech booth)
- Mobile app (for pastors/remote control)
- Web app (works anywhere)

---

## 💿 Installation

### Option 1: Desktop Installation (Recommended)

#### macOS
```bash
# Download the Universal DMG (works on Intel and Apple Silicon)
# From: https://github.com/sanctuary-stream/sanctuary-stream/releases/latest

# 1. Download Sanctuary-Stream-universal.dmg
# 2. Open the DMG file
# 3. Drag Sanctuary Stream to Applications folder
# 4. Open Applications and launch Sanctuary Stream

# First time: Right-click → Open (bypass Gatekeeper)
```

#### Windows
```bash
# Download the MSI installer
# From: https://github.com/sanctuary-stream/sanctuary-stream/releases/latest

# 1. Download Sanctuary-Stream-x64.msi
# 2. Double-click to run installer
# 3. Follow installation wizard
# 4. Launch from Start Menu or Desktop shortcut

# Windows may show SmartScreen warning - click "More info" → "Run anyway"
```

#### Linux (Ubuntu/Debian)
```bash
# Download DEB package
wget https://github.com/sanctuary-stream/sanctuary-stream/releases/latest/download/sanctuary-stream_amd64.deb

# Install
sudo dpkg -i sanctuary-stream_amd64.deb

# If dependencies missing:
sudo apt-get install -f

# Launch
sanctuary-stream
```

#### Linux (Any Distribution - AppImage)
```bash
# Download AppImage
wget https://github.com/sanctuary-stream/sanctuary-stream/releases/latest/download/sanctuary-stream_amd64.AppImage

# Make executable
chmod +x sanctuary-stream_amd64.AppImage

# Run
./sanctuary-stream_amd64.AppImage
```

---

### Option 2: Mobile Installation

#### iOS
```bash
# Coming soon to App Store
# Search for "Sanctuary Stream" in the App Store
```

#### Android
```bash
# Coming soon to Google Play
# Search for "Sanctuary Stream" in Google Play Store

# Or sideload APK:
# Download sanctuary-stream.apk from releases
# Enable "Install from Unknown Sources" in Settings
# Open APK file to install
```

---

### Option 3: Web App (No Installation)

**Visit:** https://sanctuary-stream.vercel.app

**Advantages:**
- No installation required
- Works on any device with a browser
- Always up-to-date
- Cross-platform (Windows, Mac, Linux, iPad, etc.)

**Disadvantages:**
- Requires internet connection
- No offline mode
- Slightly slower than desktop app

---

## 🔧 Initial Setup

### Step 1: Install and Configure OBS Studio

**1. Install OBS Studio:**
```bash
# Download from: https://obsproject.com/download
# Install for your platform
```

**2. Enable OBS WebSocket:**
```
1. Open OBS Studio
2. Go to: Tools → WebSocket Server Settings
3. Check "Enable WebSocket server"
4. Set Server Port: 4455 (default)
5. Set Password: Choose a secure password
6. Click "Show Connect Info" to see connection details
7. Click OK
```

**Important:** Remember your WebSocket password! You'll need it to connect Sanctuary Stream to OBS.

---

### Step 2: Set Up Sanctuary Stream Backend

**Choose deployment option:**

#### Option A: Local Setup (Easiest - Recommended for Testing)

```bash
# 1. Clone repository (or download release source)
git clone https://github.com/sanctuary-stream/sanctuary-stream.git
cd sanctuary-stream

# 2. Install dependencies
npm install

# 3. Configure environment
export PB_SANCTUARY_STREAM_ADMIN_PASSWORD_LOCAL="YourSecurePassword123"

# 4. Setup database
npm run setup

# 5. Start all services
npm run dev

# Services will start:
# - PocketBase: http://127.0.0.1:8090
# - Bridge: Connecting to OBS
# - Frontend: http://localhost:5173
```

**Default login:**
- Email: `pastor@local.dev`
- Password: `pastor123456`

#### Option B: Cloud Setup (Recommended for Production)

**Using PocketHost (Managed):**

```bash
# 1. Sign up at https://pockethost.io (free tier available)

# 2. Create new instance
# - Name: sanctuary-stream
# - Region: Choose closest to you

# 3. Get your PocketHost URL
# Example: https://sanctuary-stream.pockethost.io

# 4. In Sanctuary Stream app, set backend URL:
# Settings → Backend URL → https://sanctuary-stream.pockethost.io

# 5. Deploy migrations
npm run setup:production
```

---

### Step 3: Connect OBS to Sanctuary Stream

**1. Launch Sanctuary Stream**

**2. Configure Bridge Connection:**

```bash
# If running locally with bridge:
cd sanctuary-bridge

# Create .env file:
cat > .env << 'EOF'
OBS_WEBSOCKET_URL=ws://localhost:4455
OBS_WEBSOCKET_PASSWORD=your-obs-password-here
POCKETBASE_URL=http://127.0.0.1:8090
EOF

# Start bridge:
npm start

# You should see:
# ✅ Connected to OBS Studio
# ✅ Connected to PocketBase
```

**3. Verify Connection:**
- Open Sanctuary Stream app
- Look for green "Connected" indicator
- Status should show "OBS Connected"

---

## 🎮 Using Sanctuary Stream

### Dashboard Overview

**Status Panel:**
- **Stream Status:** Live / Idle / Recording / Error
- **Connection Status:** OBS connection indicator
- **Stream Duration:** How long you've been live
- **YouTube URL:** Your stream's public URL

**Control Buttons:**
- 🔴 **Start Stream** - Begin broadcasting
- ⏹️ **Stop Stream** - End broadcast
- ⚫ **Start Recording** - Record locally
- ⏸️ **Stop Recording** - Stop recording

---

### Starting Your First Stream

**1. Prepare OBS:**
```
1. Open OBS Studio
2. Set up your scenes (e.g., "Worship", "Sermon", "Announcements")
3. Configure your streaming settings:
   - Settings → Stream
   - Service: YouTube, Facebook, etc.
   - Stream Key: (from your streaming platform)
4. Test your audio and video sources
```

**2. Launch Sanctuary Stream:**
```
1. Open Sanctuary Stream app
2. Login with your credentials
3. Wait for green "Connected" status
```

**3. Start Streaming:**
```
1. Click "Start Stream" button
2. Status changes to "Live"
3. OBS starts broadcasting
4. YouTube URL appears (if configured)
5. Duration counter starts
```

**4. Control Your Stream:**
```
- Switch scenes in OBS as normal
- Monitor status in Sanctuary Stream
- Use any device with Sanctuary Stream to control OBS
- All connected devices see real-time updates
```

**5. End Stream:**
```
1. Click "Stop Stream" button
2. Status returns to "Idle"
3. OBS stops broadcasting
4. Final duration displayed
```

---

### Recording Services

**Start Recording:**
```
1. Click "Start Recording" button
2. Status shows "Recording"
3. OBS saves video to configured location
```

**Stop Recording:**
```
1. Click "Stop Recording" button
2. Recording file saved
3. Status returns to previous state
```

**Recording Location:**
- OBS saves recordings to: Settings → Output → Recording Path
- Default: Videos/OBS Recordings

---

## 🔐 User Roles & Permissions

### Admin
- Full system control
- User management
- Settings configuration
- View logs

### Pastor
- Start/stop streaming
- Start/stop recording
- View status
- No user management

### Tech
- Start/stop streaming
- Start/stop recording
- View status
- Limited settings access

**To add users:**
```
1. Login as admin
2. Go to Users section
3. Click "Add User"
4. Fill in details:
   - Email
   - Password
   - Role (admin/pastor/tech)
5. Save
```

---

## 📱 Multi-Device Setup

### Scenario: Pastor Controls from Phone

**Setup:**
```
1. Install Sanctuary Stream on pastor's iPhone/Android
2. Login with pastor credentials
3. Pastor can start/stop stream from phone
4. Tech team sees status change in real-time on desktop
5. Everyone stays synchronized
```

### Scenario: Multi-Campus Church

**Setup:**
```
1. Deploy Sanctuary Stream to cloud (PocketHost)
2. Each campus installs desktop app
3. Connect each campus's OBS to local bridge
4. All bridges connect to same PocketBase instance
5. Central team can control any campus
6. Each campus can control their own stream
```

---

## 🔍 Troubleshooting

### Issue: Can't Connect to OBS

**Check:**
1. Is OBS Studio running?
2. Is WebSocket enabled in OBS?
   - Tools → WebSocket Server Settings → Enable
3. Is password correct?
4. Is OBS on same computer as bridge?
   - If not, change URL to: `ws://obs-computer-ip:4455`
5. Is firewall blocking port 4455?

**Solution:**
```bash
# Test OBS WebSocket:
curl ws://localhost:4455

# If fails, check OBS settings:
# Tools → WebSocket Server Settings
# Verify "Enable WebSocket server" is checked
```

---

### Issue: "Not Connected" Status

**Check:**
1. Is PocketBase running?
   - Local: http://127.0.0.1:8090
   - Cloud: Check PocketHost dashboard
2. Is bridge running?
   - Check bridge terminal for errors
3. Is network connection stable?

**Solution:**
```bash
# Restart bridge:
cd sanctuary-bridge
npm start

# Check PocketBase:
curl http://127.0.0.1:8090/api/health
```

---

### Issue: Stream Starts But No Video

**This is an OBS configuration issue, not Sanctuary Stream.**

**Check:**
1. OBS streaming settings configured?
   - Settings → Stream → Service & Stream Key
2. Scenes have video sources?
3. Audio sources working?
4. Bandwidth sufficient?

**Solution:**
```
1. Open OBS Studio
2. Settings → Stream
3. Verify Service and Stream Key
4. Test in OBS directly (Start Streaming button)
5. If OBS works, Sanctuary Stream will work
```

---

### Issue: Multiple Users Out of Sync

**This shouldn't happen with proper setup.**

**Check:**
1. All users connected to same PocketBase instance?
2. Real-time connections established?
3. Network latency issues?

**Solution:**
```bash
# Verify PocketBase URL matches:
# In each app: Settings → Backend URL

# Should all be:
# http://127.0.0.1:8090 (local)
# OR
# https://your-app.pockethost.io (cloud)
```

---

## 🎥 Advanced: Multiple Streaming Platforms

**Stream to YouTube + Facebook simultaneously:**

```
1. In OBS: Install "Multiple RTMP Output" plugin
2. Configure multiple stream targets:
   - YouTube: rtmp://a.rtmp.youtube.com/live2/YOUR_KEY
   - Facebook: rtmps://live-api-s.facebook.com:443/rtmp/YOUR_KEY
3. Sanctuary Stream controls all streams together
```

---

## 📊 System Requirements

### Desktop App
- **macOS:** 10.13 (High Sierra) or later
- **Windows:** Windows 10/11, 64-bit
- **Linux:** Ubuntu 20.04+ or equivalent
- **RAM:** 50-100 MB
- **Disk:** 10 MB

### Mobile App
- **iOS:** 13.0 or later
- **Android:** API level 24 (Android 7.0) or later

### Web App
- **Any modern browser:**
  - Chrome 90+
  - Firefox 88+
  - Safari 14+
  - Edge 90+

### Network Requirements
- **Local:** No internet required (if running locally)
- **Cloud:** Stable internet connection
- **Bandwidth:** Minimal (< 1 Mbps for control)
- **Latency:** < 500ms recommended

---

## 🔄 Updates

**Desktop App:**
- Auto-updates enabled by default
- App checks for updates on startup
- Download and install automatically

**Mobile App:**
- Updates via App Store / Google Play
- Enable automatic updates in store settings

**Web App:**
- Always up-to-date
- No manual updates required

---

## 🆘 Getting Help

### Documentation
- 📘 [Quickstart Guide](./QUICKSTART.md)
- 🏗️ [Build & Run Guide](./BUILD_AND_RUN.md)
- 🧪 [Functional Style Guide](./FUNCTIONAL_STYLE.md)
- 🌍 [Multi-Platform Deployment](./MULTI_PLATFORM_CLOUD.md)

### Support Channels
- 🐛 **Issues:** https://github.com/sanctuary-stream/sanctuary-stream/issues
- 💬 **Discussions:** https://github.com/sanctuary-stream/sanctuary-stream/discussions
- 📧 **Email:** support@sanctuary-stream.com

### Community
- Join our Discord (coming soon)
- Follow on Twitter: @SanctuaryStream
- YouTube tutorials (coming soon)

---

## 🎓 Training Videos

**Coming Soon:**
- Installation and setup (10 minutes)
- First stream walkthrough (15 minutes)
- Multi-device configuration (20 minutes)
- Troubleshooting common issues (15 minutes)

---

## 📄 License

Open source under MIT License. Free for churches and ministries worldwide.

---

## 🙏 Credits

Built with love for churches by developers who understand ministry needs.

**Technologies:**
- Tauri (multi-platform framework)
- Rust (performance & security)
- React (user interface)
- PocketBase (backend & database)
- OBS Studio (streaming)

---

**🎥 Happy streaming! May your services reach people around the world.**

**Questions? Open an issue or discussion on GitHub!**
