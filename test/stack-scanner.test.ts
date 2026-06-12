// eslint-disable-next-line @typescript-eslint/no-require-imports
const { test } = require("node:test") as typeof import("node:test");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const assert = require("node:assert/strict") as typeof import("node:assert/strict");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require("node:fs") as typeof import("node:fs");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const os = require("node:os") as typeof import("node:os");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require("node:path") as typeof import("node:path");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { stackScanner } = require(
  path.join(__dirname, "..", "dist", "features", "scan", "infrastructure", "stack-scanner.js")
) as typeof import("../lib/stack-scanner.js");

function tmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "stack-scanner-"));
}

test("detects nextjs from package.json dependencies", () => {
  const dir = tmpDir();
  fs.writeFileSync(
    path.join(dir, "package.json"),
    JSON.stringify({ dependencies: { next: "14.0.0", react: "18.0.0" } })
  );
  const result = stackScanner(dir);
  assert.ok(result.frameworks.includes("nextjs"));
  assert.ok(result.languages.includes("typescript") || result.languages.includes("javascript"));
  assert.ok(result.evidence["nextjs"]?.some((p) => p.includes("package.json")));
  assert.ok(result.domains.some((d) => d.id === "frontend"));
});

test("detects fastapi from pyproject.toml", () => {
  const dir = tmpDir();
  fs.writeFileSync(
    path.join(dir, "pyproject.toml"),
    '[tool.poetry.dependencies]\nfastapi = "^0.100.0"\n'
  );
  const result = stackScanner(dir);
  assert.ok(result.frameworks.includes("fastapi"));
  assert.ok(result.languages.includes("python"));
  assert.ok(result.domains.some((d) => d.id === "backend"));
});

test("detects flutter from pubspec.yaml", () => {
  const dir = tmpDir();
  fs.writeFileSync(
    path.join(dir, "pubspec.yaml"),
    "name: my_app\nflutter:\n  uses-material-design: true\n"
  );
  const result = stackScanner(dir);
  assert.ok(result.frameworks.includes("flutter"));
  assert.ok(result.languages.includes("dart"));
  assert.ok(result.domains.some((d) => d.id === "mobile"));
});

test("detects devops signals from Dockerfile and github actions", () => {
  const dir = tmpDir();
  fs.writeFileSync(path.join(dir, "Dockerfile"), "FROM node:20\n");
  fs.mkdirSync(path.join(dir, ".github", "workflows"), { recursive: true });
  fs.writeFileSync(path.join(dir, ".github", "workflows", "ci.yml"), "on: push\n");
  const result = stackScanner(dir);
  assert.ok(result.domains.some((d) => d.id === "devops"));
  assert.ok(result.evidence["github-actions"]?.length > 0 || result.evidence["docker"]?.length > 0);
});

test("scans nested subdirectories up to depth 4", () => {
  const dir = tmpDir();
  const nested = path.join(dir, "apps", "web");
  fs.mkdirSync(nested, { recursive: true });
  fs.writeFileSync(
    path.join(nested, "package.json"),
    JSON.stringify({ dependencies: { next: "14.0.0" } })
  );
  const result = stackScanner(dir);
  assert.ok(result.frameworks.includes("nextjs"));
  assert.ok(result.evidence["nextjs"]?.some((p) => p.includes("apps")));
});

test("skips node_modules and .git directories", () => {
  const dir = tmpDir();
  const nm = path.join(dir, "node_modules", "some-pkg");
  fs.mkdirSync(nm, { recursive: true });
  fs.writeFileSync(
    path.join(nm, "package.json"),
    JSON.stringify({ dependencies: { next: "14.0.0" } })
  );
  const result = stackScanner(dir);
  assert.ok(!result.frameworks.includes("nextjs"), "should not detect nextjs inside node_modules");
});

test("returns empty result for empty directory", () => {
  const dir = tmpDir();
  const result = stackScanner(dir);
  assert.deepEqual(result.frameworks, []);
  assert.deepEqual(result.domains, []);
});
