import fs from "node:fs";
import path from "node:path";
import { renderClaudeCommandFile } from "../provider-rule-renderer";
import {
  COMMAND_NAMESPACE,
  CACHE_DIR,
  RUNTIME_COMMANDS_DIR,
  WORKFLOW_COMMANDS,
  CANONICAL_COMMANDS,
  PROVIDER_COMMAND_SUPPORT,
  providerCommandSupport,
} from "./provider-command-metadata";

interface InstalledProviderSurface {
  installed?: boolean;
  installedPathsOnDisk?: string[];
}

interface CommandSurfaceProvider {
  mode: string;
  nativeCommandSupport: boolean;
  nativeCommands: boolean;
  nativeSlashCommands: boolean;
  fallbackActivation: boolean;
  pluginManifest: string | null;
  packagingPath: string | null;
  installMethod: string | null;
  installedPaths: string[];
  workflowInvocation: string | null;
  pluginSkillNamespace: string | null;
  fallbackInstruction: string;
  invocations: Record<string, string | null>;
  installed?: boolean;
  installedPathsOnDisk?: string[];
}

interface WorkflowCommandSpec {
  id: string;
  canonical: string;
  title: string;
  description: string;
  sourceCommand: string;
}

interface CommandSurface {
  canonicalNamespace: string;
  localCatalog: string;
  canonicalCommands: string[];
  providers: Record<string, CommandSurfaceProvider>;
}

interface InstalledCommandSurface {
  installedProviders: string[];
}

function buildCommandSurface(
  installedProviderEntrypoints: Record<string, string[]> = {}
): CommandSurface {
  const providers: Record<string, CommandSurfaceProvider> = {};
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

function readInstalledCommandSurface(
  targetRoot: string
): (InstalledCommandSurface & Record<string, unknown>) | null {
  const manifestPath = path.join(targetRoot, `${CACHE_DIR}/manifest.json`);
  if (!fs.existsSync(manifestPath)) {
    return null;
  }
  try {
    const manifest: {
      commandSurface?: Record<string, unknown>;
      providerCommandEntrypoints?: Record<string, unknown>;
    } = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    const surface = manifest.commandSurface || {};
    const installedProviders = Object.keys(manifest.providerCommandEntrypoints || {});
    return { ...surface, installedProviders };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(`Warning: Failed to parse manifest at ${manifestPath}: ${message}`);
    return null;
  }
}

function formatCommandSupportForPlan(providerIds: string[]): string {
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

function activationMarkdown(): string {
  return `# ai-engineering-harness — project activation

This repository uses a **project-local** harness install. Canonical command IDs (\`harness-plan\`, \`harness-verify\`, …) apply **only to this repo** via the local catalog below.

## Before any harness command

1. Read \`.ai-harness/manifest.json\` (see \`commandSurface\` for provider-specific support).
2. Read this file (\`.ai-harness/activation.md\`).
3. Read \`.ai-harness/provider-interaction.md\` before deliberative discuss or scored user choices — **invoke the listed provider tool**, not markdown-only menus.
4. Use only \`.ai-harness/commands/\`, \`.ai-harness/skills/\`, \`.ai-harness/workflows/\`, and \`.ai-harness/patterns/\` under **this** repository.
5. Use only \`.harness/\` for project-specific state (goals, memory, gates).
6. **Do not** use global skills, sibling-repo harness files, or source-pack paths unless the user explicitly asks.

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

function renderRuntimeCommandFile(spec: WorkflowCommandSpec): string {
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

function renderClaudeCommandFileFromSpec(spec: WorkflowCommandSpec): string {
  return renderClaudeCommandFile(spec);
}

function renderAgentsCommandAliasesSection(): string {
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

interface Manifest {
  package: string;
  commandNamespace: string;
  commandsInstalled: boolean;
  canonicalCommands: string[];
  runtimeCommandsDir: string;
  commandSurface: unknown;
  providerCommandEntrypoints: Record<string, string[]>;
}

function buildManifest(providerEntrypoints: Record<string, string[]> = {}): Manifest {
  return {
    package: "ai-engineering-harness",
    commandNamespace: COMMAND_NAMESPACE,
    commandsInstalled: true,
    canonicalCommands: [...CANONICAL_COMMANDS],
    runtimeCommandsDir: RUNTIME_COMMANDS_DIR,
    commandSurface: buildCommandSurface(providerEntrypoints) as unknown,
    providerCommandEntrypoints: providerEntrypoints,
  };
}

export {
  buildCommandSurface,
  readInstalledCommandSurface,
  formatCommandSupportForPlan,
  activationMarkdown,
  renderRuntimeCommandFile,
  renderClaudeCommandFileFromSpec,
  renderAgentsCommandAliasesSection,
  buildManifest,
};
export type {
  InstalledProviderSurface,
  CommandSurfaceProvider,
  WorkflowCommandSpec,
  CommandSurface,
  InstalledCommandSurface,
  Manifest,
};
