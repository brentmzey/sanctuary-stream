# ⚡ Quick Start - 5 Minutes to Streaming

**Get Sanctuary Stream running in 5 minutes**

---

## 1️⃣ Prerequisites (2 minutes)

```bash
# Install Node.js 18+ from: https://nodejs.org
# Download OBS Studio from: https://obsproject.com

# Verify:
node --version    # Should be v18+
npm --version     # Should be 9+
```

---

## 2️⃣ Clone & Install (2 minutes)

```bash
# Clone repository
git clone https://github.com/brentmzey/sanctuary-stream.git
cd sanctuary-stream

# Install all dependencies
npm install

# Build everything
npm run build
```

---

## 3️⃣ Setup Database (30 seconds)

```bash
# Download PocketBase for your OS:
# https://pocketbase.io/docs/

# Extract to: pocketbase/local/

# Start PocketBase
cd pocketbase/local
./pocketbase serve

# Open http://127.0.0.1:8090/_/
# Create admin account when prompted
```

---

## 4️⃣ Configure OBS (30 seconds)

```
In OBS Studio:
→ Tools 
→ WebSocket Server Settings
→ ☑ Enable WebSocket server
→ Server Port: 4455
→ Password: (leave blank)
→ Click "Apply"
```

---

## 5️⃣ Start Everything (30 seconds)

```bash
# Terminal 1: PocketBase (already running from step 3)

# Terminal 2: Bridge
cd sanctuary-bridge
npm start
# ✅ Wait for: "Connected to OBS"

# Terminal 3: Web App
cd sanctuary-app
npm run dev
# ✅ Opens: http://localhost:5173
```

---

## 6️⃣ First Login (30 seconds)

```
1. Open: http://localhost:5173
2. Click "Setup Wizard" OR login:
   Email: admin@local.dev
   Password: admin123456
3. ✅ You're in!
```

---

## 🎬 Test Streaming

```
In the App:
1. Go to "Stream Control" tab
2. Click "🎬 Video Quality"
3. Choose "High Quality" preset
4. Click "Apply to OBS"
5. Click "Start Streaming"
6. ✅ Watch the Health Monitor!
```

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| Bridge won't connect to OBS | Make sure OBS WebSocket is enabled (step 4) |
| Port 8090 already in use | Kill process: `lsof -ti:8090 \| xargs kill -9` |
| "Cannot find module" | Run: `rm -rf node_modules && npm install` |
| PocketBase won't start | Make sure it's executable: `chmod +x pocketbase` |

---

## 📚 Full Documentation

- **Complete Install**: `INSTALLATION_GUIDE.md`
- **Video Quality**: `docs/PROFESSIONAL_VIDEO_GUIDE.md`
- **Performance**: `PERFORMANCE_OPTIMIZATIONS.md`
- **All Platforms**: `MULTI_PLATFORM_BUILD_STATUS.md`

---

## ✅ Next Steps

### For Your 3h 15m Parish Service

**Recommended Settings**:
```
Resolution: 1080p @ 30fps
Video Bitrate: 4,500 Kbps
Audio Bitrate: 160 Kbps (speech) or 320 Kbps (music)
Encoder: NVENC (GPU)
```

**Setup YouTube**:
```
1. Get stream key from YouTube Studio
2. In OBS → Settings → Stream
3. Service: YouTube - RTMPS
4. Stream Key: (paste your key)
5. Apply & OK
```

**Go Live**:
```
1. In Sanctuary Stream app: Click "Start Streaming"
2. In OBS: Verify scenes/sources
3. Monitor Health in app
4. Stream your service! 🎉
```

---

## 🎉 That's It!

**Time to first stream**: ~5 minutes
**Cost**: $0
**Quality**: Professional broadcast-grade

**Your Old St. Mary's Chicago 3h 15m service will stream beautifully! 🙏**

---

**Need help?** See `INSTALLATION_GUIDE.md` for detailed instructions.
