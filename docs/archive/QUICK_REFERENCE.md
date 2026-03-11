# ⚡ Quick Reference

**Fast answers to common questions**

---

## 🎥 Video & Audio Quality

### Does it support HD streaming?
**✅ YES!** OBS Studio supports:
- 1080p @ 30fps (recommended for churches)
- 720p @ 30fps (lower bandwidth)
- 4K @ 60fps (ultra HD, if bandwidth permits)
- Custom resolutions

### What about audio quality?
**✅ Professional!**
- 48 kHz sample rate (broadcast standard)
- AAC codec (best compatibility)
- 160 kbps (speech) or 320 kbps (music)
- Stereo or mono
- Direct feed from sound board

### Is it really free?
**✅ 100% FREE!**
- OBS Studio: Free & open source (GPL)
- Sanctuary Stream: Free & open source (MIT)
- No subscriptions
- No hidden costs
- No premium tiers
- Free forever

---

## 🚀 Quick Setup (5 Minutes)

```bash
# 1. Install OBS Studio
Visit: https://obsproject.com/download

# 2. Enable OBS WebSocket
Tools → WebSocket Server Settings → Enable
Set password: YourSecurePassword

# 3. Install Sanctuary Stream
Download from: https://github.com/brentmzey/sanctuary-stream/releases
Install for your platform

# 4. Configure & Run
cd sanctuary-stream
npm install
npm run setup
npm run dev

# 5. Start Streaming!
Open Sanctuary Stream app → Start Stream
```

---

## 📋 System Requirements

### Minimum
- **Computer:** i5, 8GB RAM, integrated GPU
- **Internet:** 3 Mbps upload
- **OBS:** Version 28.0+
- **OS:** Windows 10, macOS 10.13, Ubuntu 20.04

### Recommended
- **Computer:** i7, 16GB RAM, dedicated GPU (GTX 1650+)
- **Internet:** 10 Mbps upload (wired ethernet)
- **OBS:** Latest version
- **OS:** Latest stable versions

---

## 🎛️ Common Commands

```bash
# Development
npm run dev              # All services
npm run dev:app          # Frontend only
npm run dev:bridge       # Bridge only

# Building
npm run build            # Build everything
npm run tauri:build:mac  # macOS app
npm run tauri:build:win  # Windows app
npm run tauri:build:linux # Linux app

# Quality Checks
npm run typecheck        # Type checking
npm run lint             # Linting
npm test                 # Tests
npm run validate         # Full validation
```

---

## 🔧 OBS Settings (Copy-Paste)

### Small Church (720p)
```
Video:
- Base Resolution: 1280x720
- Output Resolution: 1280x720
- FPS: 30

Output:
- Bitrate: 2500 Kbps
- Encoder: x264 (software)
- Audio Bitrate: 160

Audio:
- Sample Rate: 48 kHz
```

### Medium/Large Church (1080p)
```
Video:
- Base Resolution: 1920x1080
- Output Resolution: 1920x1080
- FPS: 30

Output:
- Bitrate: 3500-5000 Kbps
- Encoder: NVENC/Hardware
- Audio Bitrate: 160-320

Audio:
- Sample Rate: 48 kHz
```

---

## 📥 Download Links

### Sanctuary Stream
- **Releases:** https://github.com/brentmzey/sanctuary-stream/releases/latest
- **macOS:** Sanctuary-Stream-universal.dmg
- **Windows:** Sanctuary-Stream-x64.msi
- **Linux:** sanctuary-stream_amd64.deb or .AppImage
- **Web:** https://sanctuary-stream.vercel.app

### OBS Studio
- **Download:** https://obsproject.com/download
- **Version:** 28.0 or later (required)
- **Free:** Yes, 100% free forever

---

## 🎥 Streaming Platforms

### YouTube Live
```
1. YouTube Studio → Go Live → Stream Settings
2. Copy Stream Key
3. OBS → Settings → Stream
   Service: YouTube - RTMPS
   Stream Key: [paste]
4. Start streaming!
```

### Facebook Live
```
1. Facebook → Live → Create Live Video
2. Copy Stream Key
3. OBS → Settings → Stream
   Service: Facebook Live
   Stream Key: [paste]
4. Start streaming!
```

### Multi-Platform
- Use Restream.io (free tier)
- Or "Multiple RTMP Output" OBS plugin
- Stream to YouTube + Facebook + others simultaneously

---

## 🔍 Troubleshooting

### Can't Connect to OBS
```bash
1. Is OBS running?
2. Tools → WebSocket Server Settings → Enable
3. Check password matches in .env file
4. Port 4455 open?
5. Restart bridge: cd sanctuary-bridge && npm start
```

