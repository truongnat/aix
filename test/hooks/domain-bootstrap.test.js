const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const {
  needsDomainBootstrap,
  hasGeneratedDomainSkills,
  buildDomainBootstrapIntent,
} = require("../../dist/hooks/core/domain-bootstrap.js");

function tmpRepo() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "domain-bootstrap-"));
  fs.mkdirSync(path.join(dir, ".harness", "skills"), { recursive: true });
  return dir;
}

test("needsDomainBootstrap is true when domains are empty and no generated skills exist", () => {
  const dir = tmpRepo();
  fs.writeFileSync(
    path.join(dir, ".harness", "config.json"),
    `${JSON.stringify({ domains: [] }, null, 2)}\n`
  );
  assert.equal(needsDomainBootstrap(dir), true);
});

test("needsDomainBootstrap is false when domains are selected", () => {
  const dir = tmpRepo();
  fs.writeFileSync(
    path.join(dir, ".harness", "config.json"),
    `${JSON.stringify({ domains: ["backend"] }, null, 2)}\n`
  );
  assert.equal(needsDomainBootstrap(dir), false);
});

test("needsDomainBootstrap is false when generated domain skills exist", () => {
  const dir = tmpRepo();
  fs.writeFileSync(
    path.join(dir, ".harness", "config.json"),
    `${JSON.stringify({ domains: [] }, null, 2)}\n`
  );
  fs.mkdirSync(path.join(dir, ".harness", "skills", "backend"), { recursive: true });
  assert.equal(hasGeneratedDomainSkills(dir), true);
  assert.equal(needsDomainBootstrap(dir), false);
});

test("buildDomainBootstrapIntent mentions harness-start workflow", () => {
  assert.match(buildDomainBootstrapIntent(), /harness-start protocol/i);
  assert.match(buildDomainBootstrapIntent(), /domain-analysis\.md/i);
});
