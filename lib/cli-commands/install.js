"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runInstallBackend = runInstallBackend;
exports.runInstallWizard = runInstallWizard;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
// @ts-ignore - JS file with checkJs
const cli_args_1 = require("../cli-args");
// @ts-ignore - JS file with checkJs
const cli_providers_1 = require("../cli-providers");
// @ts-ignore - JS file with checkJs
const cli_detect_1 = require("../cli-detect");
// @ts-ignore - JS file with checkJs
const cli_plan_1 = require("../cli-plan");
const cli_backend_1 = require("../cli-backend");
const cli_command_helpers_1 = require("../cli-command-helpers");
async function runInstallBackend(packRoot, ctx, options) {
    const run = () => {
        let lastResult = { status: 0, combined: "" };
        for (let i = 0; i < ctx.providers.length; i += 1) {
            const provider = ctx.providers[i];
            const args = (0, cli_backend_1.buildInstallArgs)(provider, ctx, i);
            lastResult = (0, cli_backend_1.runAihSh)(packRoot, args, { cwd: process.cwd(), ...(0, cli_command_helpers_1.backendOpts)(options) });
            if ((lastResult.status ?? 0) !== 0) {
                break;
            }
        }
        if ((lastResult.status ?? 0) !== 0) {
            return {
                ok: false,
                status: (0, cli_command_helpers_1.failWithBackendError)("Install", lastResult, options),
                combined: lastResult.combined,
            };
        }
        return { ok: true, status: 0, spinnerMessage: ctx.dryRun ? "Dry-run complete" : "Installed" };
    };
    // @ts-ignore - ui will be available when this is called from CLI context
    const ui = require("../cli-ui");
    if (ui.useInteractiveUi(options)) {
        const result = await ui.runWithSpinner(ctx.dryRun ? "Previewing install…" : "Installing harness…", async () => run());
        return result?.status ?? 0;
    }
    if (!options.verbose) {
        process.stdout.write(ctx.dryRun ? "Running install dry-run…\n" : "Installing harness…\n");
    }
    const result = run();
    return result.status ?? 0;
}
async function runInstallWizard(packRoot, options) {
    const targetAbs = (0, cli_command_helpers_1.resolveTargetAbs)(options.target);
    if (!node_fs_1.default.existsSync(targetAbs)) {
        throw new Error(`Target directory does not exist: ${targetAbs}`);
    }
    const legacyProviders = (0, cli_detect_1.detectLegacyProviderResidue)(targetAbs);
    // @ts-ignore - ui will be available when this is called from CLI context
    const ui = require("../cli-ui");
    if (legacyProviders.length > 0 && !ui.useInteractiveUi(options)) {
        console.error(`warning: legacy provider residue detected: ${legacyProviders.join(", ")}. Clean up with aih.sh uninstall --runtime opencode if this is stale.`);
    }
    const interactive = ui.useInteractiveUi(options);
    let providers = [...options.providers];
    if ((0, cli_args_1.isNonInteractive)(options)) {
        if (providers.length === 0) {
            throw new Error("No provider selected. Pass --provider cursor or run interactively.");
        }
        (0, cli_command_helpers_1.validateProviderSelection)(providers);
        (0, cli_command_helpers_1.validateManualMix)(providers);
        const scopeVis = options.scope
            ? { scope: options.scope, visibility: options.visibility || "private" }
            : (0, cli_args_1.modeToScopeVisibility)("project-private");
        if (options.scope && !options.visibility && scopeVis.scope === "project") {
            scopeVis.visibility = "private";
        }
        const initHarness = !node_fs_1.default.existsSync(node_path_1.default.join(targetAbs, ".harness"));
        const installCache = scopeVis.scope === "project" && providers.some((id) => (0, cli_providers_1.isRuntimeNative)(id));
        // @ts-ignore - cli-plan is JS with checkJs
        const plan = (0, cli_plan_1.buildInstallPlan)({
            providers: providers,
            initHarness,
            installCache,
            mode: scopeVis.visibility === "shared" ? "project-shared" : "project-private",
            isGit: (0, cli_detect_1.isGitRepo)(targetAbs),
        });
        ui.showInstallPlan(plan, { compact: true });
        if (plan.mode === "project-private" && !plan.isGit) {
            console.log("\nwarning: target is not a Git repo; private .git/info/exclude cannot be updated.");
        }
        const status = await runInstallBackend(packRoot, {
            providers,
            target: targetAbs,
            ref: options.ref,
            scope: scopeVis.scope,
            visibility: scopeVis.visibility,
            dryRun: options.dryRun,
            yes: true,
            initHarness,
            installCache,
        }, options);
        if (status === 0) {
            console.log(options.dryRun ? "\nDry-run complete." : "\nInstalled.");
        }
        return status;
    }
    ui.introBanner({
        version: (0, cli_command_helpers_1.readPackageVersion)(packRoot),
        target: targetAbs,
        gitRepo: (0, cli_detect_1.isGitRepo)(targetAbs),
    });
    const recommended = (0, cli_detect_1.detectRecommendedProviders)(targetAbs);
    const providerItems = cli_providers_1.ACTIVE_PROVIDERS.map((p) => ({
        id: p.id,
        label: p.label,
        implemented: p.implemented,
        recommended: recommended.includes(p.id),
        priorityLabel: (0, cli_providers_1.providerPriorityLabel)(p),
    }));
    providers = await ui.selectProviders(providerItems);
    if (!providers) {
        return 1;
    }
    (0, cli_command_helpers_1.validateProviderSelection)(providers);
    (0, cli_command_helpers_1.validateManualMix)(providers);
    const mode = await ui.selectInstallMode();
    if (!mode) {
        return 1;
    }
    const harnessExists = node_fs_1.default.existsSync(node_path_1.default.join(targetAbs, ".harness"));
    const initHarness = await ui.confirmInitHarness(!harnessExists);
    if (initHarness === null) {
        return 1;
    }
    const { scope } = (0, cli_args_1.modeToScopeVisibility)(mode);
    const defaultCache = scope === "project" && providers.some((id) => (0, cli_providers_1.isRuntimeNative)(id));
    const installCache = await ui.confirmInstallCache(defaultCache);
    if (installCache === null) {
        return 1;
    }
    const { scope: resolvedScope, visibility } = (0, cli_args_1.modeToScopeVisibility)(mode);
    // @ts-ignore - cli-plan is JS with checkJs
    const plan = (0, cli_plan_1.buildInstallPlan)({
        providers: providers,
        initHarness,
        installCache,
        mode,
        isGit: (0, cli_detect_1.isGitRepo)(targetAbs),
    });
    ui.showInstallPlan(plan);
    if (plan.mode === "project-private" && !plan.isGit) {
        ui.showWarning("Target is not a Git repo; private .git/info/exclude cannot be updated.\nRun `git init` first or choose project shared.");
    }
    const proceed = await ui.confirmProceed("Proceed with install?");
    if (!proceed) {
        return 1;
    }
    const status = await runInstallBackend(packRoot, {
        providers,
        target: targetAbs,
        ref: options.ref,
        scope: resolvedScope,
        visibility,
        dryRun: options.dryRun,
        yes: true,
        initHarness,
        installCache,
    }, options);
    if (status === 0 && interactive) {
        ui.showSuccess(options.dryRun ? "Dry-run complete" : "Installed");
    }
    return status;
}
