"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SLASH_COMMANDS = exports.CANONICAL_COMMANDS = exports.CLI_DIAGNOSTIC_COMMANDS = exports.WORKFLOW_COMMANDS = exports.PROVIDER_COMMAND_SUPPORT = exports.PACK_PLUGIN_PATHS = exports.PROMPT_TEMPLATES_DIR = exports.RUNTIME_COMMANDS_DIR = exports.CACHE_DIR = exports.COMMAND_NAMESPACE = void 0;
exports.providerCommandSupport = providerCommandSupport;
exports.providerInvocationFor = providerInvocationFor;
exports.formatProviderUseLine = formatProviderUseLine;
exports.providerCommandPathsForRuntime = providerCommandPathsForRuntime;
exports.runtimeCommandCatalogPathsForPlan = runtimeCommandCatalogPathsForPlan;
// @ts-ignore - JS file with checkJs
const provider_rule_renderer_js_1 = require("../provider-rule-renderer.js");
const COMMAND_NAMESPACE = "harness";
exports.COMMAND_NAMESPACE = COMMAND_NAMESPACE;
const CACHE_DIR = ".ai-harness";
exports.CACHE_DIR = CACHE_DIR;
const RUNTIME_COMMANDS_DIR = `${CACHE_DIR}/runtime-commands`;
exports.RUNTIME_COMMANDS_DIR = RUNTIME_COMMANDS_DIR;
const PROMPT_TEMPLATES_DIR = `${CACHE_DIR}/prompt-templates`;
exports.PROMPT_TEMPLATES_DIR = PROMPT_TEMPLATES_DIR;
/**
 * Package plugin manifests keyed by provider.
 */
const PACK_PLUGIN_PATHS = Object.freeze({
    cursor: ".cursor-plugin/plugin.json",
    claude: ".claude-plugin/plugin.json",
    codex: ".codex-plugin/plugin.json",
    gemini: "gemini-extension.json",
});
exports.PACK_PLUGIN_PATHS = PACK_PLUGIN_PATHS;
/**
 * Provider command capability matrix (honest; do not claim native slash unless verified).
 */
