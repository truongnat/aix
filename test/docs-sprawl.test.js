const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const REPO_ROOT = path.resolve(__dirname, "..");

const archivedInstallDocs = [
  "interactive-installer-design.md",
  "installer-ux-v0.9.2-plan.md",
  "one-line-installer-design.md",
  "antigravity-provider-research.md",
];

const canonicalInstallDocs = [
  {
    fileName: "install-command-model.md",
    expectedScope:
      /Canonical scope: `npx ai-engineering-harness` lifecycle commands, defaults, and flags\./,
  },
  {
    fileName: "runtime-native-install.md",
    expectedScope:
      /Canonical scope: per-runtime payload paths and follow-up actions after runtime-native install\./,
  },
];

const canonicalAdoptionDocs = [
  {
    fileName: "install-to-profile-walkthrough.md",
    expectedScope:
      /Canonical scope: step-by-step first-time adoption from install through validated profile and goal artifacts\./,
  },
  {
    fileName: "install-output-example.md",
    expectedScope:
      /Canonical scope: illustrative installer output snippets, not the procedural adoption walkthrough\./,
  },
];

function readRepoFile(relativePath) {
  return fs.readFileSync(path.join(REPO_ROOT, relativePath), "utf8");
}

test("install design docs are archived behind stable top-level stubs", () => {
  const docsIndex = readRepoFile("docs/README.md");
  assert.match(
    docsIndex,
    /docs\/internal\/archive\/install\//,
    "docs/README.md should point maintainers to the install archive"
  );

  const archiveReadme = readRepoFile("docs/internal/archive/install/README.md");
  assert.match(archiveReadme, /Historical install/i);

  for (const fileName of archivedInstallDocs) {
    const topLevelDoc = readRepoFile(`docs/${fileName}`);
    assert.match(
      topLevelDoc,
      /archived as an internal maintainer document/i,
      `docs/${fileName} should redirect to its archived maintainer copy`
    );

    const archivedDoc = readRepoFile(`docs/internal/archive/install/${fileName}`);
    assert.ok(
      archivedDoc.length > topLevelDoc.length,
      `archived copy for ${fileName} should retain the original detailed content`
    );
  }

  assert.ok(
    !fs.existsSync(path.join(REPO_ROOT, "docs/install-sh-usage.md")),
    "docs/install-sh-usage.md should be removed from the top-level docs surface"
  );
});

test("canonical install docs declare distinct responsibilities and cross-reference each other", () => {
  for (const { fileName, expectedScope } of canonicalInstallDocs) {
    const contents = readRepoFile(`docs/${fileName}`);
    assert.match(contents, expectedScope, `docs/${fileName} should declare its canonical scope`);
  }

  const installCommandModel = readRepoFile("docs/install-command-model.md");
  assert.match(
    installCommandModel,
    /runtime-native-install\.md/,
    "install-command-model should delegate payload-path details to runtime-native-install.md"
  );

  const runtimeNativeInstall = readRepoFile("docs/runtime-native-install.md");
  assert.match(
    runtimeNativeInstall,
    /install-command-model\.md/,
    "runtime-native-install should point flag semantics back to install-command-model.md"
  );
});

test("walkthrough and install output docs separate procedure from illustrative output", () => {
  for (const { fileName, expectedScope } of canonicalAdoptionDocs) {
    const contents = readRepoFile(`docs/${fileName}`);
    assert.match(contents, expectedScope, `docs/${fileName} should declare its canonical scope`);
  }

  const walkthrough = readRepoFile("docs/install-to-profile-walkthrough.md");
  assert.match(
    walkthrough,
    /install-output-example\.md/,
    "walkthrough should point raw output examples to install-output-example.md"
  );

  const installOutputExample = readRepoFile("docs/install-output-example.md");
  assert.match(
    installOutputExample,
    /install-to-profile-walkthrough\.md/,
    "install-output-example should point procedural setup steps to the walkthrough"
  );
  assert.doesNotMatch(
    installOutputExample,
    /## What To Do After Install/,
    "install-output-example should not duplicate procedural adoption steps"
  );
  assert.doesNotMatch(
    installOutputExample,
    /create the six required `.harness\/` profile artifacts/i,
    "install-output-example should avoid repeating walkthrough guidance verbatim"
  );
});
