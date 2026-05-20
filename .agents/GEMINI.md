# GEMINI Package Contract (.agents)

This document defines how Gemini-compatible agents should interpret and operate on this repository package.

## Scope

Operate within this repository and treat `.agents/` as the source of truth for:

- workflow orchestration (`workflows/`)
- skill capabilities (`skills/`)
- role prompts (`roles/`)
- policy/rules (`rules/`)
- reusable prompts (`templates/`)

## Required Behaviors

1. Keep execution deterministic.
2. Prefer minimal, auditable diffs.
3. Preserve schema compliance (`agentic-sdlc.*@v1`).
4. Run package validation before claiming completion.

## Security Baseline

If a workflow uses an internet-capable skill, it must include a security-check step.

Baseline step:

- `## Step: internet_security_check`
- `Skill: cybersecurity.security_scan_guard`

This is validated by `workflow check` via package-level policy enforcement.

## Security Workflow

Use the dedicated workflow for repository security posture checks:

- Workflow ID: `cybersecurity/security-scan`
- Template: `cybersecurity/security_scan_prompt`

Example:

```bash
cargo run -- --workflow-id cybersecurity/security-scan --template cybersecurity/security_scan_prompt --task "scan internet-surface risk and policy drift"
```

## Validation Commands

```bash
cargo run -- workflow check
cargo run -- workflow quality-skills --strict
cargo run -- workflow trace <instance_id> --timeline
```

## Notes For Agent Authors

- Use `SKILL.md` folder layout: `.agents/skills/<skill-name>/SKILL.md`.
- Keep internet-capable skills explicit via metadata (`allow_network`) when possible.
- Treat `state/` as runtime output; avoid hand-editing unless debugging.
