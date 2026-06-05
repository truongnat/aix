"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertDailyDevReportLayer = assertDailyDevReportLayer;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const node_child_process_1 = __importDefault(require("node:child_process"));
const REPORT_TEMPLATES = [
    "templates/REPORT.md",
    "templates/PR_MESSAGE.md",
    "templates/CHANGE_SUMMARY.md",
];
const REPORT_TEMPLATE_HEADINGS = {
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
function assertExists(baseDir, relativePath, failures) {
    if (!node_fs_1.default.existsSync(node_path_1.default.join(baseDir, relativePath))) {
        failures.push(`Missing required path: ${relativePath}`);
    }
}
function assertHeadings(baseDir, relativePath, headings, failures) {
    const fullPath = node_path_1.default.join(baseDir, relativePath);
    if (!node_fs_1.default.existsSync(fullPath)) {
        return;
    }
    const content = node_fs_1.default.readFileSync(fullPath, "utf8");
    for (const heading of headings) {
        if (!content.includes(heading)) {
            failures.push(`${relativePath} is missing heading: ${heading}`);
        }
    }
}
function assertDailyDevReportLayer(baseDir, failures) {
    assertExists(baseDir, "docs/daily-dev-report.md", failures);
    assertExists(baseDir, "workflows/daily-dev-report.md", failures);
    assertExists(baseDir, "scripts/generate-report-context.js", failures);
    for (const template of REPORT_TEMPLATES) {
        assertExists(baseDir, template, failures);
        assertHeadings(baseDir, template, REPORT_TEMPLATE_HEADINGS[template], failures);
    }
    assertExists(baseDir, `${REPORT_SKILL_DIR}/SKILL.md`, failures);
    assertExists(baseDir, `${REPORT_SKILL_DIR}/prompt.md`, failures);
    assertHeadings(baseDir, `${REPORT_SKILL_DIR}/SKILL.md`, ["## Purpose", "## Output Contract", "## Blocking Conditions"], failures);
    for (const reference of [
        "references/daily-report-template.md",
        "references/pr-message-template.md",
        "references/change-summary-template.md",
    ]) {
        assertExists(baseDir, `${REPORT_SKILL_DIR}/${reference}`, failures);
    }
    const shipCommand = node_path_1.default.join(baseDir, "commands/harness-ship.md");
    if (node_fs_1.default.existsSync(shipCommand)) {
        const content = node_fs_1.default.readFileSync(shipCommand, "utf8");
        for (const artifact of ["REPORT.md", "PR_MESSAGE.md", "CHANGE_SUMMARY.md"]) {
            if (!content.includes(artifact)) {
                failures.push(`commands/harness-ship.md must mention ${artifact}`);
            }
        }
    }
    const shipPrompt = node_path_1.default.join(baseDir, "prompt-templates/harness-ship.md");
    if (node_fs_1.default.existsSync(shipPrompt)) {
        const content = node_fs_1.default.readFileSync(shipPrompt, "utf8");
        for (const artifact of ["REPORT.md", "PR_MESSAGE.md", "CHANGE_SUMMARY.md"]) {
            if (!content.includes(artifact)) {
                failures.push(`prompt-templates/harness-ship.md must mention ${artifact}`);
            }
        }
        if (!/report-writer|Daily Report/i.test(content)) {
            failures.push("prompt-templates/harness-ship.md must reference report-writer or daily report workflow");
        }
    }
    const prTemplate = node_path_1.default.join(baseDir, "templates/PR_MESSAGE.md");
    if (node_fs_1.default.existsSync(prTemplate)) {
        const content = node_fs_1.default.readFileSync(prTemplate, "utf8");
        if (!content.includes("### Verification") || !content.includes("### Risks / Rollback")) {
            failures.push("templates/PR_MESSAGE.md must include verification and risks sections");
        }
    }
    const dailyDoc = node_path_1.default.join(baseDir, "docs/daily-dev-report.md");
    if (node_fs_1.default.existsSync(dailyDoc)) {
        const content = node_fs_1.default.readFileSync(dailyDoc, "utf8");
        if (!/block|Blocked/i.test(content)) {
            failures.push("docs/daily-dev-report.md must document blocking behavior");
        }
    }
    const scriptPath = node_path_1.default.join(baseDir, "scripts/generate-report-context.js");
    if (node_fs_1.default.existsSync(scriptPath)) {
        const help = node_child_process_1.default.spawnSync(process.execPath, [scriptPath, "--help"], {
            cwd: baseDir,
            encoding: "utf8",
            timeout: 15000,
        });
        if (help.status !== 0) {
            failures.push("scripts/generate-report-context.js must support --help and exit 0");
        }
        const json = node_child_process_1.default.spawnSync(process.execPath, [scriptPath, "--json"], {
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
        }
        catch (error) {
            failures.push(`scripts/generate-report-context.js must output valid JSON: ${error.message}`);
        }
    }
}
