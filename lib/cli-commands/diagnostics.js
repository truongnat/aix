"use strict";

const { isNonInteractive } = require("../cli-args");
const { detectLegacyProviderResidue } = require("../cli-detect");
const { runAihSh } = require("../cli-backend");
const { resolveTargetAbs } = require("../cli-command-helpers");
const ui = require("../cli-ui");

function runStatusOrDoctor(packRoot, command, options) {
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

module.exports = {
  runStatusOrDoctor,
};
