# Enforcement Upgrades Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the harness from contract-rich documentation toward stronger enforcement by hardening verification schema, adding typed memory artifacts, and extending doctor with workflow-validity checks.

**Architecture:** Keep the existing markdown-first model, but tighten it through validator-backed contracts, stricter templates, and install/runtime checks. Favor additive compatibility where possible so current target repos and docs keep working while new enforcement paths become available.

**Tech Stack:** Node.js validation/test harness, shell installer/runtime (`aih.sh`), markdown templates/docs

---

### Task 1: Harden Verification Contract

**Files:**
- Modify: `templates/VERIFY.md`
- Modify: `validate.js`
- Modify: `test/run-tests.js`
- Modify: `examples/dogfood-tiny-node-api/.harness/VERIFY.md` if needed

- [ ] Add a stricter `VERIFY.md` shape with explicit verdict/freshness/evidence-bearing checks while preserving markdown readability.
- [ ] Update validator rules to enforce the stronger contract on the template and dogfood example.
- [ ] Add or update tests that fail on weak verification structure and pass on the new schema.

### Task 2: Add Typed Memory Artifacts

**Files:**
- Create: `templates/DECISIONS.md`
- Create: `templates/HAZARDS.md`
- Create: `templates/INDEX.md`
- Modify: `AGENTS.md`
- Modify: `docs/artifact-layout.md`
- Modify: `docs/memory-model.md`
- Modify: `commands/harness-map.md`
- Modify: `commands/harness-discuss.md`
- Modify: `commands/harness-plan.md`
- Modify: `commands/harness-verify.md`
- Modify: `commands/harness-remember.md`
- Modify: `aih.sh`
- Modify: `validate.js`
- Modify: `test/run-tests.js`

- [ ] Add typed project-memory templates for decisions, hazards, and reusable command/index guidance.
- [ ] Update docs and command read sets so hazard recall becomes a first-class workflow behavior.
- [ ] Extend `.harness/` init and validation so typed memory artifacts are scaffolded and structurally checked.

### Task 3: Extend Doctor with Workflow Validity

**Files:**
- Modify: `aih.sh`
- Modify: `commands/harness-doctor.md`
- Modify: `validate.js` only if shared helper extraction is useful
- Modify: `test/run-tests.js`
- Modify: docs that describe `doctor` behavior if needed

- [ ] Add doctor checks for workflow validity, not just install health.
- [ ] Report concrete PASS/WARN/FAIL for missing approval state, weak verification evidence, and missing typed memory artifacts where applicable.
- [ ] Add tests that demonstrate both healthy and failing doctor output.

### Task 4: Integration and Compatibility Pass

**Files:**
- Modify: any touched docs/examples/fixtures required to keep the repo coherent

- [ ] Reconcile overlaps between validator, doctor, templates, fixtures, and examples.
- [ ] Keep existing target-profile compatibility unless an explicit contract migration is required.
- [ ] Update release-facing docs only where behavior materially changed.

### Task 5: Verification

**Files:**
- No planned source edits unless verification exposes regressions

- [ ] Run `node validate.js`
- [ ] Run `npm test`
- [ ] If target-fixture behavior changed, run focused validation commands against affected fixtures as needed
- [ ] Fix any regressions before claiming completion
