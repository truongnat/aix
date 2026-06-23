// Purpose: CLI entry for validate command.
// Layer: presentation
// Depends on: application runners, presentation args

import { parseValidateArgs } from "./args";
import {
  countCheckedContracts,
  validateHarnessRepository,
  validateTargetGoal,
  validateTargetProfile,
} from "../application/runners";

const executionHeadings = [
  "## Active Goal",
  "## Current Task",
  "## Execution Log",
  "## Deviations From Plan",
  "## Review Loop",
  "## Verification Loop",
  "## Current State",
  "## Next Step",
  "## Safety Notes",
];

const skillTemplateHeadings = [
  "## Purpose",
  "## Boundary",
  "## When To Use",
  "## When Not To Use",
  "## Inputs",
  "## Workflow",
  "## Output Contract",
  "## Common Failure Modes",
  "## Checklist Before Done",
];

const taskHeadings = [
  "## Task ID",
  "## Goal",
  "## Status",
  "## Scope",
  "## Steps",
  "## Verification",
  "## Completion Evidence",
  "## Safety Notes",
];

function main(): void {
  const args = parseValidateArgs(process.argv.slice(2));

  if (args.usageErrors && args.usageErrors.length > 0) {
    console.error("Validation usage error:");
    for (const error of args.usageErrors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  let failures: string[];
  if (args.mode === "target-profile") {
    failures = validateTargetProfile(args.baseDir, args.runtime ?? null);
  } else if (args.mode === "target-goal") {
    failures = validateTargetGoal(args.baseDir, args.goalId ?? "", args.runtime ?? null);
  } else {
    failures = validateHarnessRepository(args.baseDir);
  }

  if (failures.length > 0) {
    console.error(
      args.mode === "harness-repository"
        ? "Harness validation failed:"
        : "Target repository validation failed:"
    );
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  if (args.mode === "target-profile") {
    console.log(
      args.runtime
        ? `Target repository validation passed. Checked profile contract (runtime: ${args.runtime}).`
        : "Target repository validation passed. Checked profile contract."
    );
    return;
  }

  if (args.mode === "target-goal") {
    console.log(
      args.runtime
        ? `Target repository validation passed. Checked session contract: ${args.goalId} (runtime: ${args.runtime}).`
        : `Target repository validation passed. Checked session contract: ${args.goalId}.`
    );
    return;
  }

  console.log(
    `Harness validation passed. Checked ${countCheckedContracts()} required files/contracts.`
  );
}

export { executionHeadings, skillTemplateHeadings, taskHeadings, main };
