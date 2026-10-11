---
name: scaffold
description: >-
  Bootstrap a brand-new (greenfield) project from zero — stack, structure,
  tooling, repo, and agent configuration/ wiring — with decisions recorded, ready for the
  lifecycle. Use before sk-init when there is no code yet. (Hard contract in this
  SKILL.md — MUST follow.)
metadata:
  kind: "domain"
  version: "0.1.0"
  tags: "bootstrap,greenfield"
  roles: "coder"
  compatible: "claude,cursor,codex,gemini"

---

# Scaffold (new project bootstrap)

## Shared preamble (do this first)

Memory + Thinking methods + **Readable writing**) before Purpose, Contract, or
steps. Do not skip it; do not reuse a cached `language`. Write so a teammate
understands on first pass — concrete paths/IDs, no filler, no method branding.

## Purpose

Turn an empty (or nearly empty) directory into a working project **skeleton** —
the greenfield counterpart to `sk-init` (which only reads an existing repo). It
picks a stack, lays out the structure, wires tooling (lint/format/test/CI),
initializes the repo and the `agent configuration/` workflow, records the stack decisions,
then hands off to the lifecycle for real features.

It **creates files** (unlike the read-only `sk-init`). It does **not** invent
requirements — direction comes from `DISCUSSION.md`/`BUSINESS_ANALYSIS.md` when
present, otherwise from focused questions.

## Step contract (mandatory — invoke = execute ALL steps)

This skill runs as a **sequential step workflow** (`the skill-local `steps/` directory`).
Invoking it **is** executing every step below, in order, one at a time.

| Rule | Requirement |
| --- | --- |
| Invoke | Read `steps/step-01-guard.md` immediately, finish it, then open the next step file. |
| Sequence | Finish each step, update the **progress checklist** in ``artifacts/<task-id>/PROGRESS.md`` with evidence, then read the next file. |
| No skipping | NEVER skip a step, never jump straight to the final artifact, never claim complete while any ledger row is `todo`/`blocked`. |
| Blocked | A `blocked` step stops the skill: ask (Confirm-first), resume from the earliest incomplete step. |

| Step | File | Output |
| --- | --- | --- |
| 01 | [step-01-guard.md](./steps/step-01-guard.md) | Greenfield guard + intent |
| 02 | [step-02-skeleton.md](./steps/step-02-skeleton.md) | Create the skeleton |
| 03 | [step-03-wire.md](./steps/step-03-wire.md) | Wire kit + work + ADRs |
| 04 | [step-04-self-check.md](./steps/step-04-self-check.md) | Self-check & handoff |

## Contract (mandatory)

This skill is a **hard contract**. Obey it before any other action. Do NOT treat as optional. Do NOT skip required artifacts.

