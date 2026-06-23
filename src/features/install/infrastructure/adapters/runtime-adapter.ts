// Purpose: Bridge a ProviderAdapter onto the existing runtime-native install
// Layer: infrastructure
// Depends on: install-runtime, domain/provider-adapter
//
// Transitional helper: each provider adapter currently delegates to the
// existing installRuntime() logic. As providers are migrated to read from the
// shared core (CoreSource) per refactor.md, replace the per-provider adapter
// body with a real core->surface mapping instead of this delegation.

import { installRuntime, type RuntimeId } from "../install-runtime";
import type { AdapterContext, AdapterResult, ProviderAdapter } from "../../domain/provider-adapter";

type DelegableRuntime = Exclude<RuntimeId, "all">;

/** Build an adapter that maps the shared core onto a runtime-native install. */
export function createRuntimeAdapter(id: DelegableRuntime): ProviderAdapter {
  return {
    id,
    install(ctx: AdapterContext): AdapterResult {
      const messages: string[] = [];
      try {
        installRuntime({
          packRoot: ctx.packRoot,
          runtime: id,
          scope: ctx.scope,
          target: ctx.targetRoot,
          dryRun: ctx.dryRun,
          force: ctx.force,
        });
        messages.push(`${id}: ok`);
        return { provider: id, ok: true, messages };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        messages.push(`${id}: ${message}`);
        return { provider: id, ok: false, messages };
      }
    },
  };
}
