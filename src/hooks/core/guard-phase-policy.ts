#!/usr/bin/env node
// Purpose: Gate harness commands using policy engine with legacy fallback.
// Layer: infrastructure
// Depends on: ../shared/util

import * as fs from "node:fs";
import * as path from "node:path";
import {
  appendHarnessEvent,
  emitResult,
  exitFromResult,
  extractField,
  findHarnessRoot,
  parseCliArgs,
  printHelp,
  readText,
  resolveSessionDir,
} from "../shared/util";

/* eslint-disable @typescript-eslint/no-require-imports */

const SPEC = {
  command: { required: true },
  session: { required: true },
};

interface GuardResult {
  ok: boolean;
  status: string;
  command?: string;
  reason?: string;
  nextCommand?: string;
  questions?: string[];
  warnings?: string[];
  summary?: string;
  [key: string]: unknown;
}

interface PolicyAction {
  type: string;
  message?: string;
  nextCommand?: string;
  questions?: string[];
}

interface PolicyEngineModule {
  PolicyEngine: new (policyPath: string) => {
    shouldBlock(context: unknown): {
      blocked: boolean;
      reason: string;
      actions: PolicyAction[];
    };
  };
}

function hasSubstantiveSection(content: string, heading: string): boolean {
  const index = content.indexOf(heading);
  if (index === -1) {
    return false;
  }
  const rest = content.slice(index + heading.length);
  const next = rest.search(/\n## /);
  const body = (next === -1 ? rest : rest.slice(0, next)).trim();
  return body.replace(/[-*]\s*\[\s*\]/g, "").replace(/\s+/g, " ").length > 12;
}

function planApproved(
  sessionDir: string,
  stateContent: string
): { ok: boolean; reason?: string; nextCommand?: string; questions?: string[] } {
  const planName = extractField(stateContent, "current_plan") || "PLAN-001.md";
  const planPath = path.join(sessionDir, planName);
  if (!fs.existsSync(planPath)) {
    return {
      ok: false,
      reason: `${planName} is missing.`,
      nextCommand: "harness-plan",
      questions: ["Which plan should be approved before implementation?"],
    };
  }
  const planContent = readText(planPath);
  if (!/status:\s*approved/i.test(planContent)) {
    return {
      ok: false,
      reason: `${planName} is not approved.`,
      nextCommand: "harness-plan",
      questions: ["Do you approve the current plan for implementation?"],
    };
  }
  return { ok: true };
}

function hasImplementationEvidence(sessionDir: string): boolean {
  const tasksPath = path.join(sessionDir, "TASKS.md");
  if (fs.existsSync(tasksPath)) {
    const tasks = readText(tasksPath);
    if (/## Completed Tasks[\s\S]+[-*]\s+\S/.test(tasks)) {
      return true;
    }
  }
  const toolRunsDir = path.join(sessionDir, "artifacts", "tool-runs");
  if (
    fs.existsSync(toolRunsDir) &&
    fs.readdirSync(toolRunsDir).some((name) => name.endsWith(".md"))
  ) {
    return true;
  }
  return false;
}

function verifyReady(
  sessionDir: string
): { ok: boolean; reason?: string; nextCommand?: string; questions?: string[] } {
  const verifyPath = path.join(sessionDir, "VERIFY.md");
  if (!fs.existsSync(verifyPath)) {
    return {
      ok: false,
      reason: "VERIFY.md is missing.",
      nextCommand: "harness-verify",
      questions: ["Which verification commands should prove the current claim?"],
    };
  }
  const verify = readText(verifyPath);
  const statusMatch = verify.match(/status:\s*(\S+)/i);
  const status = statusMatch ? statusMatch[1].toLowerCase() : "";
  if (!status || /pending|blocked/i.test(status)) {
    return {
      ok: false,
      reason: "VERIFY.md status is pending or blocked.",
      nextCommand: "harness-verify",
      questions: ["What verification evidence is still missing?"],
    };
  }
  if (
    !hasSubstantiveSection(verify, "## Tests Run") &&
    !hasSubstantiveSection(verify, "## Evidence")
  ) {
    return {
      ok: false,
      reason: "VERIFY.md lacks tests run or evidence.",
      nextCommand: "harness-verify",
      questions: ["Which checks were run and what evidence supports the status?"],
    };
  }
  return { ok: true };
}

function buildExecutionContext(sessionDir: string, repoRoot: string, command: string): unknown {
  const statePath = path.join(repoRoot, ".harness", "STATE.md");
  const state: Record<string, string | null> = {};

  if (fs.existsSync(statePath)) {
    const stateContent = readText(statePath);

    const planName = extractField(stateContent, "current_plan") || "PLAN-001.md";
    const planPath = path.join(sessionDir, planName);
    if (fs.existsSync(planPath)) {
      const planContent = readText(planPath);
      state.current_plan = /status:\s*approved/i.test(planContent) ? "approved" : "pending";
    }

    const verifyPath = path.join(sessionDir, "VERIFY.md");
    if (fs.existsSync(verifyPath)) {
      const verify = readText(verifyPath);
      const statusMatch = verify.match(/status:\s*(\S+)/i);
      const status = statusMatch ? statusMatch[1].toLowerCase() : "";
      state.verify = /approved|passed/i.test(status) ? "approved" : status;
    }

    state.implementation_evidence = hasImplementationEvidence(sessionDir) ? "exists" : null;
  }

  return { command, sessionDir, repoRoot, state };
}

function readyWithPolicyWarnings(command: string, actions: PolicyAction[]): GuardResult | null {
  const warnings = actions
    .filter((action) => action.type === "warn")
    .map((action) => action.message)
    .filter((m): m is string => Boolean(m));

  if (warnings.length === 0) {
    return null;
  }

  return {
    ok: true,
    status: "ready",
    command,
    nextCommand: command,
    warnings,
    summary: `ready with warnings: ${warnings.join("; ")}`,
  };
}

export function guardPhase(options: { command: string; session: string }): GuardResult {
  const sessionDir = resolveSessionDir(options.session);
  const repoRoot = findHarnessRoot(sessionDir);
  const statePath = path.join(repoRoot, ".harness", "STATE.md");

  if (!fs.existsSync(statePath)) {
    return {
      ok: false,
      status: "blocked",
      command: options.command,
      reason: ".harness/STATE.md is missing.",
      nextCommand: "harness-start",
      questions: ["Which session should be active before continuing?"],
    };
  }

  const stateContent = readText(statePath);
  const command = options.command;

  const policyPath = path.join(repoRoot, ".harness", "policies.json");
  if (fs.existsSync(policyPath)) {
    try {
      const { PolicyEngine } = require("../../features/validate/infrastructure/policy/engine.js") as PolicyEngineModule;
      const engine = new PolicyEngine(policyPath);
      const context = buildExecutionContext(sessionDir, repoRoot, command);
      const { blocked, reason, actions } = engine.shouldBlock(context);

      if (blocked) {
        const action = actions[0];
        return {
          ok: false,
          status: "blocked",
          command,
          reason,
          nextCommand: action.nextCommand || command,
          questions: action.questions || [],
        };
      }

      const readyResult = readyWithPolicyWarnings(command, actions);
      if (readyResult) {
        return readyResult;
      }
    } catch (error) {
      console.error(`Policy engine error: ${(error as Error).message}. Falling back to legacy logic.`);
    }
  }

  if (command === "harness-run") {
    const plan = planApproved(sessionDir, stateContent);
    if (!plan.ok) {
      return { ok: false, status: "blocked", command, reason: plan.reason, nextCommand: plan.nextCommand, questions: plan.questions };
    }
  }

  if (command === "harness-verify") {
    const plan = planApproved(sessionDir, stateContent);
    if (!plan.ok) {
      return { ok: false, status: "blocked", command, reason: plan.reason, nextCommand: plan.nextCommand, questions: plan.questions };
    }
    if (!hasImplementationEvidence(sessionDir)) {
      return {
        ok: false,
        status: "blocked",
        command,
        reason: "No implementation evidence or completed tasks found for verification.",
        nextCommand: "harness-run",
        questions: ["What implementation work should be verified?"],
      };
    }
  }

  if (command === "harness-ship") {
    const verify = verifyReady(sessionDir);
    if (!verify.ok) {
      return { ok: false, status: "blocked", command, reason: verify.reason, nextCommand: verify.nextCommand, questions: verify.questions };
    }
  }

  return {
    ok: true,
    status: "ready",
    command,
    nextCommand: command,
  };
}

function main(): void {
  try {
    const options = parseCliArgs(process.argv.slice(2), SPEC);
    if (options.help) {
      printHelp("guard-phase-policy.js", [
        "Usage:",
        "  node hooks/core/guard-phase-policy.js --command harness-run --session .harness/sessions/<id> [--json]",
        "",
        "Checks:",
        "  harness-run    → approved plan required",
        "  harness-verify → implementation evidence required",
        "  harness-ship   → VERIFY.md with explicit status and evidence required",
        "",
        "Uses policy engine from .harness/policies.json if available.",
        "Falls back to legacy logic if policy engine fails.",
        "",
        "Exit code 0 when ready, 1 when blocked.",
      ]);
      return;
    }
    const sessionDir = resolveSessionDir(options.session as string);
    const result = guardPhase(options as unknown as { command: string; session: string });
    try {
      appendHarnessEvent(findHarnessRoot(sessionDir), {
        type: "guard-phase",
        command: result.command,
        status: result.status,
        ok: result.ok,
        reason: result.reason || null,
        next_command: result.nextCommand || null,
        warnings: result.warnings || [],
      });
    } catch {
      // Event logging is best-effort when harness root cannot be resolved.
    }
    emitResult(result, options.json as boolean);
    exitFromResult(result);
  } catch (error) {
    const result = { ok: false, status: "failed", reason: (error as Error).message };
    emitResult(result, process.argv.includes("--json"));
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
