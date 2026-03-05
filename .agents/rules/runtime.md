---
description: runtime policy rules
trigger: always_on
---

# Runtime Rules
Schema: antigrav.rule@v1

```json
{
  "allowed_domains": [
    "demo",
    "utils",
    "agent",
    "dev",
    "antigravity",
    "anthropic",
    "ai-research",
    "ai-engineering",
    "cloud-platform",
    "cybersecurity",
    "data-ml-eval",
    "healthtech",
    "climate-tech"
  ],
  "preferred_domains": [
    "agent",
    "dev",
    "cybersecurity",
    "ai-engineering",
    "cloud-platform",
    "data-ml-eval",
    "healthtech",
    "climate-tech",
    "antigravity",
    "anthropic",
    "ai-research",
    "demo",
    "utils"
  ],
  "cross_domain_penalty": 2,
  "strict_mode": true,
  "disable_network": false,
  "read_only": false,
  "max_trust_tier": "Constrained",
  "max_total_cost": 300,
  "max_total_latency_ms": 300000,
  "max_steps": 60,
  "max_cpu_ms": 30000,
  "max_wall_time_ms": 300000,
  "max_fs_reads": 500,
  "max_fs_writes": 200,
  "max_network_calls": 100,
  "max_memory_mb": 512,
  "run_script_timeout_ms": 180000,
  "run_script_allowed_commands": [
    "cargo",
    "git",
    "npm",
    "pnpm",
    "yarn",
    "make",
    "just",
    "go",
    "pytest",
    "flutter",
    "dart",
    "bash",
    "sh"
  ]
}
```

## Policy Intent
- Keep workflow execution deterministic, auditable, and production-safe.
- Prefer explicit guardrails over implicit behavior.
