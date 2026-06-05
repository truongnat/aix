const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");

test("README includes walkthrough section and local video link", () => {
  const readme = fs.readFileSync(path.join(repoRoot, "README.md"), "utf8");
  assert.match(readme, /## Watch the walkthrough/);
  assert.match(readme, /\[AI_Engineering_Harness\.mp4\]\(\.\/AI_Engineering_Harness\.mp4\)/);
});

test("landing page wires in the walkthrough video section", () => {
  const app = fs.readFileSync(path.join(repoRoot, "site", "src", "App.tsx"), "utf8");
  const sectionPath = path.join(
    repoRoot,
    "site",
    "src",
    "components",
    "VideoWalkthroughSection.tsx"
  );

  assert.match(app, /VideoWalkthroughSection/);
  assert.ok(fs.existsSync(sectionPath), "VideoWalkthroughSection.tsx must exist");

  const section = fs.readFileSync(sectionPath, "utf8");
  assert.match(section, /AI_Engineering_Harness\.mp4/);
  assert.match(section, /Product walkthrough/);
});
