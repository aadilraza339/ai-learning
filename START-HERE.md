# 🚀 START HERE - PR Review Tool

Welcome! This is your CLI-based PR review tool that uses AI while keeping you in full control.

## ⚡ Quick Start (30 seconds)

```bash
# 1. Review any GitHub PR
./pr-review.sh 123 https://github.com/facebook/react

# 2. Copy the prompt
cat pr-reviews/review-prompt.txt | pbcopy

# 3. Paste into ChatGPT or Claude
# 4. Review AI suggestions and manually add to GitHub
```

**That's it!** You're reviewing PRs with AI. 🎉

---

## 📚 What You Got

This tool includes:

### 🔧 **Scripts** (Ready to use)
- `pr-review.sh` - Main review script
- `pr-review-ai.sh` - Optional AI API integration
- `setup-pr-review.sh` - One-time setup helper

### 📖 **Documentation** (Read these!)
- **START-HERE.md** ← You are here
- **PR-REVIEW-README.md** - Complete guide (8KB)
- **PR-REVIEW-CHEATSHEET.md** - Quick reference (4KB)
- **PR-REVIEW-EXAMPLES.md** - Real examples (6KB)
- **PR-REVIEW-WORKFLOWS.md** - Workflow comparison (7KB)

### 📁 **Output**
- `pr-reviews/` - Generated review files

---

## 🎯 Your First Review (Step by Step)

Let's review a real PR together:

### Step 1: Run the script
```bash
./pr-review.sh 123 https://github.com/facebook/react
```

You'll see:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  PR Review Tool
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ℹ Fetching PR #123 using GitHub API...
✓ PR data fetched successfully
ℹ Generating AI review prompt...
✓ Review prompt generated at: ./pr-reviews/review-prompt.txt
```

### Step 2: Copy the prompt
```bash
cat pr-reviews/review-prompt.txt | pbcopy
```

### Step 3: Paste into AI
1. Go to https://chat.openai.com or https://claude.ai
2. Paste the prompt (Cmd+V)
3. Wait for AI to analyze

### Step 4: Review AI suggestions
Read the AI's feedback. It will cover:
- Code quality issues
- Potential bugs
- Security concerns
- Performance problems
- Best practices

### Step 5: Add comments to GitHub
1. Go to the PR on GitHub
2. Click "Files changed"
3. Manually add the comments you agree with
4. Submit your review

**Done!** You just did an AI-powered PR review. 🎊

---

## 🤔 Common Questions

### Q: Do I need GitHub CLI?
**A:** No! It's optional. The tool works with just the PR URL.

### Q: Does this automatically comment on PRs?
**A:** No! You always manually choose what to post. Full control.

### Q: What AI services can I use?
**A:** Any! ChatGPT, Claude, Gemini, or use the API scripts for automation.

### Q: How much does it cost?
**A:** Free if you use manual copy-paste. ~$0.01-0.10 per PR if using APIs.

### Q: Is my code sent to AI?
**A:** Only what you paste. The script just prepares the prompt locally.

### Q: Can I customize what AI reviews?
**A:** Yes! Edit the prompt or add custom instructions.

---

## 📖 Next Steps

### Beginner (Just getting started)
1. ✅ You're already here!
2. Read: `cat PR-REVIEW-CHEATSHEET.md`
3. Try reviewing 2-3 PRs
4. Get comfortable with the workflow

### Intermediate (Ready for more)
1. Read: `cat PR-REVIEW-EXAMPLES.md`
2. Try different review focuses (security, performance)
3. Create shell aliases for faster access
4. Review PRs in your own projects

### Advanced (Power user)
1. Read: `cat PR-REVIEW-WORKFLOWS.md`
2. Set up AI API integration
3. Create custom review scripts
4. Batch process multiple PRs

---

## 🎓 Learning Resources

### Essential Reading (5 minutes)
```bash
cat PR-REVIEW-CHEATSHEET.md
```
Quick reference for all commands.

### Deep Dive (15 minutes)
```bash
cat PR-REVIEW-README.md
```
Complete guide with all features.

### Practical Examples (10 minutes)
```bash
cat PR-REVIEW-EXAMPLES.md
```
Real-world usage scenarios.

### Workflow Optimization (10 minutes)
```bash
cat PR-REVIEW-WORKFLOWS.md
```
Choose the best workflow for your needs.

---

## 🛠️ Optional Setup

### Install GitHub CLI (Recommended)
```bash
brew install gh
gh auth login
```

Benefits:
- Simpler commands (no need for repo URL)
- Higher API rate limits
- Better GitHub integration

### Set Up AI API (Optional)
```bash
# For OpenAI
export OPENAI_API_KEY='sk-your-key'