| Field | Requirement |
|-------|-------------|
| Safety | Greenfield only — **never sk-scaffold over an existing project**; if manifests/source exist, stop and route to `sk-init`. Do NOT overwrite existing files without confirmation. Do NOT install dependencies or run project code unless the user approves (default: print the commands, don't run). Do NOT invent versions/secrets — use known-stable or ask, and mark assumptions. Respect the project branch settings.mode`. Prefer CI that encodes a stated checklist (Standardize before automate) — do not invent exotic workflows without a standard. |

### Greenfield guard (before writing anything)
  If it surfaces real manifests/source, this is **not** greenfield — stop and
  recommend `sk-init` (+ lifecycle) instead of scaffolding.
- If the directory is non-empty but has no project, list what is there and ask
  before writing.

### Required artifacts
- **Project skeleton** at the repo/target root (the deliverable):
  - Directory layout for the chosen architecture (monorepo `apps/`+`packages/`,
    or single package) with base entry points / a minimal runnable "hello".
  - Package/build manifests with real **scripts** (`build`, `test`, `lint`,
    `run`) sourced from the stack's conventions.
  - Tooling config: formatter, linter, test runner, and a CI workflow (reuse
    `sk-github-actions-templates` when applicable).
  - `README.md` (how to run), `.gitignore`, `.editorconfig`, `.env.example`.
- **`agent configuration/` kit:** ensure `settings.yaml` (from template). Do **not** store
  sessions/memory under `agent configuration/`.
- If the project documentation settings.enabled` — an initial wiki sk-scaffold (`sk-docs full` skeleton)
- **Stack ADRs:** one ADR per significant choice (language/framework, monorepo
  tool, package manager, test framework, CI) using the `sk-docs` ADR template.
- **`SCAFFOLD.md`** in the active session (see template): what was created,
  decisions, assumptions/gaps, and the exact next commands.

## Workflow (detailed mechanics — order enforced by the step files)

2. **Greenfield guard** (above). Stop/route to `sk-init` if not greenfield.
3. Resolve intent & stack: prefer `DISCUSSION.md`/`BUSINESS_ANALYSIS.md`; for
   anything unknown ask **focused** questions (≤3 at a time): project type,
   language/framework, monorepo vs single, package manager, test framework, CI,
   license. Record each decision as an ADR (do not silently default).
4. Choose the architecture skeleton (layout, layering, naming). Keep it minimal
   and idiomatic for the stack — no speculative structure.
5. Define the skeleton: directories, manifests, tooling configuration, CI,
   README/.gitignore/.editorconfig/.env.example, and a minimal runnable entry.
   Never write real secrets.
6. Respect the project branch setting: stay on the base branch when direct work
   is configured, or plan an initial work branch when checkout is configured.
   Hand off repository initialization details to `sk-init` and documentation work
   to `sk-docs`.
8. Write the stack ADRs and `SCAFFOLD.md` with created files, decisions,
   assumptions, and qualitative next steps. Do not embed executable command
   sequences in this skill.
   then the lifecycle (`sk-brainstorming`/`sk-planning`) for the first feature.

## Quality Standards

- [ ] Greenfield guard ran; existing projects are routed to `sk-init`, not scaffolded over.
- [ ] Stack/tooling choices are confirmed (from artifacts or user), each an ADR — not silently defaulted.
- [ ] Manifest scripts (build/test/lint/run) are real and sourced from the stack, not guessed.
- [ ] A minimal runnable entry exists; README states how to run it.
- [ ] No dependencies installed / code run without approval; no invented versions/secrets (assumptions marked).
- [ ] `SCAFFOLD.md` lists created files, decisions, gaps, and the exact next commands.
- [ ] Handoff names `sk-init` then the next lifecycle skill.

## Reference

## Limitations

- Does NOT design features or write business logic (that is the lifecycle).
- Does NOT replace `sk-init` — it precedes it for greenfield, then hands off.
- Does NOT install dependencies or deploy; it prepares and prints the commands.

## Output

Produce a reusable scaffold artifact with the selected approach, relevant files or evidence, verification results, limitations or risks, and next steps.

## Boundary


**`sk-scaffold`** owns initial project or module structure: create the smallest file layout, configuration skeleton, interfaces, and documented placeholders needed to begin implementation.

It does **not** own product requirements, architecture trade-offs, feature implementation, test execution, or release verification. Route architecture to the relevant architecture skill, requirements to `sk-specify`, implementation to the stack skill, and structural checks to `sk-tester`/`sk-verify-pro`.

**Primary artifact:** a minimal scaffold inventory with generated paths, configuration assumptions, and explicit TODOs. **Handoff:** pass the scaffold and assumptions to `sk-planning` or the implementation owner for feature work.

## Required inputs

- request, objective, constraints, current artifact, stakeholders, acceptance criteria, and desired output.
- State assumptions explicitly when context, ownership, or evidence is incomplete.

## Cross-skill handoffs

- sk-planning or sk-executing-pro for lifecycle orchestration; sk-specify or BA skills for requirements artifacts; sk-review for quality findings; sk-verify-pro for canonical claim-to-evidence decisions.
