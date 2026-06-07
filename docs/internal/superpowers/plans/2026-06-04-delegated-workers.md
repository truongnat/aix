# Delegated Workers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a strict harness-level delegated worker contract that works across providers, with Claude as the first native adapter and Cursor/Codex following through adapter-level integration.

**Architecture:** Add a canonical `workers/` core owned by the harness, keep provider execution behind adapters, require a shared `Agent Result` envelope plus `WORKER_RUN.md` lifecycle artifact, and integrate worker results into command flows without coupling the harness core to provider-specific subagent semantics.

**Tech Stack:** Node.js CommonJS, markdown-first repository contracts, runtime installer/catalog logic, custom validation framework, custom test runner.

---

### Task 1: Add Failing Core Contract Tests And Validation Expectations

**Files:**
- Modify: `test/run-tests.js`
- Read: `lib/validate/constants.js`
- Read: `lib/validate/contracts.js`
- Read: `lib/validate/registry.js`

- [ ] **Step 1: Add failing tests for worker repository surface**

Add tests that assert:
- `workers/registry.js` exists
- the canonical worker files exist:
  - `workers/reviewer.md`
  - `workers/verifier.md`
  - `workers/gatekeeper.md`
  - `workers/fixer.md`
- `templates/WORKER_RUN.md` exists

- [ ] **Step 2: Add failing tests for worker contract content**

Add tests that assert:
- each worker definition has frontmatter
- frontmatter includes:
  - `id`
  - `role`
  - `mode`
  - `writeAccess`
  - `canDispatch`
  - `requiredInputs`
  - `resultSchema`
  - `providerSupport`
- every worker definition includes the shared `### Agent Result` envelope
- all v1 workers set `canDispatch: false`
- `reviewer`, `verifier`, and `gatekeeper` are not write-enabled
- `fixer` is explicitly write-enabled

- [ ] **Step 3: Add failing tests for provider support and docs expectations**

Add assertions that:
- provider support values are limited to `native`, `adapter`, `fallback`, or `unsupported`
- Claude worker adapter docs are present once introduced
- command surfaces that consume worker results reference the worker contract when applicable

- [ ] **Step 4: Run tests to confirm red**

Run: `npm test`
Expected: FAIL on missing worker files, template, and validation assertions.

### Task 2: Create Canonical Worker Surface

**Files:**
- Create: `workers/registry.js`
- Create: `workers/reviewer.md`
- Create: `workers/verifier.md`
- Create: `workers/gatekeeper.md`
- Create: `workers/fixer.md`
- Create: `templates/WORKER_RUN.md`

- [ ] **Step 1: Create the worker registry**

Implement canonical worker metadata with:
- `id`
- `role`
- `mode`
- `writeAccess`
- `canDispatch`
- `requiredInputs`
- `resultSchema`
- `providerSupport`
- `definitionPath`

Set support levels honestly:
- Claude first
- Cursor and Codex as adapter-level targets
- other runtimes only where the contract can be supported honestly

- [ ] **Step 2: Create worker definition files**

For each worker:
- add frontmatter that matches registry data
- define role, responsibilities, forbidden actions, and required checks
- require the shared `Agent Result` envelope
- add worker-specific sections:
  - reviewer: strengths, issues, assessment
  - verifier: checks run, exit codes, evidence, known gaps
  - gatekeeper: decision, blocking reason
  - fixer: changes made, risks, follow-up verification

- [ ] **Step 3: Create the worker lifecycle template**

Add `templates/WORKER_RUN.md` with:
- metadata
- task
- result envelope
- full result
- main agent decision
- next allowed command

- [ ] **Step 4: Re-run tests**

Run: `npm test`
Expected: repository-surface failures move from missing files to wiring/validation gaps.

### Task 3: Extend Validation And Repository Contracts

**Files:**
- Modify: `lib/validate/constants.js`
- Modify: `lib/validate/contracts.js`
- Modify: `lib/validate/registry.js`
- Modify: `lib/validate/utils.js`
- Modify: `validate.js` if public entrypoint coverage needs extension

- [ ] **Step 1: Add worker files and template to required repository surfaces**

Update validation constants and required-path checks so worker artifacts are part of the repository contract.

- [ ] **Step 2: Add worker contract validators**

Require:
- registry presence
- canonical worker entries
- matching `workers/<id>.md` files
- frontmatter structure and metadata consistency
- `### Agent Result` envelope presence
- `canDispatch: false` for all v1 workers
- explicit write-access declarations
- valid provider support values

- [ ] **Step 3: Add Claude-native validation hooks**

When validating Claude-native support, require the generated or installed `.claude/agents/*.md` surface for supported workers.

- [ ] **Step 4: Run validation and tests**

Run:
- `node bin/validate.js`
- `npm test`

Expected: core worker contract validation passes once repository surface is complete.

### Task 4: Add Claude Native Adapter

