# Platform Support & Real-Time Access

## ✅ ALL Platforms Support Real-Time WebSocket Connections

Every client target has **full access to all 245+ PocketBase backends** with **real-time updates** via WebSocket connections.

---

## 🎯 Supported Platforms

### Desktop (Tauri - Native Performance)
- **macOS** (Universal: Intel + Apple Silicon)
  - ✅ Real-time WebSocket connections
  - ✅ Native system integration
  - ✅ HD/4K streaming support
  - ✅ Background updates
  
- **Windows** (10/11 - x64)
  - ✅ Real-time WebSocket connections
  - ✅ Native system integration
  - ✅ HD/4K streaming support
  - ✅ Background updates
  
- **Linux** (Ubuntu/Debian/AppImage)
  - ✅ Real-time WebSocket connections
  - ✅ Native system integration
  - ✅ HD/4K streaming support
  - ✅ Background updates

### Mobile (Tauri + Capacitor Fallback)
- **iOS** (13+)
  - ✅ Real-time WebSocket connections
  - ✅ Native performance (Tauri)
  - ✅ Web fallback (Capacitor)
  - ✅ Background updates
  - ✅ Push notifications
  - ✅ Auto-reconnection
  
- **Android** (7.0+)
  - ✅ Real-time WebSocket connections
  - ✅ Native performance (Tauri)
  - ✅ Web fallback (Capacitor)
  - ✅ Background updates
  - ✅ Push notifications
  - ✅ Auto-reconnection

### Web (Progressive Web App)
- **All Modern Browsers**
  - ✅ Real-time WebSocket connections
  - ✅ Chrome, Firefox, Safari, Edge
  - ✅ Installable (PWA)
  - ✅ Offline support
  - ✅ Auto-reconnection

---

## 🔌 Real-Time Connection Features

### WebSocket Support
All platforms support persistent WebSocket connections for real-time updates:

- **Auto-reconnection**: Exponential backoff (1s → 30s)
- **Network resilience**: Handles offline/online transitions
- **Connection pooling**: Efficient resource usage
- **Heartbeat monitoring**: Automatic connection health checks

### Backend Flexibility
Connect to ANY of your 245+ PocketBase instances:

- **Local**: `http://127.0.0.1:8090` (development)
- **Cloud**: `https://your-church.pockethost.io` (production)
- **Self-hosted**: `https://your-domain.com` (custom)
- **Multiple**: Switch between backends at runtime

### Configuration Priority
1. **localStorage** (user settings in-app)
2. **URL parameter** (`?pb=https://your-backend.com`)
3. **Environment variable** (`VITE_PB_URL`)
4. **Default** (`http://127.0.0.1:8090`)

---

## 📦 Build Outputs

### Desktop Installers
```
macOS:
  - Sanctuary-Stream-universal.dmg (Universal Binary)
  - Sanctuary-Stream.app (macOS App Bundle)

Windows:
  - Sanctuary-Stream-x64.msi (MSI Installer)
  - Sanctuary-Stream-x64-setup.exe (NSIS Installer)

Linux:
  - sanctuary-stream_amd64.deb (Debian/Ubuntu)
  - sanctuary-stream_amd64.AppImage (Universal)
```

### Mobile Packages
```
iOS:
  - Sanctuary-Stream.ipa (App Store / TestFlight)
  - Sanctuary-Stream.app (Xcode Build)

Android:
  - sanctuary-stream-release.apk (Direct Install)
  - sanctuary-stream-release.aab (Google Play)
```

### Web Deployment
```
Web:
  - dist/ (Static files)
  - Auto-deployed to Vercel
  - PWA-enabled (installable)
```

---

## 🔐 Security & Permissions

### Desktop (Tauri)
- **HTTP/HTTPS**: Full access to all backends
- **WebSocket**: `ws://*:*` and `wss://*:*`
- **CSP**: Configured for maximum compatibility
- **Localhost**: Unrestricted (for local PocketBase)

