"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertAgentSystemLayer = assertAgentSystemLayer;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const AGENT_SYSTEM_FILES = [
    "agent-system/SYSTEM_PROMPT.md",
    "agent-system/RESPONSE_CONTRACT.md",
    "agent-system/TONE_AND_FORMAT.md",
    "agent-system/OUTPUT_PATTERNS.md",
    "agent-system/provider-adapters/claude.md",
    "agent-system/provider-adapters/cursor.md",
    "agent-system/provider-adapters/codex.md",
    "agent-system/provider-adapters/gemini.md",
];
const COMMAND_FILES = [
    "commands/harness-map.md",
    "commands/harness-start.md",
    "commands/harness-discuss.md",
    "commands/harness-plan.md",
    "commands/harness-run.md",
    "commands/harness-verify.md",
    "commands/harness-ship.md",
    "commands/harness-remember.md",
];
const PROMPT_TEMPLATE_FILES = [
    "prompt-templates/harness-plan.md",
    "prompt-templates/harness-run.md",
    "prompt-templates/harness-verify.md",
    "prompt-templates/harness-ship.md",
    "prompt-templates/blocker-question.md",
    "prompt-templates/code-reviewer.md",
];
const SYSTEM_PROMPT_MARKERS = [
    "Senior AI Engineering Agent",
    "MUST",
    "MUST NOT",
    "Session Start",
    "Evidence",
    "Blocked",
    "Do not implement, verify, or ship before session state is established",
];
const RESPONSE_CONTRACT_MARKERS = [
    "Session Start response",
    "Blocked response",
    "Verification response",
    "Ship / report response",
];
function assertExists(baseDir, relativePath, failures) {
    if (!node_fs_1.default.existsSync(node_path_1.default.join(baseDir, relativePath))) {
        failures.push(`Missing required path: ${relativePath}`);
    }
}
function assertAgentSystemLayer(baseDir, failures) {
    for (const file of AGENT_SYSTEM_FILES) {
        assertExists(baseDir, file, failures);
    }
    const systemPrompt = node_path_1.default.join(baseDir, "agent-system/SYSTEM_PROMPT.md");
    if (node_fs_1.default.existsSync(systemPrompt)) {
        const content = node_fs_1.default.readFileSync(systemPrompt, "utf8");
        for (const marker of SYSTEM_PROMPT_MARKERS) {
            if (!content.includes(marker)) {
                failures.push(`agent-system/SYSTEM_PROMPT.md must include: ${marker}`);
            }
        }
    }
    const responseContract = node_path_1.default.join(baseDir, "agent-system/RESPONSE_CONTRACT.md");
    if (node_fs_1.default.existsSync(responseContract)) {
        const content = node_fs_1.default.readFileSync(responseContract, "utf8");
        for (const marker of RESPONSE_CONTRACT_MARKERS) {
            if (!content.includes(marker)) {
                failures.push(`agent-system/RESPONSE_CONTRACT.md must include: ${marker}`);
            }
        }
    }
    for (const file of COMMAND_FILES) {
        const fullPath = node_path_1.default.join(baseDir, file);
        if (!node_fs_1.default.existsSync(fullPath)) {
            continue;
        }
        const content = node_fs_1.default.readFileSync(fullPath, "utf8");
        if (!/## System Prompt Requirement/i.test(content)) {
            failures.push(`${file} must include System Prompt Requirement section`);
        }
        if (!/agent-system\/SYSTEM_PROMPT\.md/.test(content)) {
            failures.push(`${file} must reference agent-system/SYSTEM_PROMPT.md`);
        }
    }
    for (const file of PROMPT_TEMPLATE_FILES) {
        const fullPath = node_path_1.default.join(baseDir, file);
        if (!node_fs_1.default.existsSync(fullPath)) {
            continue;
        }
        const content = node_fs_1.default.readFileSync(fullPath, "utf8");
        if (!/## System Prompt Requirement/i.test(content)) {
            failures.push(`${file} must include System Prompt Requirement section`);
        }
    }
    const readme = node_path_1.default.join(baseDir, "README.md");
    if (node_fs_1.default.existsSync(readme)) {
        const content = node_fs_1.default.readFileSync(readme, "utf8");
        if (!/## Agent System Prompt/i.test(content)) {
            failures.push("README.md must include Agent System Prompt section");
        }
        if (!/agent-system\/SYSTEM_PROMPT\.md/.test(content)) {
            failures.push("README.md must reference agent-system/SYSTEM_PROMPT.md");
        }
    }
    for (const provider of ["claude", "cursor", "codex", "gemini"]) {
        const template = node_path_1.default.join(baseDir, `rules/providers/${provider === "cursor" ? "cursor/ai-engineering-harness.mdc" : provider === "claude" ? "claude/CLAUDE.md" : provider === "codex" ? "codex/AGENTS.md" : "gemini/GEMINI.md"}`);
        if (node_fs_1.default.existsSync(template)) {
            const content = node_fs_1.default.readFileSync(template, "utf8");
            if (!/agent-system\/SYSTEM_PROMPT\.md/.test(content)) {
                failures.push(`rules/providers ${provider} template must reference agent-system/SYSTEM_PROMPT.md`);
            }
        }
    }
}