**Files:**
- Create or Modify: Claude-specific runtime/export surfaces under `runtime/claude/` as needed
- Modify: `lib/install-runtime.js`
- Modify: `lib/runtime-command-catalog.js`
- Modify: any installer/export helpers that govern Claude project install

- [ ] **Step 1: Define Claude render target**

Render supported workers to:
- `.claude/agents/reviewer.md`
- `.claude/agents/verifier.md`
- `.claude/agents/gatekeeper.md`
- `.claude/agents/fixer.md`

Adjust naming only if a harness prefix is required consistently across worker ids and docs.

- [ ] **Step 2: Preserve canonical worker contract during render**

Ensure Claude-native worker files:
- preserve canonical worker identity
- preserve no-nested-dispatch rule
- preserve shared `Agent Result` envelope
- reflect correct tool/write boundaries per worker

- [ ] **Step 3: Update Claude install and runtime docs**

Document:
- Claude as `native` support
- `.claude/agents/*.md` as the execution surface
- lifecycle and envelope still owned by harness

- [ ] **Step 4: Run targeted verification**

Run:
- `node bin/validate.js`
- `npm test`

Expected: Claude worker surface is generated or validated correctly without breaking existing Claude runtime behavior.

### Task 5: Add Cursor And Codex Adapter-Level Integration

**Files:**
- Modify: provider docs under `docs/runtimes/`
- Modify: runtime command or adapter docs where Cursor/Codex execution guidance lives
- Modify: any prompt-template or command docs needed to describe adapter-level worker execution

- [ ] **Step 1: Define Cursor adapter behavior**

Document and wire how Cursor can execute workers through controlled delegation patterns while preserving:
- worker ids
- required inputs
- shared envelope
- lifecycle artifact

Do not overclaim Cursor native worker support unless a true native surface exists.

- [ ] **Step 2: Define Codex adapter behavior**

Document and wire how Codex can execute workers through its repo-local instruction and prompt surfaces while preserving the same worker contract.

- [ ] **Step 3: Add support-level documentation**

Make support levels explicit in docs:
- `native`
- `adapter`
- `fallback`
- `unsupported`

Keep provider claims honest and specific.

### Task 6: Integrate Worker Results Into Command Flows

**Files:**
- Modify: `commands/harness-run.md`
- Modify: `commands/harness-verify.md`
- Modify: `commands/harness-ship.md`
- Modify: matching files under `prompt-templates/` if worker consumption needs execution guidance
- Modify: supporting docs where command behavior is described

- [ ] **Step 1: Update verify flow**

Teach `harness-verify` to consume delegated worker outputs from:
- `reviewer`
- `verifier`

without assuming provider-specific conversation transcripts.

- [ ] **Step 2: Update ship flow**

Teach `harness-ship` to consume delegated worker output from:
- `gatekeeper`

and use the result envelope plus lifecycle artifact as evidence.

- [ ] **Step 3: Add bounded fixer guidance**

Allow `harness-run` to dispatch `fixer` only in bounded remediation cases, and keep main-agent orchestration explicit.

### Task 7: Docs And Public Contract Updates

**Files:**
- Create: `docs/delegated-workers.md`
- Modify: `README.md`
- Modify: `docs/runtime-command-surface.md`
- Modify: `docs/runtimes/claude-code.md`
- Modify: `docs/runtimes/cursor.md`
- Modify: `docs/runtimes/codex.md`

- [ ] **Step 1: Add a concise delegated workers doc**

Document:
- what workers are
- why they exist
- one-shot semantics
- main-agent-only dispatch
- result envelope
- lifecycle artifact
- support levels

- [ ] **Step 2: Update runtime docs**

Clarify:
- Claude is the first native adapter
- Cursor and Codex are adapter-level targets in v1
- provider support must not be overstated

- [ ] **Step 3: Update overview docs if needed**

Add only enough to explain the new core contract without turning README into a deep design doc.

### Task 8: Full Verification

**Files:**
- Verify only

- [ ] **Step 1: Run repository verification**

Run:
- `npm ci`
- `node bin/validate.js`
- `npm test`

Expected: PASS

- [ ] **Step 2: Run example verification**

Run:
- `cd examples/dogfood-tiny-node-api && npm test`

Expected: PASS

- [ ] **Step 3: Run site verification**

Run:
- `cd site && npm ci`
- `cd site && npm run build`

Expected: PASS

- [ ] **Step 4: Record not-run or provider-proof gaps honestly**

If Cursor or Codex adapter behavior remains documentation-only in this pass, record that explicitly instead of implying native proof.

## Rollback Considerations

- Keep worker integration additive during the first pass.
- Do not remove existing provider runtime surfaces until worker-aware replacements are validated.
- Do not claim `native` support for any provider without concrete installed-surface proof.
- Preserve current command behavior where worker integration is not yet complete.

## Approval Status

status: approved
approved_by: user
approved_at: 2026-06-04
notes: User approved the delegated workers design and asked to start with Claude priority, then Cursor and Codex.
