# 🎥 Professional Video Streaming Guide

**Complete guide to high-fidelity video and audio streaming with Sanctuary Stream**

---

## 🎯 Overview

Sanctuary Stream now includes **professional-grade video and audio quality controls** with real-time monitoring and adaptive streaming capabilities. This guide covers everything from basic setup to advanced CDN integration for scaling to thousands of viewers.

---

## ✨ New Features

### Remote Video Quality Control
- **Full resolution control**: 480p to 4K (3840×2160)
- **Frame rate options**: 24, 30, or 60 FPS
- **Bitrate management**: 500 Kbps to 51,000 Kbps
- **Encoder selection**: CPU (x264) or GPU (NVENC/QuickSync/AMF)
- **Quality presets**: Quick presets for common scenarios
- **Real-time adjustments**: Change settings remotely without touching OBS

### Audio Quality Management
- **Sample rates**: 44.1 kHz (CD) or 48 kHz (Broadcast)
- **Bitrate options**: 96, 128, 160, or 320 Kbps
- **Channel modes**: Mono (speech) or Stereo (music)
- **Codec**: AAC for maximum compatibility

### Real-Time Health Monitoring
- **Live bitrate tracking**: See actual upload speed in real-time
- **Frame drop detection**: Alerts when quality degrades
- **CPU monitoring**: Know when your computer is struggling
- **Uptime tracking**: Monitor stream duration
- **Smart recommendations**: AI-powered suggestions for optimization

---

## 🚀 Quick Start

### 1. Access Quality Controls

From the Sanctuary Stream app:
1. Log in as admin or pastor
2. Navigate to **Stream Control** tab
3. Click **🎬 Video Quality** button
4. Choose a preset or customize settings

### 2. Choose a Preset

**Quick Presets Available:**

| Preset | Resolution | FPS | Bitrate | Use Case |
|--------|-----------|-----|---------|----------|
| 📱 Low Bandwidth | 480p | 30 | 1 Mbps | Weak internet, basic quality |
| 💻 Standard | 720p | 30 | 2.5 Mbps | Most churches, good quality |
| 🎥 High Quality | 1080p | 30 | 4.5 Mbps | Recommended for most services |
| ⭐ Ultra (60fps) | 1080p | 60 | 6 Mbps | Special events, concerts |

### 3. Apply Settings

1. Select your desired preset or customize
2. Click **"Apply Quality Settings to OBS"**
3. Settings are saved and will apply on next stream start
4. Current stream is not interrupted

---

## 🎬 Detailed Configuration

### Video Settings

#### Resolution
Choose based on your needs and internet speed:

```
4K (3840×2160)    - Professional broadcasts, requires 20+ Mbps upload
1440p (2560×1440) - High-end streaming, requires 9+ Mbps upload  
1080p (1920×1080) - Recommended for churches, requires 5+ Mbps upload
720p (1280×720)   - Good quality, works on 3+ Mbps upload
480p (854×480)    - Basic quality, minimal bandwidth
```

**Recommendation**: **1080p @ 30fps** is the sweet spot for church services. It provides excellent quality while being achievable with typical internet connections.

#### Frame Rate (FPS)
- **24 fps**: Cinematic look, saves bandwidth
- **30 fps**: Recommended for most content, smooth motion
- **60 fps**: Ultra-smooth, best for concerts/sports, uses 50% more bandwidth

#### Video Bitrate
Higher bitrate = better quality but requires more upload speed.

**Bitrate Guidelines by Resolution:**

| Resolution | Minimum | Recommended | Maximum |
|------------|---------|-------------|---------|
| 480p @ 30fps | 500 Kbps | 1,000 Kbps | 2,000 Kbps |
| 720p @ 30fps | 1,500 Kbps | 2,500 Kbps | 4,000 Kbps |
| 1080p @ 30fps | 3,000 Kbps | 4,500 Kbps | 6,000 Kbps |
| 1080p @ 60fps | 4,500 Kbps | 6,000 Kbps | 9,000 Kbps |
| 4K @ 30fps | 20,000 Kbps | 25,000 Kbps | 51,000 Kbps |

**Rule of Thumb**: Your upload speed should be **2x your video bitrate** for stability.

