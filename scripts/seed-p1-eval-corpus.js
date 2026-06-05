#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");

const BUGFIX_TASKS = [
  {
    id: "sample-divide",
    title: "Fix broken divide() helper",
    srcFile: "src/math.js",
    broken: `"use strict";\n\nfunction divide(a, b) {\n  return a * b;\n}\n\nmodule.exports = { divide };\n`,
    fixed: `"use strict";\n\nfunction divide(a, b) {\n  return a / b;\n}\n\nmodule.exports = { divide };\n`,
    check: `const test = require("node:test");\nconst assert = require("node:assert/strict");\nconst { divide } = require("../src/math");\n\ntest("divide splits numbers", () => {\n  assert.equal(divide(10, 2), 5);\n});\n`,
    checkFile: "checks/math-check.js",
    exportName: "divide",
  },
  {
    id: "sample-max",
    title: "Fix broken max() helper",
    srcFile: "src/math.js",
    broken: `"use strict";\n\nfunction max(a, b) {\n  return a < b ? a : b;\n}\n\nmodule.exports = { max };\n`,
    fixed: `"use strict";\n\nfunction max(a, b) {\n  return a > b ? a : b;\n}\n\nmodule.exports = { max };\n`,
    check: `const test = require("node:test");\nconst assert = require("node:assert/strict");\nconst { max } = require("../src/math");\n\ntest("max picks larger value", () => {\n  assert.equal(max(2, 9), 9);\n});\n`,
    checkFile: "checks/math-check.js",
    exportName: "max",
  },
  {
    id: "sample-min",
    title: "Fix broken min() helper",
    srcFile: "src/math.js",
    broken: `"use strict";\n\nfunction min(a, b) {\n  return a > b ? a : b;\n}\n\nmodule.exports = { min };\n`,
    fixed: `"use strict";\n\nfunction min(a, b) {\n  return a < b ? a : b;\n}\n\nmodule.exports = { min };\n`,
    check: `const test = require("node:test");\nconst assert = require("node:assert/strict");\nconst { min } = require("../src/math");\n\ntest("min picks smaller value", () => {\n  assert.equal(min(2, 9), 2);\n});\n`,
    checkFile: "checks/math-check.js",
    exportName: "min",
  },
  {
    id: "sample-abs",
    title: "Fix broken abs() helper",
    srcFile: "src/math.js",
    broken: `"use strict";\n\nfunction abs(value) {\n  return value;\n}\n\nmodule.exports = { abs };\n`,
    fixed: `"use strict";\n\nfunction abs(value) {\n  return value < 0 ? -value : value;\n}\n\nmodule.exports = { abs };\n`,
    check: `const test = require("node:test");\nconst assert = require("node:assert/strict");\nconst { abs } = require("../src/math");\n\ntest("abs removes negative sign", () => {\n  assert.equal(abs(-4), 4);\n});\n`,
    checkFile: "checks/math-check.js",
    exportName: "abs",
  },
  {
    id: "sample-clamp",
    title: "Fix broken clamp() helper",
    srcFile: "src/math.js",
    broken: `"use strict";\n\nfunction clamp(value, min, max) {\n  return value;\n}\n\nmodule.exports = { clamp };\n`,
    fixed: `"use strict";\n\nfunction clamp(value, min, max) {\n  return Math.min(max, Math.max(min, value));\n}\n\nmodule.exports = { clamp };\n`,
    check: `const test = require("node:test");\nconst assert = require("node:assert/strict");\nconst { clamp } = require("../src/math");\n\ntest("clamp bounds value", () => {\n  assert.equal(clamp(15, 0, 10), 10);\n});\n`,
    checkFile: "checks/math-check.js",
    exportName: "clamp",
  },
  {
    id: "sample-is-even",
    title: "Fix broken isEven() helper",
    srcFile: "src/parity.js",
    broken: `"use strict";\n\nfunction isEven(value) {\n  return value % 2 === 1;\n}\n\nmodule.exports = { isEven };\n`,
    fixed: `"use strict";\n\nfunction isEven(value) {\n  return value % 2 === 0;\n}\n\nmodule.exports = { isEven };\n`,
    check: `const test = require("node:test");\nconst assert = require("node:assert/strict");\nconst { isEven } = require("../src/parity");\n\ntest("isEven detects even numbers", () => {\n  assert.equal(isEven(4), true);\n});\n`,
    checkFile: "checks/parity-check.js",
    exportName: "isEven",
  },
  {
    id: "sample-reverse-string",
    title: "Fix broken reverseString() helper",
    srcFile: "src/string.js",
    broken: `"use strict";\n\nfunction reverseString(value) {\n  return value;\n}\n\nmodule.exports = { reverseString };\n`,
    fixed: `"use strict";\n\nfunction reverseString(value) {\n  return value.split("").reverse().join("");\n}\n\nmodule.exports = { reverseString };\n`,
    check: `const test = require("node:test");\nconst assert = require("node:assert/strict");\nconst { reverseString } = require("../src/string");\n\ntest("reverseString reverses text", () => {\n  assert.equal(reverseString("abc"), "cba");\n});\n`,
    checkFile: "checks/string-check.js",
    exportName: "reverseString",
  },
  {
    id: "sample-sum-array",
    title: "Fix broken sumArray() helper",
    srcFile: "src/array.js",
    broken: `"use strict";\n\nfunction sumArray(values) {\n  return 0;\n}\n\nmodule.exports = { sumArray };\n`,
    fixed: `"use strict";\n\nfunction sumArray(values) {\n  return values.reduce((total, value) => total + value, 0);\n}\n\nmodule.exports = { sumArray };\n`,
    check: `const test = require("node:test");\nconst assert = require("node:assert/strict");\nconst { sumArray } = require("../src/array");\n\ntest("sumArray totals values", () => {\n  assert.equal(sumArray([1, 2, 3]), 6);\n});\n`,
    checkFile: "checks/array-check.js",
    exportName: "sumArray",
  },
  {
    id: "sample-unique-count",
    title: "Fix broken uniqueCount() helper",
    srcFile: "src/array.js",
    broken: `"use strict";\n\nfunction uniqueCount(values) {\n  return values.length;\n}\n\nmodule.exports = { uniqueCount };\n`,
    fixed: `"use strict";\n\nfunction uniqueCount(values) {\n  return new Set(values).size;\n}\n\nmodule.exports = { uniqueCount };\n`,
    check: `const test = require("node:test");\nconst assert = require("node:assert/strict");\nconst { uniqueCount } = require("../src/array");\n\ntest("uniqueCount counts distinct values", () => {\n  assert.equal(uniqueCount([1, 1, 2]), 2);\n});\n`,
    checkFile: "checks/array-check.js",
    exportName: "uniqueCount",
  },
  {
    id: "sample-default-value",
    title: "Fix broken defaultValue() helper",
    srcFile: "src/value.js",
    broken: `"use strict";\n\nfunction defaultValue(value, fallback) {\n  return value;\n}\n\nmodule.exports = { defaultValue };\n`,
    fixed: `"use strict";\n\nfunction defaultValue(value, fallback) {\n  return value === undefined || value === null ? fallback : value;\n}\n\nmodule.exports = { defaultValue };\n`,
    check: `const test = require("node:test");\nconst assert = require("node:assert/strict");\nconst { defaultValue } = require("../src/value");\n\ntest("defaultValue uses fallback", () => {\n  assert.equal(defaultValue(undefined, "x"), "x");\n});\n`,
    checkFile: "checks/value-check.js",
    exportName: "defaultValue",
  },
  {
    id: "sample-multiply",
    title: "Fix broken multiply() helper",
    srcFile: "src/math.js",
    broken: `"use strict";\n\nfunction multiply(a, b) {\n  return a + b;\n}\n\nmodule.exports = { multiply };\n`,
    fixed: `"use strict";\n\nfunction multiply(a, b) {\n  return a * b;\n}\n\nmodule.exports = { multiply };\n`,
    check: `const test = require("node:test");\nconst assert = require("node:assert/strict");\nconst { multiply } = require("../src/math");\n\ntest("multiply combines factors", () => {\n  assert.equal(multiply(6, 7), 42);\n});\n`,
    checkFile: "checks/math-check.js",
    exportName: "multiply",
  },
  {
    id: "sample-subtract",
    title: "Fix broken subtract() helper",
    srcFile: "src/math.js",
    broken: `"use strict";\n\nfunction subtract(a, b) {\n  return a + b;\n}\n\nmodule.exports = { subtract };\n`,
    fixed: `"use strict";\n\nfunction subtract(a, b) {\n  return a - b;\n}\n\nmodule.exports = { subtract };\n`,
    check: `const test = require("node:test");\nconst assert = require("node:assert/strict");\nconst { subtract } = require("../src/math");\n\ntest("subtract removes the second value", () => {\n  assert.equal(subtract(10, 3), 7);\n});\n`,
    checkFile: "checks/math-check.js",
    exportName: "subtract",
  },
  {
    id: "sample-first-item",
    title: "Fix broken firstItem() helper",
    srcFile: "src/array.js",
    broken: `"use strict";\n\nfunction firstItem(values) {\n  return values[values.length - 1];\n}\n\nmodule.exports = { firstItem };\n`,
    fixed: `"use strict";\n\nfunction firstItem(values) {\n  return values[0];\n}\n\nmodule.exports = { firstItem };\n`,
    check: `const test = require("node:test");\nconst assert = require("node:assert/strict");\nconst { firstItem } = require("../src/array");\n\ntest("firstItem returns the first element", () => {\n  assert.equal(firstItem([3, 5, 8]), 3);\n});\n`,
    checkFile: "checks/array-check.js",
    exportName: "firstItem",
  },
  {
    id: "sample-last-item",
    title: "Fix broken lastItem() helper",
    srcFile: "src/array.js",
    broken: `"use strict";\n\nfunction lastItem(values) {\n  return values[0];\n}\n\nmodule.exports = { lastItem };\n`,
    fixed: `"use strict";\n\nfunction lastItem(values) {\n  return values[values.length - 1];\n}\n\nmodule.exports = { lastItem };\n`,
    check: `const test = require("node:test");\nconst assert = require("node:assert/strict");\nconst { lastItem } = require("../src/array");\n\ntest("lastItem returns the final element", () => {\n  assert.equal(lastItem([3, 5, 8]), 8);\n});\n`,
    checkFile: "checks/array-check.js",
    exportName: "lastItem",
  },
  {
    id: "sample-uppercase",
    title: "Fix broken uppercase() helper",
    srcFile: "src/string.js",
    broken: `"use strict";\n\nfunction uppercase(value) {\n  return value.toLowerCase();\n}\n\nmodule.exports = { uppercase };\n`,
    fixed: `"use strict";\n\nfunction uppercase(value) {\n  return value.toUpperCase();\n}\n\nmodule.exports = { uppercase };\n`,
    check: `const test = require("node:test");\nconst assert = require("node:assert/strict");\nconst { uppercase } = require("../src/string");\n\ntest("uppercase capitalizes text", () => {\n  assert.equal(uppercase("Harness"), "HARNESS");\n});\n`,
    checkFile: "checks/string-check.js",
    exportName: "uppercase",
  },
];

