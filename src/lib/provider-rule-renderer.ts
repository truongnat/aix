import fs from "node:fs";
import path from "node:path";

type CoreFragmentName =
  | "command-naming"
  | "phase-guards"
  | "blocking"
  | "discussion"
  | "option-scoring"
  | "provider-interaction"
  | "session-memory"
  | "tool-routing";

interface ProviderRuleAdapter {
  provider: string;
  ruleMode: string;
  ruleEntrypoints: string[];
  nativeSlashCommands: boolean;
  nativeInvocationExample: string | null;
  supportsSubagents: boolean;
  fallbackInstruction: string;
  notes: string;
}

interface ClaudeCommandSpec {
  id?: string;
  canonical: string;
  title: string;
  sourceCommand?: string;
}

interface RuleRenderOptions {
  coreFragments?: "all" | CoreFragmentName[];
}

// Adjust for dist/ build layout: compiled files are at dist/lib/, so go up 2 levels to reach repo root
const REPO_ROOT = path.resolve(__dirname, "../..");
const RULES_CORE_DIR = path.join(REPO_ROOT, "rules", "core");
const RULES_PROVIDERS_DIR = path.join(REPO_ROOT, "rules", "providers");

const CORE_FRAGMENTS: readonly CoreFragmentName[] = Object.freeze([
  "command-naming",
  "phase-guards",
  "blocking",
  "discussion",
  "option-scoring",
  "provider-interaction",
  "session-memory",
  "tool-routing",
]);

const WORKFLOW_COMMAND_IDS = Object.freeze([
  "start",
  "map",
  "discuss",
  "plan",
  "run",
  "verify",
  "ship",
  "remember",
]);

const PROVIDER_RULE_ADAPTERS: Readonly<Record<string, ProviderRuleAdapter>> = Object.freeze({
  claude: {
    provider: "Claude Code",
    ruleMode: "claude-project",
    ruleEntrypoints: [
      ".claude/CLAUDE.md",
      ".claude/commands/harness-*.md",
      ".claude/agents/harness-*.md",
      ".claude/skills/",
    ],
    nativeSlashCommands: true,
    nativeInvocationExample: "/harness-plan",
    supportsSubagents: true,
    fallbackInstruction:
      "Read .claude/CLAUDE.md and use /harness-plan when project commands are installed.",
    notes: "Only provider with verified project-native /harness-* command files in v1.",
  },
  cursor: {
    provider: "Cursor",
    ruleMode: "cursor-rules",
    ruleEntrypoints: [
      ".cursor/commands/harness-*.md",
      ".cursor/rules/ai-engineering-harness.mdc",
      ".cursor/rules/ai-engineering-harness-commands.mdc",
      ".cursor/rules/ai-engineering-harness-guardrails.mdc",
    ],
    nativeSlashCommands: true,
    nativeInvocationExample: "/harness-plan",
    supportsSubagents: false,
    fallbackInstruction: "Use /harness-plan for this repository.",
    notes:
      "Cursor project install uses .cursor/commands/ for native commands and .cursor/rules/ for guardrails.",
  },
  codex: {
    provider: "Codex",
    ruleMode: "agents-md",
    ruleEntrypoints: ["AGENTS.md", ".codex/", ".agents/skills/"],
    nativeSlashCommands: false,
    nativeInvocationExample: null,
    supportsSubagents: false,
    fallbackInstruction: "Use harness-plan for this repository.",
    notes:
      "AGENTS.md plus .codex/ and .agents/skills/ project fallback. No /harness-* slash claim.",
  },
  gemini: {
    provider: "Gemini",
    ruleMode: "gemini-extension",
    ruleEntrypoints: [
      ".gemini/extensions/ai-engineering-harness/GEMINI.md",
      ".gemini/extensions/ai-engineering-harness/gemini-extension.json",
    ],
    nativeSlashCommands: false,
    nativeInvocationExample: null,
    supportsSubagents: false,
    fallbackInstruction: "Use harness-plan for this repository.",
    notes: "Extension context plus local catalog. No /harness-* slash claim.",
  },
  generic: {
    provider: "Generic AGENTS.md",
    ruleMode: "agents-md",
    ruleEntrypoints: ["AGENTS.md"],
    nativeSlashCommands: false,
    nativeInvocationExample: null,
    supportsSubagents: false,
    fallbackInstruction: "Use harness-plan for this repository.",
    notes: "Plain AGENTS.md fallback when provider is unknown.",
  },
});

