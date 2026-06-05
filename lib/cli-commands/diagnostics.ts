// @ts-ignore - JS file with checkJs
import { isNonInteractive, type ParseOptions } from "../cli-args";
// @ts-ignore - JS file with checkJs
import { detectLegacyProviderResidue } from "../cli-detect";
import { runAihSh } from "../cli-backend";
import { resolveTargetAbs } from "../cli-command-helpers";

function runStatusOrDoctor(packRoot: string, command: string, options: ParseOptions): number {
  const targetAbs = resolveTargetAbs(options.target);
  const legacyProviders = detectLegacyProviderResidue(targetAbs);
  const args = [command, "--target", targetAbs];
  if (options.scope) {
    args.push("--scope", options.scope);
  }
  const result = runAihSh(packRoot, args, {
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
    ui.formatStatus(result.combined || result.stdout || "", { compact: isNonInteractive(options) });
  } else {
    ui.formatDoctor(result.combined || result.stdout || "", { compact: isNonInteractive(options) });
  }
  if (legacyProviders.length > 0) {
    console.log(
      `WARN legacy provider residue detected: ${legacyProviders.join(", ")}. Use aih.sh uninstall --runtime opencode for cleanup if needed.`
    );
  }
  return result.status || 0;
}

export { runStatusOrDoctor };
