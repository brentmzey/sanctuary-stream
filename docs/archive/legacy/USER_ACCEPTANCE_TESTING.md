# 🎯 User Acceptance Testing Guide

## Overview
This guide helps you test Sanctuary Stream before deployment to ensure everything works perfectly.

---

## ✅ Pre-Flight Checklist

### 1. **System Requirements**
```bash
# Check Node.js version (need >= 18)
node --version

# Check npm version (need >= 9)
npm --version

# Check available disk space (need ~500MB)
df -h
```

### 2. **Clean Installation Test**
```bash
# Clone and install
git clone <your-repo-url> sanctuary-stream-test
cd sanctuary-stream-test
npm install

# Should complete without errors
```

### 3. **Build Validation**
```bash
# Run full validation
npm run validate

# Expected output:
# ✅ Prerequisites checked
# ✅ Dependencies installed
# ✅ Type checking passed
# ✅ Linting passed
# ✅ Tests passed
# ✅ Build succeeded
```

---

## 🧪 Functional Testing

### Test 1: Database Setup
```bash
# Set admin password
export PB_SANCTUARY_STREAM_ADMIN_PASSWORD_LOCAL="TestAdmin123!"

# Run setup
npm run setup

# ✅ Should see:
# - PocketBase started
# - Admin account created
# - Migrations applied
# - Test users created
```

### Test 2: Start All Services
```bash
# Start everything
npm run dev

# ✅ Should see:
# - PocketBase running on http://127.0.0.1:8090
# - Bridge connecting to PocketBase
# - Frontend running on http://localhost:5173
```

### Test 3: Login Test
1. Open browser: **http://localhost:5173**
2. Login credentials:
   - Email: `pastor@local.dev`
   - Password: `pastor123456`
3. ✅ Should see dashboard with stream status

### Test 4: OBS Connection (With Real OBS)
**Prerequisites:** OBS Studio installed with WebSocket plugin

1. In OBS, go to **Tools → WebSocket Server Settings**
2. Enable WebSocket server
3. Set password (or use default)
4. Update bridge `.env` if needed:
   ```
   OBS_WEBSOCKET_URL=ws://localhost:4455
   OBS_WEBSOCKET_PASSWORD=your-password
   ```
5. Restart bridge: `npm run dev:bridge`
6. ✅ Bridge should show "Connected to OBS"

### Test 5: Mock OBS Test (Without Real OBS)
```bash
# Terminal 1: Start mock OBS
npm run mock:obs

# Terminal 2: Start services
npm run dev

# ✅ Should see:
# - Mock OBS server running
# - Bridge connected to mock
# - Commands execute successfully
```

### Test 6: Command Testing
In the web interface:

1. **Start Stream** button
   - ✅ Status changes to "Live"
   - ✅ YouTube URL appears
   - ✅ Duration counter starts

2. **Stop Stream** button
   - ✅ Status changes to "Idle"
   - ✅ Counters stop

3. **Start Recording** button
   - ✅ Status changes to "Recording"
   - ✅ Recording indicator shows

4. **Stop Recording** button
   - ✅ Status back to previous state

### Test 7: Real-time Updates
1. Open two browser windows
2. Login to both
3. Click "Start Stream" in one
4. ✅ Both windows should update immediately

### Test 8: Error Handling
1. Stop the bridge: `Ctrl+C` in bridge terminal
2. Try clicking a command button
3. ✅ Should show error message
4. Restart bridge
5. ✅ Commands should work again

---

## 🔒 Security Testing

### Test 9: Authentication
```bash
# Try accessing without login
curl http://127.0.0.1:8090/api/collections/commands/records

# ✅ Should get 403 Forbidden
```

### Test 10: Role-Based Access
1. Login as pastor user
2. ✅ Should see all control buttons
3. Login as tech user (if created)
4. ✅ Should see appropriate permissions

### Test 11: Password Security
```bash
# Check that passwords are hashed
sqlite3 pocketbase/local/pb_data/data.db
> SELECT email, tokenKey FROM users;
# ✅ Should see hashed values, not plaintext
```

---

## 📊 Performance Testing

