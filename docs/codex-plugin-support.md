# Codex plugin support

## Slash command routing (current)

`/harness-*` slash commands now work in Codex CLI via **UserPromptSubmit hook routing**. When a user types `/harness-plan` in Codex, the hook in `.codex/hooks/core/codex-hook-router.js` intercepts the prompt, reads the command file from `.codex/commands/harness-plan.md`, and injects it as `additionalContext`. This gives functional parity with Claude Code and Cursor without requiring Codex to support project-local slash commands natively.

## Plugin model (marketplace)

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

Creates `/harness-*` slash command routing via UserPromptSubmit hook + `.codex/commands/` files.
Does **not** emit `.codex-plugin/plugin.json` into the target repo; that manifest lives in the package root and is shipped when the plugin is published.

## Future work

- Submit plugin to Codex marketplace
- Dogfood `/plugins` install in Codex CLI/App
- Verify skill discovery and default prompts from `interface.defaultPrompt`

## Build and publish

Use the repo's publish bundle when you want a Codex-ready artifact without changing the project install path:

```bash
npm run build:codex-plugin
```

This writes a release bundle to `dist/codex-plugin/` with:

- `.codex-plugin/plugin.json`
- `skills/`
- `commands/`
- `agents/`
- `hooks/`
- `hooks.json`

`npm run publish:codex-plugin` currently maps to the same build step. Marketplace submission remains a manual Codex `/plugins` action until OpenAI publishes a direct upload flow.

## Related

- [provider-native-command-research.md](provider-native-command-research.md)
- [provider-command-matrix.md](provider-command-matrix.md)
