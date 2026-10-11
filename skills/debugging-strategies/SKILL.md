---
name: debugging-strategies
description: Master systematic debugging techniques, profiling tools, and root cause analysis to efficiently track down bugs across any codebase or technology stack. Use when investigating bugs, performance issues, or unexpected behavior.
metadata:
  kind: "domain"
  version: "0.1.0"
  tags: "security,testing,reliability"
  roles: "security-engineer,qa-engineer"
  compatible: "claude,cursor,codex,gemini"

---
# Debugging Strategies

## Boundary

**`sk-debugging-strategies`** owns **reproducible debugging strategy selection, evidence capture, and diagnosis output**. It does not own **domain-specific implementation details that belong to the relevant stack skill**; route those concerns to the appropriate specialist skill.


## Use this skill when

Use this skill for the scenarios listed in the description. Keep the first pass focused on the smallest reproducible example and the requested scope.

## Workflow

1. Inspect the current project conventions and existing tests or diagnostics.
2. Reproduce the behavior or define the expected behavior with a minimal example.
3. Choose the narrowest useful technique and record the evidence.
4. Implement or recommend the smallest change that addresses the verified cause.
5. Run the relevant checks and report failures, residual risk, and next action.

## Output

Produce a reproducible diagnosis, evidence log, root cause, verification result, and next action.

## Detailed reference

Read `references/debugging-strategies-reference.md` when the compact process below needs tool-specific examples or issue-type patterns.
Do not load the reference wholesale when the compact workflow is sufficient.

Use `references/incident-evidence-matrix.md` for production incidents or regressions that require detection, localization, mitigation, verification, and learning evidence.

## When not to use

- When the request is outside `sk-debugging-strategies`'s boundary or another specialist is the primary owner.
- When the user needs an attestation, exploit authorization, or production claim that requires separate human approval or evidence.

## Required inputs

- symptom, expected behavior, environment, reproduction status, and available evidence.

## Cross-skill handoffs

- sk-systematic-debugging-pro for root-cause discipline; sk-bug-discovery-pro for defect discovery; sk-performance-tuning-pro for performance-led investigations.
## Worked scenarios and evidence

Read [`references/worked-scenarios-and-evidence.md`](./references/worked-scenarios-and-evidence.md) for one positive and one negative/edge fixture with expected output-level evidence and canonical handoff.

## Example

Bisect a regression across history, then confirm with a minimal repro:

```bash
# Automate the search: script exits 0=good, 1=bad
git bisect start && git bisect bad HEAD && git bisect good v1.9.0
git bisect run ./repro-fails.sh          # finds the exact introducing commit
git bisect reset
# Inspect the culprit commit before proposing any fix
git show <culprit-sha> --stat && git log -1 --format=%B <culprit-sha>
```
