/** In-process status and doctor reporting. */

import * as fs from "node:fs";
import * as path from "node:path";
import { hasHarnessExcludeBlock, reconcileDeferredPrivateIgnore } from "./git-hygiene";
import { detectInstalledProviders, isGitRepo, detectProviderBinaries } from "../cli-detect";
import { readInstalledCommandSurface } from "../runtime-command-catalog";
import { formatStatusCommandLines, formatDoctorCommandLines } from "../command-surface-report";

export interface ReportContext {
  targetAbs: string;
}

export interface StatusResult {
  text: string;
}

export interface DoctorResult {
  text: string;
  ok: boolean;
}

function runtimeListCount(list: string[]): number {
  return list.filter((r) => r.trim().length > 0).length;
}

function detectRuntimesFromTarget(targetAbs: string): string[] {
  const installedProviders = readInstalledCommandSurface(targetAbs)?.installedProviders || [];
  if (installedProviders.length > 0) {
    return [...installedProviders];
  }
  return detectInstalledProviders(targetAbs, { includeLegacy: true });
}

function formatBinaryAvailability(): string {
  const binaries = detectProviderBinaries() as Record<
    string,
    { installed: boolean; version: string | null }
  >;
  return Object.entries(binaries)
    .map(([providerId, probe]) => {
      const row = probe as { installed: boolean; version: string | null };
      const state = row.installed ? (row.version ? `yes (${row.version})` : "yes") : "no";
      return `${providerId}=${state}`;
    })
    .join(", ");
}

function runtimeReferencesCache(targetAbs: string, rt: string): boolean {
  const grep = (filePath: string): boolean => {
    if (!fs.existsSync(filePath)) return false;
    try {
      return fs.readFileSync(filePath, "utf8").includes(".ai-harness/");
    } catch {
      return false;
    }
  };

  switch (rt) {
    case "cursor":
      return grep(path.join(targetAbs, ".cursor/rules/ai-engineering-harness.mdc"));
    case "claude":
      return grep(path.join(targetAbs, ".claude/CLAUDE.md"));
    case "gemini":
      return grep(path.join(targetAbs, ".gemini/extensions/ai-engineering-harness/GEMINI.md"));
    case "opencode":
      return grep(path.join(targetAbs, ".opencode/plugins/ai-engineering-harness.js"));
    case "generic":
    case "codex":
    case "manual":
      return grep(path.join(targetAbs, "AGENTS.md"));
    default:
      return false;
  }
}

function claudeSettingsReferenceHookCache(targetAbs: string): boolean {
  const settingsPath = path.join(targetAbs, ".claude/settings.json");
  if (!fs.existsSync(settingsPath)) {
    return false;
  }
  try {
    const content = fs.readFileSync(settingsPath, "utf8");
    return [
      ".ai-harness/hooks/core/guard-phase.js",
      ".ai-harness/hooks/core/record-tool-output.js",
      ".ai-harness/hooks/core/record-subagent-result.js",
      ".ai-harness/hooks/core/compact-session-memory.js",
    ].every((hookPath) => content.includes(hookPath));
  } catch {
    return false;
  }
}

function doctorPlanStatus(targetAbs: string): string {
  const planFile = path.join(targetAbs, ".harness/PLAN.md");
  if (!fs.existsSync(planFile)) {
    return "missing";
  }
  try {
    const lines = fs.readFileSync(planFile, "utf8").split("\n");
    let inBlock = false;
    for (const line of lines) {
      if (/^## Approval Status/.test(line)) {
        inBlock = true;
        continue;
      }
      if (/^## /.test(line) && inBlock) {
        break;
      }
      if (inBlock && /^status:/.test(line)) {
        return line
          .replace(/^status:\s*/, "")
          .trim()
          .toLowerCase();
      }
    }
  } catch {
    // fall through
  }
  return "";
}

