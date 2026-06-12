#!/usr/bin/env node

const childProcess = require("node:child_process");

const isWindows = process.platform === "win32";

function run(command, args) {
  return childProcess.spawnSync(command, args, {
    encoding: "utf8",
    timeout: 15000,
    shell: false,
  });
}

function detectCommand(command) {
  const detector = isWindows ? "where" : "sh";
  const detectorArgs = isWindows ? [command] : ["-lc", `command -v ${command}`];
  const result = run(detector, detectorArgs);
  if (result.status !== 0) {
    return { available: false };
  }
  const location = (result.stdout || "").split(/\r?\n/).find(Boolean) || "";
  return {
    available: true,
    command,
    location,
  };
}

function detectVersion(command, args = ["--version"]) {
  const result = run(command, args);
  if (result.status !== 0) {
    return null;
  }
  return (result.stdout || result.stderr || "").split(/\r?\n/).find(Boolean) || null;
}

function detectGitWorktree(gitInfo) {
  if (!gitInfo.available) {
    return { available: false };
  }
  // Avoid `git worktree --help` on Windows Git — it opens git-worktree.html in a browser.
  const result = run("git", ["worktree", "list"]);
  return {
    available: result.status === 0,
    command: "git worktree",
    version: detectVersion("git"),
  };
}

function detectGitGrep(gitInfo) {
  return {
    available: gitInfo.available,
    command: "git grep",
  };
}

function detectOptional(command, versionArgs) {
  const info = detectCommand(command);
  if (!info.available) {
    return info;
  }
  return {
    ...info,
    version: detectVersion(command, versionArgs),
  };
}

function detectCodegraph() {
  const info = detectOptional("codegraph", ["--version"]);
  if (!info.available) {
    return info;
  }
  return {
    ...info,
    command: "codegraph",
    reference: "https://github.com/colbymchenry/codegraph",
  };
}

function discover() {
  const git = { ...detectCommand("git"), version: detectVersion("git") };
  const rg = { ...detectCommand("rg"), version: detectVersion("rg") };
  const grep = { ...detectCommand("grep"), version: detectVersion("grep") };
  const find = {
    ...detectCommand(isWindows ? "where" : "find"),
    version: isWindows ? null : detectVersion("find"),
  };
  const markitdown = detectOptional("markitdown", ["--help"]);
  const codegraph = detectCodegraph();

  const gitNexus = (() => {
    const direct = detectOptional("git-nexus", ["--help"]);
    if (direct.available) {
      return direct;
    }
    return detectOptional("git-nexus-cli", ["--help"]);
  })();

  return {
    git,
    gitWorktree: detectGitWorktree(git),
    rg,
    gitGrep: detectGitGrep(git),
    grep,
    find,
    markitdown,
    codegraph,
    gitNexus,
  };
}

function capabilityRouting(tools) {
  return {
    codeSearch: tools.rg.available
      ? "rg"
      : tools.gitGrep.available
        ? "git grep"
        : tools.grep.available
          ? "grep"
          : "blocked",
    diffReview: tools.git.available ? "git diff" : "user-provided diff",
    historyReview: tools.git.available ? "git log / git blame" : "user-provided commit context",
    parallelWork: tools.gitWorktree.available ? "git worktree" : "normal branch or stash workflow",
    documentToMarkdown: tools.markitdown.available ? "markitdown" : "ask user for extracted text",
    repoStructure: tools.codegraph.available ? "codegraph" : "file tree plus import scan",
    dependencyScan: "package manager or grep imports",
  };
}

function toMarkdown(tools) {
  const routing = capabilityRouting(tools);
  const lines = [
    "# Tool Context",
    "",
    "## Detected Tools",
    "",
    "| Tool | Available | Notes |",
    "|---|---:|---|",
  ];

  for (const [label, info, notes] of [
    ["git", tools.git, "history and diff surface"],
    ["git worktree", tools.gitWorktree, "parallel isolation"],
    ["rg", tools.rg, "preferred code search"],
    ["git grep", tools.gitGrep, "search fallback"],
    ["grep", tools.grep, "basic search fallback"],
    ["find", tools.find, "filesystem inspection"],
    ["markitdown", tools.markitdown, "rich document conversion"],
    ["codegraph", tools.codegraph, "https://github.com/colbymchenry/codegraph"],
    ["git-nexus", tools.gitNexus, "optional history tool"],
  ]) {
    lines.push(`| ${label} | ${info.available ? "yes" : "no"} | ${notes} |`);
  }

  lines.push(
    "",
    "## Routing",
    "",
    `- Code search: ${routing.codeSearch}`,
    `- Git diff: ${routing.diffReview}`,
    `- History review: ${routing.historyReview}`,
    `- Parallel work: ${routing.parallelWork}`,
    `- Document conversion: ${routing.documentToMarkdown}`,
    `- Repo structure: ${routing.repoStructure}`,
    `- Dependency scan: ${routing.dependencyScan}`
  );

  return `${lines.join("\n")}\n`;
}

function main() {
  const tools = discover();
  if (process.argv.includes("--markdown")) {
    process.stdout.write(toMarkdown(tools));
    return;
  }
  process.stdout.write(`${JSON.stringify(tools, null, 2)}\n`);
}

main();
