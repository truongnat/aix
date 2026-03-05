# Skill: acceptance_guard
Schema: antigrav.skill@v1
```json
{"name":"acceptance_guard","domain":"healthtech","description":"Validate acceptance criteria and test completeness","risk":"safe","source":"self","tags":["acceptance","quality","validation"],"executor":"ollama","model":"qwen3:8b","temperature":0.05,"input_type":"text","output_type":"json","estimated_cost":10,"estimated_latency_ms":3200,"allow_fs_read":false,"allow_fs_write":false,"allow_network":true,"allow_env":false,"allow_process_spawn":false,"side_effect_class":"Idempotent","trust_tier":"Constrained"}
```

## Overview
Validate acceptance criteria coverage and execution readiness.

## When to Use
- Before build/test execution.
- Before merge/release decisions.

## Examples
Input:
```text
Validate readiness of migration plan and regression checks for new connection profile flow.
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
- Does not execute validations itself.
- Output quality depends on completeness of provided acceptance criteria.

## Output Contract
Return strict JSON object with:
- `summary` (string)
- `actions` (string[])
- `risks` (string[])

Task input:
{input}
