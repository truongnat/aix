"use strict";

const { parseArgv } = require("./cli-args");
const { printHelp } = require("./cli-help");
const { packRootFromModule } = require("./cli-backend");
const { runInstallWizard } = require("./cli-commands/install");
const { runUpdateWizard } = require("./cli-commands/update");
const { runUninstallWizard } = require("./cli-commands/uninstall");
const { runStatusOrDoctor } = require("./cli-commands/diagnostics");
const ui = require("./cli-ui");

const SOURCE_URL = "https://github.com/truongnat/ai-engineering-harness";

/**
 * Main CLI entry point for ai-engineering-harness
 * @param {string[]} argv - Command-line arguments from process.argv (starting with node, script path)
 * @param {string} moduleFilename - __filename of the calling module (for pack root detection)
 * @returns {Promise<number>} - Exit code (0 for success, 1 for error)
 */
async function main(argv, moduleFilename) {
  const packRoot = packRootFromModule(moduleFilename);

  let options;
  try {
    options = parseArgv(argv);
  } catch (error) {
    console.error(`ai-engineering-harness: ${error.message}`);
    return 1;
  }

  if (options.help || options.command === "help") {
    printHelp();
    return 0;
  }

  try {
    switch (options.command) {
    case "install":
      return await runInstallWizard(packRoot, options);
    case "update":
      return await runUpdateWizard(packRoot, options);
    case "uninstall":
      return await runUninstallWizard(packRoot, options);
    case "status":
    case "doctor":
      return runStatusOrDoctor(packRoot, options.command, options);
    default:
      printHelp();
      return 0;
    }
  } catch (error) {
    if (error.code === "SH_MISSING" || error.code === "AIH_SH_MISSING") {
      ui.showError("Setup error", error.message);
      return 1;
    }
    if (ui.useInteractiveUi(options)) {
      ui.showError("Error", error.message);
    } else {
      console.error(`ai-engineering-harness: ${error.message}`);
    }
    return 1;
  }
}

module.exports = {
  main,
  printHelp,
  SOURCE_URL
};
