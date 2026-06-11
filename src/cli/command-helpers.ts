// Purpose: Shared CLI command helpers
// Layer: application
// Depends on: domain, ui, legacy bridges

import fs from "node:fs";
import path from "node:path";
import * as ui from "./ui";

import { getProvider, isRuntimeNative, isSupportedProvider } from "./providers";

function readPackageVersion(packRoot: string): string {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(packRoot, "package.json"), "utf8"));
    return pkg.version || "unknown";
  } catch {
    return "unknown";
  }
}

function resolveTargetAbs(target: string): string {
  return path.resolve(process.cwd(), target);
}

function validateProviderSelection(providers: string[]): void {
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

function validateManualMix(providers: string[]): void {
  const hasManual = providers.includes("manual");
  const hasNative = providers.some((id) => isRuntimeNative(id));
  if (hasManual && hasNative) {
    throw new Error(
      "Manual fallback cannot be combined with runtime-native providers in one install. Select manual alone or only runtime-native providers."
    );
  }
}

interface ParseOptions {
  verbose: boolean;
  yes: boolean;
  providers: string[];
}

function backendOpts(options: ParseOptions): { verbose: boolean; capture: boolean } {
  return {
    verbose: options.verbose,
    capture: !options.verbose,
  };
}

interface SpawnResult {
  status: number | null;
  combined: string;
}

function failWithBackendError(kind: string, result: SpawnResult, options: ParseOptions): number {
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

export {
  readPackageVersion,
  resolveTargetAbs,
  validateProviderSelection,
  validateManualMix,
  backendOpts,
  failWithBackendError,
};
