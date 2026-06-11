// Purpose: Backward-compat shim — implementation in src/cli/.
// Layer: presentation (shim)
// Depends on: dist/cli (built by build:src)

/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */
const api = require("../cli/ui/index.js") as any;

export default api.default ?? api;

export const useInteractiveUi = api.useInteractiveUi;
export const introBanner = api.introBanner;
export const selectProviders = api.selectProviders;
export const selectInstallScope = api.selectInstallScope;
export const confirmInstallCache = api.confirmInstallCache;
export const confirmRemoveState = api.confirmRemoveState;
export const confirmFullCleanup = api.confirmFullCleanup;
export const confirmProceed = api.confirmProceed;
export const showInstallPlan = api.showInstallPlan;
export const showUpdatePlan = api.showUpdatePlan;
export const showUninstallPlan = api.showUninstallPlan;
export const showSuccess = api.showSuccess;
export const showCancel = api.showCancel;
export const showWarning = api.showWarning;
export const showError = api.showError;
export const runWithSpinner = api.runWithSpinner;
export const formatStatus = api.formatStatus;
export const formatDoctor = api.formatDoctor;
export const isCancel = api.isCancel;

export type IntroMeta = any;
export type ProviderItem = any;
export type InstallPlan = any;
export type UninstallContext = any;
export type SpinnerResult = any;
