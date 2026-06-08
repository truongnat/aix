# Context Engineering

## Purpose

Describe the harness practices that keep context small, retrievable, and auditable.

## The Practices

- Compaction: shrink long sessions before they drift out of context
- Just-in-time retrieval: load the smallest useful artifact when a path or identifier is enough
- Structured notes: keep durable memory in typed markdown files, not chat scrollback
- Subagent isolation: delegate broad reads and narrow handoffs instead of dumping raw context
- Minimal tools: prefer a few explicit tools over overlapping capability surfaces

## How The Harness Implements Them

- `hooks/core/compact-session-memory.js` compacts long-lived session context
- `.harness/INDEX.md` acts as the on-demand registry for reusable commands and references
- `.harness/MEMORY.md`, `.harness/DECISIONS.md`, and `.harness/HAZARDS.md` store durable lessons
- `workers/` return bounded worker envelopes instead of raw file dumps
- when enabled, `record-subagent-result.js` persists compact worker notes to `.harness/memory/workers/<agent>.md`
- `tool-capabilities/TOOL_ROUTING.md` keeps tool selection narrow and explicit

## Just-In-Time Retrieval

Use identifiers first, then paths, then concise summaries.

- Prefer `.harness/INDEX.md` entries over re-deriving commands
- Prefer file paths over pasted file contents
- Prefer condensed map artifacts over broad raw scans
- Prefer one targeted artifact over multiple overlapping documents

## Spec Discipline

Behavior-changing work should produce a delta spec in `templates/CHANGE_SPEC.md`.

- `ADDED Requirements` describes new behavior
- `MODIFIED Requirements` describes changed behavior
- `REMOVED Requirements` describes retired behavior
- When `templates/harness-config.json` enables the spec layer, approved deltas can be folded into `.harness/specs/`

## What Not To Do

- Do not paste large files into context when a path or identifier will do
- Do not treat raw output as a durable note
- Do not mix transient working notes with reusable memory
