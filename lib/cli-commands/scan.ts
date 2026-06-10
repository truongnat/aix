// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs: typeof import("node:fs") = require("node:fs");
import type { ParseOptions } from "../cli-args";
import { resolveTargetAbs } from "../cli-command-helpers";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { stackScanner } = require("../stack-scanner.js") as {
  stackScanner: (target: string) => unknown;
};

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
