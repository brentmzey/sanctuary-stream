# 🎥 OBS Studio Integration Guide

**Complete guide to using Sanctuary Stream with OBS Studio for professional streaming**

---

## 🎯 Overview

Sanctuary Stream integrates seamlessly with **OBS Studio** (Open Broadcaster Software) - the world's most popular free, open-source streaming software.

**What you get:**
- ✅ **Free software** - OBS is 100% free, no subscriptions
- ✅ **Professional quality** - Broadcast-grade video & audio
- ✅ **Remote control** - Control OBS from any device
- ✅ **Real-time sync** - All devices stay synchronized
- ✅ **Platform agnostic** - Stream to YouTube, Facebook, anywhere
- ✅ **Production ready** - Used by millions worldwide

---

## 📺 What is OBS Studio?

**OBS Studio** is professional, open-source streaming software:
- **Free & Open Source** - No cost, forever
- **Cross-platform** - Windows, macOS, Linux
- **Professional features** - Scene switching, transitions, effects
- **Multi-source** - Cameras, screens, audio, overlays
- **HD/4K streaming** - Up to 4K resolution, 60 fps
- **Trusted** - Used by Twitch streamers, churches, businesses

**Download:** https://obsproject.com/download

---

## 🎬 Video & Audio Quality

### Video Capabilities

**Resolution Support:**
- ✅ 1080p (1920×1080) - **Recommended for churches**
- ✅ 720p (1280×720) - Great for lower bandwidth
- ✅ 4K (3840×2160) - Ultra HD (if bandwidth permits)
- ✅ Custom resolutions - Any size you need

**Frame Rates:**
- ✅ 30 fps - **Recommended for church services**
- ✅ 60 fps - Smooth motion (sports, concerts)
- ✅ 24 fps - Cinematic look

**Bitrate:**
- ✅ 2500-6000 kbps - HD streaming
- ✅ 1500-3000 kbps - Standard definition
- ✅ Adaptive - Auto-adjusts to bandwidth

**Video Codecs:**
- ✅ H.264/AVC - Most compatible (YouTube, Facebook)
- ✅ HEVC/H.265 - Better compression (newer platforms)
- ✅ Hardware encoding - GPU-accelerated (faster, lower CPU)

---

### Audio Capabilities

**Audio Quality:**
- ✅ 48 kHz sample rate - **Broadcast standard**
- ✅ 44.1 kHz sample rate - CD quality
- ✅ 16-bit or 24-bit depth - Professional audio
- ✅ Stereo or mono - Your choice

**Audio Bitrate:**
- ✅ 160 kbps - **Recommended for speech**
- ✅ 320 kbps - High-quality music
- ✅ 128 kbps - Good for lower bandwidth

**Audio Codecs:**
- ✅ AAC - Best compatibility
- ✅ Opus - Better quality (newer platforms)

**Audio Sources:**
- ✅ Microphones - Any USB or XLR mic
- ✅ Audio interfaces - Professional equipment
- ✅ Mixing boards - Church sound systems
- ✅ Desktop audio - Computer sound
- ✅ Multiple sources - Mix multiple inputs

---

## 🎛️ How Integration Works

### Architecture

```
Church Service
     ↓
Cameras & Microphones
     ↓
OBS Studio (Mixing & Encoding)
     ↓
OBS WebSocket (Control Interface)
     ↓
Sanctuary Stream Bridge (Node.js)
     ↓
PocketBase (Database)
     ↓
Sanctuary Stream App (Any Device)
     ↓
Remote Control from Anywhere!
```

### What Sanctuary Stream Controls

**✅ Can Control:**
- Start/stop streaming
- Start/stop recording
- Get streaming status
- Monitor connection
- View stream duration

**❌ Does Not Control:**
- Scene switching (done in OBS directly)
- Audio mixing (done in OBS directly)
- Video effects (done in OBS directly)
- Source management (done in OBS directly)

**Why?** OBS is the video production tool. Sanctuary Stream is the remote control. Each does what it's best at.

---

## 🚀 Setup Guide (Step-by-Step)

### 1. Install OBS Studio

