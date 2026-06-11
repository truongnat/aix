// Purpose: Backward-compat shim — implementation in src/.
// Layer: presentation (shim)
// Depends on: dist (built by build:src)

/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */
const api = require("../shared/stack-detect/index.js") as any;

export const DOMAIN_LABELS = api.DOMAIN_LABELS;
export const isKnownDomainId = api.isKnownDomainId;
export const mergeStackSignals = api.mergeStackSignals;
export const normalizeDomainSelection = api.normalizeDomainSelection;
export const parseProjectAnalysis = api.parseProjectAnalysis;

export type DomainId = any;
export type ParsedProjectAnalysis = any;
export type ProjectAnalysisDomain = any;
export type ProjectAnalysisInput = any;
export type ProjectAnalysisMeta = any;
export type StackScanResult = any;
