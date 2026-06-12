// Purpose: Optional LLM judge fallback for eval checks
// Layer: infrastructure
// Depends on: domain

import fs from "node:fs";
import path from "node:path";
import { runSingleCheck, Check, CheckResult } from "../domain/checks";

interface Rubric {
  id?: string;
  behaviorChecks?: Check[];
}

interface Task {
  id: string;
  rubric?: string;
}

interface LlmJudgeResponse {
  passed?: boolean;
  score?: number | null;
  reason?: string;
}

interface JudgeResult {
  mode: string;
  rubricId?: string;
  checks: CheckResult[];
  passed: boolean;
  llm?: {
    attempted: boolean;
    reason?: string;
    passed?: boolean;
    score?: number | null;
  };
}

const DEFAULT_LLM_JUDGE_TIMEOUT_MS = 30_000;

function loadRubric(packRoot: string, rubricPath: string | undefined): Rubric | null {
  if (!rubricPath) {
    return null;
  }
  const resolved = path.isAbsolute(rubricPath) ? rubricPath : path.join(packRoot, rubricPath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`Rubric not found: ${rubricPath}`);
  }
  try {
    return JSON.parse(fs.readFileSync(resolved, "utf8"));
  } catch {
    throw new Error(`Failed to parse rubric as JSON: ${rubricPath}`);
  }
}

function readJudgeContent(cwd: string): string {
  const responsePath = path.join(cwd, "final-response.txt");
  if (fs.existsSync(responsePath)) {
    return fs.readFileSync(responsePath, "utf8");
  }
  return "";
}

function runDeterministicRubric(cwd: string, rubric: Rubric | null): JudgeResult {
  if (!rubric) {
    return { mode: "none", checks: [], passed: true };
  }

  const checks = (rubric.behaviorChecks || []).map((check) => runSingleCheck(cwd, check));
  const passed = checks.every((check) => check.passed);
  return {
    mode: "deterministic",
    rubricId: rubric.id,
    checks,
    passed,
  };
}

async function callLlmJudge(
  endpoint: string,
  payload: Record<string, unknown>,
  timeoutMs: number = DEFAULT_LLM_JUDGE_TIMEOUT_MS
): Promise<LlmJudgeResponse> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } catch (error) {
    if ((error as Error).name === "AbortError") {
      throw new Error(`LLM judge request timed out after ${timeoutMs}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`LLM judge request failed (${response.status}): ${body}`);
  }

  return response.json() as Promise<LlmJudgeResponse>;
}

interface JudgeOptions {
  useLlmJudge?: boolean;
  llmJudgeTimeoutMs?: number;
}

async function judgeWithLlmFallback(
  packRoot: string,
  cwd: string,
  task: Task,
  options: JudgeOptions = {}
): Promise<JudgeResult> {
  const rubric = loadRubric(packRoot, task.rubric);
  const deterministic = runDeterministicRubric(cwd, rubric);
  const endpoint = process.env.EVAL_JUDGE_ENDPOINT;
  const useLlm = options.useLlmJudge !== false && Boolean(endpoint);

  if (!useLlm) {
    return {
      ...deterministic,
      llm: { attempted: false, reason: "EVAL_JUDGE_ENDPOINT unset or useLlmJudge disabled" },
    };
  }

  try {
    const llmResult = await callLlmJudge(
      endpoint!,
      {
        taskId: task.id,
        rubricId: deterministic.rubricId ?? "",
        content: readJudgeContent(cwd),
        deterministicPassed: deterministic.passed,
      },
      options.llmJudgeTimeoutMs
    );
    const passed = typeof llmResult.passed === "boolean" ? llmResult.passed : deterministic.passed;
    return {
      ...deterministic,
      passed,
      llm: {
        attempted: true,
        passed,
        score: llmResult.score ?? null,
        reason: llmResult.reason || "LLM judge response",
      },
    };
  } catch (error) {
    return {
      ...deterministic,
      llm: {
        attempted: true,
        passed: deterministic.passed,
        reason: `LLM judge fallback: ${(error as Error).message}`,
      },
    };
  }
}

export {
  DEFAULT_LLM_JUDGE_TIMEOUT_MS,
  judgeWithLlmFallback,
  loadRubric,
  runDeterministicRubric,
  callLlmJudge,
};
export type { Rubric, Task, JudgeResult, JudgeOptions };
