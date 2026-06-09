#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");

function parseCli(argv) {
  const options = { json: false, help: false, write: false, target: process.cwd() };
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
    if (arg === "--write") {
      options.write = true;
      continue;
    }
    if (arg === "--target") {
      options.target = path.resolve(argv[index + 1] || "");
      if (!argv[index + 1]) {
        throw new Error("Missing value for --target");
      }
      index += 1;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }
  return options;
}

function printHelp() {
  process.stdout.write(`discover-report-templates.js

Usage:
  node scripts/discover-report-templates.js [--target <repo>] [--json] [--write]

Options:
  --target <repo>  Repository root (default: cwd)
  --json           Output discovery JSON
  --write          Write .harness/REPORT_TEMPLATES.md summary
  --help           Show help

Scans project PR/MR templates (.github, .gitlab, etc.) before harness defaults.
`);
}

function main() {
  try {
    const options = parseCli(process.argv.slice(2));
    if (options.help) {
      printHelp();
      return;
    }

    const mod = require(path.join(__dirname, "..", "dist", "lib", "report-template-discovery.js"));
    const discovery = mod.discoverReportTemplates(options.target);

    if (options.write) {
      const outPath = path.join(options.target, ".harness", "REPORT_TEMPLATES.md");
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      fs.writeFileSync(outPath, `${mod.renderReportTemplatesMarkdown(discovery).trim()}\n`, "utf8");
    }

    if (options.json) {
      const payload = {
        ...discovery,
        primary: {
          prMessage: discovery.primary.prMessage
            ? {
                ...discovery.primary.prMessage,
                contentPreview: discovery.primary.prMessage.content.slice(0, 500),
                content: discovery.primary.prMessage.content,
              }
            : null,
          report: discovery.primary.report
            ? {
                ...discovery.primary.report,
                contentPreview: discovery.primary.report.content.slice(0, 500),
                content: discovery.primary.report.content,
              }
            : null,
          changeSummary: discovery.primary.changeSummary
            ? {
                ...discovery.primary.changeSummary,
                contentPreview: discovery.primary.changeSummary.content.slice(0, 500),
                content: discovery.primary.changeSummary.content,
              }
            : null,
        },
        candidates: {
          prMessage: discovery.candidates.prMessage.map((entry) => ({
            ...entry,
            contentPreview: entry.content.slice(0, 300),
            content: entry.content,
          })),
        },
      };
      process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
      return;
    }

    process.stdout.write(mod.renderReportTemplatesMarkdown(discovery));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (process.argv.includes("--json")) {
      process.stdout.write(`${JSON.stringify({ ok: false, reason: message }, null, 2)}\n`);
    } else {
      process.stderr.write(`${message}\n`);
    }
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}
