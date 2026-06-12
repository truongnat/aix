const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const {
  applyPrivateIgnore,
  removeIgnoreBlock,
  collectIgnorePaths,
  reconcileDeferredPrivateIgnore,
} = require("../../dist/shared/install-kernel/git-hygiene.js");

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

test("applyPrivateIgnore skips when ignoreStrategy is not info-exclude", () => {
  const dir = tmpGitRepo();
  const res = applyPrivateIgnore({
    targetAbs: dir,
    provider: "claude",
    initHarness: true,
    installCache: false,
    scope: "project",
    visibility: "private",
    dryRun: false,
    ignoreStrategy: "none",
  });
  assert.equal(res.action, "skip");
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

test("applyPrivateIgnore appends block to an existing exclude file without a block", () => {
  const dir = tmpGitRepo();
  const excl = path.join(dir, ".git", "info", "exclude");
  fs.writeFileSync(excl, "node_modules/\nbuild/\n");
  applyPrivateIgnore({
    targetAbs: dir,
    provider: "claude",
    initHarness: true,
    installCache: false,
    scope: "project",
    visibility: "private",
    dryRun: false,
  });
  const content = fs.readFileSync(excl, "utf8");
  assert.match(content, /^node_modules\/\nbuild\/\n/); // original preserved at top
  assert.match(content, /# ai-engineering-harness start/);
  assert.ok(content.endsWith("\n"));
});

test("applyPrivateIgnore skips when scope is not project or visibility is not private", () => {
  const dir = tmpGitRepo();
  const r1 = applyPrivateIgnore({
    targetAbs: dir,
    provider: "claude",
    initHarness: true,
    installCache: false,
    scope: "global",
    visibility: "private",
    dryRun: false,
  });
  assert.equal(r1.action, "skip");
  const r2 = applyPrivateIgnore({
    targetAbs: dir,
    provider: "claude",
    initHarness: true,
    installCache: false,
    scope: "project",
    visibility: "shared",
    dryRun: false,
  });
  assert.equal(r2.action, "skip");
  assert.equal(fs.existsSync(path.join(dir, ".git", "info", "exclude")), false);
});

test("removeIgnoreBlock skips when file absent or has no harness block", () => {
  const dir = tmpGitRepo();
  assert.equal(removeIgnoreBlock({ targetAbs: dir, dryRun: false }).action, "skip");
  const excl = path.join(dir, ".git", "info", "exclude");
  fs.writeFileSync(excl, "node_modules/\n");
  assert.equal(removeIgnoreBlock({ targetAbs: dir, dryRun: false }).action, "skip");
  assert.equal(fs.readFileSync(excl, "utf8"), "node_modules/\n"); // untouched
});

test("removeIgnoreBlock dryRun reports update without mutating", () => {
  const dir = tmpGitRepo();
  const excl = path.join(dir, ".git", "info", "exclude");
  const before = "x/\n# ai-engineering-harness start\n.harness/\n# ai-engineering-harness end\n";
  fs.writeFileSync(excl, before);
  const r = removeIgnoreBlock({ targetAbs: dir, dryRun: true });
  assert.equal(r.action, "update");
  assert.equal(fs.readFileSync(excl, "utf8"), before); // unchanged
});

test("applyPrivateIgnore resolves git worktree metadata files", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "gh-worktree-"));
  const actualGitDir = path.join(dir, "repo-meta", "worktrees", "feature");
  fs.mkdirSync(path.join(actualGitDir, "info"), { recursive: true });
  fs.writeFileSync(path.join(dir, ".git"), `gitdir: ${path.relative(dir, actualGitDir)}\n`, "utf8");

  applyPrivateIgnore({
    targetAbs: dir,
    provider: "claude",
    initHarness: true,
    installCache: false,
    scope: "project",
    visibility: "private",
    dryRun: false,
  });

  const content = fs.readFileSync(path.join(actualGitDir, "info", "exclude"), "utf8");
  assert.match(content, /# ai-engineering-harness start/);
  assert.match(content, /\.claude\/CLAUDE\.md/);
});

test("applyPrivateIgnore prepares .git/info/exclude before git init", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "gh-non-git-"));
  const result = applyPrivateIgnore({
    targetAbs: dir,
    provider: "claude",
    initHarness: true,
    installCache: true,
    scope: "project",
    visibility: "private",
    dryRun: false,
  });

  assert.equal(result.action, "update");
  const excludeFile = path.join(dir, ".git", "info", "exclude");
  assert.equal(fs.existsSync(excludeFile), true);
  const beforeInit = fs.readFileSync(excludeFile, "utf8");
  assert.match(beforeInit, /# ai-engineering-harness start/);
  assert.match(beforeInit, /\.harness\//);
  assert.match(beforeInit, /\.ai-harness\//);

  require("node:child_process").spawnSync("git", ["init", "-q"], { cwd: dir });
  const afterInit = fs.readFileSync(excludeFile, "utf8");
  assert.match(afterInit, /# ai-engineering-harness start/);
  assert.match(afterInit, /\.harness\//);
  assert.match(afterInit, /\.ai-harness\//);
});

test("reconcileDeferredPrivateIgnore applies deferred exclude block after git init", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "gh-deferred-"));
  const pendingDir = path.join(dir, ".ai-harness");
  fs.mkdirSync(pendingDir, { recursive: true });
  fs.writeFileSync(
    path.join(pendingDir, "pending-git-exclude.json"),
    JSON.stringify(
      {
        paths: [".harness/", ".claude/CLAUDE.md", ".ai-harness/"],
      },
      null,
      2
    ),
    "utf8"
  );
  fs.mkdirSync(path.join(dir, ".git", "info"), { recursive: true });

  const result = reconcileDeferredPrivateIgnore({ targetAbs: dir, dryRun: false });

  assert.equal(result.action, "update");
  const excludeFile = path.join(dir, ".git", "info", "exclude");
  const content = fs.readFileSync(excludeFile, "utf8");
  assert.match(content, /# ai-engineering-harness start/);
  assert.match(content, /\.harness\//);
  assert.match(content, /\.claude\/CLAUDE\.md/);
  assert.equal(fs.existsSync(path.join(pendingDir, "pending-git-exclude.json")), false);
});

test("removeIgnoreBlock resolves git worktree metadata files", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "gh-worktree-remove-"));
  const actualGitDir = path.join(dir, "repo-meta", "worktrees", "feature");
  const excludeFile = path.join(actualGitDir, "info", "exclude");
  fs.mkdirSync(path.dirname(excludeFile), { recursive: true });
  fs.writeFileSync(path.join(dir, ".git"), `gitdir: ${path.relative(dir, actualGitDir)}\n`, "utf8");
  fs.writeFileSync(
    excludeFile,
    "node_modules/\n# ai-engineering-harness start\n.harness/\n# ai-engineering-harness end\n",
    "utf8"
  );

  const result = removeIgnoreBlock({ targetAbs: dir, dryRun: false });
  assert.equal(result.action, "update");
  assert.equal(fs.readFileSync(excludeFile, "utf8"), "node_modules/\n");
});
