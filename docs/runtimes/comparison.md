# Runtime Comparison Guide

## Purpose

Help users choose a runtime guide and understand the shared capability-pack pattern across supported runtimes.

## Shared Consumption Pattern

Across runtimes, the recommended model is the same:

- install or copy the capability pack into the target repo
- keep `.harness/` artifacts in the target repo
- open or run the runtime against the target repo
- read `AGENTS.md` and installed docs first
- build or update the harness profile
- work against one active goal when possible
- validate profile and goal artifacts structurally
- report not-run verification honestly

## Runtime Comparison Table

| Runtime | Best Fit | Strength | Watch Out For | Guide |
|---|---|---|---|---|
| Claude Code | repo-local guided engineering sessions | strong read-first markdown workflow | accidentally treating the source pack repo as the product repo | [Claude Code](claude-code.md) |
| Cursor | editor-centric target repo workspaces | tight workspace flow around installed docs and artifacts | mixing harness maintenance and target-product work in one workspace | [Cursor](cursor.md) |
| Codex | scoped repo tasks with explicit artifact discipline | strong session discipline around planning and verification | letting one session drift across multiple goals | [Codex](codex.md) |
| Gemini CLI | terminal-oriented target repo sessions | simple CLI flow with explicit path control | ambiguity about which directory is active | [Gemini CLI](gemini-cli.md) |
| OpenCode | open agent workflows with explicit markdown operating context | flexible target-repo usage with explicit artifact updates | vague prompts that blur source pack and target repo | [OpenCode](opencode.md) |

## Choosing A Runtime

Choose the runtime that best matches how you already work:

- choose Claude Code when you want a guided repo-local markdown workflow
- choose Cursor when the target repo lives naturally inside an editor workspace
- choose Codex when you want explicit session discipline around planning and verification
- choose Gemini CLI when terminal-first target-repo operation is the simplest fit
- choose OpenCode when you want an open agent workflow with explicit markdown control

If unsure, choose the runtime you already use reliably and apply the shared consumption pattern first.

## Common Prompt Pattern

Use this prompt skeleton across runtimes:

> Read `AGENTS.md`, `docs/consume-as-pack.md`, `docs/install-to-profile-walkthrough.md`, and `docs/target-repo-validation.md`. Treat this repository as the target product repository. Do not treat the `ai-engineering-harness` source repo as the product repo. Inspect `.harness/` artifacts and summarize the current harness state before making changes.

## Common Validation Pattern

Use the same validation flow across runtimes:

```bash
node validate.js --target <path> --profile-only
node validate.js --target <path> --goal <goal-id>
```

Treat validation as structural only. It confirms required files and headings, not application correctness.

## Common Safety Boundaries

- keep markdown as the source of truth
- keep `.harness/` artifacts in the target repo
- do not invent runtime adapters or integrations
- do not treat structural validation as proof that the application is correct
- do not claim commands were run if they were only suggested

## What Not To Over-Optimize

Do not over-optimize runtime choice too early.

Avoid:

- inventing adapter behavior to smooth over normal runtime differences
- moving product-state artifacts back into the source pack repo
- treating runtime-specific wording differences as architecture decisions
- assuming one runtime needs a different harness model than the others