const WORKFLOW_TASKS = [
  {
    id: "sample-plan-md",
    title: "Produce PLAN.md with goal heading",
    artifact: "PLAN.md",
    pattern: "## Goal",
    withContent: "# Plan\n\n## Goal\n\nShip deterministic fixture plan.\n",
  },
  {
    id: "sample-verify-md",
    title: "Produce VERIFY.md with evidence line",
    artifact: "VERIFY.md",
    pattern: "Evidence:",
    withContent: "# Verify\n\nEvidence: npm test passed in fixture.\n",
  },
  {
    id: "sample-ship-md",
    title: "Produce SHIP.md with status line",
    artifact: "SHIP.md",
    pattern: "Status:",
    withContent: "# Ship\n\nStatus: ready\nSummary: deterministic ship artifact.\n",
  },
  {
    id: "sample-context-md",
    title: "Produce CONTEXT.md with active goal",
    artifact: "CONTEXT.md",
    pattern: "Active goal:",
    withContent: "# Context\n\nActive goal: complete workflow fixture.\n",
  },
  {
    id: "sample-blockers-md",
    title: "Produce BLOCKERS.md with none sentinel",
    artifact: "BLOCKERS.md",
    pattern: "Blockers:",
    withContent: "# Blockers\n\nBlockers: none\n",
  },
  {
    id: "sample-discussion-md",
    title: "Produce DISCUSSION.md with explicit constraints",
    artifact: "DISCUSSION.md",
    pattern: "Constraints:",
    withContent: "# Discussion\n\nConstraints: stay within the approved fixture scope.\n",
  },
  {
    id: "sample-review-md",
    title: "Produce REVIEW.md with findings section",
    artifact: "REVIEW.md",
    pattern: "Findings:",
    withContent: "# Review\n\nFindings: deterministic fixture review completed.\n",
  },
  {
    id: "sample-remember-md",
    title: "Produce REMEMBER.md with durable lesson",
    artifact: "REMEMBER.md",
    pattern: "Lesson:",
    withContent: "# Remember\n\nLesson: preserve the verified workflow evidence.\n",
  },
  {
    id: "sample-report-md",
    title: "Produce REPORT.md with status evidence",
    artifact: "REPORT.md",
    pattern: "Status:",
    withContent: "# Report\n\nStatus: ready\nEvidence: fixture checks passed.\n",
  },
  {
    id: "sample-pr-message-md",
    title: "Produce PR_MESSAGE.md with summary line",
    artifact: "PR_MESSAGE.md",
    pattern: "Summary:",
    withContent: "# PR Message\n\nSummary: deterministic fixture prepared for review.\n",
  },
];