function readCoreFragment(name: CoreFragmentName): string {
  const filePath = path.join(RULES_CORE_DIR, `${name}.md`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing core rule fragment: rules/core/${name}.md`);
  }
  return fs.readFileSync(filePath, "utf8").trim();
}

function readProviderTemplate(providerId: string, fileName: string): string {
  const filePath = path.join(RULES_PROVIDERS_DIR, providerId, fileName);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing provider rule template: rules/providers/${providerId}/${fileName}`);
  }
  return fs.readFileSync(filePath, "utf8");
}

function expandCoreMarkers(
  template: string,
  fragmentNames: "all" | CoreFragmentName[] | undefined
): string {
  const names: readonly CoreFragmentName[] =
    fragmentNames === "all"
      ? CORE_FRAGMENTS
      : Array.isArray(fragmentNames)
        ? fragmentNames
        : CORE_FRAGMENTS;

  const output = template.replace(/<!--\s*@core(?::([\w,-]+))?\s*-->/g, (_match, list) => {
    const selected: readonly CoreFragmentName[] = list
      ? list
          .split(",")
          .map((item: string) => item.trim() as CoreFragmentName)
          .filter(Boolean)
      : names;
    return selected.map((name) => readCoreFragment(name)).join("\n\n");
  });

  if (output.includes("<!-- @core")) {
    throw new Error("Unresolved core marker in provider template");
  }

  return output.trimEnd();
}

function applyTemplateVariables(template: string, replacements: Record<string, string>): string {
  const output = template.replace(/\{\{([A-Z_]+)\}\}/g, (_match, key) => {
    if (!Object.prototype.hasOwnProperty.call(replacements, key)) {
      throw new Error(`Unknown provider rule template variable: ${key}`);
    }
    return replacements[key];
  });

  const unresolved = output.match(/\{\{[A-Z_]+\}\}/);
  if (unresolved) {
    throw new Error(`Unresolved provider rule template variable: ${unresolved[0]}`);
  }

  return output;
}

function renderProviderRuleFile(
  providerId: string,
  fileName: string,
  options: RuleRenderOptions = {}
): string {
  const template = readProviderTemplate(providerId, fileName);
  return `${expandCoreMarkers(template, options.coreFragments)}\n`;
}

function renderClaudeProjectMd(): string {
  return renderProviderRuleFile("claude", "CLAUDE.md");
}

function renderCursorActivationMdc(): string {
  return renderProviderRuleFile("cursor", "ai-engineering-harness.mdc");
}

function renderCursorCommandsMdc(): string {
  return renderProviderRuleFile("cursor", "ai-engineering-harness-commands.mdc", {
    coreFragments: ["command-naming", "phase-guards", "blocking"],
  });
}

function renderCursorGuardrailsMdc(): string {
  return renderProviderRuleFile("cursor", "ai-engineering-harness-guardrails.mdc", {
    coreFragments: ["blocking", "phase-guards"],
  });
}

function renderCodexAgentsMd(): string {
  return renderProviderRuleFile("codex", "AGENTS.md");
}

function renderGeminiMd(): string {
  return renderProviderRuleFile("gemini", "GEMINI.md");
}

function renderGenericAgentsMd(): string {
  return renderProviderRuleFile("generic", "AGENTS.md");
}

function renderClaudeCommandFile(spec: ClaudeCommandSpec): string {
  const template = readProviderTemplate("claude", "command.md");
  const sourceCommand = spec.sourceCommand || `commands/${spec.canonical}.md`;
  return `${expandCoreMarkers(
    applyTemplateVariables(template, {
      COMMAND_TITLE: spec.title,
      COMMAND_CANONICAL: spec.canonical,
      SOURCE_COMMAND: sourceCommand,
    }),
    ["blocking"]
  )}\n`;
}