const PROVIDER_COMMAND_SUPPORT = Object.freeze({
    claude: {
        provider: "Claude Code",
        status: "native-plugin",
        nativeCommandSupport: true,
        nativeCommands: true,
        fallbackActivation: true,
        packagingPath: ".claude-plugin/plugin.json",
        installMethod: "/plugin install ai-engineering-harness (marketplace) or project .claude/commands/harness-<id>.md",
        installedPaths: [".claude/commands/", ".claude-plugin/ (npm package root)"],
        workflowInvocation: "/harness-plan (project command file)",
        pluginSkillNamespace: "/ai-engineering-harness:<skill> when plugin installed",
        fallbackInstruction: "Prefer /plugin install from repo marketplace; project install adds .claude/commands/harness-plan.md → /harness-plan per Claude docs.",
        notes: "Pack ships .claude-plugin/ + skills/ + commands/. Plugin skill namespace may use colon form; project command IDs use harness-plan hyphen form.",
        invocations: { plan: "/harness-plan" },
    },
    cursor: {
        provider: "Cursor",
        status: "plugin-ready",
        nativeCommandSupport: false,
        nativeCommands: false,
        fallbackActivation: true,
        packagingPath: ".cursor-plugin/plugin.json",
        installMethod: "/add-plugin ai-engineering-harness (marketplace pending) or npx project install + rules",
        installedPaths: [
            ".cursor-plugin/plugin.json (package)",
            ".cursor/rules/ai-engineering-harness.mdc",
            ".cursor/rules/ai-engineering-harness-commands.mdc",
            ".cursor/rules/ai-engineering-harness-guardrails.mdc",
        ],
        workflowInvocation: null,
        pluginSkillNamespace: null,
        fallbackInstruction: "Install plugin: /add-plugin ai-engineering-harness when published. Project npx install: .cursor/rules activate .ai-harness/ (fallback).",
        notes: "Native commands come from Cursor plugin manifest commands field — not project .cursor/commands/.",
        invocations: {},
    },
    codex: {
        provider: "Codex",
        status: "plugin-packaging",
        nativeCommandSupport: false,
        nativeCommands: false,
        nativeSlashCommands: false,
        fallbackActivation: true,
        packagingPath: ".codex-plugin/plugin.json",
        pluginManifest: ".codex-plugin/plugin.json",
        installMethod: "Codex /plugins marketplace (install plugin when published) — skills surface",
        installedPaths: ["AGENTS.md (project fallback)"],
        workflowInvocation: null,
        pluginSkillNamespace: "/plugins marketplace skill surface",
        fallbackInstruction: "Native: open Codex /plugins, install ai-engineering-harness plugin (marketplace pending). Use plugin skills. Project npx install: AGENTS.md + .ai-harness/ fallback only — no /harness-* slash.",
        notes: "Codex is not a project-local slash-command provider. Package ships .codex-plugin/plugin.json + skills/ per openai/plugins layout.",
        invocations: {},
    },
    generic: {
        provider: "Generic AGENTS.md",
        status: "fallback-only",
        nativeCommandSupport: false,
        nativeCommands: false,
        nativeSlashCommands: false,
        fallbackActivation: true,
        packagingPath: null,
        installMethod: "AGENTS.md activation + .ai-harness/ catalog",
        installedPaths: ["AGENTS.md"],
        workflowInvocation: null,
        pluginSkillNamespace: null,
        fallbackInstruction: 'Ask the agent: "Use harness-plan for this repository."',
        notes: "Generic bootstrap — not Codex plugin UI. For Codex native skills use codex provider + /plugins.",
        invocations: {},
    },
    gemini: {
        provider: "Gemini",
        status: "fallback-only",
        nativeCommandSupport: false,
        nativeCommands: false,
        fallbackActivation: true,
        packagingPath: "gemini-extension.json",
        installMethod: "gemini extensions install <git-url> or project .gemini/extensions/...",
        installedPaths: [
            ".gemini/extensions/ai-engineering-harness/gemini-extension.json",
            "GEMINI.md",
        ],
        workflowInvocation: null,
        pluginSkillNamespace: null,
        fallbackInstruction: 'gemini extensions install https://github.com/truongnat/ai-engineering-harness — context via GEMINI.md; ask "use harness-plan".',
        notes: "Extension context/skills — no invented slash commands under extension commands/.",
        invocations: {},
    },
    antigravity: {
        provider: "Antigravity",
        status: "planned",
        nativeCommandSupport: false,
        installedPaths: [],
        workflowInvocation: null,
        pluginSkillNamespace: null,
        fallbackInstruction: "Not implemented.",
        notes: "Planned provider research only.",
        invocations: {},
    },
});
exports.PROVIDER_COMMAND_SUPPORT = PROVIDER_COMMAND_SUPPORT;
const WORKFLOW_COMMANDS = Object.freeze([
    {
        id: "start",
        canonical: "harness-start",
        title: "Harness Start",
        sourceCommand: "commands/harness-start.md",
        description: "Run Session Start to restore or establish session state and map repository/current context.",
    },
    {
        id: "map",
        canonical: "harness-map",
        title: "Harness Map",
        sourceCommand: "commands/harness-map.md",
        description: "Backward-compatible manual context refresh outside the normal workflow.",
    },
    {
        id: "discuss",
        canonical: "harness-discuss",
        title: "Harness Discuss",
        sourceCommand: "commands/harness-discuss.md",
        description: "Discuss scope, constraints, and approach before planning.",
    },
    {
        id: "plan",
        canonical: "harness-plan",
        title: "Harness Plan",
        sourceCommand: "commands/harness-plan.md",
        description: "Create or update a project-scoped implementation plan.",
    },
    {
        id: "run",
        canonical: "harness-run",
        title: "Harness Run",
        sourceCommand: "commands/harness-run.md",
        description: "Execute the approved plan with evidence-backed progress.",
    },
    {
        id: "verify",
        canonical: "harness-verify",
        title: "Harness Verify",
        sourceCommand: "commands/harness-verify.md",
        description: "Verify implementation against gates and proof requirements.",
    },
    {
        id: "ship",
        canonical: "harness-ship",
        title: "Harness Ship",
        sourceCommand: "commands/harness-ship.md",
        description: "Ship completed work with status aligned to proof.",
    },
    {
        id: "remember",
        canonical: "harness-remember",
        title: "Harness Remember",
        sourceCommand: "commands/harness-remember.md",
        description: "Record durable lessons in project memory.",
    },
]);
exports.WORKFLOW_COMMANDS = WORKFLOW_COMMANDS;
const CLI_DIAGNOSTIC_COMMANDS = Object.freeze(["status", "doctor"]);
exports.CLI_DIAGNOSTIC_COMMANDS = CLI_DIAGNOSTIC_COMMANDS;
const CANONICAL_COMMANDS = WORKFLOW_COMMANDS.map((c) => c.canonical);
exports.CANONICAL_COMMANDS = CANONICAL_COMMANDS;
/** @deprecated Display-only; not a claim of native slash support */
const SLASH_COMMANDS = CANONICAL_COMMANDS.map((c) => `/${c}`);
exports.SLASH_COMMANDS = SLASH_COMMANDS;
function providerCommandSupport(providerId) {
    const base = PROVIDER_COMMAND_SUPPORT[(providerId in PROVIDER_COMMAND_SUPPORT ? providerId : "generic")] || PROVIDER_COMMAND_SUPPORT.generic;
    const rules = provider_rule_renderer_js_1.PROVIDER_RULE_ADAPTERS[providerId] || provider_rule_renderer_js_1.PROVIDER_RULE_ADAPTERS.generic;
    return {
        ...base,
        ruleEntrypoints: rules.ruleEntrypoints,
        nativeSlashCommands: rules.nativeSlashCommands,
        nativeInvocationExample: rules.nativeInvocationExample,
        supportsSubagents: rules.supportsSubagents,
        ruleMode: rules.ruleMode,
    };
}
function providerInvocationFor(providerId, commandId) {
    const spec = providerCommandSupport(providerId);
    if (!spec.invocations) {
        return null;
    }
    const hit = spec.invocations[commandId];
    return hit === undefined ? null : hit;
}
function formatProviderUseLine(providerId) {
    return providerCommandSupport(providerId).fallbackInstruction;
}
function providerCommandPathsForRuntime(runtime, scope) {
    if (scope !== "project") {
        return [];
    }
    return [...(providerCommandSupport(runtime).installedPaths || [])];
}
function runtimeCommandCatalogPathsForPlan(providerId, scope) {
    const paths = [];
    if (scope === "project") {
        paths.push(`${RUNTIME_COMMANDS_DIR}/`);
        paths.push(`${CACHE_DIR}/activation.md`);
        paths.push(`${CACHE_DIR}/manifest.json`);
        paths.push(`${PROMPT_TEMPLATES_DIR}/`);
        const spec = providerCommandSupport(providerId);
        for (const rel of spec.installedPaths) {
            if (providerId === "claude") {
                for (const cmd of WORKFLOW_COMMANDS) {
                    paths.push(`.claude/commands/harness-${cmd.id}.md`);
                }
            }
            else if (rel.endsWith("/")) {
                paths.push(rel);
            }
            else {
                paths.push(rel);
            }
        }
    }
    return [...new Set(paths)];
}
