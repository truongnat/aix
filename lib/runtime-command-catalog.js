"use strict";

/**
 * Runtime Command Catalog — Manages harness command installation & metadata
 *
 * STRUCTURE:
 * - Constants & Metadata (lines 13-208): PROVIDER_COMMAND_SUPPORT, WORKFLOW_COMMANDS
 * - Provider Queries (lines 210-232): providerCommandSupport, providerInvocationFor
 * - Command Surface Building (lines 236-287): buildCommandSurface, readInstalledCommandSurface
 * - Rendering Functions (lines 318-427): activationMarkdown, renderRuntimeCommandFile, etc.
 * - Installation Functions (lines 440-716): installRuntimeCommandCatalog, installProviderNativeCommands, etc.
 * - Utilities (lines 716-747): runtimeCommandCatalogPathsForPlan, fileReferencesActivation
 *
 * TODO for v1.1.0: Split into 3 modules:
 * - lib/provider-command-metadata.js (constants + queries)
 * - lib/command-rendering.js (rendering functions)
 * - lib/command-installation.js (installation functions)
 * This module maintains backward compatibility via re-exports.
 */

const fs = require("node:fs");
const path = require("node:path");
const {
  PROVIDER_RULE_ADAPTERS,
  renderClaudeCommandFile,
  renderCursorActivationMdc,
  renderCursorCommandsMdc,
  renderCursorGuardrailsMdc,
} = require("./provider-rule-renderer.js");

// ============================================================================
// SECTION 1: Constants & Metadata
// ============================================================================

const COMMAND_NAMESPACE = "harness";
const CACHE_DIR = ".ai-harness";
const RUNTIME_COMMANDS_DIR = `${CACHE_DIR}/runtime-commands`;
const PROMPT_TEMPLATES_DIR = `${CACHE_DIR}/prompt-templates`;

/** @typedef {'native-verified'|'native-unverified'|'native-plugin'|'native-command-files'|'plugin-ready'|'plugin-packaging'|'fallback-only'|'planned'|'unsupported'} ProviderCommandStatus */

/**
 * Provider command capability matrix (honest; do not claim native slash unless verified).
 * @type {Record<string, {
 *   provider: string,
 *   status: ProviderCommandStatus,
 *   nativeCommandSupport: boolean,
 *   installedPaths: string[],
 *   workflowInvocation: string | null,
 *   pluginSkillNamespace: string | null,
 *   fallbackInstruction: string,
 *   notes: string,
 *   invocations?: Record<string, string | null>
 * }>}
 */
const PACK_PLUGIN_PATHS = Object.freeze({
  cursor: ".cursor-plugin/plugin.json",
  claude: ".claude-plugin/plugin.json",
  codex: ".codex-plugin/plugin.json",
  gemini: "gemini-extension.json",
});

