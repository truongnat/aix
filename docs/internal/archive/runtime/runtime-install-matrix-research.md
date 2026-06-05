# Runtime Install Matrix Research

## Purpose

Research how major agent runtimes install **plugins and capabilities** so `ai-engineering-harness` can move from bulk pack copy into product repos to **runtime-native, scope-aware installation**.

This document is **research only**. It does not authorize implementing copy paths without a follow-up design step and official doc verification per runtime.

**Implementation note (post–Step 6):** [install-runtime.js](../install-runtime.js) and [runtime/](../runtime/) implement many modes, but support remains **best-effort and experimental** until each runtime is dogfooded. See [runtime-native-install-audit.md](runtime-native-install-audit.md) and [runtime-native-install-dogfood-plan.md](runtime-native-install-dogfood-plan.md).

## Research Sources

| Source | Use |
|---|---|
| [obra/superpowers](https://github.com/obra/superpowers) README install section | Reference implementation (multi-runtime, not copy-all-to-root) |
| [obra/superpowers-marketplace](https://github.com/obra/superpowers-marketplace) | Claude marketplace layout (`.claude-plugin/`) |
| Superpowers `package.json`, `.opencode/plugins/`, `gemini-extension.json` | Extension entrypoints vs full tree copy |
| Official Claude Code plugins docs | Scopes, settings files, marketplace |
| Official Cursor rules docs | Project vs user rules |
| OpenAI Codex `AGENTS.md` guide | Global vs project instruction discovery |
| Official Gemini CLI extensions docs | `gemini extensions install`, `~/.gemini/extensions` |
| Official OpenCode plugins docs | `opencode.json`, `.opencode/plugins/`, global config dir |
| [docs/runtimes/](runtimes/) in this repo | Current consumption guidance (pre-native-install) |
| [scenario-c-one-line-installer.md](pack-dogfood-reports/scenario-c-one-line-installer.md) | Evidence that bulk copy works but is not final UX |

## Reference Pattern: Superpowers

Superpowers installs **per runtime**, not by copying the full skill tree into the product repository root.

Reported patterns (verify against upstream before implementation):

| Runtime | Reported install mechanism |
|---|---|
| Claude Code | `/plugin install superpowers@…` via marketplace |
| Cursor | `/add-plugin superpowers` (Cursor-specific) |
| Gemini CLI | `gemini extensions install <git-url>` |
| OpenCode | `plugin` array in `opencode.json` + local `.opencode/plugins/*.js` bootstrap |
| Codex / others | Runtime-specific marketplace or config (varies) |

Structural signals from Superpowers (reference, not normative for this repo):

- **Claude:** `.claude-plugin/plugin.json`, marketplace JSON — plugin package, not `commands/` at repo root
- **OpenCode:** JS plugin entry (`package.json` `main`) registers bootstrap and skills path — not 80+ markdown files in cwd
- **Gemini:** `gemini-extension.json` + optional `GEMINI.md` context file inside extension install dir under `~/.gemini/extensions/`
- **AGENTS.md (Superpowers):** states that manually copying skill files is **not** real integration; bootstrap at session start matters

**Design takeaway:** capability lives in **runtime-managed locations**; product repos keep **project state** (for us: `.harness/`), not the full pack mirror.

## Runtime Matrix

| Runtime | Native install mechanism | Global scope location / mechanism | Project scope location / mechanism | Plugin marketplace? | Slash commands? | Skills / extensions? | Project state location | Confidence | Source links |
|---|---|---|---|---|---|---|---|---|---|
| Claude Code | `/plugin` UI or `claude plugin install <name>@<marketplace> --scope user\|project\|local` | User: `~/.claude/settings.json` + `~/.claude/` features (agents, skills dirs per docs) | Project: `.claude/settings.json`; local: `.claude/settings.local.json` | Yes (official + team marketplaces) | Via plugin bundles / skills (plugin-defined) | Yes (plugin system) | **`.harness/` in product repo** (harness-specific; not Claude-native) | **High** for scopes; **Medium** for exact plugin file layout | https://code.claude.com/docs/en/discover-plugins , https://code.claude.com/docs/en/plugins-reference |
| Cursor | User Rules in settings; project rules in `.cursor/rules/*.mdc`; legacy `.cursorrules` | **User Rules** (Cursor Settings → Rules), global across projects | **Project rules** `.cursor/rules/`; optional `AGENTS.md` at root (always applied) | Marketplace / add-plugin (product feature; verify current Cursor docs) | Commands via rules/plugins (product-dependent) | Rules + skills references in rules; not a single standard skills dir | **`.harness/` in product repo** | **High** for rules paths; **Low** for plugin marketplace parity with Claude | https://cursor.com/docs/rules , https://cursor.com/help/customization/rules |
| Codex CLI | Instruction discovery (`AGENTS.md` chain); CLI via npm; no single “plugin install” identical to Claude | `~/.codex/AGENTS.md` (or `AGENTS.override.md`) | Repo root `AGENTS.md` + nested dir files; config in `~/.codex/config.toml` | Unclear / evolving (check OpenAI docs) | Not same as Claude `/commands` | Via `AGENTS.md` content, not copied `skills/` tree | **`.harness/` in product repo** | **High** for AGENTS.md; **Low** for plugin marketplace | https://developers.openai.com/codex/guides/agents-md |
| Gemini CLI | `gemini extensions install <github-url\|path>` | Extensions under `~/.gemini/extensions/<name>/` (copied snapshot) | Workspace merges extension config; project can use settings — verify project-level extension story | Extension registry / discovery (topic `gemini-cli-extension`) | Extension-bundled `commands/*.toml` | `contextFileName` → often `GEMINI.md` inside extension dir | **`.harness/` in product repo** | **High** for extension install path | https://geminicli.com/docs/extensions/ , https://github.com/google-gemini/gemini-cli/blob/main/docs/extensions/reference.md |
| OpenCode | `plugin` key in `opencode.json` (npm) or files in plugin dirs | `~/.config/opencode/opencode.json` + `~/.config/opencode/plugins/` | Project `opencode.json` + `.opencode/plugins/` | Ecosystem / npm plugins | Via plugins/tools config | npm or local JS/TS plugins | **`.harness/` in product repo** | **High** | https://opencode.ai/docs/plugins/ |
| Generic `AGENTS.md` | Copy or generate **one** root `AGENTS.md` pointing to harness workflow | Optional `~/.config/…` or tool-specific global (defer) | Project root `AGENTS.md` only | No | No | Instructions only | **`.harness/` when project scope** | **High** (fallback) | https://agents.md/ , this repo `AGENTS.md` |
| Manual fallback (current) | `install.sh` → `install.js` `exportPaths` | N/A (not recommended) | Copies pack subset into target root | No | Copies `commands/` markdown | Copies `skills/` tree | `.harness/` created separately | **High** (current behavior) | [install.sh](../install.sh), [frozen-installed-surface-contract.md](frozen-installed-surface-contract.md) |

## Claude Code Findings

- Plugins install to **user**, **project**, or **local** scope with different settings files.
- **Project** scope: `.claude/settings.json` — intended for team sharing via git.
- **User** scope: `~/.claude/settings.json` — personal, all projects.
- **Local** scope: `.claude/settings.local.json` — gitignored.
- Plugins can bundle skills, commands, agents, MCP — not necessarily visible as loose files in repo root.
- **Implication:** harness should publish a **Claude plugin/marketplace package**, not copy `skills/` into customer repo root.

## Cursor Findings

- **Project rules:** `.cursor/rules/*.mdc` with frontmatter (`alwaysApply`, `globs`, `description`).
- **User rules:** global in Cursor Settings (not in repo).
- `AGENTS.md` at repo root is loaded for Agent but is separate from `.mdc` rules system.
- Legacy `.cursorrules` deprecated → migrate to rules.
- **Implication:** project install should write **rules** (or plugin if supported), not full `commands/` + `skills/` trees.

## Codex Findings

- Codex uses **`AGENTS.md` discovery`** (global `~/.codex/AGENTS.md` + project root + path walk), not copying a skill pack.
- Optional `~/.codex/config.toml` for fallbacks and byte limits.
- **Implication:** project scope may **generate/update `AGENTS.md`** slice that references harness loop; global scope updates `~/.codex/AGENTS.md`. Do not copy entire pack by default.

## Gemini CLI Findings

- Install: `gemini extensions install <source>` copies extension into **`~/.gemini/extensions/`**.
- Manifest: `gemini-extension.json` at extension root; optional `GEMINI.md` for model context.
- **Implication:** ship a **Gemini extension** (git URL install), not repo-root `skills/`.

## OpenCode Findings

- **npm plugins:** listed in `opencode.json` `plugin` array; Bun install at startup.
- **Local plugins:** `.opencode/plugins/` (project) or `~/.config/opencode/plugins/` (global).
- Optional `package.json` beside config for plugin deps.
- **Implication:** OpenCode mode = small JS/TS plugin entry + config merge, not full markdown tree copy.

## Generic AGENTS.md Findings

- Single root `AGENTS.md` is a valid **lowest-common-denominator** for tools that read it (Codex, Cursor, others).
- Should **point to** `.harness/` and installed surface, not duplicate entire pack inline.
- **Implication:** “generic” runtime mode = minimal bootstrap file + optional `.harness/` init.

## Unknowns / Needs Verification

| Topic | Why it matters |
|---|---|
| Cursor `/add-plugin` and marketplace IDs for third-party packs | Exact CLI/API for harness distribution |
| Codex official “plugins” or extensions (if any) beyond AGENTS.md | Whether Codex gets a native plugin channel in v1 |
| Claude plugin bundle format for markdown skills | Packaging work for harness content |
| Gemini project-scoped extensions vs user-global only | Whether project `gemini-extension.json` in repo is supported |
| OpenCode harness plugin on npm vs git-only | Distribution choice |
| Whether team wants `.harness/` committed by default | Policy → [project-state-policy.md](project-state-policy.md) |
| Multi-runtime “all” install ordering and conflicts | Installer design |

## Design Implications

1. **Runtime / plugin manager install is preferred** wherever the runtime supports marketplace, extension, or config-based plugins (Claude, Gemini, OpenCode, Cursor when documented).
2. **Root-level pack copy is fallback only** — `install.sh` → `install.js` `exportPaths` is manual/interim, not the recommended default ([plugin-install-ux.md](plugin-install-ux.md), [install-sh-usage.md](install-sh-usage.md)).
3. **Project `.harness/` is local project state** — not global; not shared across repos ([project-state-policy.md](project-state-policy.md)).
4. **Global plugin install must not create shared project state** for all repos — no `~/.harness/`; prompt per-repo init after global install.
5. **Each product repo needs its own `.harness/`** — profile, goals, team workflow are per-repository.
6. **Interactive installer** — runtime picker + scope picker → runtime-specific plan ([interactive-installer-design.md](interactive-installer-design.md)).
7. **Do not duplicate the full pack** in every repo unless a runtime requires project-local files — install only what that runtime needs.
8. **Dogfood per runtime** — Scenario C proved bulk copy works; next dogfood is per-runtime native install without root pollution.
