"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectRecommendedProviders = detectRecommendedProviders;
exports.detectInstalledProviders = detectInstalledProviders;
exports.detectLegacyProviderResidue = detectLegacyProviderResidue;
exports.isGitRepo = isGitRepo;
exports.fileContainsHarnessMarker = fileContainsHarnessMarker;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const HARNESS_MARKER = "ai-engineering-harness";
function fileContainsHarnessMarker(filePath) {
    try {
        return node_fs_1.default.readFileSync(filePath, "utf8").includes(HARNESS_MARKER);
    }
    catch {
        return false;
    }
}
function pathExists(targetRoot, relativePath) {
    return node_fs_1.default.existsSync(node_path_1.default.join(targetRoot, ...relativePath.split("/")));
}
/**
 * Recommend providers from project hints (does not imply install).
 */
function detectRecommendedProviders(targetRoot) {
    const recommended = [];
    if (pathExists(targetRoot, ".claude") || pathExists(targetRoot, ".claude/CLAUDE.md")) {
        recommended.push("claude");
    }
    if (pathExists(targetRoot, ".cursor") ||
        pathExists(targetRoot, ".cursor/rules/ai-engineering-harness.mdc")) {
        recommended.push("cursor");
    }
    if (pathExists(targetRoot, ".codex") || pathExists(targetRoot, ".codex-plugin/plugin.json")) {
        recommended.push("codex");
    }
    if (pathExists(targetRoot, ".gemini")) {
        recommended.push("gemini");
    }
    return [...new Set(recommended)];
}
/**
 * Detect installed harness runtime entrypoints.
 */
function detectInstalledProviders(targetRoot) {
    const installed = [];
    if (pathExists(targetRoot, ".cursor/rules/ai-engineering-harness.mdc")) {
        installed.push("cursor");
    }
    if (pathExists(targetRoot, ".claude/CLAUDE.md")) {
        installed.push("claude");
    }
    if (pathExists(targetRoot, ".codex-plugin/plugin.json")) {
        installed.push("codex");
    }
    if (pathExists(targetRoot, ".gemini/extensions/ai-engineering-harness/GEMINI.md")) {
        installed.push("gemini");
    }
    const agentsPath = node_path_1.default.join(targetRoot, "AGENTS.md");
    if (node_fs_1.default.existsSync(agentsPath) &&
        fileContainsHarnessMarker(agentsPath) &&
        !installed.includes("codex")) {
        installed.push("generic");
    }
    return [...new Set(installed)];
}
function detectLegacyProviderResidue(targetRoot) {
    const legacy = [];
    if (pathExists(targetRoot, ".opencode/plugins/ai-engineering-harness.js")) {
        legacy.push("opencode");
    }
    return legacy;
}
function isGitRepo(targetRoot) {
    const gitPath = node_path_1.default.join(targetRoot, ".git");
    return node_fs_1.default.existsSync(gitPath);
}
