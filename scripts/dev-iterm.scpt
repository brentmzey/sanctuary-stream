#!/usr/bin/osascript

-- Sanctuary Stream - iTerm2 Development Environment
-- Opens all services in separate iTerm2 tabs

tell application "iTerm"
    -- Create new window
    set newWindow to (create window with default profile)
    
    tell current session of newWindow
        -- Tab 1: PocketBase
        write text "cd ~/sanctuary-stream/pocketbase/local"
        write text "clear"
        write text "echo '🗄️  PocketBase Database'"
        write text "echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'"
        write text "echo 'Admin UI: http://127.0.0.1:8090/_/'"
        write text "echo 'API:      http://127.0.0.1:8090/api/'"
        write text "echo ''"
        write text "echo 'Starting PocketBase...'"
        write text "./pocketbase serve"
        
        set name to "🗄️  PocketBase"
    end tell
    
    -- Tab 2: Bridge
    tell newWindow
        set bridgeTab to (create tab with default profile)
        tell current session of bridgeTab
            write text "cd ~/sanctuary-stream/sanctuary-bridge"
            write text "clear"
            write text "echo '⚙️  Sanctuary Bridge'"
            write text "echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'"
            write text "echo 'Connects to: OBS WebSocket (ws://127.0.0.1:4455)'"
            write text "echo 'Connects to: PocketBase (http://127.0.0.1:8090)'"
            write text "echo ''"
            write text "echo 'Waiting for PocketBase to start...'"
            write text "sleep 3"
            write text "echo 'Starting Bridge...'"
            write text "npm start"
            
            set name to "⚙️  Bridge"
        end tell
    end tell
    
    -- Tab 3: Web App
    tell newWindow
        set appTab to (create tab with default profile)
        tell current session of appTab
            write text "cd ~/sanctuary-stream/sanctuary-app"
            write text "clear"
            write text "echo '🌐 Sanctuary Stream Web App'"
            write text "echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'"
            write text "echo 'URL:        http://localhost:5173'"
            write text "echo 'Login:      admin@local.dev / admin123456'"
            write text "echo ''"
            write text "echo 'Starting Vite dev server...'"
            write text "npm run dev"
            
            set name to "🌐 Web App"
        end tell
    end tell
    
    -- Tab 4: Logs & Utils
    tell newWindow
        set logsTab to (create tab with default profile)
        tell current session of logsTab
            write text "cd ~/sanctuary-stream"
            write text "clear"
            write text "echo '📊 Logs & Utilities'"
            write text "echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'"
            write text "echo ''"
            write text "echo '📚 Useful Commands:'"
            write text "echo '  npm run build              # Build everything'"
            write text "echo '  npm test                   # Run tests'"
            write text "echo '  npm run build:app          # Build web app only'"
            write text "echo '  npm run build:bridge       # Build bridge only'"
            write text "echo ''"
            write text "echo '🔍 Health Checks:'"
            write text "echo '  curl http://127.0.0.1:8090/api/health    # PocketBase'"
            write text "echo '  curl http://localhost:5173               # Web App'"
            write text "echo ''"
            write text "echo '📝 Logs:'"
            write text "echo '  tail -f dev-full.log                     # All logs'"
            write text "echo '  tail -f sanctuary-bridge/logs/*.log      # Bridge logs'"
            write text "echo ''"
            write text "echo '⏹️  To stop all services:'"
            write text "echo '  pkill -f pocketbase'"
            write text "echo '  pkill -f \"node.*sanctuary-bridge\"'"
            write text "echo '  pkill -f \"vite\"'"
            write text "echo ''"
            
            set name to "📊 Logs"
        end tell
    end tell
    
    -- Select first tab (PocketBase)
    tell newWindow
        select first tab
    end tell
    
end tell

-- Show notification
display notification "All services starting..." with title "Sanctuary Stream" subtitle "Development Environment"
