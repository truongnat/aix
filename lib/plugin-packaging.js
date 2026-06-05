"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PACK_PLUGIN_PATHS = void 0;
exports.readPackageVersion = readPackageVersion;
exports.buildCursorPluginManifest = buildCursorPluginManifest;
exports.buildClaudePluginManifest = buildClaudePluginManifest;
exports.buildCodexPluginManifest = buildCodexPluginManifest;
exports.buildGeminiExtensionManifest = buildGeminiExtensionManifest;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
function readPackageVersion(repoRoot = node_path_1.default.join(__dirname, "..")) {
    const pkg = JSON.parse(node_fs_1.default.readFileSync(node_path_1.default.join(repoRoot, "package.json"), "utf8"));
    return pkg.version;
}
function pluginAuthorBlock() {
    return {
        name: "truongnat",
        homepage: "https://github.com/truongnat/ai-engineering-harness",
        repository: "https://github.com/truongnat/ai-engineering-harness",
        license: "MIT",
    };
}
function buildCursorPluginManifest(version) {
    return {
        name: "ai-engineering-harness",
        displayName: "AI Engineering Harness",
        description: "Project-scoped engineering workflows for AI coding agents",
        version,
        author: { name: "truongnat" },
        homepage: "https://github.com/truongnat/ai-engineering-harness",
        repository: "https://github.com/truongnat/ai-engineering-harness",
        license: "MIT",
        keywords: ["harness", "skills", "workflows", "engineering", "agents"],
        skills: "./skills/",
        commands: "./commands/",
        hooks: "./hooks/hooks-cursor.json",
    };
}
function buildClaudePluginManifest(version) {
    return {
        name: "ai-engineering-harness",
        description: "Markdown-first engineering harness: skills, workflows, commands, and .harness/ project state",
        version,
        author: { name: "truongnat" },
        homepage: "https://github.com/truongnat/ai-engineering-harness",
        repository: "https://github.com/truongnat/ai-engineering-harness",
        license: "MIT",
        keywords: ["harness", "skills", "workflows", "agents", "engineering"],
    };
}
function buildCodexPluginManifest(version) {
    const base = pluginAuthorBlock();
    return {
        name: "ai-engineering-harness",
        version,
        description: "Project-scoped engineering workflows for AI coding agents: planning, verification, shipping, and memory.",
        author: { name: base.name, url: base.homepage },
        homepage: base.homepage,
        repository: base.repository,
        license: base.license,
        keywords: ["engineering", "planning", "verification", "workflow", "skills", "codex", "harness"],
        skills: "./skills/",
        interface: {
            displayName: "AI Engineering Harness",
            shortDescription: "Planning, verification, and shipping workflows for coding agents",
            longDescription: "Use AI Engineering Harness to guide project-scoped agent work through planning, execution, verification, shipping, and memory workflows.",
            developerName: "truongnat",
            category: "Developer Tools",
            capabilities: ["Interactive", "Read", "Write"],
            defaultPrompt: [
                "Plan this feature using the AI Engineering Harness.",
                "Verify this implementation using the AI Engineering Harness.",
            ],
            websiteURL: base.homepage,
            privacyPolicyURL: base.homepage,
            termsOfServiceURL: base.homepage,
            brandColor: "#2563eb",
            screenshots: [],
        },
    };
}
function buildGeminiExtensionManifest(version) {
    return {
        name: "ai-engineering-harness",
        version,
        description: "Engineering harness profile and SDLC discipline for Gemini CLI",
        contextFileName: "GEMINI.md",
    };
}
const PACK_PLUGIN_PATHS = Object.freeze([
    ".cursor-plugin/plugin.json",
    ".claude-plugin/plugin.json",
    ".codex-plugin/plugin.json",
    "gemini-extension.json",
    "hooks/hooks-cursor.json",
]);
exports.PACK_PLUGIN_PATHS = PACK_PLUGIN_PATHS;
