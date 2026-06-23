# Response Contract

Standard response formats for ai-engineering-harness commands. The system prompt in `SYSTEM_PROMPT.md` is always in effect; these formats extend it.

---

## A. Session Start response

```md
# Session Start

## Status

status: ready | blocked | needs-routing | no-session

## Active Session

...

## Current Phase

...

## Loaded Memory

- ...

## Blocked State

blocked: false
blocked_file:

## Next Allowed Command

`harness-...`

## Question

Only if needed.
```

---

## B. Blocked response

```md
### Blocked

**Command:** `harness-run`

**Reason:** PLAN-001.md is not approved.

**Missing Preconditions:**
- Approval Status must be `approved`.

**Questions:**
1. Do you approve the current plan for implementation?

**Next allowed action:**
Run `harness-plan` or approve the current plan.

**Stopped:**
No implementation was performed.
```

**REQUIRED:** Do not continue after this block.

---

## C. Implementation response

```md
### Result

Implemented the approved plan scope.

### Files Changed

| File | Change | Why |
|---|---|---|

### Tasks Updated

- [x] ...

### Evidence

Implementation only. Verification still required.

### Next Command

`harness-verify`
```

---

## D. Verification response

```md
### Verification

**Status:** passed | failed | blocked

| Command | Exit Code | Result | Notes |
|---|---:|---|---|

### Evidence

- ...

### Known Gaps

- ...

### Next Command

`harness-ship` or `harness-run`
```

---

## E. Ship / report response

```md
### Ship Report

**Status:** ready-for-pr | blocked | shipped-with-gaps

### Summary

...

### What Changed

...

### Why

...

### Verification

...

### PR Message

...

### Risks / Rollback

...

### Next Command

`harness-remember`
```

---

## F. Discussion response

Use during `harness-discuss` when user input is needed to continue shaping the goal. This is **not** a hard block.

```md
### Discussion

**Status:** discussing | ready-for-plan

**Context:**
- What is already known from artifacts

**Decision:**
[One sentence]

**Scored options:**

| Option | Summary | Value | Effort fit | Risk | Fit | Total |
|--------|---------|------:|-----------:|-----:|----:|------:|
| A | … | | | | | |
| B | … | | | | | |
| C | … | | | | | |

**Recommendation:**
Option [X] (total [N]) — why

**User choice:**
[Use AskQuestion with 3 options: `A: … (N/20)`, `B: …`, `C: …`]

**Next step after answer:**
Continue discuss (update DISCUSSION.md) or run `harness-plan` when ready.
```

**REQUIRED:** After the user answers, continue the discuss workflow. Do not treat this like `### Blocked`.

---

## G. Review response

```md
### Strengths

- ...

### Issues

#### Critical

#### Important

#### Minor

### Recommendations

- ...

### Assessment

**Ready to merge:** Yes | No | With fixes

**Reasoning:** ...
```
