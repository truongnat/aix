# Runtime-Native Install

## Purpose

Document what `install.sh` + `lib/install-runtime.ts` install per runtime **without** copying the full pack to the product repo root.

Canonical scope: per-runtime payload paths and follow-up actions after runtime-native install.

Use [install-command-model.md](install-command-model.md) for command defaults and flag semantics. Use [install-sh-usage.md](install-sh-usage.md) for remote wrapper behavior, review-before-run flows, and manual fallback entrypoints.

**Status:** Experimental until dogfooded. See [runtime-native-install-audit.md](runtime-native-install-audit.md) and [runtime-native-install-dogfood-plan.md](runtime-native-install-dogfood-plan.md). Do not claim stable support in production adoption guides yet.

## Runtime-Native Entry Shape

```bash
sh install.sh --runtime <name> --scope <global|project> --target <path> [--init-harness] [--dry-run] [--force] [--yes]
```

Flag semantics and defaults live in [install-command-model.md](install-command-model.md).

| Runtime | Alias | Project scope | Global scope |
|---|---|---|---|
| `opencode` | — | `.opencode/plugins/ai-engineering-harness.js` | `~/.config/opencode/plugins/` |
| `cursor` | — | `.cursor/rules/ai-engineering-harness.mdc` | `~/.cursor/rules/` |
| `windsurf` | same as cursor | same | same |
| `claude` | — | `.claude/CLAUDE.md`, merge `.claude/settings.json` | `~/.claude/CLAUDE.md`, settings |
| `codex` | — | `AGENTS.md` bootstrap | `~/.codex/AGENTS.md` |
| `gemini` | — | `.gemini/extensions/ai-engineering-harness/` | `~/.gemini/extensions/...` |
| `generic` | — | `AGENTS.md` bootstrap | (skip; use codex global) |
| `all` | — | runs all rows above in order | use `--scope global` |
| `manual` | `--legacy-root` | full root copy via `node bin/aih.js install` (fallback) | N/A |

## Claude Code Follow-Up

After project install, in Claude Code run:

```txt
/plugin install ai-engineering-harness@ai-engineering-harness
```

Marketplace source is registered from this repository (`truongnat/ai-engineering-harness`).

## Gemini Follow-Up

Project install copies extension files under `.gemini/extensions/`. You may also run:

```bash
gemini extensions install https://github.com/truongnat/ai-engineering-harness
```

## Combined With `.harness` Init

```bash
sh install.sh --runtime opencode --scope project --init-harness --yes --target .
```

## Payload Source

Files live under `runtime/` in the pack. See [runtime/README.md](../runtime/README.md).

## Manual Fallback

```bash
sh install.sh --runtime manual --target .
```

Copies default installed surface (`commands/`, `skills/`, …) — not recommended as the long-term default. See [install-sh-usage.md](install-sh-usage.md) for remote wrapper behavior and manual fallback examples.
