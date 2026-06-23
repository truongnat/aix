// Purpose: Resolve repository root from compiled module location.
// Layer: infrastructure
// Depends on: node:fs, node:path

import fs from "node:fs";
import path from "node:path";

export function resolveRepositoryRoot(startDir: string): string {
  let current = startDir;
  while (true) {
    if (fs.existsSync(path.join(current, "package.json"))) {
      return current;
    }
    const parent = path.dirname(current);
    if (parent === current) {
      throw new Error(`Could not resolve repository root from ${startDir}`);
    }
    current = parent;
  }
}
