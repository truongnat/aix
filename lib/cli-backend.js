"use strict";

const childProcess = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const SH_MISSING_MSG =
  "The npm CLI currently delegates lifecycle operations to the bundled shell backend. On Windows, install Git Bash or WSL for shell fallback.";

function packRootFromModule(moduleFilename) {
  return path.resolve(path.dirname(moduleFilename), "..");
}

function findSh() {
  if (process.platform === "win32") {
    const candidates = [
      process.env.SHELL,
      "C:\\Program Files\\Git\\bin\\sh.exe",
      "C:\\Program Files\\Git\\usr\\bin\\sh.exe",
    ].filter(Boolean);
    for (const candidate of candidates) {
      if (fs.existsSync(candidate)) {
        return candidate;
      }
    }
    try {
      const result = childProcess.spawnSync("where", ["sh"], { encoding: "utf8" });
      if (result.status === 0 && result.stdout.trim()) {
        const first = result.stdout.trim().split(/\r?\n/)[0];
        if (fs.existsSync(first)) {
          return first;
        }
      }
    } catch {
      /* ignore */
    }
    return null;
  }
  return "sh";
}

function runAihSh(packRoot, args, options = {}) {
  const sh = findSh();
  if (!sh) {
    const error = new Error(SH_MISSING_MSG);
    error.code = "SH_MISSING";
    throw error;
  }

  const scriptPath = path.join(packRoot, "aih.sh");
  if (!fs.existsSync(scriptPath)) {
    const error = new Error(`Bundled aih.sh not found in package at ${scriptPath}`);
    error.code = "AIH_SH_MISSING";
    throw error;
  }
  const result = childProcess.spawnSync(sh, [scriptPath, ...args], {
    cwd: options.cwd || process.cwd(),
    encoding: "utf8",
    env: { ...process.env, ...options.env },
    timeout: options.timeout || 120000,
  });

  const combined = `${result.stdout || ""}${result.stderr || ""}`;
  const verbose = Boolean(options.verbose);
  const capture = Boolean(options.capture);

  if (capture) {
    return { ...result, combined };
  }

  if (verbose || result.status !== 0) {
    if (result.stdout) {
      process.stdout.write(result.stdout);
    }
    if (result.stderr) {
      process.stderr.write(result.stderr);
    }
  }

  return { ...result, combined };
}

function buildInstallArgs(provider, ctx, index) {
  const args = ["install", "--runtime", provider, "--target", ctx.target, "--ref", ctx.ref];

  if (ctx.scope) {
    args.push("--scope", ctx.scope);
  }
  if (ctx.visibility) {
    args.push("--visibility", ctx.visibility);
  }
  if (ctx.dryRun) {
    args.push("--dry-run");
  }
  if (ctx.yes) {
    args.push("--yes");
  }
  if (ctx.initHarness && index === 0) {
    args.push("--init-harness");
  }
  if (ctx.installCache && index === 0) {
    args.push("--install-cache");
  } else if (index > 0) {
    args.push("--no-install-cache");
  }

  return args;
}

function buildUpdateArgs(provider, ctx) {
  return [
    "update",
    "--runtime",
    provider,
    "--target",
    ctx.target,
    "--ref",
    ctx.ref,
    "--scope",
    ctx.scope || "project",
    ...(ctx.visibility ? ["--visibility", ctx.visibility] : []),
    ...(ctx.dryRun ? ["--dry-run"] : []),
    ...(ctx.yes ? ["--yes"] : []),
  ];
}

function buildUninstallArgs(provider, ctx) {
  const args = [
    "uninstall",
    "--runtime",
    provider,
    "--target",
    ctx.target,
    "--scope",
    ctx.scope || "project",
    ...(ctx.yes ? ["--yes"] : []),
    ...(ctx.dryRun ? ["--dry-run"] : []),
  ];
  if (ctx.fullCleanup) {
    args.push("--all");
  } else {
    if (ctx.removeCache) {
      args.push("--remove-cache");
    }
    if (ctx.removeState) {
      args.push("--remove-state");
    }
  }
  return args;
}

module.exports = {
  SH_MISSING_MSG,
  packRootFromModule,
  findSh,
  runAihSh,
  buildInstallArgs,
  buildUpdateArgs,
  buildUninstallArgs,
};
