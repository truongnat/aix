// Purpose: Resolve eval artifact paths and run context
// Layer: infrastructure
// Depends on: domain

import fs from "node:fs";
import path from "node:path";

interface RunContext {
  runId: string;
  runRoot: string;
  modeDir: (mode: string) => string;
}

function resolveArtifactsBase(packRoot: string): string {
  return process.env.AIH_EVAL_ARTIFACTS_DIR
    ? path.resolve(process.env.AIH_EVAL_ARTIFACTS_DIR)
    : path.join(packRoot, "artifacts");
}

function createRunContext(packRoot: string, taskId: string): RunContext {
  const safeTaskId = taskId.replace(/[/\\:*?"<>|]/g, "-");
  const runId = `${new Date().toISOString().replace(/[:.]/g, "-")}-${safeTaskId}`;
  const runRoot = path.join(resolveArtifactsBase(packRoot), "runs", runId);
  fs.mkdirSync(runRoot, { recursive: true });
  return {
    runId,
    runRoot,
    modeDir(mode: string) {
      const dir = path.join(runRoot, mode);
      fs.mkdirSync(dir, { recursive: true });
      return dir;
    },
  };
}

export { createRunContext, resolveArtifactsBase };
export type { RunContext };
