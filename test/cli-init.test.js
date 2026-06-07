const { test } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");

function fresh(modulePath) {
  const resolved = require.resolve(path.join(repoRoot, modulePath));
  delete require.cache[resolved];
  return require(resolved);
}

test("parseArgv recognizes init command", () => {
  const cliArgs = fresh("dist/lib/cli-args.js");
  const opts = cliArgs.parseArgv(["node", "aih.js", "init", "--provider", "cursor", "--yes"]);
  assert.equal(opts.command, "init");
  assert.deepEqual(opts.providers, ["cursor"]);
  assert.equal(opts.yes, true);
});

test("parseArgv recognizes --skip-demo-eval", () => {
  const cliArgs = fresh("dist/lib/cli-args.js");
  const opts = cliArgs.parseArgv(["node", "aih.js", "init", "--skip-demo-eval", "--yes"]);
  assert.equal(opts.command, "init");
  assert.equal(opts.skipDemoEval, true);
});

test("renderHelp includes init quickstart", () => {
  const { renderHelp } = fresh("dist/lib/cli-help.js");
  const help = renderHelp();
  assert.match(help, /ai-engineering-harness init/);
});