function writeBugfixTask(task) {
  const fixtureRoot = path.join(repoRoot, "evals", "fixtures", task.id);
  fs.mkdirSync(path.dirname(path.join(fixtureRoot, task.srcFile)), { recursive: true });
  fs.mkdirSync(path.dirname(path.join(fixtureRoot, task.checkFile)), { recursive: true });
  fs.writeFileSync(
    path.join(fixtureRoot, "package.json"),
    `${JSON.stringify(
      {
        name: `${task.id}-fixture`,
        private: true,
        type: "commonjs",
        scripts: { test: `node --test ${task.checkFile}` },
      },
      null,
      2
    )}\n`
  );
  fs.writeFileSync(path.join(fixtureRoot, task.srcFile), task.broken);
  fs.writeFileSync(path.join(fixtureRoot, task.checkFile), task.check);
  fs.writeFileSync(
    path.join(repoRoot, "evals", "registry", "sample-suite", `${task.id}.json`),
    `${JSON.stringify(
      {
        id: task.id,
        suite: "sample-suite",
        title: task.title,
        goal: `Repair ${task.exportName}() in a deterministic Node fixture.`,
        mode: "bugfix",
        fixture: { path: `evals/fixtures/${task.id}` },
        prompt: `Fix the bug so tests pass without changing the checks.`,
        successChecks: [{ type: "command", command: "npm test", cwd: "." }],
        behaviorChecks: [{ type: "artifact-exists", path: "final-response.txt" }],
        rubric: "evals/rubrics/deterministic-v1.json",
        metrics: { withHarnessSteps: 3, withoutHarnessSteps: 8, phases: ["verify"] },
        tags: ["sample", "bugfix", "deterministic", "node", "p1-corpus"],
      },
      null,
      2
    )}\n`
  );
}