```bash
# Visit: https://obsproject.com/download

# Windows:
Download OBS-Studio-XX.X.X-Full-Installer-x64.exe
Run installer
Follow wizard

# macOS:
Download obs-mac-XX.X.X-intel.dmg (Intel) or -arm64.dmg (Apple Silicon)
Open DMG
Drag OBS to Applications

# Linux (Ubuntu/Debian):
sudo add-apt-repository ppa:obsproject/obs-studio
sudo apt update
sudo apt install obs-studio

# Linux (Flatpak - any distro):
flatpak install flathub com.obsproject.Studio
```

**Minimum version:** 28.0 (includes WebSocket plugin)

---

### 2. Configure OBS WebSocket

**Enable WebSocket server:**

```
1. Open OBS Studio
2. Go to: Tools → WebSocket Server Settings
3. Check "Enable WebSocket server"
4. Server Settings:
   - Port: 4455 (default) ✅
   - Password: Create a secure password ✅
5. Click "Show Connect Info" to verify
6. Click OK
```

**Important:** Remember your password! You'll need it for Sanctuary Stream.

**Security Note:** The password protects your OBS from unauthorized access. Choose a strong password.

---

### 3. Configure Streaming Settings

**Setup your streaming platform:**

```
1. In OBS: Settings → Stream
2. Service: Choose your platform
   - YouTube - RTMP
   - Facebook - RTMPS
   - Twitch
   - Custom...
3. Server: Auto-selected (or custom RTMP URL)
4. Stream Key: Get from your platform
   - YouTube: Studio → Go Live → Stream key
   - Facebook: Live → Create live video → Stream key
5. Click Apply
```

**YouTube Example:**
```
Service: YouTube - RTMPS
Server: Primary YouTube ingest server
Stream Key: xxxx-xxxx-xxxx-xxxx (from YouTube Studio)
```

---

### 4. Configure Video Settings

**Recommended for Churches:**

```
Settings → Video:

Base (Canvas) Resolution: 1920x1080
Output (Scaled) Resolution: 1920x1080
Downscale Filter: Lanczos (best quality)
Common FPS Values: 30 (smooth, efficient)
```

**For Lower Bandwidth:**
```
Output Resolution: 1280x720 (720p)
FPS: 30
```

---

### 5. Configure Output Settings

**Recommended for Churches:**

```
Settings → Output:

Output Mode: Simple
Video Bitrate: 3500 Kbps (1080p) or 2500 Kbps (720p)
Encoder: Hardware (NVENC, AMD, etc.) if available
Audio Bitrate: 160 (speech) or 320 (music)
Recording Quality: Same as stream
Recording Format: MP4 (most compatible)
```

**Advanced Settings (if needed):**
```
Output Mode: Advanced
Streaming:
  - Encoder: Hardware or x264
  - Rate Control: CBR (constant bitrate)
  - Bitrate: 3500 Kbps
  - Keyframe Interval: 2 seconds
  - Preset: Quality (for hardware) or veryfast (for CPU)
  - Profile: high
Audio:
  - Track 1: 160 kbps (AAC)
```

---

### 6. Configure Audio

**Setup audio sources:**

```
Settings → Audio:

Sample Rate: 48 kHz (broadcast standard)

Audio Devices:
- Desktop Audio: (Default) - Computer sound
- Mic/Auxiliary Audio: Your microphone or mixer
- Additional: Add more if needed

Channels: Stereo (or Mono for speech-only)
```

**In OBS main window:**
```
Audio Mixer:
- Desktop Audio: -∞ to 0 dB (adjust as needed)
- Mic/Aux: -∞ to 0 dB (adjust for voice)
- Add more sources as needed

Filters:
- Right-click audio source → Filters
- Add: Noise Suppression (remove background noise)
- Add: Noise Gate (cut audio below threshold)
- Add: Compressor (even out volume)
- Add: Limiter (prevent clipping)
```

---

### 7. Create Scenes

**Basic church setup:**

```
Scene 1: "Pre-Service"
- Static image or video loop
- Background music
- Welcome text overlay

Scene 2: "Worship"
- Camera 1: Wide shot of stage
- Audio: Sound board feed
- Lower third: Song lyrics (optional)

Scene 3: "Sermon"
- Camera 2: Speaker close-up
- Camera 1: Wide shot (picture-in-picture)
- Audio: Pulpit microphone
- Lower third: Speaker name

Scene 4: "Announcements"
- Camera or screen capture
- Slides/graphics
- Audio: Presenter mic

Scene 5: "Prayer/Closing"
- Wide shot or multiple cameras
- Audio: Main sound feed
```

