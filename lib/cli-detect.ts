// Purpose: Backward-compat shim — implementation in src/cli/.
// Layer: presentation (shim)
// Depends on: dist/cli (built by build:src)

/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */
const api = require("../cli/detect.js") as any;

export const detectInstalledProviders = api.detectInstalledProviders;
export const detectLegacyProviderResidue = api.detectLegacyProviderResidue;
export const detectRecommendedProviders = api.detectRecommendedProviders;
export const fileContainsHarnessMarker = api.fileContainsHarnessMarker;
export const isGitRepo = api.isGitRepo;
export const detectProviderBinaries = api.detectProviderBinaries;
export const listDetectedProviderBinaryIds = api.listDetectedProviderBinaryIds;
