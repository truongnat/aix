"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runUninstallWizard = runUninstallWizard;
// @ts-ignore - JS file with checkJs
const cli_args_1 = require("../cli-args");
// @ts-ignore - JS file with checkJs
const cli_providers_1 = require("../cli-providers");
// @ts-ignore - JS file with checkJs
const cli_detect_1 = require("../cli-detect");
const cli_backend_1 = require("../cli-backend");
const cli_command_helpers_1 = require("../cli-command-helpers");
async function runUninstallWizard(packRoot, options) {
    const targetAbs = (0, cli_command_helpers_1.resolveTargetAbs)(options.target);
    let providers = [...options.providers];
    const installed = (0, cli_detect_1.detectInstalledProviders)(targetAbs);
    let removeCache = false;
    let removeState = false;
    let fullCleanup = options.all;
    // @ts-ignore - ui will be available when this is called from CLI context
    const ui = require("../cli-ui");
    if ((0, cli_args_1.isNonInteractive)(options)) {
        if (installed.length === 0 && providers.length === 0) {
            throw new Error("No installed providers detected. Pass --provider or install first.");
        }
        if (providers.length === 0 && !options.all) {
            throw new Error("No provider selected. Pass --provider cursor or run interactively.");
        }
        if (options.all) {
            fullCleanup = true;
        }
    }
    else {
        ui.introBanner({
            version: (0, cli_command_helpers_1.readPackageVersion)(packRoot),
            target: targetAbs,
            gitRepo: (0, cli_detect_1.isGitRepo)(targetAbs),
        });
        if (installed.length === 0) {
            throw new Error("No installed providers detected.");
        }
        if (providers.length === 0) {
            const items = [...cli_providers_1.ACTIVE_PROVIDERS, ...cli_providers_1.FALLBACK_TARGETS]
                .filter((p) => installed.includes(p.id))
                .map((p) => ({
                id: p.id,
                label: p.label,
                implemented: true,
                recommended: true,
            }));
            providers = await ui.selectProviders(items);
            if (!providers) {
                return 1;
            }
        }
        if (!options.all) {
            removeCache = await ui.confirmInstallCache(false);
            if (removeCache === null) {
                return 1;
            }
            removeState = await ui.confirmRemoveState(false);
            if (removeState === null) {
                return 1;
            }
            fullCleanup = await ui.confirmFullCleanup(false);
            if (fullCleanup === null) {
                return 1;
            }
        }
        ui.showUninstallPlan({ providers, removeCache, removeState, fullCleanup });
        const proceed = await ui.confirmProceed("Proceed with uninstall?");
        if (!proceed) {
            return 1;
        }
    }
    (0, cli_command_helpers_1.validateProviderSelection)(providers);
    ui.showUninstallPlan({ providers, removeCache, removeState, fullCleanup }, { compact: (0, cli_args_1.isNonInteractive)(options) });
    const ctx = {
        target: targetAbs,
        scope: options.scope || "project",
        dryRun: options.dryRun,
        yes: true,
        removeCache,
        removeState,
        fullCleanup,
    };
    const run = () => {
        let lastResult = { status: 0, combined: "" };
        for (const provider of providers) {
            lastResult = (0, cli_backend_1.runAihSh)(packRoot, (0, cli_backend_1.buildUninstallArgs)(provider, ctx), {
                cwd: process.cwd(),
                ...(0, cli_command_helpers_1.backendOpts)(options),
            });
            if ((lastResult.status ?? 0) !== 0) {
                break;
            }
        }
        if ((lastResult.status ?? 0) !== 0) {
            return { ok: false, status: (0, cli_command_helpers_1.failWithBackendError)("Uninstall", lastResult, options) };
        }
        return { ok: true, status: 0, spinnerMessage: "Uninstalled" };
    };
    let status;
    if (ui.useInteractiveUi(options)) {
        const result = await ui.runWithSpinner("Uninstalling…", async () => run());
        status = result?.status ?? 0;
        if (status === 0) {
            ui.showSuccess("Uninstalled");
        }
    }
    else {
        if (!options.verbose) {
            process.stdout.write("Uninstalling…\n");
        }
        status = run().status ?? 0;
        if (status === 0) {
            console.log("\nUninstalled.");
        }
    }
    return status;
}
