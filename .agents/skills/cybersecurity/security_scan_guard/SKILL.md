# Skill: security_scan_guard
Schema: antigrav.skill@v1
```json
{"name":"security_scan_guard","domain":"cybersecurity","executor":"ollama","description":"Evaluate internet-surface risk and security readiness for workflow outputs","model":"qwen3:8b","temperature":0.1,"input_type":"text","output_type":"text","estimated_cost":10,"estimated_latency_ms":3000,"allow_fs_read":false,"allow_fs_write":false,"allow_network":true,"allow_env":false,"allow_process_spawn":false,"side_effect_class":"Idempotent","trust_tier":"Constrained"}
```

Analyze `{{input}}` and return strict JSON:
{"decision":"pass|fail","summary":"...","internet_surface":["..."],"findings":[{"severity":"low|medium|high","title":"...","evidence":"...","mitigation":"..."}],"required_actions":["..."],"safe_to_continue":true}

Rules:
- Focus on network exposure, prompt-injection surfaces, secret leakage, command abuse, and permission drift.
- Keep output deterministic and implementation-focused.
- If evidence is missing, explicitly list unknowns and required validation commands.
