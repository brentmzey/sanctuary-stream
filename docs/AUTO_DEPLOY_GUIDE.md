# 🚀 Auto-Deploy on Push to Main - Complete Guide

## ✅ NEW: Automatic Deployment Enabled!

**Every push to `main` now triggers full build and deployment!**

---

## 🎯 What Triggers Deployment

### Automatic Triggers:
1. **Push to `main` branch** → Development build (pre-release)
2. **Push tag `v*`** → Production release
3. **Pull Request to `main`** → Test build (no release)

### Manual Trigger:
- GitHub Actions UI → Run workflow manually

---

## 📦 What Gets Built & Deployed

### On EVERY Push to `main`:

#### ✅ Desktop Apps (3 platforms)
- 🍎 **macOS** - Universal Binary → `.dmg` + `.app`
- 🪟 **Windows** - x64 → `.msi` + `.exe`
- 🐧 **Linux** - → `.deb` + `.AppImage`

#### ✅ Mobile Apps (2 platforms)
- 📱 **iOS** - Native + fallback → `.ipa` + **Auto-upload to TestFlight**
- 🤖 **Android** - Native + fallback → `.apk` + `.aab` + **Auto-upload to Google Play Internal Track**

#### ✅ Web App (1 platform)
- 🌐 **Progressive Web App** → **Auto-deploy to Vercel Preview**

#### ✅ Backend Configuration
- 📋 **PocketBase Schema** → Packaged with deployment instructions
- 📚 **Documentation** → Complete deployment guides

#### ✅ GitHub Release
- **Development Build** (pre-release)
- All platform binaries attached
- Auto-generated release notes
- Public downloads available

---

## 🏷️ Production Releases (Tags)

When you push a tag:
```bash
git tag -a v0.1.1 -m "Release v0.1.1"
git push origin v0.1.1
```

### Additional Deployments:
- ✅ **TestFlight** → iOS app uploaded
- ✅ **Google Play** → Android app to Internal Track
- ✅ **Vercel Production** → Web app to production URL
- ✅ **GitHub Release** → Public production release (not pre-release)

---

## 🔄 Workflow Comparison

### Push to `main` (Development)
```bash
git push origin main
```

**Result:**
- ✅ Builds all 6 platforms (~20-25 min)
- ✅ Creates **pre-release** on GitHub
- ✅ Uploads to TestFlight (iOS)
- ✅ Uploads to Google Play Internal (Android)
- ✅ Deploys to Vercel Preview (Web)
- ✅ Packages backend config
- ⚠️  Tagged as "Development Build"

### Push tag (Production)
```bash
git tag -a v0.1.1 -m "Release"
git push origin v0.1.1
```

**Result:**
- ✅ Builds all 6 platforms (~20-25 min)
- ✅ Creates **production release** on GitHub
- ✅ Uploads to TestFlight (iOS)
- ✅ Uploads to Google Play Internal (Android)
- ✅ Deploys to Vercel Production (Web)
- ✅ Packages backend config
- ✅ Tagged as "Production Release"
- ✅ Marked as latest release

---

## 📱 App Store Deployments

### iOS (TestFlight)

**Automatic Upload:**
- Happens on every `main` push and tag push
- Uses `fastlane pilot` command
- Uploads to TestFlight
- Does NOT auto-submit for review

**Manual Steps Required:**
1. Log into App Store Connect
2. Go to TestFlight section
3. Review uploaded build
4. Add to External Testing (optional)
5. Submit for App Store review (when ready)

**Required Secrets:**
- `APPLE_ID` - Your Apple ID email
- `APPLE_PASSWORD` - App-specific password
- `APPLE_TEAM_ID` - Team ID from App Store Connect
- `APPLE_CERTIFICATE` - Base64 encoded certificate
- `APPLE_CERTIFICATE_PASSWORD` - Certificate password
- `APPLE_SIGNING_IDENTITY` - Signing identity name
- `APPLE_PROVISIONING_PROFILE` - Base64 encoded profile
- `FASTLANE_SESSION` - Session cookie (optional)

### Android (Google Play)

**Automatic Upload:**
- Happens on every `main` push and tag push
- Uses `fastlane supply` command
- Uploads to Internal Track
- Does NOT promote to production

**Manual Steps Required:**
1. Log into Google Play Console
2. Go to Internal Testing
3. Review uploaded build
4. Promote to Beta/Production (when ready)
5. Fill in store listing (if not done)

**Required Secrets:**
- `GOOGLE_PLAY_JSON_KEY` - Service account JSON key
- `ANDROID_KEYSTORE_BASE64` - Base64 encoded keystore
- `ANDROID_KEYSTORE_PASSWORD` - Keystore password
- `ANDROID_KEY_ALIAS` - Key alias
- `ANDROID_KEY_PASSWORD` - Key password

---

## 🌐 Web Deployment (Vercel)

### Automatic Deployment:

**On Push to `main`:**
- Deploys to: `https://sanctuary-stream-git-main.vercel.app`
- Type: Preview deployment
- Auto-updates on every push

**On Tag Push:**
- Deploys to: `https://sanctuary-stream.vercel.app`
- Type: Production deployment
- Becomes the main URL

**Required Secrets:**
- `VERCEL_TOKEN` - Vercel API token
- `VERCEL_ORG_ID` - Organization ID
- `VERCEL_PROJECT_ID` - Project ID
- `VITE_POCKETBASE_URL` - Default backend URL

