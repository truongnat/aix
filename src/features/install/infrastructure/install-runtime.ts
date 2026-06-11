// Purpose: Runtime-native provider surface installation
// Layer: infrastructure
// Depends on: domain, legacy lib bridges

/**
 * Runtime-native install for ai-engineering-harness (no root pack copy).
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { legacyFileOperations } from "./legacy-deps";
const { ensureDirectory, logAction } = legacyFileOperations;
import { legacyRuntimeCommandCatalog } from "./legacy-deps";
const { installProviderCommandSurface } = legacyRuntimeCommandCatalog;
import { legacyWorkerClaudeAdapter } from "./legacy-deps";
const { installClaudeWorkers } = legacyWorkerClaudeAdapter;
import { legacyCodexRuleGeneration } from "./legacy-deps";
const { renderCodexRuleSet } = legacyCodexRuleGeneration;
import { legacyProviderRuleRenderer } from "./legacy-deps";
const {
  renderClaudeProjectMd,
  renderCodexAgentsMd,
  renderCursorActivationMdc,
  renderCursorCommandsMdc,
  renderCursorGuardrailsMdc,
  renderGeminiMd,
} = legacyProviderRuleRenderer;
import { legacyCliProviders } from "./legacy-deps";
const { RUNTIME_NATIVE_PROVIDER_IDS } = legacyCliProviders;
import { legacyWorkerRegistry } from "./legacy-deps";
const { workers } = legacyWorkerRegistry;

const HARNESS_REPO = "truongnat/ai-engineering-harness";
const HARNESS_GIT_URL = `https://github.com/${HARNESS_REPO}`;

const ALL_RUNTIMES = RUNTIME_NATIVE_PROVIDER_IDS;

type RuntimeId = "cursor" | "claude" | "codex" | "gemini" | "generic" | "all";
type InstallScope = "global" | "project";

interface InstallRuntimeOptions {
  packRoot: string;
  runtime: RuntimeId;
  scope: InstallScope;
  target: string;
  dryRun: boolean;
  force: boolean;
}

interface ProviderCommandEntry {
  action: string;
  relativePath: string;
}

type JsonObject = Record<string, unknown>;

function packPath(packRoot: string, relativePath: string): string {
  return path.join(packRoot, "runtime", relativePath);
}

function writeFileAction(
  root: string,
  relativePath: string,
  content: string,
  options: InstallRuntimeOptions
): void {
  const dest = path.join(root, relativePath);
  const exists = fs.existsSync(dest);

  if (exists && !options.force) {
    logAction(options.dryRun ? "WOULD SKIP" : "SKIP", relativePath);
    return;
  }

  if (exists && options.force) {
    logAction(options.dryRun ? "WOULD OVERWRITE" : "OVERWRITE", relativePath);
  } else {
    logAction(options.dryRun ? "WOULD CREATE" : "CREATE", relativePath);
  }

  if (!options.dryRun) {
    ensureDirectory(path.dirname(dest), false);
    fs.writeFileSync(dest, content, "utf8");
  }
}

function deepMerge(target: JsonObject, source: JsonObject): JsonObject {
  const out: JsonObject = { ...target };
  for (const [key, value] of Object.entries(source)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const current =
        out[key] && typeof out[key] === "object" && !Array.isArray(out[key])
          ? (out[key] as JsonObject)
          : {};
      out[key] = deepMerge(current, value as JsonObject);
    } else {
      out[key] = value;
    }
  }
  return out;
}

function mergeJsonFile(
  destRoot: string,
  relativePath: string,
  fragment: JsonObject,
  options: InstallRuntimeOptions
): void {
  const dest = path.join(destRoot, relativePath);
  const exists = fs.existsSync(dest);
  let current: JsonObject = {};

  if (exists) {
    try {
      current = JSON.parse(fs.readFileSync(dest, "utf8")) as JsonObject;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Invalid JSON in ${relativePath}: ${message}`);
    }
  }

  const merged = deepMerge(current, fragment);

  if (JSON.stringify(current) === JSON.stringify(merged)) {
    logAction(options.dryRun ? "WOULD SKIP" : "SKIP", relativePath);
    return;
  }

  if (exists && options.force) {
    logAction(options.dryRun ? "WOULD OVERWRITE" : "OVERWRITE", relativePath);
  } else if (exists) {
    logAction(options.dryRun ? "WOULD UPDATE" : "UPDATE", relativePath);
  } else {
    logAction(options.dryRun ? "WOULD CREATE" : "CREATE", relativePath);
  }

  if (!options.dryRun) {
    ensureDirectory(path.dirname(dest), false);
    fs.writeFileSync(dest, `${JSON.stringify(merged, null, 2)}\n`, "utf8");
  }
}

function readPackBootstrap(packRoot: string, name: string): string {
  const filePath = packPath(packRoot, path.join("bootstrap", name));
  return fs.readFileSync(filePath, "utf8");
}

function installTextTree(
  sourceRoot: string,
  destRoot: string,
  options: InstallRuntimeOptions,
  relativeBase = "",
  transform?: (relativePath: string, sourcePath: string, content: string) => string
): void {
  for (const entry of fs.readdirSync(sourceRoot, { withFileTypes: true })) {
    const sourcePath = path.join(sourceRoot, entry.name);
    const relativePath = relativeBase ? `${relativeBase}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      installTextTree(sourcePath, destRoot, options, relativePath, transform);
      continue;
    }

    const content = fs.readFileSync(sourcePath, "utf8");
    const rendered = transform ? transform(relativePath, sourcePath, content) : content;
    writeFileAction(destRoot, relativePath, rendered, options);
  }
}

function parseSimpleFrontmatter(content: string): {
  frontmatter: Record<string, string>;
  body: string;
} {
  const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!frontmatterMatch) {
    return { frontmatter: {}, body: content };
  }

  const frontmatter: Record<string, string> = {};
  const block = frontmatterMatch[1];
  for (const line of block.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const match = trimmed.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match) {
      continue;
    }
    const key = match[1];
    const rawValue = match[2].trim();
    frontmatter[key] = rawValue.replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
  }

  return {
    frontmatter,
    body: content.slice(frontmatterMatch[0].length),
  };
}

function clampText(value: string, maxLength: number): string {
  const compact = value.replace(/\s+/g, " ").trim();
  if (compact.length <= maxLength) {
    return compact;
  }
  return `${compact.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

function titleCaseSlug(value: string): string {
  return value
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}

function readSkillMetadata(
  sourceContent: string,
  fallbackName: string
): {
  name: string;
  description: string;
  body: string;
} {
  const parsed = parseSimpleFrontmatter(sourceContent);
  const body = stripFrontmatter(sourceContent).trimStart();
  const name =
    parsed.frontmatter.name || parsed.frontmatter.id || extractFirstHeading(body) || fallbackName;
  const description =
    parsed.frontmatter.description || extractPurposeSummary(body) || `Harness skill: ${name}`;
  return { name, description, body };
}

function stripFrontmatter(content: string): string {
  const parsed = parseSimpleFrontmatter(content);
  return parsed.body;
}

function extractFirstHeading(content: string): string | null {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

function extractPurposeSummary(content: string): string {
  const lines = content.split(/\r?\n/);
  const purposeIndex = lines.findIndex((line) => /^## Purpose\s*$/.test(line));
  if (purposeIndex === -1) {
    return "";
  }

  const summaryLines: string[] = [];
  for (let index = purposeIndex + 1; index < lines.length; index++) {
    const line = lines[index].trim();
    if (!line) {
      if (summaryLines.length > 0) {
        break;
      }
      continue;
    }
    if (/^##\s+/.test(line)) {
      break;
    }
    summaryLines.push(line.replace(/^[-*]\s+/, ""));
    if (summaryLines.join(" ").length >= 140) {
      break;
    }
  }
  return summaryLines.join(" ").trim();
}

function renderCodexSkillMarkdown(sourceContent: string, fallbackName: string): string {
  const { name, description, body } = readSkillMetadata(sourceContent, fallbackName);
  const frontmatter = [
    "---",
    `name: ${JSON.stringify(name)}`,
    `description: ${JSON.stringify(description)}`,
    "---",
    "",
  ].join("\n");

  return `${frontmatter}${body}\n`;
}

function renderOpenAiSkillYaml(sourceContent: string, fallbackName: string): string {
  const { name, description } = readSkillMetadata(sourceContent, fallbackName);
  const displayName = titleCaseSlug(name);
  const shortDescription = clampText(description, 64);
  const defaultPrompt = clampText(
    `Use $${name} to help with ${description.replace(/\.$/, "")}.`,
    120
  );

  return [
    "interface:",
    `  display_name: ${JSON.stringify(displayName)}`,
    `  short_description: ${JSON.stringify(shortDescription)}`,
    `  default_prompt: ${JSON.stringify(defaultPrompt)}`,
    "",
  ].join("\n");
}

function escapeTomlMultiline(value: string): string {
  return value.replace(/"""/g, '\\"""');
}

function renderCodexAgentToml(workerId: string, sourceContent: string): string {
  const worker = workers.find((entry) => entry.id === workerId);
  if (!worker) {
    throw new Error(`Unknown worker: ${workerId}`);
  }

  const body = stripFrontmatter(sourceContent).trim();
  const sandboxMode = worker.writeAccess === "write" ? "workspace-write" : "read-only";
  return [
    `name = "harness-${worker.id}"`,
    `description = "Harness delegated ${worker.role} worker (${worker.mode}, writeAccess=${worker.writeAccess})"`,
    `developer_instructions = """${escapeTomlMultiline(body)}"""`,
    `model = "inherit"`,
    `sandbox_mode = "${sandboxMode}"`,
    "",
  ].join("\n");
}

function installClaudeSkills(
  scope: InstallScope,
  targetRoot: string,
  packRoot: string,
  options: InstallRuntimeOptions
): void {
  const sourceRoot = path.join(packRoot, "skills");
  if (!fs.existsSync(sourceRoot)) {
    return;
  }

  const destRoot =
    scope === "global"
      ? path.join(os.homedir(), ".claude", "skills")
      : path.join(targetRoot, ".claude", "skills");

  ensureDirectory(destRoot, options.dryRun);

  for (const entry of fs.readdirSync(sourceRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      continue;
    }
    const skillRoot = path.join(sourceRoot, entry.name);
    if (!fs.existsSync(path.join(skillRoot, "SKILL.md"))) {
      continue;
    }
    installTextTree(skillRoot, path.join(destRoot, entry.name), options);
  }
}

function installCodexHooks(
  scope: InstallScope,
  targetRoot: string,
  packRoot: string,
  options: InstallRuntimeOptions
): void {
  const codexRoot =
    scope === "global" ? path.join(os.homedir(), ".codex") : path.join(targetRoot, ".codex");
  const sourceRoot = path.join(packRoot, "dist", "hooks", "core");
  if (!fs.existsSync(sourceRoot)) {
    return;
  }

  const destRoot = path.join(codexRoot, "hooks", "core");
  ensureDirectory(destRoot, options.dryRun);
  installTextTree(sourceRoot, destRoot, options, "", (_relativePath, _sourcePath, content) => {
    return content;
  });
  writeFileAction(codexRoot, "hooks.json", renderCodexHooksConfig(), options);
}

function renderCodexHooksConfig(): string {
  return `${JSON.stringify(
    {
      version: 1,
      hooks: {
        SessionStart: [
          {
            matcher: "startup|resume",
            hooks: [
              {
                type: "command",
                command: "node .codex/hooks/core/codex-hook-router.js",
              },
            ],
          },
        ],
        PreToolUse: [
          {
            matcher: ".*",
            hooks: [
              {
                type: "command",
                command: "node .codex/hooks/core/codex-hook-router.js",
              },
            ],
          },
        ],
        PermissionRequest: [
          {
            matcher: ".*",
            hooks: [
              {
                type: "command",
                command: "node .codex/hooks/core/codex-hook-router.js",
              },
            ],
          },
        ],
        PostToolUse: [
          {
            matcher: ".*",
            hooks: [
              {
                type: "command",
                command: "node .codex/hooks/core/codex-hook-router.js",
              },
            ],
          },
        ],
        UserPromptSubmit: [
          {
            matcher: ".*",
            hooks: [
              {
                type: "command",
                command: "node .codex/hooks/core/codex-hook-router.js",
              },
            ],
          },
        ],
        Stop: [
          {
            matcher: ".*",
            hooks: [
              {
                type: "command",
                command: "node .codex/hooks/core/codex-hook-router.js",
              },
            ],
          },
        ],
      },
    },
    null,
    2
  )}\n`;
}

function installCodexRules(
  scope: InstallScope,
  targetRoot: string,
  options: InstallRuntimeOptions
): void {
  const destRoot =
    scope === "global"
      ? path.join(os.homedir(), ".codex", "rules")
      : path.join(targetRoot, ".codex", "rules");
  ensureDirectory(destRoot, options.dryRun);
  const content = [
    "# ai-engineering-harness Codex rules",
    "",
    "# This file keeps only shell-level command policy.",
    "# Project coding conventions stay in AGENTS.md or skills.",
    "",
    renderCodexRuleSet([
      {
        prefixes: ["rg", "git status", "git diff", "git log", "ls", "cat"],
        decision: "allow",
        justification: "Read-only inspection commands do not modify repository state.",
      },
      {
        prefixes: [
          "npm install",
          "pnpm install",
          "yarn add",
          "gh pr merge",
          "vercel",
          "npm publish",
        ],
        decision: "prompt",
        justification: "Confirm before changing dependencies, merging, or deploying.",
      },
      {
        prefixes: [
          "git push --force",
          "git push --force-with-lease",
          "git reset --hard",
          "git clean -fdx",
          "rm -rf",
        ],
        decision: "forbidden",
        justification: "Use a safer alternative: revert, branch, or targeted cleanup.",
      },
    ]),
  ].join("\n");
  writeFileAction(destRoot, "default.rules", content, options);
}

function installCodexAgents(
  scope: InstallScope,
  targetRoot: string,
  packRoot: string,
  options: InstallRuntimeOptions
): void {
  const sourceRoot = path.join(packRoot, "workers");
  if (!fs.existsSync(sourceRoot)) {
    return;
  }

  const destRoot =
    scope === "global"
      ? path.join(os.homedir(), ".codex", "agents")
      : path.join(targetRoot, ".codex", "agents");
  ensureDirectory(destRoot, options.dryRun);

  for (const worker of workers) {
    const sourcePath = path.join(sourceRoot, path.basename(worker.definitionPath));
    if (!fs.existsSync(sourcePath)) {
      continue;
    }
    const destRel = `${worker.id}.toml`;
    const destPath = path.join(destRoot, destRel);
    const existed = fs.existsSync(destPath);
    const content = renderCodexAgentToml(worker.id, fs.readFileSync(sourcePath, "utf8"));

    if (existed && !options.force) {
      logAction(
        options.dryRun ? "WOULD SKIP" : "SKIP",
        path.join(".codex", "agents", destRel).replace(/\\/g, "/")
      );
      continue;
    }

    if (existed && options.force) {
      logAction(
        options.dryRun ? "WOULD OVERWRITE" : "OVERWRITE",
        path.join(".codex", "agents", destRel).replace(/\\/g, "/")
      );
    } else {
      logAction(
        options.dryRun ? "WOULD CREATE" : "CREATE",
        path.join(".codex", "agents", destRel).replace(/\\/g, "/")
      );
    }

    if (!options.dryRun) {
      ensureDirectory(path.dirname(destPath), false);
      fs.writeFileSync(destPath, `${content}\n`, "utf8");
    }
  }
}

function installCodexCommands(
  scope: InstallScope,
  targetRoot: string,
  packRoot: string,
  options: InstallRuntimeOptions
): void {
  const sourceRoot = path.join(packRoot, "commands");
  if (!fs.existsSync(sourceRoot)) {
    return;
  }

  const codexRoot =
    scope === "global" ? path.join(os.homedir(), ".codex") : path.join(targetRoot, ".codex");
  const destRoot = path.join(codexRoot, "commands");
  ensureDirectory(destRoot, options.dryRun);

  for (const entry of fs.readdirSync(sourceRoot, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.startsWith("harness-") || !entry.name.endsWith(".md")) {
      continue;
    }
    const content = fs.readFileSync(path.join(sourceRoot, entry.name), "utf8");
    writeFileAction(codexRoot, path.join("commands", entry.name), content, options);
  }
}

function installCodexSkills(
  scope: InstallScope,
  targetRoot: string,
  packRoot: string,
  options: InstallRuntimeOptions
): void {
  const sourceRoot = path.join(packRoot, "skills");
  if (!fs.existsSync(sourceRoot)) {
    return;
  }

  const destRoot =
    scope === "global"
      ? path.join(os.homedir(), ".agents", "skills")
      : path.join(targetRoot, ".agents", "skills");

  ensureDirectory(destRoot, options.dryRun);

  for (const entry of fs.readdirSync(sourceRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      continue;
    }
    const skillRoot = path.join(sourceRoot, entry.name);
    const sourceSkillFile = path.join(skillRoot, "SKILL.md");
    if (!fs.existsSync(sourceSkillFile)) {
      continue;
    }
    const destSkillRoot = path.join(destRoot, entry.name);
    ensureDirectory(destSkillRoot, options.dryRun);
    installTextTree(skillRoot, destSkillRoot, options, "", (relativePath, _sourcePath, content) => {
      if (relativePath === "SKILL.md") {
        return renderCodexSkillMarkdown(content, entry.name);
      }
      return content;
    });
    writeFileAction(
      destSkillRoot,
      path.join("agents", "openai.yaml"),
      renderOpenAiSkillYaml(fs.readFileSync(sourceSkillFile, "utf8"), entry.name),
      options
    );
  }
}

function installCursor(
  scope: InstallScope,
  targetRoot: string,
  packRoot: string,
  options: InstallRuntimeOptions
): void {
  if (scope === "global") {
    const destRoot = path.join(os.homedir(), ".cursor");
    const rules: [string, string][] = [
      ["rules/ai-engineering-harness.mdc", renderCursorActivationMdc()],
      ["rules/ai-engineering-harness-commands.mdc", renderCursorCommandsMdc()],
      ["rules/ai-engineering-harness-guardrails.mdc", renderCursorGuardrailsMdc()],
    ];
    for (const [relativePath, content] of rules) {
      writeFileAction(destRoot, relativePath, content, options);
    }
    return;
  }
  const destRoot = path.join(targetRoot, ".cursor");
  const rules: [string, string][] = [
    ["rules/ai-engineering-harness.mdc", renderCursorActivationMdc()],
    ["rules/ai-engineering-harness-commands.mdc", renderCursorCommandsMdc()],
    ["rules/ai-engineering-harness-guardrails.mdc", renderCursorGuardrailsMdc()],
  ];
  for (const [relativePath, content] of rules) {
    writeFileAction(destRoot, relativePath, content, options);
  }
}

function installCodex(
  scope: InstallScope,
  targetRoot: string,
  packRoot: string,
  options: InstallRuntimeOptions
): void {
  if (scope === "global") {
    const destRoot = path.join(os.homedir(), ".codex");
    writeFileAction(
      destRoot,
      "AGENTS.md",
      readPackBootstrap(packRoot, "AGENTS.global.codex.md"),
      options
    );
    installCodexRules(scope, targetRoot, options);
    installCodexHooks(scope, targetRoot, packRoot, options);
    installCodexAgents(scope, targetRoot, packRoot, options);
    installCodexCommands(scope, targetRoot, packRoot, options);
    installCodexSkills(scope, targetRoot, packRoot, options);
    console.log(
      "NEXT: Codex — /harness-* slash commands are routed via hooks. Trust ~/.codex/ in Codex and restart the app."
    );
    console.log(
      "REMEMBER: Use /harness-start, /harness-plan, etc. in Codex CLI. The UserPromptSubmit hook routes them."
    );
    return;
  }
  writeFileAction(targetRoot, "AGENTS.md", renderCodexAgentsMd(), options);
  installCodexRules(scope, targetRoot, options);
  installCodexHooks(scope, targetRoot, packRoot, options);
  installCodexAgents(scope, targetRoot, packRoot, options);
  installCodexCommands(scope, targetRoot, packRoot, options);
  installCodexSkills(scope, targetRoot, packRoot, options);
  console.log(
    "NEXT: Codex — /harness-* slash commands are routed via hooks. Trust .codex/ in Codex and restart the app."
  );
  console.log(
    "REMEMBER: Use /harness-start, /harness-plan, etc. in Codex CLI. The UserPromptSubmit hook routes them."
  );
}

function installGeneric(
  scope: InstallScope,
  targetRoot: string,
  packRoot: string,
  options: InstallRuntimeOptions
): void {
  if (scope === "global") {
    console.log("SKIP generic global (use codex runtime for ~/.codex/AGENTS.md)");
    return;
  }
  installCodex("project", targetRoot, packRoot, options);
}

function installClaude(
  scope: InstallScope,
  targetRoot: string,
  packRoot: string,
  options: InstallRuntimeOptions
): void {
  if (scope === "global") {
    const homeClaude = path.join(os.homedir(), ".claude");
    writeFileAction(
      homeClaude,
      "CLAUDE.md",
      fs.readFileSync(packPath(packRoot, "claude/CLAUDE.global.md"), "utf8"),
      options
    );
    mergeJsonFile(
      homeClaude,
      "settings.json",
      {
        extraKnownMarketplaces: JSON.parse(
          fs.readFileSync(packPath(packRoot, "claude/settings.project.fragment.json"), "utf8")
        ).extraKnownMarketplaces,
      },
      options
    );
    for (const entry of installClaudeWorkers(os.homedir(), packRoot, options)) {
      if (entry && entry.action && entry.relativePath) {
        logAction(entry.action, entry.relativePath);
      }
    }
    installClaudeSkills(scope, os.homedir(), packRoot, options);
    console.log(
      `NEXT: In Claude Code run: /plugin install ai-engineering-harness@ai-engineering-harness (marketplace from ${HARNESS_GIT_URL})`
    );
    return;
  }

  ensureDirectory(path.join(targetRoot, ".claude"), options.dryRun);
  writeFileAction(targetRoot, ".claude/CLAUDE.md", renderClaudeProjectMd(), options);
  mergeJsonFile(
    targetRoot,
    ".claude/settings.json",
    JSON.parse(
      fs.readFileSync(packPath(packRoot, "claude/settings.project.fragment.json"), "utf8")
    ),
    options
  );
  for (const entry of installClaudeWorkers(targetRoot, packRoot, options)) {
    if (entry && entry.action && entry.relativePath) {
      logAction(entry.action, entry.relativePath);
    }
  }
  installClaudeSkills(scope, targetRoot, packRoot, options);
  console.log(
    "NEXT: In Claude Code run: /plugin install ai-engineering-harness@ai-engineering-harness"
  );
}

function installGemini(
  scope: InstallScope,
  targetRoot: string,
  packRoot: string,
  options: InstallRuntimeOptions
): void {
  const extName = "ai-engineering-harness";
  const destRoot =
    scope === "global"
      ? path.join(os.homedir(), ".gemini", "extensions", extName)
      : path.join(targetRoot, ".gemini", "extensions", extName);

  const relBase =
    scope === "global" ? `~/.gemini/extensions/${extName}` : `.gemini/extensions/${extName}`;

  const manifest = fs.readFileSync(packPath(packRoot, "gemini/gemini-extension.json"), "utf8");
  writeFileAction(destRoot, "gemini-extension.json", manifest, options);
  writeFileAction(destRoot, "GEMINI.md", renderGeminiMd(), options);

  if (scope === "project") {
    console.log(`NEXT: Or run: gemini extensions install ${HARNESS_GIT_URL}`);
  } else {
    console.log(`NEXT: Restart Gemini CLI to load extension from ${relBase}`);
  }
}

function installProviderCommands(
  runtime: Exclude<RuntimeId, "all">,
  scope: InstallScope,
  targetRoot: string,
  packRoot: string,
  options: InstallRuntimeOptions
): void {
  if (scope !== "project") {
    return;
  }
  const results: ProviderCommandEntry[] = installProviderCommandSurface(
    runtime,
    scope,
    targetRoot,
    packRoot,
    options
  );
  for (const entry of results) {
    if (entry && entry.action && entry.relativePath) {
      logAction(entry.action, entry.relativePath);
    }
  }
}

function installOne(
  runtime: Exclude<RuntimeId, "all">,
  scope: InstallScope,
  targetRoot: string,
  packRoot: string,
  options: InstallRuntimeOptions
): void {
  console.log(`\n--- Runtime: ${runtime} (${scope}) ---`);

  switch (runtime) {
    case "cursor":
      installCursor(scope, targetRoot, packRoot, options);
      break;
    case "codex":
      installCodex(scope, targetRoot, packRoot, options);
      break;
    case "claude":
      installClaude(scope, targetRoot, packRoot, options);
      break;
    case "gemini":
      installGemini(scope, targetRoot, packRoot, options);
      break;
    case "generic":
      installGeneric(scope, targetRoot, packRoot, options);
      break;
    default:
      throw new Error(`Unsupported runtime: ${runtime}`);
  }

  installProviderCommands(runtime, scope, targetRoot, packRoot, options);
}

class InstallManifest {
  private createdFiles: string[] = [];
  private backups: Map<string, string> = new Map();

  trackCreated(filePath: string): void {
    if (!fs.existsSync(filePath)) {
      this.createdFiles.push(filePath);
    } else if (!this.backups.has(filePath)) {
      this.backups.set(filePath, fs.readFileSync(filePath, "utf8"));
    }
  }

  rollback(): void {
    for (const filePath of this.createdFiles.reverse()) {
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch {
        // best-effort cleanup
      }
    }
    for (const [filePath, content] of this.backups) {
      try {
        fs.writeFileSync(filePath, content, "utf8");
      } catch {
        // best-effort restore
      }
    }
  }
}

function installRuntime(options: InstallRuntimeOptions): void {
  if (!options.packRoot || !fs.existsSync(path.join(options.packRoot, "runtime", "README.md"))) {
    throw new Error("Invalid --pack-root (missing runtime/ payloads)");
  }

  const targetRoot = path.resolve(options.target);
  if (options.scope === "project" && !options.dryRun && !fs.existsSync(targetRoot)) {
    fs.mkdirSync(targetRoot, { recursive: true });
  }

  const runtimes: Exclude<RuntimeId, "all">[] =
    options.runtime === "all"
      ? (ALL_RUNTIMES as Exclude<RuntimeId, "all">[])
      : [options.runtime as Exclude<RuntimeId, "all">];

  const manifest = new InstallManifest();

  for (const runtime of runtimes) {
    try {
      installOne(runtime, options.scope, targetRoot, options.packRoot, options);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`\nInstall failed for ${runtime}: ${message}`);
      if (!options.dryRun) {
        console.error("Rolling back partial install...");
        manifest.rollback();
        console.error("Rollback complete.");
      }
      throw error;
    }
  }

  console.log("\n--- Runtime install complete ---");
}

export { ALL_RUNTIMES, deepMerge, installRuntime, installProviderCommands };
export type { RuntimeId, InstallScope, InstallRuntimeOptions, ProviderCommandEntry, JsonObject };