Example: 4,500 Kbps stream needs 9 Mbps (9,000 Kbps) upload.

#### Encoder Selection
Choose the best encoder for your hardware:

**Software (x264) - CPU**
- ✅ Works on any computer
- ✅ Best quality at low bitrates
- ❌ High CPU usage (50-80%)
- ❌ May drop frames on slower CPUs
- **Best for**: Powerful computers without GPU encoding

**NVIDIA NVENC - GPU**
- ✅ Low CPU usage (5-15%)
- ✅ Fast encoding
- ✅ Great quality at high bitrates
- ❌ Requires NVIDIA GTX 900+ series
- **Best for**: Computers with NVIDIA graphics cards

**Intel QuickSync - GPU**
- ✅ Low CPU usage
- ✅ Works on integrated Intel graphics
- ✅ Good quality
- ❌ Slightly lower quality than NVENC
- **Best for**: Intel CPUs with integrated graphics

**AMD AMF - GPU**
- ✅ Low CPU usage
- ✅ Works on AMD graphics cards
- ✅ Improving quality with newer versions
- ❌ Historically lower quality than NVENC
- **Best for**: Computers with AMD graphics cards

**Recommendation**: Use **GPU encoding whenever possible** (NVENC/QuickSync/AMF). It frees up CPU for OBS effects and ensures smooth streaming.

#### Encoder Preset
Controls speed vs quality tradeoff:

**CPU (x264) Presets:**
- **Ultrafast**: Lowest quality, fastest encoding
- **Very Fast**: Low quality, fast encoding
- **Fast**: Good balance (recommended)
- **Medium**: Better quality, slower
- **Slow**: Best quality, very slow

**GPU Presets:**
- **Performance**: Fastest, lower quality
- **Quality**: Balanced (recommended)
- **Max Quality**: Best quality, slower encoding

**Recommendation**: Use **"Fast"** for CPU or **"Quality"** for GPU.

#### Keyframe Interval
Keyframes are full frames sent periodically; frames in between are partial.

- **2 seconds** (recommended): Best for most platforms
- Lower (1s): Better seeking/chapter navigation, slightly larger file
- Higher (5-10s): Better compression, worse seeking

**YouTube/Facebook require**: 2 seconds maximum

---

### Audio Settings

#### Sample Rate
- **44.1 kHz**: CD quality, works everywhere
- **48 kHz**: Broadcast standard (recommended)

**Recommendation**: **48 kHz** for professional quality.

#### Audio Bitrate
Higher bitrate = better audio quality:

- **96 Kbps**: Basic speech, minimal bandwidth
- **128 Kbps**: Good speech quality
- **160 Kbps**: Excellent speech (recommended for sermons)
- **320 Kbps**: High-quality music (recommended for worship)

**For typical church service**: Use **160 Kbps** for clear speech and decent music.

#### Channels
- **Mono**: Single channel, saves bandwidth, fine for speech-only
- **Stereo**: Two channels, recommended for music

**Recommendation**: **Stereo** for full services with music.

---

## 📊 Data Usage & Storage Planning

### Bandwidth Calculator

The app includes a built-in calculator that shows:
- **Data per minute** of streaming
- **Data per hour** of streaming
- **Estimated data for 3h 15m** (your parish example)

**Example: 1080p @ 30fps @ 4,500 Kbps video + 160 Kbps audio**
- Total bitrate: 4,660 Kbps (4.66 Mbps)
- Per minute: ~35 MB
- Per hour: ~2.1 GB
- **3h 15m service: ~6.8 GB**

### Storage Considerations

If you're recording services to disk and/or uploading to cloud storage:

**Local Storage (Recording to disk)**
- 1080p @ 30fps: ~2 GB per hour
- 52 services per year: ~104 GB/year
- 500 GB drive: Can store ~4 years of services

**Cloud Storage Costs (if uploading recordings)**
| Provider | Cost per GB/month | 100 GB/year cost |
|----------|-------------------|------------------|
| Google Drive | $0.02 | ~$2/year |
| Dropbox | $0.01 | ~$1/year |
| Amazon S3 | $0.023 | ~$2.30/year |

