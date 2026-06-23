# PR Review Workflows Comparison

## Overview

This tool supports **3 main workflows**. Choose based on your needs:

---

## 🥇 Workflow 1: Manual Copy-Paste (Recommended)

**Best for:** Maximum control, no API costs, works with any AI

### Steps:
```bash
# 1. Fetch PR
./pr-review.sh 123 https://github.com/owner/repo

# 2. Copy to clipboard
cat pr-reviews/review-prompt.txt | pbcopy

# 3. Paste into ChatGPT/Claude/Gemini
# 4. Review AI suggestions
# 5. Manually add comments to GitHub
```

### Pros:
✅ **Full control** - Review AI output before using  
✅ **No API costs** - Use free AI chat interfaces  
✅ **Flexible** - Works with any AI service  
✅ **Interactive** - Can ask follow-up questions  
✅ **Safe** - No automatic actions  

### Cons:
❌ Requires manual copy-paste  
❌ Slightly slower for bulk reviews  

### Time: ~2-3 minutes per PR

---

## 🥈 Workflow 2: AI API Integration

**Best for:** Frequent reviews, automation, consistency

### Steps:
```bash
# 1. Set API key (one-time)
export OPENAI_API_KEY='sk-...'

# 2. Fetch and review
./pr-review.sh 123 https://github.com/owner/repo
./pr-review-ai.sh --provider openai

# 3. Review output
cat pr-reviews/ai-review.md

# 4. Copy relevant parts
cat pr-reviews/github-comments.txt | pbcopy

# 5. Manually add to GitHub
```

### Pros:
✅ **Faster** - Automated AI call  
✅ **Consistent** - Same prompt every time  
✅ **Scriptable** - Can batch process  
✅ **Formatted** - Output ready for GitHub  

### Cons:
❌ **API costs** - ~$0.01-0.10 per review  
❌ **Less interactive** - No follow-up questions  
❌ **Setup required** - Need API key  

### Time: ~1-2 minutes per PR

---

## 🥉 Workflow 3: GitHub CLI Integration

**Best for:** Reviewing PRs in your own repositories

### Steps:
```bash
# 1. Setup (one-time)
brew install gh
gh auth login

# 2. Navigate to your repo
cd /path/to/your/repo

# 3. Review PR (no URL needed!)
./pr-review.sh 123

# 4. Copy and review
cat pr-reviews/review-prompt.txt | pbcopy
```

### Pros:
✅ **Simpler** - No need to specify repo URL  
✅ **Authenticated** - Higher API rate limits  
✅ **Faster** - Direct GitHub integration  

### Cons:
❌ **Setup required** - Need GitHub CLI  
❌ **Still manual** - Need to copy-paste  

### Time: ~2 minutes per PR

---

## 📊 Comparison Table

| Feature | Manual Copy-Paste | AI API | GitHub CLI |
|---------|------------------|--------|------------|
| **Setup Complexity** | ⭐ Easy | ⭐⭐ Medium | ⭐⭐ Medium |
| **Cost** | Free | ~$0.01-0.10/PR | Free |
| **Speed** | ⭐⭐ Medium | ⭐⭐⭐ Fast | ⭐⭐ Medium |
| **Control** | ⭐⭐⭐ Full | ⭐⭐ Good | ⭐⭐⭐ Full |
| **Flexibility** | ⭐⭐⭐ High | ⭐⭐ Medium | ⭐⭐ Medium |
| **Automation** | ⭐ Low | ⭐⭐⭐ High | ⭐⭐ Medium |
| **Works Offline** | ❌ No | ❌ No | ❌ No |
| **Batch Processing** | ⭐ Limited | ⭐⭐⭐ Excellent | ⭐⭐ Good |

---

## 🎯 Which Workflow Should You Use?

### Use **Manual Copy-Paste** if:
- You're just getting started
- You want maximum control
- You don't want to pay for API access
- You review PRs occasionally (< 5/day)
- You want to ask follow-up questions to AI

### Use **AI API** if:
- You review many PRs daily (> 10/day)
- You want consistent, automated reviews
- You're okay with small API costs
- You want to batch process PRs
- You need scriptable workflows

### Use **GitHub CLI** if:
- You primarily review PRs in your own repos
- You want simpler commands
- You're comfortable with CLI tools
- You want better GitHub integration

