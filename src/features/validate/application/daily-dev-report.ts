import fs from "node:fs";
import path from "node:path";
import childProcess from "node:child_process";

const REPORT_TEMPLATES = [
  "templates/REPORT.md",
  "templates/PR_MESSAGE.md",
  "templates/CHANGE_SUMMARY.md",
];

const REPORT_TEMPLATE_HEADINGS: Record<string, string[]> = {
  "templates/REPORT.md": [
    "## Summary",
    "## What Changed",
    "## Why Changed",
    "## Files Changed",
    "## Verification",
    "## Risks / Notes",
    "## Follow-ups",
    "## Status",
  ],
  "templates/PR_MESSAGE.md": [
    "## Title",
    "## Body",
    "### Summary",
    "### Changes",
    "### Why",
    "### Verification",
    "### Files changed",
    "### Risks / Rollback",
    "### Notes for reviewer",
  ],
  "templates/CHANGE_SUMMARY.md": ["## Change Set", "## Stats", "## Main Areas", "## Durable Notes"],
};

const REPORT_SKILL_DIR = "skills/report-writer";

function assertExists(baseDir: string, relativePath: string, failures: string[]): void {
  if (!fs.existsSync(path.join(baseDir, relativePath))) {
    failures.push(`Missing required path: ${relativePath}`);
  }
}

function assertHeadings(
  baseDir: string,
  relativePath: string,
  headings: string[],
  failures: string[]
): void {
  const fullPath = path.join(baseDir, relativePath);
  if (!fs.existsSync(fullPath)) {
    return;
  }
  const content = fs.readFileSync(fullPath, "utf8");
  for (const heading of headings) {
    if (!content.includes(heading)) {
      failures.push(`${relativePath} is missing heading: ${heading}`);
    }
  }
}

function assertDailyDevReportLayer(baseDir: string, failures: string[]): void {
  assertExists(baseDir, "docs/daily-dev-report.md", failures);
  assertExists(baseDir, "workflows/daily-dev-report.md", failures);
  assertExists(baseDir, "scripts/generate-report-context.js", failures);

  for (const template of REPORT_TEMPLATES) {
    assertExists(baseDir, template, failures);
    assertHeadings(baseDir, template, REPORT_TEMPLATE_HEADINGS[template], failures);
  }

  assertExists(baseDir, `${REPORT_SKILL_DIR}/SKILL.md`, failures);
  assertExists(baseDir, `${REPORT_SKILL_DIR}/prompt.md`, failures);
  assertHeadings(
    baseDir,
    `${REPORT_SKILL_DIR}/SKILL.md`,
    ["## Purpose", "## Output Contract", "## Blocking Conditions"],
    failures
  );

  for (const reference of [
    "references/daily-report-template.md",
    "references/pr-message-template.md",
    "references/change-summary-template.md",
  ]) {
    assertExists(baseDir, `${REPORT_SKILL_DIR}/${reference}`, failures);
  }

  const shipCommand = path.join(baseDir, "commands/harness-ship.md");
  if (fs.existsSync(shipCommand)) {
    const content = fs.readFileSync(shipCommand, "utf8");
    for (const artifact of ["REPORT.md", "PR_MESSAGE.md", "CHANGE_SUMMARY.md"]) {
      if (!content.includes(artifact)) {
        failures.push(`commands/harness-ship.md must mention ${artifact}`);
      }
    }
  }

  const shipPrompt = path.join(baseDir, "prompt-templates/harness-ship.md");
  if (fs.existsSync(shipPrompt)) {
    const content = fs.readFileSync(shipPrompt, "utf8");
    for (const artifact of ["REPORT.md", "PR_MESSAGE.md", "CHANGE_SUMMARY.md"]) {
      if (!content.includes(artifact)) {
        failures.push(`prompt-templates/harness-ship.md must mention ${artifact}`);
      }
    }
    if (!/report-writer|Daily Report/i.test(content)) {
      failures.push(
        "prompt-templates/harness-ship.md must reference report-writer or daily report workflow"
      );
    }
  }

  const prTemplate = path.join(baseDir, "templates/PR_MESSAGE.md");
  if (fs.existsSync(prTemplate)) {
    const content = fs.readFileSync(prTemplate, "utf8");
    if (!content.includes("### Verification") || !content.includes("### Risks / Rollback")) {
      failures.push("templates/PR_MESSAGE.md must include verification and risks sections");
    }
  }

  const dailyDoc = path.join(baseDir, "docs/daily-dev-report.md");
  if (fs.existsSync(dailyDoc)) {
    const content = fs.readFileSync(dailyDoc, "utf8");
    if (!/block|Blocked/i.test(content)) {
      failures.push("docs/daily-dev-report.md must document blocking behavior");
    }
  }

  const scriptPath = path.join(baseDir, "scripts/generate-report-context.js");
  if (fs.existsSync(scriptPath)) {
    const help = childProcess.spawnSync(process.execPath, [scriptPath, "--help"], {
      cwd: baseDir,
      encoding: "utf8",
      timeout: 15000,
    });
    if (help.status !== 0) {
      failures.push("scripts/generate-report-context.js must support --help and exit 0");
    }

    const json = childProcess.spawnSync(process.execPath, [scriptPath, "--json"], {
      cwd: baseDir,
      encoding: "utf8",
      timeout: 15000,
    });
    if (json.status !== 0) {
      failures.push("scripts/generate-report-context.js must run in repository and output JSON");
      return;
    }
    try {
      const parsed = JSON.parse(json.stdout);
      if (typeof parsed.ok !== "boolean") {
        failures.push("scripts/generate-report-context.js JSON must include ok boolean");
      }
    } catch (error) {
      failures.push(
        `scripts/generate-report-context.js must output valid JSON: ${(error as Error).message}`
      );
    }
  }
}

export { assertDailyDevReportLayer };