**YouTube (Free Option)**
- ✅ **Unlimited uploads** (free forever)
- ✅ Automatic archiving after live stream
- ✅ No storage costs
- ✅ Built-in CDN for global viewers
- ⚠️ Videos are public or unlisted (not truly private)

**Recommendation**: Use **YouTube for archiving** (free unlimited storage) and only pay for cloud storage if you need truly private backups.

---

## 🌐 Scaling with CDN

### When Do You Need a CDN?

**You DON'T need a CDN if:**
- Streaming to YouTube, Facebook, or Twitch (they provide CDN)
- Viewers < 100 concurrent
- Using cloud platforms (Restream.io, etc.)

**You DO need a CDN if:**
- Self-hosting video streaming (not YouTube)
- 1,000+ concurrent viewers on your own infrastructure
- Custom video player on your website
- Need ultra-low latency (< 3 seconds)

### CDN Options for Churches

If you're streaming **directly to YouTube/Facebook**, you're already using their CDN (free). No action needed.

If you're **self-hosting**, consider:

#### 1. **Cloudflare Stream** (Easiest)
- **Cost**: $1/1,000 minutes of video delivered
- **Features**: 
  - Automatic transcoding (multiple qualities)
  - Global CDN
  - Built-in video player
  - HLS/DASH support
- **Setup**: Upload video → Get embed code → Done
- **Best for**: Churches wanting custom website streaming

#### 2. **AWS CloudFront + MediaLive** (Advanced)
- **Cost**: $0.085/GB delivered + processing fees
- **Features**:
  - Massive scale (millions of viewers)
  - Lowest latency options
  - Full control over everything
- **Complexity**: Requires AWS expertise
- **Best for**: Large ministries with IT teams

#### 3. **Fastly** (Professional)
- **Cost**: ~$0.12/GB delivered
- **Features**:
  - Instant purging
  - Real-time analytics
  - Edge computing
- **Best for**: Multi-site churches, large ministries

#### 4. **Restream.io** (Recommended for Most)
- **Cost**: Free tier available, $16/month for unlimited
- **Features**:
  - Stream to 30+ platforms simultaneously
  - Built-in CDN
  - No technical setup
- **Best for**: Most churches wanting multi-platform streaming

### Implementing CDN with Sanctuary Stream

**Option A: Stream to Multiple Platforms (Recommended)**
```bash
# Use Restream.io to broadcast everywhere at once
1. Sign up at restream.io (free or $16/month)
2. Connect platforms: YouTube, Facebook, your website, etc.
3. In Sanctuary Stream → Stream Settings:
   - Service: Custom
   - Server: rtmps://live.restream.io/live
   - Key: [Your Restream Key]
4. Start streaming → Reaches all platforms simultaneously
```

**Option B: YouTube + Embed on Website (Free CDN)**
```bash
# Use YouTube's free CDN by embedding on your site
1. Stream to YouTube Live (via Sanctuary Stream)
2. Get YouTube embed code from "Share" → "Embed"
3. Add to your church website:
   <iframe src="https://youtube.com/embed/LIVE_VIDEO_ID" ...></iframe>
4. Viewers watch on your site, served by YouTube's CDN (free)
```

**Option C: Custom RTMP → Cloudflare Stream**
```bash
# For advanced users wanting full control
1. Sign up for Cloudflare Stream
2. Get RTMP endpoint and stream key
3. In Sanctuary Stream → Stream Settings:
   - Service: Custom
   - Server: rtmps://live.cloudflare.com/YOUR_ACCOUNT
   - Key: [Your Stream Key]
4. Cloudflare provides embed code for your website
```

---

## 🎙️ Handling Long Streams (3+ Hours)

Your example: **3h 15m Old St. Mary's service**

### Best Practices for Long Streams

#### 1. **Use Constant Bitrate (CBR)**
✅ Already default in OBS
- Ensures consistent quality throughout
- Prevents buffer issues after hours of streaming

#### 2. **Monitor Stream Health**
- Use the new **Stream Health Monitor** in Sanctuary Stream
- Watch for frame drops (should stay < 1%)
- Monitor CPU usage (should stay < 80%)
- Keep an eye on bitrate stability

