#!/bin/bash
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

echo "Linting all workspaces..."
npm run lint >/dev/null 2>&1
print_status $? "Linting passed"

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
cd ..

echo "Building bridge..."
cd sanctuary-bridge
npm run build >/dev/null 2>&1
print_status $? "Bridge build successful"
cd ..

# Verify migrations
print_step "📋 Step 7: Verifying Database Migrations"

MIGRATION_DIR="pocketbase/local/pb_migrations"
if [ -d "$MIGRATION_DIR" ]; then
    migration_count=$(ls -1 "$MIGRATION_DIR"/*.js 2>/dev/null | wc -l)
    if [ "$migration_count" -gt 0 ]; then
        print_status 0 "Database migrations found ($migration_count files)"
    else
        print_status 1 "No database migrations found in $MIGRATION_DIR"
    fi
else
    print_status 1 "Migration directory $MIGRATION_DIR not found"
fi

# Verify shared types
print_step "📝 Step 8: Verifying Shared Types"

if [ -f "shared/types.ts" ]; then
    print_status 0 "shared/types.ts exists"
else
    print_status 1 "shared/types.ts exists"
fi

# Final summary
print_step "✨ Validation Complete"

echo ""
echo -e "${GREEN}Ready for deployment! 🚀${NC}"
echo ""
