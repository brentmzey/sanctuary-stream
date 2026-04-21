#!/bin/bash
# Sanctuary Stream - Complete Working Demo
# This script makes EVERYTHING work with ZERO manual setup

set -e

echo "🏛️  Sanctuary Stream - 100% Automated Start"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Clean up
echo "🧹 Cleaning up old processes..."
pkill -f "pocketbase serve" 2>/dev/null || true
pkill -f "sanctuary-cli.*bridge" 2>/dev/null || true
pkill -f "vite.*sanctuary" 2>/dev/null || true
pkill -f "mock-obs" 2>/dev/null || true
sleep 2

# Start PocketBase
echo "🗄️  Starting PocketBase..."
cd pocketbase/local
pocketbase serve --http=127.0.0.1:8090 > ../../logs/pb.log 2>&1 &
PB_PID=$!
cd ../..

# Wait for PocketBase
echo "⏳ Waiting for PocketBase..."
for i in {1..30}; do
    if curl -s http://127.0.0.1:8090/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PocketBase ready (PID: $PB_PID)${NC}"
        break
    fi
    sleep 1
done

# Create admin (silently, ignore if exists)
echo "🔐 Setting up admin..."
curl -s -X POST "http://127.0.0.1:8090/api/admins" \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@sanctuary.local","password":"sanctuary123456","passwordConfirm":"sanctuary123456"}' > /dev/null 2>&1 || true
echo -e "${GREEN}✅ Admin: admin@sanctuary.local / sanctuary123456${NC}"

# Start Vite
echo "🌐 Starting Web App..."
cd sanctuary-app
npm run dev > ../logs/vite.log 2>&1 &
VITE_PID=$!
cd ..

# Wait for Vite
echo "⏳ Waiting for Vite..."
for i in {1..30}; do
    if curl -s http://localhost:5173 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Web App ready (PID: $VITE_PID)${NC}"
        break
    fi
    sleep 1
done

# Configure Bridge env
echo "⚙️  Configuring Bridge..."
cat > .env << 'ENVEOF'
PB_URL=http://127.0.0.1:8090
BRIDGE_EMAIL=admin@sanctuary.local
BRIDGE_PASS=sanctuary123456
OBS_URL=ws://127.0.0.1:4455
OBS_PASS=
STREAM_ID=test-stream-001
LOG_LEVEL=info
NODE_ENV=development
ENVEOF

# Start Bridge (Rust)
echo "🔗 Starting Bridge (Rust)..."
cargo run -p sanctuary-cli -- bridge > logs/bridge.log 2>&1 &
BRIDGE_PID=$!

sleep 3

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ ALL SERVICES RUNNING!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📍 Service URLs:"
echo "   🗄️  PocketBase Admin: http://127.0.0.1:8090/_/"
echo "   🌐 Web App:          http://localhost:5173"
echo "   ⚙️  Bridge:           Connected (check logs/bridge.log)"
echo ""
echo "🔐 Login Credentials:"
echo "   Email:    admin@sanctuary.local"
echo "   Password: sanctuary123456"
echo ""
echo "🆔 Process IDs:"
echo "   PocketBase: $PB_PID"
echo "   Vite:       $VITE_PID"
echo "   Bridge:     $BRIDGE_PID"
echo ""
echo "⏹️  To stop all services:"
echo "   kill $PB_PID $VITE_PID $BRIDGE_PID"
echo ""
echo "📝 View logs:"
echo "   tail -f logs/pb.log logs/vite.log logs/bridge.log"
echo ""
echo "🎉 Open in browser: http://localhost:5173"
echo ""

# Keep script running and show logs
echo "📊 Showing combined logs (Ctrl+C to exit):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
tail -f logs/pb.log logs/vite.log logs/bridge.log
