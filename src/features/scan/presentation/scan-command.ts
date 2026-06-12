// Purpose: CLI handler for `aih scan`
// Layer: presentation
// Depends on: application, install CLI bridges

import fs from "node:fs";

import type { ParseOptions } from "../../install/presentation/cli-types";
import { resolveTargetAbs } from "../../install/presentation/cli-legacy";
import { stackScanner } from "../infrastructure/stack-scanner";

async function runScanCommand(_packRoot: string, options: ParseOptions): Promise<number> {
  const targetAbs = resolveTargetAbs(options.target);
  if (!fs.existsSync(targetAbs)) {
    throw new Error(`Target directory does not exist: ${targetAbs}`);
  }

  const result = stackScanner(targetAbs);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  return 0;
}

export { runScanCommand };
