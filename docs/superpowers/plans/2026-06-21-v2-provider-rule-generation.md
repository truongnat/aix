# V2 Provider Rule Generation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate Claude and Codex rule surfaces in `v2` from one common ai-harness rule model instead of copying provider-specific rule files directly.

**Architecture:** Keep provider-neutral rule content under `.ai-harness/rules/` and a structured common rule model under `v2/src`. Install uses that model to render Claude project settings and Codex `.rules` files with provider-specific syntax. The installer still copies shared core assets into `.ai-harness`, but provider rule outputs become generated artifacts.

**Tech Stack:** TypeScript, Bun tests, Node filesystem APIs, Markdown templates

## Global Constraints

- Preserve the current `v2` local/global install scope behavior.
- Keep `.ai-harness` as the shared core surface for copied assets and generated common rule material.
- Generate Claude output in Claude-native settings/instruction form, not Codex `.rules` syntax.
- Generate Codex output in Codex-native `.rules` syntax, not Claude settings syntax.
- Follow TDD: add failing tests before implementation changes.

---

### Task 1: Add Common Rule Model And Renderer Tests

**Files:**
- Modify: `v2/test/install-surfaces.test.ts`
- Create: `v2/test/provider-rules.test.ts`

**Interfaces:**
- Consumes: existing install helper tests
- Produces: tests for `renderClaudePermissions()`, `renderCodexRules()`, `copyCoreRuleSources()`, and `installProviderRules()`

- [ ] Write failing tests for core rule copy and provider rule generation.
- [ ] Run `bun test v2/test/provider-rules.test.ts` and confirm it fails for missing modules/functions.

### Task 2: Implement Common Rule Model And Provider Renderers

**Files:**
- Create: `v2/src/rules/common-rules.ts`
- Create: `v2/src/rules/render-claude-rules.ts`
- Create: `v2/src/rules/render-codex-rules.ts`

**Interfaces:**
- Consumes: existing core rule text in `rules/core/*`, provider guidance from `rules/providers/claude/*`, `rules/providers/codex/*`
- Produces: `getCommonRulesConfig()`, `renderClaudePermissions()`, `renderCodexRules()`

- [ ] Implement a structured common rule model for shared command and file policies.
- [ ] Implement a Claude renderer that emits project settings-compatible permission JSON fragments and adapter instruction text.
- [ ] Implement a Codex renderer that emits `.rules` file content using `prefix_rule(...)`.
- [ ] Run focused Bun tests and confirm they pass.

### Task 3: Wire Rule Install Into V2 Installer

**Files:**
- Modify: `v2/src/lib/install-skill-surfaces.ts`
- Modify: `v2/src/command/install/index.ts`
- Modify: `v2/src/local/index.ts`

**Interfaces:**
- Consumes: common rule model and renderer outputs
- Produces: `.ai-harness/rules/...`, `.claude/settings.json` or generated fragment, `.codex/rules/default.rules`

- [ ] Add core rule copy helpers for `.ai-harness/rules/core`.
- [ ] Add install helpers that generate provider rule outputs from the common model.
- [ ] Wire install flow so rule generation follows the same local/global scope as core/provider surfaces.
- [ ] Run tests for install integration.

### Task 4: Verify V2 Rule Generation End To End

**Files:**
- Modify: `v2/test/provider-rules.test.ts`

**Interfaces:**
- Consumes: installer helpers and renderer functions
- Produces: end-to-end verification of generated Claude/Codex outputs

- [ ] Add integration coverage for Claude generated settings content and Codex `.rules` content.
- [ ] Run `bun test v2/test/install-surfaces.test.ts v2/test/provider-rules.test.ts`.
- [ ] Run `npx tsc -p v2/tsconfig.json`.