function providerRuleAdapter(providerId: string): ProviderRuleAdapter {
  return PROVIDER_RULE_ADAPTERS[providerId] || PROVIDER_RULE_ADAPTERS.generic;
}

function listProviderRuleOutputs(
  providerId: string
): { relativePath: string; render: (spec?: ClaudeCommandSpec) => string }[] {
  switch (providerId) {
    case "claude":
      return [
        { relativePath: ".claude/CLAUDE.md", render: renderClaudeProjectMd },
        ...WORKFLOW_COMMAND_IDS.map((id) => ({
          relativePath: `.claude/commands/harness-${id}.md`,
          render: (spec?: ClaudeCommandSpec) =>
            renderClaudeCommandFile(
              spec || {
                id,
                canonical: `harness-${id}`,
                title: `Harness ${id}`,
                sourceCommand: `commands/harness-${id}.md`,
              }
            ),
        })),
      ];
    case "cursor":
      return [
        {
          relativePath: ".cursor/rules/ai-engineering-harness.mdc",
          render: renderCursorActivationMdc,
        },
        {
          relativePath: ".cursor/rules/ai-engineering-harness-commands.mdc",
          render: renderCursorCommandsMdc,
        },
        {
          relativePath: ".cursor/rules/ai-engineering-harness-guardrails.mdc",
          render: renderCursorGuardrailsMdc,
        },
      ];
    case "codex":
    case "generic":
      return [
        {
          relativePath: "AGENTS.md",
          render: providerId === "codex" ? renderCodexAgentsMd : renderGenericAgentsMd,
        },
      ];
    case "gemini":
      return [
        {
          relativePath: ".gemini/extensions/ai-engineering-harness/GEMINI.md",
          render: renderGeminiMd,
        },
      ];
    default:
      return [];
  }
}

