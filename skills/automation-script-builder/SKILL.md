---
name: automation-script-builder
description: "Turn a manual test scenario into a working automation script (Playwright or Selenium) with line-by-line explanations for beginners. Use when a tester wants to automate a repeated regression flow, or wants to learn automation through a concrete real example instead of theory-first."
metadata:
  kind: "domain"
  version: "0.2.0"
  tags: "qa,automation,playwright,selenium"
---

# Automation Script Builder

## Timestamp and artifact convention
As soon as this skill starts, capture the current timestamp in the user's/project's timezone, formatted `YYYY-MM-DD HH:mm:ss Z`.

If script files are created, store them under:

```text
artifacts/YYYY-MM-DD/automation-script-builder/HHmmss-flow-slug/
```

Every artifact must record `Session timestamp`, the source test case, the script, how to run it, dependencies, and items needing user/dev confirmation. All main chat output must also show `Session timestamp`.

## Goal
Convert an existing manual test case (or a plain-language flow description) into a runnable automation script — and explain it so a tester learning automation understands WHY each part is written that way, not just receives code to copy.

## Process

### Step 1 — Gather input
Input can be a specific test case (e.g. produced by `testcase-generator`) or a free-text flow description.

If technical details are missing, ask — but only what changes the script:
- **Selector stability**: does the app expose `id`/`data-testid`/stable roles, or only fragile classes/text? This decides the whole locator strategy.
- **Tool**: Playwright or Selenium? If the user has no preference and no legacy constraints, default to **Playwright** (modern API, auto-waiting, less boilerplate — easier to learn).
- **Language**: JavaScript/TypeScript or Python — ask which the user is more comfortable with.
- **Test data**: where does it come from, does anything need cleanup after the run?
- **The single most important assertion**: what proves the test passed? (URL change? element text? record created?)
- **Environment**: target URL, login needed, test account available?

### Step 2 — Write the script with a clear structure
Always separate three blocks: **Setup** (open page, preconditions) → **Action** (the main interaction steps) → **Assertion** (verify the expected result). Never write a script that clicks through steps with no real assertion at the end.

### Step 3 — Explain alongside the code, not after it
For each code block, put a short explanatory comment directly above the line — explain intent, don't translate keywords. Prefer the language the user communicates in for comments.

```javascript
// Wait until the login button is rendered before interacting —
// acting too early is the #1 cause of flaky tests.
await page.getByRole('button', { name: 'Log in' }).click();

// Web-first assertion: Playwright retries until the URL matches
// or times out — no manual sleep needed.
await expect(page).toHaveURL(/.*\/home/);
```

### Step 4 — Deliver a complete file + summary
After the code, give a 2–3 sentence summary: what the script does, the exact command to run it, what must be installed/configured first (e.g. `npm i -D @playwright/test && npx playwright install`), and `Session timestamp`.

Example minimal Playwright project kickoff to include when relevant:

```bash
npm init -y
npm i -D @playwright/test
npx playwright install chromium
npx playwright test login.spec.js --headed
```

## Rules for beginner-friendly automation
- **Selector priority** (best → worst): `data-testid`/`data-test` attribute → accessible role + name → label text → stable `id` → text content → CSS class → long XPath. Avoid dynamic classes (`css-1x2y3z`), positional selectors (`div:nth-child(7)`), and full-page XPaths whenever a better option exists — explain the trade-off when you pick a fragile one.
- Use **web-first assertions** and state-based waits (`waitForSelector`, `expect(...).toBeVisible()`), never fixed `sleep`/`waitForTimeout` — if you must use one as a temporary workaround, comment explicitly that it is a workaround and why.
- Every script needs at least one real assertion of an outcome, not just "no exception thrown."
- If the script creates data, include setup/cleanup or state clearly what data must exist beforehand.
- Flag **flakiness risks** honestly: slow network, animations, email/SMS OTP, captcha, shared test data, time-dependent logic.
- Do not use unexplained jargon: if you write `fixture`, `hook`, or `page object`, add a one-line plain explanation of what it means here.
- Prefer simple readable code over clever compact code. If a "nicer" version exists but is harder to read, offer it at the end as an advanced alternative — never replace the readable version with it.
- When the user asks "why did you write it like this", always give the concrete reason — never "because that's the standard way."

## Scope limit
The assistant usually cannot execute the script on the user's machine (unless a suitable MCP/Computer Use connection exists). This skill focuses on WRITING and EXPLAINING the script; the user runs it in their own environment. State this explicitly unless a working execution path has been confirmed.
