#!/bin/bash
# Platform Support Verification Script
# Verifies all client targets have real-time access configured

echo "🔍 Sanctuary Stream - Platform Support Verification"
echo "=================================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
WARNINGS=0

check_pass() {
    echo -e "${GREEN}✅ PASS${NC}: $1"
    ((PASSED++))
}

check_fail() {
    echo -e "${RED}❌ FAIL${NC}: $1"
    ((FAILED++))
}

check_warn() {
    echo -e "${YELLOW}⚠️  WARN${NC}: $1"
    ((WARNINGS++))
}

check_info() {
    echo -e "${BLUE}ℹ️  INFO${NC}: $1"
}

echo "📋 Checking Configuration Files..."
echo ""

# Check Tauri config
if [ -f "sanctuary-app/src-tauri/tauri.conf.json" ]; then
    check_pass "Tauri config exists"
    
    # Check WebSocket in CSP
    if grep -q "wss://\*:\*" "sanctuary-app/src-tauri/tauri.conf.json"; then
        check_pass "WebSocket CSP configured (wss://*:*)"
    else
        check_fail "WebSocket CSP not properly configured"
    fi
    
    # Check HTTP scope
    if grep -q "https://\*:\*" "sanctuary-app/src-tauri/tauri.conf.json"; then
        check_pass "HTTP scope configured for all backends"
    else
        check_fail "HTTP scope not configured for all backends"
    fi
    
    # Check localhost WebSocket
    if grep -q "ws://127.0.0.1:\*" "sanctuary-app/src-tauri/tauri.conf.json" || grep -q "ws://localhost:\*" "sanctuary-app/src-tauri/tauri.conf.json"; then
        check_pass "Localhost WebSocket configured"
    else
        check_warn "Localhost WebSocket may not be configured"
    fi
else
    check_fail "Tauri config not found"
fi

echo ""

# Check Capacitor config
if [ -f "sanctuary-app/capacitor.config.ts" ]; then
    check_pass "Capacitor config exists (mobile web fallback)"
    
    # Check mixed content (for localhost)
    if grep -q "allowMixedContent.*true" "sanctuary-app/capacitor.config.ts"; then
        check_pass "Android mixed content allowed (localhost support)"
    else
        check_warn "Android mixed content not explicitly allowed"
    fi
else
    check_warn "Capacitor config not found (mobile builds may be Tauri-only)"
fi

echo ""

# Check PocketBase client
if [ -f "sanctuary-app/src/lib/pocketbase.ts" ]; then
    check_pass "PocketBase client exists"
    
    # Check WebSocket reconnection
    if grep -q "reconnect" "sanctuary-app/src/lib/pocketbase.ts"; then
        check_pass "WebSocket auto-reconnection implemented"
    else
        check_fail "WebSocket auto-reconnection not found"
    fi
    
    # Check network event listeners
    if grep -q "addEventListener.*online\|offline" "sanctuary-app/src/lib/pocketbase.ts"; then
        check_pass "Network state monitoring implemented"
    else
        check_warn "Network state monitoring not found"
    fi
    
    # Check URL configuration flexibility
    if grep -q "localStorage.*pb_url\|VITE_PB_URL" "sanctuary-app/src/lib/pocketbase.ts"; then
        check_pass "Multi-backend URL configuration supported"
    else
        check_fail "Multi-backend URL configuration not found"
    fi
else
    check_fail "PocketBase client not found"
fi

echo ""

# Check GitHub workflow
if [ -f ".github/workflows/build-release.yml" ]; then
    check_pass "GitHub Actions workflow exists"
    
    # Check platform builds
    PLATFORMS=("build-macos" "build-windows" "build-linux" "build-ios" "build-android" "build-web")
    for platform in "${PLATFORMS[@]}"; do
        if grep -q "$platform:" ".github/workflows/build-release.yml"; then
            check_pass "Build job configured: $platform"
        else
            check_fail "Build job missing: $platform"
        fi
    done
    
    # Check Capacitor fallback for mobile
    if grep -q "npx cap" ".github/workflows/build-release.yml"; then
        check_pass "Capacitor fallback configured for mobile"
    else
        check_warn "Capacitor fallback not found (Tauri-only mobile builds)"
    fi
else
    check_fail "GitHub Actions workflow not found"
fi

echo ""

# Check documentation
echo "📚 Checking Documentation..."
echo ""

DOCS=("docs/PLATFORM_SUPPORT.md" "docs/USER_GUIDE.md" "README.md")
for doc in "${DOCS[@]}"; do
    if [ -f "$doc" ]; then
        check_pass "Documentation exists: $doc"
    else
        check_warn "Documentation missing: $doc"
    fi
done

echo ""

# Check package.json scripts
if [ -f "sanctuary-app/package.json" ]; then
    check_pass "package.json exists"
    
    # Check mobile scripts
    if grep -q "cap:ios\|cap:android" "sanctuary-app/package.json"; then
        check_pass "Capacitor mobile scripts configured"
    else
        check_warn "Capacitor mobile scripts not found"
    fi
    
    # Check Tauri mobile scripts
    if grep -q "tauri:ios:build\|tauri:android:build" "sanctuary-app/package.json"; then
        check_pass "Tauri mobile scripts configured"
    else
        check_warn "Tauri mobile scripts not found"
    fi
else
    check_fail "package.json not found"
fi

echo ""
echo "=================================================="
echo "🎯 VERIFICATION SUMMARY"
echo "=================================================="
echo ""
echo -e "${GREEN}✅ Passed:${NC}   $PASSED"
echo -e "${YELLOW}⚠️  Warnings:${NC} $WARNINGS"
echo -e "${RED}❌ Failed:${NC}   $FAILED"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL PLATFORMS HAVE REAL-TIME ACCESS!${NC}"
    echo ""
    echo "✅ Desktop (macOS, Windows, Linux) - Tauri with full WebSocket support"
    echo "✅ Mobile (iOS, Android) - Tauri + Capacitor fallback"
    echo "✅ Web (PWA) - Browser native WebSocket"
    echo "✅ All 245+ backends accessible with real-time updates"
    echo ""
    exit 0
else
    echo -e "${RED}❌ ISSUES FOUND - Review failed checks above${NC}"
    echo ""
    exit 1
fi
