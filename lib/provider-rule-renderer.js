"use strict";

const fs = require("node:fs");
const path = require("node:path");

const REPO_ROOT = path.resolve(__dirname, "..");
const RULES_CORE_DIR = path.join(REPO_ROOT, "rules", "core");
const RULES_PROVIDERS_DIR = path.join(REPO_ROOT, "rules", "providers");

const CORE_FRAGMENTS = Object.freeze([
  "command-naming",
  "phase-guards",
  "blocking",
  "session-memory",
  "tool-routing"
]);

const WORKFLOW_COMMAND_IDS = Object.freeze([
  "map",
  "start",
  "discuss",
  "plan",
  "run",
  "verify",
  "ship",
  "remember"
]);

const PROVIDER_RULE_ADAPTERS = Object.freeze({
  claude: {
    provider: "Claude Code",
    ruleMode: "claude-project",
    ruleEntrypoints: [
      ".claude/CLAUDE.md",
      ".claude/commands/harness-*.md",
      ".claude/agents/harness-*.md"
    ],
    nativeSlashCommands: true,
    nativeInvocationExample: "/harness-plan",
    supportsSubagents: true,
    fallbackInstruction: "Read .claude/CLAUDE.md and use /harness-plan when project commands are installed.",
    notes: "Only provider with verified project-native /harness-* command files in v1."
  },
  cursor: {
    provider: "Cursor",
    ruleMode: "cursor-rules",
    ruleEntrypoints: [
      ".cursor/rules/ai-engineering-harness.mdc",
      ".cursor/rules/ai-engineering-harness-commands.mdc",
      ".cursor/rules/ai-engineering-harness-guardrails.mdc"
    ],
    nativeSlashCommands: false,
    nativeInvocationExample: null,
    supportsSubagents: false,
    fallbackInstruction: "Use harness-plan for this repository.",
    notes: "Route through .cursor/rules and .ai-harness/runtime-commands/. Do not claim native slash."
  },
  codex: {
    provider: "Codex",
    ruleMode: "agents-md",
    ruleEntrypoints: ["AGENTS.md"],
    nativeSlashCommands: false,
    nativeInvocationExample: null,
    supportsSubagents: false,
    fallbackInstruction: "Use harness-plan for this repository.",
    notes: "AGENTS.md fallback plus .ai-harness/ catalog. No /harness-* slash claim."
  },
  gemini: {
    provider: "Gemini",
    ruleMode: "gemini-extension",
    ruleEntrypoints: [
      ".gemini/extensions/ai-engineering-harness/GEMINI.md",
      ".gemini/extensions/ai-engineering-harness/gemini-extension.json"
    ],
    nativeSlashCommands: false,
    nativeInvocationExample: null,
    supportsSubagents: false,
    fallbackInstruction: "Use harness-plan for this repository.",
    notes: "Extension context plus local catalog. No /harness-* slash claim."
  },
  generic: {
    provider: "Generic AGENTS.md",
    ruleMode: "agents-md",
    ruleEntrypoints: ["AGENTS.md"],
    nativeSlashCommands: false,
    nativeInvocationExample: null,
    supportsSubagents: false,
    fallbackInstruction: "Use harness-plan for this repository.",
    notes: "Plain AGENTS.md fallback when provider is unknown."
  }
});

function readCoreFragment(name) {
  const filePath = path.join(RULES_CORE_DIR, `${name}.md`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing core rule fragment: rules/core/${name}.md`);
  }
  return fs.readFileSync(filePath, "utf8").trim();
}

function readProviderTemplate(providerId, fileName) {
  const filePath = path.join(RULES_PROVIDERS_DIR, providerId, fileName);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing provider rule template: rules/providers/${providerId}/${fileName}`);
  }
  return fs.readFileSync(filePath, "utf8");
}

function expandCoreMarkers(template, fragmentNames) {
  const names =
    fragmentNames === "all"
      ? CORE_FRAGMENTS
      : Array.isArray(fragmentNames)
        ? fragmentNames
        : CORE_FRAGMENTS;

  let output = template.replace(/<!--\s*@core(?::([\w,-]+))?\s*-->/g, (_match, list) => {
    const selected = list
      ? list.split(",").map((item) => item.trim()).filter(Boolean)
      : names;
    return selected.map((name) => readCoreFragment(name)).join("\n\n");
  });

  if (output.includes("<!-- @core")) {
    throw new Error("Unresolved core marker in provider template");
  }

  return output.trimEnd();
}

function renderProviderRuleFile(providerId, fileName, options = {}) {
  const template = readProviderTemplate(providerId, fileName);
  return `${expandCoreMarkers(template, options.coreFragments)}\n`;
}

function renderClaudeProjectMd() {
  return renderProviderRuleFile("claude", "CLAUDE.md");
}

function renderCursorActivationMdc() {
  return renderProviderRuleFile("cursor", "ai-engineering-harness.mdc");
}

function renderCursorCommandsMdc() {
  return renderProviderRuleFile("cursor", "ai-engineering-harness-commands.mdc", {
    coreFragments: ["command-naming", "phase-guards", "blocking"]
  });
}

function renderCursorGuardrailsMdc() {
  return renderProviderRuleFile("cursor", "ai-engineering-harness-guardrails.mdc", {
    coreFragments: ["blocking", "phase-guards"]
  });
}

