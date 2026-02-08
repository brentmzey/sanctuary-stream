#!/bin/bash
# Sanctuary Stream - Complete Setup Script
# Run this to go from zero to working local development

set -e  # Exit on error

echo "🏛️ Sanctuary Stream - Automated Setup"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo "📋 Step 1: Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Install from https://nodejs.org${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js 18+ required. Current: $(node -v)${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js $(node -v)${NC}"

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm not found${NC}"
    exit 1
fi
echo -e "${GREEN}✅ npm $(npm -v)${NC}"

# Check for PocketBase
if ! command -v pocketbase &> /dev/null; then
    echo -e "${YELLOW}⚠️  PocketBase not found. Installing...${NC}"
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        if command -v brew &> /dev/null; then
            brew install pocketbase
        else
            echo -e "${RED}❌ Homebrew not found. Install from https://brew.sh${NC}"
            echo "   Then run: brew install pocketbase"
            exit 1
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo "   Download from: https://pocketbase.io/docs/"
        echo "   Or run: wget https://github.com/pocketbase/pocketbase/releases/download/v0.22.0/pocketbase_0.22.0_linux_amd64.zip"
        exit 1
    else
        echo "   Download from: https://pocketbase.io/docs/"
        exit 1
    fi
fi
echo -e "${GREEN}✅ PocketBase installed${NC}"

echo ""
echo "📦 Step 2: Installing Node.js dependencies..."
npm install
echo -e "${GREEN}✅ Dependencies installed${NC}"

echo ""
echo "🗄️ Step 3: Setting up PocketBase..."

# Stop any existing PocketBase instance
echo "Checking for existing PocketBase instances..."
if lsof -Pi :8090 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "Stopping existing PocketBase..."
    lsof -ti:8090 | xargs kill -9 2>/dev/null || true
    sleep 2
    echo -e "${GREEN}✅ Stopped existing PocketBase${NC}"
fi

# Clean up old PID file
rm -f pocketbase/local/pb.pid

# Create PocketBase directory
mkdir -p pocketbase/local
cd pocketbase/local

# Start PocketBase in background
echo "Starting PocketBase server..."
nohup pocketbase serve --http=127.0.0.1:8090 > pb.log 2>&1 &
PB_PID=$!
echo $PB_PID > pb.pid

# Wait for PocketBase to be ready
echo "Waiting for PocketBase to start..."
for i in {1..30}; do
    if curl -s http://127.0.0.1:8090/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PocketBase started (PID: $PB_PID)${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ PocketBase failed to start${NC}"
        cat pb.log
        exit 1
    fi
    sleep 1
done

cd ../..

echo ""
echo "🔐 Step 4: Creating admin account..."
echo ""

# Create admin account automatically via CLI
# We need to run it from where the pocketbase data will be
cd pocketbase/local
if pocketbase admin create admin@local.dev admin123456 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Admin account created automatically${NC}"
else
    # Maybe it already exists?
    echo -e "${YELLOW}⚠️  Could not create admin via CLI (it may already exist)${NC}"
fi
cd ../..

echo ""
echo "🏗️ Step 5: Creating test users..."
echo ""
echo -e "${YELLOW}Note: Database schema (collections, fields, indexes) was created automatically by migrations!${NC}"
echo ""

# Set admin password
export PB_SANCTUARY_STREAM_ADMIN_PASSWORD_LOCAL=admin123456

# Run schema initialization (creates test users)
npm run schema:init:local

echo -e "${GREEN}✅ Schema initialized${NC}"

echo ""
echo "📝 Step 6: Creating environment files..."

# Get STREAM_ID via API
echo "Fetching Stream ID from PocketBase..."
STREAM_ID=$(curl -s http://127.0.0.1:8090/api/collections/streams/records | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$STREAM_ID" ]; then
    echo -e "${YELLOW}⚠️  Could not auto-detect STREAM_ID${NC}"
    echo "You'll need to get it from PocketBase UI and update the .env files"
    STREAM_ID="your_stream_id_here"
else
    echo -e "${GREEN}✅ Found Stream ID: $STREAM_ID${NC}"
fi

# Create sanctuary-bridge/.env
cat > sanctuary-bridge/.env << EOF
PB_URL=http://127.0.0.1:8090
BRIDGE_EMAIL=bridge@local.dev
BRIDGE_PASS=bridge123
OBS_URL=ws://127.0.0.1:4455
OBS_PASS=
STREAM_ID=${STREAM_ID}
LOG_LEVEL=info
NODE_ENV=development
EOF

echo -e "${GREEN}✅ Created sanctuary-bridge/.env${NC}"

# Create sanctuary-app/.env
cat > sanctuary-app/.env << EOF
VITE_PB_URL=http://127.0.0.1:8090
VITE_STREAM_ID=${STREAM_ID}
EOF

echo -e "${GREEN}✅ Created sanctuary-app/.env${NC}"

# Create logs directory for bridge
mkdir -p sanctuary-bridge/logs

echo ""
echo "🔍 Step 7: Verifying installation..."
./scripts/verify-complete.sh

echo ""
echo "✅ Setup Complete!"
echo ""
echo "======================================"
echo "🚀 Next Steps:"
echo "======================================"
echo ""
echo "1. Start Mock OBS (in new terminal):"
echo "   ${GREEN}npm run mock:obs${NC}"
echo ""
echo "2. Build & start Bridge service:"
echo "   ${GREEN}cd sanctuary-bridge && npm run dev${NC}"
echo ""
echo "3. Start Frontend app:"
echo "   ${GREEN}cd sanctuary-app && npm run dev${NC}"
echo ""
echo "4. Login credentials:"
echo "   Pastor: ${GREEN}pastor@local.dev / pastor123456${NC}"
echo "   Admin:  ${GREEN}admin@local.dev / admin123456${NC}"
echo "   Bridge: ${GREEN}bridge@local.dev / bridge123456${NC}"
echo ""
echo "======================================"
echo "📚 Documentation:"
echo "======================================"
echo ""
echo "• QUICKSTART.md - Detailed walkthrough"
echo "• BUILD_AND_RUN.md - Schema & testing guide"
echo "• ROADMAP.md - Implementation phases"
echo "• docs/DEVELOPMENT.md - Development workflow"
echo ""
echo "======================================"
echo "🛠️ Current Status:"
echo "======================================"
echo ""
echo "✅ PocketBase running at http://127.0.0.1:8090"
echo "✅ Schema initialized (users, commands, streams)"
echo "✅ Test users created"
echo "✅ Environment files configured"
echo "✅ Bridge service ready (TypeScript)"
echo "✅ Frontend app ready (React + Vite)"
echo ""
echo "======================================"
echo "🔧 To stop PocketBase later:"
echo "======================================"
echo ""
echo "  lsof -ti:8090 | xargs kill -9"
echo "  Or: kill \$(cat pocketbase/local/pb.pid)"
echo ""
