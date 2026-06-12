import fs from "node:fs";
import path from "node:path";
import {
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
  templateFiles,
} from "../domain/constants";
import {
  assertAgentsContent,
  assertBlockedTemplateContract,
  assertChangeSpecTemplateContract,
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
  assertTargetHarnessConfig,
  assertSessionMemoryDocContracts,
  assertSessionStartReferenceContracts,
  assertSkillContractStructure,
  assertToolDiscoveryScript,
  assertToolFileContract,
  assertToolRoutingDocs,
  assertVerifyArtifactContent,
  assertVerifyTemplateContract,
  assertWorkflowDocumentationContracts,
  assertWorkerContract,
  validateRuntimeCommandSurface,
} from "../domain/contracts";
import { legacyProviderRuleRenderer } from "../infrastructure/legacy-deps";
const { assertRepositoryProviderRules } = legacyProviderRuleRenderer;
import { assertHooksAndSkillsLayer } from "./hooks-skills";
import { assertDailyDevReportLayer } from "./daily-dev-report";
import { assertSessionStartLayer } from "./session-start";
import { assertAgentSystemLayer } from "./agent-system";
import { getRuntimeBootstrapPaths } from "../infrastructure/target";
import {
  assertExists,
  assertHeadings,
  assertNonEmpty,
  extractMachineField,
  readFile,
  resolvePath,
} from "../domain/utils";

const toolFiles = [
  "tool-capabilities/tools/git.md",
  "tool-capabilities/tools/grep-ripgrep.md",
  "tool-capabilities/tools/git-worktree.md",
  "tool-capabilities/tools/markitdown.md",
  "tool-capabilities/tools/code-graph.md",
  "tool-capabilities/tools/git-nexus.md",
];

interface ValidationContext {
  baseDir: string;
  failures: string[];
  runtime?: string | null;
  goalId?: string;
}

interface Validator {
  run: (context: ValidationContext) => void;
  weight?: number;
}

function requiredPathValidator(paths: string[]): Validator {
  return {
    run(context: ValidationContext) {
      for (const relativePath of paths) {
        assertExists(context.baseDir, relativePath, context.failures);
      }
    },
    weight: paths.length,
  };
}