function renderCodexAgentsMd() {
  return renderProviderRuleFile("codex", "AGENTS.md");
}

function renderGeminiMd() {
  return renderProviderRuleFile("gemini", "GEMINI.md");
}

function renderGenericAgentsMd() {
  return renderProviderRuleFile("generic", "AGENTS.md");
}

function renderClaudeCommandFile(spec) {
  return `---
description: ${spec.title} — project-scoped (${spec.canonical})
---

# ${spec.canonical}

Read:

1. \`.ai-harness/activation.md\`
2. \`.ai-harness/agent-system/SYSTEM_PROMPT.md\`
3. \`.harness/STATE.md\`
4. Active session artifacts under \`.harness/sessions/\`
5. \`.ai-harness/prompt-templates/${spec.canonical}.md\` if present

Then follow the harness command contract at \`.ai-harness/commands/${spec.sourceCommand || `commands/${spec.canonical}.md`}\`.

Before executing this command, follow \`.ai-harness/agent-system/SYSTEM_PROMPT.md\`.

If required preconditions are missing, return \`Blocked\` and stop. DO NOT CONTINUE.

${readCoreFragment("blocking")}
`;
}

function providerRuleAdapter(providerId) {
  return PROVIDER_RULE_ADAPTERS[providerId] || PROVIDER_RULE_ADAPTERS.generic;
}

function listProviderRuleOutputs(providerId) {
  switch (providerId) {
    case "claude":
      return [
        { relativePath: ".claude/CLAUDE.md", render: renderClaudeProjectMd },
        ...WORKFLOW_COMMAND_IDS.map((id) => ({
          relativePath: `.claude/commands/harness-${id}.md`,
          render: (spec) => renderClaudeCommandFile(spec || { id, canonical: `harness-${id}`, title: `Harness ${id}`, sourceCommand: `commands/harness-${id}.md` })
        }))
      ];
    case "cursor":
      return [
        { relativePath: ".cursor/rules/ai-engineering-harness.mdc", render: renderCursorActivationMdc },
        { relativePath: ".cursor/rules/ai-engineering-harness-commands.mdc", render: renderCursorCommandsMdc },
        { relativePath: ".cursor/rules/ai-engineering-harness-guardrails.mdc", render: renderCursorGuardrailsMdc }
      ];
    case "codex":
    case "generic":
      return [{ relativePath: "AGENTS.md", render: providerId === "codex" ? renderCodexAgentsMd : renderGenericAgentsMd }];
    case "gemini":
      return [{ relativePath: ".gemini/extensions/ai-engineering-harness/GEMINI.md", render: renderGeminiMd }];
    default:
      return [];
  }
}

function hasForbiddenColonCommandIds(content) {
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
    return /\bharness:[a-z]/.test(line) || /\/harness:[a-z]/i.test(line) || /\bharness_[a-z]/.test(line);
  });
}

function assertProviderRuleContent(relativePath, content, failures) {
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
    if (!content.includes("Stop.") && !content.includes("Stop and ask") && !content.includes("STOP")) {
      failures.push(`${relativePath} must include shared blocking content from rules/core`);
    }
    if (!/agent-system\/SYSTEM_PROMPT\.md/.test(content)) {
      failures.push(`${relativePath} must reference .ai-harness/agent-system/SYSTEM_PROMPT.md`);
    }
  }

  if (relativePath.endsWith("ai-engineering-harness.mdc")) {
    if (!/does not provide native|does \*\*not\*\* provide native|Do not claim native|not have verified native/i.test(content)) {
      failures.push(`${relativePath} must explicitly deny native /harness-* slash claim for Cursor`);
    }
  }

  if (relativePath === "AGENTS.md" && content.includes("Codex")) {
    if (!/Do \*\*not\*\* assume native|Do not assume native/i.test(content)) {
      failures.push(`${relativePath} must deny native /harness-* slash claim for Codex`);
    }
  }

  if (relativePath.endsWith("GEMINI.md")) {
    if (!/Do \*\*not\*\* claim native|Do not claim native/i.test(content)) {
      failures.push(`${relativePath} must deny native /harness-* slash claim for Gemini`);
    }
  }
}

function assertRepositoryProviderRules(baseDir, failures) {
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
        continue;
      }
      const templatePath = entrypoint
        .replace(/^\.claude\/CLAUDE\.md$/, "rules/providers/claude/CLAUDE.md")
        .replace(/^\.cursor\/rules\//, "rules/providers/cursor/")
        .replace(/^AGENTS\.md$/, `rules/providers/${providerId === "codex" ? "codex" : "generic"}/AGENTS.md`)
        .replace(/^\.gemini\/extensions\/ai-engineering-harness\/GEMINI\.md$/, "rules/providers/gemini/GEMINI.md");

      if (templatePath.startsWith("rules/providers/") && !fs.existsSync(path.join(baseDir, templatePath))) {
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
      [".gemini/extensions/ai-engineering-harness/GEMINI.md", renderGeminiMd()]
    ];
    for (const [relativePath, content] of samples) {
      assertProviderRuleContent(relativePath, content, failures);
    }
  } catch (error) {
    failures.push(`Provider rule renderer failed: ${error.message}`);
  }
}

module.exports = {
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
  renderProviderRuleFile
};
