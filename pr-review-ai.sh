#!/bin/bash

# AI-Powered PR Review Script
# Requires: OpenAI API key or Anthropic API key
# Usage: ./pr-review-ai.sh [--provider openai|anthropic]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
OUTPUT_DIR="./pr-reviews"
REVIEW_PROMPT_FILE="$OUTPUT_DIR/review-prompt.txt"
AI_REVIEW_FILE="$OUTPUT_DIR/ai-review.md"
GITHUB_COMMENTS_FILE="$OUTPUT_DIR/github-comments.txt"

# Default provider
PROVIDER="openai"

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --provider)
            PROVIDER="$2"
            shift 2
            ;;
        *)
            shift
            ;;
    esac
done

# Print functions
print_info() { echo -e "${BLUE}ℹ ${NC}$1"; }
print_success() { echo -e "${GREEN}✓${NC} $1"; }
print_warning() { echo -e "${YELLOW}⚠${NC} $1"; }
print_error() { echo -e "${RED}✗${NC} $1"; }

# Check if review prompt exists
if [ ! -f "$REVIEW_PROMPT_FILE" ]; then
    print_error "Review prompt not found. Run ./pr-review.sh first!"
    exit 1
fi

# Function to call OpenAI API
call_openai() {
    local prompt=$(cat "$REVIEW_PROMPT_FILE")
    
    if [ -z "$OPENAI_API_KEY" ]; then
        print_error "OPENAI_API_KEY environment variable not set"
        echo "Set it with: export OPENAI_API_KEY='your-key-here'"
        exit 1
    fi
    
    print_info "Calling OpenAI API (GPT-4)..."
    
    curl -s https://api.openai.com/v1/chat/completions \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $OPENAI_API_KEY" \
        -d "{
            \"model\": \"gpt-4-turbo-preview\",
            \"messages\": [
                {
                    \"role\": \"system\",
                    \"content\": \"You are an expert code reviewer. Provide detailed, actionable feedback on pull requests. Format your response in markdown with clear sections.\"
                },
                {
                    \"role\": \"user\",
                    \"content\": $(echo "$prompt" | jq -Rs .)
                }
            ],
            \"temperature\": 0.3,
            \"max_tokens\": 4000
        }" | jq -r '.choices[0].message.content' > "$AI_REVIEW_FILE"
}

# Function to call Anthropic API
call_anthropic() {
    local prompt=$(cat "$REVIEW_PROMPT_FILE")
    
    if [ -z "$ANTHROPIC_API_KEY" ]; then
        print_error "ANTHROPIC_API_KEY environment variable not set"
        echo "Set it with: export ANTHROPIC_API_KEY='your-key-here'"
        exit 1
    fi
    
    print_info "Calling Anthropic API (Claude)..."
    
    curl -s https://api.anthropic.com/v1/messages \
        -H "Content-Type: application/json" \
        -H "x-api-key: $ANTHROPIC_API_KEY" \
        -H "anthropic-version: 2023-06-01" \
        -d "{
            \"model\": \"claude-3-sonnet-20240229\",
            \"max_tokens\": 4000,
            \"messages\": [
                {
                    \"role\": \"user\",
                    \"content\": $(echo "$prompt" | jq -Rs .)
                }
            ],
            \"system\": \"You are an expert code reviewer. Provide detailed, actionable feedback on pull requests. Format your response in markdown with clear sections.\"
        }" | jq -r '.content[0].text' > "$AI_REVIEW_FILE"
}

# Function to format review for GitHub
format_for_github() {
    print_info "Formatting review for GitHub comments..."
    
    cat > "$GITHUB_COMMENTS_FILE" << 'EOF'
# How to Add These Comments to GitHub PR

## Option 1: Add as PR Review Comment
1. Go to the PR on GitHub
2. Click "Files changed" tab
3. Click "Review changes" button
4. Paste the relevant sections below
5. Submit review

## Option 2: Add Inline Comments
1. Go to "Files changed" tab
2. Hover over the line you want to comment on
3. Click the "+" button
4. Paste the relevant comment
5. Click "Add single comment" or "Start a review"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EOF
    
    cat "$AI_REVIEW_FILE" >> "$GITHUB_COMMENTS_FILE"
    
    print_success "GitHub-ready comments saved to: $GITHUB_COMMENTS_FILE"
}

# Main execution
main() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  ${GREEN}AI-Powered PR Review${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # Call appropriate AI provider
    case $PROVIDER in
        openai)
            call_openai
            ;;
        anthropic)
            call_anthropic
            ;;
        *)
            print_error "Unknown provider: $PROVIDER"
            echo "Supported providers: openai, anthropic"
            exit 1
            ;;
    esac
    
    if [ $? -eq 0 ]; then
        print_success "AI review completed!"
        format_for_github
        
        echo ""
        print_info "Review saved to: $AI_REVIEW_FILE"
        print_info "GitHub comments: $GITHUB_COMMENTS_FILE"
        echo ""
        print_warning "Next steps:"
        echo "  1. Review the AI suggestions: ${BLUE}cat $AI_REVIEW_FILE${NC}"
        echo "  2. Copy relevant comments: ${BLUE}cat $GITHUB_COMMENTS_FILE${NC}"
        echo "  3. Manually add them to the PR on GitHub"
        echo ""
    else
        print_error "AI review failed"
        exit 1
    fi
}

main
