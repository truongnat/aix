# Runtime Native Install Dogfood Plan

## Purpose

Ordered dogfood sequence for runtime-native install **after** [runtime-native-install-audit.md](runtime-native-install-audit.md). Do not mark a runtime stable until its scenario report exists.

Use a **disposable external repo** (not committed to this pack), same pattern as [scenario-c-one-line-installer.md](pack-dogfood-reports/scenario-c-one-line-installer.md).

## Prerequisites

- Node.js on PATH
- Pack source clone or `install.sh` from `main`
- Empty or throwaway git repo as target

## Dogfood Order

| Step | Runtime | Why this order |
|---|---|---|
| 1 | **generic** (project) | Single `AGENTS.md` write; no marketplace |
| 2 | **codex** (project) | Same surface as generic; validate Codex reads file |
| 3 | **cursor** (project) | `.mdc` rule; verify in Cursor Agent |
| 4 | **opencode** (project) | Plugin JS + config paths |
| 5 | **gemini** (global **or** project) | Extension layout; confirm load path |
| 6 | **claude** (project then global) | Marketplace follow-up required |

**Defer:** `--runtime all` until single-runtime scenarios pass.

---

## 1. Generic (project) — completed (Scenario D1)

**Status:** **experimental PASS** — [scenario-d1-generic-project.md](pack-dogfood-reports/scenario-d1-generic-project.md) (2026-06-02). Post-D2 patch fixed init/runtime `AGENTS.md` conflict — spot-check recommended. Stable claim remains **No** until full matrix and manual agent checks.

**Command:**

```bash
sh install.sh --runtime generic --scope project --target <repo> --init-harness --yes
```

**Expected files:**

```txt
<repo>/AGENTS.md
<repo>/.harness/HARNESS.md … MEMORY.md
<repo>/.harness/goals/.gitkeep
```

**Validation:**

```bash
node validate.js --target <repo> --runtime generic --profile-only
```

**Manual:** Open repo in any AGENTS.md-capable agent; confirm it mentions `.harness/`.

**Rollback:** Remove `AGENTS.md`, `.harness/`.

**Evidence:** `docs/pack-dogfood-reports/scenario-d1-generic-project.md`

---

## 2. Codex (project) — completed (Scenario D2)

**Status:** **experimental PASS** (structural) — [scenario-d2-codex-project.md](pack-dogfood-reports/scenario-d2-codex-project.md) (2026-06-02). Manual `codex exec` **BLOCKED** (API usage limit). Post-D2 patch fixed init/runtime `AGENTS.md` conflict — spot-check recommended. Stable claim **No**.

**Command:**

```bash
sh install.sh --runtime codex --scope project --target <repo> --init-harness --yes
```

**Expected:** Same as generic for files (codex uses same bootstrap).

**Validation:**

```bash
node validate.js --target <repo> --runtime codex --profile-only
```

**Manual:** Run `codex` in target; ask it to summarize loaded instructions.

**Rollback:** Same as step 1.

**Evidence:** `scenario-d2-codex-project.md`

---

## 3. Cursor (project) — completed (Scenario D3)

**Status:** **experimental PASS** (file/install) — [scenario-d3-cursor-project.md](pack-dogfood-reports/scenario-d3-cursor-project.md) (2026-06-02). Validate with `--runtime cursor`. Manual Cursor IDE check **not run**. Stable claim **No**.

**Command:**

```bash
sh install.sh --runtime cursor --scope project --target <repo> --init-harness --yes
```

**Expected:**

```txt
<repo>/.cursor/rules/ai-engineering-harness.mdc
```

**Validation:**

```bash
node validate.js --target <repo> --runtime cursor --profile-only
```

**Manual:** Cursor → check Rules; run Agent chat; confirm rule applies.

**Optional:** Repeat with `--runtime windsurf` and confirm identical files.

**Evidence:** `scenario-d3-cursor-project.md`

---

## 4. OpenCode (project) — completed (Scenario D4)

