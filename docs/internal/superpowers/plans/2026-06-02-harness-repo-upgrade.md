# Harness Repository Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the repository artifacts so the harness is practical for real agentic engineering work while staying markdown-first and runtime-light.

**Architecture:** Keep the repository document-centric and make `.harness/` the canonical host artifact layout. Commands, skills, workflows, patterns, templates, docs, and examples must reinforce the same operating model and safety rules.

**Tech Stack:** Markdown, GitHub Actions YAML, minimal Node.js validation.

---

### Task 1: Strengthen The Operating Contract

**Files:**
- Modify: `AGENTS.md`
- Create: `docs/internal/superpowers/specs/2026-06-02-harness-repo-upgrade-design.md`

- [ ] **Step 1: Rewrite the central contract**

Add explicit sections for agent role, artifact priority, command discipline, skill discipline, completion gate, safety rules, and memory discipline.

- [ ] **Step 2: Add non-negotiable safety language**

State that agents must not invent facts, must not code before goal and plan are clear, and must never persist secrets or private business data into memory artifacts.

### Task 2: Upgrade Operational Guides

**Files:**
- Modify: `commands/*.md`
- Modify: `skills/*/SKILL.md`
- Modify: `workflows/*.md`
- Modify: `patterns/*.md`

- [ ] **Step 1: Rewrite commands as runbooks**

Keep the validator headings and add artifact paths, stop conditions, failure modes, approval points, and notes where useful.

- [ ] **Step 2: Rewrite skills as compact reusable contracts**

Keep required headings and make each skill strict, bounded, and output-driven.

- [ ] **Step 3: Rewrite workflows and patterns**

Make each file usable as a practical guide for engineering work without adding runtime assumptions.

### Task 3: Upgrade Templates And Docs

**Files:**
- Modify: `templates/*.md`
- Modify: `docs/*.md`

- [ ] **Step 1: Rewrite templates for safe company use**

Add fillable sections, checklists, risk areas, and reminders not to store credentials, customer data, or private business data.

- [ ] **Step 2: Rewrite docs around the `.harness/` layout**

Explain concepts, architecture, command loop, artifact layout, quality gates, and staged roadmap.

### Task 4: Add Example, Ignore Rules, And CI

**Files:**
- Modify: `examples/demo-project/README.md`
- Create: `examples/demo-project/.harness/PROJECT.md`
- Create: `examples/demo-project/.harness/GOAL.md`
- Create: `examples/demo-project/.harness/PLAN.md`
- Create: `examples/demo-project/.harness/VERIFY.md`
- Create: `examples/demo-project/.harness/REMEMBER.md`
- Create: `.gitignore`
- Create: `.github/workflows/validate.yml`

- [ ] **Step 1: Add a concrete demo layout**

Show how a host repository would use `.harness/` with safe example artifacts.

- [ ] **Step 2: Add ignore and CI support**

Ignore local runtime residue and validate repository structure in GitHub Actions with `node bin/validate.js`.

### Task 5: Verify

**Files:**
- Modify: changed artifacts only if verification reveals issues

- [ ] **Step 1: Run validation**

Run: `node bin/validate.js`
Expected: `Harness validation passed. Checked 57 required files.`

- [ ] **Step 2: Review artifact coverage**

Check that the rewritten files cover `.harness/`, safety rules, approval points, and durable memory guidance consistently.