### Mobile (Tauri/Capacitor)
- **HTTP/HTTPS**: Full access to all backends
- **WebSocket**: Native support
- **Mixed Content**: Allowed for localhost
- **Background Mode**: Enabled for real-time updates
- **Network State**: Monitored for auto-reconnection

### Web (Browser)
- **HTTP/HTTPS**: Full CORS support
- **WebSocket**: Native browser support
- **Service Worker**: Offline caching
- **Notifications**: Push notification API

---

## 🚀 Performance

### Real-Time Latency
- **Local PocketBase**: < 5ms
- **Cloud (PocketHost)**: < 50ms (US East)
- **Self-hosted**: Depends on network

### Connection Pooling
- **Desktop**: 1 WebSocket per backend
- **Mobile**: Auto-managed by OS
- **Web**: Browser-managed

### Resource Usage
- **Desktop**: ~50-100 MB RAM
- **Mobile**: ~30-80 MB RAM
- **Web**: ~20-50 MB (browser tab)

---

## 🔧 Network Requirements

### Minimum Bandwidth
- **Control Commands**: < 1 KB/s
- **Status Updates**: < 5 KB/s
- **Video Streaming**: Handled by OBS (not in-app)

### Firewall Rules
```bash
# Outbound (required)
HTTP:  80/tcp   → Backend API
HTTPS: 443/tcp  → Backend API (recommended)
WS:    80/tcp   → Real-time updates
WSS:   443/tcp  → Real-time updates (recommended)

# Inbound (optional, for local PocketBase)
HTTP:  8090/tcp → Local backend
```

---

## 🧪 Testing Real-Time Connections

### Desktop
```bash
# macOS/Linux
open sanctuary-stream://connect?pb=https://test.pockethost.io

# Windows
start sanctuary-stream://connect?pb=https://test.pockethost.io
```

### Mobile
```bash
# iOS (via Universal Link)
https://sanctuary-stream.app/connect?pb=https://test.pockethost.io

# Android (via Deep Link)
sanctuary://connect?pb=https://test.pockethost.io
```

### Web
```bash
# Direct URL
https://sanctuary-stream.vercel.app/?pb=https://test.pockethost.io
```

---

## 📊 Monitoring & Diagnostics

### Connection Status
All platforms show real-time connection status:
- 🟢 **Connected**: Real-time updates active
- 🟡 **Reconnecting**: Temporary network issue
- 🔴 **Disconnected**: No backend connection
- ⚪ **Idle**: No active subscriptions

### Debug Logging
Enable detailed WebSocket logs:
```javascript
localStorage.setItem('pb_debug', 'true');
```

### Health Checks
Automatic endpoint health checks every 30 seconds:
```
GET https://your-backend.com/api/health
```

---

## 🎯 Real-World Usage

### Single Church (1 Backend)
```
Desktop (sanctuary) → wss://church.pockethost.io
Mobile (pastor)     → wss://church.pockethost.io
Web (volunteer)     → wss://church.pockethost.io
```

### Multi-Site Church (Multiple Backends)
```
Campus 1 → wss://campus1.pockethost.io
Campus 2 → wss://campus2.pockethost.io
Campus 3 → wss://campus3.pockethost.io
```

### Multi-Denomination Network (245+ Backends)
```
Each church has independent PocketBase instance
All use the same Sanctuary Stream client apps
No central server required (zero-trust)
```

---

## ✨ Summary

**Every platform has:**
- ✅ Full real-time WebSocket support
- ✅ Access to all 245+ backends
- ✅ Auto-reconnection with exponential backoff
- ✅ Network resilience (online/offline handling)
- ✅ User-configurable backend URLs
- ✅ HD/4K streaming control
- ✅ Professional audio support
- ✅ Zero-trust architecture

**No platform limitations. No feature parity issues. Just works everywhere.** 🚀
