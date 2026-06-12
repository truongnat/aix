// Purpose: Public exports for stack-detect shared module.
// Layer: domain
// Depends on: stack-detect

export {
  DOMAIN_LABELS,
  isKnownDomainId,
  mergeStackSignals,
  normalizeDomainSelection,
  parseProjectAnalysis,
} from "./stack-detect";
export type {
  DomainId,
  ParsedProjectAnalysis,
  ProjectAnalysisDomain,
  ProjectAnalysisInput,
  ProjectAnalysisMeta,
  StackScanResult,
} from "./stack-detect";
