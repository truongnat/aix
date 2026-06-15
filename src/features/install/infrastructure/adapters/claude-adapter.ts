// Purpose: Claude Code provider adapter
// Layer: infrastructure
// Depends on: runtime-adapter (transitional), domain/provider-adapter
//
// Claude mapping — flesh out to read from ctx.core:
//   .claude/CLAUDE.md       <- adapt    core AGENTS.md
//   .claude/settings.json   <- inherit  core config (merge)
//   .claude/skills/         <- inherit + project extend
//   .claude/agents/         <- inherit + project extend (workers)

import { createRuntimeAdapter } from "./runtime-adapter";
import type { ProviderAdapter } from "../../domain/provider-adapter";

export const claudeAdapter: ProviderAdapter = createRuntimeAdapter("claude");
