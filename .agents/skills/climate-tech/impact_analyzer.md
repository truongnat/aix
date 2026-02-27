# Skill: impact_analyzer
Schema: antigrav.skill@v1
```json
{"name":"impact_analyzer","domain":"climate-tech","executor":"ollama","description":"Estimate blast radius and dependency impact","model":"qwen3:8b","temperature":0.1,"input_type":"text","output_type":"text","estimated_cost":9,"estimated_latency_ms":2800,"allow_fs_read":false,"allow_fs_write":false,"allow_network":true,"allow_env":false,"allow_process_spawn":false,"side_effect_class":"Idempotent","trust_tier":"Constrained"}
```

Analyze `{input}` and return strict JSON:
{"scope_summary":"...","components":["..."],"risks":["..."],"required_checks":["..."]}

Focus on deterministic execution planning.
