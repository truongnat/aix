"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALL_RUNTIMES = void 0;
exports.deepMerge = deepMerge;
exports.installRuntime = installRuntime;
exports.installProviderCommands = installProviderCommands;
exports.parseArgs = parseArgs;
exports.main = main;
/**
 * Runtime-native install for ai-engineering-harness (no root pack copy).
 */
const node_fs_1 = __importDefault(require("node:fs"));
const node_os_1 = __importDefault(require("node:os"));
const node_path_1 = __importDefault(require("node:path"));
// @ts-ignore - JS file with checkJs
const file_operations_js_1 = require("./file-operations.js");
// @ts-ignore - JS file with checkJs
const runtime_command_catalog_js_1 = require("./runtime-command-catalog.js");
// @ts-ignore - JS file with checkJs
const worker_claude_adapter_js_1 = require("./worker-claude-adapter.js");
const provider_rule_renderer_1 = require("./provider-rule-renderer");
const HARNESS_REPO = "truongnat/ai-engineering-harness";
const HARNESS_GIT_URL = `https://github.com/${HARNESS_REPO}`;
const ALL_RUNTIMES = ["cursor", "claude", "codex", "gemini", "generic"];
exports.ALL_RUNTIMES = ALL_RUNTIMES;
function parseArgs(argv) {
    const options = {
        packRoot: "",
        runtime: "",
        scope: "project",
        target: process.cwd(),
        dryRun: false,
        force: false,
    };
    for (let i = 0; i < argv.length; i += 1) {
        const arg = argv[i];
        if (arg === "--pack-root") {
            options.packRoot = argv[++i];
        }
        else if (arg === "--runtime") {
            options.runtime = argv[++i];
        }
        else if (arg === "--scope") {
            options.scope = argv[++i];
        }
        else if (arg === "--target") {
            options.target = argv[++i];
        }
        else if (arg === "--dry-run") {
            options.dryRun = true;
        }
        else if (arg === "--force") {
            options.force = true;
        }
        else if (arg === "--help" || arg === "-h") {
            options.help = true;
        }
        else {
            throw new Error(`Unknown argument: ${arg}`);
        }
    }
    return options;
}
function usage() {
    console.log(`Usage: node install-runtime.js --pack-root <path> --runtime <name> --scope <global|project> --target <path> [--dry-run] [--force]

Runtimes: claude, codex, cursor, gemini, generic, all`);
}
function packPath(packRoot, relativePath) {
    return node_path_1.default.join(packRoot, "runtime", relativePath);
}
function writeFileAction(root, relativePath, content, options) {
    const dest = node_path_1.default.join(root, relativePath);
    const exists = node_fs_1.default.existsSync(dest);
    if (exists && !options.force) {
        (0, file_operations_js_1.logAction)(options.dryRun ? "WOULD SKIP" : "SKIP", relativePath);
        return;
    }
    if (exists && options.force) {
        (0, file_operations_js_1.logAction)(options.dryRun ? "WOULD OVERWRITE" : "OVERWRITE", relativePath);
    }
    else {
        (0, file_operations_js_1.logAction)(options.dryRun ? "WOULD CREATE" : "CREATE", relativePath);
    }
    if (!options.dryRun) {
        (0, file_operations_js_1.ensureDirectory)(node_path_1.default.dirname(dest), false);
        node_fs_1.default.writeFileSync(dest, content, "utf8");
    }
}
function deepMerge(target, source) {
    const out = { ...target };
    for (const [key, value] of Object.entries(source)) {
        if (value && typeof value === "object" && !Array.isArray(value)) {
            const current = out[key] && typeof out[key] === "object" && !Array.isArray(out[key])
                ? out[key]
                : {};
            out[key] = deepMerge(current, value);
        }
        else {
            out[key] = value;
        }
    }
    return out;
}
function mergeJsonFile(destRoot, relativePath, fragment, options) {
    const dest = node_path_1.default.join(destRoot, relativePath);
    const exists = node_fs_1.default.existsSync(dest);
    let current = {};
    if (exists) {
        try {
            current = JSON.parse(node_fs_1.default.readFileSync(dest, "utf8"));
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Invalid JSON in ${relativePath}: ${message}`);
        }
    }
    const merged = deepMerge(current, fragment);
    if (JSON.stringify(current) === JSON.stringify(merged)) {
        (0, file_operations_js_1.logAction)(options.dryRun ? "WOULD SKIP" : "SKIP", relativePath);
        return;
    }
    if (exists && options.force) {
        (0, file_operations_js_1.logAction)(options.dryRun ? "WOULD OVERWRITE" : "OVERWRITE", relativePath);
    }
    else if (exists) {
        (0, file_operations_js_1.logAction)(options.dryRun ? "WOULD UPDATE" : "UPDATE", relativePath);
    }
    else {
        (0, file_operations_js_1.logAction)(options.dryRun ? "WOULD CREATE" : "CREATE", relativePath);
    }
    if (!options.dryRun) {
        (0, file_operations_js_1.ensureDirectory)(node_path_1.default.dirname(dest), false);
        node_fs_1.default.writeFileSync(dest, `${JSON.stringify(merged, null, 2)}\n`, "utf8");
    }
}
function readPackBootstrap(packRoot, name) {
    const filePath = packPath(packRoot, node_path_1.default.join("bootstrap", name));
    return node_fs_1.default.readFileSync(filePath, "utf8");
}
function installCursor(scope, targetRoot, packRoot, options) {
    void packRoot;
    const destRoot = scope === "global" ? node_path_1.default.join(node_os_1.default.homedir(), ".cursor") : targetRoot;
    const rules = [
        ["rules/ai-engineering-harness.mdc", (0, provider_rule_renderer_1.renderCursorActivationMdc)()],
        ["rules/ai-engineering-harness-commands.mdc", (0, provider_rule_renderer_1.renderCursorCommandsMdc)()],
        ["rules/ai-engineering-harness-guardrails.mdc", (0, provider_rule_renderer_1.renderCursorGuardrailsMdc)()],
    ];
    for (const [relativePath, content] of rules) {
        writeFileAction(destRoot, relativePath, content, options);
    }
}
function installCodex(scope, targetRoot, packRoot, options) {
    if (scope === "global") {
        const destRoot = node_path_1.default.join(node_os_1.default.homedir(), ".codex");
        writeFileAction(destRoot, "AGENTS.md", readPackBootstrap(packRoot, "AGENTS.global.codex.md"), options);
        console.log("NEXT: Codex native support — install plugin via /plugins (marketplace pending). Package: .codex-plugin/plugin.json + skills/");
        return;
    }
    writeFileAction(targetRoot, "AGENTS.md", (0, provider_rule_renderer_1.renderCodexAgentsMd)(), options);
    console.log("NEXT: Codex — project install is AGENTS.md + .ai-harness/ fallback only. Native: /plugins → ai-engineering-harness plugin (not /harness-* slash).");
}
function installGeneric(scope, targetRoot, packRoot, options) {
    if (scope === "global") {
        console.log("SKIP generic global (use codex runtime for ~/.codex/AGENTS.md)");
        return;
    }
    installCodex("project", targetRoot, packRoot, options);
}
function installClaude(scope, targetRoot, packRoot, options) {
    if (scope === "global") {
        const homeClaude = node_path_1.default.join(node_os_1.default.homedir(), ".claude");
        writeFileAction(homeClaude, "CLAUDE.md", node_fs_1.default.readFileSync(packPath(packRoot, "claude/CLAUDE.global.md"), "utf8"), options);
        mergeJsonFile(homeClaude, "settings.json", {
            extraKnownMarketplaces: JSON.parse(node_fs_1.default.readFileSync(packPath(packRoot, "claude/settings.project.fragment.json"), "utf8")).extraKnownMarketplaces,
        }, options);
        console.log(`NEXT: In Claude Code run: /plugin install ai-engineering-harness@ai-engineering-harness (marketplace from ${HARNESS_GIT_URL})`);
        return;
    }
    (0, file_operations_js_1.ensureDirectory)(node_path_1.default.join(targetRoot, ".claude"), options.dryRun);
    writeFileAction(targetRoot, ".claude/CLAUDE.md", (0, provider_rule_renderer_1.renderClaudeProjectMd)(), options);
    mergeJsonFile(targetRoot, ".claude/settings.json", JSON.parse(node_fs_1.default.readFileSync(packPath(packRoot, "claude/settings.project.fragment.json"), "utf8")), options);
    for (const entry of (0, worker_claude_adapter_js_1.installClaudeWorkers)(targetRoot, packRoot, options)) {
        if (entry && entry.action && entry.relativePath) {
            (0, file_operations_js_1.logAction)(entry.action, entry.relativePath);
        }
    }
    console.log("NEXT: In Claude Code run: /plugin install ai-engineering-harness@ai-engineering-harness");
}
function installGemini(scope, targetRoot, packRoot, options) {
    const extName = "ai-engineering-harness";
    const destRoot = scope === "global"
        ? node_path_1.default.join(node_os_1.default.homedir(), ".gemini", "extensions", extName)
        : node_path_1.default.join(targetRoot, ".gemini", "extensions", extName);
    const relBase = scope === "global" ? `~/.gemini/extensions/${extName}` : `.gemini/extensions/${extName}`;
    const manifest = node_fs_1.default.readFileSync(packPath(packRoot, "gemini/gemini-extension.json"), "utf8");
    writeFileAction(destRoot, "gemini-extension.json", manifest, options);
    writeFileAction(destRoot, "GEMINI.md", (0, provider_rule_renderer_1.renderGeminiMd)(), options);
    if (scope === "project") {
        console.log(`NEXT: Or run: gemini extensions install ${HARNESS_GIT_URL}`);
    }
    else {
        console.log(`NEXT: Restart Gemini CLI to load extension from ${relBase}`);
    }
}
function installProviderCommands(runtime, scope, targetRoot, packRoot, options) {
    void packRoot;
    if (scope !== "project") {
        return;
    }
    const results = (0, runtime_command_catalog_js_1.installProviderCommandSurface)(runtime, scope, targetRoot, packRoot, options);
    for (const entry of results) {
        if (entry && entry.action && entry.relativePath) {
            (0, file_operations_js_1.logAction)(entry.action, entry.relativePath);
        }
    }
}
function installOne(runtime, scope, targetRoot, packRoot, options) {
    console.log(`\n--- Runtime: ${runtime} (${scope}) ---`);
    switch (runtime) {
        case "cursor":
            installCursor(scope, targetRoot, packRoot, options);
            break;
        case "codex":
            installCodex(scope, targetRoot, packRoot, options);
            break;
        case "claude":
            installClaude(scope, targetRoot, packRoot, options);
            break;
        case "gemini":
            installGemini(scope, targetRoot, packRoot, options);
            break;
        case "generic":
            installGeneric(scope, targetRoot, packRoot, options);
            break;
        default:
            throw new Error(`Unsupported runtime: ${runtime}`);
    }
    installProviderCommands(runtime, scope, targetRoot, packRoot, options);
}
function installRuntime(options) {
    if (!options.packRoot || !node_fs_1.default.existsSync(node_path_1.default.join(options.packRoot, "runtime", "README.md"))) {
        throw new Error("Invalid --pack-root (missing runtime/ payloads)");
    }
    const targetRoot = node_path_1.default.resolve(options.target);
    if (options.scope === "project" && !options.dryRun && !node_fs_1.default.existsSync(targetRoot)) {
        node_fs_1.default.mkdirSync(targetRoot, { recursive: true });
    }
    const runtimes = options.runtime === "all"
        ? ALL_RUNTIMES
        : [options.runtime];
    for (const runtime of runtimes) {
        installOne(runtime, options.scope, targetRoot, options.packRoot, options);
    }
    console.log("\n--- Runtime install complete ---");
}
function main() {
    let options;
    try {
        options = parseArgs(process.argv.slice(2));
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`install-runtime.js: error: ${message}`);
        process.exit(1);
    }
    if (options.help) {
        usage();
        process.exit(0);
    }
    if (!options.packRoot || !options.runtime) {
        console.error("install-runtime.js: error: --pack-root and --runtime are required");
        usage();
        process.exit(1);
    }
    if (options.scope !== "global" && options.scope !== "project") {
        console.error("install-runtime.js: error: --scope must be global or project");
        process.exit(1);
    }
    try {
        installRuntime(options);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`install-runtime.js: error: ${message}`);
        process.exit(1);
    }
}
