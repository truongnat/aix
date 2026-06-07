# Runtime-Native Install

## Purpose

Document what the primary Node.js CLI installs per provider **without** copying the full pack to the product repo root.

Canonical scope: per-runtime payload paths and follow-up actions after runtime-native install.

Use [install-command-model.md](install-command-model.md) for primary CLI command defaults and flag semantics. Use [install-sh-usage.md](install-sh-usage.md) for remote wrapper behavior, shell-only flags such as `--ref`, review-before-run flows, and manual fallback entrypoints.

**Status:** Experimental until dogfooded. See [runtime-native-install-audit.md](runtime-native-install-audit.md) and [runtime-native-install-dogfood-plan.md](runtime-native-install-dogfood-plan.md). Do not claim stable support in production adoption guides yet.

## Runtime-Native Entry Shape

```bash
npx ai-engineering-harness install --provider <id> [--scope <global|project>] [--target <path>] [--dry-run] [--yes]
```

`--runtime <id>` remains accepted as a deprecated alias for `--provider <id>`. Shell/bootstrap fallback examples live in [install-sh-usage.md](install-sh-usage.md).

| Runtime | Alias | Project scope | Global scope |
|---|---|---|---|
| `cursor` | — | `.cursor/commands/`, `.cursor/rules/` | `~/.cursor/commands/`, `~/.cursor/rules/` |
| `claude` | — | `.claude/CLAUDE.md`, merge `.claude/settings.json` | `~/.claude/CLAUDE.md`, settings |
| `codex` | — | `AGENTS.md` bootstrap | `~/.codex/AGENTS.md` |
| `gemini` | — | `.gemini/extensions/ai-engineering-harness/` | `~/.gemini/extensions/...` |
| `generic` | — | `AGENTS.md` bootstrap | (skip; use codex global) |
| `manual` | shell/bootstrap fallback only | full root copy via `node bin/aih.js install` (fallback) | N/A |

Removed from the active install surface:

- `opencode` — legacy cleanup only; see [uninstall-usage.md](uninstall-usage.md)
- `windsurf` — no separately documented runtime path; use `cursor` only if you intentionally want the Cursor rule path

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
npx ai-engineering-harness install --provider claude --scope project --target . --yes
```

## Payload Source

Files live under `runtime/` in the pack. See [runtime/README.md](../runtime/README.md).

## Manual Fallback

```bash
sh install.sh --runtime manual --target .
```

Copies default installed surface (`commands/`, `skills/`, …) — not recommended as the long-term default. See [install-sh-usage.md](install-sh-usage.md) for remote wrapper behavior and manual fallback examples.
