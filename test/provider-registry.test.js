const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const { ACTIVE_PROVIDER_IDS, RUNTIME_NATIVE_PROVIDER_IDS } = require(
  path.join(repoRoot, "dist", "lib", "cli-providers.js")
);
const { PROVIDER_IDS, loadProviderManifests, getProviderManifest } = require(
  path.join(repoRoot, "dist", "lib", "provider-registry.js")
);
const { ALL_RUNTIMES } = require(path.join(repoRoot, "dist", "lib", "install-runtime.js"));

function makeTempPack() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "aih-provider-registry-"));
}

test("loadProviderManifests returns all core providers", () => {
  const manifests = loadProviderManifests(repoRoot);
  assert.equal(manifests.length, 4);
  assert.deepEqual(
    manifests.map((entry) => entry.id),
    ["claude", "codex", "cursor", "gemini"]
  );
});

test("getProviderManifest returns claude native slash support", () => {
  const claude = getProviderManifest(repoRoot, "claude");
  assert.equal(claude.nativeSlashCommands, true);
  assert.equal(claude.supportsSubagents, true);
  assert.ok(claude.ruleEntrypoints.includes(".claude/skills/"));
  assert.ok(claude.installPaths.includes(".claude/agents/"));
  assert.ok(claude.installPaths.includes(".claude/skills/"));
});

test("getProviderManifest returns codex slash command support via hook routing", () => {
  const codex = getProviderManifest(repoRoot, "codex");
  assert.equal(codex.nativeSlashCommands, true);
  assert.ok(codex.ruleEntrypoints.includes(".codex/"));
  assert.ok(codex.ruleEntrypoints.includes(".agents/skills/"));
  assert.ok(codex.installPaths.some((p) => p.includes(".codex/commands/")));
  assert.ok(codex.installPaths.some((p) => p.includes(".codex/hooks/")));
  assert.ok(codex.installPaths.includes(".agents/skills/"));
});

test("getProviderManifest returns cursor native slash support", () => {
  const cursor = getProviderManifest(repoRoot, "cursor");
  assert.equal(cursor.nativeSlashCommands, true);
  assert.ok(cursor.ruleEntrypoints.includes(".cursor/commands/"));
});

test("provider registry and runtime lists reuse cli-providers source of truth", () => {
  assert.deepEqual(PROVIDER_IDS, ACTIVE_PROVIDER_IDS);
  assert.deepEqual(ALL_RUNTIMES, RUNTIME_NATIVE_PROVIDER_IDS);
});

test("getProviderManifest rejects malformed provider manifests at runtime", () => {
  const packRoot = makeTempPack();
  const providersDir = path.join(packRoot, "providers");
  fs.mkdirSync(providersDir, { recursive: true });
  fs.writeFileSync(
    path.join(providersDir, "claude.json"),
    JSON.stringify({
      id: "claude",
      label: "Claude Code",
      nativeSlashCommands: "yes",
      ruleEntrypoints: [".claude/commands/"],
      installPaths: [".claude/commands/"],
    }),
    "utf8"
  );

  assert.throws(
    () => getProviderManifest(packRoot, "claude"),
    /nativeSlashCommands must be a boolean/
  );
});

test("loadProviderManifests rejects malformed ruleEntrypoints arrays", () => {
  const packRoot = makeTempPack();
  const providersDir = path.join(packRoot, "providers");
  fs.mkdirSync(providersDir, { recursive: true });
  fs.writeFileSync(
    path.join(providersDir, "claude.json"),
    JSON.stringify({
      id: "claude",
      label: "Claude Code",
      nativeSlashCommands: true,
      ruleEntrypoints: [42],
      installPaths: [".claude/commands/"],
    }),
    "utf8"
  );

  assert.throws(
    () => loadProviderManifests(packRoot),
    /ruleEntrypoints must be an array of strings/
  );
});
