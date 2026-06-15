// Purpose: Codex provider adapter
// Layer: infrastructure
// Depends on: runtime-adapter (transitional), domain/provider-adapter
//
// Codex mapping (refactor.md §2.3) — flesh out to read from ctx.core:
//   rules/default.rules       <- inherit  core rules
//   rules/<title>.rules       <- generate from ctx.project
//   hooks.json + config.toml  <- inherit  core hooks
//   .codex/AGENTS.md          <- adapt    core AGENTS.md
//   skills/                   <- inherit + project extend
//   agents/ (subagents)       <- inherit + project extend
//   plugins/                  <- custom   codex-only
//   mcp                       <- coming soon

import { createRuntimeAdapter } from "./runtime-adapter";
import type { ProviderAdapter } from "../../domain/provider-adapter";

export const codexAdapter: ProviderAdapter = createRuntimeAdapter("codex");
