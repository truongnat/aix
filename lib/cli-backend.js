"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SH_MISSING_MSG = void 0;
exports.packRootFromModule = packRootFromModule;
exports.findSh = findSh;
exports.runAihSh = runAihSh;
exports.buildInstallArgs = buildInstallArgs;
exports.buildUpdateArgs = buildUpdateArgs;
exports.buildUninstallArgs = buildUninstallArgs;
const node_child_process_1 = __importDefault(require("node:child_process"));
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const SH_MISSING_MSG = "The npm CLI currently delegates lifecycle operations to the bundled shell backend. On Windows, install Git Bash or WSL for shell fallback.";
exports.SH_MISSING_MSG = SH_MISSING_MSG;
function packRootFromModule(moduleFilename) {
    return node_path_1.default.resolve(node_path_1.default.dirname(moduleFilename), "..");
}
function findSh() {
    if (process.platform === "win32") {
        const candidates = [
            process.env.SHELL,
            "C:\\Program Files\\Git\\bin\\sh.exe",
            "C:\\Program Files\\Git\\usr\\bin\\sh.exe",
        ].filter(Boolean);
        for (const candidate of candidates) {
            if (node_fs_1.default.existsSync(candidate)) {
                return candidate;
            }
        }
        try {
            const result = node_child_process_1.default.spawnSync("where", ["sh"], { encoding: "utf8" });
            if (result.status === 0 && result.stdout.trim()) {
                const first = result.stdout.trim().split(/\r?\n/)[0];
                if (node_fs_1.default.existsSync(first)) {
                    return first;
                }
            }
        }
        catch {
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
    const scriptPath = node_path_1.default.join(packRoot, "aih.sh");
    if (!node_fs_1.default.existsSync(scriptPath)) {
        const error = new Error(`Bundled aih.sh not found in package at ${scriptPath}`);
        error.code = "AIH_SH_MISSING";
        throw error;
    }
    const result = node_child_process_1.default.spawnSync(sh, [scriptPath, ...args], {
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
    }
    else if (index > 0) {
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
    }
    else {
        if (ctx.removeCache) {
            args.push("--remove-cache");
        }
        if (ctx.removeState) {
            args.push("--remove-state");
        }
    }
    return args;
}
