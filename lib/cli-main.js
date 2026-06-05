"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SOURCE_URL = exports.printHelp = void 0;
exports.main = main;
const cli_args_1 = require("./cli-args");
// @ts-ignore - JS file with checkJs
const cli_help_1 = require("./cli-help");
Object.defineProperty(exports, "printHelp", { enumerable: true, get: function () { return cli_help_1.printHelp; } });
const cli_backend_1 = require("./cli-backend");
const install_1 = require("./cli-commands/install");
const update_1 = require("./cli-commands/update");
const uninstall_1 = require("./cli-commands/uninstall");
const diagnostics_1 = require("./cli-commands/diagnostics");
const eval_1 = require("./cli-commands/eval");
const insights_1 = require("./cli-commands/insights");
const init_1 = require("./cli-commands/init");
// @ts-ignore - JS file with checkJs
const cli_ui_1 = __importDefault(require("./cli-ui"));
const SOURCE_URL = "https://github.com/truongnat/ai-engineering-harness";
exports.SOURCE_URL = SOURCE_URL;
/**
 * Main CLI entry point for ai-engineering-harness
 * @param argv - Command-line arguments from process.argv (starting with node, script path)
 * @param moduleFilename - __filename of the calling module (for pack root detection)
 * @returns - Exit code (0 for success, 1 for error)
 */
async function main(argv, moduleFilename) {
    const packRoot = (0, cli_backend_1.packRootFromModule)(moduleFilename);
    let options;
    try {
        options = (0, cli_args_1.parseArgv)(argv);
    }
    catch (error) {
        console.error(`ai-engineering-harness: ${error.message}`);
        return 1;
    }
    if (options.help || options.command === "help") {
        (0, cli_help_1.printHelp)();
        return 0;
    }
    try {
        switch (options.command) {
            case "install":
                return await (0, install_1.runInstallWizard)(packRoot, options);
            case "update":
                return await (0, update_1.runUpdateWizard)(packRoot, options);
            case "uninstall":
                return await (0, uninstall_1.runUninstallWizard)(packRoot, options);
            case "status":
            case "doctor":
                return (0, diagnostics_1.runStatusOrDoctor)(packRoot, options.command, options);
            case "eval":
                return await (0, eval_1.runEvalCommand)(packRoot, options);
            case "insights":
                return await (0, insights_1.runInsightsCommand)(packRoot, options);
            case "init":
                return await (0, init_1.runInitWizard)(packRoot, options);
            default:
                (0, cli_help_1.printHelp)();
                return 0;
        }
    }
    catch (error) {
        const err = error;
        if (err.code === "SH_MISSING" || err.code === "AIH_SH_MISSING") {
            cli_ui_1.default.showError("Setup error", err.message);
            return 1;
        }
        if (cli_ui_1.default.useInteractiveUi(options)) {
            cli_ui_1.default.showError("Error", err.message);
        }
        else {
            console.error(`ai-engineering-harness: ${err.message}`);
        }
        return 1;
    }
}
