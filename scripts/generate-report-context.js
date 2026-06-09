#!/usr/bin/env node
"use strict";

const childProcess = require("node:child_process");

function printHelp() {
  console.log(`generate-report-context.js

Usage:
  node scripts/generate-report-context.js [--base <ref>] [--head <ref>] [--json] [--templates]

Options:
  --base <ref>   Optional base ref for range diff (e.g. origin/main)
  --head <ref>   Head ref, default HEAD
  --json         Output JSON to stdout
  --templates    Include discovered PR/report template metadata (and --write .harness/REPORT_TEMPLATES.md)
  --help         Show this help

Gathers git branch, status, diff stat, and changed files.
Returns blocked/error status when git context cannot be inspected truthfully.
`);
}

function runGit(args, cwd = process.cwd()) {
  return childProcess.spawnSync("git", args, {
    cwd,
    encoding: "utf8",
    timeout: 15000,
    shell: false
  });
}

function parseCli(argv) {
  const options = { json: false, help: false, templates: false, head: "HEAD" };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") {
      options.help = true;
      continue;
    }
    if (arg === "--json") {
      options.json = true;
      continue;
    }
    if (arg === "--templates") {
      options.templates = true;
      continue;
    }
    if (arg === "--base") {
      options.base = argv[index + 1];
      if (!options.base) {
        throw new Error("Missing value for --base");
      }
      index += 1;
      continue;
    }
    if (arg === "--head") {
      options.head = argv[index + 1];
      if (!options.head) {
        throw new Error("Missing value for --head");
      }
      index += 1;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }
  return options;
}

function isGitRepo(cwd) {
  const result = runGit(["rev-parse", "--is-inside-work-tree"], cwd);
  return result.status === 0 && (result.stdout || "").trim() === "true";
}

function gitBranch(cwd) {
  const result = runGit(["rev-parse", "--abbrev-ref", "HEAD"], cwd);
  if (result.status !== 0) {
    return null;
  }
  return (result.stdout || "").trim() || null;
}

function gitStatusShort(cwd) {
  const result = runGit(["status", "--short"], cwd);
  if (result.status !== 0) {
    return { ok: false, reason: result.stderr || "git status failed" };
  }
  return { ok: true, value: (result.stdout || "").trim() };
}

function parseNameStatus(output) {
  const files = [];
  for (const line of (output || "").split(/\r?\n/)) {
    if (!line.trim()) {
      continue;
    }
    const match = line.match(/^([A-Z?][A-Z?]?)\s+(.+)$/);
    if (!match) {
      continue;
    }
    files.push({ path: match[2].trim(), status: match[1] });
  }
  return files;
}

function parseDiffStat(output) {
  const stat = {
    filesChanged: 0,
    insertions: 0,
    deletions: 0,
    raw: (output || "").trim()
  };
  const summaryLine = (output || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => /files? changed/.test(line));
  if (!summaryLine) {
    return stat;
  }
  const filesMatch = summaryLine.match(/(\d+)\s+files?\s+changed/);
  const insertMatch = summaryLine.match(/(\d+)\s+insertions?\(\+\)/);
  const deleteMatch = summaryLine.match(/(\d+)\s+deletions?\(-\)/);
  stat.filesChanged = filesMatch ? Number(filesMatch[1]) : 0;
  stat.insertions = insertMatch ? Number(insertMatch[1]) : 0;
  stat.deletions = deleteMatch ? Number(deleteMatch[1]) : 0;
  return stat;
}

function diffRange(base, head, cwd) {
  const statResult = runGit(["diff", "--stat", `${base}..${head}`], cwd);
  const nameResult = runGit(["diff", "--name-status", `${base}..${head}`], cwd);
  if (statResult.status !== 0 || nameResult.status !== 0) {
    return {
      ok: false,
      reason: statResult.stderr || nameResult.stderr || "git diff range failed"
    };
  }
  return {
    ok: true,
    stat: parseDiffStat(statResult.stdout),
    files: parseNameStatus(nameResult.stdout),
    statRaw: (statResult.stdout || "").trim(),
    nameStatusRaw: (nameResult.stdout || "").trim()
  };
}

function diffWorkingTree(cwd) {
  const statResult = runGit(["diff", "--stat"], cwd);
  const nameResult = runGit(["diff", "--name-status"], cwd);
  const stagedStat = runGit(["diff", "--cached", "--stat"], cwd);
  const stagedNames = runGit(["diff", "--cached", "--name-status"], cwd);
  if (statResult.status !== 0 || nameResult.status !== 0) {
    return {
      ok: false,
      reason: statResult.stderr || nameResult.stderr || "git diff failed"
    };
  }
  const files = parseNameStatus(nameResult.stdout);
  for (const file of parseNameStatus(stagedNames.stdout)) {
    if (!files.some((entry) => entry.path === file.path)) {
      files.push(file);
    }
  }
  const stat = parseDiffStat(statResult.stdout);
  const stagedStatParsed = parseDiffStat(stagedStat.stdout);
  stat.filesChanged = Math.max(stat.filesChanged, stagedStatParsed.filesChanged, files.length);
  stat.insertions += stagedStatParsed.insertions;
  stat.deletions += stagedStatParsed.deletions;
  return {
    ok: true,
    stat,
    files,
    statRaw: [statResult.stdout, stagedStat.stdout].filter(Boolean).join("\n").trim(),
    nameStatusRaw: [nameResult.stdout, stagedNames.stdout].filter(Boolean).join("\n").trim()
  };
}

