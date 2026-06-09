import type * as ClackPrompts from "@clack/prompts";
import { formatCommandSupportForPlan } from "./runtime-command-catalog";

interface ParseOptions {
  yes: boolean;
  providers: string[];
}

interface IntroMeta {
  version: string;
  target: string;
  gitRepo: boolean;
}

interface ProviderItem {
  id: string;
  label: string;
  implemented: boolean;
  installed?: boolean;
  version?: string | null;
  hint?: string;
  priorityLabel?: string;
}

type InstallScopeChoice = "project" | "global";

interface InstallPlan {
  willInstall: string[];
  willNotModify: string[];
  mode: string;
  isGit: boolean;
}

interface UninstallContext {
  providers: string[];
  removeCache: boolean;
  removeState: boolean;
  fullCleanup: boolean;
}

type ClackModule = typeof ClackPrompts;
type DynamicImport = <T>(specifier: string) => Promise<T>;

let clackModulePromise: Promise<ClackModule> | null = null;
const dynamicImport = new Function("specifier", "return import(specifier);") as DynamicImport;

async function loadClackPrompts(): Promise<ClackModule> {
  if (!clackModulePromise) {
    clackModulePromise = dynamicImport<ClackModule>("@clack/prompts");
  }
  return clackModulePromise;
}

function isCancel(_value: unknown): boolean {
  return false;
}

function useInteractiveUi(options: ParseOptions): boolean {
  return (
    process.stdin.isTTY && process.stdout.isTTY && !options.yes && options.providers.length === 0
  );
}

function introBanner(meta: IntroMeta): void {
  console.log("ai-engineering-harness");
  console.log("");
  console.log("Target");
  console.log(
    [
      "  Interactive engineering harness for AI coding agents",
      "",
      `  Version     ai-engineering-harness@${meta.version}`,
      `  Target      ${meta.target}`,
      `  Git repo    ${meta.gitRepo ? "yes" : "no"}`,
      "  Status      experimental (stable runtime support: no)",
    ].join("\n")
  );
}

async function selectProviders(providerItems: ProviderItem[]): Promise<string[] | null> {
  const { multiselect, cancel, isCancel } = await loadClackPrompts();
  const initial = providerItems.filter((p) => p.implemented && p.installed).map((p) => p.id);
  const value = await multiselect({
    message: "Select provider(s)",
    options: providerItems.map((p) => {
      let label = p.label;
      const priority = p.priorityLabel ? `  ${p.priorityLabel}` : "";
      if (p.installed && p.implemented) {
        label = `${p.label}  detected${priority}`;
      } else if (p.implemented && p.priorityLabel) {
        label = `${p.label}${priority}`;
      } else if (!p.implemented) {
        label = `${p.label}  planned`;
      }
      return {
        value: p.id,
        label,
        disabled: !p.implemented || !p.installed,
        hint: p.hint,
      } as any;
    }),
    required: true,
    initialValues: initial.length ? initial : undefined,
  });
  if (isCancel(value)) {
    cancel("Install cancelled.");
    return null;
  }
  return value;
}

async function selectInstallScope(): Promise<InstallScopeChoice | null> {
  const { select, cancel, isCancel } = await loadClackPrompts();
  const value = await select({
    message: "Install scope",
    options: [
      {
        value: "project",
        label: "Project install",
        hint: "Writes repo-local commands, rules, skills, and project state.",
      },
      {
        value: "global",
        label: "Global install",
        hint: "Writes provider settings in your home directory.",
      },
    ],
    initialValue: "project",
  });
  if (isCancel(value)) {
    cancel("Install cancelled.");
    return null;
  }
  return value as InstallScopeChoice;
}

async function confirmInstallCache(defaultYes: boolean): Promise<boolean | null> {
  const { confirm, cancel, isCancel } = await loadClackPrompts();
  const value = await confirm({
    message: "Install .ai-harness capability cache?",
    initialValue: defaultYes,
  });
  if (isCancel(value)) {
    cancel("Install cancelled.");
    return null;
  }
  return value;
}

