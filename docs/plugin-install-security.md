# Plugin Install Security

## Purpose

Document risks and safe practices for historical remote pack installation flows.

## Historical Shell Risk

Historical remote wrapper notes are archived because they describe a removed install surface. Users should treat any remote installer like a trusted package source: pin versions and review when stakes are high.

## Pin To Tag

Prefer pinned package versions for reproducible installs. Runtime-native modes remain **experimental**; stable per-runtime support is not claimed.

## No Secrets

Install flow must not embed tokens. Private repos are out of scope for the public one-line install; use manual clone or a private package distribution path.

## Relationship To Frozen Contracts

Installing into a target repo still follows [frozen-installed-surface-contract.md](frozen-installed-surface-contract.md) copy behavior via `bin/aih.js install`. Security doc does not change installed surface; it governs **how** the pack arrives on disk.
