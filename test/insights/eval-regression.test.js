const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const Module = require("node:module");
const os = require("node:os");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..", "..");

function fresh(modulePath) {
  const resolved = require.resolve(path.join(repoRoot, modulePath));
  delete require.cache[resolved];
  return require(resolved);
}

test("runRecommendedEvalRegression executes recommended tasks and writes a report", async () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "aih-eval-regression-"));
  const eventsDir = path.join(tempRoot, ".harness", "history");
  fs.mkdirSync(eventsDir, { recursive: true });
  fs.writeFileSync(
    path.join(eventsDir, "events.jsonl"),
    '{"type":"guard-phase","command":"harness-verify","ok":false}\n',
    "utf8"
  );

  const originalLoad = Module._load;
  const calls = [];

  Module._load = function patchedLoader(request, parent, isMain) {
    if (request === "../evals" || request.endsWith("lib/evals/index.js")) {
      return {
        runTask: async (_packRoot, taskId) => {
          calls.push(taskId);
          return {
            summaryPath: path.join(tempRoot, `${taskId}.summary.json`),
            exitCode: 0,
          };
        },
      };
    }
    return originalLoad.call(this, request, parent, isMain);
  };

  try {
    const { runRecommendedEvalRegression } = fresh("dist/lib/insights/eval-regression.js");
    const result = await runRecommendedEvalRegression(repoRoot, tempRoot, {
      provider: "codex",
    });

    assert.ok(result.reportPath);
    assert.ok(fs.existsSync(result.reportPath));
    assert.ok(calls.includes("sample-verify-md"));
    assert.ok(calls.includes("sample-response-contract"));

    const report = JSON.parse(fs.readFileSync(result.reportPath, "utf8"));
    assert.equal(report.schema, "harness-telemetry-eval-regression-v1");
    assert.equal(report.runs.length, calls.length);
    assert.equal(report.recommendations.length, calls.length);
  } finally {
    Module._load = originalLoad;
  }
});
