"use strict";

const fs = require("node:fs");
const path = require("node:path");

function readConfigDomains(repoRoot) {
  const configPath = path.join(repoRoot, ".harness", "config.json");
  if (!fs.existsSync(configPath)) {
    return null;
  }
  try {
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    return Array.isArray(config.domains) ? config.domains : null;
  } catch {
    return null;
  }
}

function hasGeneratedDomainSkills(repoRoot) {
  const skillsDir = path.join(repoRoot, ".harness", "skills");
  if (!fs.existsSync(skillsDir)) {
    return false;
  }
  try {
    const entries = fs.readdirSync(skillsDir, { withFileTypes: true });
    return entries.some((entry) => entry.isDirectory());
  } catch {
    return false;
  }
}

function needsDomainBootstrap(repoRoot) {
  const domains = readConfigDomains(repoRoot);
  if (domains === null) {
    return false;
  }
  if (domains.length > 0) {
    return false;
  }
  return !hasGeneratedDomainSkills(repoRoot);
}

function buildDomainBootstrapIntent() {
  return [
    "Domain bootstrap required: .harness/config.json has domains: [] and no generated domain skills exist.",
    "Before any other work, execute the harness-start protocol.",
    "1. Tell the user you are analyzing the codebase.",
    "2. Run domain analysis per prompt-templates/domain-analysis.md.",
    "3. Generate domain skills with: npx ai-engineering-harness domains --analysis-file <path>",
    "4. Report generated domains and files.",
    "Do not skip harness-start or domain bootstrap on this first session.",
  ].join(" ");
}

function buildSessionStartIntent(repoRoot) {
  const parts = [
    "Harness session start.",
    "Read .harness/STATE.md, .harness/GOAL.md, and .harness/PLAN.md before editing.",
  ];

  if (needsDomainBootstrap(repoRoot)) {
    parts.push(buildDomainBootstrapIntent());
    parts.push("Mandatory next command: harness-start (includes domain bootstrap).");
    return parts.join(" ");
  }

  parts.push(
    "If session state is unknown or this is a new chat, run harness-start before discuss, plan, run, verify, or ship."
  );
  return parts.join(" ");
}

module.exports = {
  buildDomainBootstrapIntent,
  buildSessionStartIntent,
  hasGeneratedDomainSkills,
  needsDomainBootstrap,
  readConfigDomains,
};
