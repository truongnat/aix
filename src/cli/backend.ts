// Purpose: Pack root resolution for CLI entry
// Layer: infrastructure
// Depends on: legacy lib bridges where needed

import path from "node:path";

function packRootFromModule(moduleFilename: string): string {
  const moduleDir = path.dirname(moduleFilename);
  if (path.basename(moduleDir) === "cli" && path.basename(path.dirname(moduleDir)) === "dist") {
    return path.resolve(moduleDir, "..", "..");
  }
  return path.resolve(moduleDir, "..");
}

export { packRootFromModule };
