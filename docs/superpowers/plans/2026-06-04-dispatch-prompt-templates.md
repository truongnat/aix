# Dispatch Prompt Templates Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add execution-facing dispatch prompt templates for guarded harness commands and wire them into cache export, runtime command routing, validation, tests, docs, and the landing page.

**Architecture:** Keep `commands/*.md` as reference contracts and introduce `prompt-templates/*.md` as execution contracts. Installed runtime command files should direct agents through activation plus the matching prompt template so blocked output becomes a first-class branch instead of an implied behavior.

**Tech Stack:** Node.js CommonJS, shell installer/runtime catalog, markdown docs/templates, React + TypeScript site, custom test runner.

---

### Task 1: Add Failing Repository And Install-Surface Tests

**Files:**
- Modify: `test/run-tests.js`
- Read: `lib/validate.js`
- Read: `lib/runtime-command-catalog.js`

- [ ] **Step 1: Write failing tests for prompt template repository contract**

Add tests that assert:
- `prompt-templates/` exists
- required files exist:
  - `prompt-templates/harness-plan.md`
  - `prompt-templates/harness-run.md`
  - `prompt-templates/harness-verify.md`
  - `prompt-templates/harness-ship.md`
  - `prompt-templates/blocker-question.md`
  - `prompt-templates/code-reviewer.md`
- each template contains:
  - `## Purpose`
  - `## Prompt`
  - `## Placeholders`
  - `## Returns`
  - `## Critical Rules`
- run/verify/ship templates contain `### Blocked`
- blocker-question template contains stop-after-asking wording

- [ ] **Step 2: Write failing tests for command/runtime/cache wiring**

Add tests that assert:
- `commands/harness-plan.md`, `commands/harness-run.md`, `commands/harness-verify.md`, and `commands/harness-ship.md` contain `## Dispatch Template`
- runtime-generated `harness-plan.md`, `harness-run.md`, `harness-verify.md`, and `harness-ship.md` reference `.ai-harness/prompt-templates/<name>.md`
- installed cache contains `.ai-harness/prompt-templates/`
- docs include `docs/dispatch-prompt-templates.md`

- [ ] **Step 3: Run targeted tests to confirm red**

Run: `npm test`
Expected: FAIL on missing prompt template files and missing dispatch-template/runtime wiring assertions.

### Task 2: Create Prompt Template Surface

**Files:**
- Create: `prompt-templates/harness-plan.md`
- Create: `prompt-templates/harness-run.md`
- Create: `prompt-templates/harness-verify.md`
- Create: `prompt-templates/harness-ship.md`
- Create: `prompt-templates/blocker-question.md`
- Create: `prompt-templates/code-reviewer.md`

- [ ] **Step 1: Create `harness-plan` template**

Include:
- use case
- purpose
- prompt block with role, current command, required inputs, gate checks, blocking conditions, `### Blocked`, `### Plan Result`, and critical rules

- [ ] **Step 2: Create `harness-run`, `harness-verify`, and `harness-ship` templates**

Ensure blocked rules exactly cover the approved spec:
- run blocks on missing/unapproved plan, unclear acceptance criteria, unresolved `.harness/BLOCKED.md`
- verify blocks on unknown verification command, non-inspectable implementation, unclear acceptance criteria, manual review, or failing command needing judgment
- ship blocks on missing/pending/blocked/unevidenced `VERIFY.md` or unaccepted known gaps

- [ ] **Step 3: Create `blocker-question` and `code-reviewer` templates**

Ensure:
- blocker-question asks minimum questions and forbids continuing
- code-reviewer includes What Was Implemented, Requirements / Plan, Git Range to Review, What to Check, Calibration, Output Format, Critical Rules

- [ ] **Step 4: Re-run tests to move from missing-file failures toward wiring failures**

Run: `npm test`
Expected: fewer failures; missing-file assertions pass, remaining failures point at wiring and validation.

### Task 3: Wire Prompt Templates Into Export, Cache, Runtime Commands, And Validation

**Files:**
- Modify: `lib/install-legacy.js`
- Modify: `lib/install-cache.js`
- Modify: `lib/runtime-command-catalog.js`
- Modify: `lib/validate.js`
- Modify: `README.md`

- [ ] **Step 1: Export `prompt-templates/` through install surfaces**

Update the relevant export/install lists so project installs copy `prompt-templates/` into `.ai-harness/prompt-templates/`.

- [ ] **Step 2: Update runtime command generation**

For generated runtime command files of:
- `harness-plan`
- `harness-run`
- `harness-verify`
- `harness-ship`

add explicit guidance:
1. read `.ai-harness/activation.md`
2. read the matching prompt template
3. fill placeholders from local artifacts
4. follow the output branch exactly

- [ ] **Step 3: Extend repository validation**

Require:
- `prompt-templates/` docs exist in repo
- required headings inside each template
- `### Blocked` for run/verify/ship templates
- explicit stop-after-asking wording in blocker-question
- `## Dispatch Template` in the four major command docs

- [ ] **Step 4: Run targeted tests and validation**

Run:
- `node validate.js`
- `npm test`

Expected: repository contract and runtime/catalog tests pass.

### Task 4: Update Command Docs, Supporting Docs, And Site Reinforcement

**Files:**
- Modify: `commands/harness-plan.md`
- Modify: `commands/harness-run.md`
- Modify: `commands/harness-verify.md`
- Modify: `commands/harness-ship.md`
- Create: `docs/dispatch-prompt-templates.md`
- Modify: `README.md`
- Modify: `site/src/App.tsx`
- Create or Modify: `site/src/components/<dispatch-template-section>.tsx`

- [ ] **Step 1: Add `## Dispatch Template` sections to command docs**

Each section should:
- point to the corresponding prompt template
- explain command doc vs prompt template responsibility
- tell agents not to execute freestyle

- [ ] **Step 2: Add concise public docs**

Create `docs/dispatch-prompt-templates.md` covering:
- why templates exist
- command docs vs prompt templates
- blocked output branch
- safe agent usage

Update README links if needed.

- [ ] **Step 3: Add a small landing-page reinforcement block**

Add a minimal section/card that explains:
- reference docs
- execution templates
- blocked output as a valid branch

Do not redesign existing sections.

- [ ] **Step 4: Run site build**

Run: `cd site && npm run build`
Expected: PASS with the new section integrated.

### Task 5: Full Verification

**Files:**
- Verify only

- [ ] **Step 1: Run repository install/test/validate commands**

Run:
- `npm ci`
- `node validate.js`
- `npm test`

Expected: PASS

- [ ] **Step 2: Run dogfood example verification**

Run:
- `cd examples/dogfood-tiny-node-api && npm test`

Expected: PASS

- [ ] **Step 3: Run site verification**

Run:
- `cd site && npm ci`
- `cd site && npm run build`

Expected: PASS

- [ ] **Step 4: Summarize verification notes**

Record any non-blocking warnings exactly, especially npm config warnings or environment-only deprecation noise, without overstating risk.
