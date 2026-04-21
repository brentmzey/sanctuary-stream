#!/bin/bash

# Sanctuary Stream - tmux Development Environment
# Starts all services in a single tmux session

set -e

SESSION_NAME="sanctuary-stream"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🚀 Starting Sanctuary Stream Development Environment..."

# Check if tmux is installed
if ! command -v tmux &> /dev/null; then
    echo "❌ tmux is not installed. Install it first:"
    echo "   macOS: brew install tmux"
    echo "   Ubuntu/Debian: sudo apt install tmux"
    echo "   Windows: Use WSL and install tmux"
    exit 1
fi

# Kill existing session if it exists
tmux kill-session -t $SESSION_NAME 2>/dev/null || true

echo "📦 Creating tmux session: $SESSION_NAME"

# Create new session (detached) with PocketBase
tmux new-session -d -s $SESSION_NAME -n "pocketbase" -c "$PROJECT_ROOT"

# Window 0: PocketBase
echo "🗄️  Setting up PocketBase..."
tmux send-keys -t $SESSION_NAME:0 "cd pocketbase/local" C-m
tmux send-keys -t $SESSION_NAME:0 "echo '🗄️  Starting PocketBase on http://127.0.0.1:8090'" C-m
tmux send-keys -t $SESSION_NAME:0 "echo '📝 Create admin account at: http://127.0.0.1:8090/_/'" C-m
tmux send-keys -t $SESSION_NAME:0 "echo ''" C-m
tmux send-keys -t $SESSION_NAME:0 "./pocketbase serve" C-m

# Window 1: Bridge (Rust)
echo "⚙️  Setting up Bridge (Rust)..."
tmux new-window -t $SESSION_NAME:1 -n "bridge" -c "$PROJECT_ROOT"
tmux send-keys -t $SESSION_NAME:1 "echo '⚙️  Waiting for PocketBase to start...'" C-m
tmux send-keys -t $SESSION_NAME:1 "sleep 3" C-m
tmux send-keys -t $SESSION_NAME:1 "echo '🔗 Starting Rust Bridge (connects to OBS)'" C-m
tmux send-keys -t $SESSION_NAME:1 "echo ''" C-m
tmux send-keys -t $SESSION_NAME:1 "cargo run -p sanctuary-cli -- bridge" C-m

# Window 2: Web App
echo "🌐 Setting up Web App..."
tmux new-window -t $SESSION_NAME:2 -n "app" -c "$PROJECT_ROOT"
tmux send-keys -t $SESSION_NAME:2 "cd sanctuary-app" C-m
tmux send-keys -t $SESSION_NAME:2 "echo '🌐 Starting Web App on http://localhost:5173'" C-m
tmux send-keys -t $SESSION_NAME:2 "echo '📱 Open in browser to access control panel'" C-m
tmux send-keys -t $SESSION_NAME:2 "echo ''" C-m
tmux send-keys -t $SESSION_NAME:2 "npm run dev" C-m

# Window 3: Logs/Utils
echo "📊 Setting up Logs window..."
tmux new-window -t $SESSION_NAME:3 -n "logs" -c "$PROJECT_ROOT"
tmux send-keys -t $SESSION_NAME:3 "echo '📊 Logs & Utilities Window'" C-m
tmux send-keys -t $SESSION_NAME:3 "echo ''" C-m
tmux send-keys -t $SESSION_NAME:3 "echo '📚 Useful commands:'" C-m
tmux send-keys -t $SESSION_NAME:3 "echo '  - npm run build          # Build everything'" C-m
tmux send-keys -t $SESSION_NAME:3 "echo '  - npm test               # Run tests'" C-m
tmux send-keys -t $SESSION_NAME:3 "echo '  - tail -f dev-full.log   # Watch all logs'" C-m
tmux send-keys -t $SESSION_NAME:3 "echo ''" C-m
tmux send-keys -t $SESSION_NAME:3 "echo '🔍 Monitor commands:'" C-m
tmux send-keys -t $SESSION_NAME:3 "echo '  - curl http://127.0.0.1:8090/api/health'" C-m
tmux send-keys -t $SESSION_NAME:3 "echo '  - curl http://127.0.0.1:5173'" C-m
tmux send-keys -t $SESSION_NAME:3 "echo ''" C-m

# Select the first window
tmux select-window -t $SESSION_NAME:0

# Create status bar customization
tmux set-option -t $SESSION_NAME status-style "bg=colour235,fg=colour136"
tmux set-option -t $SESSION_NAME status-left "#[fg=colour166]⛪ Sanctuary Stream #[fg=colour244]| "
tmux set-option -t $SESSION_NAME status-left-length 30
tmux set-option -t $SESSION_NAME status-right "#[fg=colour136]%H:%M:%S "

echo ""
echo "✅ Sanctuary Stream Development Environment Ready!"
echo ""
echo "📌 Services:"
echo "   🗄️  PocketBase:  http://127.0.0.1:8090"
echo "   🌐 Web App:     http://localhost:5173"
echo "   ⚙️  Bridge:      Connected to OBS"
echo ""
echo "🎮 tmux Controls:"
echo "   Attach:         tmux attach -t $SESSION_NAME"
echo "   Switch window:  Ctrl+B then [0-3]"
echo "   Detach:         Ctrl+B then D"
echo "   Kill session:   tmux kill-session -t $SESSION_NAME"
echo ""
echo "📚 Window Layout:"
echo "   0: PocketBase   (database)"
echo "   1: Bridge       (Rust OBS connection)"
echo "   2: Web App      (control panel)"
echo "   3: Logs/Utils   (commands)"
echo ""

# Attach to the session
echo "🔗 Attaching to tmux session..."
sleep 1
tmux attach-session -t $SESSION_NAME
