# 🚀 Complete Installation Guide - All Platforms

**Step-by-step installation for Desktop, Mobile, Web, and Station (Streaming Computer)**

---

## 📖 Table of Contents

1. [Desktop Installation](#desktop-installation) (macOS, Windows, Linux)
2. [Mobile Installation](#mobile-installation) (iOS, Android)
3. [Web Access](#web-access) (No installation needed)
4. [Station Setup](#station-setup) (Streaming computer with OBS)
5. [PocketBase Setup](#pocketbase-setup) (Backend configuration)

---

## 🖥️ Desktop Installation

### macOS

**Requirements:**
- macOS 11 Big Sur or later
- Intel or Apple Silicon (Universal build)

**Installation:**
1. Download: `Sanctuary-Stream-universal.dmg`
   - From: https://github.com/sanctuary-stream/sanctuary-stream/releases/latest

2. Open the DMG file (double-click)

3. Drag **Sanctuary Stream** to **Applications** folder

4. Open **Applications** folder and launch **Sanctuary Stream**

5. **First Launch:**
   - Right-click the app → **Open** (to bypass Gatekeeper)
   - Click **Open** in the security dialog

6. **Setup Wizard will appear:**
   - Enter your PocketBase URL
   - Login with your credentials
   - App will configure itself automatically

**Troubleshooting:**
- **"App is damaged"** → Run: `xattr -cr /Applications/Sanctuary\ Stream.app`
- **"Cannot be opened"** → Right-click → Open (don't double-click)

---

### Windows

**Requirements:**
- Windows 10 (64-bit) or later
- Windows 11 supported

**Installation:**
1. Download: `Sanctuary-Stream-x64.msi`
   - From: https://github.com/sanctuary-stream/sanctuary-stream/releases/latest

2. Double-click the MSI installer

3. **SmartScreen warning may appear:**
   - Click: **More info**
   - Click: **Run anyway**

4. Follow the installation wizard:
   - Accept the license
   - Choose installation folder (default: `C:\Program Files\Sanctuary Stream`)
   - Click **Install**

5. Launch from:
   - Start Menu → **Sanctuary Stream**
   - Desktop shortcut (if created)

6. **Setup Wizard will appear:**
   - Enter your PocketBase URL
   - Login with your credentials
   - App will configure itself automatically

**Troubleshooting:**
- **"Windows protected your PC"** → Click "More info" → "Run anyway"
- **"Can't install"** → Run as Administrator (right-click → Run as administrator)

---

### Linux

#### Option A: Debian/Ubuntu (DEB Package)

**Requirements:**
- Ubuntu 20.04+ or Debian 11+
- 64-bit system

**Installation:**
```bash
# Download DEB package
wget https://github.com/sanctuary-stream/sanctuary-stream/releases/latest/download/sanctuary-stream_amd64.deb

# Install
sudo dpkg -i sanctuary-stream_amd64.deb

# If dependencies are missing:
sudo apt-get install -f

# Launch
sanctuary-stream
```

#### Option B: Any Distribution (AppImage)

**Requirements:**
- Any Linux distribution
- 64-bit system

**Installation:**
```bash
# Download AppImage
wget https://github.com/sanctuary-stream/sanctuary-stream/releases/latest/download/sanctuary-stream_amd64.AppImage

# Make executable
chmod +x sanctuary-stream_amd64.AppImage

# Run
./sanctuary-stream_amd64.AppImage
```

**Optional: Desktop Integration**
```bash
# Move to applications folder
sudo mv sanctuary-stream_amd64.AppImage /opt/sanctuary-stream

# Create desktop entry
cat > ~/.local/share/applications/sanctuary-stream.desktop << EOF
[Desktop Entry]
Name=Sanctuary Stream
Exec=/opt/sanctuary-stream
Icon=sanctuary-stream
Type=Application
Categories=Audio;Video;AudioVideo;
EOF
```

**Troubleshooting:**
- **"Permission denied"** → Run: `chmod +x sanctuary-stream_amd64.AppImage`
- **"FUSE not found"** → Install: `sudo apt install fuse libfuse2`

---

## 📱 Mobile Installation

### iOS (iPhone & iPad)

**Requirements:**
- iOS 13.0 or later
- iPhone, iPad, or iPod touch

**Installation:**

**Option A: App Store (Coming Soon)**
1. Open **App Store**
2. Search: "Sanctuary Stream"
3. Tap: **Get** → **Install**
4. Open the app
5. Follow setup wizard

**Option B: TestFlight (Beta)**
1. Install **TestFlight** from App Store (if not installed)
2. Visit the TestFlight invitation link (provided by admin)
3. Tap: **Accept** → **Install**
4. Open **Sanctuary Stream** from home screen
5. Follow setup wizard

**Option C: Build from Source**
```bash
# Requires Xcode and Apple Developer account
git clone https://github.com/sanctuary-stream/sanctuary-stream.git
cd sanctuary-stream/sanctuary-app
npm install
npm run capacitor:sync:ios
npx cap open ios

# In Xcode: Select your device and click Run
```

---

### Android

**Requirements:**
- Android 8.0 (API 26) or later
- 100MB+ free space

**Installation:**

**Option A: Google Play Store (Coming Soon)**
1. Open **Google Play Store**
2. Search: "Sanctuary Stream"
3. Tap: **Install**
4. Open the app
5. Follow setup wizard

**Option B: Direct APK Install**
1. Download: `sanctuary-stream-release.apk`
   - From: https://github.com/sanctuary-stream/sanctuary-stream/releases/latest

2. **Enable Unknown Sources:**
   - Settings → Security → Unknown Sources → Enable
   - Or: Settings → Apps → Special access → Install unknown apps → Chrome → Allow

3. Open the downloaded APK file
4. Tap: **Install**
5. Tap: **Open**
6. Follow setup wizard

**Option C: Build from Source**
```bash
git clone https://github.com/sanctuary-stream/sanctuary-stream.git
cd sanctuary-stream/sanctuary-app
npm install
npm run capacitor:sync:android
npx cap open android

# In Android Studio: Select your device and click Run
```

**Troubleshooting:**
- **"App not installed"** → Enable Unknown Sources in settings
- **"Parse error"** → Re-download APK (file may be corrupted)
- **"Insufficient storage"** → Free up at least 100MB space

---

## 🌐 Web Access

**No installation needed!** Access from any browser.

### Hosted Web App

**URL:** https://sanctuary-stream.vercel.app  
*(Or your custom deployment URL)*

**Requirements:**
- Modern browser (Chrome, Firefox, Safari, Edge)
- Internet connection

**Usage:**
1. Open your browser
2. Visit: https://sanctuary-stream.vercel.app
3. **Setup Wizard will appear:**
   - Enter your PocketBase URL
   - Login with your credentials
4. **Bookmark the page** for quick access

**Progressive Web App (PWA):**
You can "install" the web app for offline access:

- **Chrome (Desktop):**
  - Click the **⊕ Install** icon in the address bar
  - Click **Install**

- **Chrome (Android):**
  - Menu (⋮) → **Add to Home Screen**

- **Safari (iOS):**
  - Share button → **Add to Home Screen**

**Benefits of PWA:**
- Works offline (cached)
- Appears like a native app
- Faster loading
- Push notifications (if enabled)

---

## 🖥️ Station Setup (Streaming Computer)

**The Station is your streaming computer running OBS + Bridge.**

### Quick Start

```bash
# 1. Install OBS Studio
# Download from: https://obsproject.com/

# 2. Clone Sanctuary Stream
git clone https://github.com/sanctuary-stream/sanctuary-stream.git
cd sanctuary-stream

# 3. Install dependencies
npm install

# 4. Configure Bridge
cd sanctuary-bridge
cp .env.example .env
nano .env  # Edit with your settings

# 5. Build and start
npm run build
npm start
```

### Detailed Setup

For complete Station setup including:
- OBS configuration
- WebSocket setup
- PocketBase connection
- YouTube/Facebook streaming
- Google Drive auto-upload
- Running as a service

**See:** [**STATION_SETUP.md**](./STATION_SETUP.md) (Complete guide)

---

## ☁️ PocketBase Setup

You need a PocketBase backend to connect all your devices.

### Option 1: PocketHost (Cloud - Recommended)

**Perfect for: Remote teams, multi-campus churches, easy setup**

#### Step 1: Create Account
1. Visit: https://pockethost.io
2. Click: **Sign Up**
3. Verify your email

#### Step 2: Create Instance
1. Click: **Create Instance**
2. **Instance Name:** `sanctuary-stream` (or your church name)
3. **Region:** Choose closest to you
4. Click: **Create**
5. Your URL: `https://sanctuary-stream.pockethost.io`

#### Step 3: Apply Schema
1. In PocketHost dashboard, click your instance
2. Go to: **Collections**
3. Click: **Import collections**
4. Upload: `pocketbase/pb_schema.json` (from this repo)
5. Or manually create collections:

**Users Collection:**
- Type: Auth collection
- Fields: email, password, role (string)

**Commands Collection:**
- Type: Base collection
- Fields:
  - `stream_id` (relation to streams)
  - `action` (string: START, STOP, etc.)
  - `payload` (JSON)
  - `status` (string: pending, completed, failed)
  - `correlation_id` (string)

**Streams Collection:**
- Type: Base collection
- Fields:
  - `name` (string)
  - `status` (string: idle, live, recording)
  - `metadata` (JSON)
  - `heartbeat` (date)

#### Step 4: Create Admin
1. Go to: **Admins** tab
2. Create your admin account
3. Email: `admin@yourdomain.com`
4. Password: (secure password)

#### Step 5: Create Users
Create these users in the **Users** collection:

**Bridge Service Account (Required):**
- Email: `bridge@yourdomain.com`
- Password: (secure password - you'll need this for .env)
- Role: `bridge`

**Pastor Account:**
- Email: `pastor@yourdomain.com`
- Password: (secure password)
- Role: `pastor`

**Tech Account:**
- Email: `tech@yourdomain.com`
- Password: (secure password)
- Role: `admin`

#### Step 6: Create Stream Record
1. Go to: **Streams** collection
2. Click: **New record**
3. Fill in:
   - **Name:** "Main Sanctuary Stream"
   - **Status:** "idle"
   - **Metadata:** `{}` (empty JSON object)
4. Click: **Create**
5. **Copy the Record ID** (shown in the URL or record details)
   - Example: `abc123def456ghi789`
   - You'll need this for the Bridge `.env` file

#### Step 7: Configure API Access
1. Go to: **Settings → API Rules**
2. Ensure collections have proper permissions:
   - **Users:** Auth required for read/write
   - **Commands:** Auth required for create, anyone can read
   - **Streams:** Auth required for write, anyone can read

**Your PocketHost URL:** `https://sanctuary-stream.pockethost.io`  
**Bridge Service Account:** `bridge@yourdomain.com` / your-password  
**Stream ID:** `abc123def456ghi789`

---

### Option 2: Self-Hosted PocketBase

**Perfect for: On-premise only, maximum control, no internet dependency**

#### Prerequisites
- Server or computer (Windows, macOS, Linux)
- Port 8090 available (or choose custom)

#### Installation

**macOS/Linux:**
```bash
# Download PocketBase
cd sanctuary-stream/pocketbase
curl -L -O https://github.com/pocketbase/pocketbase/releases/latest/download/pocketbase_linux_amd64.zip
unzip pocketbase_linux_amd64.zip

# Make executable
chmod +x pocketbase

# Run
./pocketbase serve --http=0.0.0.0:8090
```

**Windows:**
```powershell
# Download from: https://github.com/pocketbase/pocketbase/releases/latest
# Extract pocketbase.exe to: C:\sanctuary-stream\pocketbase\

# Run
cd C:\sanctuary-stream\pocketbase
.\pocketbase.exe serve --http=0.0.0.0:8090
```

#### Setup
1. **Access Admin UI:**
   - Open: `http://localhost:8090/_/`
   - Or: `http://YOUR_SERVER_IP:8090/_/`

2. **Create Admin Account:**
   - Email: `admin@local.dev`
   - Password: (secure password)

3. **Apply Schema:**
   - Import `pb_schema.json`
   - Or create collections manually (same as Option 1)

4. **Create Users:**
   - Same as Option 1, Step 5

5. **Create Stream Record:**
   - Same as Option 1, Step 6

**Your PocketBase URL:** `http://YOUR_SERVER_IP:8090`  
**Bridge Service Account:** `bridge@yourdomain.com` / your-password  
**Stream ID:** `abc123def456ghi789`

#### Run as Service

**Linux (Systemd):**
```bash
sudo nano /etc/systemd/system/pocketbase.service
```

```ini
[Unit]
Description=PocketBase
After=network.target

[Service]
Type=simple
User=YOUR_USERNAME
WorkingDirectory=/home/YOUR_USERNAME/sanctuary-stream/pocketbase
ExecStart=/home/YOUR_USERNAME/sanctuary-stream/pocketbase/pocketbase serve --http=0.0.0.0:8090
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable pocketbase
sudo systemctl start pocketbase
```

---

### Option 3: Local Development

**Perfect for: Testing, development, learning**

```bash
cd sanctuary-stream
npm run setup

# This creates:
# - Local PocketBase on port 8090
# - Admin account
# - Test users (pastor@local.dev, bridge@local.dev)
# - Sample stream record
# - Pre-configured .env files
```

**Auto-created credentials:**
- **PocketBase URL:** `http://127.0.0.1:8090`
- **Admin:** `admin@local.dev` / `admin123456`
- **Pastor:** `pastor@local.dev` / `pastor123456`
- **Bridge:** `bridge@local.dev` / `bridge123456`
- **Stream ID:** Auto-generated (check .env files)

---

## 🔗 Connecting Everything Together

### Complete Flow

1. **PocketBase Backend** (Cloud or self-hosted)
   - Stores user accounts
   - Stores stream status
   - Handles authentication
   - Routes commands

2. **Station (Streaming Computer)**
   - Runs OBS Studio (video mixing)
   - Runs Sanctuary Bridge (OBS controller)
   - Connects to PocketBase
   - Executes streaming commands
   - Streams to YouTube/Facebook

3. **Remote Apps** (Desktop/Mobile/Web)
   - Connect to PocketBase
   - Send commands (Start/Stop streaming)
   - View real-time status
   - Configure stream settings

### Example Setup for "First Baptist Church"

**PocketHost Instance:**
- URL: `https://first-baptist.pockethost.io`
- Admin: `admin@firstbaptist.org`

**Users:**
- Pastor: `pastor@firstbaptist.org` (role: pastor)
- Tech: `tech@firstbaptist.org` (role: admin)
- Bridge: `bridge@firstbaptist.org` (role: bridge)

**Station (Tech Booth Computer):**
- Computer: Windows PC with OBS Studio
- Bridge: Configured with `bridge@firstbaptist.org` credentials
- Stream ID: `stream_main_sanctuary`
- YouTube: Configured to stream to church channel

**Remote Devices:**
- Pastor's iPhone: Sanctuary Stream app installed
- Tech's iPad: Sanctuary Stream app installed
- Volunteer's laptop: Web app bookmarked

**Workflow:**
1. Tech opens OBS and starts Bridge on Station computer
2. Pastor opens app on iPhone, logs in as `pastor@firstbaptist.org`
3. Service starts, Pastor taps "Start Streaming"
4. Bridge receives command, tells OBS to start streaming
5. Stream goes live on YouTube
6. All devices show "LIVE" status in real-time
7. Service ends, Pastor taps "Stop Streaming"
8. Recording auto-uploads to Google Drive

---

## 🎯 Quick Reference

### Installation URLs
- **Desktop Releases:** https://github.com/sanctuary-stream/sanctuary-stream/releases/latest
- **Web App:** https://sanctuary-stream.vercel.app
- **PocketHost:** https://pockethost.io
- **OBS Studio:** https://obsproject.com/download
- **Node.js:** https://nodejs.org/

### Documentation
- **Station Setup:** [STATION_SETUP.md](./STATION_SETUP.md)
- **OBS Integration:** [OBS_INTEGRATION.md](./OBS_INTEGRATION.md)
- **Multi-Backend:** [MULTI_BACKEND.md](./MULTI_BACKEND.md)
- **Quick Reference:** [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
- **User Guide:** [USER_GUIDE.md](./USER_GUIDE.md)

### Support
- **GitHub Issues:** https://github.com/sanctuary-stream/sanctuary-stream/issues
- **Documentation:** https://github.com/sanctuary-stream/sanctuary-stream/tree/main/docs

---

## ✅ Installation Checklist

### For End Users (Remote Control)
- [ ] Desktop/Mobile/Web app installed
- [ ] PocketBase URL configured
- [ ] User account created
- [ ] Logged in successfully
- [ ] Can see stream status

### For Station (Streaming Computer)
- [ ] OBS Studio installed and configured
- [ ] OBS WebSocket enabled
- [ ] Node.js installed
- [ ] Sanctuary Bridge installed
- [ ] Bridge `.env` configured
- [ ] Bridge tested and connected
- [ ] YouTube/Facebook configured
- [ ] Bridge running as service (optional)

### For Backend (PocketBase)
- [ ] PocketHost account created (or self-hosted setup)
- [ ] Collections created
- [ ] Admin account created
- [ ] User accounts created
- [ ] Stream record created
- [ ] API permissions configured

---

**🎉 You're ready to stream!**

**Built with ❤️ for churches everywhere**
