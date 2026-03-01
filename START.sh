#!/bin/bash
# Sanctuary Stream - Complete Startup with Admin Setup

echo "🏛️  Sanctuary Stream - Starting..."
echo ""

# Kill old processes
pkill -9 pocketbase 2>/dev/null || true
pkill -9 node 2>/dev/null || true  
sleep 2

# Create logs directory
mkdir -p logs

# Start PocketBase
echo "🗄️  Starting PocketBase..."
cd pocketbase
pocketbase serve --http=127.0.0.1:8090 --migrationsDir=local/pb_migrations > ../logs/pocketbase.log 2>&1 &
PB_PID=$!
cd ..

# Wait for PocketBase
echo "⏳ Waiting for PocketBase..."
for i in {1..20}; do
    curl -s http://127.0.0.1:8090/api/health > /dev/null 2>&1 && break
    sleep 1
done

echo "✅ PocketBase running (PID: $PB_PID)"
echo ""

# Check if admin exists, create if not
echo "🔐 Setting up admin user..."
cd pocketbase
pocketbase superuser upsert brentmzey4795@gmail.com sanctuary123456 > /dev/null 2>&1
cd ..
echo "✅ Admin created: brentmzey4795@gmail.com / sanctuary123456"
echo ""

# Start Vite
echo "🌐 Starting Web App..."
cd sanctuary-app
npm run dev > ../logs/vite.log 2>&1 &
VITE_PID=$!
cd ..

# Wait for Vite
echo "⏳ Waiting for Vite..."
for i in {1..20}; do
    curl -s http://localhost:5173 > /dev/null 2>&1 && break
    sleep 1
done

echo "✅ Vite running (PID: $VITE_PID)"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ SANCTUARY STREAM IS LIVE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📍 Open in browser:"
echo "   http://localhost:5173"
echo ""
echo "🔐 Login Credentials:"
echo "   Email:    brentmzey4795@gmail.com"
echo "   Password: sanctuary123456"
echo ""
echo "🗄️  PocketBase Admin:"
echo "   http://127.0.0.1:8090/_/"
echo ""
echo "🆔 Process IDs: $PB_PID $VITE_PID"
echo "⏹️  Stop: kill $PB_PID $VITE_PID"
echo ""
echo "💡 Press Ctrl+C to stop watching logs"
echo ""

# Watch logs
tail -f logs/pocketbase.log logs/vite.log
