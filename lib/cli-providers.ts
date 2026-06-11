// Purpose: Backward-compat shim — implementation in src/cli/.
// Layer: presentation (shim)
// Depends on: dist/cli (built by build:src)

/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */
const api = require("../cli/providers.js") as any;

export const ACTIVE_PROVIDERS = api.ACTIVE_PROVIDERS;
export const ACTIVE_PROVIDER_IDS = api.ACTIVE_PROVIDER_IDS;
export const FALLBACK_TARGETS = api.FALLBACK_TARGETS;
export const RUNTIME_NATIVE_PROVIDER_IDS = api.RUNTIME_NATIVE_PROVIDER_IDS;
export const getProvider = api.getProvider;
export const isRuntimeNative = api.isRuntimeNative;
export const isSupportedProvider = api.isSupportedProvider;
export const providerPriorityLabel = api.providerPriorityLabel;

export type ProviderDescriptor = any;
export type ProviderPriority = any;
