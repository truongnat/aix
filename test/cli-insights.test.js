const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");

function fresh(modulePath) {
  const resolved = require.resolve(path.join(repoRoot, modulePath));
  delete require.cache[resolved];
  return require(resolved);
}

test("runInsightsCommand prints summary for target events file", async () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "aih-cli-insights-"));
  const eventsDir = path.join(tempRoot, ".harness", "history");
  fs.mkdirSync(eventsDir, { recursive: true });
  fs.writeFileSync(
    path.join(eventsDir, "events.jsonl"),
    '{"type":"skill-run","skill":"code-review","status":"completed"}\n',
    "utf8"
  );

  const { runInsightsCommand } = fresh("dist/cli/commands/insights.js");
  let output = "";
  const originalWrite = process.stdout.write;
  process.stdout.write = (chunk) => {
    output += chunk;
    return true;
  };

  try {
    const status = await runInsightsCommand(repoRoot, { target: tempRoot, json: false });
    assert.equal(status, 0);
    assert.match(output, /code-review: 1/);
  } finally {
    process.stdout.write = originalWrite;
  }
});

test("parseArgv recognizes insights command and --json flag", () => {
  const cliArgs = fresh("dist/cli/args.js");
  const opts = cliArgs.parseArgv(["node", "aih.js", "insights", "--target", ".", "--json"]);
  assert.equal(opts.command, "insights");
  assert.equal(opts.target, ".");
  assert.equal(opts.json, true);
});

test("parseArgv recognizes insights --recommend-evals and --upload", () => {
  const cliArgs = fresh("dist/cli/args.js");
  const opts = cliArgs.parseArgv([
    "node",
    "aih.js",
    "insights",
    "--target",
    ".",
    "--recommend-evals",
    "--upload",
  ]);
  assert.equal(opts.recommendEvals, true);
  assert.equal(opts.upload, true);
});

test("parseArgv recognizes insights --run-recommended-evals", () => {
  const cliArgs = fresh("dist/cli/args.js");
  const opts = cliArgs.parseArgv([
    "node",
    "aih.js",
    "insights",
    "--target",
    ".",
    "--recommend-evals",
    "--run-recommended-evals",
  ]);
  assert.equal(opts.recommendEvals, true);
  assert.equal(opts.runRecommendedEvals, true);
});

test("runInsightsCommand --export emits anonymized aggregate JSON", async () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "aih-cli-export-"));
  const eventsDir = path.join(tempRoot, ".harness", "history");
  fs.mkdirSync(eventsDir, { recursive: true });
  fs.writeFileSync(
    path.join(eventsDir, "events.jsonl"),
    '{"type":"tool-run","command":"npm test","exit_code":0}\n',
    "utf8"
  );

  const { runInsightsCommand } = fresh("dist/cli/commands/insights.js");
  let output = "";
  const originalWrite = process.stdout.write;
  process.stdout.write = (chunk) => {
    output += chunk;
    return true;
  };

  try {
    const status = await runInsightsCommand(repoRoot, { target: tempRoot, export: true });
    assert.equal(status, 0);
    const payload = JSON.parse(output);
    assert.equal(payload.schema, "harness-insights-export-v1");
    assert.equal(payload.aggregate.tools[0].command, "npm test");
  } finally {
    process.stdout.write = originalWrite;
  }
});

test("runInsightsCommand --recommend-evals --run-recommended-evals emits regression summary", async () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "aih-cli-recommend-run-"));
  const eventsDir = path.join(tempRoot, ".harness", "history");
  fs.mkdirSync(eventsDir, { recursive: true });
  fs.writeFileSync(
    path.join(eventsDir, "events.jsonl"),
    '{"type":"guard-phase","command":"harness-verify","ok":false}\n',
    "utf8"
  );

  const { runInsightsCommand } = fresh("dist/cli/commands/insights.js");
  let output = "";
  const originalWrite = process.stdout.write;
  process.stdout.write = (chunk) => {
    output += chunk;
    return true;
  };

  try {
    const status = await runInsightsCommand(repoRoot, {
      target: tempRoot,
      recommendEvals: true,
      runRecommendedEvals: true,
      providers: [],
      verbose: false,
      useLlmJudge: false,
      liveProviderCommand: "",
    });
    assert.equal(status, 0);
    assert.match(output, /Executed [0-9]+ recommended eval\(s\)/);
    assert.match(output, /sample-verify-md/);
  } finally {
    process.stdout.write = originalWrite;
  }
});

test("runInsightsCommand --upload --json returns failure payload when upload is skipped", async () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "aih-cli-upload-json-"));
  let output = "";
  const originalWrite = process.stdout.write;
  process.stdout.write = (chunk) => {
    output += chunk;
    return true;
  };

  try {
    const { runInsightsCommand } = fresh("dist/cli/commands/insights.js");
    const status = await runInsightsCommand(repoRoot, {
      target: tempRoot,
      upload: true,
      json: true,
      forceUpload: false,
    });
    assert.equal(status, 1);
    const payload = JSON.parse(output);
    assert.equal(payload.uploaded, false);
    assert.equal(typeof payload.reason, "string");
  } finally {
    process.stdout.write = originalWrite;
  }
});