const PROVIDER_COMMAND_SUPPORT = Object.freeze({
  claude: {
    provider: "Claude Code",
    status: "native-plugin",
    nativeCommandSupport: true,
    nativeCommands: true,
    fallbackActivation: true,
    packagingPath: ".claude-plugin/plugin.json",
    installMethod:
      "/plugin install ai-engineering-harness (marketplace) or project .claude/commands/harness-<id>.md",
    installedPaths: [".claude/commands/", ".claude-plugin/ (npm package root)"],
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
    status: "plugin-ready",
    nativeCommandSupport: false,
    nativeCommands: false,
    fallbackActivation: true,
    packagingPath: ".cursor-plugin/plugin.json",
    installMethod:
      "/add-plugin ai-engineering-harness (marketplace pending) or npx project install + rules",
    installedPaths: [
      ".cursor-plugin/plugin.json (package)",
      ".cursor/rules/ai-engineering-harness.mdc",
      ".cursor/rules/ai-engineering-harness-commands.mdc",
      ".cursor/rules/ai-engineering-harness-guardrails.mdc",
    ],
    workflowInvocation: null,
    pluginSkillNamespace: null,
    fallbackInstruction:
      "Install plugin: /add-plugin ai-engineering-harness when published. Project npx install: .cursor/rules activate .ai-harness/ (fallback).",
    notes:
      "Native commands come from Cursor plugin manifest commands field — not project .cursor/commands/.",
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
    fallbackInstruction:
      "Native: open Codex /plugins, install ai-engineering-harness plugin (marketplace pending). Use plugin skills. Project npx install: AGENTS.md + .ai-harness/ fallback only — no /harness-* slash.",
    notes:
      "Codex is not a project-local slash-command provider. Package ships .codex-plugin/plugin.json + skills/ per openai/plugins layout.",
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
    notes:
      "Generic bootstrap — not Codex plugin UI. For Codex native skills use codex provider + /plugins.",
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
    fallbackInstruction:
      'gemini extensions install https://github.com/truongnat/ai-engineering-harness — context via GEMINI.md; ask "use harness-plan".',
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

/** @type {readonly { id: string, canonical: string, title: string, sourceCommand: string, description: string }[]} */
const WORKFLOW_COMMANDS = Object.freeze([
  {
    id: "start",
    canonical: "harness-start",
    title: "Harness Start",
    sourceCommand: "commands/harness-start.md",
    description: "Start or resume work on the active goal in this repository.",
  },
  {
    id: "map",
    canonical: "harness-map",
    title: "Harness Map",
    sourceCommand: "commands/harness-map.md",
    description: "Map affected codebase areas for the current goal.",
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

// ============================================================================
// SECTION 2: Provider Query Functions
// ============================================================================

function providerCommandSupport(providerId) {
  const base = PROVIDER_COMMAND_SUPPORT[providerId] || PROVIDER_COMMAND_SUPPORT.generic;
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

// ============================================================================
// SECTION 3: Command Surface Building
// ============================================================================

function buildCommandSurface(installedProviderEntrypoints = {}) {
  /** @type {Record<string, object>} */
  const providers = {};
  for (const [id, spec] of Object.entries(PROVIDER_COMMAND_SUPPORT)) {
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
    canonicalNamespace: COMMAND_NAMESPACE,
    localCatalog: RUNTIME_COMMANDS_DIR,
    canonicalCommands: [...CANONICAL_COMMANDS],
    providers,
  };
}

function readInstalledCommandSurface(targetRoot) {
  const manifestPath = path.join(targetRoot, `${CACHE_DIR}/manifest.json`);
  if (!fs.existsSync(manifestPath)) {
    return null;
  }
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    const surface = manifest.commandSurface || {};
    const installedProviders = Object.keys(manifest.providerCommandEntrypoints || {});
    return { ...surface, installedProviders };
  } catch (err) {
    console.warn(`Warning: Failed to parse manifest at ${manifestPath}: ${err.message}`);
    return null;
  }
}

function formatCommandSupportForPlan(providerIds) {
  const lines = [
    "Commands:",
    "  Local catalog (always):",
    `    ${RUNTIME_COMMANDS_DIR}/`,
    `    ${CACHE_DIR}/activation.md`,
    "",
  ];
  for (const providerId of providerIds) {
    const spec = providerCommandSupport(providerId);
    lines.push(`  ${spec.provider}:`);
    lines.push(`    mode: ${spec.status}`);
    if (providerId === "codex") {
      lines.push("    native /harness-* slash: not claimed");
      lines.push(
        "    Codex plugin: .codex-plugin/plugin.json + skills/ (install via /plugins when published)"
      );
      lines.push("    project install: AGENTS.md + .ai-harness/ fallback only");
    }
    lines.push(`    use: ${spec.fallbackInstruction}`);
    if (spec.installedPaths.length) {
      lines.push(`    files: ${spec.installedPaths.join(", ")}`);
    }
    lines.push("");
  }
  lines.push(
    "Canonical command names (local):",
    ...CANONICAL_COMMANDS.slice(0, 6).map((c) => `  ${c}`),
    "  …"
  );
  return lines.join("\n");
}

// ============================================================================
// SECTION 4: Rendering Functions
// ============================================================================

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

Command namespace: \`${COMMAND_NAMESPACE}\` (canonical IDs: \`harness-plan\`, \`harness-verify\`, …). Native slash where supported: \`/harness-plan\`, etc.
`;
}

function renderRuntimeCommandFile(spec) {
  const sourcePath = `.ai-harness/${spec.sourceCommand}`;
  const promptTemplatePath =
    spec.id === "plan" || spec.id === "run" || spec.id === "verify" || spec.id === "ship"
      ? `.ai-harness/prompt-templates/harness-${spec.id}.md`
      : null;
  const behaviorHint =
    spec.id === "discuss"
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
  return renderClaudeCommandFile(spec);
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
  for (const spec of WORKFLOW_COMMANDS) {
    lines.push(
      `| ${spec.canonical} | \`.ai-harness/runtime-commands/harness-${spec.id}.md\` → \`.ai-harness/${spec.sourceCommand}\` |`
    );
  }
  return `${lines.join("\n")}\n`;
}

function buildManifest(providerEntrypoints = {}) {
  return {
    package: "ai-engineering-harness",
    commandNamespace: COMMAND_NAMESPACE,
    commandsInstalled: true,
    canonicalCommands: [...CANONICAL_COMMANDS],
    runtimeCommandsDir: RUNTIME_COMMANDS_DIR,
    commandSurface: buildCommandSurface(providerEntrypoints),
    providerCommandEntrypoints: providerEntrypoints,
  };
}

// ============================================================================
// SECTION 5: Installation Functions
// ============================================================================

function writeFile(targetRoot, relativePath, content, options) {
  const dest = path.join(targetRoot, relativePath);
  const exists = fs.existsSync(dest);
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
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, content, "utf8");
  }
  return { action, relativePath };
}

function installPromptTemplates(targetRoot, options = {}) {
  const opts = { dryRun: false, force: false, ...options };
  const repoRoot = path.resolve(__dirname, "..");
  const sourceDir = path.join(repoRoot, "prompt-templates");
  const results = [];

  if (!fs.existsSync(sourceDir)) {
    return results;
  }

  for (const fileName of fs.readdirSync(sourceDir)) {
    const sourcePath = path.join(sourceDir, fileName);
    if (!fs.statSync(sourcePath).isFile()) {
      continue;
    }
    results.push(
      writeFile(
        targetRoot,
        `${PROMPT_TEMPLATES_DIR}/${fileName}`,
        fs.readFileSync(sourcePath, "utf8"),
        opts
      )
    );
  }

  return results;
}

function installRuntimeCommandCatalog(targetRoot, options = {}) {
  const opts = { dryRun: false, force: false, ...options };
  const results = [];

  results.push(...installPromptTemplates(targetRoot, opts));
  results.push(writeFile(targetRoot, `${CACHE_DIR}/activation.md`, activationMarkdown(), opts));
  for (const spec of WORKFLOW_COMMANDS) {
    results.push(
      writeFile(
        targetRoot,
        `${RUNTIME_COMMANDS_DIR}/harness-${spec.id}.md`,
        renderRuntimeCommandFile(spec),
        opts
      )
    );
  }

  const manifestPath = `${CACHE_DIR}/manifest.json`;
  let existingProviders = {};
  const manifestDest = path.join(targetRoot, manifestPath);
  if (fs.existsSync(manifestDest)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(manifestDest, "utf8"));
      if (
        parsed.providerCommandEntrypoints &&
        typeof parsed.providerCommandEntrypoints === "object"
      ) {
        existingProviders = parsed.providerCommandEntrypoints;
      }
    } catch (err) {
      console.warn(
        `Warning: Invalid manifest at ${manifestDest}, will be replaced: ${err.message}`
      );
    }
  }
  const manifest = buildManifest(existingProviders);
  results.push(
    writeFile(targetRoot, manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, {
      ...opts,
      force: true,
    })
  );

  return results;
}

function mergeManifestProviders(targetRoot, runtime, paths, options = {}) {
  const cacheDir = path.join(targetRoot, CACHE_DIR);
  if (!fs.existsSync(cacheDir)) {
    return { action: "SKIP", relativePath: `${CACHE_DIR}/manifest.json` };
  }
  const manifestPath = path.join(targetRoot, `${CACHE_DIR}/manifest.json`);
  let manifest = buildManifest();
  if (fs.existsSync(manifestPath)) {
    try {
      manifest = { ...buildManifest(), ...JSON.parse(fs.readFileSync(manifestPath, "utf8")) };
    } catch {
      /* reset */
    }
  }
  manifest.providerCommandEntrypoints = manifest.providerCommandEntrypoints || {};
  manifest.providerCommandEntrypoints[runtime] = paths;
  manifest.commandSurface = buildCommandSurface(manifest.providerCommandEntrypoints);
  return writeFile(
    targetRoot,
    `${CACHE_DIR}/manifest.json`,
    `${JSON.stringify(manifest, null, 2)}\n`,
    {
      ...options,
      force: true,
    }
  );
}

function providerCommandPathsForRuntime(runtime, scope) {
  if (scope !== "project") {
    return [];
  }
  return [...(providerCommandSupport(runtime).installedPaths || [])];
}

function installClaudeNativeCommands(targetRoot, packRoot, options) {
  const results = [];
  for (const spec of WORKFLOW_COMMANDS) {
    results.push(
      writeFile(
        targetRoot,
        `.claude/commands/harness-${spec.id}.md`,
        renderClaudeCommandFileFromSpec(spec),
        options
      )
    );
  }
  results.push(
    mergeManifestProviders(
      targetRoot,
      "claude",
      providerCommandPathsForRuntime("claude", "project"),
      options
    )
  );
  return results;
}

function installCursorHarnessFallback(targetRoot, options) {
  const results = [
    writeFile(
      targetRoot,
      ".cursor/rules/ai-engineering-harness.mdc",
      renderCursorActivationMdc(),
      options
    ),
    writeFile(
      targetRoot,
      ".cursor/rules/ai-engineering-harness-commands.mdc",
      renderCursorCommandsMdc(),
      options
    ),
    writeFile(
      targetRoot,
      ".cursor/rules/ai-engineering-harness-guardrails.mdc",
      renderCursorGuardrailsMdc(),
      options
    ),
  ];
  results.push(
    mergeManifestProviders(
      targetRoot,
      "cursor",
      providerCommandPathsForRuntime("cursor", "project"),
      options
    )
  );
  return results;
}

function appendAgentsCommandAliases(agentsPath, options) {
  const marker = "## Harness commands (project-scoped, fallback aliases)";
  const legacyMarker = "## Harness slash commands (project-scoped)";
  const harnessMarker = "ai-engineering-harness";
  let content = fs.existsSync(agentsPath) ? fs.readFileSync(agentsPath, "utf8") : "";
  if (content.includes(".ai-harness/runtime-commands/") && content.includes("harness-plan")) {
    return {
      action: options.dryRun ? "WOULD SKIP" : "SKIP",
      relativePath: path.basename(agentsPath),
      reason: "provider-adapter-agents-complete",
    };
  }
  if (
    content &&
    !content.includes(harnessMarker) &&
    !content.includes(marker) &&
    !content.includes(legacyMarker)
  ) {
    return {
      action: options.dryRun ? "WOULD SKIP" : "SKIP",
      relativePath: path.basename(agentsPath),
      reason: "no-harness-marker",
    };
  }
  if (content.includes(marker) || content.includes(legacyMarker)) {
    const splitMarker = content.includes(marker) ? marker : legacyMarker;
    const before = content.split(splitMarker)[0].trimEnd();
    content = `${before}\n${renderAgentsCommandAliasesSection()}`;
  } else if (
    fs.existsSync(agentsPath) &&
    !content.includes("ai-engineering-harness") &&
    !options.force
  ) {
    return { action: "SKIP", relativePath: path.basename(agentsPath) };
  } else {
    content = `${content.trimEnd()}\n${renderAgentsCommandAliasesSection()}`;
  }
  if (!options.dryRun) {
    fs.mkdirSync(path.dirname(agentsPath), { recursive: true });
    fs.writeFileSync(agentsPath, content, "utf8");
  }
  return {
    action: options.dryRun ? "WOULD UPDATE" : "UPDATE",
    relativePath: path.basename(agentsPath),
  };
}

function installGeminiHarnessFallback(targetRoot, options) {
  const extRoot = path.join(targetRoot, ".gemini/extensions/ai-engineering-harness");
  const results = [];
  const geminiMd = path.join(extRoot, "GEMINI.md");
  if (fs.existsSync(geminiMd)) {
    let body = fs.readFileSync(geminiMd, "utf8");
    const marker = "## Harness commands";
    if (!body.includes(marker)) {
      body = `${body.trimEnd()}\n\n## Harness commands\n\nRead \`.ai-harness/activation.md\` first. Use **gemini extensions install** from pack \`gemini-extension.json\` or project extension dir. Ask: **use harness-plan** — no slash claim.\n`;
      results.push(
        writeFile(targetRoot, ".gemini/extensions/ai-engineering-harness/GEMINI.md", body, {
          ...options,
          force: true,
        })
      );
    }
  }
  results.push(
    mergeManifestProviders(
      targetRoot,
      "gemini",
      providerCommandPathsForRuntime("gemini", "project"),
      options
    )
  );
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
      const agentsPath = path.join(targetRoot, "AGENTS.md");
      const results = [];
      if (fs.existsSync(agentsPath) || !options.dryRun) {
        results.push(appendAgentsCommandAliases(agentsPath, options));
      }
      results.push(
        mergeManifestProviders(
          targetRoot,
          runtime,
          providerCommandPathsForRuntime(runtime, "project"),
          options
        )
      );
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

// ============================================================================
// SECTION 6: Utility Functions
// ============================================================================

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
      } else if (rel.endsWith("/")) {
        paths.push(rel);
      } else {
        paths.push(rel);
      }
    }
  }
  return [...new Set(paths)];
}

function fileReferencesActivation(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8").includes(".ai-harness/activation.md");
  } catch {
    return false;
  }
}

module.exports = {
  COMMAND_NAMESPACE,
  WORKFLOW_COMMANDS,
  CLI_DIAGNOSTIC_COMMANDS,
  CANONICAL_COMMANDS,
  SLASH_COMMANDS,
  PROVIDER_COMMAND_SUPPORT,
  PROVIDER_RULE_ADAPTERS,
  PACK_PLUGIN_PATHS,
  RUNTIME_COMMANDS_DIR,
  PROMPT_TEMPLATES_DIR,
  activationMarkdown,
  renderAgentsCommandAliasesSection,
  renderRuntimeCommandFile,
  installRuntimeCommandCatalog,
  installProviderCommandSurface,
  installProviderNativeCommands,
  installProviderFallbackCommands,
  providerCommandSupport,
  providerInvocationFor,
  providerCommandPathsForRuntime,
  formatCommandSupportForPlan,
  formatProviderUseLine,
  buildCommandSurface,
  readInstalledCommandSurface,
  runtimeCommandCatalogPathsForPlan,
  fileReferencesActivation,
  buildManifest,
};
