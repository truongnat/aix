const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..", "..");
const { judgeWithLlmFallback, runDeterministicRubric } = require(
  path.join(repoRoot, "lib", "evals", "llm-judge.js")
);

test("runDeterministicRubric evaluates response-contract behavior checks", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "aih-rubric-"));
  fs.writeFileSync(path.join(tempRoot, "final-response.txt"), "Status: complete\n");

  const rubric = {
    id: "response-contract-v1",
    behaviorChecks: [{ type: "file-contains", path: "final-response.txt", pattern: "Status:" }],
  };

  const result = runDeterministicRubric(tempRoot, rubric);
  assert.equal(result.mode, "deterministic");
  assert.equal(result.passed, true);
  assert.equal(result.checks.length, 1);
});

test("judgeWithLlmFallback uses deterministic rubric when LLM endpoint unset", async () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "aih-judge-"));
  fs.writeFileSync(path.join(tempRoot, "final-response.txt"), "Status: ok\n");

  const result = await judgeWithLlmFallback(
    repoRoot,
    tempRoot,
    {
      rubric: "evals/rubrics/response-contract-v1.json",
    },
    { useLlmJudge: true }
  );

  assert.equal(result.mode, "deterministic");
  assert.equal(result.passed, true);
  assert.equal(result.llm.attempted, false);
});
