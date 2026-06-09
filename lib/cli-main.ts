import { parseArgv, type ParseOptions } from "./cli-args";
import { printHelp } from "./cli-help";
import { packRootFromModule } from "./cli-backend";
import { runInstallWizard } from "./cli-commands/install";
import { runUpdateWizard } from "./cli-commands/update";
import { runUninstallWizard } from "./cli-commands/uninstall";
import { runStatusOrDoctor } from "./cli-commands/diagnostics";
import { runEvalCommand } from "./cli-commands/eval";
import { runInsightsCommand } from "./cli-commands/insights";
import { runDomainsCommand } from "./cli-commands/domains";
import ui from "./cli-ui";

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
