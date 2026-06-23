// Purpose: Bridge to install infrastructure modules.
// Layer: infrastructure

/* eslint-disable @typescript-eslint/no-require-imports */

export const {
  detectInstalledProviders,
  detectLegacyProviderResidue,
  detectRecommendedProviders,
  fileContainsHarnessMarker,
  isGitRepo,
} = require("../../features/install/infrastructure/provider-detection.js") as {
  detectInstalledProviders: (...args: unknown[]) => string[];
  detectLegacyProviderResidue: (targetAbs: string) => string[];
  detectRecommendedProviders: (...args: unknown[]) => string[];
  fileContainsHarnessMarker: (content: string) => boolean;
  isGitRepo: (targetAbs: string) => boolean;
};

export const {
  detectProviderBinaries,
  listDetectedProviderIds: listDetectedProviderBinaryIds,
} = require("../../features/install/infrastructure/provider-binary-detect.js") as {
  detectProviderBinaries: () => Record<
    string,
    {
      providerId: string;
      commands: string[];
      commandUsed: string | null;
      installed: boolean;
      version: string | null;
      output: string;
    }
  >;
  listDetectedProviderIds: () => string[];
};

export const {
  runtimeCommandCatalogPathsForPlan,
  formatCommandSupportForPlan,
} = require("../../features/install/infrastructure/runtime-command-catalog.js") as {
  runtimeCommandCatalogPathsForPlan: (...args: unknown[]) => string[];
  formatCommandSupportForPlan: (...args: unknown[]) => string;
};

export const { runDoctor, runStatus } = require("../../features/install/infrastructure/status-doctor.js") as {
  runDoctor: (options: { targetAbs: string }) => { text?: string; ok?: boolean };
  runStatus: (options: { targetAbs: string }) => { text?: string };
};