# For Anthropic
export ANTHROPIC_API_KEY='sk-ant-your-key'

# Test it
./pr-review-ai.sh --provider openai
```

Benefits:
- Faster reviews
- Automated workflow
- Consistent results

---

## 💡 Pro Tips

### Tip 1: Create an Alias
```bash
echo "alias prr='~/path/to/pr-review.sh'" >> ~/.zshrc
source ~/.zshrc

# Now use:
prr 123 https://github.com/owner/repo
```

### Tip 2: Review Your Own PRs First
Before submitting a PR, review it yourself:
```bash
./pr-review.sh <YOUR_PR_NUMBER>
cat pr-reviews/review-prompt.txt | pbcopy
# Paste into AI and fix issues before others see them!
```

### Tip 3: Focus on What Matters
Add custom instructions to the prompt:
```bash
./pr-review.sh 123 https://github.com/owner/repo

cat >> pr-reviews/review-prompt.txt << 'EOF'

CRITICAL: Focus on security and performance only.
EOF

cat pr-reviews/review-prompt.txt | pbcopy
```

### Tip 4: Save Good Reviews
```bash
# Archive reviews for reference
cp -r pr-reviews pr-reviews-archive/pr-123-excellent-example
```

---

## 🎯 Your Review Checklist

Every review should cover:

- [ ] **Code Quality** - Is it readable and maintainable?
- [ ] **Bugs** - Any logic errors or edge cases?
- [ ] **Security** - Any vulnerabilities?
- [ ] **Performance** - Any inefficiencies?
- [ ] **Tests** - Is it well tested?
- [ ] **Documentation** - Is it documented?

The AI will help with all of these! ✅

---

## 🚨 Important Reminders

### ✅ You're Always in Control
- AI suggests, you decide
- Nothing is posted automatically
- Review AI output critically

### ✅ Privacy
- Code is only sent to AI when you paste it
- Scripts run locally
- No data is stored by the tool

### ✅ Flexibility
- Works with any AI service
- Customize prompts as needed
- Use with any GitHub repository

---

## 🆘 Need Help?

### Something not working?
1. Check: `cat PR-REVIEW-README.md` (Troubleshooting section)
2. Run: `./setup-pr-review.sh` (Re-run setup)
3. Verify: `which jq` (Check dependencies)

### Want to customize?
1. Read: `cat PR-REVIEW-EXAMPLES.md` (See examples)
2. Edit: `pr-review.sh` (Modify prompts)
3. Create: Your own custom scripts

### Questions about workflows?
1. Read: `cat PR-REVIEW-WORKFLOWS.md`
2. Try: Different approaches
3. Choose: What works for you

---

## 🎉 You're Ready!

You now have a powerful, flexible PR review tool that:
- ✅ Works with any GitHub repository
- ✅ Uses AI for intelligent reviews
- ✅ Keeps you in full control
- ✅ Costs nothing (with manual workflow)
- ✅ Is completely customizable

**Start reviewing PRs with AI today!**

```bash
./pr-review.sh <PR_NUMBER> <REPO_URL>
```

---

## 📞 Quick Reference Card

```
┌─────────────────────────────────────────────────────────┐
│                  PR REVIEW TOOL                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Review PR:                                             │
│  $ ./pr-review.sh 123 https://github.com/owner/repo     │
│                                                         │
│  Copy Prompt:                                           │
│  $ cat pr-reviews/review-prompt.txt | pbcopy            │
│                                                         │
│  AI URLs:                                               │
│  • ChatGPT: https://chat.openai.com                     │
│  • Claude:  https://claude.ai                           │
│  • Gemini:  https://gemini.google.com                   │
│                                                         │
│  Docs:                                                  │
│  • Quick Ref:  cat PR-REVIEW-CHEATSHEET.md              │
│  • Full Guide: cat PR-REVIEW-README.md                  │
│  • Examples:   cat PR-REVIEW-EXAMPLES.md                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Happy Reviewing! 🚀**
