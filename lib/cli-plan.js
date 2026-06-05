"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pathsForProvider = pathsForProvider;
exports.buildInstallPlan = buildInstallPlan;
exports.printPlan = printPlan;
exports.warnNonGitPrivate = warnNonGitPrivate;
// @ts-ignore - JS file with checkJs
const cli_providers_1 = require("./cli-providers");
// @ts-ignore - JS file with checkJs
const runtime_command_catalog_1 = require("./runtime-command-catalog");
function pathsForProvider(providerId, initHarness) {
    const paths = [];
    if (initHarness) {
        paths.push(".harness/");
    }
    if ((0, cli_providers_1.isRuntimeNative)(providerId)) {
        paths.push(".ai-harness/");
    }
    switch (providerId) {
        case "cursor":
            paths.push(".cursor/rules/ai-engineering-harness.mdc");
            break;
        case "claude":
            paths.push(".claude/CLAUDE.md", ".claude/settings.json");
            break;
        case "gemini":
            paths.push(".gemini/extensions/ai-engineering-harness/");
            break;
        case "codex":
        case "generic":
        case "manual":
            paths.push("AGENTS.md");
            break;
        default:
            break;
    }
    return [...new Set(paths)];
}
function buildInstallPlan(options) {
    const willInstall = [];
    for (const providerId of options.providers) {
        for (const p of pathsForProvider(providerId, options.initHarness && willInstall.length === 0)) {
            if (!willInstall.includes(p)) {
                willInstall.push(p);
            }
        }
        for (const p of (0, runtime_command_catalog_1.runtimeCommandCatalogPathsForPlan)(providerId, "project")) {
            if (!willInstall.includes(p)) {
                willInstall.push(p);
            }
        }
        if (options.initHarness && !willInstall.includes(".harness/")) {
            willInstall.push(".harness/");
        }
        if (options.installCache &&
            (0, cli_providers_1.isRuntimeNative)(providerId) &&
            !willInstall.includes(".ai-harness/")) {
            willInstall.push(".ai-harness/");
        }
    }
    if (options.mode === "project-private" || options.mode === "project-shared") {
        if (options.mode === "project-private" && options.isGit) {
            willInstall.push(".git/info/exclude block");
        }
        else if (options.mode === "project-private" && !options.isGit) {
            willInstall.push("(no .git/info/exclude — target is not a Git repo)");
        }
    }
    const willNotModify = [
        ".gitignore",
        "root commands/",
        "root skills/",
        "root workflows/",
        "root templates/",
        "root patterns/",
    ];
    return {
        willInstall,
        willNotModify,
        mode: options.mode,
        isGit: options.isGit,
        providers: options.providers,
    };
}
function warnNonGitPrivate(plan) {
    if (plan.mode === "project-private" && !plan.isGit) {
        console.log("");
        console.log("warning: target is not a Git repo; private .git/info/exclude cannot be updated.");
        console.log("Run `git init` first or choose project shared / install inside a cloned repo.");
    }
}
function printPlan(plan) {
    console.log("");
    console.log("Will install:");
    for (const line of plan.willInstall) {
        console.log(`  ${line}`);
    }
    console.log("");
    console.log((0, runtime_command_catalog_1.formatCommandSupportForPlan)(plan.providers || []));
    console.log("");
    console.log("Will not modify:");
    for (const line of plan.willNotModify) {
        console.log(`  ${line}`);
    }
}
