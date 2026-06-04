"use strict";

const {
  intro,
  outro,
  cancel,
  confirm,
  select,
  multiselect,
  spinner,
  note,
  isCancel,
} = require("@clack/prompts");

const { formatCommandSupportForPlan } = require("../runtime-command-catalog.js");

function useInteractiveUi(options) {
  return (
    process.stdin.isTTY && process.stdout.isTTY && !options.yes && options.providers.length === 0
  );
}

function introBanner(meta) {
  intro("ai-engineering-harness");
  note(
    [
      "Interactive engineering harness for AI coding agents",
      "",
      `Version     ai-engineering-harness@${meta.version}`,
      `Target      ${meta.target}`,
      `Git repo    ${meta.gitRepo ? "yes" : "no"}`,
      "Status      experimental (stable runtime support: no)",
    ].join("\n"),
    "Target"
  );
}

async function selectProviders(providerItems) {
  const initial = providerItems.filter((p) => p.implemented && p.recommended).map((p) => p.id);
  const value = await multiselect({
    message: "Select provider(s)",
    options: providerItems.map((p) => {
      let label = p.label;
      const priority = p.priorityLabel ? `  ${p.priorityLabel}` : "";
      if (p.recommended && p.implemented) {
        label = `${p.label}  detected${priority}`;
      } else if (p.implemented && p.priorityLabel) {
        label = `${p.label}${priority}`;
      } else if (!p.implemented) {
        label = `${p.label}  planned`;
      }
      return {
        value: p.id,
        label,
        disabled: !p.implemented,
      };
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

async function selectInstallMode() {
  const value = await select({
    message: "Install mode",
    options: [
      {
        value: "project-private",
        label: "Project private",
        hint: "local to this checkout, ignored via .git/info/exclude",
      },
      {
        value: "project-shared",
        label: "Project shared",
        hint: "visible in git status, intended for team commit",
      },
      {
        value: "global",
        label: "Global",
        hint: "runtime-level install where supported",
      },
    ],
    initialValue: "project-private",
  });
  if (isCancel(value)) {
    cancel("Install cancelled.");
    return null;
  }
  return value;
}

async function confirmInitHarness(defaultYes) {
  const value = await confirm({
    message: "Initialize .harness project state?",
    initialValue: defaultYes,
  });
  if (isCancel(value)) {
    cancel("Install cancelled.");
    return null;
  }
  return value;
}

async function confirmInstallCache(defaultYes) {
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

async function confirmRemoveState(defaultYes = false) {
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

async function confirmFullCleanup(defaultYes = false) {
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

async function confirmProceed(message = "Proceed with install?") {
  const value = await confirm({ message, initialValue: true });
  if (isCancel(value)) {
    cancel("Cancelled.");
    return null;
  }
  return value;
}

function formatPlanBlock(title, lines, prefix = "+") {
  if (!lines.length) {
    return `${title}\n  (none)`;
  }
  return `${title}\n${lines.map((l) => `  ${prefix} ${l}`).join("\n")}`;
}

function showInstallPlan(plan, { compact = false, providers = [] } = {}) {
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
  note(body, "Plan");
}

function showUpdatePlan(providers, { compact = false } = {}) {
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
  note(body, "Update plan");
}

function showUninstallPlan(ctx, { compact = false } = {}) {
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
  note(body, "Uninstall plan");
}

function showWarning(message) {
  note(message, "Warning");
}

function showSuccess(kind, extraLines = []) {
  const next = [
    "",
    "Next:",
    "  Ask the agent: use harness-plan for this repo",
    "  npx ai-engineering-harness doctor",
    ...extraLines,
  ].join("\n");
  outro(`${kind} successfully.\n${next}`);
}

function showCancel(message = "Cancelled.") {
  cancel(message);
}

function showError(title, reason, hints = []) {
  const lines = [
    reason,
    "",
    "Try:",
    "  npx ai-engineering-harness doctor",
    "  npx ai-engineering-harness install --provider cursor --yes --verbose",
    ...hints,
  ];
  note(lines.join("\n"), title);
}

async function runWithSpinner(message, fn) {
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

function parseDoctorLines(text) {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("PASS ") || l.startsWith("FAIL ") || l.startsWith("WARN "));
}

function formatDoctorLine(line) {
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

function formatDoctor(rawOutput, { compact = false } = {}) {
  const lines = parseDoctorLines(rawOutput);
  const body = ["Checks", ...lines.map(formatDoctorLine)].join("\n");
  if (compact) {
    console.log("\nai-engineering-harness doctor\n");
    console.log(body);
    return;
  }
  intro("ai-engineering-harness doctor");
  note(body, "Checks");
}

function formatStatus(rawOutput, { compact = false } = {}) {
  const rows = {};
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
    .map(([title, content]) => `${title}\n  ${content.replace(/\n/g, "\n  ")}`)
    .join("\n\n");

  if (compact) {
    console.log("\nai-engineering-harness status\n");
    console.log(body);
    return;
  }
  intro("ai-engineering-harness status");
  note(body, "Summary");
}

module.exports = {
  useInteractiveUi,
  introBanner,
  selectProviders,
  selectInstallMode,
  confirmInitHarness,
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