async function confirmRemoveState(defaultYes = false): Promise<boolean | null> {
  const { confirm, cancel, isCancel } = await loadClackPrompts();
  const value = await confirm({
    message: "Remove .harness/?",
    initialValue: defaultYes,
  });
  if (isCancel(value)) {
    cancel("Uninstall cancelled.");
    return null;
  }
  return value;
}

async function confirmFullCleanup(defaultYes = false): Promise<boolean | null> {
  const { confirm, cancel, isCancel } = await loadClackPrompts();
  const value = await confirm({
    message: "Full cleanup (runtime + cache + state + exclude block)?",
    initialValue: defaultYes,
  });
  if (isCancel(value)) {
    cancel("Uninstall cancelled.");
    return null;
  }
  return value;
}

async function confirmProceed(message = "Proceed with install?"): Promise<boolean | null> {
  const { confirm, cancel, isCancel } = await loadClackPrompts();
  const value = await confirm({ message, initialValue: true });
  if (isCancel(value)) {
    cancel("Cancelled.");
    return null;
  }
  return value;
}

function formatPlanBlock(title: string, lines: string[], prefix = "+"): string {
  if (!lines.length) {
    return `${title}\n  (none)`;
  }
  return `${title}\n${lines.map((l) => `  ${prefix} ${l}`).join("\n")}`;
}

function showInstallPlan(
  plan: InstallPlan,
  { compact = false, providers = [] }: { compact?: boolean; providers?: string[] } = {}
): void {
  const commandBlock =
    providers.length > 0
      ? formatCommandSupportForPlan(providers)
      : formatCommandSupportForPlan(["cursor"]);
  const body = [
    formatPlanBlock("Will install", plan.willInstall),
    "",
    formatPlanBlock("Will not modify", plan.willNotModify, "·"),
    "",
    commandBlock,
  ].join("\n");

  if (compact) {
    console.log("");
    console.log(body);
    return;
  }
  console.log("");
  console.log("Plan");
  console.log(body);
}

function showUpdatePlan(providers: string[], { compact = false } = {}): void {
  const body = [
    formatPlanBlock("Will refresh", [
      ".ai-harness/ capability cache",
      ...providers.map((p) => `${p} runtime entrypoint + command files`),
    ]),
    "",
    formatPlanBlock("Will preserve", [".harness/ project state"], "·"),
  ].join("\n");
  if (compact) {
    console.log("");
    console.log(body);
    return;
  }
  console.log("");
  console.log("Update plan");
  console.log(body);
}

function showUninstallPlan(ctx: UninstallContext, { compact = false } = {}): void {
  const lines = [`${ctx.providers.join(", ")} provider entrypoint(s)`];
  if (ctx.fullCleanup) {
    lines.push(".ai-harness/", ".harness/", ".git/info/exclude block");
  } else {
    lines.push(ctx.removeCache ? "remove .ai-harness/" : "keep .ai-harness/");
    lines.push(ctx.removeState ? "remove .harness/" : "keep .harness/");
  }
  const body = formatPlanBlock("Will change", lines);
  if (compact) {
    console.log("");
    console.log(body);
    return;
  }
  console.log("");
  console.log("Uninstall plan");
  console.log(body);
}

function showWarning(message: string): void {
  console.warn(`Warning\n${message}`);
}

function showSuccess(kind: string, extraLines: string[] = []): void {
  const next = [
    "",
    "Next:",
    "  Ask the agent: use harness-plan for this repo",
    "  npx ai-engineering-harness doctor",
    ...extraLines,
  ].join("\n");
  console.log(`${kind} successfully.\n${next}`);
}

function showCancel(message = "Cancelled."): void {
  console.log(message);
}

