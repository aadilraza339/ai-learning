# PR Review CLI Tool

A flexible CLI-based tool for reviewing GitHub Pull Requests using AI, while maintaining full manual control over what gets posted.

## Features

- ✅ Fetch PR data with or without GitHub CLI
- ✅ Generate comprehensive AI review prompts
- ✅ Support for multiple AI providers (OpenAI, Anthropic)
- ✅ Manual copy-paste workflow (no automatic PR comments)
- ✅ Formatted output ready for GitHub
- ✅ Full control over what feedback to use

## Quick Start

### 1. Make scripts executable

```bash
chmod +x pr-review.sh pr-review-ai.sh
```

### 2. Review a PR (Manual Copy-Paste Workflow)

```bash
# If you have GitHub CLI installed and authenticated
./pr-review.sh 123

# Without GitHub CLI (provide repo URL)
./pr-review.sh 123 https://github.com/owner/repo
```

This will generate:
- `pr-reviews/pr-info.json` - PR metadata
- `pr-reviews/pr-diff.txt` - Code changes
- `pr-reviews/review-prompt.txt` - AI-ready review prompt

### 3. Get AI Review

**Option A: Manual Copy-Paste (Recommended)**

```bash
# Copy the prompt to clipboard
cat pr-reviews/review-prompt.txt | pbcopy

# Then paste into:
# - ChatGPT (https://chat.openai.com)
# - Claude (https://claude.ai)
# - Any other AI chat interface
```

**Option B: Use AI API (Optional)**

```bash
# Set your API key
export OPENAI_API_KEY='your-key-here'
# OR
export ANTHROPIC_API_KEY='your-key-here'

# Run AI review
./pr-review-ai.sh --provider openai
# OR
./pr-review-ai.sh --provider anthropic
```

This generates:
- `pr-reviews/ai-review.md` - AI's review
- `pr-reviews/github-comments.txt` - Formatted for GitHub

### 4. Add Comments to PR

1. Review the AI suggestions
2. Copy the parts you agree with
3. Manually paste them as comments on GitHub

## Installation

### Install GitHub CLI (Optional but Recommended)

```bash
# macOS
brew install gh

# Authenticate
gh auth login
```

### Install Dependencies

The scripts use standard Unix tools that should be available on macOS:
- `curl` - For API calls
- `jq` - For JSON parsing
- `pbcopy` - For clipboard (macOS)

Install `jq` if needed:
```bash
brew install jq
```

## Usage Examples

### Example 1: Quick Review with Copy-Paste

```bash
# 1. Fetch PR data
./pr-review.sh 456

# 2. Copy prompt to clipboard
cat pr-reviews/review-prompt.txt | pbcopy

# 3. Paste into ChatGPT and get review

# 4. Manually add comments to PR on GitHub
```

### Example 2: Using OpenAI API

```bash
# 1. Set API key (one-time setup)
export OPENAI_API_KEY='sk-...'

# 2. Fetch and review PR
./pr-review.sh 456
./pr-review-ai.sh --provider openai

# 3. Review AI suggestions
cat pr-reviews/ai-review.md

# 4. Copy relevant comments
cat pr-reviews/github-comments.txt | pbcopy

# 5. Manually paste to PR
```

### Example 3: Review PR from Different Repo

```bash
# Without GitHub CLI
./pr-review.sh 789 https://github.com/facebook/react

# Copy and review as usual
cat pr-reviews/review-prompt.txt | pbcopy
```

## Workflow Diagram

