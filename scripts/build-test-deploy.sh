#!/bin/bash
# Complete Build, Test, and Deploy Pipeline
# Usage: ./scripts/build-test-deploy.sh [options]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
SKIP_VALIDATION=false
SKIP_BUILD=false
SKIP_DEPLOY=false
DRY_RUN=false
VERSION=""

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-validation)
            SKIP_VALIDATION=true
            shift
            ;;
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        --skip-deploy)
            SKIP_DEPLOY=true
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --version)
            VERSION="$2"
            shift 2
            ;;
        --help)
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --skip-validation Skip running full validation (lint/typecheck/test)"
            echo "  --skip-build      Skip local builds"
            echo "  --skip-deploy     Skip deployment (commit/push/tag)"
            echo "  --dry-run         Show what would be done without doing it"
            echo "  --version VER     Specify version (e.g., v0.1.1)"
            echo "  --help            Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Helper functions
log_step() {
    echo -e "${BLUE}▶${NC} $1"
}

log_success() {
    echo -e "${GREEN}✅${NC} $1"
}

log_error() {
    echo -e "${RED}❌${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠️${NC}  $1"
}

log_info() {
    echo -e "${CYAN}ℹ️${NC}  $1"
}

run_cmd() {
    if [ "$DRY_RUN" = true ]; then
        echo -e "${CYAN}[DRY RUN]${NC} Would run: $*"
        return 0
    else
        "$@"
    fi
}

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║          Sanctuary Stream - Build, Test & Deploy              ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check prerequisites
log_step "Checking prerequisites..."

# Check git
if ! command -v git &> /dev/null; then
    log_error "Git is not installed"
    exit 1
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    log_error "Node.js is not installed"
    exit 1
fi
NODE_VERSION=$(node --version)
log_info "Node.js version: $NODE_VERSION"

# Check npm
if ! command -v npm &> /dev/null; then
    log_error "npm is not installed"
    exit 1
fi
NPM_VERSION=$(npm --version)
log_info "npm version: $NPM_VERSION"

# Check if in git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    log_error "Not in a git repository"
    exit 1
fi

log_success "Prerequisites check passed"
echo ""

# Get current status
log_step "Checking repository status..."
CURRENT_BRANCH=$(git branch --show-current)
CURRENT_COMMIT=$(git rev-parse --short HEAD)
UNCOMMITTED_CHANGES=$(git status --porcelain | wc -l | tr -d ' ')

log_info "Branch: $CURRENT_BRANCH"
log_info "Commit: $CURRENT_COMMIT"
log_info "Uncommitted changes: $UNCOMMITTED_CHANGES files"

if [ "$UNCOMMITTED_CHANGES" -ne 0 ] && [ "$SKIP_DEPLOY" = false ]; then
    log_warning "You have uncommitted changes. They will be committed before deployment."
fi
echo ""

# Automated Setup
log_step "Running automated setup..."
run_cmd npm run setup
log_success "Setup and initial validation passed"
echo ""

# Run Full Validation
if [ "$SKIP_VALIDATION" = false ]; then
    log_step "Running complete validation suite..."
    run_cmd ./validate.sh
    log_success "All validation checks passed"
    echo ""
fi

# Build local (optional)
if [ "$SKIP_BUILD" = false ]; then
    log_step "Building all applications locally..."
    run_cmd npm run build
    log_success "Builds completed successfully"
    
    # Note about Tauri builds
    log_info "Note: Full platform binaries (DMG, MSI, etc.) are built on GitHub Actions"
    echo ""
fi

# Commit changes
if [ "$SKIP_DEPLOY" = false ] && [ "$UNCOMMITTED_CHANGES" -ne 0 ]; then
    log_step "Committing changes..."
    
    git status --short
    echo ""
    
    if [ "$DRY_RUN" = false ]; then
        read -p "Enter commit message (empty for default): " COMMIT_MSG
        if [ -z "$COMMIT_MSG" ]; then
            COMMIT_MSG="Release: build and validation update"
        fi
    else
        COMMIT_MSG="[DRY RUN] Release: build and validation update"
    fi
    
    run_cmd git add -A
    run_cmd git commit -m "$COMMIT_MSG"
    log_success "Changes committed"
    echo ""
fi

# Push to GitHub
if [ "$SKIP_DEPLOY" = false ]; then
    log_step "Pushing to GitHub..."
    
    if [ "$DRY_RUN" = false ]; then
        read -p "Push to '$CURRENT_BRANCH'? (y/N): " CONFIRM_PUSH
        if [ "$CONFIRM_PUSH" = "y" ] || [ "$CONFIRM_PUSH" = "Y" ]; then
            run_cmd git push origin "$CURRENT_BRANCH"
            log_success "Pushed to GitHub"
        else
            log_warning "Push skipped by user"
        fi
    else
        log_info "[DRY RUN] Would push to: origin/$CURRENT_BRANCH"
    fi
    echo ""
fi

# Create and push release tag
if [ "$SKIP_DEPLOY" = false ] && [ -n "$VERSION" ]; then
    log_step "Creating release tag: $VERSION"
    
    # Check if tag already exists
    if git rev-parse "$VERSION" >/dev/null 2>&1; then
        log_error "Tag $VERSION already exists"
        exit 1
    fi
    
    if [ "$DRY_RUN" = false ]; then
        read -p "Create release tag '$VERSION'? (y/N): " CONFIRM_TAG
        if [ "$CONFIRM_TAG" = "y" ] || [ "$CONFIRM_TAG" = "Y" ]; then
            run_cmd git tag -a "$VERSION" -m "Release $VERSION"
            run_cmd git push origin "$VERSION"
            log_success "Release tag created and pushed"
            log_info "GitHub Actions will now build all platforms"
        else
            log_warning "Tag creation skipped by user"
        fi
    else
        log_info "[DRY RUN] Would create tag: $VERSION"
        log_info "[DRY RUN] Would push tag to: origin"
    fi
    echo ""
elif [ "$SKIP_DEPLOY" = false ]; then
    log_info "No version specified. Skipping release tag creation."
    echo ""
fi

# Summary
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║                         SUMMARY                                ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

if [ "$DRY_RUN" = true ]; then
    log_warning "DRY RUN MODE - No actual changes were made"
    echo ""
fi

log_success "Pipeline completed successfully!"

if [ "$SKIP_DEPLOY" = false ]; then
    if [ -n "$VERSION" ]; then
        echo ""
        echo "🚀 NEXT STEPS:"
        echo ""
        echo "1. GitHub Actions will build all platforms (~20 minutes)"
        echo "2. Binaries will be attached to release:"
        echo "   https://github.com/sanctuary-stream/sanctuary-stream/releases/tag/$VERSION"
    else
        echo ""
        echo "💡 TIP: Create a production release with:"
        echo "   $0 --version v1.0.0"
    fi
fi

echo ""
