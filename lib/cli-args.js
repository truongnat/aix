"use strict";

const COMMANDS = new Set(["install", "status", "doctor", "update", "uninstall", "help"]);

function parseArgv(argv) {
  const args = argv.slice(2);
  let command = "install";
  let i = 0;

  if (args.length > 0 && !args[0].startsWith("-")) {
    if (COMMANDS.has(args[0])) {
      command = args[0];
      i = 1;
    }
  }

  const options = {
    command,
    providers: [],
    providerAlias: "",
    runtimeAliasUsed: false,
    scope: "",
    visibility: "",
    target: ".",
    ref: "main",
    dryRun: false,
    yes: false,
    help: false,
    all: false,
    verbose: false
  };

  for (; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--help" || arg === "-h") {
      options.help = true;
      continue;
    }
    if (arg === "--dry-run") {
      options.dryRun = true;
      continue;
    }
    if (arg === "--yes" || arg === "-y") {
      options.yes = true;
      continue;
    }
    if (arg === "--provider" || arg === "--runtime") {
      const value = args[++i];
      if (!value) {
        throw new Error(`Missing value for ${arg}`);
      }
      const ids = value.split(",").map((s) => s.trim()).filter(Boolean);
      if (arg === "--runtime") {
        options.runtimeAliasUsed = true;
      } else {
        options.providerAlias = "provider";
      }
      options.providers.push(...ids);
      continue;
    }
    if (arg === "--scope") {
      options.scope = args[++i] || "";
      continue;
    }
    if (arg === "--visibility") {
      options.visibility = args[++i] || "";
      continue;
    }
    if (arg === "--target") {
      options.target = args[++i] || ".";
      continue;
    }
    if (arg === "--ref") {
      options.ref = args[++i] || "main";
      continue;
    }
    if (arg === "--all") {
      options.all = true;
      continue;
    }
    if (arg === "--verbose") {
      options.verbose = true;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  if (options.providers.length > 0) {
    options.providers = [...new Set(options.providers)];
  }

  return options;
}

function modeToScopeVisibility(modeId) {
  switch (modeId) {
  case "project-private":
    return { scope: "project", visibility: "private" };
  case "project-shared":
    return { scope: "project", visibility: "shared" };
  case "global":
    return { scope: "global", visibility: "" };
  default:
    return { scope: "project", visibility: "private" };
  }
}

function isNonInteractive(options) {
  return (
    !process.stdin.isTTY ||
    !process.stdout.isTTY ||
    options.yes ||
    options.providers.length > 0
  );
}

module.exports = {
  COMMANDS,
  parseArgv,
  modeToScopeVisibility,
  isNonInteractive
};
