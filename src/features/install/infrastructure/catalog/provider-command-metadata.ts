import { PROVIDER_RULE_ADAPTERS } from "../provider-rule-renderer";

const COMMAND_NAMESPACE = "harness";
const CACHE_DIR = ".ai-harness";
const RUNTIME_COMMANDS_DIR = `${CACHE_DIR}/runtime-commands`;
const PROMPT_TEMPLATES_DIR = `${CACHE_DIR}/prompt-templates`;

type ProviderCommandStatus =
  | "native-verified"
  | "native-unverified"
  | "native-plugin"
  | "native-command-files"
  | "plugin-ready"
  | "plugin-packaging"
  | "fallback-only"
  | "planned"
  | "unsupported";

type ProviderId = "claude" | "cursor" | "codex" | "generic" | "gemini" | "antigravity";

interface ProviderCommandSupportEntry {
  provider: string;
  status: ProviderCommandStatus;
  nativeCommandSupport: boolean;
  installedPaths: string[];
  workflowInvocation: string | null;
  pluginSkillNamespace: string | null;
  fallbackInstruction: string;
  notes: string;
  nativeCommands?: boolean;
  fallbackActivation?: boolean;
  packagingPath?: string | null;
  installMethod?: string | null;
  nativeSlashCommands?: boolean;
  pluginManifest?: string | null;
  invocations?: Record<string, string | null>;
}

interface WorkflowCommandSpec {
  id: string;
  canonical: string;
  title: string;
  sourceCommand: string;
  description: string;
}

/**
 * Package plugin manifests keyed by provider.
 */
const PACK_PLUGIN_PATHS: Readonly<Record<Exclude<ProviderId, "generic" | "antigravity">, string>> =
  Object.freeze({
    cursor: ".cursor-plugin/plugin.json",
    claude: ".claude-plugin/plugin.json",
    codex: ".codex-plugin/plugin.json",
    gemini: "gemini-extension.json",
  });

/**
 * Provider command capability matrix (honest; do not claim native slash unless verified).
 */
