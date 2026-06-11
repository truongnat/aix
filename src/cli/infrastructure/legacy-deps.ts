// Purpose: Bridge to legacy lib modules until later migration phases.
// Layer: infrastructure
// Depends on: dist/lib at runtime

/* eslint-disable @typescript-eslint/no-require-imports */

export const {
  detectInstalledProviders,
  detectLegacyProviderResidue,
  detectRecommendedProviders,
  fileContainsHarnessMarker,
  isGitRepo,
} = require("../../lib/provider-detection.js") as {
  detectInstalledProviders: (...args: unknown[]) => string[];
  detectLegacyProviderResidue: (targetAbs: string) => string[];
  detectRecommendedProviders: (...args: unknown[]) => string[];
  fileContainsHarnessMarker: (content: string) => boolean;
  isGitRepo: (targetAbs: string) => boolean;
};

export const {
  detectProviderBinaries,
  listDetectedProviderIds: listDetectedProviderBinaryIds,
} = require("../../lib/provider-binary-detect.js") as {
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
} = require("../../lib/runtime-command-catalog.js") as {
  runtimeCommandCatalogPathsForPlan: (...args: unknown[]) => string[];
  formatCommandSupportForPlan: (...args: unknown[]) => string;
};

export const { runDoctor, runStatus } = require("../../lib/backend/status-doctor.js") as {
  runDoctor: (options: { targetAbs: string }) => { text?: string; ok?: boolean };
  runStatus: (options: { targetAbs: string }) => { text?: string };
};
