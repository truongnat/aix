// Purpose: Provider and git detection facades
// Layer: infrastructure
// Depends on: legacy-deps bridges

export {
  detectInstalledProviders,
  detectLegacyProviderResidue,
  detectRecommendedProviders,
  fileContainsHarnessMarker,
  isGitRepo,
  detectProviderBinaries,
  listDetectedProviderBinaryIds,
} from "./infrastructure/legacy-deps";
