"use strict";

const fs = require("node:fs");
const path = require("node:path");

const { getProvider, isRuntimeNative, isSupportedProvider } = require("./cli-providers");
const ui = require("./cli-ui");

function readPackageVersion(packRoot) {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(packRoot, "package.json"), "utf8"));
    return pkg.version || "unknown";
  } catch {
    return "unknown";
  }
}

function resolveTargetAbs(target) {
  return path.resolve(process.cwd(), target);
}

function validateProviderSelection(providers) {
  const unknown = providers.filter((id) => !isSupportedProvider(id));
  if (unknown.length) {
    throw new Error(`Unknown provider(s): ${unknown.join(", ")}`);
  }
  const disabled = providers.filter((id) => {
    const provider = getProvider(id);
    return provider && !provider.implemented;
  });
  if (disabled.length) {
    throw new Error(`Provider(s) not implemented: ${disabled.join(", ")}`);
  }
}

function validateManualMix(providers) {
  const hasManual = providers.includes("manual");
  const hasNative = providers.some((id) => isRuntimeNative(id));
  if (hasManual && hasNative) {
    throw new Error(
      "Manual fallback cannot be combined with runtime-native providers in one install. Select manual alone or only runtime-native providers."
    );
  }
}

function backendOpts(options) {
  return {
    verbose: options.verbose,
    capture: !options.verbose,
  };
}

function failWithBackendError(kind, result, options) {
  const reason =
    (result.combined || "").split("\n").find((l) => /error:|FAIL /i.test(l)) ||
    `${kind} exited with code ${result.status || 1}`;
  if (options.verbose && result.combined) {
    process.stdout.write(result.combined);
  }
  if (ui.useInteractiveUi(options)) {
    ui.showError(`${kind} failed`, reason.trim());
  } else {
    console.error(`\n${kind} failed.\n\nReason:\n  ${reason.trim()}\n`);
    console.error("Try:");
    console.error("  npx ai-engineering-harness doctor");
    console.error("  npx ai-engineering-harness install --provider cursor --yes --verbose");
  }
  return result.status || 1;
}

module.exports = {
  readPackageVersion,
  resolveTargetAbs,
  validateProviderSelection,
  validateManualMix,
  backendOpts,
  failWithBackendError,
};