---

## 💡 Hybrid Approach (Best of All Worlds)

Many users combine workflows:

```bash
# For your own repos: Use GitHub CLI
cd ~/my-project
./pr-review.sh 123  # No URL needed!

# For external repos: Use manual copy-paste
./pr-review.sh 456 https://github.com/external/repo

# For bulk reviews: Use AI API
for pr in 789 790 791; do
    ./pr-review.sh $pr
    ./pr-review-ai.sh --provider openai
done
```

---

## 🔄 Example: Complete Workflow Comparison

### Scenario: Review PR #123 from facebook/react

#### Workflow 1: Manual Copy-Paste
```bash
./pr-review.sh 123 https://github.com/facebook/react
cat pr-reviews/review-prompt.txt | pbcopy
# Paste into ChatGPT
# Copy AI response
# Add to GitHub manually
```
**Time:** 3 minutes | **Cost:** $0 | **Control:** 100%

#### Workflow 2: AI API
```bash
export OPENAI_API_KEY='sk-...'
./pr-review.sh 123 https://github.com/facebook/react
./pr-review-ai.sh --provider openai
cat pr-reviews/github-comments.txt | pbcopy
# Add to GitHub manually
```
**Time:** 1.5 minutes | **Cost:** ~$0.05 | **Control:** 95%

#### Workflow 3: GitHub CLI (if it's your repo)
```bash
cd ~/my-fork-of-react
./pr-review.sh 123
cat pr-reviews/review-prompt.txt | pbcopy
# Paste into ChatGPT
# Add to GitHub manually
```
**Time:** 2 minutes | **Cost:** $0 | **Control:** 100%

---

## 🚀 Advanced: Custom Workflows

### Workflow 4: Semi-Automated with Approval
```bash
#!/bin/bash
# review-and-approve.sh

PR=$1
./pr-review.sh $PR
./pr-review-ai.sh --provider openai

echo "AI Review:"
cat pr-reviews/ai-review.md

echo -e "\nApprove this review? (y/n)"
read approval

if [ "$approval" = "y" ]; then
    cat pr-reviews/github-comments.txt | pbcopy
    echo "✓ Comments copied to clipboard!"
else
    echo "Review rejected. Edit manually."
fi
```

### Workflow 5: Multi-AI Consensus
```bash
#!/bin/bash
# multi-ai-review.sh

PR=$1
./pr-review.sh $PR

# Get reviews from multiple AIs
export OPENAI_API_KEY='sk-...'
./pr-review-ai.sh --provider openai
mv pr-reviews/ai-review.md pr-reviews/gpt4-review.md

export ANTHROPIC_API_KEY='sk-ant-...'
./pr-review-ai.sh --provider anthropic
mv pr-reviews/ai-review.md pr-reviews/claude-review.md

echo "Compare reviews:"
echo "GPT-4:  cat pr-reviews/gpt4-review.md"
echo "Claude: cat pr-reviews/claude-review.md"
```

---

## 📈 Scaling Your Reviews

### For 1-5 PRs/day
→ Use **Manual Copy-Paste**

### For 5-20 PRs/day
→ Use **AI API** + **GitHub CLI**

### For 20+ PRs/day
→ Use **AI API** + **Batch Scripts** + **Custom Automation**

---

## 🎓 Learning Path

1. **Week 1:** Start with Manual Copy-Paste
   - Get comfortable with the workflow
   - Learn what makes a good review

2. **Week 2:** Add GitHub CLI
   - Install and authenticate
   - Use for your own repos

3. **Week 3:** Try AI API
   - Set up API key
   - Compare with manual reviews

4. **Week 4:** Optimize
   - Create custom scripts
   - Build your perfect workflow

---

## ✅ Recommendation

**Start with Workflow 1 (Manual Copy-Paste)**

It's:
- Free
- Simple
- Gives you full control
- Helps you learn what to look for

**Upgrade to AI API when:**
- You're reviewing 10+ PRs/day
- You understand what good reviews look like
- You want to save time

**Add GitHub CLI when:**
- You're comfortable with terminal
- You review your own repos frequently
- You want simpler commands

---

**Remember:** All workflows give you manual control over what gets posted to GitHub. AI suggests, you decide! 🎯
