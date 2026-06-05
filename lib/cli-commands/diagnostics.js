"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runStatusOrDoctor = runStatusOrDoctor;
// @ts-ignore - JS file with checkJs
const cli_args_1 = require("../cli-args");
// @ts-ignore - JS file with checkJs
const cli_detect_1 = require("../cli-detect");
const cli_backend_1 = require("../cli-backend");
const cli_command_helpers_1 = require("../cli-command-helpers");
function runStatusOrDoctor(packRoot, command, options) {
    const targetAbs = (0, cli_command_helpers_1.resolveTargetAbs)(options.target);
    const legacyProviders = (0, cli_detect_1.detectLegacyProviderResidue)(targetAbs);
    const args = [command, "--target", targetAbs];
    if (options.scope) {
        args.push("--scope", options.scope);
    }
    const result = (0, cli_backend_1.runAihSh)(packRoot, args, {
        cwd: process.cwd(),
        verbose: options.verbose,
        capture: !options.verbose,
    });
    if (options.verbose) {
        return result.status || 0;
    }
    // @ts-ignore - ui will be available when this is called from CLI context
    const ui = require("../cli-ui");
    if (command === "status") {
        ui.formatStatus(result.combined || result.stdout || "", { compact: (0, cli_args_1.isNonInteractive)(options) });
    }
    else {
        ui.formatDoctor(result.combined || result.stdout || "", { compact: (0, cli_args_1.isNonInteractive)(options) });
    }
    if (legacyProviders.length > 0) {
        console.log(`WARN legacy provider residue detected: ${legacyProviders.join(", ")}. Use aih.sh uninstall --runtime opencode for cleanup if needed.`);
    }
    return result.status || 0;
}
