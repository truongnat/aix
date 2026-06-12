// Purpose: Install plan rendering helpers
// Layer: application
// Depends on: domain, ui, legacy bridges

import { isRuntimeNative } from "./providers";
import {
  runtimeCommandCatalogPathsForPlan,
  formatCommandSupportForPlan,
} from "./infrastructure/legacy-deps";

const NON_GIT_PRIVATE_WARNING =
  "warning: target is not a Git repo; private .git/info/exclude cannot be updated.";
const NON_GIT_PRIVATE_WARNING_FOLLOWUP =
  "Run `git init` first or choose project shared / install inside a cloned repo.";

type PlanProviderId = "claude" | "cursor" | "codex" | "gemini" | "generic" | "manual";
type InstallMode = "project-private" | "project-shared" | "global";

interface InstallPlan {
  willInstall: string[];
  willNotModify: string[];
  mode: InstallMode;
  isGit: boolean;
  providers: PlanProviderId[];
}

function pathsForProvider(providerId: PlanProviderId, initHarness: boolean): string[] {
  const paths: string[] = [];
  if (initHarness) {
    paths.push(".harness/");
  }
  if (isRuntimeNative(providerId)) {
    paths.push(".ai-harness/");
  }
  switch (providerId) {
    case "cursor":
      paths.push(".cursor/commands/", ".cursor/rules/");
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

function buildInstallPlan(options: {
  providers: PlanProviderId[];
  initHarness: boolean;
  installCache: boolean;
  mode: InstallMode;
  isGit: boolean;
}): InstallPlan {
  const willInstall: string[] = [];
  for (const providerId of options.providers) {
    for (const p of pathsForProvider(providerId, options.initHarness && willInstall.length === 0)) {
      if (!willInstall.includes(p)) {
        willInstall.push(p);
      }
    }
    for (const p of runtimeCommandCatalogPathsForPlan(providerId, "project")) {
      if (!willInstall.includes(p)) {
        willInstall.push(p);
      }
    }
    if (options.initHarness && !willInstall.includes(".harness/")) {
      willInstall.push(".harness/");
    }
    if (
      options.installCache &&
      isRuntimeNative(providerId) &&
      !willInstall.includes(".ai-harness/")
    ) {
      willInstall.push(".ai-harness/");
    }
  }

  if (options.mode === "project-private" || options.mode === "project-shared") {
    if (options.mode === "project-private" && options.isGit) {
      willInstall.push(".git/info/exclude block");
    } else if (options.mode === "project-private" && !options.isGit) {
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

function warnNonGitPrivate(plan: InstallPlan): void {
  if (plan.mode === "project-private" && !plan.isGit) {
    console.log("");
    console.log(NON_GIT_PRIVATE_WARNING);
    console.log(NON_GIT_PRIVATE_WARNING_FOLLOWUP);
  }
}

function printPlan(plan: InstallPlan): void {
  console.log("");
  console.log("Will install:");
  for (const line of plan.willInstall) {
    console.log(`  ${line}`);
  }
  console.log("");
  console.log(formatCommandSupportForPlan(plan.providers || []));
  console.log("");
  console.log("Will not modify:");
  for (const line of plan.willNotModify) {
    console.log(`  ${line}`);
  }
}

export {
  NON_GIT_PRIVATE_WARNING,
  NON_GIT_PRIVATE_WARNING_FOLLOWUP,
  pathsForProvider,
  buildInstallPlan,
  printPlan,
  warnNonGitPrivate,
};
export type { PlanProviderId, InstallMode, InstallPlan };
