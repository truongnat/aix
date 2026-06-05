# Evals

This directory contains the eval harness source of truth:

- `registry/` for benchmark task manifests
- `fixtures/` for deterministic task repos and workspaces
- `rubrics/` for scoring contracts

The first implementation pass is deterministic and local-only. It is designed for repeatable CI and local regression checks, not live-provider orchestration.
