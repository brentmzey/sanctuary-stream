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
PB_BIN="pocketbase"
if [ -f "pocketbase/local/pocketbase" ]; then
    PB_BIN="./pocketbase/local/pocketbase"
    echo -e "${GREEN}✅ Local PocketBase binary found${NC}"
elif [ -f "pocketbase/local/pocketbase.exe" ]; then
    PB_BIN="./pocketbase/local/pocketbase.exe"
    echo -e "${GREEN}✅ Local PocketBase binary (Windows) found${NC}"
elif command -v pocketbase &> /dev/null; then
    # Make sure 'pocketbase' in path is not just a directory
    if ! [ -d "$(command -v pocketbase)" ]; then
        PB_BIN="pocketbase"
        echo -e "${GREEN}✅ PocketBase found in PATH: $(command -v pocketbase)${NC}"
    else
        echo -e "${YELLOW}⚠️  'pocketbase' in PATH is a directory. Installing locally...${NC}"
        NEED_INSTALL=true
    fi
else
    NEED_INSTALL=true
fi

if [ "$NEED_INSTALL" = true ]; then
    echo -e "${YELLOW}⚠️  PocketBase not found or invalid. Installing locally...${NC}"
    mkdir -p pocketbase/local
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        if [[ $(uname -m) == 'arm64' ]]; then
            URL="https://github.com/pocketbase/pocketbase/releases/download/v0.25.0/pocketbase_0.25.0_darwin_arm64.zip"
        else
            URL="https://github.com/pocketbase/pocketbase/releases/download/v0.25.0/pocketbase_0.25.0_darwin_amd64.zip"
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        URL="https://github.com/pocketbase/pocketbase/releases/download/v0.25.0/pocketbase_0.25.0_linux_amd64.zip"
    elif [[ "$OSTYPE" == "msys"* || "$OSTYPE" == "win32"* ]]; then
        URL="https://github.com/pocketbase/pocketbase/releases/download/v0.25.0/pocketbase_0.25.0_windows_amd64.zip"
    else
        echo -e "${RED}❌ Unsupported OS: $OSTYPE. Automatic PocketBase download failed.${NC}"
        exit 1
    fi
    
    curl -L $URL -o pocketbase/local/pb.zip
    rm -f pocketbase/local/pocketbase 2>/dev/null || true
    unzip -o pocketbase/local/pb.zip -d pocketbase/local
    rm pocketbase/local/pb.zip
    
    if [ -f "pocketbase/local/pocketbase" ]; then
        chmod +x pocketbase/local/pocketbase
        PB_BIN="./pocketbase/local/pocketbase"
    elif [ -f "pocketbase/local/pocketbase.exe" ]; then
        PB_BIN="./pocketbase/local/pocketbase.exe"
    fi
    echo -e "${GREEN}✅ PocketBase installed locally${NC}"
fi

echo ""
echo "📦 Step 2: Installing Node.js dependencies..."
npm install
echo -e "${GREEN}✅ Dependencies installed${NC}"

echo ""
echo "🗄️ Step 3: Setting up PocketBase..."

mkdir -p pocketbase/local
# Use absolute path to binary for reliability
if [[ "$PB_BIN" == "./"* ]]; then
    ROOT_DIR=$(pwd)
    ABS_PB_BIN="${ROOT_DIR}/${PB_BIN#./}"
else
    ABS_PB_BIN=$(command -v "$PB_BIN")
fi

echo "🔐 Step 4: Creating admin account..."
# Run upsert while PB is NOT running to avoid database locks
"$ABS_PB_BIN" superuser upsert admin@local.dev admin123456 --dir pocketbase/local/pb_data || \
"$ABS_PB_BIN" admin create admin@local.dev admin123456 --dir pocketbase/local/pb_data || true

# Now start PB to initialize schema
cd pocketbase/local
nohup "$ABS_PB_BIN" serve --http=127.0.0.1:8090 --dir pb_data > pb.log 2>&1 &
PB_PID=$!
echo $PB_PID > pb.pid

echo "Waiting for PocketBase to start..."
MAX_RETRIES=30
COUNT=0
while ! curl -s http://127.0.0.1:8090/api/health > /dev/null 2>&1; do
    sleep 1
    COUNT=$((COUNT+1))
    if [ $COUNT -ge $MAX_RETRIES ]; then
        echo -e "${RED}❌ PocketBase failed to start. Check pocketbase/local/pb.log${NC}"
        echo "Last 20 lines of pocketbase/local/pb.log:"
        tail -n 20 pb.log || true
        exit 1
    fi
done
echo -e "${GREEN}✅ PocketBase started and admin verified${NC}"
cd ../..

echo ""
echo "🏗️ Step 5: Initializing Database Schema..."
export PB_SANCTUARY_STREAM_ADMIN_PASSWORD_LOCAL=admin123456
npx tsx pocketbase/schema-init.ts local
echo -e "${GREEN}✅ Schema initialized${NC}"

echo ""
echo "📝 Step 6: Creating environment files..."

# Get admin token for authentication
TOKEN=$(curl -s -X POST http://127.0.0.1:8090/api/collections/_superusers/auth-with-password \
  -H "Content-Type: application/json" \
  -d '{"identity":"admin@local.dev", "password":"admin123456"}' | grep -o '"token":"[^"]*"' | head -1 | cut -d'"' -f4)

# Get the first stream ID using the admin token
STREAM_ID=$(curl -s http://127.0.0.1:8090/api/collections/streams/records \
  -H "Authorization: Bearer $TOKEN" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

# Use 'defaultstream01' as fallback to match schema-init.ts
STREAM_ID=${STREAM_ID:-"defaultstream01"}

# Kill PocketBase after setup so it doesn't block other processes (like Playwright's dev server)
if [ -f "pocketbase/local/pb.pid" ]; then
    PID=$(cat pocketbase/local/pb.pid)
    kill $PID 2>/dev/null || true
    rm pocketbase/local/pb.pid
    echo "PocketBase stopped after setup."
fi

cat > sanctuary-app/.env << EOF
VITE_PB_URL=http://127.0.0.1:8090
VITE_STREAM_ID=${STREAM_ID}
EOF

# Also create a root .env for the Rust CLI/Bridge if needed
cat > .env << EOF
PB_URL=http://127.0.0.1:8090
STREAM_ID=${STREAM_ID}
BRIDGE_EMAIL=bridge@local.dev
BRIDGE_PASS=bridge123456
OBS_URL=localhost
OBS_PORT=4455
EOF

echo -e "${GREEN}✅ Environment files configured${NC}"

echo ""
echo "🔍 Step 7: Verifying installation..."
if [ "$CI" != "true" ]; then
    ./scripts/validate.sh
else
    echo "⏭️  Skipping validation script in CI environment..."
fi

echo ""
echo "✅ Setup Complete!"
echo "======================================"
echo "🚀 Next Steps:"
echo -e "   ${GREEN}just dev${NC}"
echo "======================================"
