const { test } = require("node:test");
const assert = require("node:assert/strict");
const childProcess = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const { loadWalkthroughVideoConfig } = require(path.join(repoRoot, "lib", "walkthrough-video.js"));

test("no mp4 files are tracked in git", () => {
  const tracked = childProcess
    .execSync("git ls-files", { cwd: repoRoot, encoding: "utf8" })
    .split(/\r?\n/)
    .filter((line) => line.toLowerCase().endsWith(".mp4"));

  assert.deepEqual(tracked, [], `Tracked mp4 files must be empty, found: ${tracked.join(", ")}`);
});

test("walkthrough video config uses external GitHub release URL", () => {
  const config = loadWalkthroughVideoConfig(repoRoot);
  assert.match(config.url, /^https:\/\/github\.com\/[^/]+\/[^/]+\/releases\//);
  assert.equal(config.hosting, "github-release-asset");
  assert.equal(config.filename, "AI_Engineering_Harness.mp4");
});

test("README walkthrough link matches media/walkthrough-video.json", () => {
  const config = loadWalkthroughVideoConfig(repoRoot);
  const readme = fs.readFileSync(path.join(repoRoot, "README.md"), "utf8");
  assert.match(
    readme,
    new RegExp(
      `\\[${config.filename.replace(".", "\\.")}\\]\\(${config.url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\)`
    )
  );
});
