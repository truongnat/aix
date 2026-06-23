// Purpose: Provider adapter registry (id -> adapter)
// Layer: infrastructure
// Depends on: per-provider adapters, domain/provider-adapter

import { codexAdapter } from "./codex-adapter";
import { claudeAdapter } from "./claude-adapter";
import { cursorAdapter } from "./cursor-adapter";
import { geminiAdapter } from "./gemini-adapter";
import { createRuntimeAdapter } from "./runtime-adapter";
import type { ProviderAdapter } from "../../domain/provider-adapter";

/** "manual" maps to the generic AGENTS install. */
const genericAdapter: ProviderAdapter = createRuntimeAdapter("generic");

const adapters: Record<string, ProviderAdapter> = {
  codex: codexAdapter,
  claude: claudeAdapter,
  cursor: cursorAdapter,
  gemini: geminiAdapter,
  generic: genericAdapter,
};

/** Look up the adapter for a provider/runtime id, or null when unsupported. */
export function getProviderAdapter(id: string): ProviderAdapter | null {
  return adapters[id] ?? null;
}

export { adapters };