const PROVIDER_COMMAND_SUPPORT: Readonly<Record<ProviderId, ProviderCommandSupportEntry>> =
  Object.freeze({
    claude: {
      provider: "Claude Code",
      status: "native-plugin",
      nativeCommandSupport: true,
      nativeCommands: true,
      fallbackActivation: true,
      packagingPath: ".claude-plugin/plugin.json",
      installMethod:
        "/plugin install ai-engineering-harness (marketplace) or project .claude/commands/harness-<id>.md",
      installedPaths: [
        ".claude/commands/",
        ".claude/agents/",
        ".claude/skills/",
        ".claude-plugin/ (npm package root)",
      ],
      workflowInvocation: "/harness-plan (project command file)",
      pluginSkillNamespace: "/ai-engineering-harness:<skill> when plugin installed",
      fallbackInstruction:
        "Prefer /plugin install from repo marketplace; project install adds .claude/commands/harness-plan.md → /harness-plan per Claude docs.",
      notes:
        "Pack ships .claude-plugin/ + skills/ + commands/. Plugin skill namespace may use colon form; project command IDs use harness-plan hyphen form.",
      invocations: { plan: "/harness-plan" },
    },
    cursor: {
      provider: "Cursor",
      status: "native-command-files",
      nativeCommandSupport: true,
      nativeCommands: true,
      nativeSlashCommands: true,
      fallbackActivation: true,
      packagingPath: ".cursor-plugin/plugin.json",
      installMethod:
        "/add-plugin ai-engineering-harness (marketplace pending) or npx project install + .cursor/commands + rules",
      installedPaths: [
        ".cursor/commands/",
        ".cursor/rules/",
        ".cursor-plugin/plugin.json (package)",
      ],
      workflowInvocation: "/harness-plan (project command file)",
      pluginSkillNamespace: null,
      fallbackInstruction:
        "Project install adds .cursor/commands/ plus .cursor/rules/; use /harness-plan in Cursor after install.",
      notes:
        "Cursor project commands are native Markdown slash commands from .cursor/commands/. Rules provide guardrails and fallback routing.",
      invocations: { plan: "/harness-plan" },
    },
    codex: {
      provider: "Codex",
      status: "native-command-files",
      nativeCommandSupport: true,
      nativeCommands: true,
      nativeSlashCommands: true,
      fallbackActivation: true,
      packagingPath: ".codex-plugin/plugin.json",
      pluginManifest: ".codex-plugin/plugin.json",
      installMethod:
        "npx ai-engineering-harness install --provider codex — installs .codex/commands/ + hooks that route /harness-* slash commands",
      installedPaths: [
        "AGENTS.md",
        ".codex/commands/",
        ".codex/hooks/",
        ".codex/agents/",
        ".codex/rules/",
        ".agents/skills/",
      ],
      workflowInvocation: "/harness-plan (routed via UserPromptSubmit hook)",
      pluginSkillNamespace: "/plugins marketplace skill surface",
      fallbackInstruction:
        "Project install adds .codex/commands/ and hooks that intercept /harness-* prompts. Use /harness-start, /harness-plan, etc. in Codex CLI.",
      notes:
        "Codex slash commands are routed via the UserPromptSubmit hook in .codex/hooks/core/codex-hook-router.js. Command files live in .codex/commands/. Also supports .codex-plugin/ for marketplace.",
      invocations: { plan: "/harness-plan" },
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
      notes:
        "Generic bootstrap — not Codex plugin UI. For Codex native skills use codex provider + /plugins.",
      invocations: {},
    },
    gemini: {
      provider: "Gemini",
      status: "native-command-files",
      nativeCommandSupport: true,
      nativeCommands: true,
      fallbackActivation: true,
      packagingPath: "gemini-extension.json",
      installMethod: "gemini extensions install <git-url> or project .gemini/extensions/ package",
      installedPaths: [".gemini/extensions/ai-engineering-harness/"],
      workflowInvocation: "GEMINI.md extension context",
      pluginSkillNamespace: null,
      fallbackInstruction:
        "Project install adds .gemini/extensions/ai-engineering-harness/; use harness-plan via GEMINI.md context.",
      notes:
        "Gemini project install uses extension manifest + GEMINI.md context. No /harness-* slash claim.",
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

const WORKFLOW_COMMANDS: readonly WorkflowCommandSpec[] = Object.freeze([
  {
    id: "start",
    canonical: "harness-start",
    title: "Harness Start",
    sourceCommand: "commands/harness-start.md",
    description:
      "Run Session Start to restore or establish session state and map repository/current context.",
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

const CLI_DIAGNOSTIC_COMMANDS = Object.freeze(["status", "doctor"]);
const CANONICAL_COMMANDS = WORKFLOW_COMMANDS.map((c) => c.canonical);

/** @deprecated Display-only; not a claim of native slash support */
const SLASH_COMMANDS = CANONICAL_COMMANDS.map((c) => `/${c}`);

function providerCommandSupport(providerId: string): ProviderCommandSupportEntry & {
  ruleEntrypoints: string[];
  nativeSlashCommands: boolean;
  nativeInvocationExample: string | null;
  supportsSubagents: boolean;
  ruleMode: string;
} {
  const base =
    PROVIDER_COMMAND_SUPPORT[
      (providerId in PROVIDER_COMMAND_SUPPORT ? providerId : "generic") as ProviderId
    ] || PROVIDER_COMMAND_SUPPORT.generic;
  const rules = PROVIDER_RULE_ADAPTERS[providerId] || PROVIDER_RULE_ADAPTERS.generic;
  return {
    ...base,
    ruleEntrypoints: rules.ruleEntrypoints,
    nativeSlashCommands: rules.nativeSlashCommands,
    nativeInvocationExample: rules.nativeInvocationExample,
    supportsSubagents: rules.supportsSubagents,
    ruleMode: rules.ruleMode,
  };
}

function providerInvocationFor(providerId: string, commandId: string): string | null {
  const spec = providerCommandSupport(providerId);
  if (!spec.invocations) {
    return null;
  }
  const hit = spec.invocations[commandId];
  return hit === undefined ? null : hit;
}

function formatProviderUseLine(providerId: string): string {
  return providerCommandSupport(providerId).fallbackInstruction;
}

function providerCommandPathsForRuntime(runtime: string, scope: string): string[] {
  if (scope !== "project") {
    return [];
  }
  return [...(providerCommandSupport(runtime).installedPaths || [])];
}

function runtimeCommandCatalogPathsForPlan(providerId: string, scope: string): string[] {
  const paths: string[] = [];
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
      } else if (rel.endsWith("/")) {
        paths.push(rel);
      } else {
        paths.push(rel);
      }
    }
  }
  return [...new Set(paths)];
}

export {
  COMMAND_NAMESPACE,
  CACHE_DIR,
  RUNTIME_COMMANDS_DIR,
  PROMPT_TEMPLATES_DIR,
  PACK_PLUGIN_PATHS,
  PROVIDER_COMMAND_SUPPORT,
  WORKFLOW_COMMANDS,
  CLI_DIAGNOSTIC_COMMANDS,
  CANONICAL_COMMANDS,
  SLASH_COMMANDS,
  providerCommandSupport,
  providerInvocationFor,
  formatProviderUseLine,
  providerCommandPathsForRuntime,
  runtimeCommandCatalogPathsForPlan,
};
export type { ProviderCommandStatus, ProviderId, ProviderCommandSupportEntry, WorkflowCommandSpec };