**Status:** **experimental PASS** (file/install) — [scenario-d4-opencode-project.md](pack-dogfood-reports/scenario-d4-opencode-project.md) (2026-06-02). Runtime-aware validation **pass**; legacy `--profile-only` fails without `AGENTS.md` (expected). Manual OpenCode **BLOCKED** (CLI not on host). Stable claim **No**.

**Command:**

```bash
sh install.sh --runtime opencode --scope project --target <repo> --init-harness --yes
```

**Expected:**

```txt
<repo>/.opencode/plugins/ai-engineering-harness.js
<repo>/opencode.json
```

**Validation:**

```bash
node validate.js --target <repo> --runtime opencode --profile-only
```

**Manual:** Start OpenCode in repo; confirm plugin loads (console bootstrap message).

**Evidence:** `scenario-d4-opencode-project.md`

---

## 5. Gemini (global recommended first) — completed (Scenario D5)

**Status:** **experimental PASS** (file/install) — [scenario-d5-gemini.md](pack-dogfood-reports/scenario-d5-gemini.md) (2026-06-02). Project validation **pass** with `--runtime gemini`. Global write tested (safe CREATE). Manual CLI load **not confirmed**. Stable claim **No**.

**Command (global):**

```bash
sh install.sh --runtime gemini --scope global --target <repo> --yes
```

**Expected:**

```txt
~/.gemini/extensions/ai-engineering-harness/gemini-extension.json
~/.gemini/extensions/ai-engineering-harness/GEMINI.md
```

**Manual:** `gemini extensions list` or start CLI; verify extension visible.

**Project variant (best-effort):**

```bash
sh install.sh --runtime gemini --scope project --target <repo> --yes
```

Document whether project-local path loads.

**Validation (project):**

```bash
node validate.js --target <repo> --runtime gemini --profile-only
```

**Evidence:** `scenario-d5-gemini.md`

---

## 6. Claude (project, then global) — completed (Scenario D6)

**Status:** **experimental PASS** (project file/install) — [scenario-d6-claude.md](pack-dogfood-reports/scenario-d6-claude.md) (2026-06-02). Global dry-run recorded; global write **not run** (existing `~/.claude/settings.json`). Manual `/plugin install` **not run**. Stable claim **No**.

**Project command:**

```bash
sh install.sh --runtime claude --scope project --target <repo> --init-harness --yes
```

**Expected:**

```txt
<repo>/.claude/CLAUDE.md
<repo>/.claude/settings.json   # merged marketplace entry
```

**Validation:**

```bash
node validate.js --target <repo> --runtime claude --profile-only
```

**Manual:** Open Claude Code; run `/plugin install ai-engineering-harness@ai-engineering-harness`; confirm plugin or document failure.

**Global command:**

```bash
sh install.sh --runtime claude --scope global --target <repo> --yes
```

**Evidence:** `scenario-d6-claude.md`

---

## Report Template

Each scenario file should include:

- Date, ref, host OS
- Exact command
- Dry-run output (optional)
- Write output (CREATE/SKIP/UPDATE lines)
- Directory listing
- Validation command result
- Manual tool check result (PASS / FAIL / BLOCKED)
- Friction notes
- Verdict: **experimental PASS** | **FAIL** | **BLOCKED**

## After Dogfood

- **D1–D6:** complete — see [runtime-dogfood-summary.md](runtime-dogfood-summary.md)
- **Readiness:** [v0.9.x-readiness.md](v0.9.x-readiness.md), [v0.9.x-release-scope.md](v0.9.x-release-scope.md)
- **Next steps:**
  - Manual runtime follow-up checks (IDE/CLI sessions) before any stable claim
  - v0.9.x experimental release pass if readiness accepted
  - **Do not** dogfood or document `--runtime all` as stable
- Update [plugin-install-ux.md](plugin-install-ux.md) when manual checks complete
- v1.0 re-freeze only after stable manual evidence per runtime
