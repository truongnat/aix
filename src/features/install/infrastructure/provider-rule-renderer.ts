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
}

interface ClaudeCommandSpec {
  id?: string;
  canonical: string;
  title: string;
  sourceCommand?: string;
}

// Adjust for dist/ build layout: compiled files are at dist/features/install/infrastructure/, so go up 4 levels to reach repo root
const REPO_ROOT = path.resolve(__dirname, "../../../..");
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
  },
  codex: {
    provider: "Codex",
    ruleMode: "agents-md",
    ruleEntrypoints: ["AGENTS.md", ".codex/", ".agents/skills/"],
    nativeSlashCommands: false,
    nativeInvocationExample: null,
    supportsSubagents: false,
    fallbackInstruction: "Use harness-plan for this repository.",
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
  },
  generic: {
    provider: "Generic AGENTS.md",
    ruleMode: "agents-md",
    ruleEntrypoints: ["AGENTS.md"],
    nativeSlashCommands: false,
    nativeInvocationExample: null,
    supportsSubagents: false,
    fallbackInstruction: "Use harness-plan for this repository.",
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

// --- Provider rule docs: copy core fragments to provider locations ----------
// The common rule set lives in rules/core/*.md (the harness system).
// Each provider doc = a short header + core fragments copied in.
// No complex generation — just concatenate and write to the right path.

const SYSTEM_PROMPT_REF =
  "Read `agent-system/SYSTEM_PROMPT.md` before using the harness.";

const CURSOR_FRONTMATTER = [
  "---",
  "description: ai-engineering-harness core operating discipline",
  "alwaysApply: true",
  "---",
].join("\n");

function renderAllCoreFragments(names?: readonly CoreFragmentName[]): string {
  return (names ?? CORE_FRAGMENTS).map((name) => readCoreFragment(name)).join("\n\n");
}

function renderClaudeProjectMd(): string {
  return [
    "# ai-engineering-harness (Claude Code)",
    "",
    SYSTEM_PROMPT_REF,
    "Routing: use `.claude/commands/` for native project commands.",
    "",
    renderAllCoreFragments(),
    "",
  ].join("\n");
}

function renderCursorActivationMdc(): string {
  return [
    CURSOR_FRONTMATTER,
    "# ai-engineering-harness",
    "",
    SYSTEM_PROMPT_REF,
    "Routing: use `.cursor/commands/` for native project commands. Use `.ai-harness/runtime-commands/` as the local catalog mirror.",
    "",
    renderAllCoreFragments(),
    "",
  ].join("\n");
}

function renderCursorCommandsMdc(): string {
  return [
    CURSOR_FRONTMATTER,
    "# ai-engineering-harness commands",
    "",
    SYSTEM_PROMPT_REF,
    "Use `.cursor/commands/` for native project commands.",
    "",
    renderAllCoreFragments(["command-naming", "phase-guards", "blocking"]),
    "",
  ].join("\n");
}

function renderCursorGuardrailsMdc(): string {
  return [
    CURSOR_FRONTMATTER,
    "# ai-engineering-harness guardrails",
    "",
    SYSTEM_PROMPT_REF,
    "",
    renderAllCoreFragments(["blocking", "phase-guards"]),
    "",
  ].join("\n");
}

function renderCodexAgentsMd(): string {
  return [
    "# ai-engineering-harness (Codex) — AGENTS.md",
    "",
    SYSTEM_PROMPT_REF,
    "`/harness-*` commands are routed via `.codex/commands/` hooks.",
    "",
    renderAllCoreFragments(),
    "",
  ].join("\n");
}

function renderGeminiMd(): string {
  return [
    "# ai-engineering-harness (Gemini)",
    "",
    SYSTEM_PROMPT_REF,
    "Do **not** claim native `/harness-*` slash commands. Route via the local catalog.",
    "",
    renderAllCoreFragments(),
    "",
  ].join("\n");
}

function renderGenericAgentsMd(): string {
  return [
    "# ai-engineering-harness generic agent instructions",
    "",
    SYSTEM_PROMPT_REF,
    "Route commands through `.ai-harness/runtime-commands/`.",
    "",
    renderAllCoreFragments(),
    "",
  ].join("\n");
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

  // Provider rule docs are now built in code from the common core (no static
  // rules/providers/ rule templates). Only the Claude command template remains.
  const commandTemplatePath = "rules/providers/claude/command.md";
  if (!fs.existsSync(path.join(baseDir, commandTemplatePath))) {
    failures.push(`Missing claude command template: ${commandTemplatePath}`);
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
  readCoreFragment,
  renderClaudeCommandFile,
  renderClaudeProjectMd,
  renderCodexAgentsMd,
  renderCursorActivationMdc,
  renderCursorCommandsMdc,
  renderCursorGuardrailsMdc,
  renderGeminiMd,
  renderGenericAgentsMd,
};
export type { CoreFragmentName, ProviderRuleAdapter, ClaudeCommandSpec };
