"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.targetProfileValidators = exports.targetGoalValidators = exports.harnessRepositoryValidators = void 0;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const constants_1 = require("./constants");
const contracts_1 = require("./contracts");
// @ts-ignore - JS file with checkJs
const provider_rule_renderer_js_1 = require("../provider-rule-renderer.js");
const hooks_skills_1 = require("./hooks-skills");
const daily_dev_report_1 = require("./daily-dev-report");
const session_start_1 = require("./session-start");
const agent_system_1 = require("./agent-system");
const target_1 = require("./target");
const utils_1 = require("./utils");
const toolFiles = [
    "tool-capabilities/tools/git.md",
    "tool-capabilities/tools/grep-ripgrep.md",
    "tool-capabilities/tools/git-worktree.md",
    "tool-capabilities/tools/markitdown.md",
    "tool-capabilities/tools/code-graph.md",
    "tool-capabilities/tools/git-nexus.md",
];
function requiredPathValidator(paths) {
    return {
        run(context) {
            for (const relativePath of paths) {
                (0, utils_1.assertExists)(context.baseDir, relativePath, context.failures);
            }
        },
        weight: paths.length,
    };
}
const harnessRepositoryValidators = [
    requiredPathValidator(constants_1.requiredFiles),
    {
        run(context) {
            const packageJsonPath = (0, utils_1.resolvePath)(context.baseDir, "package.json");
            if (!node_fs_1.default.existsSync(packageJsonPath)) {
                return;
            }
            const pkg = JSON.parse(node_fs_1.default.readFileSync(packageJsonPath, "utf8"));
            const packageFiles = Array.isArray(pkg.files) ? pkg.files : [];
            for (const relativePath of packageFiles) {
                if (relativePath.startsWith("!")) {
                    continue;
                }
                const normalizedPath = relativePath.replace(/\/$/, "");
                const fullPath = node_path_1.default.join(context.baseDir, normalizedPath);
                if (!node_fs_1.default.existsSync(fullPath)) {
                    context.failures.push(`package.json files entry must exist on disk: ${relativePath}`);
                }
            }
        },
        weight: 1,
    },
    {
        run(context) {
            for (const relativePath of constants_1.commandFiles) {
                (0, utils_1.assertHeadings)(context.baseDir, relativePath, constants_1.commandHeadings, context.failures);
                const fullPath = (0, utils_1.resolvePath)(context.baseDir, relativePath);
                if (node_fs_1.default.existsSync(fullPath)) {
                    (0, contracts_1.assertCommandContractStructure)(relativePath, (0, utils_1.readFile)(context.baseDir, relativePath), context.failures);
                }
            }
        },
        weight: constants_1.commandFiles.length * constants_1.commandHeadings.length,
    },
    {
        run(context) {
            for (const relativePath of constants_1.skillFiles) {
                (0, utils_1.assertHeadings)(context.baseDir, relativePath, constants_1.skillHeadings, context.failures);
                const fullPath = (0, utils_1.resolvePath)(context.baseDir, relativePath);
                if (node_fs_1.default.existsSync(fullPath)) {
                    (0, contracts_1.assertSkillContractStructure)(relativePath, (0, utils_1.readFile)(context.baseDir, relativePath), context.failures);
                }
            }
        },
        weight: constants_1.skillFiles.length * constants_1.skillHeadings.length,
    },
    {
        run(context) {
            for (const relativePath of constants_1.templateFiles) {
                (0, utils_1.assertNonEmpty)(context.baseDir, relativePath, context.failures);
            }
        },
        weight: constants_1.templateFiles.length,
    },
    {
        run(context) {
            for (const relativePath of constants_1.promptTemplateFiles) {
                (0, utils_1.assertHeadings)(context.baseDir, relativePath, constants_1.promptTemplateHeadings, context.failures);
                const fullPath = (0, utils_1.resolvePath)(context.baseDir, relativePath);
                if (node_fs_1.default.existsSync(fullPath)) {
                    (0, contracts_1.assertPromptTemplateContract)(relativePath, (0, utils_1.readFile)(context.baseDir, relativePath), context.failures);
                }
            }
        },
        weight: constants_1.promptTemplateFiles.length * constants_1.promptTemplateHeadings.length,
    },
    {
        run(context) {
            (0, contracts_1.assertVerifyTemplateContract)(context.baseDir, context.failures);
            (0, contracts_1.assertPlanTemplateContract)(context.baseDir, context.failures);
            (0, contracts_1.assertBlockedTemplateContract)(context.baseDir, context.failures);
            (0, contracts_1.assertReviewTemplateContract)(context.baseDir, context.failures);
            (0, contracts_1.assertSessionConfigTemplate)(context.baseDir, context.failures);
            (0, contracts_1.assertAgentsContent)(context.baseDir, context.failures);
            (0, contracts_1.assertPackContract)(context.baseDir, context.failures);
            (0, contracts_1.assertWorkerContract)(context.baseDir, context.failures);
            (0, provider_rule_renderer_js_1.assertRepositoryProviderRules)(context.baseDir, context.failures);
            (0, hooks_skills_1.assertHooksAndSkillsLayer)(context.baseDir, context.failures);
            (0, daily_dev_report_1.assertDailyDevReportLayer)(context.baseDir, context.failures);
            (0, session_start_1.assertSessionStartLayer)(context.baseDir, context.failures);
            (0, agent_system_1.assertAgentSystemLayer)(context.baseDir, context.failures);
        },
        weight: 24,
    },
    {
        run(context) {
            for (const relativePath of toolFiles) {
                (0, contracts_1.assertToolFileContract)(context.baseDir, relativePath, context.failures);
            }
            (0, contracts_1.assertToolRoutingDocs)(context.baseDir, context.failures);
            (0, contracts_1.assertToolDiscoveryScript)(context.baseDir, context.failures);
            (0, contracts_1.assertSessionMemoryDocContracts)(context.baseDir, context.failures);
            (0, contracts_1.assertSessionAwareCommandRouting)(context.baseDir, context.failures);
            (0, contracts_1.assertWorkflowDocumentationContracts)(context.baseDir, context.failures);
            (0, contracts_1.assertSessionStartReferenceContracts)(context.baseDir, context.failures);
        },
        weight: toolFiles.length * 6 + 34,
    },
    {
        run(context) {
            (0, contracts_1.assertHyphenCommandNamingInActiveDocs)(context.baseDir, context.failures);
            (0, contracts_1.assertPublicDemoPolish)(context.baseDir, context.failures);
            (0, contracts_1.assertDogfoodDemoContract)(context.baseDir, context.failures);
        },
        weight: 8,
    },
];
exports.harnessRepositoryValidators = harnessRepositoryValidators;
const targetProfileValidators = [
    {
        run(context) {
            (0, utils_1.assertExists)(context.baseDir, "AGENTS.md", context.failures);
            const harnessDir = (0, utils_1.resolvePath)(context.baseDir, ".harness");
            if (!node_fs_1.default.existsSync(harnessDir)) {
                return;
            }
            for (const relativePath of constants_1.targetHarnessProfileFiles) {
                (0, utils_1.assertExists)(context.baseDir, relativePath, context.failures);
            }
            for (const [relativePath, headings] of constants_1.targetProfileHeadingContracts) {
                (0, utils_1.assertHeadings)(context.baseDir, relativePath, headings, context.failures);
            }
            (0, contracts_1.validateRuntimeCommandSurface)(context.baseDir, context.failures);
        },
        weight: constants_1.targetHarnessProfileFiles.length + constants_1.targetProfileHeadingContracts.length * 3,
    },
    {
        run(context) {
            if (!context.runtime) {
                return;
            }
            const bootstrapPaths = (0, target_1.getRuntimeBootstrapPaths)(context.runtime);
            if (!bootstrapPaths) {
                context.failures.push(`Unsupported runtime: ${context.runtime}`);
                return;
            }
            for (const relativePath of bootstrapPaths) {
                (0, utils_1.assertExists)(context.baseDir, relativePath, context.failures);
            }
        },
        weight: 6,
    },
];
exports.targetProfileValidators = targetProfileValidators;
const targetGoalValidators = [
    ...targetProfileValidators,
    {
        run(context) {
            const statePath = ".harness/STATE.md";
            (0, utils_1.assertExists)(context.baseDir, statePath, context.failures);
            (0, utils_1.assertHeadings)(context.baseDir, statePath, constants_1.sessionStateHeadings, context.failures);
            const stateFullPath = (0, utils_1.resolvePath)(context.baseDir, statePath);
            if (!node_fs_1.default.existsSync(stateFullPath)) {
                return;
            }
            const stateContent = (0, utils_1.readFile)(context.baseDir, statePath);
            const expectedSession = `sessions/${context.goalId}`;
            const activeSession = (0, utils_1.extractMachineField)(stateContent, "session");
            if (activeSession !== expectedSession) {
                context.failures.push(`${statePath} must route target goal validation through session: ${expectedSession}`);
            }
            const currentPlan = (0, utils_1.extractMachineField)(stateContent, "current_plan");
            if (!currentPlan) {
                context.failures.push(`${statePath} must include current_plan for session validation`);
                return;
            }
            if (!/^PLAN-\d+\.md$/i.test(currentPlan)) {
                context.failures.push(`${statePath} current_plan must use session-local PLAN-###.md naming`);
            }
            const sessionDir = `.harness/sessions/${context.goalId}`;
            const sessionFiles = {
                "SESSION.md": constants_1.goalArtifactHeadings["SESSION.md"],
                "GOAL.md": constants_1.goalArtifactHeadings["GOAL.md"],
                [currentPlan]: constants_1.goalArtifactHeadings["PLAN.md"],
                "TASKS.md": constants_1.goalArtifactHeadings["TASKS.md"],
                "VERIFY.md": constants_1.goalArtifactHeadings["VERIFY.md"],
                "REMEMBER.md": constants_1.goalArtifactHeadings["REMEMBER.md"],
            };
            for (const [fileName, headings] of Object.entries(sessionFiles)) {
                const relativePath = `${sessionDir}/${fileName}`;
                (0, utils_1.assertExists)(context.baseDir, relativePath, context.failures);
                (0, utils_1.assertHeadings)(context.baseDir, relativePath, headings, context.failures);
                const fullPath = (0, utils_1.resolvePath)(context.baseDir, relativePath);
                if (fileName === "VERIFY.md" && node_fs_1.default.existsSync(fullPath)) {
                    (0, contracts_1.assertVerifyArtifactContent)(relativePath, (0, utils_1.readFile)(context.baseDir, relativePath), context.failures);
                }
            }
        },
        weight: Object.keys(constants_1.goalArtifactHeadings).length * 5 + constants_1.sessionStateHeadings.length,
    },
];
exports.targetGoalValidators = targetGoalValidators;