function writeWorkflowTask(task) {
  const fixtureRoot = path.join(repoRoot, "evals", "fixtures", task.id);
  fs.mkdirSync(fixtureRoot, { recursive: true });
  fs.writeFileSync(
    path.join(fixtureRoot, "README.md"),
    `# ${task.artifact} Fixture\n\nCreate \`${task.artifact}\` with a line containing \`${task.pattern}\`.\n`
  );
  fs.writeFileSync(
    path.join(repoRoot, "evals", "registry", "sample-suite", `${task.id}.json`),
    `${JSON.stringify(
      {
        id: task.id,
        suite: "sample-suite",
        title: task.title,
        goal: `Generate ${task.artifact} for workflow discipline.`,
        mode: "workflow-discipline",
        fixture: { path: `evals/fixtures/${task.id}` },
        prompt: `Write ${task.artifact} following the fixture README.`,
        successChecks: [{ type: "file-contains", path: task.artifact, pattern: task.pattern }],
        behaviorChecks: [{ type: "artifact-exists", path: "final-response.txt" }],
        rubric: "evals/rubrics/deterministic-v1.json",
        metrics: {
          withHarnessSteps: 4,
          withoutHarnessSteps: 9,
          phases: ["plan", "verify", "ship"],
        },
        tags: ["sample", "workflow", "deterministic", "docs", "p1-corpus"],
      },
      null,
      2
    )}\n`
  );
}

