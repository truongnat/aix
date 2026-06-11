// Purpose: Bridge to legacy CLI modules until Phase 7 CLI router migration.
// Layer: presentation
// Depends on: dist/lib CLI modules at runtime

/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */

import type {
  BackendSpawnResult,
  InstallPlan,
  ParseOptions,
  PlanProviderId,
  ProviderBinaryMap,
  ProviderDescriptor,
  UiFacade,
} from "./cli-types";

export type { ParseOptions, PlanProviderId, InstallPlan, ProviderDescriptor };

function req(modulePath: string): any {
  return require(modulePath);
}

export const ui = req("../../../lib/cli-ui.js") as UiFacade;

export const { modeToScopeVisibility, isNonInteractive } = req("../../../lib/cli-args.js") as {
  modeToScopeVisibility: (mode: string) => { scope: string; visibility: string };
  isNonInteractive: (options: ParseOptions) => boolean;
};

export const { ACTIVE_PROVIDERS, providerPriorityLabel, isRuntimeNative, FALLBACK_TARGETS } =
  req("../../../lib/cli-providers.js") as {
    ACTIVE_PROVIDERS: readonly ProviderDescriptor[];
    providerPriorityLabel: (provider: ProviderDescriptor) => string;
    isRuntimeNative: (runtime: string) => boolean;
    FALLBACK_TARGETS: readonly ProviderDescriptor[];
  };

export const {
  detectProviderBinaries,
  detectLegacyProviderResidue,
  detectInstalledProviders,
  isGitRepo,
} = req("../../../lib/cli-detect.js") as {
  detectProviderBinaries: () => ProviderBinaryMap;
  detectLegacyProviderResidue: (targetAbs: string) => string[];
  detectInstalledProviders: (targetAbs: string, options?: { includeLegacy?: boolean }) => string[];
  isGitRepo: (targetAbs: string) => boolean;
};

export const { normalizeDomainSelection } = req("../../../lib/stack-detect.js") as {
  normalizeDomainSelection: (domains: string[]) => string[];
};

export const { NON_GIT_PRIVATE_WARNING, NON_GIT_PRIVATE_WARNING_FOLLOWUP, buildInstallPlan } =
  req("../../../lib/cli-plan.js") as {
    NON_GIT_PRIVATE_WARNING: string;
    NON_GIT_PRIVATE_WARNING_FOLLOWUP: string;
    buildInstallPlan: (options: {
      providers: PlanProviderId[];
      initHarness: boolean;
      installCache: boolean;
      mode: string;
      isGit: boolean;
    }) => InstallPlan;
  };

export const {
  readPackageVersion,
  resolveTargetAbs,
  validateProviderSelection,
  validateManualMix,
  failWithBackendError,
} = req("../../../lib/cli-command-helpers.js") as {
  readPackageVersion: (packRoot: string) => string;
  resolveTargetAbs: (target: string) => string;
  validateProviderSelection: (providers: string[]) => void;
  validateManualMix: (providers: string[]) => void;
  failWithBackendError: (kind: string, result: BackendSpawnResult, options: ParseOptions) => number;
};
