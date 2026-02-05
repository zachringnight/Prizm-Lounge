#!/bin/bash

# New Shoot Setup Script
# Usage: ./scripts/new-shoot.sh "Event Name" "partner-slug"
# This script prepares the Prizm Lounge production hub for a new event

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Helper functions
print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check arguments
if [ $# -lt 2 ]; then
    echo -e "${RED}Error: Missing required arguments${NC}"
    echo ""
    echo "Usage: $0 \"Event Name\" \"partner-slug\""
    echo ""
    echo "Arguments:"
    echo "  Event Name    The name of the event (e.g., 'Super Bowl LX')"
    echo "  Partner Slug  Short identifier for partner (e.g., 'panini')"
    echo ""
    echo "Example:"
    echo "  $0 \"Super Bowl LX\" \"panini\""
    exit 1
fi

EVENT_NAME="$1"
PARTNER_SLUG="$2"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Prizm Lounge - New Shoot Setup${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "Event Name: $EVENT_NAME"
echo "Partner:    $PARTNER_SLUG"
echo ""

# Step 1: Backup existing config if present
print_step "Checking for existing configuration..."
if [ -f "$PROJECT_ROOT/src/app/config.ts" ]; then
    print_warning "Found existing config.ts - creating backup"
    mkdir -p "$PROJECT_ROOT/backups"
    cp "$PROJECT_ROOT/src/app/config.ts" "$PROJECT_ROOT/backups/config.ts.$TIMESTAMP.bak"
fi

# Step 2: Copy config template
print_step "Setting up configuration template..."
if [ -f "$PROJECT_ROOT/template/config.template.ts" ]; then
    cp "$PROJECT_ROOT/template/config.template.ts" "$PROJECT_ROOT/src/app/config.ts"
    print_success "Configuration template copied"
else
    print_warning "No config template found - using existing config"
fi

# Step 3: Copy participants template
print_step "Setting up participants template..."
mkdir -p "$PROJECT_ROOT/src/data"
if [ -f "$PROJECT_ROOT/template/participants.template.ts" ]; then
    if [ ! -f "$PROJECT_ROOT/src/data/participants.ts" ]; then
        cp "$PROJECT_ROOT/template/participants.template.ts" "$PROJECT_ROOT/src/data/participants.ts"
        print_success "Participants template copied"
    else
        print_warning "Participants file already exists - skipping"
    fi
else
    print_warning "No participants template found"
fi

# Step 4: Create photos directory
print_step "Creating photos directory..."
mkdir -p "$PROJECT_ROOT/public/participants"
touch "$PROJECT_ROOT/public/participants/.gitkeep"
print_success "Photos directory ready"

# Step 5: Create sounds directory
print_step "Creating sounds directory..."
mkdir -p "$PROJECT_ROOT/public/sounds"
touch "$PROJECT_ROOT/public/sounds/.gitkeep"
print_success "Sounds directory ready"

# Step 6: Update placeholders in config (if applicable)
if [ -f "$PROJECT_ROOT/src/app/config.ts" ]; then
    print_step "Updating configuration placeholders..."

    # Use sed to replace placeholders (macOS compatible)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/YOUR EVENT NAME/$EVENT_NAME/g" "$PROJECT_ROOT/src/app/config.ts" 2>/dev/null || true
        sed -i '' "s/Partner Name/$PARTNER_SLUG/g" "$PROJECT_ROOT/src/app/config.ts" 2>/dev/null || true
    else
        sed -i "s/YOUR EVENT NAME/$EVENT_NAME/g" "$PROJECT_ROOT/src/app/config.ts" 2>/dev/null || true
        sed -i "s/Partner Name/$PARTNER_SLUG/g" "$PROJECT_ROOT/src/app/config.ts" 2>/dev/null || true
    fi
    print_success "Configuration updated"
fi

# Step 7: Clear local storage data (optional prompt)
echo ""
read -p "Do you want to clear localStorage data? (y/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Note: localStorage data must be cleared manually in the browser"
    echo "       Open DevTools > Application > Local Storage > Clear"
fi

# Summary
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Next steps:"
echo "  1. Edit src/app/config.ts with full event details"
echo "  2. Edit src/data/participants.ts with participant data"
echo "  3. Add photos to public/participants/"
echo "  4. Add sound files to public/sounds/"
echo "  5. Run: npm run dev"
echo ""
echo "Required sound files (optional):"
echo "  - notification.mp3"
echo "  - timer-complete.mp3"
echo "  - warning.mp3"
echo "  - tick.mp3"
echo "  - success.mp3"
echo "  - error.mp3"
echo ""
