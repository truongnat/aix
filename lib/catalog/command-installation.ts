import fs from "node:fs";
import path from "node:path";
import {
  renderCursorActivationMdc,
  renderCursorCommandsMdc,
  renderCursorGuardrailsMdc,
} from "../provider-rule-renderer";
import {
  CACHE_DIR,
  RUNTIME_COMMANDS_DIR,
  PROMPT_TEMPLATES_DIR,
  WORKFLOW_COMMANDS,
  providerCommandPathsForRuntime,
} from "./provider-command-metadata";
import {
  activationMarkdown,
  renderRuntimeCommandFile,
  renderClaudeCommandFileFromSpec,
  renderAgentsCommandAliasesSection,
  buildManifest,
  buildCommandSurface,
  type Manifest,
} from "./command-rendering";
import { HARNESS_MARKER } from "../backend/constants";
import { renderProviderInteractionMarkdown } from "../provider-interaction-tools";

type SupportedRuntime = "claude" | "cursor" | "codex" | "generic" | "gemini";
type InstallScope = "project" | "global";

interface InstallOptions {
  dryRun?: boolean;
  force?: boolean;
}

interface WriteResult {
  action: string;
  relativePath: string;
  reason?: string;
}

function writeFile(
  targetRoot: string,
  relativePath: string,
  content: string,
  options: Required<InstallOptions>
): WriteResult {
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

function installPromptTemplates(targetRoot: string, options: InstallOptions = {}): WriteResult[] {
  const opts = { dryRun: false, force: false, ...options };
  const repoRoot = path.resolve(__dirname, "../..");
  const sourceDir = path.join(repoRoot, "prompt-templates");
  const results: WriteResult[] = [];

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

function installRuntimeCommandCatalog(
  targetRoot: string,
  options: InstallOptions = {}
): WriteResult[] {
  const opts = { dryRun: false, force: false, ...options };
  const results: WriteResult[] = [];

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
  let existingProviders: Record<string, string[]> = {};
  const manifestDest = path.join(targetRoot, manifestPath);
  if (fs.existsSync(manifestDest)) {
    try {
      const parsed: {
        providerCommandEntrypoints?: Record<string, string[]>;
      } = JSON.parse(fs.readFileSync(manifestDest, "utf8"));
      if (
        parsed.providerCommandEntrypoints &&
        typeof parsed.providerCommandEntrypoints === "object"
      ) {
        existingProviders = parsed.providerCommandEntrypoints;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn(`Warning: Invalid manifest at ${manifestDest}, will be replaced: ${message}`);
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

function mergeManifestProviders(
  targetRoot: string,
  runtime: string,
  paths: string[],
  options: InstallOptions = {}
): WriteResult {
  const opts = { dryRun: false, force: false, ...options };
  const cacheDir = path.join(targetRoot, CACHE_DIR);
  if (!fs.existsSync(cacheDir)) {
    return { action: "SKIP", relativePath: `${CACHE_DIR}/manifest.json` };
  }
  const manifestPath = path.join(targetRoot, `${CACHE_DIR}/manifest.json`);
  let manifest = buildManifest() as Manifest;
  if (fs.existsSync(manifestPath)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as Record<string, unknown>;
      if (parsed && typeof parsed === "object") {
        manifest = { ...buildManifest(), ...parsed };
      }
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
      ...opts,
      force: true,
    }
  );
}

function installClaudeNativeCommands(
  targetRoot: string,
  packRoot: string,
  options: Required<InstallOptions>
): WriteResult[] {
  void packRoot;
  const results: WriteResult[] = [];
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

function installCursorNativeCommands(
  targetRoot: string,
  options: Required<InstallOptions>
): WriteResult[] {
  const results: WriteResult[] = [];
  for (const spec of WORKFLOW_COMMANDS) {
    results.push(
      writeFile(
        targetRoot,
        `.cursor/commands/harness-${spec.id}.md`,
        renderRuntimeCommandFile(spec),
        options
      )
    );
  }
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

function installCursorHarnessFallback(
  targetRoot: string,
  options: Required<InstallOptions>
): WriteResult[] {
  const results: WriteResult[] = [
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

function appendAgentsCommandAliases(
  agentsPath: string,
  options: Required<InstallOptions>
): WriteResult {
  const marker = "## Harness commands (project-scoped, fallback aliases)";
  const legacyMarker = "## Harness slash commands (project-scoped)";
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
    !content.includes(HARNESS_MARKER) &&
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
  } else if (fs.existsSync(agentsPath) && !content.includes(HARNESS_MARKER) && !options.force) {
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

function installGeminiHarnessFallback(
  targetRoot: string,
  options: Required<InstallOptions>
): WriteResult[] {
  const extRoot = path.join(targetRoot, ".gemini/extensions/ai-engineering-harness");
  const results: WriteResult[] = [];
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

function installProviderNativeCommands(
  runtime: SupportedRuntime,
  scope: InstallScope,
  targetRoot: string,
  packRoot: string,
  options: Required<InstallOptions>
): WriteResult[] {
  if (scope !== "project") {
    return [];
  }
  if (runtime === "claude") {
    return installClaudeNativeCommands(targetRoot, packRoot, options);
  }
  if (runtime === "cursor") {
    return installCursorNativeCommands(targetRoot, options);
  }
  return [];
}

function installProviderFallbackCommands(
  runtime: SupportedRuntime,
  scope: InstallScope,
  targetRoot: string,
  packRoot: string,
  options: Required<InstallOptions>
): WriteResult[] {
  void packRoot;
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
      const results: WriteResult[] = [];
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

function installProviderCommandSurface(
  runtime: SupportedRuntime,
  scope: InstallScope,
  targetRoot: string,
  packRoot: string,
  options: Required<InstallOptions>
): WriteResult[] {
  const native = installProviderNativeCommands(runtime, scope, targetRoot, packRoot, options);
  const fallback = installProviderFallbackCommands(runtime, scope, targetRoot, packRoot, options);
  return [...native, ...fallback];
}

function fileReferencesActivation(filePath: string): boolean {
  try {
    return fs.readFileSync(filePath, "utf8").includes(".ai-harness/activation.md");
  } catch {
    return false;
  }
}

function installProviderInteraction(
  targetRoot: string,
  providers: string[],
  options: InstallOptions = {}
): WriteResult {
  const opts = { dryRun: false, force: true, ...options };
  const content = renderProviderInteractionMarkdown(providers);
  return writeFile(targetRoot, `${CACHE_DIR}/provider-interaction.md`, `${content.trim()}\n`, opts);
}

export {
  writeFile,
  installPromptTemplates,
  installRuntimeCommandCatalog,
  installProviderInteraction,
  mergeManifestProviders,
  installClaudeNativeCommands,
  installCursorNativeCommands,
  installCursorHarnessFallback,
  appendAgentsCommandAliases,
  installGeminiHarnessFallback,
  installProviderNativeCommands,
  installProviderFallbackCommands,
  installProviderCommandSurface,
  fileReferencesActivation,
};
export type { SupportedRuntime, InstallScope, InstallOptions, WriteResult };
