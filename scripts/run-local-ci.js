const childProcess = require("node:child_process");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
const nodeCmd = process.execPath;
const eslintCli = path.join(repoRoot, "node_modules", "eslint", "bin", "eslint.js");
const prettierCli = path.join(repoRoot, "node_modules", "prettier", "bin", "prettier.cjs");

const steps = [
  {
    name: "Lint code",
    command: nodeCmd,
    args: [
      eslintCli,
      "bin/",
      "test/",
      "*.js",
      "--max-warnings",
      "0",
      "--no-error-on-unmatched-pattern",
    ],
  },
  {
    name: "Check formatting",
    command: nodeCmd,
    args: [
      prettierCli,
      "--check",
      "lib/",
      "bin/",
      "test/",
      "*.js",
      "*.md",
      "--no-error-on-unmatched-pattern",
    ],
  },
  {
    name: "Validate pack contracts",
    command: npmCmd,
    args: ["run", "build"],
  },
  {
    name: "Validate repository",
    command: nodeCmd,
    args: ["bin/validate.js"],
  },
  {
    name: "Run repository tests",
    command: npmCmd,
    args: ["test"],
  },
  {
    name: "Run eval regression",
    command: nodeCmd,
    args: ["bin/aih.js", "eval", "run", "sample-bugfix", "--yes", "--no-llm-judge"],
  },
  {
    name: "Check lib coverage gate",
    command: npmCmd,
    args: ["run", "test:coverage"],
  },
  {
    name: "Smoke test install",
    command: nodeCmd,
    args: ["scripts/smoke-install.js"],
  },
  {
    name: "Run dogfood demo tests",
    command: npmCmd,
    args: ["test"],
    cwd: path.join(repoRoot, "examples", "dogfood-tiny-node-api"),
  },
];

for (const step of steps) {
  process.stdout.write(`\n=== ${step.name} ===\n`);
  const result = childProcess.spawnSync(step.command, step.args, {
    cwd: step.cwd || repoRoot,
    stdio: "inherit",
    env: process.env,
    shell: process.platform === "win32" && step.command.toLowerCase().endsWith(".cmd"),
  });
  if (result.status !== 0) {
    process.stderr.write(`\nLocal CI gate failed at: ${step.name}\n`);
    process.exit(result.status || 1);
  }
}

process.stdout.write("\nLocal CI gate passed.\n");