### Dropped Frames
```
1. Check upload speed: https://speedtest.net
2. Reduce bitrate in OBS settings
3. Use wired ethernet (not WiFi)
4. Close other apps using bandwidth
5. Lower resolution (1080p → 720p)
```

### Poor Video Quality
```
1. Increase bitrate (OBS settings)
2. Improve lighting (more light!)
3. Use hardware encoder (NVENC/AMD)
4. Use better camera
5. Check internet speed
```

### Audio Issues
```
1. Check audio levels (not clipping)
2. Settings → Audio → Sample Rate: 48 kHz
3. Add filters: Noise Suppression, Compressor
4. Adjust sync offset if out of sync
5. Test with headphones
```

---

## 📚 Documentation

### Essential Guides
- **Quickstart:** [QUICKSTART.md](./QUICKSTART.md)
- **User Guide:** [USER_GUIDE.md](./USER_GUIDE.md)
- **OBS Integration:** [OBS_INTEGRATION.md](./OBS_INTEGRATION.md) ⭐
- **Functional Style:** [FUNCTIONAL_STYLE.md](./FUNCTIONAL_STYLE.md)

### Development
- **Build & Run:** [BUILD_AND_RUN.md](./BUILD_AND_RUN.md)
- **CI/CD:** [CI_CD_SUMMARY.md](./CI_CD_SUMMARY.md)
- **GitHub Setup:** [GITHUB_SETUP.md](./GITHUB_SETUP.md)

### Deployment
- **Multi-Platform:** [MULTI_PLATFORM_CLOUD.md](./MULTI_PLATFORM_CLOUD.md)
- **Production:** [PRODUCTION_READY.md](./PRODUCTION_READY.md)
- **Testing:** [USER_ACCEPTANCE_TESTING.md](./USER_ACCEPTANCE_TESTING.md)

---

## 💰 Cost Breakdown

### Free (Minimum)
- **OBS Studio:** $0
- **Sanctuary Stream:** $0
- **USB Webcam:** $50-100
- **Cables:** $20
- **Internet:** (existing)
- **Total:** $70-120

### Budget ($500)
- Free software: $0
- 1 HDMI camera: $150
- Capture card: $150
- Cables & mounts: $50
- Audio interface: $100
- Computer: (existing)
- **Total:** ~$500

### Professional ($2,000+)
- Free software: $0
- 2-3 PTZ cameras: $1,000-3,000
- Video switcher: $500-1,500
- Audio mixer: $500-1,000
- Capture cards: $300
- Lighting: $200-500
- Dedicated computer: $1,000-2,000
- **Total:** $3,500-8,000+

**Key Point:** Start small, upgrade as needed!

---

## 🆘 Quick Help

### Getting Started
```bash
# New user? Start here:
1. Read: docs/QUICKSTART.md (5 minutes)
2. Download: https://github.com/brentmzey/sanctuary-stream/releases
3. Install OBS: https://obsproject.com/download
4. Enable WebSocket in OBS
5. Connect & stream!
```

### Need Help?
- 📖 **Docs:** All in `./docs/` folder
- 🐛 **Issues:** https://github.com/brentmzey/sanctuary-stream/issues
- 💬 **Discuss:** https://github.com/brentmzey/sanctuary-stream/discussions
- 📧 **Email:** support@sanctuary-stream.com

### Video Tutorials
- OBS Quickstart: https://obsproject.com/wiki/
- Church streaming guides: YouTube (search "OBS church")
- Sanctuary Stream: Coming soon!

---

## ✅ Success Checklist

**Before First Stream:**
- [ ] OBS installed and configured
- [ ] WebSocket enabled (Tools → WebSocket Settings)
- [ ] Streaming platform configured (YouTube/Facebook)
- [ ] Video settings optimized (resolution, bitrate)
- [ ] Audio settings configured (48 kHz, correct sources)
- [ ] Scenes created and tested
- [ ] Internet speed tested (5+ Mbps upload)
- [ ] Sanctuary Stream installed and connected
- [ ] Test stream performed (5-10 minutes private)
- [ ] Backup plan ready

**You're Ready to Go Live! 🎉**

---

## 📊 Quick Stats

- **Setup Time:** 5-30 minutes
- **Learning Curve:** Easy (if familiar with streaming)
- **Cost:** Free software + camera ($0-500+)
- **Quality:** Broadcast-grade (1080p @ 30fps)
- **Reliability:** Professional (used by millions)
- **Support:** Extensive (docs + community)

---

**⚡ Keep this handy for quick answers!**

**🎥 Professional streaming made simple.**
