const { test } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const { loadProviderManifests, getProviderManifest } = require(
  path.join(repoRoot, "dist", "lib", "provider-registry.js")
);

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
});
