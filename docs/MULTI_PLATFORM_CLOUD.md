# 🌍 Multi-Platform & Cloud Integration Guide

**Sanctuary Stream - Universal Deployment**

---

## 📱 Supported Platforms

### ✅ Desktop (via Tauri + Rust)
- **macOS** (Intel + Apple Silicon)
- **Windows** (10/11, x64)
- **Linux** (Debian, Ubuntu, Fedora, AppImage)

### ✅ Mobile (via Tauri Mobile)
- **iOS** (13.0+)
- **Android** (API 24+)

### ✅ Web (Progressive Web App)
- **All modern browsers**
- **Installable PWA**

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Sanctuary Stream App                      │
│  (React/TypeScript Frontend + Tauri/Rust Backend)           │
└───────────────────┬─────────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
    ┌───▼───┐   ┌───▼───┐   ┌──▼────┐
    │ macOS │   │Windows│   │ Linux │
    └───────┘   └───────┘   └───────┘
        │           │           │
        └───────────┼───────────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
    ┌───▼───┐   ┌───▼────┐
    │  iOS  │   │Android │
    └───────┘   └────────┘
                    │
            ┌───────┴───────┐
            │               │
    ┌───────▼──────┐  ┌────▼─────────┐
    │  PocketBase  │  │ Cloud Services│
    │  (Any Host)  │  │  (Optional)   │
    └──────────────┘  └───────────────┘
            │               │
        ┌───┴───┐     ┌─────┴──────┐
        │Local  │     │AWS/RabbitMQ│
        │SQLite │     │   /Redis   │
        └───────┘     └────────────┘
```

---

## 🚀 Building for All Platforms

### Prerequisites
```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Node.js 18+
# https://nodejs.org/

# Install dependencies
cd sanctuary-stream/sanctuary-app
npm install
```

### macOS Build
```bash
# Build for macOS (Universal - Intel + Apple Silicon)
npm run tauri build -- --target universal-apple-darwin

# Output:
# - sanctuary-app/src-tauri/target/universal-apple-darwin/release/bundle/dmg/
# - sanctuary-app/src-tauri/target/universal-apple-darwin/release/bundle/macos/
```

### Windows Build
```bash
# Build for Windows
npm run tauri build -- --target x86_64-pc-windows-msvc

# Output:
# - sanctuary-app/src-tauri/target/x86_64-pc-windows-msvc/release/bundle/msi/
# - sanctuary-app/src-tauri/target/x86_64-pc-windows-msvc/release/bundle/nsis/
```

### Linux Build
```bash
# Build for Linux (AppImage + Deb)
npm run tauri build

# Output:
# - sanctuary-app/src-tauri/target/release/bundle/appimage/
# - sanctuary-app/src-tauri/target/release/bundle/deb/
```

### iOS Build (Requires macOS)
```bash
# Setup iOS development
rustup target add aarch64-apple-ios aarch64-apple-ios-sim

# Initialize iOS project
cd sanctuary-app
npm run tauri ios init

# Build and run
npm run tauri ios dev
npm run tauri ios build
```

### Android Build
```bash
# Setup Android development
rustup target add aarch64-linux-android armv7-linux-androideabi

# Set Android SDK/NDK paths
export ANDROID_HOME=/path/to/android-sdk
export NDK_HOME=$ANDROID_HOME/ndk/25.1.8937393

# Initialize Android project
cd sanctuary-app
npm run tauri android init

# Build and run
npm run tauri android dev
npm run tauri android build
```

### Web Build (No Tauri)
```bash
# Build for web deployment
cd sanctuary-app
npm run build

# Output: sanctuary-app/dist/
# Deploy to: Vercel, Netlify, Cloudflare Pages, etc.
```

---

## ☁️ Cloud Service Integrations

### 1. PocketBase Hosting Options

#### Option A: PocketHost (Managed)
```bash
# Deploy to PocketHost
# https://pockethost.io/

# Update environment
export VITE_POCKETBASE_URL="https://your-app.pockethost.io"

# Deploy migrations
npm run schema:init:production
```

#### Option B: Self-Hosted (VPS)
```bash
# On your server
wget https://github.com/pocketbase/pocketbase/releases/latest/download/pocketbase_linux_amd64.zip
unzip pocketbase_linux_amd64.zip
chmod +x pocketbase

# Run as systemd service
sudo systemctl start pocketbase
```

#### Option C: Railway.app
```bash
# Deploy to Railway
railway login
railway init
railway up

# Set environment variables in Railway dashboard
```

---

### 2. AWS Integration

#### S3 for Media Storage
```toml
# In sanctuary-app/src-tauri/Cargo.toml
[features]
default = ["custom-protocol", "cloud-aws"]
```

```rust
// Usage from frontend via Tauri
import { invoke } from '@tauri-apps/api/tauri';

