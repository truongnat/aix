# Skill: impact_analyzer
Schema: antigrav.skill@v1
```json
{"name":"impact_analyzer","domain":"climate-tech","description":"Estimate blast radius and dependency impact","risk":"safe","source":"self","tags":["analysis","planning","risk"],"executor":"ollama","model":"qwen3:8b","temperature":0.05,"input_type":"text","output_type":"json","estimated_cost":9,"estimated_latency_ms":2800,"allow_fs_read":false,"allow_fs_write":false,"allow_network":true,"allow_env":false,"allow_process_spawn":false,"side_effect_class":"Idempotent","trust_tier":"Constrained"}
```

## Overview
Analyze impact and dependencies before execution.

## When to Use
- Before implementation planning.
- When assessing blast radius of risky changes.

## Examples
Input:
```text
Assess impact of moving query execution logic into controller modules.
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
- Produces analysis only; does not execute code changes.
- Depends on quality of provided context.

## Output Contract
Return strict JSON object with:
- `summary` (string)
- `actions` (string[])
- `risks` (string[])

Task input:
{input}
