#!/bin/bash
echo "⏹️  Stopping Sanctuary Stream services..."
kill 12510 12516 12573 2>/dev/null || true
pkill -f "pocketbase serve" 2>/dev/null || true
pkill -f "sanctuary-bridge" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
echo "✅ All services stopped"
