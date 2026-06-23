#!/bin/bash

# PR Review Script
# Usage: ./pr-review.sh <PR_NUMBER> [repo_url]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
OUTPUT_DIR="./pr-reviews"
REVIEW_PROMPT_FILE="$OUTPUT_DIR/review-prompt.txt"
PR_DIFF_FILE="$OUTPUT_DIR/pr-diff.txt"
PR_INFO_FILE="$OUTPUT_DIR/pr-info.json"

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ ${NC}$1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Function to check if gh CLI is installed
check_gh_cli() {
    if command -v gh &> /dev/null; then
        return 0
    else
        return 1
    fi
}

# Function to fetch PR using GitHub CLI
fetch_pr_with_gh() {
    local pr_number=$1
    local repo_url=$2
    
    print_info "Fetching PR #$pr_number using GitHub CLI..."
    
    # If repo URL is provided, extract owner/repo and use --repo flag
    if [ -n "$repo_url" ]; then
        local owner_repo=$(echo "$repo_url" | sed -E 's|https://github.com/([^/]+/[^/]+)(\.git)?/?.*|\1|')
        print_info "Using repository: $owner_repo"
        
        # Fetch PR info
        gh pr view "$pr_number" --repo "$owner_repo" --json title,body,author,files,additions,deletions,url > "$PR_INFO_FILE"
        
        # Fetch PR diff
        gh pr diff "$pr_number" --repo "$owner_repo" > "$PR_DIFF_FILE"
    else
        # Fetch PR info (current repo)
        gh pr view "$pr_number" --json title,body,author,files,additions,deletions,url > "$PR_INFO_FILE"
        
        # Fetch PR diff
        gh pr diff "$pr_number" > "$PR_DIFF_FILE"
    fi
    
    print_success "PR data fetched successfully"
}

# Function to fetch PR using curl (fallback)
fetch_pr_with_curl() {
    local pr_number=$1
    local repo_url=$2
    
    if [ -z "$repo_url" ]; then
        print_error "Repository URL required when GitHub CLI is not available"
        echo "Usage: ./pr-review.sh <PR_NUMBER> <REPO_URL>"
        echo "Example: ./pr-review.sh 123 https://github.com/owner/repo"
        exit 1
    fi
    
    # Extract owner and repo from URL
    local owner_repo=$(echo "$repo_url" | sed -E 's|https://github.com/([^/]+/[^/]+).*|\1|')
    
    print_info "Fetching PR #$pr_number from $owner_repo using GitHub API..."
    
    # Fetch PR info
    curl -s "https://api.github.com/repos/$owner_repo/pulls/$pr_number" > "$PR_INFO_FILE"
    
    # Fetch PR diff
    curl -s -H "Accept: application/vnd.github.v3.diff" \
        "https://api.github.com/repos/$owner_repo/pulls/$pr_number" > "$PR_DIFF_FILE"
    
    print_success "PR data fetched successfully"
}

# Function to generate review prompt
generate_review_prompt() {
    local pr_number=$1
    
    print_info "Generating AI review prompt..."
    
    # Extract PR info
    local pr_title=$(jq -r '.title' "$PR_INFO_FILE" 2>/dev/null || echo "N/A")
    local pr_author=$(jq -r '.author.login // .user.login' "$PR_INFO_FILE" 2>/dev/null || echo "N/A")
    local pr_url=$(jq -r '.url // .html_url' "$PR_INFO_FILE" 2>/dev/null || echo "N/A")
    
    # Create comprehensive review prompt
    cat > "$REVIEW_PROMPT_FILE" << EOF
# GitHub Pull Request Review

Please review this Pull Request and provide detailed feedback.

## PR Information
- **PR Number:** #$pr_number
- **Title:** $pr_title
- **Author:** $pr_author
- **URL:** $pr_url

## Review Checklist

Please analyze the code changes and provide feedback on:

1. **Code Quality**
   - Code readability and maintainability
   - Adherence to best practices
   - Code organization and structure

2. **Potential Bugs**
   - Logic errors
   - Edge cases not handled
   - Null/undefined checks
   - Error handling

3. **Security Issues**
   - Input validation
   - Authentication/authorization
   - Data exposure
   - Injection vulnerabilities

4. **Performance Concerns**
   - Inefficient algorithms
   - Memory leaks
   - Database query optimization
   - Unnecessary re-renders (for frontend)

5. **Testing**
   - Test coverage
   - Missing test cases
   - Test quality

6. **Documentation**
   - Code comments
   - API documentation
   - README updates

## Code Diff

\`\`\`diff
$(cat "$PR_DIFF_FILE")
\`\`\`

## Instructions

Please provide:
1. **Summary:** Overall assessment of the PR
2. **Critical Issues:** Must-fix issues (bugs, security)
3. **Suggestions:** Nice-to-have improvements
4. **Positive Feedback:** What was done well

Format your response as GitHub review comments where applicable, with:
- File path
- Line number (if specific)
- Comment text
EOF

    print_success "Review prompt generated at: $REVIEW_PROMPT_FILE"
}

# Function to display next steps
show_next_steps() {
    echo ""
    print_success "PR review files generated!"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    print_info "Next Steps:"
    echo ""
    echo "  ${YELLOW}Option 1: Copy to AI Chat${NC}"
    echo "  1. Copy the prompt:"
    echo "     ${BLUE}cat $REVIEW_PROMPT_FILE | pbcopy${NC}"
    echo "  2. Paste into ChatGPT/Claude"
    echo "  3. Review AI suggestions"
    echo "  4. Manually add comments to PR"
    echo ""
    echo "  ${YELLOW}Option 2: Use AI API (if configured)${NC}"
    echo "  1. Run: ${BLUE}./pr-review-ai.sh${NC}"
    echo "  2. Review generated comments"
    echo "  3. Manually add to PR"
    echo ""
    echo "  ${YELLOW}Option 3: View Files Manually${NC}"
    echo "  - PR Info: ${BLUE}cat $PR_INFO_FILE${NC}"
    echo "  - PR Diff: ${BLUE}cat $PR_DIFF_FILE${NC}"
    echo "  - Review Prompt: ${BLUE}cat $REVIEW_PROMPT_FILE${NC}"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
}

# Main script
main() {
    local pr_number=$1
    local repo_url=$2
    
    # Validate input
    if [ -z "$pr_number" ]; then
        print_error "PR number is required"
        echo "Usage: ./pr-review.sh <PR_NUMBER> [repo_url]"
        exit 1
    fi
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  ${GREEN}PR Review Tool${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # Fetch PR data
    if check_gh_cli; then
        fetch_pr_with_gh "$pr_number" "$repo_url"
    else
        print_warning "GitHub CLI not found, using curl fallback"
        fetch_pr_with_curl "$pr_number" "$repo_url"
    fi
    
    # Generate review prompt
    generate_review_prompt "$pr_number"
    
    # Show next steps
    show_next_steps
}

# Run main function
main "$@"
