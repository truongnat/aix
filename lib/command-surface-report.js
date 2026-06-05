"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatStatusCommandLines = formatStatusCommandLines;
exports.formatDoctorCommandLines = formatDoctorCommandLines;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
// @ts-ignore - JS file with checkJs
const runtime_command_catalog_1 = require("./runtime-command-catalog");
function formatStatusCommandLines(targetRoot) {
    const lines = [];
    const cacheDir = node_path_1.default.join(targetRoot, runtime_command_catalog_1.RUNTIME_COMMANDS_DIR);
    lines.push("  command surface:");
    lines.push(`  local catalog:         ${node_fs_1.default.existsSync(cacheDir) ? "yes" : "no"} (${runtime_command_catalog_1.RUNTIME_COMMANDS_DIR}/)`);
    lines.push(`  canonical namespace:   ${runtime_command_catalog_1.COMMAND_NAMESPACE}`);
    const surface = (0, runtime_command_catalog_1.readInstalledCommandSurface)(targetRoot);
    const installed = surface?.installedProviders || [];
    if (installed.length === 0) {
        lines.push("  provider modes:        (no provider entrypoints detected)");
        return lines;
    }
    for (const providerId of installed) {
        const spec = (0, runtime_command_catalog_1.providerCommandSupport)(providerId);
        const mode = surface?.providers?.[providerId]?.mode || spec.status;
        lines.push(`  ${providerId}:                  ${mode}`);
        lines.push(`    use:                   ${(0, runtime_command_catalog_1.formatProviderUseLine)(providerId)}`);
    }
    return lines;
}
function formatDoctorCommandLines(targetRoot, detectedRuntimes) {
    const lines = [];
    const cacheDir = node_path_1.default.join(targetRoot, runtime_command_catalog_1.RUNTIME_COMMANDS_DIR);
    if (node_fs_1.default.existsSync(cacheDir)) {
        lines.push("PASS local command catalog exists (.ai-harness/runtime-commands/)");
    }
    else {
        lines.push("FAIL local command catalog missing (.ai-harness/runtime-commands/)");
    }
    if (node_fs_1.default.existsSync(node_path_1.default.join(targetRoot, ".ai-harness/activation.md"))) {
        lines.push("PASS .ai-harness/activation.md exists");
    }
    else {
        lines.push("FAIL .ai-harness/activation.md missing");
    }
    const planCatalog = node_path_1.default.join(targetRoot, ".ai-harness/runtime-commands/harness-plan.md");
    if (node_fs_1.default.existsSync(planCatalog)) {
        const text = node_fs_1.default.readFileSync(planCatalog, "utf8");
        if (text.includes(".ai-harness/activation.md") &&
            text.includes(".ai-harness/commands/harness-plan.md")) {
            lines.push("PASS harness-plan local catalog routes activation and source command");
        }
        else {
            lines.push("FAIL harness-plan local catalog incomplete");
        }
    }
    for (const rt of detectedRuntimes) {
        const spec = (0, runtime_command_catalog_1.providerCommandSupport)(rt);
        if (spec.status === "plugin-packaging" && rt === "codex") {
            lines.push(`WARN ${spec.provider}: plugin-packaging — no project-local /harness-* slash; use /plugins plugin skills or AGENTS.md fallback`);
            const packManifest = node_path_1.default.join(__dirname, "..", ".codex-plugin/plugin.json");
            if (node_fs_1.default.existsSync(packManifest)) {
                lines.push("PASS npm package includes .codex-plugin/plugin.json (Codex plugin surface)");
            }
            const agents = node_path_1.default.join(targetRoot, "AGENTS.md");
            if (node_fs_1.default.existsSync(agents)) {
                lines.push("PASS Codex project fallback: AGENTS.md present");
            }
        }
        else if (spec.status === "fallback-only" || spec.status === "plugin-ready") {
            lines.push(`WARN ${spec.provider}: ${spec.status}; ${(0, runtime_command_catalog_1.formatProviderUseLine)(rt)}`);
        }
        else if (spec.status === "native-command-files" || spec.status === "native-plugin") {
            lines.push(`PASS ${spec.provider}: ${spec.status} (${spec.workflowInvocation || "see docs"})`);
            if (rt === "claude") {
                const clPlan = node_path_1.default.join(targetRoot, ".claude/commands/harness-plan.md");
                if (!node_fs_1.default.existsSync(clPlan)) {
                    lines.push("WARN Claude project command file missing: .claude/commands/harness-plan.md (plugin install may still apply)");
                }
            }
        }
        else if (spec.status === "native-verified") {
            lines.push(`PASS ${spec.provider}: native command support verified (${spec.workflowInvocation || "see docs"})`);
        }
        for (const rel of spec.installedPaths || []) {
            if (rel.includes("(package)") || rel.includes("npm package")) {
                continue;
            }
            const dest = node_path_1.default.join(targetRoot, rel.replace(/ \(package\)$/, "").split(" ")[0]);
            if (!node_fs_1.default.existsSync(dest)) {
                continue;
            }
            if (rel.endsWith("/")) {
                const entries = node_fs_1.default.readdirSync(dest).filter((n) => !n.startsWith("."));
                if (entries.length === 0) {
                    lines.push(`WARN ${spec.provider} fallback path empty: ${rel}`);
                }
                else {
                    lines.push(`PASS ${spec.provider} fallback files present under ${rel}`);
                }
            }
            else if (node_fs_1.default.existsSync(dest)) {
                const text = node_fs_1.default.readFileSync(dest, "utf8");
                if (text.includes(".ai-harness/activation.md")) {
                    lines.push(`PASS ${spec.provider} command surface references .ai-harness/activation.md (${rel})`);
                }
                else {
                    lines.push(`WARN ${spec.provider} command surface missing activation reference (${rel})`);
                }
            }
        }
    }
    return lines;
}
function main() {
    const mode = process.argv[2];
    const targetRoot = node_path_1.default.resolve(process.argv[3] || ".");
    const runtimes = process.argv.slice(4).filter(Boolean);
    let lines = [];
    if (mode === "status") {
        lines = formatStatusCommandLines(targetRoot);
    }
    else if (mode === "doctor") {
        lines = formatDoctorCommandLines(targetRoot, runtimes);
    }
    else {
        process.exit(1);
    }
    for (const line of lines) {
        console.log(line);
    }
}
if (require.main === module) {
    main();
}
