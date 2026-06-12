// Purpose: Public exports for install feature.
// Layer: presentation
// Depends on: all install layers

export { runInstall } from "./application/run-install";
export type { InstallContext, InstallResult } from "./application/run-install";

export { initHarnessProfile } from "./infrastructure/harness-skeleton";
export type { SkeletonContext, SkeletonResult } from "./infrastructure/harness-skeleton";

export {
  ALL_RUNTIMES,
  deepMerge,
  installRuntime,
  installProviderCommands,
} from "./infrastructure/install-runtime";
export type {
  RuntimeId,
  InstallScope,
  InstallRuntimeOptions,
  ProviderCommandEntry,
  JsonObject,
} from "./infrastructure/install-runtime";

export {
  CACHE_DIR,
  cacheExportPaths,
  formatResults,
  installCapabilityCache,
  cacheRelativePath,
  listFiles,
  main as installCacheMain,
  parseArgs as parseInstallCacheArgs,
} from "./infrastructure/install-cache";
export type { InstallCacheOptions, CacheInstallResult } from "./infrastructure/install-cache";

export { runInstallBackend, runInstallWizard } from "./presentation/install-command";
