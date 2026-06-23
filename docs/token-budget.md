# Token Budget

## Purpose

Explain why the harness stays lightweight and how that affects design choices.

## Why It Matters

- Small, explicit artifacts are easier to audit than large orchestration layers
- File-backed state is easier to inspect than hidden runtime context
- Narrow worker contracts reduce repeated context overhead
- Markdown-first guidance keeps the system readable across providers

## Practical Guidance

- Prefer a short chain of artifacts over a large context dump
- Use dedicated workers for broad reads and bounded handoffs
- Keep plans, specs, and verification separate so each artifact stays focused
- Keep optional features opt-in when they add maintenance cost

## Tradeoff

This harness intentionally favors clarity and verification over heavyweight team orchestration.
That keeps routine work cheaper to run, easier to review, and easier to port across providers.
