const { test } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");

function fresh(modulePath) {
  const resolved = require.resolve(path.join(repoRoot, modulePath));
  delete require.cache[resolved];
  return require(resolved);
}

test("main routes eval list through the eval command module", async () => {
  const calls = [];
  const originalLoad = require("node:module").Module._load;

  require("node:module").Module._load = function patchedLoader(request, parent, isMain) {
    if (request.includes("features/eval/presentation/eval-command")) {
      return {
        runEvalCommand: async (_packRoot, options) => {
          calls.push(options);
          return 0;
        },
      };
    }
    return originalLoad.call(this, request, parent, isMain);
  };

  try {
    const { main } = fresh("dist/cli/main.js");
    const code = await main(
      ["node", "aih.js", "eval", "list"],
      path.join(repoRoot, "bin", "aih.js")
    );
    assert.equal(code, 0);
    assert.equal(calls[0].evalCommand, "list");
  } finally {
    require("node:module").Module._load = originalLoad;
  }
});

test("runEvalCommand lists registry tasks and returns exit code 0", async () => {
  const { runEvalCommand } = fresh("dist/features/eval/presentation/eval-command.js");
  let output = "";
  const originalWrite = process.stdout.write;
  process.stdout.write = (chunk) => {
    output += chunk;
    return true;
  };

  try {
    const status = await runEvalCommand(repoRoot, {
      evalCommand: "list",
      evalTarget: "",
      target: repoRoot,
      providers: [],
      verbose: false,
    });
    assert.equal(status, 0);
    assert.match(output, /sample-bugfix/);
    assert.match(output, /example-health-report/);
  } finally {
    process.stdout.write = originalWrite;
  }
});

test("runEvalCommand runs sample-bugfix and prints summary path", async () => {
  const { runEvalCommand } = fresh("dist/features/eval/presentation/eval-command.js");
  let output = "";
  const originalWrite = process.stdout.write;
  process.stdout.write = (chunk) => {
    output += chunk;
    return true;
  };

  try {
    const status = await runEvalCommand(repoRoot, {
      evalCommand: "run",
      evalTarget: "sample-bugfix",
      target: repoRoot,
      providers: ["codex"],
      verbose: false,
    });
    assert.equal(status, 0);
    assert.match(output, /artifacts[\\/]+runs[\\/]+.*summary\.json/);
  } finally {
    process.stdout.write = originalWrite;
  }
});
