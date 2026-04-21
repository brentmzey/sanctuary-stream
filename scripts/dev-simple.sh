#!/bin/bash

# Sanctuary Stream - Simple Development Launcher
# Starts all services with basic terminal multiplexing

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "🚀 Sanctuary Stream - Starting Development Environment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Function to check if a port is in use
check_port() {
    lsof -ti:$1 > /dev/null 2>&1
}

# Function to kill process on port
kill_port() {
    if check_port $1; then
        echo "⚠️  Port $1 is in use. Killing process..."
        lsof -ti:$1 | xargs kill -9 2>/dev/null || true
        sleep 1
    fi
}

# Clean up any existing processes
echo "🧹 Cleaning up existing processes..."
kill_port 8090  # PocketBase
kill_port 5173  # Vite
pkill -f "sanctuary-cli.*bridge" 2>/dev/null || true

echo ""

# Check prerequisites
echo "🔍 Checking prerequisites..."

if ! command -v bun &> /dev/null; then
    echo "❌ Bun is not installed"
    echo "   Install from: https://bun.sh"
    exit 1
fi

if [ ! -f "$PROJECT_ROOT/pocketbase/local/pocketbase" ]; then
    echo "⚠️  PocketBase not found at: pocketbase/local/pocketbase"
    echo "   Download from: https://pocketbase.io/docs/"
    echo "   Extract to: pocketbase/local/"
    exit 1
fi

echo "✅ Prerequisites OK"
echo ""

# Create log directory
mkdir -p "$PROJECT_ROOT/logs"

# Start PocketBase
echo "🗄️  Starting PocketBase..."
cd "$PROJECT_ROOT/pocketbase/local"
./pocketbase serve > "$PROJECT_ROOT/logs/pocketbase.log" 2>&1 &
POCKETBASE_PID=$!
echo "   PID: $POCKETBASE_PID"
echo "   Admin: http://127.0.0.1:8090/_/"
echo "   Logs: logs/pocketbase.log"

# Wait for PocketBase to start
echo "   Waiting for PocketBase to be ready..."
for i in {1..30}; do
    if curl -s http://127.0.0.1:8090/api/health > /dev/null 2>&1; then
        echo "   ✅ PocketBase ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "   ❌ PocketBase failed to start"
        kill $POCKETBASE_PID 2>/dev/null || true
        exit 1
    fi
    sleep 1
done

echo ""

# Start Bridge (Rust)
echo "⚙️  Starting Sanctuary Bridge (Rust)..."
cd "$PROJECT_ROOT"
cargo run -p sanctuary-cli -- bridge > "$PROJECT_ROOT/logs/bridge.log" 2>&1 &
BRIDGE_PID=$!
echo "   PID: $BRIDGE_PID"
echo "   Logs: logs/bridge.log"

# Wait for Bridge to connect
echo "   Waiting for Bridge to connect..."
sleep 3

echo ""

# Start Web App
echo "🌐 Starting Web App..."
cd "$PROJECT_ROOT/sanctuary-app"
bun run dev > "$PROJECT_ROOT/logs/app.log" 2>&1 &
APP_PID=$!
echo "   PID: $APP_PID"
echo "   URL: http://localhost:5173"
echo "   Logs: logs/app.log"

# Wait for Vite to start
echo "   Waiting for Vite to be ready..."
for i in {1..30}; do
    if curl -s http://localhost:5173 > /dev/null 2>&1; then
        echo "   ✅ Web App ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "   ⚠️  Web App may not be ready yet, check logs"
    fi
    sleep 1
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All services started!"
echo ""
echo "📍 Service URLs:"
echo "   🗄️  PocketBase Admin: http://127.0.0.1:8090/_/"
echo "   🌐 Web App:          http://localhost:5173"
echo "   ⚙️  Bridge:           Connected to OBS (ws://127.0.0.1:4455)"
echo ""
echo "🆔 Process IDs:"
echo "   PocketBase: $POCKETBASE_PID"
echo "   Bridge:     $BRIDGE_PID"
echo "   Web App:    $APP_PID"
echo ""
echo "📝 Logs:"
echo "   PocketBase: tail -f logs/pocketbase.log"
echo "   Bridge:     tail -f logs/bridge.log"
echo "   Web App:    tail -f logs/app.log"
echo ""
echo "⏹️  To stop all services:"
echo "   kill $POCKETBASE_PID $BRIDGE_PID $APP_PID"
echo "   OR run: ./scripts/stop-dev.sh"
echo ""

# Create stop script
cat > "$PROJECT_ROOT/scripts/stop-dev.sh" << EOF
#!/bin/bash
echo "⏹️  Stopping Sanctuary Stream services..."
kill $POCKETBASE_PID $BRIDGE_PID $APP_PID 2>/dev/null || true
pkill -f "pocketbase serve" 2>/dev/null || true
pkill -f "sanctuary-cli.*bridge" 2>/dev/null || true
pkill -f "vite.*sanctuary" 2>/dev/null || true
echo "✅ All services stopped"
EOF
chmod +x "$PROJECT_ROOT/scripts/stop-dev.sh"

echo "💡 Tip: Open http://localhost:5173 in your browser"
echo "   Login: admin@local.dev / admin123456"
echo ""

# Save PIDs to file for cleanup
echo "$POCKETBASE_PID $BRIDGE_PID $APP_PID" > "$PROJECT_ROOT/.dev-pids"

# Keep script running and show logs
echo "📊 Showing combined logs (Ctrl+C to stop watching logs):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Trap Ctrl+C to show how to stop services
trap 'echo ""; echo "⚠️  Services still running. To stop: ./scripts/stop-dev.sh"; exit 0' INT

# Tail all logs
tail -f "$PROJECT_ROOT/logs/"*.log
