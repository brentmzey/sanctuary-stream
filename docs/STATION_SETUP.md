# 🖥️ Station Setup Guide (Streaming Computer)

**Complete guide to setting up the "Station" - your streaming computer running OBS + Sanctuary Bridge**

---

## 🎯 What is the Station?

The **Station** is your powerful PC or Mac in the tech booth that:
- Runs **OBS Studio** (for mixing video/audio and streaming)
- Runs **Sanctuary Bridge** (connects OBS to the cloud)
- Receives commands from **Remote Apps** (phones, tablets, laptops)
- Streams to **YouTube, Facebook, or custom RTMP** servers

**Architecture:**
```
Remote App (Phone) → PocketBase Cloud → Station (Bridge + OBS) → YouTube/Facebook
```

---

## 📋 Prerequisites

### Hardware Requirements
- **CPU:** Intel i5/AMD Ryzen 5 or better (i7/Ryzen 7 recommended for 4K)
- **RAM:** 8GB minimum (16GB recommended)
- **GPU:** Dedicated graphics card recommended (for hardware encoding)
- **Storage:** 100GB+ free space (for recordings)
- **Internet:** 5+ Mbps upload for HD streaming

### Software Requirements
✅ **OBS Studio 28.0+** (required)
✅ **Node.js 18+** (required for Bridge)
✅ **Git** (optional, for updates)

---

## 🚀 Step-by-Step Setup

### Step 1: Install OBS Studio

#### Download OBS
1. Visit: https://obsproject.com/download
2. Download for your OS:
   - **Windows:** OBS-Studio-XX.X-Full-Installer.exe
   - **macOS:** OBS-Studio-XX.X-macOS.dmg
   - **Linux:** Follow distro instructions

#### Install OBS
- **Windows:** Run installer, accept defaults
- **macOS:** Drag OBS to Applications
- **Linux:** `sudo apt install obs-studio` or use Flatpak

#### Configure OBS
1. Launch OBS Studio
2. Run the **Auto-Configuration Wizard** (appears on first launch)
   - Select: "Optimize for streaming"
   - Platform: YouTube (or your platform)
   - Enter dummy stream key for now
   - Let OBS test your hardware

3. **Important:** Note your settings from Output tab:
   - Video resolution (1920x1080 recommended)
   - FPS (30 recommended for churches)
   - Encoder (use hardware if available: NVENC, AMD, QuickSync)

---

### Step 2: Enable OBS WebSocket

The Bridge communicates with OBS via WebSocket protocol.

