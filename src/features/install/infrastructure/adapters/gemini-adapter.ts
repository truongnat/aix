// Purpose: Gemini provider adapter
// Layer: infrastructure
// Depends on: runtime-adapter (transitional), domain/provider-adapter
//
// Gemini mapping — flesh out to read from ctx.core:
//   .gemini/extensions/ai-engineering-harness/  <- adapt core (manifest + GEMINI.md)

import { createRuntimeAdapter } from "./runtime-adapter";
import type { ProviderAdapter } from "../../domain/provider-adapter";

export const geminiAdapter: ProviderAdapter = createRuntimeAdapter("gemini");