#### 3. **Stable Internet is Critical**
For 3+ hour streams:
- ✅ Use **wired Ethernet** (never WiFi)
- ✅ Test upload speed before going live
- ✅ Have backup internet (mobile hotspot) ready
- ✅ Ask ISP for "business" or "dedicated" line if budget allows

#### 4. **Computer Endurance**
Long streams stress computers:
- ✅ Use **GPU encoding** (NVENC/QuickSync) to reduce CPU load
- ✅ Close all other applications
- ✅ Ensure good cooling (laptop on elevated stand, desktop with clean fans)
- ✅ Monitor CPU temperature (should stay < 80°C)

#### 5. **Recording Strategy**
For 3h 15m services, recording to local disk:
- **File size**: ~6-7 GB at 1080p @ 30fps
- **Format**: Use MP4 (most compatible)
- **Backup**: Auto-upload to Google Drive via Sanctuary Bridge
- **Split recordings**: OBS can auto-split every hour (Settings → Output → Recording → "Automatically split file every X minutes")

**Recommendation**: Enable auto-split at 60 minutes. Produces:
- `Service_2026-02-28_Part1.mp4` (1 hour)
- `Service_2026-02-28_Part2.mp4` (1 hour)
- `Service_2026-02-28_Part3.mp4` (1h 15m)

Easier to manage, upload, and edit.

#### 6. **Platform-Specific Considerations**

**YouTube Live:**
- ✅ No time limit for verified accounts
- ✅ Handles 3+ hours perfectly
- ✅ Auto-archives after stream ends
- ✅ Viewers can rewind during live stream
- 💡 Tip: Set up "Live Control Room" beforehand

**Facebook Live:**
- ⚠️ 8-hour maximum (3h 15m is fine)
- ⚠️ Occasional interruptions on very long streams
- 💡 Tip: Schedule event in advance

**Twitch:**
- ✅ No time limit
- ⚠️ VODs deleted after 14 days (free accounts)
- 💡 Tip: Export to YouTube for archiving

---

## 🔧 Troubleshooting Quality Issues

### Issue: Stream looks pixelated/blocky

**Causes:**
- Bitrate too low for resolution
- Poor lighting (camera struggling)
- Too much motion in scene

**Solutions:**
1. Increase video bitrate (try +1000 Kbps increments)
2. Improve church lighting (more light = cleaner image)
3. Reduce motion (slower camera movements)
4. Use higher quality camera

### Issue: Buffering for viewers

**Causes:**
- Your upload speed too slow
- Internet connection unstable
- Bitrate set too high

**Solutions:**
1. Test upload speed: speedtest.net (should be 2x your bitrate)
2. Lower bitrate by 500-1000 Kbps
3. Switch to wired Ethernet
4. Contact ISP about unstable connection
5. Consider lower resolution (1080p → 720p)

### Issue: Dropped frames

**Causes:**
- CPU maxed out
- Upload speed too slow
- Network congestion

**Solutions:**
1. Switch to GPU encoding (NVENC/QuickSync)
2. Lower encoder preset (Medium → Fast)
3. Lower resolution or frame rate
4. Close other applications
5. Check Sanctuary Stream Health Monitor for recommendations

### Issue: Audio out of sync

**Causes:**
- Audio latency from mixer/interface
- OBS processing delay

**Solutions:**
1. In OBS: Right-click audio source → Advanced Audio Properties
2. Add "Sync Offset" (+/- milliseconds)
3. Test with short stream, adjust incrementally
4. Typical offset: +50ms to +200ms

### Issue: Stream freezes/stutters

**Causes:**
- Network interruption
- Computer overheating
- OBS overloaded

**Solutions:**
1. Check internet stability (ping test)
2. Monitor CPU temperature (should be < 80°C)
3. Ensure good ventilation
4. Lower encoder preset
5. Disable OBS filters/effects
6. Restart OBS before long streams

---

## 📱 Testing Your Setup

### Pre-Service Checklist

**Before going live:**

1. **Test Stream (Private)**
   - Set YouTube to "Unlisted" or "Private"
   - Stream for 10-15 minutes
   - Watch on phone/laptop to verify quality
   - Check Health Monitor for issues

