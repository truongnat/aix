# Skill: risk_register
Schema: agentic-sdlc.skill@v1
```json
{"name":"risk_register","domain":"ai-engineering","description":"Generate risk register with severity and mitigation","risk":"safe","source":"self","tags":["risk","mitigation","release"],"executor":"ollama","model":"qwen3:8b","temperature":0.05,"input_type":"text","output_type":"json","estimated_cost":8,"estimated_latency_ms":2600,"allow_fs_read":false,"allow_fs_write":false,"allow_network":true,"allow_env":false,"allow_process_spawn":false,"side_effect_class":"Idempotent","trust_tier":"Constrained"}
```

## Overview
Generate a concrete risk register for planning, review, and release gates.

## When to Use
- After implementation plan is prepared.
- After validation outputs are available.

## Examples
Input:
```text
Generate risk register for refactoring query execution and adding result caching.
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
- Does not mitigate risks automatically.
- Severity accuracy depends on quality of input evidence.

## Output Contract
Return strict JSON object with:
- `summary` (string)
- `actions` (string[])
- `risks` (string[])

Task input:
{input}
