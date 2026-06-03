# Antigravity Provider Research

## Purpose

Research Google **Antigravity** configuration paths before adding `antigravity` to `install.sh` / `install-runtime.js`. Do **not** alias blindly to Cursor unless evidence supports it.

Status for `v0.9.2`: **planned, not implemented** until paths are verified in implementation + dogfood.

## What Antigravity Is

- Google’s agent-first IDE (Antigravity), related to Gemini tooling.
- Customization via **Rules**, **Workflows**, and **Skills** (directory-based).
- Official onboarding: [Getting Started with Google Antigravity](https://codelabs.developers.google.com/getting-started-google-antigravity) (Google Codelabs).

## Project-Level Paths (workspace)

Sources agree on workspace-scoped dirs under the opened folder (naming varies slightly in community docs — verify in implementation):

| Asset | Path (primary) | Alternate cited |
|---|---|---|
| Workspace rules | `<workspace>/.agents/rules/` | `.agent/rules/` (typo in some posts) |
| Workspace workflows | `<workspace>/.agents/workflows/` | `.agent/workflows/` |
| Workspace skills | `<workspace>/.agents/skills/` | — |
| Agent identity (cited) | `<workspace>/.agents/agents.md` | — |

**Recommendation for harness bootstrap (draft):**

- Install harness discipline as a workspace rule file, e.g.  
  `<workspace>/.agents/rules/ai-engineering-harness.md`  
  (content adapted from pack — not Cursor `.mdc` format).
- Do **not** write `.cursor/rules/` for Antigravity unless user also selected Cursor.

## Global-Level Paths

| Asset | Path |
|---|---|
| Global rule | `~/.gemini/GEMINI.md` |
| Global workflows | `~/.gemini/antigravity/global_workflows/` (per Codelabs) |
| Global skills | `~/.gemini/antigravity/skills/` |
| MCP config | `~/.gemini/antigravity/mcp_config.json` |

AgentsMesh matrix also cites:

- `~/.gemini/antigravity/GEMINI.md` (variant layout)

**Recommendation:** prefer Codelabs paths; detect existing `~/.gemini/` layout before write (dry-run disclosure).

## Cursor Compatibility

| Question | Finding |
|---|---|
| Does Antigravity read `.cursor/rules/*.mdc`? | **No evidence** — do not rely on Cursor paths |
| Same format as Cursor rules? | **Unknown** — use `.agents/rules/*.md` per Antigravity docs |
| Same as Gemini CLI extension? | Partial overlap via `~/.gemini/` tree; Antigravity adds `.agents/` workspace dirs |

## Unknowns

- Canonical single path for workspace rules (`.agents` vs `.agent` plural) — confirm in Antigravity UI “Customizations” on target version.
- Whether project-level `GEMINI.md` at repo root is read (Gemini CLI uses extensions; Antigravity uses `.agents/`).
- Marketplace / extension install URL for harness (if any) — not researched.
- Global vs workspace precedence when both exist.
- Safe merge strategy for existing `~/.gemini/GEMINI.md`.

## Recommendation

| Action | v0.9.2 |
|---|---|
| Add `antigravity` to installer runtime list | **Planned** — show in wizard as disabled or “coming soon” until impl |
| `install-runtime.js` payload | **Defer** — add `runtime/antigravity/` after path verification |
| Alias to `cursor` | **No** |
| Alias to `gemini` only | **No** — workspace paths differ (`.agents/` vs extension manifest) |
| Dogfood scenario | **D7** (future) — after implementation |

### Proposed install mapping (implementation phase)

| Scope | Write target |
|---|---|
| project | `.agents/rules/ai-engineering-harness.md` (+ optional workflow stub) |
| global | `~/.gemini/GEMINI.md` merge or harness snippet + `~/.gemini/antigravity/skills/` only if team approves scope |

Validate with structural check: path exists + required heading in rule file (future `--runtime antigravity`).

## References

- [Google Codelabs — Getting Started with Antigravity](https://codelabs.developers.google.com/getting-started-google-antigravity)
- [AgentsMesh Supported Tools — Antigravity](https://samplexbro.github.io/agentsmesh/reference/supported-tools/) (secondary matrix)
- Community guides (Medium, AI Builder Club) — cross-check only, not sole source

## Related Docs

- [installer-ux-v0.9.2-plan.md](installer-ux-v0.9.2-plan.md)
- [runtime-install-matrix-research.md](runtime-install-matrix-research.md)
- [runtime-native-install-audit.md](runtime-native-install-audit.md)