**Note:** Vercel also auto-deploys via GitHub integration, so this step may be redundant but ensures control.

---

## 📋 Backend Deployment

### What Gets Deployed:

**PocketBase Configuration Package:**
- Schema files
- Migration scripts
- Deployment documentation
- Setup instructions

**Deployment Methods:**

1. **PocketHost (Recommended):**
   - Sign up at https://pockethost.io
   - Create instance
   - Import schema from release artifacts
   - Done!

2. **Self-Hosted:**
   - Download PocketBase from https://pocketbase.io
   - Run on your server
   - Import schema
   - Configure reverse proxy

3. **Local Development:**
   - Download PocketBase
   - Run `./pocketbase serve`
   - Import schema
   - Connect clients to `http://127.0.0.1:8090`

**No Central Backend:**
- Each church deploys their own PocketBase
- Clients connect to user-specified backend
- Zero-trust architecture maintained

---

## 🔐 Required GitHub Secrets

Set these in: `Settings > Secrets and variables > Actions`

### Apple (iOS/macOS):
```
APPLE_ID                      # Apple ID email
APPLE_PASSWORD                # App-specific password
APPLE_TEAM_ID                 # Team ID
APPLE_CERTIFICATE             # Base64 encoded
APPLE_CERTIFICATE_PASSWORD    # Certificate password
APPLE_SIGNING_IDENTITY        # Signing identity
APPLE_PROVISIONING_PROFILE    # Base64 encoded
FASTLANE_SESSION             # (Optional) Session cookie
```

### Android:
```
ANDROID_KEYSTORE_BASE64      # Base64 encoded keystore
ANDROID_KEYSTORE_PASSWORD    # Keystore password
ANDROID_KEY_ALIAS            # Key alias
ANDROID_KEY_PASSWORD         # Key password
GOOGLE_PLAY_JSON_KEY         # Service account JSON
```

### Web (Vercel):
```
VERCEL_TOKEN                 # API token
VERCEL_ORG_ID               # Organization ID
VERCEL_PROJECT_ID           # Project ID
VITE_POCKETBASE_URL         # Default backend URL
```

---

## 📊 Build Timeline

### Per Push to `main`:

| Job | Duration | Runs On |
|-----|----------|---------|
| build-macos | ~15 min | macos-latest |
| build-windows | ~10 min | windows-latest |
| build-linux | ~10 min | ubuntu-latest |
| build-ios | ~20 min | macos-latest |
| build-android | ~15 min | ubuntu-latest |
| build-web | ~3 min | ubuntu-latest |
| deploy-backend | ~1 min | ubuntu-latest |
| create-release | ~2 min | ubuntu-latest |

**Total: ~20-25 minutes** (jobs run in parallel)

---

## 🎯 Daily Workflow

### Development (No Release):
```bash
# Make changes
git add .
git commit -m "Add feature"
git push origin main

# Wait ~25 minutes
# → Development build created
# → All platforms available
# → Web deployed to preview
# → Apps uploaded to TestFlight/Play Internal
```

### Production Release:
```bash
# When ready for production
git tag -a v0.1.1 -m "Release v0.1.1"
git push origin v0.1.1

# Wait ~25 minutes
# → Production release created
# → All platforms available
# → Web deployed to production
# → Apps uploaded to TestFlight/Play Internal
# → Manually promote in stores when ready
```

---

## ⚠️ Important Notes

### CI/CD Costs:
- **GitHub Actions:** Free tier = 2,000 minutes/month
- **Each push builds all platforms:** ~25 minutes
- **Max pushes per month:** ~80 builds (within free tier)
- **Recommendation:** Batch commits or use PR builds for testing

### Store Approvals:
- **iOS TestFlight:** Automatic, but App Store requires manual submission
- **Android Internal:** Automatic, but Beta/Production requires promotion
- **Both require:** Store listings, screenshots, descriptions

### Web Deployment:
- **Vercel:** Auto-deploys via GitHub integration
- **Manual deployment:** Optional but gives more control
- **Preview URLs:** Available for every push

### Backend:
- **No central backend deployed**
- **Each user deploys their own**
- **Configuration packaged in releases**

---

## 🚀 Quick Reference

```bash
# Development workflow (frequent)
git push origin main
→ Builds everything, creates pre-release

# Production release (when ready)
git tag -a v0.1.1 -m "Release"
git push origin v0.1.1
→ Builds everything, creates production release

# Monitor builds
open https://github.com/sanctuary-stream/sanctuary-stream/actions

# View releases
open https://github.com/sanctuary-stream/sanctuary-stream/releases

# Test web app
open https://sanctuary-stream-git-main.vercel.app  # Preview
open https://sanctuary-stream.vercel.app            # Production
```

---

## ✨ Summary

**NEW CAPABILITIES:**
- ✅ Auto-build on every push to `main`
- ✅ Auto-upload to TestFlight (iOS)
- ✅ Auto-upload to Google Play Internal (Android)
- ✅ Auto-deploy to Vercel (Web)
- ✅ Auto-package backend config
- ✅ Auto-create GitHub releases
- ✅ All 6 platforms built in parallel
- ✅ ~25-30 minutes from push to availability

**NO MANUAL STEPS** (except store promotions)

🚀 **Just push to `main` and everything deploys automatically!**
