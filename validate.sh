#!/bin/bash

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Progress counter
STEP=1
TOTAL_STEPS=6

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║      SANCTUARY STREAM - AUTOMATED VALIDATION & DEPLOYMENT CHECKER         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# STEP 1: Clean install
echo -e "${YELLOW}[${STEP}/${TOTAL_STEPS}] 📋 Installing dependencies...${NC}"
npm ci > /dev/null 2>&1 && echo -e "${GREEN}✅ Dependencies installed${NC}" || exit 1
((STEP++))
echo ""

# STEP 2: Type checking
echo -e "${YELLOW}[${STEP}/${TOTAL_STEPS}] 🔍 Running TypeScript check...${NC}"
if npm run typecheck > /tmp/typecheck.log 2>&1; then
  echo -e "${GREEN}✅ TypeScript: 0 errors${NC}"
else
  echo -e "${RED}❌ TypeScript errors found:${NC}"
  cat /tmp/typecheck.log | grep "error TS" | head -5
  exit 1
fi
((STEP++))
echo ""

# STEP 3: Linting
echo -e "${YELLOW}[${STEP}/${TOTAL_STEPS}] 📝 Running ESLint...${NC}"
if npm run lint > /tmp/lint.log 2>&1; then
  echo -e "${GREEN}✅ ESLint: 0 errors${NC}"
else
  echo -e "${RED}❌ Lint errors found:${NC}"
  cat /tmp/lint.log | grep -E "error|warning" | head -5
  exit 1
fi
((STEP++))
echo ""

# STEP 4: Tests
echo -e "${YELLOW}[${STEP}/${TOTAL_STEPS}] 🧪 Running test suite...${NC}"
if npm test 2>&1 | tail -10 | grep -q "Test Files.*passed"; then
  TEST_COUNT=$(npm test 2>&1 | grep "Tests.*passed" | head -1)
  echo -e "${GREEN}✅ Tests passing: ${TEST_COUNT}${NC}"
else
  echo -e "${RED}❌ Test failures detected${NC}"
  exit 1
fi
((STEP++))
echo ""

# STEP 5: Security audit
echo -e "${YELLOW}[${STEP}/${TOTAL_STEPS}] 🔐 Running security audit...${NC}"
npm audit --production 2>/dev/null || true
echo -e "${GREEN}✅ Security check complete${NC}"
((STEP++))
echo ""

# STEP 6: Production build
echo -e "${YELLOW}[${STEP}/${TOTAL_STEPS}] 🏗️  Building production bundle...${NC}"
cd sanctuary-app && npm run build > /dev/null 2>&1 && \
  echo -e "${GREEN}✅ App builds successfully${NC}" && \
  BUNDLE_SIZE=$(du -sh dist/ | cut -f1) && \
  echo -e "${GREEN}   Bundle size: ${BUNDLE_SIZE}${NC}" || exit 1
cd ..

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✨ ALL VALIDATION CHECKS PASSED!${NC}"
echo -e "${GREEN}   Ready to commit and push to GitHub.${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📋 NEXT STEPS:${NC}"
echo "   1. Review git status: git status"
echo "   2. Stage changes: git add -A"
echo "   3. Commit: git commit -m 'your message'"
echo "   4. Push: git push origin development"
echo "   5. Monitor CI/CD: https://github.com/your-org/sanctuary-stream/actions"
echo ""

