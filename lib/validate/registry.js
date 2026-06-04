const {
  commandFiles,
  commandHeadings,
  goalArtifactHeadings,
  promptTemplateFiles,
  promptTemplateHeadings,
  requiredFiles,
  sessionStateHeadings,
  skillFiles,
  skillHeadings,
  targetHarnessProfileFiles,
  targetProfileHeadingContracts,
  templateFiles
} = require("./constants.js");
const {
  assertAgentsContent,
  assertBlockedTemplateContract,
  assertCommandContractStructure,
  assertDogfoodDemoContract,
  assertHyphenCommandNamingInActiveDocs,
  assertPackContract,
  assertPlanTemplateContract,
  assertPromptTemplateContract,
  assertPublicDemoPolish,
  assertReviewTemplateContract,
  assertSessionAwareCommandRouting,
  assertSessionConfigTemplate,
  assertSessionMemoryDocContracts,
  assertSkillContractStructure,
  assertToolDiscoveryScript,
  assertToolFileContract,
  assertToolRoutingDocs,
  assertVerifyArtifactContent,
  assertVerifyTemplateContract,
  assertWorkerContract,
  validateRuntimeCommandSurface
} = require("./contracts.js");
const { assertRepositoryProviderRules } = require("../provider-rule-renderer.js");
const { assertHooksAndSkillsLayer } = require("./hooks-skills.js");
const { assertDailyDevReportLayer } = require("./daily-dev-report.js");
const { getRuntimeBootstrapPaths } = require("./target.js");
const {
  assertExists,
  assertHeadings,
  assertNonEmpty,
  extractMachineField,
  readFile,
  resolvePath
} = require("./utils.js");

const toolFiles = [
  "tool-capabilities/tools/git.md",
  "tool-capabilities/tools/grep-ripgrep.md",
  "tool-capabilities/tools/git-worktree.md",
  "tool-capabilities/tools/markitdown.md",
  "tool-capabilities/tools/code-graph.md",
  "tool-capabilities/tools/git-nexus.md"
];

function requiredPathValidator(paths) {
  return {
    run(context) {
      for (const relativePath of paths) {
        assertExists(context.baseDir, relativePath, context.failures);
      }
    },
    weight: paths.length
  };
}

const harnessRepositoryValidators = [
  requiredPathValidator(requiredFiles),
  {
    run(context) {
      for (const relativePath of commandFiles) {
        assertHeadings(context.baseDir, relativePath, commandHeadings, context.failures);
        const fullPath = resolvePath(context.baseDir, relativePath);
        if (require("node:fs").existsSync(fullPath)) {
          assertCommandContractStructure(relativePath, readFile(context.baseDir, relativePath), context.failures);
        }
      }
    },
    weight: commandFiles.length * commandHeadings.length
  },
  {
    run(context) {
      for (const relativePath of skillFiles) {
        assertHeadings(context.baseDir, relativePath, skillHeadings, context.failures);
        const fullPath = resolvePath(context.baseDir, relativePath);
        if (require("node:fs").existsSync(fullPath)) {
          assertSkillContractStructure(relativePath, readFile(context.baseDir, relativePath), context.failures);
        }
      }
    },
    weight: skillFiles.length * skillHeadings.length
  },
  {
    run(context) {
      for (const relativePath of templateFiles) {
        assertNonEmpty(context.baseDir, relativePath, context.failures);
      }
    },
    weight: templateFiles.length
  },
  {
    run(context) {
      for (const relativePath of promptTemplateFiles) {
        assertHeadings(context.baseDir, relativePath, promptTemplateHeadings, context.failures);
        const fullPath = resolvePath(context.baseDir, relativePath);
        if (require("node:fs").existsSync(fullPath)) {
          assertPromptTemplateContract(relativePath, readFile(context.baseDir, relativePath), context.failures);
        }
      }
    },
    weight: promptTemplateFiles.length * promptTemplateHeadings.length
  },
  {
    run(context) {
      assertVerifyTemplateContract(context.baseDir, context.failures);
      assertPlanTemplateContract(context.baseDir, context.failures);
      assertBlockedTemplateContract(context.baseDir, context.failures);
      assertReviewTemplateContract(context.baseDir, context.failures);
      assertSessionConfigTemplate(context.baseDir, context.failures);
      assertAgentsContent(context.baseDir, context.failures);
      assertPackContract(context.baseDir, context.failures);
      assertWorkerContract(context.baseDir, context.failures);
      assertRepositoryProviderRules(context.baseDir, context.failures);
      assertHooksAndSkillsLayer(context.baseDir, context.failures);
      assertDailyDevReportLayer(context.baseDir, context.failures);
    },
    weight: 16
  },
  {
    run(context) {
      for (const relativePath of toolFiles) {
        assertToolFileContract(context.baseDir, relativePath, context.failures);
      }
      assertToolRoutingDocs(context.baseDir, context.failures);
      assertToolDiscoveryScript(context.baseDir, context.failures);
      assertSessionMemoryDocContracts(context.baseDir, context.failures);
      assertSessionAwareCommandRouting(context.baseDir, context.failures);
    },
    weight: toolFiles.length * 6 + 22
  },
  {
    run(context) {
      assertHyphenCommandNamingInActiveDocs(context.baseDir, context.failures);
      assertPublicDemoPolish(context.baseDir, context.failures);
      assertDogfoodDemoContract(context.baseDir, context.failures);
    },
    weight: 8
  }
];

