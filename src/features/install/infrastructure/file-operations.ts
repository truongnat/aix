import fs from "node:fs";
import path from "node:path";

/**
 * Ensure a directory exists, creating it recursively if needed.
 * Respects dry-run mode for safe preview execution.
 */
function ensureDirectory(dirPath: string, dryRun = false): void {
  if (dryRun || fs.existsSync(dirPath)) {
    return;
  }
  fs.mkdirSync(dirPath, { recursive: true });
}

/**
 * Write a file with optional dry-run and force overwrite flags.
 * Logs each file operation (CREATE, SKIP, OVERWRITE) for visibility.
 */
function writeFileWithDryRun(
  filePath: string,
  content: string,
  options: { dryRun?: boolean; force?: boolean } = {},
  logFn: (msg: string) => void = console.log
): void {
  const { dryRun = false, force = false } = options;
  const exists = fs.existsSync(filePath);

  if (exists && !force) {
    logFn(`${dryRun ? "WOULD SKIP" : "SKIP"} ${filePath}`);
    return;
  }

  if (exists && force) {
    logFn(`${dryRun ? "WOULD OVERWRITE" : "OVERWRITE"} ${filePath}`);
  } else {
    logFn(`${dryRun ? "WOULD CREATE" : "CREATE"} ${filePath}`);
  }

  if (!dryRun) {
    ensureDirectory(path.dirname(filePath), false);
    fs.writeFileSync(filePath, content, "utf8");
  }
}

/**
 * Log a file operation action (CREATE, SKIP, OVERWRITE, etc.).
 * Simple helper for consistent logging across installation operations.
 */
function logAction(action: string, relativePath: string): void {
  console.log(`${action} ${relativePath}`);
}

export { ensureDirectory, writeFileWithDryRun, logAction };