function generateReportContext(options, cwd = process.cwd()) {
  if (!isGitRepo(cwd)) {
    return {
      ok: false,
      status: "blocked",
      reason: "Not a git repository or git context cannot be inspected."
    };
  }

  const branch = gitBranch(cwd);
  const status = gitStatusShort(cwd);
  if (!status.ok) {
    return {
      ok: false,
      status: "blocked",
      reason: status.reason
    };
  }

  const head = options.head || "HEAD";
  const base = options.base || null;
  const diff = base ? diffRange(base, head, cwd) : diffWorkingTree(cwd);
  if (!diff.ok) {
    return {
      ok: false,
      status: "blocked",
      reason: diff.reason
    };
  }

  const untracked = status.value
    .split(/\r?\n/)
    .filter(Boolean)
    .filter((line) => line.startsWith("??"))
    .map((line) => {
      const pathValue = line.slice(3).trim();
      return { path: pathValue, status: "?" };
    });

  const files = [...diff.files];
  for (const file of untracked) {
    if (!files.some((entry) => entry.path === file.path)) {
      files.push(file);
    }
  }

  return {
    ok: true,
    status: "ready",
    branch,
    base,
    head,
    statusShort: status.value,
    files,
    stat: diff.stat,
    diff: {
      stat: diff.statRaw,
      nameStatus: diff.nameStatusRaw
    }
  };
}

function attachTemplates(result, cwd, options) {
  if (!options.templates || !result.ok) {
    return result;
  }
  try {
    const fs = require("node:fs");
    const path = require("node:path");
    const mod = require(path.join(__dirname, "..", "dist", "lib", "report-template-discovery.js"));
    const discovery = mod.discoverReportTemplates(cwd);
    const harnessDir = path.join(cwd, ".harness");
    if (fs.existsSync(harnessDir)) {
      fs.writeFileSync(
        path.join(harnessDir, "REPORT_TEMPLATES.md"),
        `${mod.renderReportTemplatesMarkdown(discovery).trim()}\n`,
        "utf8"
      );
    }
    return {
      ...result,
      templates: {
        status: discovery.status,
        primary: {
          prMessage: discovery.primary.prMessage
            ? {
                path: discovery.primary.prMessage.path,
                source: discovery.primary.prMessage.source,
                provider: discovery.primary.prMessage.provider,
                label: discovery.primary.prMessage.label,
                content: discovery.primary.prMessage.content,
              }
            : null,
          report: discovery.primary.report
            ? {
                path: discovery.primary.report.path,
                source: discovery.primary.report.source,
                provider: discovery.primary.report.provider,
                label: discovery.primary.report.label,
                content: discovery.primary.report.content,
              }
            : null,
          changeSummary: discovery.primary.changeSummary
            ? {
                path: discovery.primary.changeSummary.path,
                source: discovery.primary.changeSummary.source,
                provider: discovery.primary.changeSummary.provider,
                label: discovery.primary.changeSummary.label,
                content: discovery.primary.changeSummary.content,
              }
            : null,
        },
        fallback: discovery.fallback,
        candidates: {
          prMessage: discovery.candidates.prMessage.map((entry) => ({
            path: entry.path,
            provider: entry.provider,
            label: entry.label,
          })),
        },
      },
    };
  } catch (error) {
    return {
      ...result,
      templates: {
        status: "fallback",
        error: error instanceof Error ? error.message : String(error),
      },
    };
  }
}

function main() {
  try {
    const options = parseCli(process.argv.slice(2));
    if (options.help) {
      printHelp();
      return;
    }
    let result = generateReportContext(options);
    result = attachTemplates(result, process.cwd(), options);
    if (options.json) {
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    } else if (result.ok) {
      process.stdout.write(`${result.diff.stat || "No diff stat available."}\n`);
    } else {
      process.stderr.write(`${result.reason || "blocked"}\n`);
    }
    process.exit(result.ok ? 0 : 1);
  } catch (error) {
    const payload = { ok: false, status: "failed", reason: error.message };
    if (process.argv.includes("--json")) {
      process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
    } else {
      process.stderr.write(`${error.message}\n`);
    }
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { generateReportContext };