```
┌─────────────────────┐
│   Run pr-review.sh  │
│   with PR number    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Fetches PR data    │
│  (via gh CLI or     │
│   GitHub API)       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Generates review    │
│ prompt with full    │
│ context & diff      │
└──────────┬──────────┘
           │
           ├──────────────────────┐
           │                      │
           ▼                      ▼
┌─────────────────────┐  ┌─────────────────────┐
│  Manual Copy-Paste  │  │  AI API (Optional)  │
│  to ChatGPT/Claude  │  │  pr-review-ai.sh    │
└──────────┬──────────┘  └──────────┬──────────┘
           │                        │
           └────────┬───────────────┘
                    │
                    ▼
           ┌─────────────────────┐
           │  Review AI output   │
           │  Select relevant    │
           │  comments           │
           └──────────┬──────────┘
                      │
                      ▼
           ┌─────────────────────┐
           │  Manually paste to  │
           │  GitHub PR          │
           │  (Full control!)    │
           └─────────────────────┘
```

## Configuration

### Environment Variables

```bash
# For AI API usage (optional)
export OPENAI_API_KEY='your-openai-key'
export ANTHROPIC_API_KEY='your-anthropic-key'

# Add to ~/.zshrc for persistence
echo "export OPENAI_API_KEY='your-key'" >> ~/.zshrc
```

### Customize Review Prompt

Edit the `generate_review_prompt()` function in `pr-review.sh` to customize:
- Review checklist items
- Focus areas (security, performance, etc.)
- Output format
- Specific coding standards

## Review Checklist

The default prompt asks AI to review:

1. **Code Quality**
   - Readability and maintainability
   - Best practices
   - Code organization

2. **Potential Bugs**
   - Logic errors
   - Edge cases
   - Error handling

3. **Security Issues**
   - Input validation
   - Authentication/authorization
   - Data exposure

4. **Performance**
   - Algorithm efficiency
   - Memory usage
   - Database queries

5. **Testing**
   - Test coverage
   - Missing test cases

6. **Documentation**
   - Code comments
   - API docs
   - README updates

## Tips

### 1. Review Multiple PRs

```bash
# Review several PRs in sequence
for pr in 123 124 125; do
    ./pr-review.sh $pr
    cat pr-reviews/review-prompt.txt | pbcopy
    echo "PR #$pr copied to clipboard. Press enter when ready for next..."
    read
done
```

### 2. Save Reviews for Later

```bash
# Archive reviews by PR number
./pr-review.sh 123
mv pr-reviews pr-reviews-123
```

### 3. Focus on Specific Files

```bash
# Manually edit pr-diff.txt to only include files you want reviewed
./pr-review.sh 123
# Edit pr-reviews/pr-diff.txt to remove unwanted files
cat pr-reviews/review-prompt.txt | pbcopy
```

### 4. Create Custom Prompts

```bash
# Add your own review criteria
cat >> pr-reviews/review-prompt.txt << EOF

## Additional Requirements
- Check for TypeScript type safety
- Verify React hooks usage
- Ensure proper error boundaries
EOF

cat pr-reviews/review-prompt.txt | pbcopy
```

## Troubleshooting

### GitHub CLI not authenticated

```bash
gh auth login
# Follow the prompts
```

### jq not found

```bash
brew install jq
```

### API rate limits

If using curl without authentication, you may hit GitHub's rate limit. Install and authenticate with `gh` CLI to avoid this.

### Large PRs

For very large PRs, the prompt might be too long for some AI models. Consider:
1. Reviewing files separately
2. Using a model with larger context (GPT-4 Turbo, Claude 3)
3. Splitting the diff manually

## Advanced Usage

### Create an alias

Add to `~/.zshrc`:

```bash
alias prr='~/path/to/pr-review.sh'
alias prr-ai='~/path/to/pr-review-ai.sh'
```

Then use:
```bash
prr 123
```

### Integrate with your workflow

```bash
# Create a git alias
git config --global alias.review-pr '!f() { ~/path/to/pr-review.sh $1; }; f'

# Use it
git review-pr 123
```

## Why This Approach?

✅ **Full Control** - You decide what comments to add  
✅ **No Integration** - No GitHub app permissions needed  
✅ **Flexible** - Works with any AI service  
✅ **Private** - Review locally before sharing  
✅ **Customizable** - Modify prompts for your needs  
✅ **Safe** - No automatic actions on PRs  

## License

MIT - Feel free to modify and use as needed!
