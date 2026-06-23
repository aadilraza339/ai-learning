# PR Review Tool - Quick Examples

## Example 1: Review a Public PR (Manual Copy-Paste)

Let's review a real PR from a public repository:

```bash
# Review PR #123 from React repository
./pr-review.sh 123 https://github.com/facebook/react

# Copy the generated prompt
cat pr-reviews/review-prompt.txt | pbcopy

# Now paste into ChatGPT or Claude
```

## Example 2: With GitHub CLI (If Installed)

```bash
# First, install and authenticate GitHub CLI
brew install gh
gh auth login

# Navigate to your repo
cd /path/to/your/repo

# Review any PR in that repo
./pr-review.sh 456

# Copy to clipboard
cat pr-reviews/review-prompt.txt | pbcopy
```

## Example 3: Using AI API (Optional)

```bash
# Set your OpenAI API key
export OPENAI_API_KEY='sk-your-key-here'

# Review a PR
./pr-review.sh 789 https://github.com/owner/repo

# Get AI review automatically
./pr-review-ai.sh --provider openai

# View the AI's review
cat pr-reviews/ai-review.md

# Copy formatted comments
cat pr-reviews/github-comments.txt | pbcopy
```

## Example 4: Custom Review Focus

```bash
# Generate the base prompt
./pr-review.sh 101 https://github.com/owner/repo

# Add custom instructions
cat >> pr-reviews/review-prompt.txt << 'EOF'

## Additional Review Focus:
- Check for TypeScript strict mode compliance
- Verify all async functions have proper error handling
- Ensure React components follow our naming conventions
- Check for accessibility (a11y) issues
EOF

# Copy to clipboard
cat pr-reviews/review-prompt.txt | pbcopy
```

## Example 5: Review Workflow

Here's a complete workflow:

```bash
# 1. Fetch PR data
./pr-review.sh 202 https://github.com/your-org/your-repo

# 2. Review the diff first (optional)
cat pr-reviews/pr-diff.txt

# 3. Copy prompt to AI
cat pr-reviews/review-prompt.txt | pbcopy

# 4. Paste into ChatGPT/Claude and get review

# 5. Save AI's response to a file (copy from AI chat)
# Then review it:
cat pr-reviews/ai-review.md

# 6. Go to GitHub PR and add comments manually
# - Click "Files changed"
# - Add inline comments where needed
# - Submit review
```

## Example 6: Batch Review Multiple PRs

```bash
# Create a list of PRs to review
PR_LIST=(123 124 125 126)

for pr in "${PR_LIST[@]}"; do
    echo "Reviewing PR #$pr..."
    ./pr-review.sh $pr
    
    # Archive this review
    mkdir -p pr-reviews-archive
    cp -r pr-reviews "pr-reviews-archive/pr-$pr"
    
    # Copy to clipboard
    cat pr-reviews/review-prompt.txt | pbcopy
    
    echo "PR #$pr prompt copied to clipboard"
    echo "Press Enter when ready for next PR..."
    read
done
```

## Example 7: Review Specific Files Only

```bash
# Fetch full PR
./pr-review.sh 303 https://github.com/owner/repo

# Edit the diff to only include files you care about
# For example, only review TypeScript files
grep -A 1000 "\.ts$\|\.tsx$" pr-reviews/pr-diff.txt > pr-reviews/pr-diff-filtered.txt

# Update the prompt to use filtered diff
# (manually edit pr-reviews/review-prompt.txt)

# Copy to clipboard
cat pr-reviews/review-prompt.txt | pbcopy
```

## Example 8: Create a Git Alias

Add to your `~/.gitconfig`:

```ini
[alias]
    review-pr = "!f() { ~/path/to/pr-review.sh $1; cat ~/path/to/pr-reviews/review-prompt.txt | pbcopy; echo 'Review prompt copied to clipboard!'; }; f"
```

Then use:
```bash
git review-pr 404
```

## Example 9: Integration with Your Shell

Add to `~/.zshrc`:

```bash
# PR Review function
prreview() {
    local pr_number=$1
    local repo_url=$2
    
    ~/path/to/pr-review.sh "$pr_number" "$repo_url"
    
    if [ $? -eq 0 ]; then
        cat ~/path/to/pr-reviews/review-prompt.txt | pbcopy
        echo "✓ Review prompt copied to clipboard!"
        echo "→ Paste into ChatGPT or Claude"
    fi
}

# Usage: prreview 123 https://github.com/owner/repo
```

## Example 10: Review Your Own PRs Before Submitting

```bash
# Create a PR draft first
gh pr create --draft

# Get the PR number (e.g., 505)
# Review it yourself using AI
./pr-review.sh 505

# Get AI feedback
cat pr-reviews/review-prompt.txt | pbcopy

# Make improvements based on AI feedback
# Then mark PR as ready for review
gh pr ready 505
```

## Tips for Best Results

### 1. **Be Specific in Follow-up Questions**

After getting initial AI review, ask follow-up questions:
- "Can you suggest a better implementation for the authentication logic?"
- "What edge cases am I missing in the validation function?"
- "How can I improve the performance of this database query?"

### 2. **Focus on Critical Areas**

Edit the prompt to emphasize what matters:
```bash
cat >> pr-reviews/review-prompt.txt << 'EOF'

PRIORITY AREAS:
1. Security vulnerabilities (CRITICAL)
2. Database query performance
3. Error handling
4. Type safety
EOF
```

### 3. **Use Different AI Models**

Try multiple AI services for different perspectives:
- ChatGPT (GPT-4) - Great for general code review
- Claude - Excellent for security and edge cases
- GitHub Copilot Chat - Good for language-specific issues

### 4. **Save Good Reviews**

Create a template from good reviews:
```bash
# After a particularly good review
cp pr-reviews/ai-review.md templates/good-review-example.md
```

## Common Use Cases

### Security-Focused Review
```bash
./pr-review.sh 606 https://github.com/owner/repo

cat >> pr-reviews/review-prompt.txt << 'EOF'

SECURITY CHECKLIST:
- [ ] SQL injection vulnerabilities
- [ ] XSS vulnerabilities
- [ ] Authentication bypass
- [ ] Authorization issues
- [ ] Sensitive data exposure
- [ ] CSRF protection
EOF

cat pr-reviews/review-prompt.txt | pbcopy
```

### Performance Review
```bash
./pr-review.sh 707

cat >> pr-reviews/review-prompt.txt << 'EOF'

PERFORMANCE FOCUS:
- Database N+1 queries
- Unnecessary re-renders
- Memory leaks
- Inefficient algorithms
- Bundle size impact
EOF

cat pr-reviews/review-prompt.txt | pbcopy
```

### Accessibility Review
```bash
./pr-review.sh 808

cat >> pr-reviews/review-prompt.txt << 'EOF'

ACCESSIBILITY CHECKLIST:
- Semantic HTML
- ARIA labels
- Keyboard navigation
- Screen reader support
- Color contrast
EOF

cat pr-reviews/review-prompt.txt | pbcopy
```

---

**Remember:** You always have full control! Review AI suggestions critically and only add comments you agree with.
