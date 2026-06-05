# Insights

`aih insights` summarizes local harness telemetry from `.harness/history/events.jsonl`.

Hooks append append-only JSON events when they record:

- phase guard decisions (`guard-phase`)
- skill runs (`record-skill-run`)
- tool runs (`record-tool-output`)
- subagent runs (`record-subagent-result`)

## Commands

```bash
aih insights
aih insights --target <path>
aih insights --target <path> --json
aih insights --export
aih insights --recommend-evals
aih insights --upload
```

`--recommend-evals` closes the telemetry→eval loop by mapping guard blocks and tool failures to suggested golden tasks.

`--upload` posts the anonymized export payload to `HARNESS_TELEMETRY_ENDPOINT` when `.harness/config.json` sets `telemetry.export.remoteUpload.enabled` to `true`.

## Opt-in export

`--export` emits an anonymized aggregate payload (`harness-insights-export-v1`) suitable for sharing bug reports or regression notes. No file paths or raw event bodies are included by default.

Configure defaults in `.harness/config.json` (from `templates/harness-config.json`):

```json
{
  "telemetry": {
    "export": {
      "enabled": false,
      "anonymize": true,
      "remoteUpload": {
        "enabled": false,
        "endpointEnv": "HARNESS_TELEMETRY_ENDPOINT"
      }
    }
  }
}
```

Remote upload remains disabled until you set `remoteUpload.enabled` and provide `HARNESS_TELEMETRY_ENDPOINT`.

## Example output

```text
Harness Insights (/path/to/project/.harness/history/events.jsonl)
Events: 12

Skills:
  verification: 4

Phase guard blocks:
  harness-run: 2

Tools:
  npm test: 3 (1 failed)

Subagents:
  reviewer: 2
```

Events stay local and gitignored. Use insights to spot which guards, skills, and tools dominate your sessions before tuning rules or evals.
