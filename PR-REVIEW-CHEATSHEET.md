# PR Review Tool - Cheat Sheet

## 🚀 Quick Commands

### Basic Usage
```bash
# Review a PR (with GitHub CLI)
./pr-review.sh <PR_NUMBER>

# Review a PR (without GitHub CLI)
./pr-review.sh <PR_NUMBER> <REPO_URL>

# Example
./pr-review.sh 123 https://github.com/facebook/react
```

### Copy to Clipboard
```bash
# Copy review prompt
cat pr-reviews/review-prompt.txt | pbcopy

# Copy AI review
cat pr-reviews/ai-review.md | pbcopy

# Copy GitHub-formatted comments
cat pr-reviews/github-comments.txt | pbcopy
```

### AI API (Optional)
```bash
# Set API key
export OPENAI_API_KEY='sk-...'
export ANTHROPIC_API_KEY='sk-ant-...'

# Run AI review
./pr-review-ai.sh --provider openai
./pr-review-ai.sh --provider anthropic
```

## 📋 Workflow

```
1. ./pr-review.sh <PR_NUMBER>
   ↓
2. cat pr-reviews/review-prompt.txt | pbcopy
   ↓
3. Paste into ChatGPT/Claude
   ↓
4. Review AI suggestions
   ↓
5. Manually add comments to GitHub PR
```

## 📁 Generated Files

| File | Description |
|------|-------------|
| `pr-reviews/pr-info.json` | PR metadata (title, author, etc.) |
| `pr-reviews/pr-diff.txt` | Code changes (diff) |
| `pr-reviews/review-prompt.txt` | AI-ready review prompt |
| `pr-reviews/ai-review.md` | AI's review (if using API) |
| `pr-reviews/github-comments.txt` | Formatted for GitHub |

## 🛠️ Setup

```bash
# One-time setup
./setup-pr-review.sh

# Install GitHub CLI (optional)
brew install gh
gh auth login

# Install jq (required)
brew install jq
```

## 💡 Pro Tips

### Create Aliases
```bash
# Add to ~/.zshrc
alias prr='~/path/to/pr-review.sh'
alias prr-copy='cat ~/path/to/pr-reviews/review-prompt.txt | pbcopy'

# Usage
prr 123
prr-copy
```

### Review Multiple PRs
```bash
for pr in 123 124 125; do
    ./pr-review.sh $pr
    cat pr-reviews/review-prompt.txt | pbcopy
    echo "PR #$pr ready. Press Enter for next..."
    read
done
```

### Custom Review Focus
```bash
./pr-review.sh 123

# Add custom instructions
cat >> pr-reviews/review-prompt.txt << 'EOF'
Focus on:
- Security issues
- Performance problems
- Type safety
EOF

cat pr-reviews/review-prompt.txt | pbcopy
```

### Archive Reviews
```bash
# Save review for later
./pr-review.sh 123
cp -r pr-reviews pr-reviews-backup-123
```

## 🎯 Review Checklist

Default prompt checks:
- ✅ Code quality & readability
- ✅ Potential bugs & edge cases
- ✅ Security vulnerabilities
- ✅ Performance issues
- ✅ Test coverage
- ✅ Documentation

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| `gh not found` | Install: `brew install gh` (or use repo URL) |
| `jq not found` | Install: `brew install jq` |
| `Permission denied` | Run: `chmod +x pr-review.sh` |
| API rate limit | Authenticate: `gh auth login` |
| Large PR timeout | Review files separately |

## 📚 Documentation

- **Full Guide:** `cat PR-REVIEW-README.md`
- **Examples:** `cat PR-REVIEW-EXAMPLES.md`
- **This Cheat Sheet:** `cat PR-REVIEW-CHEATSHEET.md`

## 🌐 AI Chat URLs

- ChatGPT: https://chat.openai.com
- Claude: https://claude.ai
- Gemini: https://gemini.google.com

## ⚡ One-Liner Workflows

```bash
# Quick review and copy
./pr-review.sh 123 && cat pr-reviews/review-prompt.txt | pbcopy

# Review with AI API
./pr-review.sh 123 && ./pr-review-ai.sh --provider openai

# Review and open in editor
./pr-review.sh 123 && code pr-reviews/review-prompt.txt

# Review and view diff
./pr-review.sh 123 && bat pr-reviews/pr-diff.txt
```

## 🎨 Customization

### Change Review Focus
Edit `pr-review.sh` → `generate_review_prompt()` function

### Add Custom Checks
Append to prompt before copying:
```bash
echo "## Custom Checks\n- Check for..." >> pr-reviews/review-prompt.txt
```

### Different AI Models
Edit `pr-review-ai.sh` → change model names:
- OpenAI: `gpt-4-turbo-preview`, `gpt-4`, `gpt-3.5-turbo`
- Anthropic: `claude-3-opus-20240229`, `claude-3-sonnet-20240229`

---

**Remember:** You're in control! AI suggests, you decide. 🎯