await invoke('upload_to_s3', {
  bucket: 'sanctuary-stream-media',
  key: 'recordings/2026-02-05.mp4',
  data: recordingData
});
```

**Environment Variables:**
```bash
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET=sanctuary-stream-media
```

#### SQS for Event Queue
```typescript
// Send stream events to SQS
await invoke('send_to_sqs', {
  queueUrl: 'https://sqs.us-east-1.amazonaws.com/123456789/sanctuary-events',
  message: JSON.stringify({
    event: 'STREAM_STARTED',
    timestamp: new Date().toISOString(),
    metadata: { streamId, userId }
  })
});
```

#### CloudFront CDN
```bash
# Create CloudFront distribution
aws cloudfront create-distribution \
  --origin-domain-name sanctuary-stream-media.s3.amazonaws.com \
  --default-root-object index.html

# Update VITE_CDN_URL in .env
VITE_CDN_URL=https://d123456.cloudfront.net
```

---

### 3. RabbitMQ Integration

```toml
# Enable RabbitMQ feature
[features]
default = ["custom-protocol", "cloud-rabbitmq"]
```

```typescript
// Publish events to RabbitMQ
await invoke('publish_to_rabbitmq', {
  url: 'amqp://user:pass@rabbitmq.example.com:5672',
  exchange: 'sanctuary.events',
  routingKey: 'stream.started',
  message: JSON.stringify({
    streamId: 'stream-123',
    action: 'START',
    timestamp: Date.now()
  })
});
```

**Use Cases:**
- **Event Streaming:** Real-time notifications across services
- **Task Queue:** Async video processing
- **Microservices:** Decouple components

---

### 4. Redis Integration

```toml
# Enable Redis feature
[features]
default = ["custom-protocol", "cloud-redis"]
```

```rust
// Rust side (add to main.rs)
#[cfg(feature = "cloud-redis")]
#[tauri::command]
async fn cache_stream_status(key: String, value: String, ttl_seconds: usize) -> Result<String, String> {
    let client = redis::Client::open("redis://127.0.0.1/")
        .map_err(|e| format!("Redis connection failed: {}", e))?;
    let mut con = client.get_connection()
        .map_err(|e| format!("Failed to get connection: {}", e))?;
    
    redis::cmd("SETEX")
        .arg(&key)
        .arg(ttl_seconds)
        .arg(&value)
        .query(&mut con)
        .map_err(|e| format!("Redis command failed: {}", e))?;
    
    Ok("Cached successfully".to_string())
}
```

**Use Cases:**
- **Session Management:** Fast auth token lookup
- **Rate Limiting:** Prevent API abuse
- **Cache:** Reduce database load

---

### 5. Multi-Region Deployment

#### Global Architecture
```
┌────────────────────────────────────────────────────────┐
│          CloudFront (Global CDN)                       │
│  https://stream.sanctuary.com                          │
└────────────┬───────────────────────────────────────────┘
             │
     ┌───────┴──────────┐
     │                  │
┌────▼────┐      ┌──────▼──────┐
│ US-East │      │  EU-Central │
│         │      │             │
│PocketBase│     │ PocketBase  │
│ + Bridge│      │ + Bridge    │
└─────────┘      └─────────────┘
     │                  │
     └──────────┬───────┘
                │
        ┌───────▼────────┐
        │  RDS (Postgres) │
        │  Multi-Region   │
        └─────────────────┘
```

---

## 🔒 Security Configurations

### Code Signing (Required for Distribution)

#### macOS
```bash
# Get Developer ID certificate from Apple
# https://developer.apple.com/account/

# Sign the app
codesign --deep --force --verify --verbose \
  --sign "Developer ID Application: Your Name (TEAM_ID)" \
  ./target/release/bundle/macos/Sanctuary\ Stream.app

# Notarize for Gatekeeper
xcrun notarytool submit sanctuary-stream.dmg \
  --apple-id your@email.com \
  --password app-specific-password \
  --team-id TEAM_ID
```

#### Windows
```bash
# Get code signing certificate from a CA
# Use SignTool.exe

signtool sign /f certificate.pfx /p password \
  /t http://timestamp.digicert.com \
  target/release/bundle/msi/Sanctuary_Stream_0.1.0_x64.msi
```

### Content Security Policy
```json
// tauri.conf.json
{
  "security": {
    "csp": "default-src 'self'; connect-src ipc: https://*.pockethost.io https://*.amazonaws.com wss://*.pockethost.io"
  }
}
```

---

## 📦 Distribution

### 1. macOS App Store
```bash
# Build for App Store
npm run tauri build -- --target aarch64-apple-darwin --bundles app

# Upload via Transporter
# https://apps.apple.com/us/app/transporter/id1450874784
```

### 2. Microsoft Store
```bash
# Create MSIX package
npm run tauri build -- --bundles msix

# Upload to Partner Center
# https://partner.microsoft.com/
```

### 3. Google Play Store
```bash
# Build Android AAB
npm run tauri android build -- --release

# Upload to Play Console
# https://play.google.com/console
```

### 4. Apple App Store (iOS)
```bash
# Build for iOS
npm run tauri ios build -- --release

