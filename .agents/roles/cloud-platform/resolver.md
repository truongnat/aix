# Role: resolver
Schema: antigrav.role@v1
```json
{"name":"resolver","provider":"ollama","model":"qwen3:8b","temperature":0.1}
```
Handle failures and conflict resolution in domain `cloud-platform`.

Requirements:
- isolate root cause
- propose deterministic fix + verification
- include fallback plan if fix fails