### Test 12: Load Test
```bash
# Install Apache Bench (if needed)
# brew install httpd  # macOS

# Test API endpoint
ab -n 1000 -c 10 http://127.0.0.1:8090/api/health

# ✅ Should handle 100+ requests/second
```

### Test 13: Memory Usage
```bash
# While running
ps aux | grep -E "(node|pocketbase)"

# ✅ Each process should use < 100MB RAM
```

---

## 🚀 Deployment Readiness

### Test 14: Production Build
```bash
# Build for production
NODE_ENV=production npm run build

# ✅ Should create:
# - sanctuary-app/dist/
# - sanctuary-bridge/dist/
```

### Test 15: Environment Variables
```bash
# Test with staging config
ENV=staging npm run setup

# ✅ Should create staging database
```

### Test 16: Docker Build (Optional)
```bash
# If you have Docker
docker build -t sanctuary-stream .
docker run -p 8090:8090 -p 5173:5173 sanctuary-stream

# ✅ Should start all services
```

---

## ✨ User Experience Testing

### Test 17: UI Responsiveness
1. Resize browser window
2. ✅ Interface should adapt (mobile friendly)
3. Test on phone/tablet
4. ✅ Controls should be touch-friendly

### Test 18: Keyboard Navigation
1. Use Tab key to navigate
2. ✅ Should see focus indicators
3. Press Enter on buttons
4. ✅ Should execute commands

### Test 19: Error Messages
1. Enter wrong password
2. ✅ Should show clear error message
3. Try invalid command
4. ✅ Should show helpful error

### Test 20: Loading States
1. Click command button
2. ✅ Should show loading spinner
3. ✅ Button should be disabled during loading

---

## 📝 UAT Checklist

**Print this and check off as you test:**

- [ ] Clean installation works
- [ ] All dependencies install
- [ ] Type checking passes
- [ ] Linting passes
- [ ] Build succeeds
- [ ] Database setup works
- [ ] All services start
- [ ] Login works
- [ ] OBS connection works (real or mock)
- [ ] Start stream command works
- [ ] Stop stream command works
- [ ] Start recording works
- [ ] Stop recording works
- [ ] Real-time updates work
- [ ] Error handling works
- [ ] Authentication is secure
- [ ] Role-based access works
- [ ] Performance is acceptable
- [ ] Production build works
- [ ] UI is responsive
- [ ] Keyboard navigation works
- [ ] Error messages are clear

---

## 🐛 Common Issues & Solutions

### Issue: "Permission denied" during setup
**Solution:**
```bash
chmod +x scripts/*.sh
npm run setup
```

### Issue: Port already in use
**Solution:**
```bash
# Find process using port 8090
lsof -ti:8090 | xargs kill -9

# Or use different port
PB_PORT=8091 npm run dev:pocketbase
```

### Issue: OBS won't connect
**Solution:**
1. Check OBS WebSocket is enabled
2. Verify password matches
3. Check firewall isn't blocking
4. Try mock OBS first: `npm run mock:obs`

### Issue: Build fails
**Solution:**
```bash
# Clean and rebuild
npm run clean
npm install
npm run build
```

---

## �� Getting Help

If tests fail:

1. **Check logs:**
   ```bash
   # Bridge logs
   tail -f pocketbase/local/logs/*.log
   
   # PocketBase logs
   cat pocketbase/local/pb_data/logs/*.log
   ```

2. **Enable debug mode:**
   ```bash
   DEBUG=* npm run dev:bridge
   ```

3. **Review documentation:**
   - `README.md` - Project overview
   - `QUICKSTART.md` - Quick start guide
   - `BUILD_AND_RUN.md` - Complete build guide
   - `DEPLOYMENT.md` - Deployment instructions

---

## ✅ Sign-off

**Tested by:** _______________  
**Date:** _______________  
**Environment:** [ ] Local [ ] Staging [ ] Production  
**Status:** [ ] Pass [ ] Fail  
**Notes:** _______________

**Ready for deployment:** [ ] Yes [ ] No

---

🎉 **Congratulations!** If all tests pass, Sanctuary Stream is ready for user acceptance and deployment!