function showError(title: string, reason: string, hints: string[] = []): void {
  const lines = [
    reason,
    "",
    "Try:",
    "  npx ai-engineering-harness doctor",
    "  npx ai-engineering-harness install --provider cursor --yes --verbose",
    ...hints,
  ];
  console.error(`${title}\n${lines.join("\n")}`);
}

interface SpinnerResult {
  ok?: boolean;
  status?: number;
  spinnerMessage?: string;
}

async function runWithSpinner(
  message: string,
  fn: () => Promise<SpinnerResult>
): Promise<SpinnerResult> {
  const { spinner } = await loadClackPrompts();
  const s = spinner();
  s.start(message);
  try {
    const result = await fn();
    if (result && result.ok === false) {
      s.stop(result.spinnerMessage || "Failed");
      return result;
    }
    s.stop(result?.spinnerMessage || "Done");
    return result;
  } catch (error) {
    s.stop("Failed");
    throw error;
  }
}

function parseDoctorLines(text: string): string[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("PASS ") || l.startsWith("FAIL ") || l.startsWith("WARN "));
}

function formatDoctorLine(line: string): string {
  if (line.startsWith("PASS ")) {
    return `  ✓ ${line.slice(5)}`;
  }
  if (line.startsWith("WARN ")) {
    return `  ! ${line.slice(5)}`;
  }
  if (line.startsWith("FAIL ")) {
    return `  ✗ ${line.slice(5)}`;
  }
  return `  ${line}`;
}

function formatDoctor(rawOutput: string, { compact = false } = {}): void {
  const lines = parseDoctorLines(rawOutput);
  const body = ["Checks", ...lines.map(formatDoctorLine)].join("\n");
  console.log("\nai-engineering-harness doctor\n");
  console.log(body);
}

function formatStatus(rawOutput: string, { compact = false } = {}): void {
  const rows: Record<string, string> = {};
  for (const line of rawOutput.split("\n")) {
    const m = line.match(/^\s{2}([^:]+):\s+(.*)$/);
    if (m) {
      rows[m[1].trim()] = m[2].trim();
    }
  }

  const sections = [
    ["Target", rows.target || "(unknown)"],
    [
      "Project",
      [
        `Git repo: ${rows["git repo"] || "unknown"}`,
        `.ai-harness: ${rows[".ai-harness exists"] || "unknown"}`,
        `.harness: ${rows[".harness exists"] || "unknown"}`,
        `Exclude block: ${rows["exclude block exists"] || "unknown"}`,
        `Runtime commands: ${rows["runtime-commands"] || "unknown"}`,
        `Command namespace: ${rows["command namespace"] || "harness"}`,
      ].join("\n"),
    ],
    ["Providers", `Detected: ${rows["detected runtimes"] || "none"}`],
  ];

  const body = sections
    .map(([title, content]) => `${title}\n  ${(content as string).replace(/\n/g, "\n  ")}`)
    .join("\n\n");

  console.log("\nai-engineering-harness status\n");
  console.log(body);
}

const ui = {
  useInteractiveUi,
  introBanner,
  selectProviders,
  selectInstallScope,
  confirmInstallCache,
  confirmRemoveState,
  confirmFullCleanup,
  confirmProceed,
  showInstallPlan,
  showUpdatePlan,
  showUninstallPlan,
  showSuccess,
  showCancel,
  showWarning,
  showError,
  runWithSpinner,
  formatStatus,
  formatDoctor,
  isCancel,
};
export {
  useInteractiveUi,
  introBanner,
  selectProviders,
  selectInstallScope,
  confirmInstallCache,
  confirmRemoveState,
  confirmFullCleanup,
  confirmProceed,
  showInstallPlan,
  showUpdatePlan,
  showUninstallPlan,
  showSuccess,
  showCancel,
  showWarning,
  showError,
  runWithSpinner,
  formatStatus,
  formatDoctor,
  isCancel,
};
export default ui;
export type { IntroMeta, ProviderItem, InstallPlan, UninstallContext, SpinnerResult };
