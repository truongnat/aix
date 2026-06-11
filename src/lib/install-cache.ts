// Purpose: Backward-compat shim — implementation in src/ clean architecture.
// Layer: presentation (shim)
// Depends on: dist/features or dist/shared (built by build:src)

/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */
const api = require("../features/install/infrastructure/install-cache.js") as any;

export const CACHE_DIR = api.CACHE_DIR;
export const cacheExportPaths = api.cacheExportPaths;
export const formatResults = api.formatResults;
export const installCapabilityCache = api.installCapabilityCache;
export const cacheRelativePath = api.cacheRelativePath;
export const listFiles = api.listFiles;
export const main = api.main;
export const parseArgs = api.parseArgs;

export type InstallCacheOptions = any;
export type CacheInstallResult = any;
