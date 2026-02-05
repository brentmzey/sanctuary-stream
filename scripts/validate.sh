#!/bin/bash
#
# Sanctuary Stream - Complete Validation Script
# Tests build, lint, typecheck across all components
#

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║        Sanctuary Stream - Complete Validation                 ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
        exit 1
    fi
}

print_step() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Check prerequisites
print_step "🔍 Step 1: Checking Prerequisites"

command -v node >/dev/null 2>&1
print_status $? "Node.js installed"

command -v npm >/dev/null 2>&1
print_status $? "npm installed"

node_version=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$node_version" -ge 18 ]; then
    print_status 0 "Node.js version >= 18"
else
    print_status 1 "Node.js version >= 18 (found v$node_version)"
fi

# Check if dependencies are installed
print_step "📦 Step 2: Checking Dependencies"

if [ -d "node_modules" ]; then
    print_status 0 "Root dependencies installed"
else
    echo -e "${YELLOW}⚠️  Installing root dependencies...${NC}"
    npm install
    print_status $? "Root dependencies installed"
fi

if [ -d "sanctuary-app/node_modules" ]; then
    print_status 0 "Frontend dependencies installed"
else
    echo -e "${YELLOW}⚠️  Installing frontend dependencies...${NC}"
    cd sanctuary-app && npm install && cd ..
    print_status $? "Frontend dependencies installed"
fi

if [ -d "sanctuary-bridge/node_modules" ]; then
    print_status 0 "Bridge dependencies installed"
else
    echo -e "${YELLOW}⚠️  Installing bridge dependencies...${NC}"
    cd sanctuary-bridge && npm install && cd ..
    print_status $? "Bridge dependencies installed"
fi

# Type checking
print_step "🔍 Step 3: Type Checking"

echo "Checking frontend types..."
cd sanctuary-app
npm run typecheck >/dev/null 2>&1
print_status $? "Frontend type checking passed"
cd ..

echo "Checking bridge types..."
cd sanctuary-bridge
npm run typecheck >/dev/null 2>&1
print_status $? "Bridge type checking passed"
cd ..

# Linting
print_step "🧹 Step 4: Linting"

echo "Linting frontend..."
cd sanctuary-app
npm run lint >/dev/null 2>&1
print_status $? "Frontend linting passed"
cd ..

echo "Linting bridge..."
cd sanctuary-bridge
npm run lint >/dev/null 2>&1
print_status $? "Bridge linting passed"
cd ..

# Testing
print_step "🧪 Step 5: Running Tests"

echo "Testing frontend..."
cd sanctuary-app
npm test >/dev/null 2>&1
print_status $? "Frontend tests passed"
cd ..

echo "Testing bridge..."
cd sanctuary-bridge
npm test >/dev/null 2>&1
print_status $? "Bridge tests passed"
cd ..

# Building
print_step "🔨 Step 6: Building Production Artifacts"

echo "Building frontend..."
cd sanctuary-app
npm run build >/dev/null 2>&1
print_status $? "Frontend build successful"

if [ -d "dist" ] && [ -f "dist/index.html" ]; then
    print_status 0 "Frontend dist/ contains index.html"
else
    print_status 1 "Frontend dist/ contains index.html"
fi
cd ..

echo "Building bridge..."
cd sanctuary-bridge
npm run build >/dev/null 2>&1
print_status $? "Bridge build successful"

if [ -d "dist" ] && [ -f "dist/index.js" ]; then
    print_status 0 "Bridge dist/ contains index.js"
else
    print_status 1 "Bridge dist/ contains index.js"
fi
cd ..

# Verify migrations
print_step "📋 Step 7: Verifying Database Migrations"

if [ -f "pocketbase/migrations/001_initial_schema.js" ]; then
    print_status 0 "Migration 001 exists"
else
    print_status 1 "Migration 001 exists"
fi

if [ -f "pocketbase/migrations/002_create_commands.js" ]; then
    print_status 0 "Migration 002 exists"
else
    print_status 1 "Migration 002 exists"
fi

if [ -f "pocketbase/migrations/003_create_streams.js" ]; then
    print_status 0 "Migration 003 exists"
else
    print_status 1 "Migration 003 exists"
fi

# Verify shared types
print_step "📝 Step 8: Verifying Shared Types"

if [ -f "shared/types.ts" ]; then
    print_status 0 "shared/types.ts exists"
else
    print_status 1 "shared/types.ts exists"
fi

# Check for TypeScript usage (no .js in src)
js_count=$(find sanctuary-app/src sanctuary-bridge/src -name "*.js" 2>/dev/null | wc -l)
if [ "$js_count" -eq 0 ]; then
    print_status 0 "No JavaScript files in src/ (TypeScript only)"
else
    print_status 1 "No JavaScript files in src/ (found $js_count .js files)"
fi

# Final summary
print_step "✨ Validation Complete"

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                                ║${NC}"
echo -e "${GREEN}║                 🎉 ALL CHECKS PASSED! 🎉                      ║${NC}"
echo -e "${GREEN}║                                                                ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "✅ Prerequisites verified"
echo "✅ Dependencies installed"
echo "✅ Type checking passed"
echo "✅ Linting passed"
echo "✅ Tests passed"
echo "✅ Production builds successful"
echo "✅ Database migrations verified"
echo "✅ Shared types verified"
echo ""
echo -e "${GREEN}Ready for deployment! 🚀${NC}"
echo ""
