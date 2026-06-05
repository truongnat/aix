"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheExportPaths = exports.CACHE_DIR = void 0;
exports.formatResults = formatResults;
exports.installCapabilityCache = installCapabilityCache;
exports.cacheRelativePath = cacheRelativePath;
exports.listFiles = listFiles;
exports.main = main;
exports.parseArgs = parseArgs;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
// @ts-ignore - JS file with checkJs
const runtime_command_catalog_js_1 = require("./runtime-command-catalog.js");
// @ts-ignore - JS file with checkJs
const file_operations_js_1 = require("./file-operations.js");
const CACHE_DIR = ".ai-harness";
exports.CACHE_DIR = CACHE_DIR;
/** Capability surface installed under target/.ai-harness/ (not product repo root). */
const cacheExportPaths = [
    "AGENTS.md",
    "commands",
    "prompt-templates",
    "skills",
    "workflows",
    "patterns",
    "templates",
    "tool-capabilities",
    "scripts/discover-tools.js",
    "hooks/",
    "agent-system/",
    "PACK.md",
    "README.md",
    "docs/harness-init-usage.md",
    "docs/tool-discovery-and-routing.md",
    "docs/session-memory.md",
    "docs/memory-migration.md",
    "docs/runtime-aware-validation.md",
    "docs/project-state-policy.md",
    "docs/private-install-git-hygiene.md",
    "docs/plugin-install-ux.md",
    "docs/runtime-dogfood-summary.md",
    "docs/target-repo-validation.md",
    "docs/validation-troubleshooting.md",
];
exports.cacheExportPaths = cacheExportPaths;
function parseArgs(argv) {
    const options = {
        packRoot: null,
        target: process.cwd(),
        dryRun: false,
        force: false,
    };
    for (let index = 0; index < argv.length; index += 1) {
        const arg = argv[index];
        if (arg === "--pack-root") {
            const value = argv[index + 1];
            if (!value) {
                throw new Error("Missing value for --pack-root");
            }
            options.packRoot = node_path_1.default.resolve(value);
            index += 1;
            continue;
        }
        if (arg === "--target") {
            const value = argv[index + 1];
            if (!value) {
                throw new Error("Missing value for --target");
            }
            options.target = node_path_1.default.resolve(value);
            index += 1;
            continue;
        }
        if (arg === "--dry-run") {
            options.dryRun = true;
            continue;
        }
        if (arg === "--force") {
            options.force = true;
            continue;
        }
        throw new Error(`Unknown argument: ${arg}`);
    }
    if (!options.packRoot) {
        throw new Error("Missing required --pack-root");
    }
    return options;
}
function listFiles(packRoot, relativePath, depth = 0, maxDepth = 20, visitedInodes = new Set()) {
    const MAX_DEPTH = maxDepth;
    if (depth > MAX_DEPTH) {
        return [];
    }
    const sourcePath = node_path_1.default.join(packRoot, relativePath);
    if (!node_fs_1.default.existsSync(sourcePath)) {
        return [];
    }
    const stats = node_fs_1.default.statSync(sourcePath);
    // Detect symlink cycles
    const inode = `${stats.ino}:${stats.dev}`;
    if (visitedInodes.has(inode)) {
        return [];
    }
    visitedInodes.add(inode);
    if (stats.isFile()) {
        return [relativePath];
    }
    if (stats.isSymbolicLink()) {
        return [];
    }
    const files = [];
    for (const entry of node_fs_1.default.readdirSync(sourcePath, { withFileTypes: true })) {
        if (entry.name === "node_modules" || entry.name === ".git" || entry.name === ".next") {
            continue;
        }
        const childRelativePath = node_path_1.default.join(relativePath, entry.name);
        if (entry.isDirectory()) {
            files.push(...listFiles(packRoot, childRelativePath, depth + 1, maxDepth, visitedInodes));
        }
        else if (entry.isFile()) {
            files.push(childRelativePath);
        }
    }
    return files;
}
function cacheRelativePath(relativePath) {
    return `${CACHE_DIR}/${relativePath.split(node_path_1.default.sep).join("/")}`;
}
function installCapabilityCache(options) {
    const optionalPaths = ["LICENSE"];
    const relativePaths = [
        ...cacheExportPaths.flatMap((relativePath) => listFiles(options.packRoot, relativePath)),
        ...optionalPaths.filter((relativePath) => node_fs_1.default.existsSync(node_path_1.default.join(options.packRoot, relativePath))),
    ].sort();
    const results = [];
    const seen = new Set();
    for (const relativePath of relativePaths) {
        if (seen.has(relativePath)) {
            continue;
        }
        seen.add(relativePath);
        const sourcePath = node_path_1.default.join(options.packRoot, relativePath);
        const destinationPath = node_path_1.default.join(options.target, CACHE_DIR, relativePath);
        const exists = node_fs_1.default.existsSync(destinationPath);
        if (exists && !options.force) {
            results.push({
                action: options.dryRun ? "WOULD SKIP" : "SKIP",
                relativePath: cacheRelativePath(relativePath),
                reason: "exists",
            });
            continue;
        }
        results.push({
            action: options.dryRun ? "WOULD COPY" : "COPY",
            relativePath: cacheRelativePath(relativePath),
            reason: exists ? "overwrite" : "new",
        });
        if (!options.dryRun) {
            (0, file_operations_js_1.ensureDirectory)(destinationPath, false);
            node_fs_1.default.copyFileSync(sourcePath, destinationPath);
        }
    }
    const catalogResults = (0, runtime_command_catalog_js_1.installRuntimeCommandCatalog)(options.target, {
        dryRun: options.dryRun,
        force: options.force,
    });
    for (const entry of catalogResults) {
        results.push({
            action: entry.action,
            relativePath: entry.relativePath,
            reason: "runtime-command-catalog",
        });
    }
    return results;
}
function formatResults(results) {
    return results.map((result) => `${result.action} ${result.relativePath}`).join("\n");
}
function main(argv = process.argv.slice(2)) {
    const options = parseArgs(argv);
    const results = installCapabilityCache(options);
    console.log(formatResults(results));
    return results;
}
