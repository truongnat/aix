import { isNonInteractive, type ParseOptions } from "../cli-args";
import { detectLegacyProviderResidue } from "../cli-detect";
import * as ui from "../cli-ui";
import { resolveTargetAbs } from "../cli-command-helpers";
import { runDoctor, runStatus } from "../backend/status-doctor";

function runStatusOrDoctor(packRoot: string, command: string, options: ParseOptions): number {
  void packRoot;
  const targetAbs = resolveTargetAbs(options.target);
  const legacyProviders = detectLegacyProviderResidue(targetAbs);
  const result = command === "status" ? runStatus({ targetAbs }) : runDoctor({ targetAbs });

  if (options.verbose) {
    process.stdout.write(`${result.text}\n`);
    return command === "doctor" && "ok" in result && !result.ok ? 1 : 0;
  }

  if (command === "status") {
    ui.formatStatus(result.text || "", { compact: isNonInteractive(options) });
  } else {
    ui.formatDoctor(result.text || "", { compact: isNonInteractive(options) });
  }
  if (legacyProviders.length > 0) {
    console.log(
      `WARN legacy provider residue detected: ${legacyProviders.join(", ")}. See docs/uninstall-usage.md for legacy cleanup guidance if needed.`
    );
  }
  return command === "doctor" && "ok" in result && !result.ok ? 1 : 0;
}

export { runStatusOrDoctor };