function buildMutations() {
  const mutations = {};

  const existing = {
    "sample-bugfix": {
      metrics: { withHarnessSteps: 3, withoutHarnessSteps: 7, phases: ["verify"] },
      withHarness: {
        "src/math.js": `"use strict";\n\nfunction add(a, b) {\n  return a + b;\n}\n\nmodule.exports = {\n  add,\n};\n`,
        "final-response.txt": "Fixed add() and verified tests.",
      },
      withoutHarness: { "final-response.txt": "Attempted task without harness." },
    },
    "sample-string-trim": {
      metrics: { withHarnessSteps: 3, withoutHarnessSteps: 7, phases: ["verify"] },
      withHarness: {
        "src/string.js": `"use strict";\n\nfunction trim(value) {\n  return value.trim();\n}\n\nmodule.exports = {\n  trim,\n};\n`,
        "final-response.txt": "Fixed trim() and verified tests.",
      },
      withoutHarness: { "final-response.txt": "Attempted trim fix without harness." },
    },
    "sample-config-patch": {
      metrics: { withHarnessSteps: 3, withoutHarnessSteps: 8, phases: ["verify"] },
      withHarness: {
        "config.json": `{\n  "name": "demo",\n  "enabled": true\n}\n`,
        "final-response.txt": "Patched config.json enabled flag.",
      },
      withoutHarness: { "final-response.txt": "Attempted config patch." },
    },
    "example-health-report": {
      metrics: { withHarnessSteps: 4, withoutHarnessSteps: 10, phases: ["plan", "ship"] },
      withHarness: {
        "HEALTH_REPORT.md":
          "# Health Report\n\nStatus: ready\nSummary: deterministic fixture generated.\n",
        "final-response.txt": "Generated health report.",
      },
      withoutHarness: { "final-response.txt": "Attempted report generation." },
    },
    "sample-response-contract": {
      metrics: { withHarnessSteps: 4, withoutHarnessSteps: 9, phases: ["ship"] },
      withHarness: {
        "final-response.txt":
          "Status: complete\nSummary: Wrote final-response.txt per response contract.\n",
      },
      withoutHarness: { "final-response.txt": "Done." },
    },
  };

  Object.assign(mutations, existing);

  for (const task of BUGFIX_TASKS) {
    mutations[task.id] = {
      metrics: { withHarnessSteps: 3, withoutHarnessSteps: 8, phases: ["verify"] },
      withHarness: {
        [task.srcFile]: task.fixed,
        "final-response.txt": `Fixed ${task.exportName}() and verified tests.`,
      },
      withoutHarness: {
        "final-response.txt": `Attempted ${task.exportName} fix without harness.`,
      },
    };
  }

  for (const task of WORKFLOW_TASKS) {
    mutations[task.id] = {
      metrics: { withHarnessSteps: 4, withoutHarnessSteps: 9, phases: ["plan", "verify", "ship"] },
      withHarness: {
        [task.artifact]: task.withContent,
        "final-response.txt": `Generated ${task.artifact}.`,
      },
      withoutHarness: { "final-response.txt": `Attempted ${task.artifact} without harness.` },
    };
  }

  return mutations;
}

function main() {
  for (const task of BUGFIX_TASKS) {
    writeBugfixTask(task);
  }
  for (const task of WORKFLOW_TASKS) {
    writeWorkflowTask(task);
  }
  const mutationsPath = path.join(repoRoot, "evals", "mutations", "registry.json");
  fs.mkdirSync(path.dirname(mutationsPath), { recursive: true });
  fs.writeFileSync(mutationsPath, `${JSON.stringify(buildMutations(), null, 2)}\n`, "utf8");
  process.stdout.write(
    `Seeded ${BUGFIX_TASKS.length} bugfix + ${WORKFLOW_TASKS.length} workflow eval tasks.\n`
  );
}

main();
