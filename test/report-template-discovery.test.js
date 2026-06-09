const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const { discoverReportTemplates } = require(
  path.join(__dirname, "..", "dist", "lib", "report-template-discovery.js")
);

function tmpRepo() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "report-template-"));
  fs.mkdirSync(path.join(dir, "templates"), { recursive: true });
  fs.writeFileSync(
    path.join(dir, "templates", "PR_MESSAGE.md"),
    "# Harness PR\n\n## Summary\n\n-\n"
  );
  fs.writeFileSync(path.join(dir, "templates", "REPORT.md"), "# Harness Report\n");
  fs.writeFileSync(path.join(dir, "templates", "CHANGE_SUMMARY.md"), "# Harness Change Summary\n");
  return dir;
}

test("discoverReportTemplates uses GitHub PR template when present", () => {
  const dir = tmpRepo();
  fs.mkdirSync(path.join(dir, ".github"), { recursive: true });
  fs.writeFileSync(
    path.join(dir, ".github", "pull_request_template.md"),
    "## What changed\n\n- item\n"
  );
  const discovery = discoverReportTemplates(dir);
  assert.equal(discovery.status, "ready");
  assert.equal(discovery.primary.prMessage.path, ".github/pull_request_template.md");
  assert.equal(discovery.primary.prMessage.source, "project");
  assert.match(discovery.primary.prMessage.content, /What changed/);
});

test("discoverReportTemplates falls back to harness PR template", () => {
  const dir = tmpRepo();
  const discovery = discoverReportTemplates(dir);
  assert.equal(discovery.status, "fallback");
  assert.equal(discovery.primary.prMessage.source, "harness-pack");
  assert.equal(discovery.primary.prMessage.path, "templates/PR_MESSAGE.md");
});

test("discoverReportTemplates scans GitHub PR template directory", () => {
  const dir = tmpRepo();
  const templateDir = path.join(dir, ".github", "PULL_REQUEST_TEMPLATE");
  fs.mkdirSync(templateDir, { recursive: true });
  fs.writeFileSync(path.join(templateDir, "feature.md"), "## Feature PR\n");
  const discovery = discoverReportTemplates(dir);
  assert.ok(discovery.candidates.prMessage.some((entry) => entry.path.endsWith("feature.md")));
  assert.equal(discovery.primary.prMessage.path, ".github/PULL_REQUEST_TEMPLATE/feature.md");
});
