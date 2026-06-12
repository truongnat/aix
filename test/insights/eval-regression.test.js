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
    const normalized = String(request).replace(/\\/g, "/");
    if (
      request === "../evals" ||
      normalized.endsWith("lib/evals/index.js") ||
      normalized.endsWith("features/eval/index.js")
    ) {
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
    for (const key of Object.keys(require.cache)) {
      if (key.includes(`${path.sep}dist${path.sep}features${path.sep}insights${path.sep}`)) {
        delete require.cache[key];
      }
    }
    const { runRecommendedEvalRegression } = fresh(
      "dist/features/insights/application/run-eval-regression.js"
    );
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
