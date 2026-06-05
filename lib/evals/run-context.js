"use strict";

const fs = require("node:fs");
const path = require("node:path");

function createRunContext(packRoot, taskId) {
  const runId = `${new Date().toISOString().replace(/[:.]/g, "-")}-${taskId}`;
  const runRoot = path.join(packRoot, "artifacts", "runs", runId);
  fs.mkdirSync(runRoot, { recursive: true });
  return {
    runId,
    runRoot,
    modeDir(mode) {
      const dir = path.join(runRoot, mode);
      fs.mkdirSync(dir, { recursive: true });
      return dir;
    },
  };
}

module.exports = {
  createRunContext,
};
