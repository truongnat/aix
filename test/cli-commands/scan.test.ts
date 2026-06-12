// eslint-disable-next-line @typescript-eslint/no-require-imports
const { test } = require("node:test") as typeof import("node:test");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const assert = require("node:assert/strict") as typeof import("node:assert/strict");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { execSync } = require("node:child_process") as typeof import("node:child_process");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require("node:fs") as typeof import("node:fs");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const os = require("node:os") as typeof import("node:os");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require("node:path") as typeof import("node:path");

function tmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "scan-cmd-"));
}

test("scan command outputs valid JSON with frameworks and domains", () => {
  const dir = tmpDir();
  fs.writeFileSync(
    path.join(dir, "package.json"),
    JSON.stringify({ dependencies: { next: "14.0.0" } })
  );
  const output = execSync(`node dist/cli/main.js scan --target "${dir}"`, { encoding: "utf8" });
  const result = JSON.parse(output.trim()) as Record<string, unknown>;
  assert.ok(Array.isArray(result.frameworks), "frameworks should be array");
  assert.ok(Array.isArray(result.domains), "domains should be array");
  assert.ok(Array.isArray(result.languages), "languages should be array");
  assert.ok("evidence" in result, "evidence should be present");
  assert.ok((result.frameworks as string[]).includes("nextjs"));
});

test("scan command exits 1 for missing target", () => {
  assert.throws(
    () =>
      execSync("node dist/cli/main.js scan --target /nonexistent/path/xyz", { encoding: "utf8" }),
    /Target directory does not exist/
  );
});
