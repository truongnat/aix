// Purpose: Bridge to src/cli modules for install/update/uninstall wizards.
// Layer: presentation
// Depends on: src/cli at compile time

import type {
  BackendSpawnResult,
  InstallPlan,
  PlanProviderId,
  ProviderBinaryMap,
  ProviderDescriptor,
  UiFacade,
} from "./cli-types";
import type { ParseOptions } from "../../../cli/args";

export type {
  ParseOptions,
  PlanProviderId,
  InstallPlan,
  ProviderDescriptor,
  ProviderBinaryMap,
};

/* eslint-disable @typescript-eslint/no-require-imports */
export const ui = require("../../../cli/ui/index.js").default as UiFacade;

export { modeToScopeVisibility, isNonInteractive } from "../../../cli/args";
export {
  ACTIVE_PROVIDERS,
  providerPriorityLabel,
  isRuntimeNative,
  FALLBACK_TARGETS,
} from "../../../cli/providers";
export {
  detectProviderBinaries,
  detectLegacyProviderResidue,
  detectInstalledProviders,
  isGitRepo,
} from "../../../cli/detect";
export { normalizeDomainSelection } from "../../../shared/stack-detect";
export {
  NON_GIT_PRIVATE_WARNING,
  NON_GIT_PRIVATE_WARNING_FOLLOWUP,
  buildInstallPlan,
} from "../../../cli/plan";
export {
  readPackageVersion,
  resolveTargetAbs,
  validateProviderSelection,
  validateManualMix,
  failWithBackendError,
} from "../../../cli/command-helpers";
