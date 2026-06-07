import path from "node:path";

function packRootFromModule(moduleFilename: string): string {
  return path.resolve(path.dirname(moduleFilename), "..");
}

export { packRootFromModule };
