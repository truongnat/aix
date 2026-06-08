const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const cp = require("node:child_process");
const { runUpdate } = require("../../dist/lib/backend/update.js");
const PACK_ROOT = path.resolve(__dirname, "..", "..");
function tmpRepo() {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), "up-"));
  cp.spawnSync("git", ["init", "-q"], { cwd: d });
  return d;
}

function writeManifest(dir, providers) {
  const harnessDir = path.join(dir, ".ai-harness");
  fs.mkdirSync(harnessDir, { recursive: true });
  fs.writeFileSync(
    path.join(harnessDir, "manifest.json"),
    JSON.stringify(
      {
        installedProviders: providers,
        providerCommandEntrypoints: Object.fromEntries(
          providers.map((provider) => [provider, [`${provider}/entrypoint`]])
        ),
      },
      null,
      2
    ),
    "utf8"
  );
}

test("update refreshes provider files with force (overwrites modified file)", () => {
  const dir = tmpRepo();
  // first install to create the surface
  const { runInstall } = require("../../dist/lib/backend/install-orchestrator.js");
  runInstall({
    packRoot: PACK_ROOT,
    target: dir,
    provider: "claude",
    scope: "project",
    visibility: "private",
    dryRun: false,
    initHarness: false,
    installCache: true,
    force: false,
  });
  const claudeMd = path.join(dir, ".claude", "CLAUDE.md");
  fs.writeFileSync(claudeMd, "TAMPERED\n");
  const r = runUpdate({
    packRoot: PACK_ROOT,
    target: dir,
    provider: "claude",
    scope: "project",
    visibility: "private",
    dryRun: false,
  });
  assert.equal(r.ok, true);
  assert.notEqual(
    fs.readFileSync(claudeMd, "utf8"),
    "TAMPERED\n",
    "update should overwrite with force"
  );
});

test("update does NOT create the .harness skeleton", () => {
  const dir = tmpRepo();
  writeManifest(dir, ["claude"]);
  runUpdate({
    packRoot: PACK_ROOT,
    target: dir,
    provider: "claude",
    scope: "project",
    visibility: "shared",
    dryRun: false,
  });
  assert.equal(fs.existsSync(path.join(dir, ".harness")), false);
});

test("update rejects the manual provider", () => {
  const dir = tmpRepo();
  writeManifest(dir, ["manual"]);
  const r = runUpdate({
    packRoot: PACK_ROOT,
    target: dir,
    provider: "manual",
    scope: "project",
    visibility: "shared",
    dryRun: false,
  });
  assert.equal(r.ok, false);
  assert.match(r.messages.join(" "), /manual/i);
});

test("update global scope dryRun returns ok with notice; real returns not-ok", () => {
  const dir = tmpRepo();
  writeManifest(dir, ["claude"]);
  assert.equal(
    runUpdate({
      packRoot: PACK_ROOT,
      target: dir,
      provider: "claude",
      scope: "global",
      visibility: "shared",
      dryRun: true,
    }).ok,
    true
  );
  assert.equal(
    runUpdate({
      packRoot: PACK_ROOT,
      target: dir,
      provider: "claude",
      scope: "global",
      visibility: "shared",
      dryRun: false,
    }).ok,
    false
  );
});

test("update prints update banner from caller-owned label", () => {
  const dir = tmpRepo();
  writeManifest(dir, ["claude"]);
  const writes = [];
  const originalWrite = process.stdout.write;
  process.stdout.write = (chunk, ...args) => {
    writes.push(String(chunk));
    return originalWrite.call(process.stdout, chunk, ...args);
  };

  try {
    const r = runUpdate({
      packRoot: PACK_ROOT,
      target: dir,
      provider: "claude",
      scope: "project",
      visibility: "shared",
      dryRun: true,
    });
    assert.equal(r.ok, true);
  } finally {
    process.stdout.write = originalWrite;
  }

  const output = writes.join("");
  assert.match(output, /Runtime-native update/);
});
