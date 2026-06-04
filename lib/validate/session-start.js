"use strict";

const fs = require("node:fs");
const path = require("node:path");

const SESSION_START_DOC = "docs/session-start.md";
const SESSION_START_TEMPLATE = "templates/SESSION_START.md";
const SESSION_START_HEADINGS = [
  "## Status",
  "## Active Session",
  "## Current Goal",
  "## Current Phase",
  "## Loaded Memory",
  "## Unfinished Work",
  "## Blocked State",
  "## Hazards",
  "## Tool Context",
  "## Next Allowed Command",
  "## Routing Question",
];

const COMMANDS_REQUIRING_SESSION_STATE = [
  "commands/harness-plan.md",
  "commands/harness-run.md",
  "commands/harness-verify.md",
  "commands/harness-ship.md",
  "commands/harness-remember.md",
];

const PROMPT_TEMPLATES_REQUIRING_SESSION_START = [
  "prompt-templates/harness-plan.md",
  "prompt-templates/harness-run.md",
  "prompt-templates/harness-verify.md",
  "prompt-templates/harness-ship.md",
];

function assertExists(baseDir, relativePath, failures) {
  if (!fs.existsSync(path.join(baseDir, relativePath))) {
    failures.push(`Missing required path: ${relativePath}`);
  }
}

function assertHeadings(baseDir, relativePath, headings, failures) {
  const fullPath = path.join(baseDir, relativePath);
  if (!fs.existsSync(fullPath)) {
    return;
  }
  const content = fs.readFileSync(fullPath, "utf8");
  for (const heading of headings) {
    if (!content.includes(heading)) {
      failures.push(`${relativePath} is missing heading: ${heading}`);
    }
  }
}

function assertSessionStartLayer(baseDir, failures) {
  assertExists(baseDir, SESSION_START_DOC, failures);
  assertExists(baseDir, SESSION_START_TEMPLATE, failures);
  assertHeadings(baseDir, SESSION_START_TEMPLATE, SESSION_START_HEADINGS, failures);

  const startCommand = path.join(baseDir, "commands/harness-start.md");
  if (fs.existsSync(startCommand)) {
    const content = fs.readFileSync(startCommand, "utf8");
    if (!/Session Start/i.test(content)) {
      failures.push("commands/harness-start.md must mention Session Start");
    }
    if (!/SESSION_START\.md|Session Start summary/i.test(content)) {
      failures.push(
        "commands/harness-start.md must reference Session Start output artifact or summary"
      );
    }
  }

  for (const relativePath of COMMANDS_REQUIRING_SESSION_STATE) {
    const fullPath = path.join(baseDir, relativePath);
    if (!fs.existsSync(fullPath)) {
      failures.push(`Missing required path: ${relativePath}`);
      continue;
    }
    const content = fs.readFileSync(fullPath, "utf8");
    if (!/Session Start|harness-start/i.test(content)) {
      failures.push(`${relativePath} must mention Session Start or harness-start requirement`);
    }
    if (!/active session|session state/i.test(content)) {
      failures.push(`${relativePath} must mention active session or session state requirement`);
    }
  }

  for (const relativePath of PROMPT_TEMPLATES_REQUIRING_SESSION_START) {
    const fullPath = path.join(baseDir, relativePath);
    if (!fs.existsSync(fullPath)) {
      continue;
    }
    const content = fs.readFileSync(fullPath, "utf8");
    if (!/Session Start Requirement/i.test(content)) {
      failures.push(`${relativePath} must include Session Start Requirement section`);
    }
  }

  const stateTemplate = path.join(baseDir, "templates/STATE.md");
  if (fs.existsSync(stateTemplate)) {
    const content = fs.readFileSync(stateTemplate, "utf8");
    if (!/## Active Session/i.test(content)) {
      failures.push("templates/STATE.md must include active session section");
    }
    if (!/last_session_start|Last Session Start/i.test(content)) {
      failures.push("templates/STATE.md must include last session start field");
    }
    if (!/Next Allowed Command/i.test(content)) {
      failures.push("templates/STATE.md must include next allowed command section");
    }
  }

  const indexTemplate = path.join(baseDir, "templates/INDEX.md");
  if (fs.existsSync(indexTemplate)) {
    const content = fs.readFileSync(indexTemplate, "utf8");
    if (!/## Active Session/i.test(content)) {
      failures.push("templates/INDEX.md must include active session section");
    }
  }

  const agents = path.join(baseDir, "AGENTS.md");
  if (fs.existsSync(agents)) {
    const content = fs.readFileSync(agents, "utf8");
    if (!/## Session Start/i.test(content)) {
      failures.push("AGENTS.md must include Session Start section");
    }
  }

  const readme = path.join(baseDir, "README.md");
  if (fs.existsSync(readme)) {
    const content = fs.readFileSync(readme, "utf8");
    if (!/Session Start/i.test(content)) {
      failures.push("README.md must mention Session Start");
    }
  }
}

module.exports = {
  assertSessionStartLayer,
};
