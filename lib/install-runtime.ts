/**
 * Runtime-native install for ai-engineering-harness (no root pack copy).
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
// @ts-ignore - JS file with checkJs
import { ensureDirectory, logAction } from "./file-operations.js";
// @ts-ignore - JS file with checkJs
import { installProviderCommandSurface } from "./runtime-command-catalog.js";
// @ts-ignore - JS file with checkJs
import { installClaudeWorkers } from "./worker-claude-adapter.js";
import {
  renderClaudeProjectMd,
  renderCodexAgentsMd,
  renderCursorActivationMdc,
  renderCursorCommandsMdc,
  renderCursorGuardrailsMdc,
  renderGeminiMd,
} from "./provider-rule-renderer";

const HARNESS_REPO = "truongnat/ai-engineering-harness";
const HARNESS_GIT_URL = `https://github.com/${HARNESS_REPO}`;

const ALL_RUNTIMES = ["cursor", "claude", "codex", "gemini", "generic"];

type RuntimeId = "cursor" | "claude" | "codex" | "gemini" | "generic" | "all";
type InstallScope = "global" | "project";

interface InstallRuntimeOptions {
  packRoot: string;
  runtime: RuntimeId;
  scope: InstallScope;
  target: string;
  dryRun: boolean;
  force: boolean;
  help?: boolean;
}

interface ProviderCommandEntry {
  action: string;
  relativePath: string;
}

type JsonObject = Record<string, unknown>;

function parseArgs(argv: string[]): InstallRuntimeOptions {
  const options: InstallRuntimeOptions = {
    packRoot: "",
    runtime: "" as RuntimeId,
    scope: "project",
    target: process.cwd(),
    dryRun: false,
    force: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--pack-root") {
      options.packRoot = argv[++i];
    } else if (arg === "--runtime") {
      options.runtime = argv[++i] as RuntimeId;
    } else if (arg === "--scope") {
      options.scope = argv[++i] as InstallScope;
    } else if (arg === "--target") {
      options.target = argv[++i];
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--force") {
      options.force = true;
    } else if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function usage(): void {
  console.log(`Usage: node install-runtime.js --pack-root <path> --runtime <name> --scope <global|project> --target <path> [--dry-run] [--force]

Runtimes: claude, codex, cursor, gemini, generic, all`);
}

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

function installCursor(
  scope: InstallScope,
  targetRoot: string,
  packRoot: string,
  options: InstallRuntimeOptions
): void {
  void packRoot;
  const destRoot = scope === "global" ? path.join(os.homedir(), ".cursor") : targetRoot;
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
    console.log(
      "NEXT: Codex native support — install plugin via /plugins (marketplace pending). Package: .codex-plugin/plugin.json + skills/"
    );
    return;
  }
  writeFileAction(targetRoot, "AGENTS.md", renderCodexAgentsMd(), options);
  console.log(
    "NEXT: Codex — project install is AGENTS.md + .ai-harness/ fallback only. Native: /plugins → ai-engineering-harness plugin (not /harness-* slash)."
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
  void packRoot;
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

  for (const runtime of runtimes) {
    installOne(runtime, options.scope, targetRoot, options.packRoot, options);
  }

  console.log("\n--- Runtime install complete ---");
}

function main(): void {
  let options: InstallRuntimeOptions;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`install-runtime.js: error: ${message}`);
    process.exit(1);
  }

  if (options.help) {
    usage();
    process.exit(0);
  }

  if (!options.packRoot || !options.runtime) {
    console.error("install-runtime.js: error: --pack-root and --runtime are required");
    usage();
    process.exit(1);
  }

  if (options.scope !== "global" && options.scope !== "project") {
    console.error("install-runtime.js: error: --scope must be global or project");
    process.exit(1);
  }

  try {
    installRuntime(options);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`install-runtime.js: error: ${message}`);
    process.exit(1);
  }
}

export { ALL_RUNTIMES, deepMerge, installRuntime, installProviderCommands, parseArgs, main };
export type { RuntimeId, InstallScope, InstallRuntimeOptions, ProviderCommandEntry, JsonObject };
