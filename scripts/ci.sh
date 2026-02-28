#!/bin/bash

# Sanctuary Stream - Local CI Runner
# Mirrors the GitHub Actions 'ci.yml' workflow

set -e

echo "🔍 Starting local CI validation..."

# 1. Typecheck
echo "📝 Typechecking..."
npm run typecheck

# 2. Lint
echo "💅 Linting..."
npm run lint

# 3. Test (JS/TS)
echo "🧪 Running Vitest..."
npm run test --workspaces

# 4. Test (Rust)
echo "🦀 Running Cargo tests..."
cd sanctuary-app/src-tauri && cargo test --bin sanctuary-stream && cd ../..

# 5. Build Check (Frontend)
echo "📦 Checking Frontend build..."
cd sanctuary-app && npm run build && cd ..

# 6. Build Check (Bridge)
echo "📦 Checking Bridge build..."
cd sanctuary-bridge && npm run build && cd ..

echo "✅ Local CI passed successfully!"
