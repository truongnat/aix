# Gap Roadmap (Based On Current README + Landing + Runtime)

This document translates the current gap analysis into an execution plan for `agentic-sdlc`.

## Scope And Intent

The project already has a strong deterministic orchestration core (step ordering, persisted state, policy gates, resume semantics).  
The highest-priority work now is to close production-readiness gaps around evaluation, governance, security hardening, and delivery automation.

## Baseline Summary

### Strong today
- Deterministic workflow engine semantics (ordering/state/trace IDs)
- Resume and crash recovery
- Policy gating for trust/budget/permissions
- Report-quality and simulation-fallback gates
- Role/workflow/skill scaffolding and package checks

### Confirmed gaps to close
1. Determinism is orchestration-level, not model-output-level.
2. No remote CI workflow + branch-protection-ready check surface.
3. No first-class eval command/path for regression gating.
4. Human-in-the-loop approval primitive is missing in runtime.
5. Observability export is not OpenTelemetry-compatible.
6. Imported-skill supply-chain verification is metadata-level (no signature/attestation verification).
7. Provider coverage and routing reliability are limited for enterprise contexts.
8. MCP is present as imported skill content, but not runtime-integrated capability.

## 30 / 60 / 90 Day Plan

## Day 0-30: Reliability And Delivery Baseline

### Objectives
- Make project claims precise.
- Move local quality gate to remote CI.
- Establish immediate governance artifacts for gaps.

### Deliverables
- `README` determinism scope clarified (engine determinism vs LLM content nondeterminism).
- GitHub Actions CI workflow running `./scripts/ci_gate.sh` on push/PR.
- This roadmap document tracked in repo.
- Architecture doc update with explicit system diagram.

### Success criteria
- CI check is visible and required in PR flow.
- No ambiguous “fully deterministic LLM output” wording in docs.

## Day 31-60: Evaluation + Human Control

### Objectives
- Add objective quality regression controls.
- Add runtime human approval for sensitive transitions.

### Deliverables
- New `workflow eval` command:
  - dataset input
  - scorer interface
  - pass/fail threshold
  - JSON report artifact
- `manual_approval` workflow step primitive:
  - pause state persisted
  - approve/reject CLI commands
  - approver metadata in trace
- Release/review workflows updated to require approval before final go/no-go.

### Success criteria
- PR/CI can fail on evaluation regression.
- Merge/release-sensitive workflows can be paused and approved explicitly.

### Progress update (current)
- `workflow eval` command implemented with dataset-based report scoring and pass-rate threshold gate.
- `manual_approval` runtime primitive implemented:
  - `WorkflowInstanceStatus::Paused` and `StepExecutionStatus::Paused`
  - `workflow approve` / `workflow reject` operator commands
  - persisted approval metadata in `.agents/state`
  - release/review workflows updated with explicit `manual_approval_gate`.

## Day 61-90: Observability + Supply Chain + Enterprise Integrations

### Objectives
- Standardize telemetry.
- Harden imported skill trust.
- Expand provider/runtime interoperability.

### Deliverables
- OpenTelemetry export support (trace/span mapping from workflow/step telemetry).
- Supply-chain security for imported skills:
  - signed manifests or signature verification
  - provenance attestation checks
  - optional SBOM output for imported packs
- Provider expansion (Anthropic/Azure OpenAI/Bedrock) with explicit routing and fallback policy semantics.
- MCP runtime management commands (register/list/ping/permission policy).

### Success criteria
- External observability backend can ingest runtime traces directly.
- Imported-skill execution can enforce cryptographic trust policy.
- Enterprise provider adoption path documented and testable.

## Workstream Backlog

| ID | Workstream | Priority | Effort | Owner |
|---|---|---:|---:|---|
| WS-01 | CI on GitHub + required checks | P0 | S | Platform |
| WS-02 | Determinism claim alignment in docs | P0 | S | Docs |
| WS-03 | `workflow eval` command and threshold gate | P1 | M | Runtime |
| WS-04 | `manual_approval` runtime primitive | P1 | M | Runtime |
| WS-05 | OpenTelemetry exporter | P1 | M | Runtime |
| WS-06 | Signed imported-skill verification | P1 | L | Security |
| WS-07 | Provider expansion + robust fallback semantics | P2 | M | LLM Platform |
| WS-08 | MCP runtime integration surface | P2 | M | Integrations |

## Risks

- Adding strict approval/eval gates can slow developer iteration if defaults are too rigid.
- OTel and supply-chain verification can increase implementation complexity without staged rollout.
- Multi-provider support may increase maintenance cost unless adapters are standardized.

## Recommended rollout strategy

1. Enable new controls as opt-in first (`--strict-eval`, `--require-approval`).
2. Collect adoption telemetry.
3. Graduate to default-on for release-critical workflows.
