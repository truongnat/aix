// Purpose: Public exports for uninstall feature.
// Layer: presentation
// Depends on: uninstall application layer

export { runUninstall } from "./application/run-uninstall";
export type { UninstallContext, UninstallResult } from "./application/run-uninstall";

export { runUninstallWizard } from "./presentation/uninstall-command";
