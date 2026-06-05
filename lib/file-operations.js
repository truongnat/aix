"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureDirectory = ensureDirectory;
exports.writeFileWithDryRun = writeFileWithDryRun;
exports.logAction = logAction;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
/**
 * Ensure a directory exists, creating it recursively if needed.
 * Respects dry-run mode for safe preview execution.
 */
function ensureDirectory(dirPath, dryRun = false) {
    if (dryRun || node_fs_1.default.existsSync(dirPath)) {
        return;
    }
    node_fs_1.default.mkdirSync(dirPath, { recursive: true });
}
/**
 * Write a file with optional dry-run and force overwrite flags.
 * Logs each file operation (CREATE, SKIP, OVERWRITE) for visibility.
 */
function writeFileWithDryRun(filePath, content, options = {}, logFn = console.log) {
    const { dryRun = false, force = false } = options;
    const exists = node_fs_1.default.existsSync(filePath);
    if (exists && !force) {
        logFn(`${dryRun ? "WOULD SKIP" : "SKIP"} ${filePath}`);
        return;
    }
    if (exists && force) {
        logFn(`${dryRun ? "WOULD OVERWRITE" : "OVERWRITE"} ${filePath}`);
    }
    else {
        logFn(`${dryRun ? "WOULD CREATE" : "CREATE"} ${filePath}`);
    }
    if (!dryRun) {
        ensureDirectory(node_path_1.default.dirname(filePath), false);
        node_fs_1.default.writeFileSync(filePath, content, "utf8");
    }
}
/**
 * Log a file operation action (CREATE, SKIP, OVERWRITE, etc.).
 * Simple helper for consistent logging across installation operations.
 */
function logAction(action, relativePath) {
    console.log(`${action} ${relativePath}`);
}
