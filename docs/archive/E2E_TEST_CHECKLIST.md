# 🚀 SANCTUARY STREAM - COMPLETE E2E TESTING CHECKLIST

## ✅ PRE-COMMIT VALIDATION (5 min)

Run this FIRST before any commits:

```bash
cd /Users/brentzey/sanctuary-stream && ./validate.sh
```

**Expected Result:** All 6 steps pass with ✅

If ANY step fails → **STOP** and fix before proceeding.

---

## ✅ GIT WORKFLOW

```bash
# 1. Check status
git status

# 2. Stage all changes
git add -A

# 3. Commit
git commit -m "fix: resolve CI/CD errors and lint issues
- Fix typecheck errors in StreamControlsExtended
- Implement dripping digital UI effect
- Add circuit-inspired logo design
- Resolve 80+ lint warnings"

# 4. Sync with remote
git fetch origin
git pull origin development

# 5. Push to development
git push origin development
```

---

## ✅ LOCAL SMOKE TESTS (10 min)

### Test 1: Clean Build
```bash
cd /Users/brentzey/sanctuary-stream/sanctuary-app
npm run build
```
✓ Should complete without errors
✓ dist/ folder created
✓ All assets present

### Test 2: Dev Server
```bash
cd /Users/brentzey/sanctuary-stream
npm run dev
```

Wait for all services to start:
- ✓ [0] PocketBase server started
- ✓ [1] 🚀 Sanctuary Bridge started successfully  
- ✓ [2] VITE ready at http://localhost:5173/

### Test 3: Browser Verification
Open: http://localhost:5173/

**Visual Checklist:**
- ☐ Logo visible with animated drips
- ☐ Scanlines effect present (CRT lines)
- ☐ No console errors (F12)
- ☐ All buttons interactive
- ☐ Layout responsive
- ☐ Colors: indigo + emerald accents visible

**Stop dev server:**
Press `Ctrl+C`

---

## ✅ CI/CD VERIFICATION (Auto - 10 min)

After pushing, GitHub Actions runs automatically:

1. Go to: https://github.com/your-org/sanctuary-stream/actions
2. Watch these jobs complete with ✅:
   - typecheck
   - lint
   - test
   - security-audit
   - build-check
   - coverage

**If ANY job fails:**
- Click on failed job
- View error log
- Fix locally: `npm run [job-name]`
- Commit & push again

---

## ✅ INTEGRATION TESTING (Optional - 15 min)

### Integration 1: PocketBase Auth
```bash
npm run dev
# Open http://localhost:5173/
# Create test user in http://127.0.0.1:8090/_/
# Login in app with test credentials
```

**Verify:**
- ☐ Login succeeds
- ☐ Dashboard displays
- ☐ No errors in console

### Integration 2: OBS Connection
**Prerequisites:** OBS Studio installed + running

```bash
# In OBS: Tools → WebSocket Server Settings → Enable
npm run dev
# Watch console for: ✅ Connected to OBS WebSocket
```

**Verify:**
- ☐ Bridge connects successfully
- ☐ No connection errors
- ☐ Heartbeat running

### Integration 3: E2E Workflow
1. Start all services: `npm run dev`
2. Login with test user
3. Click "Go Live" → Watch OBS
4. See stream start in OBS
5. Click "End Stream" → Watch OBS
6. See stream stop in OBS

**Verify:**
- ☐ Commands execute
- ☐ Timing is responsive
- ☐ No state mismatches

---

## ✅ FINAL READINESS CHECKLIST

Before declaring "production ready", verify:

### Code Quality
- ☑ `npm run typecheck` → 0 errors
- ☑ `npm run lint` → 0 errors  
- ☑ `npm test` → All passing
- ☑ `npm audit` → No high-severity issues

### Build Verification
- ☑ `npm run build` succeeds
- ☑ dist/ folder created
- ☑ All assets present
- ☑ Bundle size < 500 KB

### Local Testing
- ☑ `npm run dev` starts all services
- ☑ Browser opens without errors
- ☑ Dripping digital effect renders
- ☑ All animations smooth (60 FPS)
- ☑ Responsive design works
- ☑ Console: 0 errors

### CI/CD Validation
- ☑ All GitHub Actions jobs pass ✅
- ☑ No regressions detected
- ☑ Security audit passes
- ☑ Coverage acceptable

### Integration Testing
- ☑ PocketBase auth works
- ☑ OBS connection works (if available)
- ☑ Recording upload works (if configured)
- ☑ All commands execute correctly

### Git Status
- ☑ All changes committed
- ☑ Branches aligned
- ☑ Remote up-to-date
- ☑ No uncommitted changes

---

## 🛠️ TROUBLESHOOTING

### Issue: Port 8090 already in use
```bash
# Find process using port
lsof -i :8090

# Kill the process
kill -9 <PID>

# Or kill all node processes
killall node pocketbase
```

### Issue: npm test fails
```bash
# Clean install
rm -rf node_modules package-lock.json
npm ci

# Re-run tests
npm test
```

### Issue: Build errors
```bash
# Clear caches
npm cache clean --force
rm -rf sanctuary-app/dist
rm -rf sanctuary-app/.vite

# Rebuild
cd sanctuary-app && npm run build
```

### Issue: Type errors after fixes
```bash
# Verify your fixes worked
npm run typecheck

# If still failing, check specific file
npm run typecheck -- --noEmit sanctuary-app/src/App.tsx
```

---

## 📊 QUICK STATUS

At any time, check everything with:

```bash
# All validation
./validate.sh

# Specific checks
npm run typecheck   # TypeScript
npm run lint        # ESLint
npm test            # Unit tests
npm audit           # Security
npm run build       # Production build (from sanctuary-app/)
```

---

## 🚀 DEPLOYMENT FLOW

1. **Local Development**
   ```bash
   npm run dev
   ```

2. **Pre-Commit Validation**
   ```bash
   ./validate.sh
   ```

3. **Commit & Push**
   ```bash
   git add -A
   git commit -m "your message"
   git push origin development
   ```

4. **Monitor CI/CD**
   - Go to GitHub Actions
   - Wait for all jobs to pass ✅

5. **Merge to Main** (after review)
   ```bash
   git checkout main
   git pull origin main
   git merge development
   git push origin main
   ```

6. **Deploy to Production**
   - Create release tag
   - Deploy to hosting

---

## 📞 SUPPORT

If validation fails or you need help:

1. Run: `npm run [failing-job] 2>&1 | tee /tmp/error.log`
2. Share the output from `/tmp/error.log`
3. Reference this checklist for context

---

**Last Updated:** 2026-03-08
**Status:** ✅ Ready for testing
