<div align="center">

# ai-engineering-harness

**Engineering discipline for AI coding agents.**

A markdown-first workflow guardrail kit that helps AI agents restore context, plan changes, verify with evidence, ship PR-ready reports, and remember durable project knowledge.

![Version](https://img.shields.io/badge/version-v1.0.0-2563eb)
![CI](https://github.com/truongnat/ai-engineering-harness/actions/workflows/ci.yml/badge.svg)
![License](https://img.shields.io/badge/license-MIT-16a34a)
![Markdown First](https://img.shields.io/badge/markdown-first-7c3aed)
![Docs](https://img.shields.io/badge/docs-GitHub%20Pages-818cf8)

[Quickstart](#quickstart) · [Session Start](#session-start) · [Ship & reports](#ship-means-pr-ready) · [Providers](#provider-support) · [Demo](#demo) · [Landing page](https://truongnat.github.io/ai-engineering-harness/)

</div>

---

## In 10 seconds

AI coding agents are good at editing code, but they often skip engineering discipline: stale context, weak plans, wrong-phase execution, optimistic verification, and incomplete handoff notes.

`ai-engineering-harness` gives them a repeatable operating contract:

```text
Session Start → Map → Discuss → Plan → Run → Verify → Ship → Remember
```

You get provider-specific rules, prompt templates, session memory, blocking gates, tool discovery, hooks, skills, delegated workers, and daily dev reports — not a heavy runtime platform.

---

## Who is this for?

**Perfect for:**
- Individual developers using Claude Code, Cursor, or Codex who want more structured workflows
- Tech leads introducing AI coding agents to their team and need process guardrails
- Teams frustrated by agent hallucination, skipped verification, or lost context between sessions
- Projects where code quality and traceability matter (not throwaway scripts)

**Not a fit for:**
- One-off code generation (use raw prompts instead)
- Projects that don't need documentation or team discipline
- Autonomous, unattended agent systems (this requires human judgment at gates)

---

## Quickstart

**First time?** Read [Your First 5 Minutes](docs/first-5-minutes.md) — a complete walk-through from install to shipping your first loop.

Inside your target project:

```bash
npx ai-engineering-harness install
npx ai-engineering-harness status
npx ai-engineering-harness doctor
```

Non-interactive (recommended for Claude):

```bash
npx ai-engineering-harness install --provider claude --yes
```

**Note:** `--provider` is preferred; `--runtime` is a deprecated alias.

Wizard details: [docs/npx-cli-ux.md](docs/npx-cli-ux.md), [docs/terminal-wizard-ux.md](docs/terminal-wizard-ux.md).

---

## What it gives you

| Layer | Purpose |
| --- | --- |
| Agent system prompt | Senior role, MUST/MUST NOT rules, response formats |
| Session Start | Restore active session, memory, blockers, next command |
| Commands | Canonical workflow contracts (map, start, discuss, plan, run, verify, ship, remember) |
| Prompt templates | Structured execution with blocked/ready branches |
| Session memory | Store work by session instead of flat root dumps |
| Tool discovery | Route to git, rg, worktree, markitdown, code-graph fallback |
| Hooks | Guard phase transitions and record evidence |
| Skills | Package reusable or session-specific capability |
| Reports | Generate `REPORT.md` and `PR_MESSAGE.md` from real changes |

## Comparison: With vs Without

| Scenario | Without Harness | With Harness |
|---|---|---|
| **Agent starts a task** | Reads goal, starts coding | Reads goal, maps context, writes discussion, plans, codes |
| **Agent finishes coding** | Says "done" and ships | Runs tests, writes verify.md with evidence, ships with report |
| **Session ends** | Context lost, no memory | Saves decisions, lessons, and state for next session |
| **Next session** | Starts from scratch | Restores context and continues where you left off |
| **You review PR** | Code only, no plan/evidence | See plan, discussion, verification evidence, change summary |
| **A bug is found** | No idea why code was written this way | Decisions and rationale are in session memory |

**The difference:** Without the harness, your agent is a code generator. With the harness, it's an engineer who documents its work.

---

## Canonical commands

```text
harness-start
harness-map
harness-discuss
harness-plan
harness-run
harness-verify
harness-ship
harness-remember
```

Canonical command IDs use hyphen form, e.g. `harness-plan`.

Claude project commands may expose them as `/harness-plan`.

Do not use legacy colon-separated or underscore command ID forms. Use hyphen form only (`harness-plan`).

---

## Session Start

Every workflow begins with [Session Start](docs/session-start.md).

`harness-start` restores:

- active session
- current goal and phase
- blocked state
- durable memory and hazards
- tool context
- next allowed command

No implementation, verification, or shipping should happen before session state is established.

---

## Agent System Prompt

The harness includes a provider-neutral system prompt that makes agents behave like disciplined senior engineering agents.

It defines:

- senior engineering role
- phase discipline
- MUST / MUST NOT rules
- blocked output
- evidence standard
- response formats
- report quality

This is what turns the harness from passive docs into an operating contract.

Source: [agent-system/SYSTEM_PROMPT.md](agent-system/SYSTEM_PROMPT.md) (installed to `.ai-harness/agent-system/`).

---

## Ship means PR-ready

`harness-ship` does not just say "done".

It prepares, when verification supports it:

- `REPORT.md`
- `PR_MESSAGE.md`
- `CHANGE_SUMMARY.md`

based on real git changes and verification evidence.

See [docs/daily-dev-report.md](docs/daily-dev-report.md).

---

## Provider support

| Provider | 1.0.0 support |
| --- | --- |
| Claude Code | **Recommended** — project commands, agents, hook examples |
| Cursor | Rules fallback through `.cursor/rules/` |
| Codex | `AGENTS.md` fallback |
| Gemini | Extension / context fallback |

Only Claude currently gets project-native `/harness-*` command files. Other providers use honest fallback routing.

Matrix: [docs/provider-command-matrix.md](docs/provider-command-matrix.md), [docs/provider-rule-configuration.md](docs/provider-rule-configuration.md).

---

## File layout

```text
.ai-harness/           capability cache (commands, templates, skills, agent-system)
.harness/              project router and durable memory
.harness/sessions/     working artifacts per session
.claude/               Claude provider adapter (when installed)
.cursor/rules/         Cursor provider adapter
AGENTS.md              generic / Codex fallback
```

Details: [docs/session-memory.md](docs/session-memory.md), [docs/private-capability-cache.md](docs/private-capability-cache.md).

---

## Demo

End-to-end workflow-artifact dogfood: [examples/dogfood-tiny-node-api](examples/dogfood-tiny-node-api).

```bash
cd examples/dogfood-tiny-node-api && npm test
```

The demo shows workflow artifacts and verification evidence in [VERIFY.md](examples/dogfood-tiny-node-api/.harness/VERIFY.md). It is not a claim that every provider behaves identically.

Transcript: [TRANSCRIPT.md](examples/dogfood-tiny-node-api/TRANSCRIPT.md).

---

## Limitations

- Provider-native command support differs; Claude is the strongest path.
- Hooks are provider-specific; Claude has the richest examples.
- Optional tools (rg, markitdown, codegraph) are best-effort.
- Human approval is still required for risky or ambiguous decisions.
- This is a **guardrail kit**, not an autonomous software engineer, agent framework, or orchestration server.

---

## Docs

| Topic | Doc |
| --- | --- |
| Agent system prompt | [agent-system/SYSTEM_PROMPT.md](agent-system/SYSTEM_PROMPT.md) |
| Session Start | [docs/session-start.md](docs/session-start.md) |
| Daily dev report | [docs/daily-dev-report.md](docs/daily-dev-report.md) |
| Provider rules | [docs/provider-rule-configuration.md](docs/provider-rule-configuration.md) |
| Tool discovery | [docs/tool-discovery-and-routing.md](docs/tool-discovery-and-routing.md) |
| Hooks & skills | [docs/hooks-and-skills-layer.md](docs/hooks-and-skills-layer.md) |
| Session memory | [docs/session-memory.md](docs/session-memory.md) |
| Command guardrails | [docs/command-guardrails.md](docs/command-guardrails.md) |

Release: [docs/v1.0.0-release-notes.md](docs/v1.0.0-release-notes.md)

---

## Maintainers

```bash
node validate.js
npm test
cd site && npm run build
```

Publish: [docs/npm-publish.md](docs/npm-publish.md)

---

## Status

**v1.0.0** — Workflow guardrails foundation. Core command loop, session layout, and provider adapters are stable enough for real dogfooding; per-provider behavior still varies.

MIT · [CONTRIBUTING.md](CONTRIBUTING.md) · [SECURITY.md](SECURITY.md)
