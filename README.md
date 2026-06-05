<div align="center">

# ai-engineering-harness

**Professional workflow guardrails for AI coding agents.**

A markdown-first, open-source kit that helps agents restore context, plan before coding, verify with evidence, ship reviewer-ready summaries, and preserve durable project knowledge.

![Version](https://img.shields.io/badge/version-v1.0.1-2563eb)
![CI](https://github.com/truongnat/ai-engineering-harness/actions/workflows/ci.yml/badge.svg)
![License](https://img.shields.io/badge/license-MIT-16a34a)
![Open Source](https://img.shields.io/badge/open-source-0f172a)
![Docs](https://img.shields.io/badge/docs-GitHub%20Pages-818cf8)

[Quickstart](#quickstart) · [Walkthrough](#watch-the-walkthrough) · [Commands](#canonical-commands) · [Providers](#provider-support) · [Demo](#demo) · [Landing page](https://truongnat.github.io/ai-engineering-harness/)

</div>

---

## In 30 seconds

AI coding agents are fast at editing files, but they often skip engineering discipline:

- They start with stale context.
- They code before the plan is clear.
- They claim success without real evidence.
- They end sessions without durable handoff artifacts.

`ai-engineering-harness` gives them a repeatable operating contract:

```text
Session Start → Map → Discuss → Plan → Run → Verify → Ship → Remember
```

The result is a lighter-weight, easier-to-audit workflow for real software work, not just prompt-driven code generation.

---

## Why teams use it

- **Professional workflow:** command contracts, phase guards, and explicit stop conditions
- **Easy to inspect:** markdown artifacts live in the repo and are readable without a special UI
- **Honest verification:** `VERIFY.md`, `REPORT.md`, and `PR_MESSAGE.md` are grounded in real evidence
- **Open-source friendly:** works as a repo-level discipline layer, not a closed orchestration platform

---

## Quickstart

**First time?** Start with [Your First 5 Minutes](docs/first-5-minutes.md).

Inside your target project:

```bash
npx ai-engineering-harness install
npx ai-engineering-harness status
npx ai-engineering-harness doctor
```

Non-interactive install:

```bash
npx ai-engineering-harness install --provider claude --yes
```

**Note:** `--provider` is preferred; `--runtime` is a deprecated alias.

Wizard details: [docs/npx-cli-ux.md](docs/npx-cli-ux.md), [docs/terminal-wizard-ux.md](docs/terminal-wizard-ux.md)

---

## Watch the walkthrough

Walkthrough video file: [AI_Engineering_Harness.mp4](./AI_Engineering_Harness.mp4)

Landing page with embedded player: [truongnat.github.io/ai-engineering-harness](https://truongnat.github.io/ai-engineering-harness/)

> GitHub's README renderer does not reliably provide an inline player for a repo-local MP4, so the video is linked here and embedded on the landing page instead.

---

## What it gives you

| Layer | Purpose |
| --- | --- |
| Agent system prompt | Senior role, MUST/MUST NOT rules, response formats |
| Session Start | Restore active session, memory, blockers, and next command |
| Commands | Canonical workflow contracts for map, discuss, plan, run, verify, ship, and remember |
| Prompt templates | Structured execution with blocked and ready branches |
| Session memory | Store work by session instead of flat root dumps |
| Tool discovery | Route to git, rg, worktree, markitdown, and code-graph fallbacks |
| Hooks | Guard phase transitions and record evidence |
| Skills | Package reusable or session-specific capability |
| Reports | Generate `REPORT.md` and `PR_MESSAGE.md` from real changes |

## TypeScript & JSDoc Support

Full type definitions and JSDoc comments for IDE autocomplete:

```typescript
import type { InstallOptions } from 'ai-engineering-harness'

const options: InstallOptions = {
  target: './my-project',
  dryRun: true,
  force: false,
}
```

See [docs/typescript-usage.md](docs/typescript-usage.md) for the full API reference.

---

## Comparison: with vs without

| Scenario | Without harness | With harness |
| --- | --- | --- |
| Agent starts a task | Reads goal, starts coding | Restores context, maps scope, writes discussion, then plans |
| Agent finishes coding | Says "done" and ships | Runs checks, writes evidence, prepares report artifacts |
| Session ends | Context disappears | Decisions, state, and lessons are preserved |
| Next session | Starts from scratch | Continues from explicit session state |
| PR review | Code only | Plan, rationale, verification evidence, and change summary |

**The difference:** without the harness, your agent is mostly a code editor. With the harness, it behaves more like an engineer operating inside a process.

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

Canonical command IDs use hyphen form only, for example `harness-plan`.

Claude project commands may expose them as `/harness-plan`.

Do not use legacy colon-separated or underscore forms.

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

The harness includes a provider-neutral system prompt that pushes agents toward senior-engineering behavior instead of optimistic assistant behavior.

It defines:

- phase discipline
- MUST and MUST NOT rules
- blocked-state behavior
- evidence standards
- response and report expectations

Source: [agent-system/SYSTEM_PROMPT.md](agent-system/SYSTEM_PROMPT.md)

---

## Ship means PR-ready

`harness-ship` does more than say "done".

When verification supports it, it prepares:

- `REPORT.md`
- `PR_MESSAGE.md`
- `CHANGE_SUMMARY.md`

based on real git changes and verification evidence.

See [docs/daily-dev-report.md](docs/daily-dev-report.md).

---

## Provider support

**Support tiers vary significantly.** Understand what your provider can do before relying on advanced features.

| Capability | Claude | Cursor | Codex | Gemini |
| --- | --- | --- | --- | --- |
| Slash commands | 8 native | Rules fallback | Rules fallback | Rules fallback |
| Workers/subagents | 4 native | Manual setup | Manual setup | Manual setup |
| Lifecycle hooks | 4 events | Manual setup | Manual setup | Manual setup |
| Grade | ⭐⭐⭐ A | ⭐⭐ C+ | ⭐⭐ C+ | ⭐⭐ C+ |

**What this means:**

- **Claude:** strongest path, with native command and worker support
- **Cursor, Codex, Gemini:** core discipline works, but hooks and advanced behavior need manual setup or fallbacks

Provider-specific setup: [docs/provider-rule-configuration.md](docs/provider-rule-configuration.md), [docs/adoption-guide.md](docs/adoption-guide.md)

The phase discipline itself is platform-agnostic and works everywhere.

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

Details: [docs/session-memory.md](docs/session-memory.md), [docs/private-capability-cache.md](docs/private-capability-cache.md)

---

## Demo

End-to-end workflow-artifact dogfood: [examples/dogfood-tiny-node-api](examples/dogfood-tiny-node-api)

```bash
cd examples/dogfood-tiny-node-api
npm test
```

The demo shows workflow artifacts and verification evidence in [VERIFY.md](examples/dogfood-tiny-node-api/.harness/VERIFY.md). It is not a claim that every provider behaves identically.

Transcript: [TRANSCRIPT.md](examples/dogfood-tiny-node-api/TRANSCRIPT.md)

---

## Docs

| Topic | Doc |
| --- | --- |
| Agent system prompt | [agent-system/SYSTEM_PROMPT.md](agent-system/SYSTEM_PROMPT.md) |
| Session Start | [docs/session-start.md](docs/session-start.md) |
| Daily dev report | [docs/daily-dev-report.md](docs/daily-dev-report.md) |
| Provider rules | [docs/provider-rule-configuration.md](docs/provider-rule-configuration.md) |
| Tool discovery | [docs/tool-discovery-and-routing.md](docs/tool-discovery-and-routing.md) |
| Hooks and skills | [docs/hooks-and-skills-layer.md](docs/hooks-and-skills-layer.md) |
| Session memory | [docs/session-memory.md](docs/session-memory.md) |
| Command guardrails | [docs/command-guardrails.md](docs/command-guardrails.md) |

Release notes: [docs/v1.0.1-release-notes.md](docs/v1.0.1-release-notes.md)

---

## Limitations

- Provider-native command support differs; Claude is the strongest path.
- Hooks are provider-specific.
- Optional tools such as `rg`, `markitdown`, and code-graph integrations are best-effort.
- Human approval is still required for risky or ambiguous decisions.
- This is a **guardrail kit**, not an autonomous software engineer or orchestration server.

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

**v1.0.1**: patch release for README clarity, landing-page polish, walkthrough integration, and release metadata alignment. Core workflow contracts and provider support posture are unchanged.

MIT · [CONTRIBUTING.md](CONTRIBUTING.md) · [SECURITY.md](SECURITY.md)
