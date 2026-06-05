"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeFile = writeFile;
exports.installPromptTemplates = installPromptTemplates;
exports.installRuntimeCommandCatalog = installRuntimeCommandCatalog;
exports.mergeManifestProviders = mergeManifestProviders;
exports.installClaudeNativeCommands = installClaudeNativeCommands;
exports.installCursorHarnessFallback = installCursorHarnessFallback;
exports.appendAgentsCommandAliases = appendAgentsCommandAliases;
exports.installGeminiHarnessFallback = installGeminiHarnessFallback;
exports.installProviderNativeCommands = installProviderNativeCommands;
exports.installProviderFallbackCommands = installProviderFallbackCommands;
exports.installProviderCommandSurface = installProviderCommandSurface;
exports.fileReferencesActivation = fileReferencesActivation;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
// @ts-ignore - JS file with checkJs
const provider_rule_renderer_js_1 = require("../provider-rule-renderer.js");
const provider_command_metadata_1 = require("./provider-command-metadata");
const command_rendering_1 = require("./command-rendering");
function writeFile(targetRoot, relativePath, content, options) {
    const dest = node_path_1.default.join(targetRoot, relativePath);
    const exists = node_fs_1.default.existsSync(dest);
    const action = exists
        ? options.force
            ? options.dryRun
                ? "WOULD OVERWRITE"
                : "OVERWRITE"
            : options.dryRun
                ? "WOULD SKIP"
                : "SKIP"
        : options.dryRun
            ? "WOULD CREATE"
            : "CREATE";
    if (action === "SKIP" || action === "WOULD SKIP") {
        return { action, relativePath };
    }
    if (!options.dryRun) {
        node_fs_1.default.mkdirSync(node_path_1.default.dirname(dest), { recursive: true });
        node_fs_1.default.writeFileSync(dest, content, "utf8");
    }
    return { action, relativePath };
}
function installPromptTemplates(targetRoot, options = {}) {
    const opts = { dryRun: false, force: false, ...options };
    const repoRoot = node_path_1.default.resolve(__dirname, "../..");
    const sourceDir = node_path_1.default.join(repoRoot, "prompt-templates");
    const results = [];
    if (!node_fs_1.default.existsSync(sourceDir)) {
        return results;
    }
    for (const fileName of node_fs_1.default.readdirSync(sourceDir)) {
        const sourcePath = node_path_1.default.join(sourceDir, fileName);
        if (!node_fs_1.default.statSync(sourcePath).isFile()) {
            continue;
        }
        results.push(writeFile(targetRoot, `${provider_command_metadata_1.PROMPT_TEMPLATES_DIR}/${fileName}`, node_fs_1.default.readFileSync(sourcePath, "utf8"), opts));
    }
    return results;
}
function installRuntimeCommandCatalog(targetRoot, options = {}) {
    const opts = { dryRun: false, force: false, ...options };
    const results = [];
    results.push(...installPromptTemplates(targetRoot, opts));
    results.push(writeFile(targetRoot, `${provider_command_metadata_1.CACHE_DIR}/activation.md`, (0, command_rendering_1.activationMarkdown)(), opts));
    for (const spec of provider_command_metadata_1.WORKFLOW_COMMANDS) {
        results.push(writeFile(targetRoot, `${provider_command_metadata_1.RUNTIME_COMMANDS_DIR}/harness-${spec.id}.md`, (0, command_rendering_1.renderRuntimeCommandFile)(spec), opts));
    }
    const manifestPath = `${provider_command_metadata_1.CACHE_DIR}/manifest.json`;
    let existingProviders = {};
    const manifestDest = node_path_1.default.join(targetRoot, manifestPath);
    if (node_fs_1.default.existsSync(manifestDest)) {
        try {
            const parsed = JSON.parse(node_fs_1.default.readFileSync(manifestDest, "utf8"));
            if (parsed.providerCommandEntrypoints &&
                typeof parsed.providerCommandEntrypoints === "object") {
                existingProviders = parsed.providerCommandEntrypoints;
            }
        }
        catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            console.warn(`Warning: Invalid manifest at ${manifestDest}, will be replaced: ${message}`);
        }
    }
    const manifest = (0, command_rendering_1.buildManifest)(existingProviders);
    results.push(writeFile(targetRoot, manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, {
        ...opts,
        force: true,
    }));
    return results;
}
function mergeManifestProviders(targetRoot, runtime, paths, options = {}) {
    const opts = { dryRun: false, force: false, ...options };
    const cacheDir = node_path_1.default.join(targetRoot, provider_command_metadata_1.CACHE_DIR);
    if (!node_fs_1.default.existsSync(cacheDir)) {
        return { action: "SKIP", relativePath: `${provider_command_metadata_1.CACHE_DIR}/manifest.json` };
    }
    const manifestPath = node_path_1.default.join(targetRoot, `${provider_command_metadata_1.CACHE_DIR}/manifest.json`);
    let manifest = (0, command_rendering_1.buildManifest)();
    if (node_fs_1.default.existsSync(manifestPath)) {
        try {
            const parsed = JSON.parse(node_fs_1.default.readFileSync(manifestPath, "utf8"));
            if (parsed && typeof parsed === "object") {
                manifest = { ...(0, command_rendering_1.buildManifest)(), ...parsed };
            }
        }
        catch {
            /* reset */
        }
    }
    manifest.providerCommandEntrypoints = manifest.providerCommandEntrypoints || {};
    manifest.providerCommandEntrypoints[runtime] = paths;
    manifest.commandSurface = (0, command_rendering_1.buildCommandSurface)(manifest.providerCommandEntrypoints);
    return writeFile(targetRoot, `${provider_command_metadata_1.CACHE_DIR}/manifest.json`, `${JSON.stringify(manifest, null, 2)}\n`, {
        ...opts,
        force: true,
    });
}
function installClaudeNativeCommands(targetRoot, packRoot, options) {
    void packRoot;
    const results = [];
    for (const spec of provider_command_metadata_1.WORKFLOW_COMMANDS) {
        results.push(writeFile(targetRoot, `.claude/commands/harness-${spec.id}.md`, (0, command_rendering_1.renderClaudeCommandFileFromSpec)(spec), options));
    }
    results.push(mergeManifestProviders(targetRoot, "claude", (0, provider_command_metadata_1.providerCommandPathsForRuntime)("claude", "project"), options));
    return results;
}
function installCursorHarnessFallback(targetRoot, options) {
    const results = [
        writeFile(targetRoot, ".cursor/rules/ai-engineering-harness.mdc", (0, provider_rule_renderer_js_1.renderCursorActivationMdc)(), options),
        writeFile(targetRoot, ".cursor/rules/ai-engineering-harness-commands.mdc", (0, provider_rule_renderer_js_1.renderCursorCommandsMdc)(), options),
        writeFile(targetRoot, ".cursor/rules/ai-engineering-harness-guardrails.mdc", (0, provider_rule_renderer_js_1.renderCursorGuardrailsMdc)(), options),
    ];
    results.push(mergeManifestProviders(targetRoot, "cursor", (0, provider_command_metadata_1.providerCommandPathsForRuntime)("cursor", "project"), options));
    return results;
}
function appendAgentsCommandAliases(agentsPath, options) {
    const marker = "## Harness commands (project-scoped, fallback aliases)";
    const legacyMarker = "## Harness slash commands (project-scoped)";
    const harnessMarker = "ai-engineering-harness";
    let content = node_fs_1.default.existsSync(agentsPath) ? node_fs_1.default.readFileSync(agentsPath, "utf8") : "";
    if (content.includes(".ai-harness/runtime-commands/") && content.includes("harness-plan")) {
        return {
            action: options.dryRun ? "WOULD SKIP" : "SKIP",
            relativePath: node_path_1.default.basename(agentsPath),
            reason: "provider-adapter-agents-complete",
        };
    }
    if (content &&
        !content.includes(harnessMarker) &&
        !content.includes(marker) &&
        !content.includes(legacyMarker)) {
        return {
            action: options.dryRun ? "WOULD SKIP" : "SKIP",
            relativePath: node_path_1.default.basename(agentsPath),
            reason: "no-harness-marker",
        };
    }
    if (content.includes(marker) || content.includes(legacyMarker)) {
        const splitMarker = content.includes(marker) ? marker : legacyMarker;
        const before = content.split(splitMarker)[0].trimEnd();
        content = `${before}\n${(0, command_rendering_1.renderAgentsCommandAliasesSection)()}`;
    }
    else if (node_fs_1.default.existsSync(agentsPath) &&
        !content.includes("ai-engineering-harness") &&
        !options.force) {
        return { action: "SKIP", relativePath: node_path_1.default.basename(agentsPath) };
    }
    else {
        content = `${content.trimEnd()}\n${(0, command_rendering_1.renderAgentsCommandAliasesSection)()}`;
    }
    if (!options.dryRun) {
        node_fs_1.default.mkdirSync(node_path_1.default.dirname(agentsPath), { recursive: true });
        node_fs_1.default.writeFileSync(agentsPath, content, "utf8");
    }
    return {
        action: options.dryRun ? "WOULD UPDATE" : "UPDATE",
        relativePath: node_path_1.default.basename(agentsPath),
    };
}
function installGeminiHarnessFallback(targetRoot, options) {
    const extRoot = node_path_1.default.join(targetRoot, ".gemini/extensions/ai-engineering-harness");
    const results = [];
    const geminiMd = node_path_1.default.join(extRoot, "GEMINI.md");
    if (node_fs_1.default.existsSync(geminiMd)) {
        let body = node_fs_1.default.readFileSync(geminiMd, "utf8");
        const marker = "## Harness commands";
        if (!body.includes(marker)) {
            body = `${body.trimEnd()}\n\n## Harness commands\n\nRead \`.ai-harness/activation.md\` first. Use **gemini extensions install** from pack \`gemini-extension.json\` or project extension dir. Ask: **use harness-plan** — no slash claim.\n`;
            results.push(writeFile(targetRoot, ".gemini/extensions/ai-engineering-harness/GEMINI.md", body, {
                ...options,
                force: true,
            }));
        }
    }
    results.push(mergeManifestProviders(targetRoot, "gemini", (0, provider_command_metadata_1.providerCommandPathsForRuntime)("gemini", "project"), options));
    return results;
}
function installProviderNativeCommands(runtime, scope, targetRoot, packRoot, options) {
    if (scope !== "project") {
        return [];
    }
    if (runtime === "claude") {
        return installClaudeNativeCommands(targetRoot, packRoot, options);
    }
    return [];
}
function installProviderFallbackCommands(runtime, scope, targetRoot, packRoot, options) {
    void packRoot;
    if (scope !== "project") {
        return [];
    }
    switch (runtime) {
        case "cursor":
            return installCursorHarnessFallback(targetRoot, options);
        case "gemini":
            return installGeminiHarnessFallback(targetRoot, options);
        case "codex":
        case "generic": {
            const agentsPath = node_path_1.default.join(targetRoot, "AGENTS.md");
            const results = [];
            if (node_fs_1.default.existsSync(agentsPath) || !options.dryRun) {
                results.push(appendAgentsCommandAliases(agentsPath, options));
            }
            results.push(mergeManifestProviders(targetRoot, runtime, (0, provider_command_metadata_1.providerCommandPathsForRuntime)(runtime, "project"), options));
            return results;
        }
        default:
            return [];
    }
}
function installProviderCommandSurface(runtime, scope, targetRoot, packRoot, options) {
    const native = installProviderNativeCommands(runtime, scope, targetRoot, packRoot, options);
    const fallback = installProviderFallbackCommands(runtime, scope, targetRoot, packRoot, options);
    return [...native, ...fallback];
}
function fileReferencesActivation(filePath) {
    try {
        return node_fs_1.default.readFileSync(filePath, "utf8").includes(".ai-harness/activation.md");
    }
    catch {
        return false;
    }
}
