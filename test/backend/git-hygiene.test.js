const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const {
  applyPrivateIgnore,
  removeIgnoreBlock,
  collectIgnorePaths,
} = require("../../dist/lib/backend/git-hygiene.js");

function tmpGitRepo() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "gh-"));
  fs.mkdirSync(path.join(dir, ".git", "info"), { recursive: true });
  return dir;
}

test("applyPrivateIgnore writes a delimited harness block into .git/info/exclude", () => {
  const dir = tmpGitRepo();
  applyPrivateIgnore({
    targetAbs: dir,
    provider: "claude",
    initHarness: true,
    installCache: true,
    scope: "project",
    visibility: "private",
    dryRun: false,
  });
  const content = fs.readFileSync(path.join(dir, ".git", "info", "exclude"), "utf8");
  assert.match(content, /# ai-engineering-harness start/);
  assert.match(content, /# ai-engineering-harness end/);
  assert.match(content, /\.harness\//);
  assert.match(content, /\.claude\/CLAUDE\.md/);
  assert.match(content, /\.ai-harness\//);
});

test("applyPrivateIgnore is idempotent (re-run replaces the block, no duplicates)", () => {
  const dir = tmpGitRepo();
  const opts = {
    targetAbs: dir,
    provider: "claude",
    initHarness: true,
    installCache: false,
    scope: "project",
    visibility: "private",
    dryRun: false,
  };
  applyPrivateIgnore(opts);
  applyPrivateIgnore(opts);
  const content = fs.readFileSync(path.join(dir, ".git", "info", "exclude"), "utf8");
  assert.equal((content.match(/# ai-engineering-harness start/g) || []).length, 1);
});

test("removeIgnoreBlock strips the harness block but keeps other lines", () => {
  const dir = tmpGitRepo();
  const excl = path.join(dir, ".git", "info", "exclude");
  fs.writeFileSync(
    excl,
    "node_modules/\n# ai-engineering-harness start\n.harness/\n# ai-engineering-harness end\n"
  );
  removeIgnoreBlock({ targetAbs: dir, dryRun: false });
  const content = fs.readFileSync(excl, "utf8");
  assert.match(content, /node_modules\//);
  assert.doesNotMatch(content, /ai-engineering-harness/);
});

test("dryRun never mutates the exclude file", () => {
  const dir = tmpGitRepo();
  applyPrivateIgnore({
    targetAbs: dir,
    provider: "cursor",
    initHarness: true,
    installCache: false,
    scope: "project",
    visibility: "private",
    dryRun: true,
  });
  assert.equal(fs.existsSync(path.join(dir, ".git", "info", "exclude")), false);
});

test("collectIgnorePaths dedupes and includes .ai-harness when installCache", () => {
  const paths = collectIgnorePaths({
    targetAbs: "/x",
    provider: "claude",
    initHarness: true,
    installCache: true,
    scope: "project",
    visibility: "private",
    dryRun: false,
  });
  assert.ok(paths.includes(".ai-harness/"));
  assert.equal(new Set(paths).size, paths.length); // no dupes
});
