# Skill: acceptance_guard
Schema: antigrav.skill@v1
```json
{"name":"acceptance_guard","domain":"climate-tech","executor":"ollama","description":"Validate acceptance criteria and test completeness","model":"qwen3:8b","temperature":0.1,"input_type":"text","output_type":"text","estimated_cost":10,"estimated_latency_ms":3200,"allow_fs_read":false,"allow_fs_write":false,"allow_network":true,"allow_env":false,"allow_process_spawn":false,"side_effect_class":"Idempotent","trust_tier":"Constrained"}
```

Review `{input}` against acceptance criteria quality.
Return strict JSON with:
{"coverage":["..."],"missing_checks":["..."],"blocking_issues":["..."],"ready":true}
