"use strict";

/**
 * Runtime-native install for ai-engineering-harness (no root pack copy).
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { ensureDirectory, logAction } = require("./file-operations.js");

const HARNESS_REPO = "truongnat/ai-engineering-harness";
const HARNESS_GIT_URL = `https://github.com/${HARNESS_REPO}`;
const { installProviderCommandSurface } = require("./runtime-command-catalog.js");
const { installClaudeWorkers } = require("./worker-claude-adapter.js");
const {
  renderClaudeProjectMd,
  renderCodexAgentsMd,
  renderCursorActivationMdc,
  renderCursorCommandsMdc,
  renderCursorGuardrailsMdc,
  renderGeminiMd,
} = require("./provider-rule-renderer.js");

const ALL_RUNTIMES = ["cursor", "claude", "codex", "gemini", "generic"];

function parseArgs(argv) {
  const options = {
    packRoot: "",
    runtime: "",
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
      options.runtime = argv[++i];
    } else if (arg === "--scope") {
      options.scope = argv[++i];
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

function usage() {
  console.log(`Usage: node install-runtime.js --pack-root <path> --runtime <name> --scope <global|project> --target <path> [--dry-run] [--force]

Runtimes: claude, codex, cursor, gemini, generic, all`);
}

function packPath(packRoot, relativePath) {
  return path.join(packRoot, "runtime", relativePath);
}

function writeFileAction(root, relativePath, content, options) {
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

function deepMerge(target, source) {
  const out = { ...target };
  for (const [key, value] of Object.entries(source)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      out[key] = deepMerge(out[key] && typeof out[key] === "object" ? out[key] : {}, value);
    } else {
      out[key] = value;
    }
  }
  return out;
}

function mergeJsonFile(destRoot, relativePath, fragment, options) {
  const dest = path.join(destRoot, relativePath);
  const exists = fs.existsSync(dest);
  let current = {};

  if (exists) {
    try {
      current = JSON.parse(fs.readFileSync(dest, "utf8"));
    } catch (error) {
      throw new Error(`Invalid JSON in ${relativePath}: ${error.message}`);
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

function readPackBootstrap(packRoot, name) {
  const filePath = packPath(packRoot, path.join("bootstrap", name));
  return fs.readFileSync(filePath, "utf8");
}

function installCursor(scope, targetRoot, packRoot, options) {
  const destRoot = scope === "global" ? path.join(os.homedir(), ".cursor") : targetRoot;
  const rules = [
    ["rules/ai-engineering-harness.mdc", renderCursorActivationMdc()],
    ["rules/ai-engineering-harness-commands.mdc", renderCursorCommandsMdc()],
    ["rules/ai-engineering-harness-guardrails.mdc", renderCursorGuardrailsMdc()],
  ];
  for (const [relativePath, content] of rules) {
    writeFileAction(destRoot, relativePath, content, options);
  }
}

function installCodex(scope, targetRoot, packRoot, options) {
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

function installGeneric(scope, targetRoot, packRoot, options) {
  if (scope === "global") {
    console.log("SKIP generic global (use codex runtime for ~/.codex/AGENTS.md)");
    return;
  }
  installCodex("project", targetRoot, packRoot, options);
}

function installClaude(scope, targetRoot, packRoot, options) {
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

function installGemini(scope, targetRoot, packRoot, options) {
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

function installProviderCommands(runtime, scope, targetRoot, packRoot, options) {
  if (scope !== "project") {
    return;
  }
  const results = installProviderCommandSurface(runtime, scope, targetRoot, packRoot, options);
  for (const entry of results) {
    if (entry && entry.action && entry.relativePath) {
      logAction(entry.action, entry.relativePath);
    }
  }
}

function installOne(runtime, scope, targetRoot, packRoot, options) {
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

function installRuntime(options) {
  if (!options.packRoot || !fs.existsSync(path.join(options.packRoot, "runtime", "README.md"))) {
    throw new Error("Invalid --pack-root (missing runtime/ payloads)");
  }

  const targetRoot = path.resolve(options.target);
  if (options.scope === "project" && !options.dryRun && !fs.existsSync(targetRoot)) {
    fs.mkdirSync(targetRoot, { recursive: true });
  }

  const runtimes = options.runtime === "all" ? ALL_RUNTIMES : [options.runtime];

  for (const runtime of runtimes) {
    installOne(runtime, options.scope, targetRoot, options.packRoot, options);
  }

  console.log("\n--- Runtime install complete ---");
}

function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(`install-runtime.js: error: ${error.message}`);
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
    console.error(`install-runtime.js: error: ${error.message}`);
    process.exit(1);
  }
}

module.exports = {
  ALL_RUNTIMES,
  deepMerge,
  installRuntime,
  installProviderCommands,
  parseArgs,
  main,
};
