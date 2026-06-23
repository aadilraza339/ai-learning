# PR Review Workflow - Visual Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│                    🔄 PR REVIEW WORKFLOW                            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘


                         ┌──────────────┐
                         │   GitHub     │
                         │   PR #123    │
                         │   📋         │
                         └──────┬───────┘
                                │
                                │ Fetch PR Data
                                ▼
                         ┌──────────────┐
                         │  Terminal    │
                         │ pr-review.sh │
                         │   💻         │
                         └──────┬───────┘
                                │
                                │ Generates
                                ▼
                    ┌──────────────────────┐
                    │   Review Prompt      │
                    │   (with full diff)   │
                    │   📄                 │
                    └──────┬───────────────┘
                           │
                           │ Copy to Clipboard
                           │ (pbcopy)
                           ▼
                    ┌──────────────────────┐
                    │    Clipboard         │
                    │    📋                │
                    └──────┬───────────────┘
                           │
                           │ Paste into AI
                           │
           ┌───────────────┼───────────────┐
           │               │               │
           ▼               ▼               ▼
    ┌──────────┐    ┌──────────┐    ┌──────────┐
    │ ChatGPT  │    │  Claude  │    │  Gemini  │
    │   🤖     │    │   🤖     │    │   🤖     │
    └────┬─────┘    └────┬─────┘    └────┬─────┘
         │               │               │
         └───────────────┼───────────────┘
                         │
                         │ AI Analysis
                         ▼
                  ┌──────────────┐
                  │ AI Review    │
                  │ Suggestions  │
                  │   💡         │
                  └──────┬───────┘
                         │
                         │
                         ▼
              ┌──────────────────────┐
              │  👤 YOU REVIEW       │
              │  (Full Control)      │
              │                      │
              │  ✓ Read suggestions  │
              │  ✓ Decide what to    │
              │    use               │
              │  ✓ Modify as needed  │
              └──────┬───────────────┘
                     │
                     │ Select & Copy
                     │ Relevant Comments
                     ▼
              ┌──────────────────────┐
              │  Manually Add to     │
              │  GitHub PR           │
              │  📝                  │
              └──────┬───────────────┘
                     │
                     ▼
              ┌──────────────────────┐
              │  ✅ Review Posted    │
              │  (Your Choice!)      │
              └──────────────────────┘


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                      🎯 KEY CONTROL POINTS

┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  YOU CONTROL:                                                       │
│                                                                     │
│  1️⃣  Which PR to review                                            │
│  2️⃣  Which AI service to use (ChatGPT, Claude, Gemini, etc.)       │
│  3️⃣  What to ask the AI (can customize prompt)                     │
│  4️⃣  Which suggestions to accept                                   │
│  5️⃣  How to phrase the comments                                    │
│  6️⃣  When to post to GitHub                                        │
│                                                                     │
│  AI NEVER:                                                          │
│  ❌ Posts comments automatically                                    │
│  ❌ Has access to your GitHub account                               │
│  ❌ Makes decisions for you                                         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                    📊 WORKFLOW COMPARISON


┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  WORKFLOW 1: Manual Copy-Paste (Recommended)                        │
│  ────────────────────────────────────────────                       │
│                                                                     │
│  ./pr-review.sh 123 https://github.com/owner/repo                   │
│         ↓                                                           │
│  cat pr-reviews/review-prompt.txt | pbcopy                          │
│         ↓                                                           │
│  Paste into ChatGPT/Claude                                          │
│         ↓                                                           │
│  Review & manually add to GitHub                                    │
│                                                                     │
│  ⏱️  Time: 2-3 min  |  💰 Cost: Free  |  🎯 Control: 100%          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  WORKFLOW 2: AI API (Advanced)                                      │
│  ──────────────────────────────                                     │
│                                                                     │
│  export OPENAI_API_KEY='sk-...'                                     │
│         ↓                                                           │
│  ./pr-review.sh 123 https://github.com/owner/repo                   │
│         ↓                                                           │
│  ./pr-review-ai.sh --provider openai                                │
│         ↓                                                           │
│  cat pr-reviews/ai-review.md                                        │
│         ↓                                                           │
│  Review & manually add to GitHub                                    │
│                                                                     │
│  ⏱️  Time: 1-2 min  |  💰 Cost: ~$0.05  |  🎯 Control: 95%         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  WORKFLOW 3: GitHub CLI (Convenient)                                │
│  ────────────────────────────────────                               │
│                                                                     │
│  cd ~/my-repo                                                       │
│         ↓                                                           │
│  ./pr-review.sh 123  (no URL needed!)                               │
│         ↓                                                           │
│  cat pr-reviews/review-prompt.txt | pbcopy                          │
│         ↓                                                           │
│  Paste into ChatGPT/Claude                                          │
│         ↓                                                           │
│  Review & manually add to GitHub                                    │
│                                                                     │
│  ⏱️  Time: 2 min  |  💰 Cost: Free  |  🎯 Control: 100%            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                    🎓 WHAT AI ANALYZES


┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  📊 Code Quality                                                    │
│     • Readability and maintainability                               │
│     • Code organization                                             │
│     • Best practices adherence                                      │
│                                                                     │
│  🐛 Potential Bugs                                                  │
│     • Logic errors                                                  │
│     • Edge cases not handled                                        │
│     • Null/undefined checks                                         │
│                                                                     │
│  🔒 Security Issues                                                 │
│     • Input validation                                              │
│     • Authentication/authorization                                  │
│     • Data exposure risks                                           │
│                                                                     │
│  ⚡ Performance                                                     │
│     • Inefficient algorithms                                        │
│     • Memory leaks                                                  │
│     • Database query optimization                                   │
│                                                                     │
│  🧪 Testing                                                         │
│     • Test coverage                                                 │
│     • Missing test cases                                            │
│     • Test quality                                                  │
│                                                                     │
│  📚 Documentation                                                   │
│     • Code comments                                                 │
│     • API documentation                                             │
│     • README updates                                                │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                    🚀 GETTING STARTED


Step 1: Read the Guide
   cat START-HERE.md

Step 2: Try Your First Review
   ./pr-review.sh 123 https://github.com/facebook/react
   cat pr-reviews/review-prompt.txt | pbcopy

Step 3: Paste into AI
   https://chat.openai.com
   https://claude.ai

Step 4: Review & Post
   Read AI suggestions → Select what to use → Post to GitHub


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                    📚 DOCUMENTATION


   START-HERE.md              Complete getting started guide
   PR-REVIEW-CHEATSHEET.md    Quick command reference
   PR-REVIEW-EXAMPLES.md      Real-world usage examples
   PR-REVIEW-README.md        Full documentation
   PR-REVIEW-WORKFLOWS.md     Workflow comparison guide


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                 ✨ You're in Control. AI Assists. ✨

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
