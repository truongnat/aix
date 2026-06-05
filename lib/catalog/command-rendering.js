"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildCommandSurface = buildCommandSurface;
exports.readInstalledCommandSurface = readInstalledCommandSurface;
exports.formatCommandSupportForPlan = formatCommandSupportForPlan;
exports.activationMarkdown = activationMarkdown;
exports.renderRuntimeCommandFile = renderRuntimeCommandFile;
exports.renderClaudeCommandFileFromSpec = renderClaudeCommandFileFromSpec;
exports.renderAgentsCommandAliasesSection = renderAgentsCommandAliasesSection;
exports.buildManifest = buildManifest;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
// @ts-ignore - JS file with checkJs
const provider_rule_renderer_js_1 = require("../provider-rule-renderer.js");
const provider_command_metadata_1 = require("./provider-command-metadata");
function buildCommandSurface(installedProviderEntrypoints = {}) {
    const providers = {};
    for (const [id, spec] of Object.entries(provider_command_metadata_1.PROVIDER_COMMAND_SUPPORT)) {
        if (id === "generic" && providers.codex) {
            continue;
        }
        providers[id] = {
            mode: spec.status,
            nativeCommandSupport: spec.nativeCommandSupport,
            nativeCommands: spec.nativeCommands ?? false,
            nativeSlashCommands: spec.nativeSlashCommands ?? false,
            fallbackActivation: spec.fallbackActivation ?? true,
            pluginManifest: spec.pluginManifest || null,
            packagingPath: spec.packagingPath || null,
            installMethod: spec.installMethod || null,
            installedPaths: [...spec.installedPaths],
            workflowInvocation: spec.workflowInvocation || null,
            pluginSkillNamespace: spec.pluginSkillNamespace || null,
            fallbackInstruction: spec.fallbackInstruction,
            invocations: { ...(spec.invocations || {}) },
        };
        if (installedProviderEntrypoints[id]) {
            providers[id].installed = true;
            providers[id].installedPathsOnDisk = installedProviderEntrypoints[id];
        }
    }
    return {
        canonicalNamespace: provider_command_metadata_1.COMMAND_NAMESPACE,
        localCatalog: provider_command_metadata_1.RUNTIME_COMMANDS_DIR,
        canonicalCommands: [...provider_command_metadata_1.CANONICAL_COMMANDS],
        providers,
    };
}
function readInstalledCommandSurface(targetRoot) {
    const manifestPath = node_path_1.default.join(targetRoot, `${provider_command_metadata_1.CACHE_DIR}/manifest.json`);
    if (!node_fs_1.default.existsSync(manifestPath)) {
        return null;
    }
    try {
        const manifest = JSON.parse(node_fs_1.default.readFileSync(manifestPath, "utf8"));
        const surface = manifest.commandSurface || {};
        const installedProviders = Object.keys(manifest.providerCommandEntrypoints || {});
        return { ...surface, installedProviders };
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.warn(`Warning: Failed to parse manifest at ${manifestPath}: ${message}`);
        return null;
    }
}
function formatCommandSupportForPlan(providerIds) {
    const lines = [
        "Commands:",
        "  Local catalog (always):",
        `    ${provider_command_metadata_1.RUNTIME_COMMANDS_DIR}/`,
        `    ${provider_command_metadata_1.CACHE_DIR}/activation.md`,
        "",
    ];
    for (const providerId of providerIds) {
        const spec = (0, provider_command_metadata_1.providerCommandSupport)(providerId);
        lines.push(`  ${spec.provider}:`);
        lines.push(`    mode: ${spec.status}`);
        if (providerId === "codex") {
            lines.push("    native /harness-* slash: not claimed");
            lines.push("    Codex plugin: .codex-plugin/plugin.json + skills/ (install via /plugins when published)");
            lines.push("    project install: AGENTS.md + .ai-harness/ fallback only");
        }
        lines.push(`    use: ${spec.fallbackInstruction}`);
        if (spec.installedPaths.length) {
            lines.push(`    files: ${spec.installedPaths.join(", ")}`);
        }
        lines.push("");
    }
    lines.push("Canonical command names (local):", ...provider_command_metadata_1.CANONICAL_COMMANDS.slice(0, 6).map((c) => `  ${c}`), "  …");
    return lines.join("\n");
}
function activationMarkdown() {
    return `# ai-engineering-harness — project activation

This repository uses a **project-local** harness install. Canonical command IDs (\`harness-plan\`, \`harness-verify\`, …) apply **only to this repo** via the local catalog below.

## Before any harness command

1. Read \`.ai-harness/manifest.json\` (see \`commandSurface\` for provider-specific support).
2. Read this file (\`.ai-harness/activation.md\`).
3. Use only \`.ai-harness/commands/\`, \`.ai-harness/skills/\`, \`.ai-harness/workflows/\`, and \`.ai-harness/patterns/\` under **this** repository.
4. Use only \`.harness/\` for project-specific state (goals, memory, gates).
5. **Do not** use global skills, sibling-repo harness files, or source-pack paths unless the user explicitly asks.

## If install is incomplete

- If \`.ai-harness/\` is missing: stop and tell the user to run \`npx ai-engineering-harness install\`.
- If \`.harness/\` is missing: warn; some commands need project state — offer to init or continue with reduced context.

## Command routing (local catalog)

Canonical names map to \`.ai-harness/runtime-commands/harness-<id>.md\`, which points at \`.ai-harness/commands/harness-<id>.md\`.

**Native slash commands are provider-dependent.** See \`docs/runtime-command-surface.md\`. If the tool has no verified native slash, ask the user to run \`harness-<id>\` for this repository (e.g. \`harness-plan\`).

## Namespace

Command namespace: \`${provider_command_metadata_1.COMMAND_NAMESPACE}\` (canonical IDs: \`harness-plan\`, \`harness-verify\`, …). Native slash where supported: \`/harness-plan\`, etc.
`;
}
function renderRuntimeCommandFile(spec) {
    const sourcePath = `.ai-harness/${spec.sourceCommand}`;
    const promptTemplatePath = spec.id === "plan" || spec.id === "run" || spec.id === "verify" || spec.id === "ship"
        ? `.ai-harness/prompt-templates/harness-${spec.id}.md`
        : null;
    const behaviorHint = spec.id === "discuss"
        ? "\n## Behavior (discuss)\n\nIf `.harness/REVIEW.md` (or PLAN/STATUS/DISCUSSION) exists: **synthesize and discuss immediately** — do not ask what output the user wants. Max one closing question. See `docs/harness-command-behavior.md`.\n"
        : "";
    return `# ${spec.canonical}

**${spec.title}** — ${spec.description}

This command is **project-scoped** for the repository that contains this \`.ai-harness/\` directory.

## Before doing anything

1. Read \`.ai-harness/manifest.json\`.
2. Read \`.ai-harness/activation.md\`.
3. Read \`${sourcePath}\` (full command contract).
${promptTemplatePath ? `4. Read \`${promptTemplatePath}\`.\n5. Fill its placeholders from local artifacts and repo state.\n6. Follow its blocked or success output format exactly.\n` : ""}${promptTemplatePath ? "7" : "4"}. Read relevant artifacts under \`.harness/\` (REVIEW, PLAN, STATE, GOAL, etc.).
${promptTemplatePath ? "8" : "5"}. Do **not** use global or sibling-repo harness files unless the user explicitly requests it.
${behaviorHint}
## Then

Execute the workflow defined in \`${sourcePath}\` for **this repository only**. Use existing local artifacts first; ask only when blocked.
`;
}
function renderClaudeCommandFileFromSpec(spec) {
    return (0, provider_rule_renderer_js_1.renderClaudeCommandFile)(spec);
}
function renderAgentsCommandAliasesSection() {
    const lines = [
        "",
        "## Harness commands (project-scoped, fallback aliases)",
        "",
        "This repository exposes a **local command catalog** under `.ai-harness/runtime-commands/`. These hyphen-form IDs activate **only** in this repo:",
        "",
        "1. `.ai-harness/activation.md`",
        "2. `.ai-harness/runtime-commands/harness-<command>.md`",
        "3. `.ai-harness/commands/harness-<command>.md`",
        "4. `.harness/` project state",
        "",
        "Ask the agent explicitly, e.g. **Use harness-plan for this repository.**",
        "Do not assume a native `/harness-*` slash command exists in this tool.",
        "",
        "| Canonical | Local routing |",
        "|-----------|---------------|",
        "",
    ];
    for (const spec of provider_command_metadata_1.WORKFLOW_COMMANDS) {
        lines.push(`| ${spec.canonical} | \`.ai-harness/runtime-commands/harness-${spec.id}.md\` → \`.ai-harness/${spec.sourceCommand}\` |`);
    }
    return `${lines.join("\n")}\n`;
}
function buildManifest(providerEntrypoints = {}) {
    return {
        package: "ai-engineering-harness",
        commandNamespace: provider_command_metadata_1.COMMAND_NAMESPACE,
        commandsInstalled: true,
        canonicalCommands: [...provider_command_metadata_1.CANONICAL_COMMANDS],
        runtimeCommandsDir: provider_command_metadata_1.RUNTIME_COMMANDS_DIR,
        commandSurface: buildCommandSurface(providerEntrypoints),
        providerCommandEntrypoints: providerEntrypoints,
    };
}
