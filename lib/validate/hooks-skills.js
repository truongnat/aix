"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertHooksAndSkillsLayer = assertHooksAndSkillsLayer;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const node_child_process_1 = __importDefault(require("node:child_process"));
const HOOK_SCRIPTS = [
    "hooks/core/guard-phase.js",
    "hooks/core/record-tool-output.js",
    "hooks/core/record-subagent-result.js",
    "hooks/core/compact-session-memory.js",
    "hooks/core/record-skill-run.js",
    "hooks/core/archive-session-skill.js",
];
const SKILL_TEMPLATES = [
    "templates/SKILL.md",
    "templates/SESSION_SKILL.md",
    "templates/SKILL_DISPOSAL.md",
    "templates/SKILL_RUN.md",
    "templates/WORKFLOW_RUN.md",
];
const WORKFLOW_FILES = [
    "workflows/create-skill.md",
    "workflows/compose-skills.md",
    "workflows/review-and-verify.md",
    "workflows/release-readiness.md",
];
const CAPABILITY_SKILL_DIRS = [
    "skills/tool-discovery",
    "skills/gatekeeper",
    "skills/code-review",
    "skills/verification",
    "skills/report-writer",
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
function assertHooksAndSkillsLayer(baseDir, failures) {
    assertExists(baseDir, "hooks/README.md", failures);
    assertExists(baseDir, "docs/hooks-and-skills-layer.md", failures);
    assertExists(baseDir, "docs/skill-lifecycle.md", failures);
    for (const script of HOOK_SCRIPTS) {
        assertExists(baseDir, script, failures);
        const fullPath = node_path_1.default.join(baseDir, script);
        if (!node_fs_1.default.existsSync(fullPath)) {
            continue;
        }
        const help = node_child_process_1.default.spawnSync(process.execPath, [fullPath, "--help"], {
            cwd: baseDir,
            encoding: "utf8",
            timeout: 15000,
        });
        if (help.status !== 0) {
            failures.push(`${script} must support --help and exit 0`);
        }
    }
    for (const provider of ["claude", "cursor", "codex", "gemini"]) {
        assertExists(baseDir, `hooks/providers/${provider}/README.md`, failures);
    }
    assertExists(baseDir, "hooks/providers/claude/settings.example.json", failures);
    const hooksReadme = node_fs_1.default.existsSync(node_path_1.default.join(baseDir, "hooks/README.md"))
        ? node_fs_1.default.readFileSync(node_path_1.default.join(baseDir, "hooks/README.md"), "utf8")
        : "";
    if (hooksReadme && !/provider-specific|Do not claim identical native hook/i.test(hooksReadme)) {
        failures.push("hooks/README.md must state hooks are provider-specific");
    }
    const skillLifecycle = node_fs_1.default.existsSync(node_path_1.default.join(baseDir, "docs/skill-lifecycle.md"))
        ? node_fs_1.default.readFileSync(node_path_1.default.join(baseDir, "docs/skill-lifecycle.md"), "utf8")
        : "";
    if (skillLifecycle &&
        !/archive\/deactivate, not delete|archive\/deactivate/i.test(skillLifecycle)) {
        failures.push("docs/skill-lifecycle.md must say dispose is archive/deactivate, not delete");
    }
    for (const template of SKILL_TEMPLATES) {
        assertExists(baseDir, template, failures);
    }
    for (const workflow of WORKFLOW_FILES) {
        assertExists(baseDir, workflow, failures);
        assertHeadings(baseDir, workflow, ["## Purpose", "## Stop Conditions"], failures);
    }
    for (const dir of CAPABILITY_SKILL_DIRS) {
        assertExists(baseDir, `${dir}/SKILL.md`, failures);
        assertExists(baseDir, `${dir}/prompt.md`, failures);
        assertHeadings(baseDir, `${dir}/SKILL.md`, ["## Purpose", "## Output Contract", "## Blocking Conditions"], failures);
    }
    const disposalTemplate = node_path_1.default.join(baseDir, "templates/SKILL_DISPOSAL.md");
    if (node_fs_1.default.existsSync(disposalTemplate)) {
        const content = node_fs_1.default.readFileSync(disposalTemplate, "utf8");
        if (!/archive\/deactivate, not delete|status: archived/i.test(content)) {
            failures.push("templates/SKILL_DISPOSAL.md must document archive/dispose semantics");
        }
    }
}