# Upload via Xcode or Transporter
```

### 5. Web Deployment

#### Vercel (Recommended for Web)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd sanctuary-app
vercel --prod
```

#### Netlify
```bash
# Deploy
cd sanctuary-app
npm run build
netlify deploy --prod --dir=dist
```

#### Self-Hosted
```bash
# Build
npm run build

# Serve with nginx
sudo cp -r dist/* /var/www/html/sanctuary-stream/
```

---

## 🧪 Testing Multi-Platform

### Desktop
```bash
# Run in development
npm run tauri dev

# Test production build
npm run tauri build
./target/release/sanctuary-stream
```

### Mobile
```bash
# iOS Simulator
npm run tauri ios dev

# Android Emulator
npm run tauri android dev
```

### Web
```bash
# Development server
npm run dev

# Production preview
npm run build && npm run preview
```

---

## 🎯 Build Matrix

| Platform | Rust Target | Command | Output |
|----------|-------------|---------|---------|
| macOS (Universal) | `universal-apple-darwin` | `npm run tauri build --target universal-apple-darwin` | `.dmg`, `.app` |
| macOS (Intel) | `x86_64-apple-darwin` | `npm run tauri build --target x86_64-apple-darwin` | `.dmg`, `.app` |
| macOS (ARM) | `aarch64-apple-darwin` | `npm run tauri build --target aarch64-apple-darwin` | `.dmg`, `.app` |
| Windows | `x86_64-pc-windows-msvc` | `npm run tauri build --target x86_64-pc-windows-msvc` | `.msi`, `.exe` |
| Linux | `x86_64-unknown-linux-gnu` | `npm run tauri build` | `.deb`, `.appimage` |
| iOS | `aarch64-apple-ios` | `npm run tauri ios build` | `.ipa` |
| Android | `aarch64-linux-android` | `npm run tauri android build` | `.apk`, `.aab` |
| Web | N/A | `npm run build` | `dist/` |

---

## 📊 Feature Matrix

| Feature | Desktop | Mobile | Web | Notes |
|---------|---------|--------|-----|-------|
| OBS Control | ✅ | ❌ | ❌ | Requires local bridge |
| Real-time Updates | ✅ | ✅ | ✅ | WebSocket |
| Offline Support | ✅ | ✅ | ⚠️ | PWA cache |
| System Tray | ✅ | ❌ | ❌ | Desktop only |
| Push Notifications | ✅ | ✅ | ⚠️ | Requires service worker |
| File System Access | ✅ | ⚠️ | ❌ | Sandboxed on mobile |
| Background Services | ✅ | ⚠️ | ❌ | OS restrictions |
| Auto Updates | ✅ | ✅ | ✅ | Tauri updater |
| Biometric Auth | ❌ | ✅ | ⚠️ | WebAuthn |

---

## 🔧 Cloud Feature Flags

Build with specific cloud integrations:

```bash
# Default (no cloud features)
cargo build --release

# With AWS S3 + SQS
cargo build --release --features cloud-aws

# With RabbitMQ
cargo build --release --features cloud-rabbitmq

# With Redis
cargo build --release --features cloud-redis

# All integrations
cargo build --release --features all-integrations
```

---

## 📝 Environment Variables (Complete)

```bash
# Core
VITE_POCKETBASE_URL=https://your-pb.pockethost.io
PB_SANCTUARY_STREAM_ADMIN_PASSWORD_PRODUCTION=secure-password

# AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
S3_BUCKET=sanctuary-stream
SQS_QUEUE_URL=https://sqs...
CLOUDFRONT_DISTRIBUTION_ID=E123456

# RabbitMQ
RABBITMQ_URL=amqp://user:pass@rabbitmq.example.com:5672
RABBITMQ_EXCHANGE=sanctuary.events

# Redis
REDIS_URL=redis://user:pass@redis.example.com:6379
REDIS_TTL=3600

# Monitoring
SENTRY_DSN=https://...@sentry.io/...
DATADOG_API_KEY=...
```

---

## ✅ Production Checklist

- [ ] Code signed for all platforms
- [ ] App store listings created
- [ ] SSL certificates configured
- [ ] CDN configured (CloudFront)
- [ ] Database backups automated
- [ ] Monitoring configured (Sentry, Datadog)
- [ ] Auto-updates enabled
- [ ] Rate limiting configured
- [ ] DDoS protection enabled
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] Support email configured
- [ ] Analytics configured (privacy-friendly)

---

## 🚀 Next Steps

1. **Choose Platform(s):** Desktop, Mobile, Web, or all?
2. **Select Cloud Services:** AWS, RabbitMQ, Redis, or PocketBase only?
3. **Build:** Follow platform-specific instructions above
4. **Test:** Use testing guide in USER_ACCEPTANCE_TESTING.md
5. **Sign Code:** Get certificates and sign apps
6. **Submit:** Upload to stores or deploy to web
7. **Monitor:** Set up logging and analytics

---

**🎉 Your app can now run ANYWHERE!**

From desktop to mobile, local to cloud, Sanctuary Stream is ready for any deployment scenario.
