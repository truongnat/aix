import path from "node:path";
import { root, VALID_TARGET_RUNTIMES } from "../domain/constants";
import { isValidTargetRuntime } from "../infrastructure/target";

interface ParseResult {
  mode: "harness-repository" | "target-profile" | "target-goal";
  baseDir: string;
  goalId?: string;
  runtime?: string;
  profileOnly?: boolean;
  usageErrors?: string[];
}

function parseValidateArgs(argv: string[] = []): ParseResult {
  if (argv.length === 0) {
    return {
      mode: "harness-repository",
      baseDir: root,
    };
  }

  if (argv[0] !== "--target") {
    return { usageErrors: [`Unsupported argument: ${argv[0]}`] } as ParseResult;
  }

  if (argv.length < 2 || argv[1].startsWith("--")) {
    return { usageErrors: ["Missing required path after --target"] } as ParseResult;
  }

  const baseDir = path.resolve(process.cwd(), argv[1]);
  let goalId: string | undefined = undefined;
  let runtime: string | undefined = undefined;
  let profileOnly = false;
  const usageErrors: string[] = [];

  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--profile-only") {
      profileOnly = true;
      continue;
    }

    if (arg === "--runtime") {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) {
        usageErrors.push("Missing required runtime name after --runtime");
        break;
      }
      runtime = value;
      index += 1;
      continue;
    }

    if (arg === "--goal") {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) {
        usageErrors.push("Missing required goal id after --goal");
        break;
      }
      goalId = value;
      index += 1;
      continue;
    }

    usageErrors.push(`Unsupported argument: ${arg}`);
    break;
  }

  if (profileOnly && goalId) {
    usageErrors.push("--profile-only cannot be combined with --goal");
  }

  if (runtime && !isValidTargetRuntime(runtime)) {
    usageErrors.push(
      `Unsupported runtime: ${runtime} (expected: ${VALID_TARGET_RUNTIMES.join(", ")})`
    );
  }

  if (usageErrors.length > 0) {
    return { usageErrors } as ParseResult;
  }

  if (goalId) {
    return {
      mode: "target-goal",
      baseDir,
      goalId,
      runtime,
    };
  }

  return {
    mode: "target-profile",
    baseDir,
    runtime,
  };
}

export { parseValidateArgs };
export type { ParseResult };
