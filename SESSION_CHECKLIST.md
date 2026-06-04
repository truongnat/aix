# Session Completion Checklist

Use this before shipping or closing a session. Copy-paste into your SHIP.md or TASKS.md.

---

## Pre-Flight (Before Starting)

- [ ] Session directory created (`.harness/sessions/<date>-<goal>/`)
- [ ] GOAL.md written (what, why, how — 2-3 paragraphs)
- [ ] STATE.md is current (test status, deployment info, etc.)
- [ ] MEMORY.md reviewed (any relevant lessons from past sessions?)

---

## Implementation Phase

- [ ] DISCUSSION.md written (considered options, decided approach)
- [ ] PLAN-001.md created (step-by-step, each step <1 hour)
- [ ] Code changes follow the plan
- [ ] TASKS.md updated with progress
- [ ] No secrets or credentials added to code/artifacts (see [SECURITY.md](SECURITY.md))
- [ ] Tests pass locally

---

## Verification Phase

- [ ] VERIFY.md written with actual evidence:
  - [ ] Test output (pass/fail counts)
  - [ ] Manual testing steps taken
  - [ ] Edge cases considered
  - [ ] Regression testing done
  - [ ] Performance impact checked (if relevant)
- [ ] No warnings or lint errors
- [ ] Code review done (self or peer)
- [ ] Documentation updated (if needed)

---

## Shipping Phase

- [ ] Git commit message is clear and links GOAL/PLAN
- [ ] PR/merge request created with summary
- [ ] All CI checks pass
- [ ] No merge conflicts
- [ ] Code review approved
- [ ] SHIP.md written (what was done, what wasn't, what's next)

---

## Memory Phase

- [ ] REMEMBER.md written (lessons learned)
  - [ ] What went well?
  - [ ] What was harder than expected?
  - [ ] What would you do differently next time?
  - [ ] Any gotchas or edge cases discovered?
- [ ] STATE.md updated with new facts
  - [ ] New code patterns introduced
  - [ ] New dependencies added
  - [ ] New env vars needed
  - [ ] Test coverage changes
- [ ] No secrets, credentials, or customer data in artifacts (see [SECURITY.md](SECURITY.md#artifact-content-restrictions))
- [ ] Session directory committed to version control

---

## Post-Session

- [ ] Next session can start fresh with full context ✓
- [ ] Team can understand what was done and why
- [ ] Lessons are preserved for future reference
- [ ] Code is production-ready

---

## Common Mistakes to Avoid

❌ **Skipped Planning**
→ Adds time, increases bugs. Planning saves time overall.

❌ **Weak Verification**
→ "Seems to work" is not evidence. Show test output.

❌ **No REMEMBER.md**
→ Same mistakes repeated in next session.

❌ **Secrets in Artifacts**
→ See [SECURITY.md](SECURITY.md#artifact-content-restrictions). Never commit API keys, tokens, passwords, or customer data to git.

❌ **Too Big Scope**
→ Feature should complete in <2 hours. If longer, split it.

❌ **Outdated STATE.md**
→ Next session won't have current context.

---

## Quick Check (Before Clicking "Merge")

```bash
# All required files exist?
ls -la .harness/sessions/<active-session>/
# Should show: GOAL.md, DISCUSSION.md, PLAN-*.md, TASKS.md, VERIFY.md

# No secrets?
grep -r "API_KEY\|PASSWORD\|TOKEN\|SECRET" .harness/sessions/<active-session>/
# Should return nothing

# REMEMBER.md written?
cat .harness/sessions/<active-session>/../REMEMBER.md
# Should show today's session

# Git is clean?
git status
# Should show only intended changes
```

---

**Save this checklist to your `.harness/` directory. Use it for every session.**
