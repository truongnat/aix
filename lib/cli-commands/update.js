"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runUpdateWizard = runUpdateWizard;
// @ts-ignore - JS file with checkJs
const cli_args_1 = require("../cli-args");
// @ts-ignore - JS file with checkJs
const cli_providers_1 = require("../cli-providers");
// @ts-ignore - JS file with checkJs
const cli_detect_1 = require("../cli-detect");
const cli_backend_1 = require("../cli-backend");
const cli_command_helpers_1 = require("../cli-command-helpers");
async function runUpdateWizard(packRoot, options) {
    const targetAbs = (0, cli_command_helpers_1.resolveTargetAbs)(options.target);
    let providers = [...options.providers];
    const installed = (0, cli_detect_1.detectInstalledProviders)(targetAbs);
    // @ts-ignore - ui will be available when this is called from CLI context
    const ui = require("../cli-ui");
    if ((0, cli_args_1.isNonInteractive)(options)) {
        if (installed.length === 0 && providers.length === 0) {
            throw new Error("No installed providers detected. Pass --provider or install first.");
        }
        if (providers.length === 0) {
            throw new Error("No provider selected. Pass --provider cursor or run interactively.");
        }
    }
    else {
        ui.introBanner({
            version: (0, cli_command_helpers_1.readPackageVersion)(packRoot),
            target: targetAbs,
            gitRepo: (0, cli_detect_1.isGitRepo)(targetAbs),
        });
        if (installed.length === 0) {
            throw new Error("No installed providers detected. Install first.");
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
        ui.showUpdatePlan(providers);
        const proceed = await ui.confirmProceed("Proceed with update?");
        if (!proceed) {
            return 1;
        }
    }
    (0, cli_command_helpers_1.validateProviderSelection)(providers);
    if ((0, cli_args_1.isNonInteractive)(options)) {
        ui.showUpdatePlan(providers, { compact: true });
    }
    const ctx = {
        target: targetAbs,
        ref: options.ref,
        scope: options.scope || "project",
        visibility: options.visibility || "private",
        dryRun: options.dryRun,
        yes: true,
    };
    const run = () => {
        let lastResult = { status: 0, combined: "" };
        for (const provider of providers) {
            lastResult = (0, cli_backend_1.runAihSh)(packRoot, (0, cli_backend_1.buildUpdateArgs)(provider, ctx), {
                cwd: process.cwd(),
                ...(0, cli_command_helpers_1.backendOpts)(options),
            });
            if ((lastResult.status ?? 0) !== 0) {
                break;
            }
        }
        if ((lastResult.status ?? 0) !== 0) {
            return { ok: false, status: (0, cli_command_helpers_1.failWithBackendError)("Update", lastResult, options) };
        }
        return { ok: true, status: 0, spinnerMessage: "Updated" };
    };
    let status;
    if (ui.useInteractiveUi(options)) {
        const result = await ui.runWithSpinner("Updating harness…", async () => run());
        status = result?.status ?? 0;
        if (status === 0) {
            ui.showSuccess(options.dryRun ? "Dry-run complete" : "Updated");
        }
    }
    else {
        if (!options.verbose) {
            process.stdout.write("Updating harness…\n");
        }
        status = run().status ?? 0;
        if (status === 0) {
            console.log(options.dryRun ? "\nDry-run complete." : "\nUpdated.");
        }
    }
    return status;
}
