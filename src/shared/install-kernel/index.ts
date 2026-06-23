// Purpose: Public exports for install-kernel shared module.
// Layer: domain
// Depends on: constants, git-hygiene

export {
  EXCLUDE_BLOCK_START,
  EXCLUDE_BLOCK_END,
  HARNESS_MARKER,
  providerCommandPaths,
  ignorePathsForProvider,
  uninstallPathsForProvider,
} from "./constants";

export {
  applyPrivateIgnore,
  collectIgnorePaths,
  hasHarnessExcludeBlock,
  reconcileDeferredPrivateIgnore,
  removeIgnoreBlock,
} from "./git-hygiene";
export type { IgnoreContext, IgnoreResult } from "./git-hygiene";
