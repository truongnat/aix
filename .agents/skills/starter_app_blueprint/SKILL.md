# Skill: app_blueprint
Schema: agentic-sdlc.skill@v1
```json
{
  "name": "app_blueprint",
  "domain": "agent",
  "description": "Generate a concrete local app artifact blueprint with files and a validation command.",
  "risk": "safe",
  "source": "self",
  "tags": ["starter", "artifact", "blueprint", "app-builder"],
  "executor": "ollama",
  "model": "phi4-mini:latest",
  "temperature": 0.1,
  "input_type": "text",
  "output_type": "json",
  "estimated_cost": 10,
  "estimated_latency_ms": 4000,
  "allow_fs_read": false,
  "allow_fs_write": false,
  "allow_network": true,
  "allow_env": false,
  "allow_process_spawn": false,
  "side_effect_class": "Idempotent",
  "trust_tier": "Constrained"
}
```

## Overview

Generate a machine-readable artifact plan that the harness can apply directly.

## When to Use

- Use for starter workflows that should create real files from a natural-language task.
- Use when a workflow should stay inside `.agents` semantics instead of hardcoding every output file as separate workflow steps.

## Output Contract

Return strict JSON with this shape:

```json
{
  "root_dir": "local_tmp/generated-app",
  "validation_command": "safe local validation command",
  "files": [
    {
      "path": "relative/path/from/root_dir",
      "content_lines": ["line 1", "line 2"]
    }
  ]
}
```

Rules:

- `root_dir` must be a safe relative path under `local_tmp/`.
- `validation_command` must be local-only and use common allowed tools such as `node`, `npm`, `cargo`, `pytest`, or `go`.
- Prefer the simplest stack that can satisfy the task.
- Default to a tiny local app or CLI with minimal dependencies.
- Include enough files for the app to run and validate.
- Prefer `content_lines` over a single multiline `content` string so the JSON stays valid and easy to parse.
- Return only the JSON object.
- Do not include markdown fences.
- Do not include extra keys unless they are directly needed by the harness.

Task input:
{{input}}