const harnessRepositoryValidators: Validator[] = [
  requiredPathValidator(requiredFiles),
  {
    run(context: ValidationContext) {
      const packageJsonPath = resolvePath(context.baseDir, "package.json");
      if (!fs.existsSync(packageJsonPath)) {
        return;
      }
      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
      const packageFiles = Array.isArray(pkg.files) ? pkg.files : [];
      for (const relativePath of packageFiles) {
        if (relativePath.startsWith("!")) {
          continue;
        }
        const normalizedPath = relativePath.replace(/\/$/, "");
        const fullPath = path.join(context.baseDir, normalizedPath);
        if (!fs.existsSync(fullPath)) {
          context.failures.push(`package.json files entry must exist on disk: ${relativePath}`);
        }
      }
    },
    weight: 1,
  },
  {
    run(context: ValidationContext) {
      for (const relativePath of commandFiles) {
        assertHeadings(context.baseDir, relativePath, commandHeadings, context.failures);
        const fullPath = resolvePath(context.baseDir, relativePath);
        if (fs.existsSync(fullPath)) {
          assertCommandContractStructure(
            relativePath,
            readFile(context.baseDir, relativePath),
            context.failures
          );
        }
      }
    },
    weight: commandFiles.length * commandHeadings.length,
  },
  {
    run(context: ValidationContext) {
      for (const relativePath of skillFiles) {
        assertHeadings(context.baseDir, relativePath, skillHeadings, context.failures);
        const fullPath = resolvePath(context.baseDir, relativePath);
        if (fs.existsSync(fullPath)) {
          assertSkillContractStructure(
            relativePath,
            readFile(context.baseDir, relativePath),
            context.failures
          );
        }
      }
    },
    weight: skillFiles.length * skillHeadings.length,
  },
  {
    run(context: ValidationContext) {
      for (const relativePath of templateFiles) {
        assertNonEmpty(context.baseDir, relativePath, context.failures);
      }
    },
    weight: templateFiles.length,
  },
  {
    run(context: ValidationContext) {
      for (const relativePath of promptTemplateFiles) {
        assertHeadings(context.baseDir, relativePath, promptTemplateHeadings, context.failures);
        const fullPath = resolvePath(context.baseDir, relativePath);
        if (fs.existsSync(fullPath)) {
          assertPromptTemplateContract(
            relativePath,
            readFile(context.baseDir, relativePath),
            context.failures
          );
        }
      }
    },
    weight: promptTemplateFiles.length * promptTemplateHeadings.length,
  },
  {
    run(context: ValidationContext) {
      assertVerifyTemplateContract(context.baseDir, context.failures);
      assertPlanTemplateContract(context.baseDir, context.failures);
      assertChangeSpecTemplateContract(context.baseDir, context.failures);
      assertBlockedTemplateContract(context.baseDir, context.failures);
      assertReviewTemplateContract(context.baseDir, context.failures);
      assertSessionConfigTemplate(context.baseDir, context.failures);
      assertAgentsContent(context.baseDir, context.failures);
      assertPackContract(context.baseDir, context.failures);
      assertWorkerContract(context.baseDir, context.failures);
      assertRepositoryProviderRules(context.baseDir, context.failures);
      assertHooksAndSkillsLayer(context.baseDir, context.failures);
      assertDailyDevReportLayer(context.baseDir, context.failures);
      assertSessionStartLayer(context.baseDir, context.failures);
      assertAgentSystemLayer(context.baseDir, context.failures);
    },
    weight: 25,
  },
  {
    run(context: ValidationContext) {
      for (const relativePath of toolFiles) {
        assertToolFileContract(context.baseDir, relativePath, context.failures);
      }
      assertToolRoutingDocs(context.baseDir, context.failures);
      assertToolDiscoveryScript(context.baseDir, context.failures);
      assertSessionMemoryDocContracts(context.baseDir, context.failures);
      assertSessionAwareCommandRouting(context.baseDir, context.failures);
      assertWorkflowDocumentationContracts(context.baseDir, context.failures);
      assertSessionStartReferenceContracts(context.baseDir, context.failures);
    },
    weight: toolFiles.length * 6 + 34,
  },
  {
    run(context: ValidationContext) {
      assertHyphenCommandNamingInActiveDocs(context.baseDir, context.failures);
      assertPublicDemoPolish(context.baseDir, context.failures);
      assertDogfoodDemoContract(context.baseDir, context.failures);
    },
    weight: 8,
  },
];

const targetProfileValidators: Validator[] = [
  {
    run(context: ValidationContext) {
      assertExists(context.baseDir, "AGENTS.md", context.failures);
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
      assertTargetHarnessConfig(context.baseDir, context.failures);
      validateRuntimeCommandSurface(context.baseDir, context.failures);
    },
    weight: targetHarnessProfileFiles.length + targetProfileHeadingContracts.length * 3,
  },
  {
    run(context: ValidationContext) {
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
    weight: 6,
  },
];

const targetGoalValidators: Validator[] = [
  ...targetProfileValidators,
  {
    run(context: ValidationContext) {
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
        context.failures.push(
          `${statePath} current_plan must use session-local PLAN-###.md naming`
        );
      }

      const sessionDir = `.harness/sessions/${context.goalId}`;
      const sessionFiles: Record<string, string[]> = {
        "SESSION.md": goalArtifactHeadings["SESSION.md"],
        "GOAL.md": goalArtifactHeadings["GOAL.md"],
        [currentPlan]: goalArtifactHeadings["PLAN.md"],
        "TASKS.md": goalArtifactHeadings["TASKS.md"],
        "VERIFY.md": goalArtifactHeadings["VERIFY.md"],
        "REMEMBER.md": goalArtifactHeadings["REMEMBER.md"],
      };

      for (const [fileName, headings] of Object.entries(sessionFiles)) {
        const relativePath = `${sessionDir}/${fileName}`;
        assertExists(context.baseDir, relativePath, context.failures);
        assertHeadings(context.baseDir, relativePath, headings, context.failures);
        const fullPath = resolvePath(context.baseDir, relativePath);
        if (fileName === "VERIFY.md" && fs.existsSync(fullPath)) {
          assertVerifyArtifactContent(
            relativePath,
            readFile(context.baseDir, relativePath),
            context.failures
          );
        }
      }
    },
    weight: Object.keys(goalArtifactHeadings).length * 5 + sessionStateHeadings.length,
  },
];

export { harnessRepositoryValidators, targetGoalValidators, targetProfileValidators };
export type { ValidationContext, Validator };
