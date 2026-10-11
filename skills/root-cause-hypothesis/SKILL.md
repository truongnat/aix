---
name: root-cause-hypothesis
description: "Build root-cause hypotheses for intermittent or hard-to-reproduce bugs. Use when a tester needs to narrow down causes before reporting to dev — systematically analyzing environment, data, timing, role, actions, network, browser, API, logs, and reproduction patterns, with a concrete verification step per hypothesis."
metadata:
  kind: "domain"
  version: "0.2.0"
  tags: "qa,debugging,root-cause,hypothesis"
---

# Root Cause Hypothesis

## Timestamp and artifact convention
As soon as this skill starts, capture the current timestamp in the user's/project's timezone, formatted `YYYY-MM-DD HH:mm:ss Z`.

If analysis files are created, store them under:

```text
artifacts/YYYY-MM-DD/root-cause-hypothesis/HHmmss-short-issue/
```

Every artifact must record `Session timestamp`, the symptom, evidence, hypotheses, verification questions, and next actions.

## Goal
Reduce "returned: cannot reproduce" outcomes by making the tester reason systematically about WHAT differs between when the bug occurs and when it doesn't — before handing anything to devs.

## Process

### Step 1 — Gather what's actually known
Establish the facts, not assumptions:
- Symptom and **frequency** — "sometimes" is a starting point; push for "3 times in ~20 attempts today, always on the second try" if the user can say.
- Environment, build, browser/device, account/role — and crucially: which envs does it NOT happen on?
- Test data and data state at failure time.
- The exact action sequence immediately before failure.
- Console/network/log/screenshot/video if any exist — an intermittent bug with ONE captured log beats ten hypotheses.
- Time pattern: morning-only? after long idle? only under load? Time correlation is one of the strongest signals for intermittent bugs.

### Step 2 — Classify hypotheses
Generate candidates across these families — the differentiator is "what's different when it fails":

- **Data-specific**: only with certain data/state — long values, empty relations, migrated records, special characters, expired entities.
- **Environment-specific**: only one browser/device/build/env; only staging, only production (config difference!).
- **Timing/concurrency**: double-click, quick reload, back-button, race between two async calls, timeout boundary, operation while another job runs.
- **Permission/session**: expired token mid-action, role changed, two tabs with different sessions, SSO refresh.
- **Integration**: downstream API fails slowly/silently, queue/job hasn't processed yet, third-party degraded.
- **UI state**: stale cache, component not refreshed, optimistic update that a late response overwrote, state surviving a route change.

Each hypothesis must answer: "this explains the intermittency because…" — a hypothesis that predicts the bug would happen EVERY time is probably wrong for an intermittent bug.

### Step 3 — Attach a concrete verification to each
Never ship a bare guess. Every hypothesis gets a discriminating check:
- "Happens only for records with empty `tags`" → verify: reproduce once with empty tags, once with tags filled.
- "Race between save and status-poll" → verify: throttle network to 3G, retry; check if failure correlates with slower responses.
- "Token expiry" → verify: check token timestamps vs failure time in logs; wait past expiry and retry the exact action.

## Output format

```text
Session timestamp: [YYYY-MM-DD HH:mm:ss Z]
Symptom: [bug description]
Frequency observed: [e.g. ~1 in 5 attempts, always on mobile]

| Hypothesis | Supporting signs | Counter-signs | How to verify | Priority |
|---|---|---|---|---|
| Race: status polled before save commits | Fails only on slow network | Also failed once on wifi | Throttle network, retry 10× | High |

Next actions:
1. [...]
2. [...]
3. [...]

Info to gather before reporting to dev:
- [...]
```

## Notes and anti-patterns
- Never declare a root cause without strong evidence — deliver ranked hypotheses with confidence, not a verdict.
- "Cannot reproduce" is a data point, not an endpoint: record WHAT was tried — which env, which data, how many attempts.
- Do not anchor on the first plausible story; generate at least 3 hypotheses across DIFFERENT families before ranking.
- Results feed naturally into `bug-report-writer` (a hypothesis column strengthens the report) or `browser-investigator` (to capture the verification evidence).
