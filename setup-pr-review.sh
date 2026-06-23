#!/bin/bash

# Quick Setup Script for PR Review Tool

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "  ${GREEN}PR Review Tool - Setup${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check for jq
echo -e "${BLUE}Checking dependencies...${NC}"
if ! command -v jq &> /dev/null; then
    echo -e "${YELLOW}⚠ jq not found. Installing...${NC}"
    brew install jq
else
    echo -e "${GREEN}✓${NC} jq is installed"
fi

# Check for GitHub CLI
if command -v gh &> /dev/null; then
    echo -e "${GREEN}✓${NC} GitHub CLI is installed"
    
    # Check if authenticated
    if gh auth status &> /dev/null; then
        echo -e "${GREEN}✓${NC} GitHub CLI is authenticated"
    else
        echo -e "${YELLOW}⚠ GitHub CLI not authenticated${NC}"
        echo "  Run: gh auth login"
    fi
else
    echo -e "${YELLOW}⚠ GitHub CLI not found${NC}"
    echo "  Install with: brew install gh"
    echo "  (Optional - tool works without it)"
fi

# Make scripts executable
echo ""
echo -e "${BLUE}Making scripts executable...${NC}"
chmod +x pr-review.sh pr-review-ai.sh
echo -e "${GREEN}✓${NC} Scripts are now executable"

# Create output directory
mkdir -p pr-reviews
echo -e "${GREEN}✓${NC} Created pr-reviews directory"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "  ${GREEN}Setup Complete!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${BLUE}Quick Start:${NC}"
echo ""
echo "  1. Review a PR:"
echo -e "     ${YELLOW}./pr-review.sh <PR_NUMBER>${NC}"
echo ""
echo "  2. Copy prompt to clipboard:"
echo -e "     ${YELLOW}cat pr-reviews/review-prompt.txt | pbcopy${NC}"
echo ""
echo "  3. Paste into ChatGPT/Claude"
echo ""
echo "  4. Manually add comments to GitHub PR"
echo ""
echo -e "${BLUE}Read the full guide:${NC}"
echo -e "  ${YELLOW}cat PR-REVIEW-README.md${NC}"
echo ""
