---
title: Dispatch Prompt Templates Design
date: 2026-06-04
status: approved
---

# Dispatch Prompt Templates Design

## Goal

Upgrade major harness commands from "reference contracts only" into a two-layer model:

- command docs remain operator-facing reference and phase policy
- prompt templates become execution-facing dispatch instructions with explicit blocked and ready branches

The target outcome is that agents no longer need to infer how to execute `harness-plan`, `harness-run`, `harness-verify`, or `harness-ship` from prose alone. They should receive a structured template with role, inputs, gate checks, blocking conditions, output formats, and critical rules.

## Problem

The repository now has stronger phase guards, blocking-question rules, and workflow visualization, but the execution surface is still mostly document-contract driven.

That leaves a real gap:

- agents can still "freestyle" a command after reading docs
- blocked behavior is described, but not presented as a first-class output branch
- critical commands do not yet provide a uniform prompt shape
- runtime command files tell agents where to look, but not exactly how to execute

This is the difference between:

- "the docs say you should stop"
- "the template gives Blocked as a valid output and forbids continuing"

## Design Decision

Add a new repository surface: `prompt-templates/`.

This surface is part of the installed `.ai-harness/` capability cache and acts as the execution layer for guarded commands.

The system becomes:

1. `commands/*.md`
   Reference contracts:
   - purpose
   - minimum read set
   - preconditions
   - redirect behavior
   - blocking questions
   - completion gate

2. `prompt-templates/*.md`
   Execution contracts:
   - use case
   - role
   - required inputs
   - gate checks
   - blocking conditions
   - blocked output format
   - ready/success output format
   - critical rules

3. runtime command files in `.ai-harness/runtime-commands/`
   Dispatch stubs:
   - read `.ai-harness/activation.md`
   - read matching prompt template
   - fill placeholders from local artifacts
   - follow the output branch exactly

## Scope

- create `prompt-templates/` at repository root
- add templates for:
  - `harness-plan`
  - `harness-run`
  - `harness-verify`
  - `harness-ship`
  - `blocker-question`
  - `code-reviewer`
- export `prompt-templates/` into installed `.ai-harness/`
- wire runtime command catalog so major commands reference matching prompt templates
- update command docs with `## Dispatch Template`
- add validation and tests for the new template surface
- add concise docs explaining command docs vs prompt templates
- add a small site section explaining guarded execution via blocked/ready output branches

## Non-Goals

- no new providers
- no fake native slash support
- no telemetry
- no replacement of all docs with giant templates
- no runtime orchestration engine
- no attempt to template every command in this pass

## Template Inventory

### `prompt-templates/harness-plan.md`

Purpose:
- turn goal and discussion context into an execution-ready plan
- stop if goal, scope, or verification expectations are still unclear

Required blocked cases:
- missing current goal
- unresolved scope ambiguity
- verification strategy cannot be named
- approval ownership is unclear

Outputs:
- `### Blocked`
- `### Plan Result`

### `prompt-templates/harness-run.md`

Purpose:
- execute an approved plan without scope drift

Required blocked cases:
- `PLAN.md` missing
- approval status not `approved`
- acceptance criteria unclear
- `.harness/BLOCKED.md` unresolved

Outputs:
- `### Blocked`
- `### Execution Result`

### `prompt-templates/harness-verify.md`

Purpose:
- verify implemented work with evidence, not confidence

Required blocked cases:
- verification command unknown
- implementation cannot be inspected
- acceptance criteria unclear
- manual review required
- failing command requires user judgment

Outputs:
- `### Blocked`
- `### Verification`

### `prompt-templates/harness-ship.md`

Purpose:
- prepare ship summary only when evidence supports it

Required blocked cases:
- `VERIFY.md` missing
- `VERIFY.md` status is `pending`
- `VERIFY.md` status is `blocked`
- `VERIFY.md` lacks real evidence
- known gaps require user acceptance

Outputs:
- `### Blocked`
- `### Ship Summary`

### `prompt-templates/blocker-question.md`

Purpose:
- ask the minimum question required to unblock the workflow

