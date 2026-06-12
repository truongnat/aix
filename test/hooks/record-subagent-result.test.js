const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const { recordSubagentResult } = require("../../dist/hooks/core/record-subagent-result.js");

function makeTempRepo() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "aih-worker-memory-"));
  fs.mkdirSync(path.join(root, ".harness", "sessions"), { recursive: true });
  return root;
}

function makeSessionDir(root, sessionName) {
  const sessionDir = path.join(root, ".harness", "sessions", sessionName);
  fs.mkdirSync(sessionDir, { recursive: true });
  return sessionDir;
}

test("recordSubagentResult skips worker memory when the opt-in is disabled", () => {
  const root = makeTempRepo();
  const sessionDir = makeSessionDir(root, "2026-06-08-no-worker-memory");

  const result = recordSubagentResult({
    session: sessionDir,
    agent: "harness-reviewer",
    status: "completed",
    summary: "Condensed map complete",
  });

  assert.equal(result.ok, true);
  assert.equal(result.workerMemory, null);
  assert.equal(
    fs.existsSync(path.join(root, ".harness", "memory", "workers", "harness-reviewer.md")),
    false
  );
});

test("recordSubagentResult writes compact worker memory when enabled", () => {
  const root = makeTempRepo();
  const sessionDir = makeSessionDir(root, "2026-06-08-worker-memory");

  fs.mkdirSync(path.join(root, ".harness"), { recursive: true });
  fs.writeFileSync(
    path.join(root, ".harness", "config.json"),
    JSON.stringify(
      {
        workerMemory: {
          enabled: true,
          directory: ".harness/memory/workers",
        },
      },
      null,
      2
    )
  );

  const result = recordSubagentResult({
    session: sessionDir,
    agent: "harness-reviewer",
    status: "issues-found",
    summary: "Missing validator update for the new delta-spec template",
    "next-command": "harness-verify",
  });

  const memoryPath = path.join(root, ".harness", "memory", "workers", "harness-reviewer.md");
  const memory = fs.readFileSync(memoryPath, "utf8");

  assert.equal(result.ok, true);
  assert.equal(result.workerMemory, ".harness/memory/workers/harness-reviewer.md");
  assert.match(memory, /# Worker Memory: harness-reviewer/);
  assert.match(memory, /## Durable Notes/);
  assert.match(memory, /issues-found/);
  assert.match(memory, /Missing validator update for the new delta-spec template/);
});