const targetProfileValidators = [
  {
    run(context) {
      assertExists(context.baseDir, "AGENTS.md", context.failures);
      const fs = require("node:fs");
      const harnessDir = resolvePath(context.baseDir, ".harness");
      if (!fs.existsSync(harnessDir)) {
        return;
      }
      for (const relativePath of targetHarnessProfileFiles) {
        assertExists(context.baseDir, relativePath, context.failures);
      }
      for (const [relativePath, headings] of targetProfileHeadingContracts) {
        assertHeadings(context.baseDir, relativePath, headings, context.failures);
      }
      validateRuntimeCommandSurface(context.baseDir, context.failures);
    },
    weight: targetHarnessProfileFiles.length + targetProfileHeadingContracts.length * 3
  },
  {
    run(context) {
      if (!context.runtime) {
        return;
      }
      const bootstrapPaths = getRuntimeBootstrapPaths(context.runtime);
      if (!bootstrapPaths) {
        context.failures.push(`Unsupported runtime: ${context.runtime}`);
        return;
      }
      for (const relativePath of bootstrapPaths) {
        assertExists(context.baseDir, relativePath, context.failures);
      }
    },
    weight: 6
  }
];

const targetGoalValidators = [
  ...targetProfileValidators,
  {
    run(context) {
      const fs = require("node:fs");
      const statePath = ".harness/STATE.md";
      assertExists(context.baseDir, statePath, context.failures);
      assertHeadings(context.baseDir, statePath, sessionStateHeadings, context.failures);

      const stateFullPath = resolvePath(context.baseDir, statePath);
      if (!fs.existsSync(stateFullPath)) {
        return;
      }

      const stateContent = readFile(context.baseDir, statePath);
      const expectedSession = `sessions/${context.goalId}`;
      const activeSession = extractMachineField(stateContent, "session");
      if (activeSession !== expectedSession) {
        context.failures.push(
          `${statePath} must route target goal validation through session: ${expectedSession}`
        );
      }

      const currentPlan = extractMachineField(stateContent, "current_plan");
      if (!currentPlan) {
        context.failures.push(`${statePath} must include current_plan for session validation`);
        return;
      }
      if (!/^PLAN-\d+\.md$/i.test(currentPlan)) {
        context.failures.push(`${statePath} current_plan must use session-local PLAN-###.md naming`);
      }

      const sessionDir = `.harness/sessions/${context.goalId}`;
      const sessionFiles = {
        "SESSION.md": goalArtifactHeadings["SESSION.md"],
        "GOAL.md": goalArtifactHeadings["GOAL.md"],
        [currentPlan]: goalArtifactHeadings["PLAN.md"],
        "TASKS.md": goalArtifactHeadings["TASKS.md"],
        "VERIFY.md": goalArtifactHeadings["VERIFY.md"],
        "REMEMBER.md": goalArtifactHeadings["REMEMBER.md"]
      };

      for (const [fileName, headings] of Object.entries(sessionFiles)) {
        const relativePath = `${sessionDir}/${fileName}`;
        assertExists(context.baseDir, relativePath, context.failures);
        assertHeadings(context.baseDir, relativePath, headings, context.failures);
        const fullPath = resolvePath(context.baseDir, relativePath);
        if (fileName === "VERIFY.md" && fs.existsSync(fullPath)) {
          assertVerifyArtifactContent(relativePath, readFile(context.baseDir, relativePath), context.failures);
        }
      }
    },
    weight: Object.keys(goalArtifactHeadings).length * 5 + sessionStateHeadings.length
  }
];

module.exports = {
  harnessRepositoryValidators,
  targetGoalValidators,
  targetProfileValidators
};
