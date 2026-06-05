"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DOGFOOD_DEMO_PREFIX = exports.ACTIVE_COMMAND_NAMING_PATHS = void 0;
exports.assertAgentsContent = assertAgentsContent;
exports.assertBlockedTemplateContract = assertBlockedTemplateContract;
exports.assertCommandContractStructure = assertCommandContractStructure;
exports.assertDogfoodDemoContract = assertDogfoodDemoContract;
exports.assertHyphenCommandNamingInActiveDocs = assertHyphenCommandNamingInActiveDocs;
exports.assertPackContract = assertPackContract;
exports.assertPlanTemplateContract = assertPlanTemplateContract;
exports.assertPromptTemplateContract = assertPromptTemplateContract;
exports.assertPublicDemoPolish = assertPublicDemoPolish;
exports.assertReviewTemplateContract = assertReviewTemplateContract;
exports.assertSessionAwareCommandRouting = assertSessionAwareCommandRouting;
exports.assertSessionConfigTemplate = assertSessionConfigTemplate;
exports.assertSessionMemoryDocContracts = assertSessionMemoryDocContracts;
exports.assertSessionStartReferenceContracts = assertSessionStartReferenceContracts;
exports.assertSkillContractStructure = assertSkillContractStructure;
exports.assertToolDiscoveryScript = assertToolDiscoveryScript;
exports.assertToolFileContract = assertToolFileContract;
exports.assertToolRoutingDocs = assertToolRoutingDocs;
exports.assertVerifyArtifactContent = assertVerifyArtifactContent;
exports.assertVerifyTemplateContract = assertVerifyTemplateContract;
exports.assertWorkflowDocumentationContracts = assertWorkflowDocumentationContracts;
exports.assertWorkerContract = assertWorkerContract;
exports.validateRuntimeCommandSurface = validateRuntimeCommandSurface;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const node_child_process_1 = __importDefault(require("node:child_process"));
// @ts-ignore - JS file with checkJs
const runtime_command_catalog_js_1 = require("../runtime-command-catalog.js");
const constants_1 = require("./constants");
const utils_1 = require("./utils");
// @ts-ignore - JS file with checkJs
const registry_js_1 = require("../../workers/registry.js");
// @ts-ignore - JS file with checkJs
const worker_claude_adapter_js_1 = require("../worker-claude-adapter.js");
const skillContractSubstanceHeadings = [
    "## When Not To Use",
    "## Inputs",
    "## Output Contract",
    "## Common Failure Modes",
];
const DOGFOOD_DEMO_PREFIX = "examples/dogfood-tiny-node-api";
exports.DOGFOOD_DEMO_PREFIX = DOGFOOD_DEMO_PREFIX;
const CANONICAL_WORKFLOW_ORDER = "harness-start -> harness-discuss -> harness-plan -> harness-run -> harness-verify -> harness-ship -> harness-remember";
const ACTIVE_COMMAND_NAMING_PATHS = [
    "README.md",
    "PACK.md",
    "AGENTS.md",
    "docs/provider-command-matrix.md",
    "docs/command-guardrails.md",
    "docs/runtime-command-surface.md",
    "docs/workflow-visualization.md",
    "docs/provider-native-command-research.md",
    "docs/harness-command-behavior.md",
    "docs/codex-plugin-support.md",
    "docs/npx-cli-ux.md",
    "docs/simple-cli-ux.md",
    "docs/private-capability-cache.md",
    "docs/terminal-wizard-ux.md",
    "runtime-command-catalog.js",
    "lib/command-surface-report.js",
    "lib/cli-ui.js",
];
exports.ACTIVE_COMMAND_NAMING_PATHS = ACTIVE_COMMAND_NAMING_PATHS;
const FORBIDDEN_COLON_COMMAND_PATTERNS = [
    { pattern: /\/harness:[a-z][a-z0-9-]*/i, label: "/harness:…" },
    { pattern: /\bharness:[a-z][a-z0-9-]*\b/i, label: "harness:…" },
    { pattern: /\/harness [a-z][a-z0-9-]*/i, label: "/harness …" },
    { pattern: /\bharness_[a-z][a-z0-9-]*\b/i, label: "harness_…" },
];
function assertCommandContractStructure(relativePath, content, failures) {
    for (const [heading, label] of [
        ["## Preconditions", "Preconditions"],
        ["## Required Outputs", "Required Outputs"],
    ]) {
        const body = (0, utils_1.extractMarkdownSection)(content, heading);
        if (body !== null && !(0, utils_1.hasSubstantiveSectionBody)(body)) {
            failures.push(`${relativePath}: ${label} must contain substantive contract content (not empty or placeholder-only)`);
        }
    }
    const redirectBody = (0, utils_1.extractMarkdownSection)(content, "## Redirect Behavior");
    if (redirectBody !== null && !utils_1.HARNESS_COMMAND_PATTERN.test(redirectBody)) {
        failures.push(`${relativePath}: Redirect Behavior must mention at least one harness command (harness-<name>)`);
    }
    const failureBody = (0, utils_1.extractMarkdownSection)(content, "## Failure Conditions");
    if (failureBody !== null && !(0, utils_1.hasConcreteFailureRule)(failureBody)) {
        failures.push(`${relativePath}: Failure Conditions must include at least one concrete negative rule`);
    }
}
function assertSkillContractStructure(relativePath, content, failures) {
    for (const heading of skillContractSubstanceHeadings) {
        const body = (0, utils_1.extractMarkdownSection)(content, heading);
        if (body !== null && !(0, utils_1.hasSubstantiveSectionBody)(body, { minChars: 10 })) {
            failures.push(`${relativePath}: ${heading.replace("## ", "")} must contain substantive contract content`);
        }
    }
}
function assertVerifyArtifactContent(relativePath, content, failures, options = {}) {
    const isTemplate = options.isTemplate ?? false;
    if (!/status:\s*(pending|passed|failed|blocked|partial|pending human verification)/i.test(content)) {
        failures.push(`${relativePath} must include a machine-readable status field`);
    }
    if (!/freshness:\s*.+/i.test(content)) {
        failures.push(`${relativePath} must include a machine-readable freshness field`);
    }
    const testsBody = (0, utils_1.extractMarkdownSection)(content, "## Tests Run");
    if (testsBody === null || !(0, utils_1.hasSubstantiveSectionBody)(testsBody, { minChars: 20 })) {
        failures.push(`${relativePath}: Tests Run must contain at least one substantive verification entry`);
    }
    const gapsBody = (0, utils_1.extractMarkdownSection)(content, "## Known Gaps");
    if (gapsBody !== null) {
        const onlyNone = /^\s*-?\s*None\s*\.?\s*$/im.test(gapsBody.trim());
        if (onlyNone || !(0, utils_1.hasSubstantiveSectionBody)(gapsBody, { minChars: 8 })) {
            failures.push(`${relativePath}: Known Gaps must contain substantive pending wording`);
        }
    }
    if (isTemplate) {
        const evidenceBody = (0, utils_1.extractMarkdownSection)(content, "## Evidence");
        if (evidenceBody === null || !(0, utils_1.hasSubstantiveSectionBody)(evidenceBody, { minChars: 20 })) {
            failures.push(`${relativePath}: Evidence must contain structured summary prompts`);
        }
    }
}
function assertVerifyTemplateContract(baseDir, failures) {
    const relativePath = "templates/VERIFY.md";
    if (!node_fs_1.default.existsSync((0, utils_1.resolvePath)(baseDir, relativePath))) {
        failures.push(`Missing required path: ${relativePath}`);
        return;
    }
    assertVerifyArtifactContent(relativePath, (0, utils_1.readFile)(baseDir, relativePath), failures, {
        isTemplate: true,
    });
}
function assertPlanTemplateContract(baseDir, failures) {
    const relativePath = "templates/PLAN.md";
    if (!node_fs_1.default.existsSync((0, utils_1.resolvePath)(baseDir, relativePath))) {
        failures.push(`Missing required path: ${relativePath}`);
        return;
    }
    const content = (0, utils_1.readFile)(baseDir, relativePath);
    for (const heading of ["## Approval Status", "## Success Criteria", "## Approval Checkpoints"]) {
        if (!content.includes(heading)) {
            failures.push(`${relativePath} is missing heading: ${heading}`);
        }
    }
    if (!/status:\s*(draft|approved|blocked)/i.test(content)) {
        failures.push(`${relativePath} must include approval status field`);
    }
}
function assertReviewTemplateContract(baseDir, failures) {
    const relativePath = "templates/REVIEW.md";
    if (!node_fs_1.default.existsSync((0, utils_1.resolvePath)(baseDir, relativePath))) {
        failures.push(`Missing required path: ${relativePath}`);
        return;
    }
    const content = (0, utils_1.readFile)(baseDir, relativePath);
    for (const heading of [
        "## Findings",
        "## Missing Verification",
        "## Evidence Reviewed",
        "## Ship Blockers",
        "## Review Status",
    ]) {
        if (!content.includes(heading)) {
            failures.push(`${relativePath} is missing heading: ${heading}`);
        }
    }
}
function assertBlockedTemplateContract(baseDir, failures) {
    const relativePath = "templates/BLOCKED.md";
    if (!node_fs_1.default.existsSync((0, utils_1.resolvePath)(baseDir, relativePath))) {
        failures.push(`Missing required path: ${relativePath}`);
        return;
    }
    const content = (0, utils_1.readFile)(baseDir, relativePath);
    for (const heading of [
        "# Blocked",
        "## Status",
        "## Current Command",
        "## Missing Preconditions",
        "## Blocking Questions",
        "## Suggested Next Command",
        "## Notes",
    ]) {
        if (!content.includes(heading)) {
            failures.push(`${relativePath} is missing heading: ${heading}`);
        }
    }
}
function assertPromptTemplateContract(relativePath, content, failures) {
    for (const heading of constants_1.promptTemplateHeadings) {
        if (!content.includes(heading)) {
            failures.push(`${relativePath} is missing heading: ${heading}`);
        }
    }
    if (/prompt-templates\/harness-(run|verify|ship)\.md$/.test(relativePath) &&
        !content.includes("### Blocked")) {
        failures.push(`${relativePath} must include a ### Blocked output branch`);
    }
    if (/prompt-templates\/blocker-question\.md$/.test(relativePath)) {
        if (!/stop after asking|workflow is paused|no further phase was executed/i.test(content)) {
            failures.push(`${relativePath} must explicitly stop after asking the blocking question`);
        }
    }
}
function assertAgentsContent(baseDir, failures) {
    const relativePath = "AGENTS.md";
    if (!node_fs_1.default.existsSync((0, utils_1.resolvePath)(baseDir, relativePath))) {
        return;
    }
    const content = (0, utils_1.readFile)(baseDir, relativePath);
    for (const heading of [
        "## Completion Gate",
        "## Stop Conditions",
        "## Wrong Phase Behavior",
        "## Memory Discipline",
    ]) {
        if (!content.includes(heading)) {
            failures.push(`${relativePath} is missing heading: ${heading}`);
        }
    }
}
function assertPackContract(baseDir, failures) {
    const relativePath = "PACK.md";
    if (!node_fs_1.default.existsSync((0, utils_1.resolvePath)(baseDir, relativePath))) {
        failures.push(`Missing required path: ${relativePath}`);
        return;
    }
    const content = (0, utils_1.readFile)(baseDir, relativePath);
    for (const heading of constants_1.packRequiredHeadings) {
        if (!content.includes(heading)) {
            failures.push(`${relativePath} is missing heading: ${heading}`);
        }
    }
}
function assertToolFileContract(baseDir, relativePath, failures) {
    if (!node_fs_1.default.existsSync((0, utils_1.resolvePath)(baseDir, relativePath))) {
        failures.push(`Missing required path: ${relativePath}`);
        return;
    }
    const content = (0, utils_1.readFile)(baseDir, relativePath);
    for (const heading of constants_1.toolFileHeadings) {
        if (!content.includes(heading)) {
            failures.push(`${relativePath} is missing heading: ${heading}`);
        }
    }
}
function assertToolDiscoveryScript(baseDir, failures) {
    const relativePath = "scripts/discover-tools.js";
    const fullPath = (0, utils_1.resolvePath)(baseDir, relativePath);
    if (!node_fs_1.default.existsSync(fullPath)) {
        failures.push(`Missing required path: ${relativePath}`);
        return;
    }
    for (const args of [[], ["--markdown"]]) {
        const result = node_child_process_1.default.spawnSync(process.execPath, [fullPath, ...args], {
            cwd: baseDir,
            encoding: "utf8",
            timeout: 30000,
        });
        if (result.status !== 0) {
            failures.push(`${relativePath} must exit 0 for ${args.length === 0 ? "JSON mode" : "--markdown mode"}`);
            continue;
        }
        if (args.length === 0) {
            try {
                const parsed = JSON.parse(result.stdout);
                for (const key of constants_1.TOOL_DISCOVERY_KEYS) {
                    if (!Object.prototype.hasOwnProperty.call(parsed, key)) {
                        failures.push(`${relativePath} JSON output must include key: ${key}`);
                    }
                }
            }
            catch (error) {
                failures.push(`${relativePath} must output valid JSON in default mode`);
            }
        }
        else if (!/Tool Context|Code search|Git diff|Routing/i.test(result.stdout)) {
            failures.push(`${relativePath} --markdown output must be human-readable`);
        }
    }
}
function assertToolRoutingDocs(baseDir, failures) {
    const relativePath = "tool-capabilities/TOOL_ROUTING.md";
    if (!node_fs_1.default.existsSync((0, utils_1.resolvePath)(baseDir, relativePath))) {
        failures.push(`Missing required path: ${relativePath}`);
        return;
    }
    const content = (0, utils_1.readFile)(baseDir, relativePath);
    for (const capability of [
        "code-search",
        "diff-review",
        "history-review",
        "parallel-work",
        "document-to-markdown",
        "repo-structure",
        "dependency-scan",
    ]) {
        if (!content.includes(capability)) {
            failures.push(`${relativePath} must define capability route: ${capability}`);
        }
    }
}
function assertSessionMemoryDocContracts(baseDir, failures) {
    const sessionDocPath = "docs/session-memory.md";
    const migrationDocPath = "docs/memory-migration.md";
    if (!node_fs_1.default.existsSync((0, utils_1.resolvePath)(baseDir, sessionDocPath))) {
        failures.push(`Missing required path: ${sessionDocPath}`);
    }
    else {
        const content = (0, utils_1.readFile)(baseDir, sessionDocPath);
        if (!/files are the source of truth/i.test(content)) {
            failures.push(`${sessionDocPath} must state that files are the source of truth`);
        }
        if (!/root `?\.harness`? is an index and router/i.test(content)) {
            failures.push(`${sessionDocPath} must define root .harness as the index/router`);
        }
        if (!/sessions own working artifacts/i.test(content)) {
            failures.push(`${sessionDocPath} must state that sessions own working artifacts`);
        }
    }
    if (!node_fs_1.default.existsSync((0, utils_1.resolvePath)(baseDir, migrationDocPath))) {
        failures.push(`Missing required path: ${migrationDocPath}`);
    }
    else {
        const content = (0, utils_1.readFile)(baseDir, migrationDocPath);
        if (!/legacy/i.test(content) || !/preserve/i.test(content) || !/ambiguous/i.test(content)) {
            failures.push(`${migrationDocPath} must explain legacy migration, preservation, and ambiguity handling`);
        }
    }
}
function assertSessionConfigTemplate(baseDir, failures) {
    const relativePath = "templates/harness-config.json";
    if (!node_fs_1.default.existsSync((0, utils_1.resolvePath)(baseDir, relativePath))) {
        failures.push(`Missing required path: ${relativePath}`);
        return;
    }
    try {
        const config = JSON.parse((0, utils_1.readFile)(baseDir, relativePath));
        if (config?.memory?.backend !== "files") {
            failures.push(`${relativePath} must set memory.backend to "files"`);
        }
        if (config?.memory?.sourceOfTruth !== "files") {
            failures.push(`${relativePath} must set memory.sourceOfTruth to "files"`);
        }
    }
    catch (error) {
        failures.push(`${relativePath} must contain valid JSON`);
    }
}
function assertSessionAwareCommandRouting(baseDir, failures) {
    for (const relativePath of constants_1.sessionAwareCommandFiles) {
        const fullPath = (0, utils_1.resolvePath)(baseDir, relativePath);
        if (!node_fs_1.default.existsSync(fullPath)) {
            failures.push(`Missing required path: ${relativePath}`);
            continue;
        }
        const content = (0, utils_1.readFile)(baseDir, relativePath);
        if (!/\.harness\/STATE\.md/.test(content)) {
            failures.push(`${relativePath} must reference .harness/STATE.md`);
        }
        if (!/sessions\/<active-session>|active session/i.test(content)) {
            failures.push(`${relativePath} must reference active-session routing`);
        }
    }
}
function assertWorkflowDocumentationContracts(baseDir, failures) {
    const startDoc = "commands/harness-start.md";
    if (node_fs_1.default.existsSync((0, utils_1.resolvePath)(baseDir, startDoc))) {
        const content = (0, utils_1.readFile)(baseDir, startDoc);
        if (!/session-scoped/i.test(content) ||
            !/important paths|quality gates|provider entrypoints|context mapping/i.test(content)) {
            failures.push(`${startDoc} must describe Session Start as a session-scoped context restore`);
        }
    }
    const mapDoc = "commands/harness-map.md";
    if (node_fs_1.default.existsSync((0, utils_1.resolvePath)(baseDir, mapDoc))) {
        const content = (0, utils_1.readFile)(baseDir, mapDoc);
        if (!/compatibility|manual context refresh/i.test(content) ||
            !/not required in the normal workflow|not teach it as part of the primary workflow/i.test(content)) {
            failures.push(`${mapDoc} must describe compatibility or manual context refresh semantics`);
        }
    }
    for (const relativePath of [
        "workflows/core-loop.md",
        "workflows/feature.md",
        "workflows/bugfix.md",
        "workflows/refactor.md",
        "workflows/incident.md",
    ]) {
        if (!node_fs_1.default.existsSync((0, utils_1.resolvePath)(baseDir, relativePath))) {
            continue;
        }
        const content = (0, utils_1.readFile)(baseDir, relativePath);
        if (!content.includes(CANONICAL_WORKFLOW_ORDER)) {
            failures.push(`${relativePath} must use canonical ${CANONICAL_WORKFLOW_ORDER} order`);
        }
    }
    for (const relativePath of [
        "commands/harness-map.md",
        "commands/harness-plan.md",
        "commands/harness-run.md",
        "commands/harness-verify.md",
        "commands/harness-ship.md",
    ]) {
        if (!node_fs_1.default.existsSync((0, utils_1.resolvePath)(baseDir, relativePath))) {
            continue;
        }
        const content = (0, utils_1.readFile)(baseDir, relativePath);
        if (!content.includes("## Tool Discovery") || !content.includes("## Tool Routing")) {
            failures.push(`${relativePath} must include ## Tool Discovery and ## Tool Routing sections`);
        }
    }
    for (const relativePath of [
        "prompt-templates/harness-plan.md",
        "prompt-templates/harness-run.md",
        "prompt-templates/harness-verify.md",
        "prompt-templates/harness-ship.md",
        "prompt-templates/code-reviewer.md",
    ]) {
        if (!node_fs_1.default.existsSync((0, utils_1.resolvePath)(baseDir, relativePath))) {
            continue;
        }
        const content = (0, utils_1.readFile)(baseDir, relativePath);
        if (!content.includes("### Tool Discovery") || !content.includes("### Tool Routing")) {
            failures.push(`${relativePath} must include ### Tool Discovery and ### Tool Routing sections`);
        }
    }
}
function assertSessionStartReferenceContracts(baseDir, failures) {
    const canonicalFlow = "Session Start → Discuss → Plan → Run → Verify → Ship → Remember";
    const readmePath = "README.md";
    if (node_fs_1.default.existsSync((0, utils_1.resolvePath)(baseDir, readmePath))) {
        const content = (0, utils_1.readFile)(baseDir, readmePath);
        if (!content.includes(canonicalFlow)) {
            failures.push(`${readmePath} must include the canonical ${canonicalFlow} flow`);
        }
        const requiredRefs = [
            ".harness/context.md",
            ".harness/history/events.jsonl",
            ".harness/memory/",
        ];
        if (!requiredRefs.every((ref) => content.includes(ref))) {
            failures.push(`${readmePath} must reference .harness/context.md, .harness/history/events.jsonl, and .harness/memory/`);
        }
    }
    const phasePath = "docs/phase-discipline.md";
    if (node_fs_1.default.existsSync((0, utils_1.resolvePath)(baseDir, phasePath))) {
        const content = (0, utils_1.readFile)(baseDir, phasePath);
        if (!content.includes(canonicalFlow)) {
            failures.push(`${phasePath} must include the canonical ${canonicalFlow} flow`);
        }
    }
    const quickPath = "docs/internal/process-artifacts/QUICK_REFERENCE.md";
    if (node_fs_1.default.existsSync((0, utils_1.resolvePath)(baseDir, quickPath))) {
        const content = (0, utils_1.readFile)(baseDir, quickPath);
        if (!content.includes("START → DISCUSS → PLAN → RUN → VERIFY → SHIP → REMEMBER")) {
            failures.push(`${quickPath} must include the canonical START → DISCUSS → PLAN → RUN → VERIFY → SHIP → REMEMBER flow`);
        }
    }
}
function assertHyphenCommandNamingInActiveDocs(baseDir, failures) {
    for (const relativePath of ACTIVE_COMMAND_NAMING_PATHS) {
        const fullPath = (0, utils_1.resolvePath)(baseDir, relativePath);
        if (!node_fs_1.default.existsSync(fullPath)) {
            continue;
        }
        const content = (0, utils_1.readFile)(baseDir, relativePath);
        for (const { pattern, label } of FORBIDDEN_COLON_COMMAND_PATTERNS) {
            if (pattern.test(content)) {
                failures.push(`${relativePath} must use hyphen-form command IDs (harness-plan), not colon form (${label})`);
                break;
            }
        }
    }
}
function assertPublicDemoPolish(baseDir, failures) {
    const readmePath = "README.md";
    if (!node_fs_1.default.existsSync((0, utils_1.resolvePath)(baseDir, readmePath))) {
        failures.push(`Missing required path: ${readmePath}`);
        return;
    }
    const readme = (0, utils_1.readFile)(baseDir, readmePath);
    if (!readme.includes("examples/dogfood-tiny-node-api")) {
        failures.push(`${readmePath} must link to examples/dogfood-tiny-node-api`);
    }
}
function assertDogfoodDemoContract(baseDir, failures) {
    const verifyPath = `${DOGFOOD_DEMO_PREFIX}/.harness/VERIFY.md`;
    if (!node_fs_1.default.existsSync((0, utils_1.resolvePath)(baseDir, verifyPath))) {
        return;
    }
    const verify = (0, utils_1.readFile)(baseDir, verifyPath);
    if (!/status:\s*passed/i.test(verify)) {
        failures.push(`${verifyPath} must include status: passed`);
    }
}
function validateRuntimeCommandSurface(baseDir, failures) {
    const cacheDir = node_path_1.default.join(baseDir, ".ai-harness");
    if (!node_fs_1.default.existsSync(cacheDir)) {
        return;
    }
    (0, utils_1.assertExists)(baseDir, ".ai-harness/activation.md", failures);
    (0, utils_1.assertExists)(baseDir, ".ai-harness/manifest.json", failures);
    const planCatalogPath = node_path_1.default.join(baseDir, ".ai-harness/runtime-commands/harness-plan.md");
    if (node_fs_1.default.existsSync(planCatalogPath)) {
        const content = node_fs_1.default.readFileSync(planCatalogPath, "utf8");
        if (!content.includes(".ai-harness/activation.md")) {
            failures.push(".ai-harness/runtime-commands/harness-plan.md must reference .ai-harness/activation.md");
        }
    }
    const claudePlan = node_path_1.default.join(baseDir, ".claude/commands/harness-plan.md");
    if (node_fs_1.default.existsSync(claudePlan) && !(0, runtime_command_catalog_js_1.fileReferencesActivation)(claudePlan)) {
        failures.push(".claude/commands/harness-plan.md must reference .ai-harness/activation.md");
    }
}
function assertWorkerRunTemplateContract(baseDir, failures) {
    const relativePath = "templates/WORKER_RUN.md";
    if (!node_fs_1.default.existsSync((0, utils_1.resolvePath)(baseDir, relativePath))) {
        failures.push(`Missing required path: ${relativePath}`);
        return;
    }
    const content = (0, utils_1.readFile)(baseDir, relativePath);
    for (const heading of [
        "## Metadata",
        "## Task",
        "## Result Envelope",
        "## Full Result",
        "## Main Agent Decision",
        "## Next Allowed Command",
    ]) {
        if (!content.includes(heading)) {
            failures.push(`${relativePath} is missing heading: ${heading}`);
        }
    }
}
function assertWorkerRegistryContract(baseDir, failures) {
    const relativePath = "workers/registry.js";
    (0, utils_1.assertExists)(baseDir, relativePath, failures);
    const registryPath = (0, utils_1.resolvePath)(baseDir, relativePath);
    if (!node_fs_1.default.existsSync(registryPath)) {
        return;
    }
    let registryModule;
    try {
        delete require.cache[require.resolve(registryPath)];
        registryModule = require(registryPath);
    }
    catch (error) {
        failures.push(`${relativePath} must load cleanly: ${error.message}`);
        return;
    }
    if (!Array.isArray(registryModule.workers) || registryModule.workers.length === 0) {
        failures.push(`${relativePath} must export workers array`);
        return;
    }
    for (const expectedId of registry_js_1.WORKER_IDS) {
        const entry = registryModule.workers.find((worker) => worker.id === expectedId);
        if (!entry) {
            failures.push(`${relativePath} is missing canonical worker: ${expectedId}`);
        }
    }
}
function assertWorkerDefinitionContract(baseDir, failures) {
    for (const worker of registry_js_1.workers) {
        const relativePath = worker.definitionPath;
        (0, utils_1.assertExists)(baseDir, relativePath, failures);
        const fullPath = (0, utils_1.resolvePath)(baseDir, relativePath);
        if (!node_fs_1.default.existsSync(fullPath)) {
            continue;
        }
        const content = (0, utils_1.readFile)(baseDir, relativePath);
        const frontmatter = (0, utils_1.parseFrontmatter)(content);
        if (!frontmatter) {
            failures.push(`${relativePath} must include YAML frontmatter`);
            continue;
        }
        for (const field of ["id", "role", "mode", "writeAccess", "canDispatch", "resultSchema"]) {
            if (!frontmatter[field]) {
                failures.push(`${relativePath} frontmatter must include ${field}`);
            }
        }
        if (!Array.isArray(frontmatter.requiredInputs) || frontmatter.requiredInputs.length === 0) {
            failures.push(`${relativePath} frontmatter must include requiredInputs list`);
        }
        const providerSupport = (0, utils_1.parseNestedFrontmatterMap)(content, "providerSupport");
        if (!providerSupport) {
            failures.push(`${relativePath} frontmatter must include providerSupport map`);
        }
        else {
            for (const value of Object.values(providerSupport)) {
                if (!registry_js_1.VALID_PROVIDER_SUPPORT.includes(value)) {
                    failures.push(`${relativePath} has invalid providerSupport value: ${value}`);
                }
            }
        }
        if (String(frontmatter.id) !== worker.id) {
            failures.push(`${relativePath} frontmatter id must match registry id ${worker.id}`);
        }
        if (String(frontmatter.canDispatch) !== "false") {
            failures.push(`${relativePath} must set canDispatch: false in v1`);
        }
        if (String(frontmatter.writeAccess) !== worker.writeAccess) {
            failures.push(`${relativePath} writeAccess must match registry (${worker.writeAccess})`);
        }
        if (!content.includes("### Agent Result")) {
            failures.push(`${relativePath} must include ### Agent Result envelope`);
        }
    }
    const readOnlyWorkers = registry_js_1.workers.filter((worker) => worker.writeAccess === "none");
    for (const worker of readOnlyWorkers) {
        if (worker.writeAccess !== "none") {
            failures.push(`Worker ${worker.id} must remain read-only in v1`);
        }
    }
    const fixer = registry_js_1.workers.find((worker) => worker.id === "fixer");
    if (fixer && fixer.writeAccess !== "write") {
        failures.push("fixer must be explicitly write-enabled");
    }
}
function assertWorkerAwareCommandDocs(baseDir, failures) {
    for (const [relativePath, workersExpected] of [
        ["commands/harness-verify.md", ["reviewer", "verifier"]],
        ["commands/harness-ship.md", ["gatekeeper"]],
        ["commands/harness-run.md", ["fixer"]],
    ]) {
        const fullPath = (0, utils_1.resolvePath)(baseDir, relativePath);
        if (!node_fs_1.default.existsSync(fullPath)) {
            continue;
        }
        const content = (0, utils_1.readFile)(baseDir, relativePath);
        if (!/delegated worker|worker contract|WORKER_RUN/i.test(content)) {
            failures.push(`${relativePath} must reference delegated worker contract consumption`);
        }
        for (const workerId of workersExpected) {
            if (!content.includes(workerId)) {
                failures.push(`${relativePath} must reference worker: ${workerId}`);
            }
        }
    }
}
function assertWorkerContract(baseDir, failures) {
    assertWorkerRegistryContract(baseDir, failures);
    assertWorkerDefinitionContract(baseDir, failures);
    assertWorkerRunTemplateContract(baseDir, failures);
    assertWorkerAwareCommandDocs(baseDir, failures);
    const claudeAgentsDir = (0, utils_1.resolvePath)(baseDir, ".claude/agents");
    if (node_fs_1.default.existsSync(claudeAgentsDir)) {
        (0, worker_claude_adapter_js_1.assertClaudeWorkerSurface)(baseDir, failures);
    }
    const delegatedWorkersDoc = "docs/delegated-workers.md";
    if (node_fs_1.default.existsSync((0, utils_1.resolvePath)(baseDir, delegatedWorkersDoc))) {
        const content = (0, utils_1.readFile)(baseDir, delegatedWorkersDoc);
        for (const level of registry_js_1.VALID_PROVIDER_SUPPORT) {
            if (!content.includes(level)) {
                failures.push(`${delegatedWorkersDoc} must document support level: ${level}`);
            }
        }
        if (!/Claude.*native|native.*Claude/i.test(content)) {
            failures.push(`${delegatedWorkersDoc} must describe Claude as native support`);
        }
        if (!/Cursor.*adapter|adapter.*Cursor/i.test(content)) {
            failures.push(`${delegatedWorkersDoc} must describe Cursor as adapter support`);
        }
        if (!/Codex.*adapter|adapter.*Codex/i.test(content)) {
            failures.push(`${delegatedWorkersDoc} must describe Codex as adapter support`);
        }
    }
}