2. **Verify Quality Settings**
   - Open Sanctuary Stream → Video Quality
   - Confirm resolution, FPS, bitrate
   - Ensure GPU encoding enabled

3. **Check Health Monitor**
   - Frame drops < 1%
   - CPU usage < 80%
   - Bitrate stable (not fluctuating wildly)

4. **Audio Check**
   - Speak into microphones
   - Play music from soundboard
   - Verify levels in OBS (green zone, not red)

5. **Internet Speed Test**
   - Run speedtest.net
   - Upload should be 2x your bitrate
   - Example: 4,500 Kbps stream needs 9 Mbps upload

### During Stream Monitoring

**Watch these metrics in Sanctuary Stream:**
- ✅ Status: "🔴 LIVE" (green indicator)
- ✅ Frame Drops: < 1% (green)
- ✅ CPU Usage: < 80% (green)
- ✅ Bitrate: Stable, close to target
- ✅ Uptime: Counting up

**If Health becomes "Poor" or "Critical":**
1. Check recommendations in Health Monitor
2. Consider lowering bitrate mid-stream (requires restart)
3. Have backup plan (phone recording)

---

## 🎓 Advanced Topics

### Adaptive Bitrate Streaming (ABR)

**What is it?**
ABR automatically adjusts video quality based on viewer's internet speed. Viewer with slow internet gets 480p, fast internet gets 1080p.

**Do you need it?**
- ❌ **NO** if streaming to YouTube/Facebook (they handle it automatically)
- ✅ **YES** if self-hosting with custom video player

**How to implement:**
1. Use Cloudflare Stream or AWS MediaLive (they transcode automatically)
2. Or use OBS with HLS output + nginx-rtmp-module for self-hosting
3. Configure multiple bitrate ladders: 1080p, 720p, 480p, 360p

**For most churches**: Not needed. YouTube does this automatically.

### Ultra-Low Latency Streaming

**Standard latency**: 10-30 seconds (YouTube, Facebook)
**Low latency**: 3-5 seconds (YouTube Low Latency Mode)
**Ultra-low latency**: < 1 second (WebRTC, SRT)

**When do you need ultra-low latency?**
- Interactive services (chat participation, prayer requests)
- Two-way communication with remote speakers
- Live auctions, Q&A sessions

**How to implement:**
1. Use YouTube "Low Latency" mode (free, easy)
2. Or use Wowza Streaming Cloud ($24/month, < 3 seconds)
3. Or WebRTC (complex, requires custom setup)

**Trade-off**: Lower latency = higher chance of buffering

### Multi-Bitrate / Multi-Track Recording

**Record at higher quality than you stream:**

