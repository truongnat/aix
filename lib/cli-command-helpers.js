"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readPackageVersion = readPackageVersion;
exports.resolveTargetAbs = resolveTargetAbs;
exports.validateProviderSelection = validateProviderSelection;
exports.validateManualMix = validateManualMix;
exports.backendOpts = backendOpts;
exports.failWithBackendError = failWithBackendError;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
// @ts-ignore - JS file with checkJs, will migrate in batch 3
const cli_providers_1 = require("./cli-providers");
function readPackageVersion(packRoot) {
    try {
        const pkg = JSON.parse(node_fs_1.default.readFileSync(node_path_1.default.join(packRoot, "package.json"), "utf8"));
        return pkg.version || "unknown";
    }
    catch {
        return "unknown";
    }
}
function resolveTargetAbs(target) {
    return node_path_1.default.resolve(process.cwd(), target);
}
function validateProviderSelection(providers) {
    const unknown = providers.filter((id) => !(0, cli_providers_1.isSupportedProvider)(id));
    if (unknown.length) {
        throw new Error(`Unknown provider(s): ${unknown.join(", ")}`);
    }
    const disabled = providers.filter((id) => {
        const provider = (0, cli_providers_1.getProvider)(id);
        return provider && !provider.implemented;
    });
    if (disabled.length) {
        throw new Error(`Provider(s) not implemented: ${disabled.join(", ")}`);
    }
}
function validateManualMix(providers) {
    const hasManual = providers.includes("manual");
    const hasNative = providers.some((id) => (0, cli_providers_1.isRuntimeNative)(id));
    if (hasManual && hasNative) {
        throw new Error("Manual fallback cannot be combined with runtime-native providers in one install. Select manual alone or only runtime-native providers.");
    }
}
function backendOpts(options) {
    return {
        verbose: options.verbose,
        capture: !options.verbose,
    };
}
function failWithBackendError(kind, result, options) {
    const reason = (result.combined || "").split("\n").find((l) => /error:|FAIL /i.test(l)) ||
        `${kind} exited with code ${result.status || 1}`;
    if (options.verbose && result.combined) {
        process.stdout.write(result.combined);
    }
    // @ts-ignore - ui will be available when this is called from CLI context
    const ui = require("./cli-ui");
    if (ui.useInteractiveUi(options)) {
        ui.showError(`${kind} failed`, reason.trim());
    }
    else {
        console.error(`\n${kind} failed.\n\nReason:\n  ${reason.trim()}\n`);
        console.error("Try:");
        console.error("  npx ai-engineering-harness doctor");
        console.error("  npx ai-engineering-harness install --provider cursor --yes --verbose");
    }
    return result.status || 1;
}