function doctorVerifyHasConcreteTests(targetAbs: string): boolean {
  const verifyFile = path.join(targetAbs, ".harness/VERIFY.md");
  if (!fs.existsSync(verifyFile)) return false;
  try {
    const lines = fs.readFileSync(verifyFile, "utf8").split("\n");
    // grep -Eq '^\|[[:space:]]*`[^`]+`'
    return lines.some((l) => /^\|\s*`[^`]+`/.test(l));
  } catch {
    return false;
  }
}

function doctorVerifyHasConcreteEvidence(targetAbs: string): boolean {
  const verifyFile = path.join(targetAbs, ".harness/VERIFY.md");
  if (!fs.existsSync(verifyFile)) return false;
  try {
    const lines = fs.readFileSync(verifyFile, "utf8").split("\n");
    // grep -Eq '^- (Commands executed|Files inspected|Output summary|Link, log, or snippet):[[:space:]]*[^[:space:]].+'
    return lines.some((l) =>
      /^- (Commands executed|Files inspected|Output summary|Link, log, or snippet):\s*\S.+/.test(l)
    );
  } catch {
    return false;
  }
}

function doctorVerifyStatus(targetAbs: string): string {
  const verifyFile = path.join(targetAbs, ".harness/VERIFY.md");
  if (!fs.existsSync(verifyFile)) {
    return "missing";
  }
  try {
    const lines = fs.readFileSync(verifyFile, "utf8").split("\n");
    for (const line of lines) {
      // /^[[:space:]]*status:[[:space:]]*/
      const m = line.match(/^\s*status:\s*(.*)/);
      if (m) {
        return m[1].trim().toLowerCase();
      }
    }
  } catch {
    // fall through
  }
  return "";
}

function workflowPhaseLine(label: string, state: string): string {
  let icon: string;
  let text: string;

  switch (state) {
    case "ready":
      icon = "✅";
      text = "ready";
      break;
    case "approved":
      icon = "✅";
      text = "approved";
      break;
    case "passed":
      icon = "✅";
      text = "passed";
      break;
    case "draft":
      icon = "⚠️";
      text = "draft";
      break;
    case "required":
      icon = "⛔";
      text = "required";
      break;
    case "blocked":
      icon = "⛔";
      text = "blocked";
      break;
    case "failed":
      icon = "⛔";
      text = "failed";
      break;
    case "missing":
      icon = "⚠️";
      text = "missing";
      break;
    case "partial":
      icon = "⚠️";
      text = "partial";
      break;
    default:
      icon = "⚠️";
      text = state;
      break;
  }

  return `  ${label.padEnd(12)} ${icon} ${text}`;
}

function printWorkflowSummary(targetAbs: string): string[] {
  const lines: string[] = [];

  let goalState = "missing";
  let planPhase = "missing";
  let approvalState = "required";
  let runState = "blocked";
  let verifyPhase = "blocked";
  let shipState = "blocked";
  const rememberState = "blocked";
  let nextCommand = "harness-start";
  let blockingReason = "GOAL.md is missing.";

  if (fs.existsSync(path.join(targetAbs, ".harness/GOAL.md"))) {
    goalState = "ready";
    nextCommand = "harness-plan";
    blockingReason = "PLAN.md is missing.";
  }

  const planStatus = doctorPlanStatus(targetAbs);
  switch (planStatus || "missing") {
    case "approved":
      planPhase = "approved";
      approvalState = "ready";
      runState = "ready";
      nextCommand = "harness-verify";
      blockingReason = "VERIFY.md evidence is missing or incomplete.";
      break;
    case "draft":
      planPhase = "draft";
      approvalState = "required";
      nextCommand = "harness-plan";
      blockingReason = "PLAN.md is not approved.";
      break;
    case "blocked":
      planPhase = "blocked";
      approvalState = "required";
      nextCommand = "harness-plan";
      blockingReason = "PLAN.md is blocked.";
      break;
    case "missing":
    case "":
      planPhase = "missing";
      break;
    default:
      planPhase = "draft";
      approvalState = "required";
      nextCommand = "harness-plan";
      blockingReason = `PLAN.md approval status is ${planStatus}.`;
      break;
  }

  const verifyStatus = doctorVerifyStatus(targetAbs);
  if (runState === "ready") {
    switch (verifyStatus || "missing") {
      case "passed":
        if (doctorVerifyHasConcreteTests(targetAbs) && doctorVerifyHasConcreteEvidence(targetAbs)) {
          verifyPhase = "passed";
          shipState = "ready";
          nextCommand = "harness-ship";
          blockingReason = "No blocker recorded. Shipping summary is the next step.";
        } else {
          verifyPhase = "blocked";
          nextCommand = "harness-verify";
          blockingReason = "VERIFY.md evidence is missing or incomplete.";
        }
        break;
      case "failed":
        verifyPhase = "failed";
        shipState = "blocked";
        nextCommand = "harness-verify";
        blockingReason = "VERIFY.md records failed checks.";
        break;
      case "blocked":
        verifyPhase = "blocked";
        shipState = "blocked";
        nextCommand = "harness-verify";
        blockingReason = "VERIFY.md is blocked pending more input or evidence.";
        break;
      case "partial":
        verifyPhase = "partial";
        shipState = "blocked";
        nextCommand = "harness-verify";
        blockingReason = "VERIFY.md is partial and cannot support shipping yet.";
        break;
      case "pending":
        verifyPhase = "blocked";
        shipState = "blocked";
        nextCommand = "harness-verify";
        blockingReason = "VERIFY.md is pending and verification evidence is not complete.";
        break;
      case "missing":
      case "":
        verifyPhase = "blocked";
        shipState = "blocked";
        nextCommand = "harness-verify";
        blockingReason = "VERIFY.md evidence is missing or incomplete.";
        break;
      default:
        verifyPhase = "blocked";
        shipState = "blocked";
        nextCommand = "harness-verify";
        blockingReason = `VERIFY.md status is ${verifyStatus}.`;
        break;
    }
  }

  lines.push("");
  lines.push("Harness workflow");
  lines.push("");
  lines.push(workflowPhaseLine("Goal", goalState));
  lines.push(workflowPhaseLine("Plan", planPhase));
  lines.push(workflowPhaseLine("Approval", approvalState));
  lines.push(workflowPhaseLine("Run", runState));
  lines.push(workflowPhaseLine("Verify", verifyPhase));
  lines.push(workflowPhaseLine("Ship", shipState));
  lines.push(workflowPhaseLine("Remember", rememberState));
  lines.push("");
  lines.push("Next allowed command:");
  lines.push(`  ${nextCommand}`);
  lines.push("");
  lines.push("Blocking reason:");
  lines.push(`  ${blockingReason}`);

  return lines;
}

/** Returns collected output as text without printing to stdout. */
export function runStatus(ctx: ReportContext): StatusResult {
  const { targetAbs } = ctx;
  const lines: string[] = [];

  reconcileDeferredPrivateIgnore({ targetAbs, dryRun: false });

  const detected = detectRuntimesFromTarget(targetAbs);
  const runtimeDisplay = detected.length > 0 ? detected.join(",") : "none";
  const gitRepo = isGitRepo(targetAbs) ? "yes" : "no";
  const excludeBlock = hasHarnessExcludeBlock(targetAbs) ? "yes" : "no";
  const manifestProviders = readInstalledCommandSurface(targetAbs)?.installedProviders || [];

  lines.push("ai-engineering-harness status");
  lines.push(`  target:                ${targetAbs}`);
  lines.push(`  git repo:              ${gitRepo}`);
  lines.push(`  provider binaries:     ${formatBinaryAvailability()}`);
  lines.push(`  detected runtimes:     ${runtimeDisplay}`);
  lines.push(
    `  .ai-harness exists:    ${fs.existsSync(path.join(targetAbs, ".ai-harness")) ? "yes" : "no"}`
  );
  lines.push(
    `  .harness exists:       ${fs.existsSync(path.join(targetAbs, ".harness")) ? "yes" : "no"}`
  );
  lines.push(`  exclude block exists:  ${excludeBlock}`);
  lines.push(`  command namespace:     harness`);
  lines.push(
    `  runtime-commands:      ${fs.existsSync(path.join(targetAbs, ".ai-harness/runtime-commands")) ? "yes" : "no"}`
  );
  lines.push(
    `  manifest.json:         ${fs.existsSync(path.join(targetAbs, ".ai-harness/manifest.json")) ? "yes" : "no"}`
  );
  lines.push(
    `  manifest providers:    ${manifestProviders.length > 0 ? manifestProviders.join(",") : "none"}`
  );

  const installedProviders = manifestProviders;
  const providerCmds =
    installedProviders.length > 0 ||
    fs.existsSync(path.join(targetAbs, ".cursor/commands")) ||
    fs.existsSync(path.join(targetAbs, ".claude/commands/harness-plan.md")) ||
    fs.existsSync(path.join(targetAbs, ".opencode/commands/harness-plan.md")) ||
    fs.existsSync(path.join(targetAbs, ".cursor/rules/ai-engineering-harness-commands.mdc"))
      ? "yes"
      : "no";
  lines.push(`  provider commands:     ${providerCmds}`);

  if (fs.existsSync(path.join(targetAbs, ".harness"))) {
    lines.push(...printWorkflowSummary(targetAbs));
  }

  try {
    const surfaceLines = formatStatusCommandLines(targetAbs);
    lines.push(...surfaceLines);
  } catch {
    // non-fatal
  }

  return { text: lines.join("\n") };
}

/** Returns collected output as text and ok flag without printing to stdout. */
export function runDoctor(ctx: ReportContext): DoctorResult {
  const { targetAbs } = ctx;
  const lines: string[] = [];
  let failCount = 0;

  reconcileDeferredPrivateIgnore({ targetAbs, dryRun: false });

  const detected = detectRuntimesFromTarget(targetAbs);
  const count = runtimeListCount(detected);

  lines.push("ai-engineering-harness doctor");

  lines.push("PASS node available");

  if (isGitRepo(targetAbs)) {
    lines.push("PASS target is a Git repo");
  } else {
    lines.push("WARN target is not a Git repo — .git/info/exclude will be applied after git init");
  }

  if (fs.existsSync(path.join(targetAbs, ".ai-harness"))) {
    lines.push("PASS .ai-harness exists");
  } else {
    lines.push("FAIL .ai-harness missing");
    failCount++;
  }

  if (fs.existsSync(path.join(targetAbs, ".harness"))) {
    lines.push("PASS .harness exists");
  } else {
    lines.push("FAIL .harness missing");
    failCount++;
  }

  if (count === 0) {
    lines.push("FAIL no runtime entrypoint detected");
    failCount++;
  } else {
    lines.push("PASS runtime entrypoint detected");
    for (const rt of detected) {
      if (rt.trim() === "") continue;
      if (runtimeReferencesCache(targetAbs, rt)) {
        lines.push(`PASS ${rt} entrypoint references .ai-harness/`);
      } else {
        lines.push(`FAIL ${rt} entrypoint does not reference .ai-harness/`);
        failCount++;
      }
    }
  }

  if (fs.existsSync(path.join(targetAbs, ".claude"))) {
    if (fs.existsSync(path.join(targetAbs, ".claude", "agents"))) {
      lines.push("PASS .claude/agents exists");
    } else {
      lines.push("FAIL .claude/agents missing");
      failCount++;
    }
    if (fs.existsSync(path.join(targetAbs, ".claude", "skills"))) {
      lines.push("PASS .claude/skills exists");
    } else {
      lines.push("FAIL .claude/skills missing");
      failCount++;
    }

    if (claudeSettingsReferenceHookCache(targetAbs)) {
      lines.push("PASS .claude/settings.json references .ai-harness/hooks/core");
    } else {
      lines.push("FAIL .claude/settings.json does not reference cached hook scripts");
      failCount++;
    }
  }

  if (fs.existsSync(path.join(targetAbs, ".codex"))) {
    if (fs.existsSync(path.join(targetAbs, ".codex", "hooks.json"))) {
      lines.push("PASS .codex/hooks.json exists");
    } else {
      lines.push("FAIL .codex/hooks.json missing");
      failCount++;
    }
    if (fs.existsSync(path.join(targetAbs, ".codex", "rules", "default.rules"))) {
      lines.push("PASS .codex/rules/default.rules exists");
    } else {
      lines.push("FAIL .codex/rules/default.rules missing");
      failCount++;
    }
    if (fs.existsSync(path.join(targetAbs, ".codex", "agents"))) {
      const agentsDir = path.join(targetAbs, ".codex", "agents");
      const agents = fs.readdirSync(agentsDir).filter((name) => name.endsWith(".toml"));
      if (agents.length > 0) {
        lines.push(`PASS .codex/agents exists (${agents.length} agents)`);
      } else {
        lines.push("FAIL .codex/agents exists but contains no .toml files");
        failCount++;
      }
    } else {
      lines.push("FAIL .codex/agents missing");
      failCount++;
    }
  }

  if (fs.existsSync(path.join(targetAbs, ".agents", "skills"))) {
    const skillsDir = path.join(targetAbs, ".agents", "skills");
    const entries = fs
      .readdirSync(skillsDir, { withFileTypes: true })
      .filter(
        (entry) =>
          entry.isDirectory() && fs.existsSync(path.join(skillsDir, entry.name, "SKILL.md"))
      );
    if (entries.length > 0) {
      lines.push(`PASS .agents/skills exists (${entries.length} skills)`);
    } else {
      lines.push("FAIL .agents/skills exists but contains no SKILL.md files");
      failCount++;
    }
  }

  if (hasHarnessExcludeBlock(targetAbs)) {
    lines.push("PASS .git/info/exclude harness block exists");
  } else {
    lines.push("WARN .git/info/exclude harness block missing");
  }

  if (fs.existsSync(path.join(targetAbs, ".ai-harness/runtime-commands"))) {
    lines.push("PASS .ai-harness/runtime-commands exists");
  } else {
    lines.push("FAIL .ai-harness/runtime-commands missing");
    failCount++;
  }

  if (fs.existsSync(path.join(targetAbs, ".ai-harness/activation.md"))) {
    lines.push("PASS .ai-harness/activation.md exists");
  } else {
    lines.push("FAIL .ai-harness/activation.md missing");
    failCount++;
  }

  if (readInstalledCommandSurface(targetAbs)) {
    lines.push("PASS .ai-harness/manifest.json readable");
  } else {
    lines.push("FAIL .ai-harness/manifest.json missing or unreadable");
    failCount++;
  }

  const planCatalog = path.join(targetAbs, ".ai-harness/runtime-commands/harness-plan.md");
  if (fs.existsSync(planCatalog)) {
    try {
      const planText = fs.readFileSync(planCatalog, "utf8");
      if (
        planText.includes(".ai-harness/activation.md") &&
        planText.includes(".ai-harness/commands/harness-plan.md")
      ) {
        lines.push("PASS harness-plan local catalog references activation and source command");
      } else {
        lines.push("FAIL harness-plan local catalog incomplete");
        failCount++;
      }
    } catch {
      lines.push("FAIL harness-plan local catalog incomplete");
      failCount++;
    }
  }

  // .harness-specific checks (workflow summary + plan/verify/memory)
  if (fs.existsSync(path.join(targetAbs, ".harness"))) {
    lines.push(...printWorkflowSummary(targetAbs));

    // plan status check
    const planStatus = doctorPlanStatus(targetAbs);
    switch (planStatus || "missing") {
      case "approved":
        lines.push("PASS .harness/PLAN.md approval status approved");
        break;
      case "draft":
      case "blocked":
        lines.push(`WARN .harness/PLAN.md approval status is ${planStatus}`);
        break;
      case "missing":
      case "":
        lines.push("WARN .harness/PLAN.md missing Approval Status block or status field");
        break;
      default:
        lines.push(`WARN .harness/PLAN.md approval status is ${planStatus}`);
        break;
    }

    // verify status check
    const verifyStatus = doctorVerifyStatus(targetAbs);
    switch (verifyStatus || "missing") {
      case "passed":
      case "failed":
      case "blocked":
      case "partial":
        if (doctorVerifyHasConcreteTests(targetAbs) && doctorVerifyHasConcreteEvidence(targetAbs)) {
          lines.push("PASS .harness/VERIFY.md contains verification evidence");
        } else {
          lines.push(
            "FAIL .harness/VERIFY.md claims completed verification without concrete evidence"
          );
          failCount++;
        }
        break;
      case "pending":
        if (doctorVerifyHasConcreteTests(targetAbs) || doctorVerifyHasConcreteEvidence(targetAbs)) {
          lines.push("WARN .harness/VERIFY.md status is pending despite recorded evidence");
        } else {
          lines.push(
            "WARN .harness/VERIFY.md status is pending and verification evidence is not recorded yet"
          );
        }
        break;
      case "missing":
      case "":
        if (fs.existsSync(path.join(targetAbs, ".harness/VERIFY.md"))) {
          lines.push("FAIL .harness/VERIFY.md status missing or invalid");
          failCount++;
        } else {
          lines.push("WARN .harness/VERIFY.md missing");
        }
        break;
      default:
        lines.push(`FAIL .harness/VERIFY.md status is ${verifyStatus} and is not recognized`);
        failCount++;
        break;
    }

    // typed memory artifacts check
    const memoryArtifacts = ["DECISIONS.md", "HAZARDS.md", "INDEX.md"];
    const missingMemory: string[] = [];
    for (const artifact of memoryArtifacts) {
      if (!fs.existsSync(path.join(targetAbs, ".harness", artifact))) {
        missingMemory.push(artifact);
      }
    }
    if (missingMemory.length > 0) {
      lines.push(`WARN typed memory artifacts missing: ${missingMemory.join(", ")}`);
    } else {
      lines.push("PASS typed memory artifacts present");
    }
  }

  try {
    const surfaceLines = formatDoctorCommandLines(targetAbs, detected);
    for (const line of surfaceLines) {
      lines.push(line);
      if (line.startsWith("FAIL")) {
        failCount++;
      }
    }
  } catch {
    // non-fatal
  }

  return { text: lines.join("\n"), ok: failCount === 0 };
}
