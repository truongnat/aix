import fs from "node:fs";
import path from "node:path";

interface RunContext {
  runId: string;
  runRoot: string;
  modeDir: (mode: string) => string;
}

function createRunContext(packRoot: string, taskId: string): RunContext {
  const runId = `${new Date().toISOString().replace(/[:.]/g, "-")}-${taskId}`;
  const runRoot = path.join(packRoot, "artifacts", "runs", runId);
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

export { createRunContext };
export type { RunContext };
