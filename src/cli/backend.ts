// Purpose: Pack root resolution for CLI entry
// Layer: infrastructure
// Depends on: legacy lib bridges where needed

import path from "node:path";

function packRootFromModule(moduleFilename: string): string {
  return path.resolve(path.dirname(moduleFilename), "..");
}

export { packRootFromModule };