#### Enable WebSocket (OBS 28+)
1. In OBS, go to: **Tools → WebSocket Server Settings**
2. Check **"Enable WebSocket server"**
3. **Server Port:** `4455` (default, don't change)
4. **Enable Authentication:** ☑️ (RECOMMENDED)
5. **Set a password** (you'll need this for the Bridge)
   - Example: `obs-secure-2024`
   - Write it down!
6. Click **Apply** and **OK**

#### Test WebSocket
You can verify it's running:
- Open a browser to: `ws://localhost:4455`
- You should see a "connection refused" or "authentication required" message (this is good!)

---

### Step 3: Install Node.js

The Bridge service runs on Node.js.

#### Install Node.js
1. Visit: https://nodejs.org/
2. Download the **LTS version** (18.x or 20.x)
3. Install with defaults
4. Verify installation:
   ```bash
   node --version  # Should show v18.x or v20.x
   npm --version   # Should show 9.x or 10.x
   ```

---

### Step 4: Download Sanctuary Stream

#### Option A: Download Release (Recommended for Users)
1. Visit: https://github.com/brentmzey/sanctuary-stream/releases/latest
2. Download: `Source code (zip)` or `Source code (tar.gz)`
3. Extract to a folder (e.g., `C:\sanctuary-stream` or `~/sanctuary-stream`)

#### Option B: Clone Repository (Recommended for Developers)
```bash
git clone https://github.com/brentmzey/sanctuary-stream.git
cd sanctuary-stream
```

---

### Step 5: Install Dependencies

```bash
cd sanctuary-stream

# Install all dependencies (this takes 2-3 minutes)
npm install

# This installs:
# - Root dependencies
# - sanctuary-app dependencies (frontend)
# - sanctuary-bridge dependencies (OBS controller)
# - Downloads PocketBase binary
```

**Troubleshooting:**
- If `npm install` fails, try: `npm install --legacy-peer-deps`
- On Linux, you may need: `sudo apt install build-essential`

---

### Step 6: Configure PocketBase Backend

You need to connect to a PocketBase server. You have **3 options**:

#### Option A: Use PocketHost (Cloud - Recommended)

**Best for:** Most churches, multi-campus, remote teams

1. **Create PocketHost Account:**
   - Visit: https://pockethost.io
   - Sign up (free tier available)
   - Create a new instance (e.g., `sanctuary-stream`)
   - You'll get a URL like: `https://sanctuary-stream.pockethost.io`

2. **Apply Database Schema:**
   - In PocketHost dashboard, go to **Collections**
   - Import schema from: `pocketbase/pb_schema.json` (in this repo)
   - Or manually create 3 collections:
     - `users` (auth collection)
     - `commands` (base collection)
     - `streams` (base collection)

3. **Create Admin User:**
   - In PocketHost, go to **Admins**
   - Create your admin account (for managing users)

4. **Create Bridge Service Account:**
   - In PocketHost, go to **Users** (in the `users` collection)
   - Create a user:
     - Email: `bridge@yourdomain.com`
     - Password: `secure-bridge-password-123`
     - Role: `bridge` (or admin if needed)
   - **Write down these credentials!**

5. **Create Stream Record:**
   - In PocketHost, go to **Streams** collection
   - Create a new record:
     - Name: "Main Sanctuary Stream"
     - Status: "idle"
     - Note the **Record ID** (shows in URL or details)
   - **Write down this Stream ID!**

#### Option B: Self-Hosted PocketBase

**Best for:** Maximum control, on-premise only

1. **Download PocketBase:**
   - Already included in `pocketbase/` folder
   - Or download from: https://pocketbase.io/docs/

2. **Run PocketBase:**
   ```bash
   cd pocketbase
   ./pocketbase serve --http=0.0.0.0:8090
   ```

3. **Access Admin UI:**
   - Open: http://localhost:8090/_/
   - Create admin account on first run

4. **Apply Schema:**
   - Import `pb_schema.json` or create collections manually

5. **Create Users & Stream:**
   - Same as Option A, but in your local admin UI

#### Option C: Local Development

**Best for:** Testing only

```bash
# Quick setup script does everything
npm run setup
```

This creates:
- Local PocketBase on port 8090
- Admin account
- Test users (pastor, bridge)
- Sample stream record

---

### Step 7: Configure the Bridge

The Bridge runs on your Station and connects OBS to PocketBase.

#### Create Bridge Configuration

1. **Navigate to Bridge folder:**
   ```bash
   cd sanctuary-bridge
   ```

2. **Copy the example config:**
   ```bash
   cp .env.example .env
   ```

3. **Edit `.env` file:**
   ```bash
   # Use your favorite editor
   nano .env
   # or
   code .env
   # or
   notepad .env
   ```

4. **Fill in your values:**
   ```bash
   # PocketBase Configuration
   PB_URL=https://sanctuary-stream.pockethost.io
   # ^ Use your PocketHost URL or http://localhost:8090 for local

   # Bridge Service Account (created in Step 6)
   BRIDGE_EMAIL=bridge@yourdomain.com
   BRIDGE_PASS=secure-bridge-password-123

   # OBS WebSocket Configuration (from Step 2)
   OBS_URL=ws://127.0.0.1:4455
   OBS_PASS=obs-secure-2024

   # Stream Configuration (Record ID from Step 6)
   STREAM_ID=abc123def456
   # ^ This is the Record ID from your PocketBase streams collection

   # Logging
   LOG_LEVEL=info
   NODE_ENV=production
   ```

5. **Save the file**

#### Verify Configuration
```bash
# Still in sanctuary-bridge folder
npm run build
npm start
```

**Expected output:**
```
[INFO] Sanctuary Bridge starting...
[INFO] Connecting to PocketBase: https://sanctuary-stream.pockethost.io
[INFO] Authenticating as: bridge@yourdomain.com
[INFO] ✓ Authenticated successfully
[INFO] Connecting to OBS WebSocket: ws://127.0.0.1:4455
[INFO] ✓ Connected to OBS
[INFO] Subscribing to stream updates: abc123def456
[INFO] ✓ Ready to receive commands
```

**Troubleshooting:**
- **"Connection refused"** → Check OBS is running and WebSocket is enabled
- **"Authentication failed"** → Check `BRIDGE_EMAIL` and `BRIDGE_PASS`
- **"Invalid stream ID"** → Check `STREAM_ID` matches your PocketBase record
- **"Cannot connect to PocketBase"** → Check `PB_URL` is correct and accessible

---

### Step 8: Configure YouTube/Facebook Streaming

#### Get Your Stream Key

**YouTube:**
1. Go to: https://studio.youtube.com
2. Click: **Create → Go Live**
3. Select: **Stream** (not Webcam)
4. Copy your **Stream key** (under Stream settings)
5. Copy your **Stream URL** (usually `rtmp://a.rtmp.youtube.com/live2`)

**Facebook:**
1. Go to: https://www.facebook.com/live/create
2. Select your page
3. Click: **Go Live**
4. Choose: **Streaming Software**
5. Copy your **Stream key**
6. Copy your **Server URL** (usually `rtmps://live-api-s.facebook.com:443/rtmp/`)

**Custom RTMP:**
- Get server URL and stream key from your provider

#### Configure in OBS

**Manual Method:**
1. In OBS, go to: **Settings → Stream**
2. **Service:** Select your platform (YouTube, Facebook, Custom)
3. **Server:** Paste the server URL
4. **Stream Key:** Paste your stream key
5. Click **Apply** and **OK**

**Remote Method (Preferred):**
- You can set this from the Remote App!
- See the **Remote App Setup** section below

---

### Step 9: Set Up Google Drive Auto-Upload (Optional)

Automatically upload recordings to Google Drive.

#### Prerequisites
1. Google account
2. Google Cloud project (free)

#### Setup Steps

1. **Create Google Cloud Project:**
   - Visit: https://console.cloud.google.com/
   - Create new project: "Sanctuary Stream"
   
2. **Enable Google Drive API:**
   - Search: "Google Drive API"
   - Click **Enable**

3. **Create OAuth Credentials:**
   - Go to: **APIs & Services → Credentials**
   - Click: **Create Credentials → OAuth Client ID**
   - Application type: **Desktop app**
   - Name: "Sanctuary Bridge"
   - Download the JSON file

4. **Install Credentials:**
   ```bash
   # In sanctuary-bridge folder
   cp ~/Downloads/client_secret_*.json ./credentials.json
   ```

5. **First-Time Authorization:**
   ```bash
   # Start the bridge
   npm start
   
   # When you stop a recording, it will prompt:
   # "Authorize this app by visiting: https://accounts.google.com/..."
   # 1. Click the URL
   # 2. Sign in with your Google account
   # 3. Grant permissions
   # 4. Copy the authorization code
   # 5. The Bridge will save token.json
   ```

6. **Future Uploads:**
   - Fully automatic!
   - Every recording is uploaded when you click "Stop Recording"

**Troubleshooting:**
- **"Credentials not found"** → Check `credentials.json` is in `sanctuary-bridge/`
- **"Token expired"** → Delete `token.json` and re-authorize
- **"Upload failed"** → Check internet connection and Drive permissions

---

### Step 10: Run the Bridge as a Service

For production use, run the Bridge as a background service that starts automatically.

#### Windows (Run on Startup)

**Option A: Task Scheduler**
1. Create a batch file `start-bridge.bat`:
   ```batch
   @echo off
   cd C:\sanctuary-stream\sanctuary-bridge
   npm start
   ```

2. Open **Task Scheduler**
3. **Create Basic Task:**
   - Name: "Sanctuary Bridge"
   - Trigger: "When the computer starts"
   - Action: "Start a program"
   - Program: `C:\sanctuary-stream\sanctuary-bridge\start-bridge.bat`
   - Check: "Run whether user is logged on or not"

**Option B: NSSM (Recommended)**
```powershell
# Download NSSM from: https://nssm.cc/download
choco install nssm

# Install service
cd C:\sanctuary-stream\sanctuary-bridge
nssm install SanctuaryBridge "C:\Program Files\nodejs\node.exe" "dist/index.js"
nssm set SanctuaryBridge AppDirectory "C:\sanctuary-stream\sanctuary-bridge"
nssm start SanctuaryBridge
```

#### macOS (Launch Agent)

1. **Create launch agent:**
   ```bash
   nano ~/Library/LaunchAgents/com.sanctuary.bridge.plist
   ```

2. **Paste configuration:**
   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
   <plist version="1.0">
   <dict>
       <key>Label</key>
       <string>com.sanctuary.bridge</string>
       <key>ProgramArguments</key>
       <array>
           <string>/usr/local/bin/node</string>
           <string>/Users/YOUR_USERNAME/sanctuary-stream/sanctuary-bridge/dist/index.js</string>
       </array>
       <key>WorkingDirectory</key>
       <string>/Users/YOUR_USERNAME/sanctuary-stream/sanctuary-bridge</string>
       <key>RunAtLoad</key>
       <true/>
       <key>KeepAlive</key>
       <true/>
       <key>StandardOutPath</key>
       <string>/tmp/sanctuary-bridge.log</string>
       <key>StandardErrorPath</key>
       <string>/tmp/sanctuary-bridge-error.log</string>
   </dict>
   </plist>
   ```

3. **Load and start:**
   ```bash
   launchctl load ~/Library/LaunchAgents/com.sanctuary.bridge.plist
   launchctl start com.sanctuary.bridge
   ```

#### Linux (Systemd Service)

1. **Create service file:**
   ```bash
   sudo nano /etc/systemd/system/sanctuary-bridge.service
   ```

2. **Paste configuration:**
   ```ini
   [Unit]
   Description=Sanctuary Stream Bridge
   After=network.target

   [Service]
   Type=simple
   User=YOUR_USERNAME
   WorkingDirectory=/home/YOUR_USERNAME/sanctuary-stream/sanctuary-bridge
   ExecStart=/usr/bin/node /home/YOUR_USERNAME/sanctuary-stream/sanctuary-bridge/dist/index.js
   Restart=always
   RestartSec=10
   StandardOutput=journal
   StandardError=journal

   [Install]
   WantedBy=multi-user.target
   ```

3. **Enable and start:**
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable sanctuary-bridge
   sudo systemctl start sanctuary-bridge
   sudo systemctl status sanctuary-bridge
   ```

---

## 🎛️ Operating the Station

### Starting Up (Manual Mode)

1. **Start OBS:**
   - Launch OBS Studio
   - Load your scene collection
   - Verify cameras and audio are working

2. **Start Bridge:**
   ```bash
   cd sanctuary-stream/sanctuary-bridge
   npm start
   ```

3. **Verify Connection:**
   - Bridge logs should show: "✓ Connected to OBS"
   - Bridge logs should show: "✓ Ready to receive commands"

### Starting Up (Service Mode)

If you configured the Bridge as a service:
1. **Start OBS** (manually)
2. **Bridge starts automatically** (if configured)
3. That's it!

### Using Remote Control

Now you can control streaming from **any device**:
- **Mobile app:** Install on iPhone/Android
- **Web app:** Visit your deployed URL
- **Desktop app:** Install on any computer

**Commands you can send:**
- ✅ Start Streaming
- ✅ Stop Streaming
- ✅ Start Recording
- ✅ Stop Recording
- ✅ Configure stream settings (YouTube, Facebook, etc.)

---

## 🔧 Troubleshooting

### Bridge Won't Connect to OBS
```bash
# Check if OBS is running
ps aux | grep obs  # Linux/Mac
tasklist | findstr obs  # Windows

# Check if WebSocket is enabled in OBS
# Tools → WebSocket Server Settings → Enable

# Check if port 4455 is open
netstat -an | grep 4455  # Linux/Mac
netstat -an | findstr 4455  # Windows

# Try connecting manually
wscat -c ws://localhost:4455
```

### Bridge Won't Connect to PocketBase
```bash
# Test PocketBase URL
curl https://your-instance.pockethost.io/api/health

# Check credentials
# Make sure BRIDGE_EMAIL and BRIDGE_PASS match your PocketBase user

# Check firewall
# Ensure your firewall allows outbound HTTPS connections
```

### OBS Doesn't Start Streaming
```bash
# Check stream key is configured
# In OBS: Settings → Stream

# Check internet connection
# Ensure you have at least 5 Mbps upload speed

# Check OBS logs
# Help → Log Files → View Current Log
```

### Commands Not Executing
```bash
# Check Bridge logs for errors
tail -f /tmp/sanctuary-bridge.log  # macOS
journalctl -u sanctuary-bridge -f  # Linux
# Check Windows Event Viewer  # Windows

# Verify STREAM_ID matches your PocketBase record

# Check PocketBase is receiving commands
# In PocketBase admin: Collections → Commands
```

---

## 📊 Performance Optimization

### For HD Streaming (1080p @ 30fps)
- **CPU:** Intel i5 (6th gen+) or AMD Ryzen 5
- **RAM:** 8GB minimum
- **Upload:** 5-10 Mbps
- **Encoder:** Hardware (NVENC, AMD, QuickSync)
- **Bitrate:** 4500-6000 kbps

### For 4K Streaming (2160p @ 60fps)
- **CPU:** Intel i7 (8th gen+) or AMD Ryzen 7
- **RAM:** 16GB minimum
- **Upload:** 25+ Mbps
- **Encoder:** Hardware (NVENC recommended)
- **Bitrate:** 20000-51000 kbps
- **GPU:** NVIDIA GTX 1660+ or AMD RX 5700+

### OBS Settings (Recommended)
```
Output → Streaming
- Video Bitrate: 4500 kbps (HD) or 20000 kbps (4K)
- Encoder: NVENC H.264 (or AMD/QuickSync equivalent)
- Preset: Quality
- Profile: high
- Keyframe Interval: 2

Audio
- Sample Rate: 48 kHz
- Bitrate: 160 kbps (speech) or 320 kbps (music)
```

---

## 🎯 Next Steps

### Test Your Setup
1. Start OBS and Bridge
2. Open Remote App on your phone
3. Click "Start Streaming"
4. Verify stream appears on YouTube/Facebook
5. Click "Stop Streaming"
6. Test recording functionality

### Go Live!
1. Schedule your service in YouTube/Facebook
2. Update stream settings with your key
3. Start Bridge service on your Station
4. Control everything from your phone/tablet
5. Focus on the service, not the tech!

---

## 📚 Additional Resources

- **OBS Integration Guide:** [OBS_INTEGRATION.md](./OBS_INTEGRATION.md)
- **Multi-Backend Guide:** [MULTI_BACKEND.md](./MULTI_BACKEND.md)
- **User Guide (Remote Apps):** [USER_GUIDE.md](./USER_GUIDE.md)
- **Quick Reference:** [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
- **Integrations Guide:** [INTEGRATIONS.md](./INTEGRATIONS.md)

---

## ✅ Station Setup Checklist

- [ ] OBS Studio installed
- [ ] OBS WebSocket enabled (port 4455)
- [ ] OBS WebSocket password set
- [ ] Node.js installed
- [ ] Sanctuary Stream downloaded
- [ ] Dependencies installed (`npm install`)
- [ ] PocketBase backend configured (PocketHost or self-hosted)
- [ ] Bridge service account created
- [ ] Stream record created in PocketBase
- [ ] Bridge `.env` file configured
- [ ] Bridge tested manually (`npm start`)
- [ ] YouTube/Facebook stream key configured
- [ ] Google Drive auto-upload configured (optional)
- [ ] Bridge running as service (optional)
- [ ] Remote app tested

---

**🎉 Your Station is ready to stream!**

**Built with ❤️ for churches everywhere**
