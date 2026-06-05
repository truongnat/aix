import childProcess from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const SH_MISSING_MSG =
  "The npm CLI currently delegates lifecycle operations to the bundled shell backend. On Windows, install Git Bash or WSL for shell fallback.";

function packRootFromModule(moduleFilename: string): string {
  return path.resolve(path.dirname(moduleFilename), "..");
}

function findSh(): string | null {
  if (process.platform === "win32") {
    const candidates = [
      process.env.SHELL,
      "C:\\Program Files\\Git\\bin\\sh.exe",
      "C:\\Program Files\\Git\\usr\\bin\\sh.exe",
    ].filter(Boolean) as string[];
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

interface RunOptions {
  cwd?: string;
  env?: Record<string, string>;
  timeout?: number;
  verbose?: boolean;
  capture?: boolean;
}

interface SpawnResult {
  status: number | null;
  stdout: string;
  stderr: string;
  combined: string;
}

function runAihSh(packRoot: string, args: string[], options: RunOptions = {}): SpawnResult {
  const sh = findSh();
  if (!sh) {
    const error = new Error(SH_MISSING_MSG) as Error & { code: string };
    error.code = "SH_MISSING";
    throw error;
  }

  const scriptPath = path.join(packRoot, "aih.sh");
  if (!fs.existsSync(scriptPath)) {
    const error = new Error(`Bundled aih.sh not found in package at ${scriptPath}`) as Error & {
      code: string;
    };
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
    return { ...result, combined } as SpawnResult;
  }

  if (verbose || result.status !== 0) {
    if (result.stdout) {
      process.stdout.write(result.stdout);
    }
    if (result.stderr) {
      process.stderr.write(result.stderr);
    }
  }

  return { ...result, combined } as SpawnResult;
}

interface InstallContext {
  target: string;
  ref: string;
  scope: string;
  visibility: string;
  dryRun: boolean;
  yes: boolean;
  initHarness: boolean;
  installCache: boolean;
}

function buildInstallArgs(provider: string, ctx: InstallContext, index: number): string[] {
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

interface UpdateContext {
  target: string;
  ref: string;
  scope: string;
  visibility: string;
  dryRun: boolean;
  yes: boolean;
}

function buildUpdateArgs(provider: string, ctx: UpdateContext): string[] {
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

interface UninstallContext {
  target: string;
  scope: string;
  yes: boolean;
  dryRun: boolean;
  fullCleanup: boolean;
  removeCache: boolean;
  removeState: boolean;
}

function buildUninstallArgs(provider: string, ctx: UninstallContext): string[] {
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

export {
  SH_MISSING_MSG,
  packRootFromModule,
  findSh,
  runAihSh,
  buildInstallArgs,
  buildUpdateArgs,
  buildUninstallArgs,
};
export type { RunOptions, SpawnResult, InstallContext, UpdateContext, UninstallContext };
