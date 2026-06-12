// Purpose: Argv parsing and ParseOptions types
// Layer: domain
// Depends on: nothing

const COMMANDS = new Set([
  "install",
  "status",
  "doctor",
  "update",
  "uninstall",
  "help",
  "eval",
  "insights",
  "domains",
  "scan",
]);
const EVAL_COMMANDS = new Set(["list", "run", "report"]);

interface ParseOptions {
  command: string;
  evalCommand: string;
  evalTarget: string;
  providers: string[];
  scope: string;
  visibility: string;
  target: string;
  dryRun: boolean;
  yes: boolean;
  help: boolean;
  all: boolean;
  verbose: boolean;
  json: boolean;
  export: boolean;
  anonymize: boolean;
  upload: boolean;
  forceUpload: boolean;
  force: boolean;
  recommendEvals: boolean;
  runRecommendedEvals: boolean;
  useLlmJudge: boolean;
  liveProviderCommand: string;
  domains: string[];
  analysisFile: string;
}

function takeFlagValue(args: string[], index: number, flagName: string): string {
  const value = args[index + 1];
  if (value === undefined || value.startsWith("--")) {
    throw new Error(`Missing value for ${flagName}`);
  }
  return value;
}

function parseArgv(argv: string[]): ParseOptions {
  const args = argv.slice(2);
  let command = "install";
  let i = 0;

  if (args.length > 0 && !args[0].startsWith("-")) {
    if (COMMANDS.has(args[0])) {
      command = args[0];
      i = 1;
    }
  }

  const options: ParseOptions = {
    command,
    evalCommand: "",
    evalTarget: "",
    providers: [],
    scope: "",
    visibility: "",
    target: ".",
    dryRun: false,
    yes: false,
    help: false,
    all: false,
    verbose: false,
    json: false,
    export: false,
    anonymize: true,
    upload: false,
    forceUpload: false,
    force: false,
    recommendEvals: false,
    runRecommendedEvals: false,
    useLlmJudge: true,
    liveProviderCommand: "",
    domains: [],
    analysisFile: "",
  };

  for (; i < args.length; i++) {
    const arg = args[i];
    if (command === "eval" && !arg.startsWith("-")) {
      if (!options.evalCommand) {
        if (!EVAL_COMMANDS.has(arg)) {
          throw new Error(`Unknown eval subcommand: ${arg}`);
        }
        options.evalCommand = arg;
        continue;
      }
      if (!options.evalTarget) {
        options.evalTarget = arg;
        continue;
      }
      throw new Error(`Unknown argument: ${arg}`);
    }
    if (arg === "--help" || arg === "-h") {
      options.help = true;
      continue;
    }
    if (arg === "--dry-run") {
      options.dryRun = true;
      continue;
    }
    if (arg === "--yes" || arg === "-y") {
      options.yes = true;
      continue;
    }
    if (arg === "--provider" || arg === "--runtime") {
      const value = takeFlagValue(args, i, arg);
      i += 1;
      const ids = value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      options.providers.push(...ids);
      continue;
    }
    if (arg === "--scope") {
      options.scope = takeFlagValue(args, i, arg);
      i += 1;
      continue;
    }
    if (arg === "--visibility") {
      options.visibility = takeFlagValue(args, i, arg);
      i += 1;
      continue;
    }
    if (arg === "--target") {
      options.target = takeFlagValue(args, i, arg);
      i += 1;
      continue;
    }
    if (arg === "--ref") {
      throw new Error("--ref is not supported by the npx CLI.");
    }
    if (arg === "--all") {
      options.all = true;
      continue;
    }
    if (arg === "--verbose") {
      options.verbose = true;
      continue;
    }
    if (arg === "--json") {
      options.json = true;
      continue;
    }
    if (arg === "--export") {
      options.export = true;
      continue;
    }
    if (arg === "--no-anonymize") {
      options.anonymize = false;
      continue;
    }
    if (arg === "--upload") {
      options.upload = true;
      continue;
    }
    if (arg === "--force-upload") {
      options.forceUpload = true;
      continue;
    }
    if (arg === "--force") {
      options.force = true;
      continue;
    }
    if (arg === "--recommend-evals") {
      options.recommendEvals = true;
      continue;
    }
    if (arg === "--run-recommended-evals") {
      options.runRecommendedEvals = true;
      continue;
    }
    if (arg === "--use-llm-judge") {
      options.useLlmJudge = true;
      continue;
    }
    if (arg === "--no-llm-judge") {
      options.useLlmJudge = false;
      continue;
    }
    if (arg === "--domains") {
      const value = takeFlagValue(args, i, arg);
      i += 1;
      options.domains.push(
        ...value
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      );
      continue;
    }
    if (arg === "--analysis-file") {
      options.analysisFile = takeFlagValue(args, i, arg);
      i += 1;
      continue;
    }
    if (arg === "--live-provider-command") {
      options.liveProviderCommand = takeFlagValue(args, i, arg);
      i += 1;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  if (options.providers.length > 0) {
    options.providers = [...new Set(options.providers)];
  }
  if (options.domains.length > 0) {
    options.domains = [...new Set(options.domains)];
  }

  return options;
}

interface ScopeVisibility {
  scope: string;
  visibility: string;
}

function modeToScopeVisibility(modeId: string): ScopeVisibility {
  switch (modeId) {
    case "project-private":
      return { scope: "project", visibility: "private" };
    case "project-shared":
      return { scope: "project", visibility: "shared" };
    case "global":
      return { scope: "global", visibility: "" };
    default:
      return { scope: "project", visibility: "private" };
  }
}

function isNonInteractive(options: ParseOptions): boolean {
  return (
    !process.stdin.isTTY || !process.stdout.isTTY || options.yes || options.providers.length > 0
  );
}

export { COMMANDS, EVAL_COMMANDS, parseArgv, modeToScopeVisibility, isNonInteractive };
export type { ParseOptions, ScopeVisibility };