Required behavior:
- prefer yes/no or multiple choice
- ask at most the minimum required questions
- stop after asking
- forbid implementation, verification, and shipping

Outputs:
- `### Blocked`

### `prompt-templates/code-reviewer.md`

Purpose:
- standardize review prompts around requirements, diff scope, calibration, and findings

Required sections inside the prompt:
- What Was Implemented
- Requirements / Plan
- Git Range to Review
- What to Check
- Calibration
- Output Format
- Critical Rules

Outputs:
- `### Review Findings`

## Template Structure Contract

Every prompt template must contain:

- title
- `## Use Case`
- `## Purpose`
- `## Prompt`
- `## Placeholders`
- `## Returns`
- `## Critical Rules`

Inside `## Prompt`, each template must include:

- role
- current command
- required inputs
- required checks or gates
- blocking conditions
- blocked output format
- success output format
- do and don't rules

This is intentionally repetitive. Repetition here is a feature because it makes the execution branch explicit to the model.

## Runtime Integration

Runtime command files for the four major guarded commands should explicitly reference matching prompt templates.

Expected guidance pattern:

1. Read `.ai-harness/activation.md`
2. Read `.ai-harness/prompt-templates/<command>.md`
3. Fill placeholders from local artifacts and repo state
4. Follow the template output format exactly

This should be added for:

- `harness-plan`
- `harness-run`
- `harness-verify`
- `harness-ship`

The runtime layer should not pretend that prompt templates are provider-native slash commands. They remain local capability-cache artifacts.

## Installer And Cache Integration

`prompt-templates/` becomes part of the installed `.ai-harness/` capability cache.

That means:

- root export surface must include `prompt-templates/`
- install/update flows must carry it into `.ai-harness/prompt-templates/`
- validation must treat it as a required repository surface
- tests must assert it appears in installed cache results

## Command Docs Integration

The four major command docs should gain `## Dispatch Template`.

That section should:

- point to the matching prompt template
- explain that execution should not be freestyle
- clarify that command docs are the reference layer while prompt templates are the execution layer

The command docs should stay concise and phase-oriented. They are not replaced by the full template body.

## Validation And Tests

Validation must require:

- `prompt-templates/` exists
- all required template files exist
- each template includes:
  - `## Purpose`
  - `## Prompt`
  - `## Placeholders`
  - `## Returns`
  - `## Critical Rules`
- run/verify/ship templates contain `### Blocked`
- blocker-question template contains an explicit "stop after asking" rule
- command docs include `## Dispatch Template`
- installed cache includes `prompt-templates/`
- active docs still reject forbidden alias forms such as `harness:plan`, `/harness:plan`, `harness_plan`, and `/harness plan`

Tests should cover:

- repository contract
- install/export behavior
- runtime command surface references
- template content assertions
- docs integration

## Docs

Add `docs/dispatch-prompt-templates.md` explaining:

- why prompt templates exist
- how they differ from command docs
- how blocked output works
- how agents should dispatch major commands safely

This doc should be short and operational, not philosophical.

## Site

Add one small section or card group that explains:

- command docs = reference
- prompt templates = execution instruction
- blocked output = valid branch

Do not redesign the site around this concept. It should reinforce the product story, not become a separate documentation layer.

## Risks

- templates become too long and stop being practical
- command docs and templates drift apart
- validation checks only headings but not real execution usefulness
- runtime command files link to templates without making placeholder filling clear

## Mitigations

- keep templates focused on major guarded commands only
- keep command docs as concise reference, not duplicate execution prompts
- validate both structure and key blocked-output content
- require runtime command stubs to point directly at matching template paths

## Implementation Notes

The cleanest implementation order is:

1. add failing tests for prompt-template presence and structure
2. create template files
3. wire export/install/runtime references
4. update command docs and docs
5. add site reinforcement
6. run full verification loop

## Constraints Confirmed

- the product remains markdown-first and runtime-light
- blocked output is elevated to a first-class execution branch
- provider honesty remains intact
- command docs are not removed
- no universal slash-command claim is introduced
