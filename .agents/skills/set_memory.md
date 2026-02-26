# Skill: set_memory
Schema: antigrav.skill@v1

```json
{
  "name": "set_memory",
  "domain": "agent",
  "executor": "ollama",
  "model": "qwen3:8b",
  "temperature": 0.0
}
```

Store a value in memory using KEY=VALUE format.
Useful for passing state between steps using {{memory.KEY}}.

Input:
{{input}}
