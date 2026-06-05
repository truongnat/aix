const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const { loadWalkthroughVideoConfig } = require(path.join(repoRoot, "lib", "walkthrough-video.js"));

test("README includes walkthrough section and release asset video link", () => {
  const config = loadWalkthroughVideoConfig(repoRoot);
  const readme = fs.readFileSync(path.join(repoRoot, "README.md"), "utf8");
  assert.match(readme, /## Watch the walkthrough/);
  assert.match(readme, new RegExp(`\\[${config.filename.replace(".", "\\.")}\\]`));
  assert.match(readme, new RegExp(config.url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.doesNotMatch(readme, /raw\.githubusercontent\.com\/.*\.mp4/);
});

test("landing page wires in the walkthrough video section", () => {
  const config = loadWalkthroughVideoConfig(repoRoot);
  const app = fs.readFileSync(path.join(repoRoot, "site", "src", "App.tsx"), "utf8");
  const sectionPath = path.join(
    repoRoot,
    "site",
    "src",
    "components",
    "VideoWalkthroughSection.tsx"
  );
  const walkthroughLibPath = path.join(repoRoot, "site", "src", "lib", "walkthrough-video.ts");

  assert.match(app, /VideoWalkthroughSection/);
  assert.ok(fs.existsSync(sectionPath), "VideoWalkthroughSection.tsx must exist");
  assert.ok(fs.existsSync(walkthroughLibPath), "walkthrough-video.ts must exist");

  const section = fs.readFileSync(sectionPath, "utf8");
  const walkthroughLib = fs.readFileSync(walkthroughLibPath, "utf8");
  assert.match(section, /WALKTHROUGH_VIDEO_URL/);
  assert.match(walkthroughLib, /media\/walkthrough-video\.json/);
  assert.match(section, /Product walkthrough/);
});
