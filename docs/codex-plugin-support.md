# Codex plugin support

## What failed

Treating Codex like a **project-local slash command** provider (`/harness-plan` via `AGENTS.md` aliases) does not register commands in Codex. Codex uses the **OpenAI plugin model**, not `.codex/commands/` or repo slash files.

## Correct Codex model

Per [openai/plugins](https://github.com/openai/plugins), each plugin lives under `plugins/<name>/` with:

```txt
.codex-plugin/plugin.json   (required)
skills/                     (primary surface)
commands/                   (optional)
agents/                     (optional)
hooks.json                  (optional)
```

Official example [build-web-apps](https://github.com/openai/plugins/tree/main/plugins/build-web-apps) uses `skills: "./skills/"` and `interface` metadata in `plugin.json`.

[Superpowers](https://github.com/obra/superpowers) installs into Codex via **`/plugins`** → search → Install Plugin — not by copying slash markdown into the target repo.

## This package

| Artifact | Purpose |
|----------|---------|
| `.codex-plugin/plugin.json` | Codex marketplace/plugin manifest |
| `skills/` | Plugin skill surface in the published package |
| `commands/` | Optional plugin command surface |
| `agents/` | Optional plugin subagent surface |
| `hooks.json` | Optional plugin hook surface |
| `agents/openai.yaml` | Optional per-skill metadata for Codex skill discovery |
| `.codex/` | Project install Codex surface for rules, hooks, and agents |
| `.agents/skills/` | Project install skill surface for Codex-native repository usage |

## Install flows

### Native (Codex plugin)

1. Publish/submit plugin to Codex marketplace (pending).
2. In Codex: `/plugins` → search **ai-engineering-harness** → Install.
3. Use **plugin skills** exposed by the package.

### Project fallback (`npx ai-engineering-harness install --provider codex`)

Creates:

- `.ai-harness/` local command catalog
- `.harness/` project state (if selected)
- `.codex/` project rules, hooks, and agents
- `.agents/skills/` Codex skill surface
- `AGENTS.md` bootstrap pointing at harness workflows

After install, trust the project `.codex/` layer in Codex and restart the app so rules and hooks load.

Does **not** create native `/harness-*` slash commands in Codex.

## Not supported

- Claimed **`/harness-plan`** in Codex UI from project install
- Fake **`.codex/commands/`** paths
- Equating Codex with Claude `.claude/commands/*.md` behavior

## Future work

- Submit plugin to Codex marketplace
- Dogfood `/plugins` install in Codex CLI/App
- Verify skill discovery and default prompts from `interface.defaultPrompt`

## Related

- [provider-native-command-research.md](provider-native-command-research.md)
- [provider-command-matrix.md](provider-command-matrix.md)