function hasForbiddenColonCommandIds(content: string): boolean {
  return content.split("\n").some((line) => {
    const trimmed = line.trim();
    if (/^-\s*(harness:|\/harness:|harness_)/.test(trimmed)) {
      return false;
    }
    if (/Incorrect:/i.test(trimmed)) {
      return false;
    }
    if (/do not use [`"]?harness:/i.test(trimmed)) {
      return false;
    }
    return (
      /\bharness:[a-z]/.test(line) || /\/harness:[a-z]/i.test(line) || /\bharness_[a-z]/.test(line)
    );
  });
}

function assertProviderRuleContent(
  relativePath: string,
  content: string,
  failures: string[]
): void {
  if (hasForbiddenColonCommandIds(content)) {
    failures.push(`${relativePath} must not use colon-form harness command IDs`);
  }

  const needsCore =
    relativePath.endsWith(".mdc") ||
    relativePath.endsWith("CLAUDE.md") ||
    relativePath.endsWith("AGENTS.md") ||
    relativePath.endsWith("GEMINI.md");

  if (needsCore) {
    if (!content.includes("Do not skip phases") && !content.includes("Phase Discipline")) {
      failures.push(`${relativePath} must include shared phase guard content from rules/core`);
    }
    if (
      !content.includes("Stop.") &&
      !content.includes("Stop and ask") &&
      !content.includes("STOP")
    ) {
      failures.push(`${relativePath} must include shared blocking content from rules/core`);
    }
    if (!/agent-system\/SYSTEM_PROMPT\.md/.test(content)) {
      failures.push(`${relativePath} must reference .ai-harness/agent-system/SYSTEM_PROMPT.md`);
    }
  }

  if (relativePath.endsWith("ai-engineering-harness.mdc")) {
    if (!content.includes(".cursor/commands/")) {
      failures.push(`${relativePath} must reference .cursor/commands/ for native project commands`);
    }
    if (!content.includes(".ai-harness/runtime-commands/")) {
      failures.push(
        `${relativePath} must reference .ai-harness/runtime-commands/ as the local catalog mirror`
      );
    }
  }

  if (relativePath === "AGENTS.md" && content.includes("Codex")) {
    const hasSlashDocs =
      /\/harness-\w+.*slash commands? are available/i.test(content) ||
      /routed via.*hook/i.test(content) ||
      /\.codex\/commands\//i.test(content);
    if (!hasSlashDocs && !/Do \*\*not\*\* assume native|Do not assume native/i.test(content)) {
      failures.push(`${relativePath} must document /harness-* slash command support for Codex`);
    }
  }

  if (relativePath.endsWith("GEMINI.md")) {
    if (!/Do \*\*not\*\* claim native|Do not claim native/i.test(content)) {
      failures.push(`${relativePath} must deny native /harness-* slash claim for Gemini`);
    }
  }
}

function assertRepositoryProviderRules(baseDir: string, failures: string[]): void {
  for (const name of CORE_FRAGMENTS) {
    const relativePath = `rules/core/${name}.md`;
    if (!fs.existsSync(path.join(baseDir, relativePath))) {
      failures.push(`Missing required path: ${relativePath}`);
    }
  }

  for (const [providerId, adapter] of Object.entries(PROVIDER_RULE_ADAPTERS)) {
    if (providerId === "generic") {
      continue;
    }
    for (const entrypoint of adapter.ruleEntrypoints) {
      if (entrypoint.includes("*")) {
        if (providerId === "claude" && entrypoint === ".claude/commands/harness-*.md") {
          const commandTemplatePath = "rules/providers/claude/command.md";
          if (!fs.existsSync(path.join(baseDir, commandTemplatePath))) {
            failures.push(
              `Missing provider rule template for ${providerId}: ${commandTemplatePath}`
            );
          }
        }
        continue;
      }
      const templatePath = entrypoint
        .replace(/^\.claude\/CLAUDE\.md$/, "rules/providers/claude/CLAUDE.md")
        .replace(/^\.cursor\/rules\//, "rules/providers/cursor/")
        .replace(
          /^AGENTS\.md$/,
          `rules/providers/${providerId === "codex" ? "codex" : "generic"}/AGENTS.md`
        )
        .replace(
          /^\.gemini\/extensions\/ai-engineering-harness\/GEMINI\.md$/,
          "rules/providers/gemini/GEMINI.md"
        );

      if (
        templatePath.startsWith("rules/providers/") &&
        !fs.existsSync(path.join(baseDir, templatePath))
      ) {
        failures.push(`Missing provider rule template for ${providerId}: ${templatePath}`);
      }
    }
  }

  try {
    const samples = [
      [".claude/CLAUDE.md", renderClaudeProjectMd()],
      [".cursor/rules/ai-engineering-harness.mdc", renderCursorActivationMdc()],
      [".cursor/rules/ai-engineering-harness-commands.mdc", renderCursorCommandsMdc()],
      ["AGENTS.md", renderCodexAgentsMd()],
      [".gemini/extensions/ai-engineering-harness/GEMINI.md", renderGeminiMd()],
    ];
    for (const [relativePath, content] of samples) {
      assertProviderRuleContent(relativePath, content, failures);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    failures.push(`Provider rule renderer failed: ${message}`);
  }
}

export {
  CORE_FRAGMENTS,
  PROVIDER_RULE_ADAPTERS,
  WORKFLOW_COMMAND_IDS,
  assertProviderRuleContent,
  assertRepositoryProviderRules,
  expandCoreMarkers,
  listProviderRuleOutputs,
  providerRuleAdapter,
  readCoreFragment,
  renderClaudeCommandFile,
  renderClaudeProjectMd,
  renderCodexAgentsMd,
  renderCursorActivationMdc,
  renderCursorCommandsMdc,
  renderCursorGuardrailsMdc,
  renderGeminiMd,
  renderGenericAgentsMd,
  renderProviderRuleFile,
};
export type { CoreFragmentName, ProviderRuleAdapter, ClaudeCommandSpec, RuleRenderOptions };
