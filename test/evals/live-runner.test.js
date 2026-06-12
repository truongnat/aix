const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..", "..");
const { runLiveProviderCommand } = require(
  path.join(repoRoot, "dist", "features", "eval", "infrastructure", "live-runner.js")
);

test("runLiveProviderCommand honors timeoutMs overrides", () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "aih-live-timeout-"));
  try {
    const workspace = { root: tmpRoot, cwd: tmpRoot };
    const providerScript = path.join(tmpRoot, "slow-provider.js");
    fs.writeFileSync(
      providerScript,
      "const start = Date.now(); while (Date.now() - start < 200) {}",
      "utf8"
    );

    const result = runLiveProviderCommand({
      packRoot: repoRoot,
      task: { id: "slow-task", title: "Slow task", goal: "Wait", prompt: "Wait" },
      mode: "with-harness",
      provider: "codex",
      providerCommand: `${JSON.stringify(process.execPath)} ${JSON.stringify(providerScript)}`,
      workspace,
      timeoutMs: 10,
    });

    assert.equal(result.exitCode, 127);
    assert.match(result.stderr, /ETIMEDOUT|timed out/i);
  } finally {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  }
});