OBS Settings → Output → Recording:
- Video Bitrate: 20,000 Kbps (4x streaming bitrate)
- Encoder: Use GPU for minimal performance hit
- Format: MKV (safe) or MP4 (if you're confident)

**Benefits:**
- Archive at ultra-high quality
- Edit/reuse footage later at full quality
- Stream at lower bitrate for viewers

**Cost**: More disk space (10 GB per hour instead of 2 GB)

---

## 💰 Cost Analysis: Open-Source vs Paid

Sanctuary Stream is **100% open-source and free**. Here's how costs stack up:

### Free Forever Tier (Most Churches)
| Component | Cost |
|-----------|------|
| Sanctuary Stream software | $0 (open-source) |
| OBS Studio | $0 (open-source) |
| PocketBase (self-hosted) | $0 (open-source) |
| YouTube Live streaming | $0 (unlimited) |
| YouTube video archiving | $0 (unlimited) |
| **Total monthly cost** | **$0** |

**Storage**: Unlimited via YouTube. Only pay if you want private backups:
- Google Drive (100 GB): $1.99/month
- Google Drive (200 GB): $2.99/month

### Paid Tiers (Optional Upgrades)

**Small Church Tier (~$5-20/month)**
- PocketHost.io (cloud backend): $5/month
- Google Drive (100 GB): $2/month
- **Total**: $7/month

**Medium Church Tier (~$20-50/month)**
- PocketHost.io (cloud): $10/month
- Restream.io (multi-platform): $16/month
- Google Drive (200 GB): $3/month
- **Total**: $29/month

**Large Church Tier (~$100-300/month)**
- AWS or Azure VPS (high-performance): $50/month
- Cloudflare Stream (CDN): $50/month (based on usage)
- Multi-site connectivity: $100/month (based on bandwidth)
- **Total**: ~$200/month

**Enterprise Tier (Multi-Campus)**
- Dedicated servers: $500+/month
- CDN (AWS CloudFront): $100+/month
- Professional support: Custom pricing

**Open-source promise**: Core software always free. Only pay for:
1. Cloud hosting (optional)
2. Storage beyond YouTube (optional)
3. Premium features like multi-platform (optional)

---

## 🆘 Support & Resources

### Getting Help

1. **Documentation**: Start with `/docs` folder
2. **GitHub Issues**: Report bugs or request features
3. **GitHub Discussions**: Ask questions, share setups
4. **Email**: support@sanctuarystream.org (if available)

### Testing Videos

You mentioned having test videos. To test your setup:

**Option 1: VLC as Virtual Camera (Test without camera)**
```bash
1. Install VLC: https://www.videolan.org/
2. Open VLC → Media → Open File → Select your 3h 15m video
3. Tools → Preferences → Show Settings: All
4. Stream Output → Sout stream → check "Stream to network"
5. In OBS: Add Video Capture Device → VLC Virtual Camera
6. Test streaming with your recorded video
```

**Option 2: YouTube Video as Source**
```bash
1. In OBS: Add Browser Source
2. URL: https://www.youtube.com/embed/xTyIowgVWaA (your parish video)
3. Width: 1920, Height: 1080
4. Custom CSS: body { margin: 0; overflow: hidden; }
5. Test streaming by re-broadcasting the YouTube video
```

**Option 3: Actual Service Test**
```bash
1. Set up 30 minutes before service
2. Start a private/unlisted YouTube stream
3. Verify quality on phone/tablet
4. Let it run for 10 minutes
5. Check Health Monitor
6. Go live for real service
```

### Performance Monitoring Tools

**Built-in (Sanctuary Stream):**
- ✅ Real-time Health Monitor
- ✅ Bitrate tracking
- ✅ Frame drop detection
- ✅ CPU monitoring

**External Tools:**
- OBS Stats Dock (View → Docks → Stats)
- Windows Task Manager → Performance
- macOS Activity Monitor
- HWMonitor (hardware temps)

---

## 🎉 Success Criteria

Your setup is ready for production when:

- ✅ Test stream runs for 30+ minutes without issues
- ✅ Frame drops stay < 1%
- ✅ CPU usage stays < 80%
- ✅ Health Monitor shows "Excellent" or "Good"
- ✅ Audio and video are in sync
- ✅ Bitrate is stable (not jumping around)
- ✅ Viewers can watch without buffering
- ✅ Recording saves successfully

**For your 3h 15m parish service:**
- Target: 1080p @ 30fps @ 4,500 Kbps
- Expected data: ~6.8 GB
- Expected quality: Excellent (broadcast-grade)
- Viewer experience: Smooth, professional

---

## 📄 License

**OBS Studio**: GPL v2 (Free & Open Source)  
**Sanctuary Stream**: MIT (Free & Open Source)  
**PocketBase**: MIT (Free & Open Source)

**Combined**: 100% Free, forever. Pay only for optional cloud storage/hosting.

---

## 🙏 Conclusion

Sanctuary Stream now provides **professional-grade video control** comparable to proprietary services like Boxcast ($50-200/month) or Resi ($90-400/month), but **completely free and open-source**.

**Key Advantages:**
- ✅ Full control over video/audio quality
- ✅ Real-time health monitoring
- ✅ Remote configuration (no touching OBS)
- ✅ Handles 3+ hour streams effortlessly
- ✅ Works with existing YouTube/Facebook setup
- ✅ No subscriptions, no paywalls

**Your parish service (3h 15m) will stream beautifully** at 1080p with the settings provided in this guide.

---

**Questions? Open an issue or discussion on GitHub!**

**🎥 Professional streaming. Free software. Churches worldwide.**
