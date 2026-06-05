"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertSessionStartLayer = assertSessionStartLayer;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const SESSION_START_DOC = "docs/session-start.md";
const SESSION_START_TEMPLATE = "templates/SESSION_START.md";
const SESSION_START_HEADINGS = [
    "## Status",
    "## Active Session",
    "## Current Goal",
    "## Current Phase",
    "## Loaded Memory",
    "## Unfinished Work",
    "## Blocked State",
    "## Hazards",
    "## Tool Context",
    "## Next Allowed Command",
    "## Routing Question",
];
const COMMANDS_REQUIRING_SESSION_STATE = [
    "commands/harness-plan.md",
    "commands/harness-run.md",
    "commands/harness-verify.md",
    "commands/harness-ship.md",
    "commands/harness-remember.md",
];
const PROMPT_TEMPLATES_REQUIRING_SESSION_START = [
    "prompt-templates/harness-plan.md",
    "prompt-templates/harness-run.md",
    "prompt-templates/harness-verify.md",
    "prompt-templates/harness-ship.md",
];
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
function assertSessionStartLayer(baseDir, failures) {
    assertExists(baseDir, SESSION_START_DOC, failures);
    assertExists(baseDir, SESSION_START_TEMPLATE, failures);
    assertHeadings(baseDir, SESSION_START_TEMPLATE, SESSION_START_HEADINGS, failures);
    const startCommand = node_path_1.default.join(baseDir, "commands/harness-start.md");
    if (node_fs_1.default.existsSync(startCommand)) {
        const content = node_fs_1.default.readFileSync(startCommand, "utf8");
        if (!/Session Start/i.test(content)) {
            failures.push("commands/harness-start.md must mention Session Start");
        }
        if (!/SESSION_START\.md|Session Start summary/i.test(content)) {
            failures.push("commands/harness-start.md must reference Session Start output artifact or summary");
        }
    }
    for (const relativePath of COMMANDS_REQUIRING_SESSION_STATE) {
        const fullPath = node_path_1.default.join(baseDir, relativePath);
        if (!node_fs_1.default.existsSync(fullPath)) {
            failures.push(`Missing required path: ${relativePath}`);
            continue;
        }
        const content = node_fs_1.default.readFileSync(fullPath, "utf8");
        if (!/Session Start|harness-start/i.test(content)) {
            failures.push(`${relativePath} must mention Session Start or harness-start requirement`);
        }
        if (!/active session|session state/i.test(content)) {
            failures.push(`${relativePath} must mention active session or session state requirement`);
        }
    }
    for (const relativePath of PROMPT_TEMPLATES_REQUIRING_SESSION_START) {
        const fullPath = node_path_1.default.join(baseDir, relativePath);
        if (!node_fs_1.default.existsSync(fullPath)) {
            continue;
        }
        const content = node_fs_1.default.readFileSync(fullPath, "utf8");
        if (!/Session Start Requirement/i.test(content)) {
            failures.push(`${relativePath} must include Session Start Requirement section`);
        }
    }
    const stateTemplate = node_path_1.default.join(baseDir, "templates/STATE.md");
    if (node_fs_1.default.existsSync(stateTemplate)) {
        const content = node_fs_1.default.readFileSync(stateTemplate, "utf8");
        if (!/## Active Session/i.test(content)) {
            failures.push("templates/STATE.md must include active session section");
        }
        if (!/last_session_start|Last Session Start/i.test(content)) {
            failures.push("templates/STATE.md must include last session start field");
        }
        if (!/Next Allowed Command/i.test(content)) {
            failures.push("templates/STATE.md must include next allowed command section");
        }
    }
    const indexTemplate = node_path_1.default.join(baseDir, "templates/INDEX.md");
    if (node_fs_1.default.existsSync(indexTemplate)) {
        const content = node_fs_1.default.readFileSync(indexTemplate, "utf8");
        if (!/## Active Session/i.test(content)) {
            failures.push("templates/INDEX.md must include active session section");
        }
    }
    const agents = node_path_1.default.join(baseDir, "AGENTS.md");
    if (node_fs_1.default.existsSync(agents)) {
        const content = node_fs_1.default.readFileSync(agents, "utf8");
        if (!/## Session Start/i.test(content)) {
            failures.push("AGENTS.md must include Session Start section");
        }
    }
    const readme = node_path_1.default.join(baseDir, "README.md");
    if (node_fs_1.default.existsSync(readme)) {
        const content = node_fs_1.default.readFileSync(readme, "utf8");
        if (!/Session Start/i.test(content)) {
            failures.push("README.md must mention Session Start");
        }
    }
}
