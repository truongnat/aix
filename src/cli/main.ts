#!/usr/bin/env node
// Purpose: CLI argv router and command dispatch
// Layer: presentation
// Depends on: application, features, ui

import { parseArgv, type ParseOptions } from "./args";
import { printHelp } from "./help";
import { packRootFromModule } from "./backend";
import { runInstallWizard } from "../features/install/presentation/install-command";
import { runUpdateWizard } from "../features/update/presentation/update-command";
import { runUninstallWizard } from "../features/uninstall/presentation/uninstall-command";
import { runStatusOrDoctor } from "./commands/diagnostics";
import { runEvalCommand } from "../features/eval/presentation/eval-command";
import { runInsightsCommand } from "./commands/insights";
import { runDomainsCommand } from "../features/domains/presentation/domains-command";
import { runScanCommand } from "../features/scan/presentation/scan-command";
import ui from "./ui";

const SOURCE_URL = "https://github.com/truongnat/ai-engineering-harness";

/**
 * Main CLI entry point for ai-engineering-harness
 * @param argv - Command-line arguments from process.argv (starting with node, script path)
 * @param moduleFilename - __filename of the calling module (for pack root detection)
 * @returns - Exit code (0 for success, 1 for error)
 */
async function main(argv: string[], moduleFilename: string): Promise<number> {
  const packRoot = packRootFromModule(moduleFilename);

  let options: ParseOptions;
  try {
    options = parseArgv(argv);
  } catch (error) {
    console.error(`ai-engineering-harness: ${(error as Error).message}`);
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
      case "eval":
        return await runEvalCommand(packRoot, options);
      case "insights":
        return await runInsightsCommand(packRoot, options);
      case "domains":
        return await runDomainsCommand(packRoot, options);
      case "scan":
        return await runScanCommand(packRoot, options);
      default:
        printHelp();
        return 0;
    }
  } catch (error) {
    const err = error as Error & { code?: string };
    if (err.code === "SH_MISSING" || err.code === "AIH_SH_MISSING") {
      ui.showError("Setup error", err.message);
      return 1;
    }
    if (ui.useInteractiveUi(options)) {
      ui.showError("Error", err.message);
    } else {
      console.error(`ai-engineering-harness: ${err.message}`);
    }
    return 1;
  }
}

export { main, printHelp, SOURCE_URL };

if (require.main === module) {
  void main(process.argv, __filename).then(process.exit);
}
