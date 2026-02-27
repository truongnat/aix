# Skill: risk_register
Schema: antigrav.skill@v1
```json
{"name":"risk_register","domain":"healthtech","executor":"ollama","description":"Generate risk register with severity and mitigation","model":"qwen3:8b","temperature":0.1,"input_type":"text","output_type":"text","estimated_cost":8,"estimated_latency_ms":2600,"allow_fs_read":false,"allow_fs_write":false,"allow_network":true,"allow_env":false,"allow_process_spawn":false,"side_effect_class":"Idempotent","trust_tier":"Constrained"}
```

From `{input}`, output strict JSON:
{"risks":[{"title":"...","severity":"low|medium|high","mitigation":"..."}],"rollback":"...","owner_actions":["..."]}
