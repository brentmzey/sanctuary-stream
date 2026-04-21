#!/bin/bash
echo "⏹️  Stopping Sanctuary Stream services..."
kill 76678 76685 76742 2>/dev/null || true
pkill -f "pocketbase serve" 2>/dev/null || true
pkill -f "sanctuary-cli.*bridge" 2>/dev/null || true
pkill -f "vite.*sanctuary" 2>/dev/null || true
echo "✅ All services stopped"