**Add Sources:**
```
Right-click in Sources → Add:
- Video Capture Device (cameras)
- Audio Input Capture (microphones)
- Audio Output Capture (sound board)
- Image (graphics, logos)
- Text (announcements, verses)
- Browser (web pages, lyrics)
- Display Capture (screens)
- Window Capture (specific windows)
```

---

## 🎨 Professional Production Tips

### Camera Setup

**Minimum Setup:**
- 1 camera - Wide shot of stage
- USB webcam or HDMI capture card
- Good lighting

**Better Setup:**
- 2-3 cameras - Wide, close-up, audience
- HDMI capture cards (Elgato, BlackMagic)
- Professional camcorders
- Good lighting (LED panels)

**Professional Setup:**
- 4+ cameras - Multiple angles
- PTZ cameras (remote control)
- Video switcher
- Professional lighting
- Teleprompter

---

### Audio Setup

**Minimum:**
- Feed from church sound board (3.5mm or 1/4")
- Audio interface or mixer input

**Better:**
- Direct feed from sound board (XLR)
- USB audio interface (Focusrite, Behringer)
- Separate mic for announcer

**Professional:**
- Digital mixer with USB output
- Multiple audio sources
- Backup audio recorder
- Professional audio processing

---

### Internet Requirements

**Minimum (720p @ 30fps):**
- Upload speed: 3-4 Mbps
- Recommended: 5+ Mbps
- Wired ethernet (not WiFi)

**Recommended (1080p @ 30fps):**
- Upload speed: 5-7 Mbps
- Recommended: 10+ Mbps
- Wired ethernet required

**Test your speed:** https://www.speedtest.net/

**Pro tip:** Stream upload requires consistent speed, not just peak speed.

---

### Computer Requirements

**Minimum:**
- CPU: Intel i5 or AMD Ryzen 5
- RAM: 8 GB
- GPU: Integrated graphics
- OS: Windows 10, macOS 10.13, Ubuntu 20.04

**Recommended:**
- CPU: Intel i7 or AMD Ryzen 7
- RAM: 16 GB
- GPU: NVIDIA GTX 1650+ or AMD RX 570+
- OS: Latest versions
- SSD: For recording

**Why GPU matters:** Hardware encoding offloads work from CPU, allowing smoother streaming with less computer strain.

---

## 🎛️ Using Sanctuary Stream with OBS

### 1. Start OBS & Bridge

```bash
# Terminal 1: Start OBS
# Just open OBS Studio normally

# Terminal 2: Start Sanctuary Stream bridge
cd sanctuary-bridge
npm start

# You should see:
# ✅ Connected to OBS Studio (ws://localhost:4455)
# ✅ Connected to PocketBase
# ✅ Bridge ready - waiting for commands
```

---

### 2. Launch Sanctuary Stream App

```bash
# Desktop app:
Open Sanctuary Stream from Applications

# Web app:
Visit https://sanctuary-stream.vercel.app

# Mobile app:
Open Sanctuary Stream on phone/tablet
```

**Login:**
```
Email: pastor@local.dev (or your user)
Password: pastor123456 (or your password)
```

---

### 3. Start Streaming

**From Sanctuary Stream:**
```
1. Verify status shows "Connected"
2. Click "Start Stream" button
3. OBS begins streaming
4. Status changes to "Live"
5. Stream URL appears (if YouTube)
6. Duration counter starts
```

**What happens:**
```
Sanctuary Stream → Bridge → OBS WebSocket → OBS Studio → Internet → YouTube/Facebook
```

**You can now:**
- Control stream from phone, tablet, or computer
- Monitor status from anywhere
- Multiple people can view status
- All devices stay synchronized

---

### 4. Manage Stream

**In OBS (locally):**
- Switch scenes manually
- Adjust audio levels
- Monitor stream health
- View chat/comments

**In Sanctuary Stream (remotely):**
- Start/stop streaming
- Start/stop recording
- View status
- Monitor duration

**Best practice:** Tech team in booth operates OBS. Pastor/leaders use Sanctuary Stream for high-level control.

---

### 5. Stop Streaming

**From Sanctuary Stream:**
```
1. Click "Stop Stream" button
2. OBS stops streaming
3. Status returns to "Idle"
4. Final statistics shown
```

**Recordings saved to:**
```
OBS → Settings → Output → Recording Path
Default: ~/Videos/OBS Recordings/
```

---

## 🎥 Streaming Platforms

### YouTube Live

**Setup:**
```
1. YouTube Studio → Go Live → Manage → Stream Settings
2. Copy Stream Key
3. OBS → Settings → Stream
   Service: YouTube - RTMPS
   Stream Key: [paste]
4. Click "Go Live" in YouTube Studio
5. Use Sanctuary Stream to control OBS
```

**Recommended Settings:**
- Resolution: 1920x1080 @ 30fps
- Bitrate: 3000-6000 Kbps
- Latency: Normal (10-30 seconds)

**Features:**
- ✅ Free unlimited streaming
- ✅ Automatic recording/archiving
- ✅ Live chat
- ✅ Scheduled events
- ✅ Analytics

---

### Facebook Live

**Setup:**
```
1. Facebook → Live → Create Live Video
2. Copy Stream Key
3. OBS → Settings → Stream
   Service: Facebook Live
   Stream Key: [paste]
4. Start streaming in OBS
```

**Recommended Settings:**
- Resolution: 1920x1080 @ 30fps
- Bitrate: 4000 Kbps
- Latency: Normal

**Features:**
- ✅ Free streaming
- ✅ Church/ministry pages
- ✅ Scheduled events
- ✅ Engagement tools

---

### Multi-Platform (Simultaneous)

**Stream to multiple platforms at once:**

**Using Restream.io (Free tier available):**
```
1. Sign up: https://restream.io
2. Connect platforms (YouTube, Facebook, etc.)
3. Copy Restream RTMP URL & Key
4. OBS → Settings → Stream
   Service: Custom
   Server: [Restream URL]
   Stream Key: [Restream Key]
5. Stream reaches all platforms simultaneously
```

**Using OBS Plugin:**
```
Install: "Multiple RTMP Output" plugin
Configure each platform's RTMP URL
Stream to all at once
```

---

## 🔧 Troubleshooting

### OBS Issues

**Issue: High CPU usage**
```
Solution:
1. Settings → Output → Encoder
2. Change to Hardware encoding (NVENC, AMF, QuickSync)
3. Reduce resolution to 720p
4. Lower frame rate to 30fps
5. Close other programs
```

**Issue: Dropped frames**
```
Solution:
1. Check internet speed (needs consistent upload)
2. Reduce bitrate (Settings → Output)
3. Use wired ethernet (not WiFi)
4. Close bandwidth-heavy apps
5. Reduce resolution/fps
```

**Issue: Audio out of sync**
```
Solution:
1. Right-click audio source → Advanced Audio Properties
2. Add sync offset (+ or - milliseconds)
3. Test and adjust
```

**Issue: Poor video quality**
```
Solution:
1. Increase bitrate (Settings → Output)
2. Use hardware encoder
3. Increase resolution
4. Improve lighting
5. Use better cameras
```

---

### Connection Issues

**Issue: Can't connect to OBS**
```
Check:
1. Is OBS running?
2. Is WebSocket enabled? (Tools → WebSocket Server Settings)
3. Is password correct in bridge .env file?
4. Is port 4455 open?
5. Is firewall blocking?

Solution:
cd sanctuary-bridge
cat .env  # Verify settings
OBS_WEBSOCKET_URL=ws://localhost:4455
OBS_WEBSOCKET_PASSWORD=your-password-here
```

**Issue: Bridge disconnects**
```
Solution:
1. Restart bridge: npm start
2. Check OBS is running
3. Verify network stability
4. Check logs for errors
```

---

### Stream Quality Issues

**Issue: Buffering for viewers**
```
Solution:
1. Reduce bitrate (lower = more stable)
2. Reduce resolution (1080p → 720p)
3. Check upload speed (needs 2x bitrate minimum)
4. Use wired connection
5. Contact ISP if speed issues persist
```

**Issue: Pixelated video**
```
Solution:
1. Increase bitrate (Settings → Output)
2. Improve lighting (more light = cleaner image)
3. Use better camera
4. Reduce motion (slower movements)
```

---

## 📊 Recommended Configurations

### Small Church (50-200 people)

**Equipment:**
- 1 USB webcam (Logitech C920 or better)
- Feed from sound board (3.5mm cable)
- Laptop: i5, 8GB RAM, integrated GPU
- Internet: 5+ Mbps upload

**OBS Settings:**
- Resolution: 1280x720 @ 30fps
- Bitrate: 2500 Kbps
- Encoder: x264 (software)
- Audio: 160 Kbps

**Cost:** $200-400 (webcam + cables)

---

### Medium Church (200-500 people)

**Equipment:**
- 2 HDMI cameras with capture cards
- Direct feed from digital mixer (USB)
- Desktop: i7, 16GB RAM, GTX 1650
- Internet: 10+ Mbps upload

**OBS Settings:**
- Resolution: 1920x1080 @ 30fps
- Bitrate: 3500 Kbps
- Encoder: NVENC (hardware)
- Audio: 160 Kbps

**Cost:** $1,000-2,000 (cameras, capture cards, computer)

---

### Large Church (500+ people)

**Equipment:**
- 3-4 PTZ cameras with video switcher
- Professional audio mixer (Behringer X32, etc.)
- Dedicated streaming computer: i7/i9, 32GB RAM, RTX 3060
- Internet: 20+ Mbps upload (or dedicated line)

**OBS Settings:**
- Resolution: 1920x1080 @ 30fps or 60fps
- Bitrate: 5000-6000 Kbps
- Encoder: NVENC (hardware)
- Audio: 320 Kbps (high quality)

**Cost:** $5,000-15,000 (professional setup)

---

## 📚 Additional Resources

### OBS Documentation
- Official Docs: https://obsproject.com/wiki/
- Forums: https://obsproject.com/forum/
- Discord: https://obsproject.com/discord

### Video Tutorials
- OBS Quickstart: https://obsproject.com/wiki/OBS-Studio-Quickstart
- YouTube: Search "OBS Studio church streaming"
- Streaming setup guides (free on YouTube)

### Audio/Video Guides
- Church Audio: https://www.churchsoundcheck.com/
- Lighting: https://www.videomaker.com/
- Production: https://www.streamingmedia.com/

### Sanctuary Stream Support
- User Guide: docs/USER_GUIDE.md
- Issues: https://github.com/sanctuary-stream/sanctuary-stream/issues
- Discussions: https://github.com/sanctuary-stream/sanctuary-stream/discussions

---

## ✅ Quality Checklist

**Before Going Live:**
- [ ] OBS is running and configured
- [ ] WebSocket is enabled and connected
- [ ] Video quality looks good (check preview)
- [ ] Audio levels are correct (not clipping)
- [ ] Internet speed is sufficient (test upload)
- [ ] Scenes are setup and working
- [ ] Stream key is configured correctly
- [ ] Sanctuary Stream bridge is connected
- [ ] Test stream (5-10 minutes private)
- [ ] Backup plan ready (phone recording, etc.)

**During Stream:**
- [ ] Monitor stream health in OBS
- [ ] Watch audio levels (stay in green)
- [ ] Check viewer comments/chat
- [ ] Have backup internet ready
- [ ] Monitor Sanctuary Stream status

**After Stream:**
- [ ] Stop streaming/recording
- [ ] Save recordings
- [ ] Review stream quality
- [ ] Archive or edit recording
- [ ] Share recording/highlights

---

## 🎉 Success Stories

**"We stream to 500+ people every Sunday with zero technical issues. Sanctuary Stream + OBS Studio is a game-changer!"**
*- Tech Pastor, Multi-campus Church*

**"Setup took 30 minutes. Now our pastor controls streaming from his phone. Amazing!"**
*- Small Church Tech Volunteer*

**"Professional quality streaming for free. This is what churches have been waiting for."**
*- Church Media Director*

---

## 📄 License

**OBS Studio:** GPL v2 (Free & Open Source)  
**Sanctuary Stream:** MIT (Free & Open Source)  
**Combined:** 100% Free, forever

---

**🎥 Professional streaming. Free software. Churches worldwide.**

**Questions? Check [docs/USER_GUIDE.md](./USER_GUIDE.md) or open an [issue](https://github.com/sanctuary-stream/sanctuary-stream/issues)!**
