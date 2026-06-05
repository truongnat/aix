"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRuntimeBootstrapPaths = getRuntimeBootstrapPaths;
exports.isValidTargetRuntime = isValidTargetRuntime;
exports.normalizeTargetRuntime = normalizeTargetRuntime;
const constants_1 = require("./constants");
function normalizeTargetRuntime(runtime) {
    return runtime;
}
function getRuntimeBootstrapPaths(runtime) {
    const normalized = normalizeTargetRuntime(runtime);
    switch (normalized) {
        case "generic":
        case "codex":
        case "manual":
            return ["AGENTS.md"];
        case "cursor":
            return [".cursor/rules/ai-engineering-harness.mdc"];
        case "gemini":
            return [
                ".gemini/extensions/ai-engineering-harness/gemini-extension.json",
                ".gemini/extensions/ai-engineering-harness/GEMINI.md",
            ];
        case "claude":
            return [".claude/CLAUDE.md", ".claude/settings.json"];
        default:
            return null;
    }
}
function isValidTargetRuntime(runtime) {
    return constants_1.VALID_TARGET_RUNTIMES.includes(runtime);
}
