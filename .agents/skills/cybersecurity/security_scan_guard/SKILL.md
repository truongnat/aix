# Skill: security_scan_guard
Schema: agentic-sdlc.skill@v1
```json
{"name":"security_scan_guard","domain":"cybersecurity","description":"Evaluate internet-surface risk and security readiness for workflow outputs","risk":"safe","source":"self","tags":["security","internet-surface","risk-gate"],"executor":"ollama","model":"qwen3:8b","temperature":0.05,"input_type":"text","output_type":"json","estimated_cost":10,"estimated_latency_ms":3000,"allow_fs_read":false,"allow_fs_write":false,"allow_network":true,"allow_env":false,"allow_process_spawn":false,"side_effect_class":"Idempotent","trust_tier":"Constrained"}
```

## Overview
Evaluate internet-surface risk and security readiness before merge/release decisions.

## When to Use
- Before release workflows that interact with remote systems.
- During review workflows that include network-capable skills.
- When security posture must be explicit in go/no-go decisions.

## Examples
Input:
```text
Assess security posture for workflow that executes shell commands, calls external APIs, and writes artifacts.
```

Expected output shape:
```json
{
  "summary": "...",
  "actions": ["...", "..."],
  "risks": ["...", "..."]
}
```

## Limitations
- Produces security assessment only; does not apply fixes.
- Accuracy depends on completeness of the provided workflow evidence.
- Should be paired with concrete validation commands for high-risk findings.

## Output Contract
Return strict JSON object with:
- `summary` (string): security posture and decision rationale.
- `actions` (string[]): mandatory remediation/validation actions.
- `risks` (string[]): explicit security risks and unknowns.

Task input:
{{input}}
