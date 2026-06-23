import fs from "node:fs";
import path from "node:path";

type TemplateKind = "pr_message" | "report" | "change_summary";
type TemplateSource = "project" | "harness-pack";

interface DiscoveredTemplate {
  kind: TemplateKind;
  source: TemplateSource;
  provider: string;
  path: string;
  label: string;
  content: string;
}

interface ReportTemplateDiscovery {
  ok: boolean;
  status: "ready" | "fallback";
  primary: {
    prMessage: DiscoveredTemplate | null;
    report: DiscoveredTemplate | null;
    changeSummary: DiscoveredTemplate | null;
  };
  candidates: {
    prMessage: DiscoveredTemplate[];
  };
  fallback: {
    prMessage: string;
    report: string;
    changeSummary: string;
  };
}

interface ScanRule {
  provider: string;
  kind: TemplateKind;
  relativePath: string;
  label?: string;
}

const PROJECT_PR_RULES: ScanRule[] = [
  {
    provider: "github",
    kind: "pr_message",
    relativePath: ".github/pull_request_template.md",
    label: "GitHub default PR template",
  },
  {
    provider: "github",
    kind: "pr_message",
    relativePath: ".github/PULL_REQUEST_TEMPLATE.md",
    label: "GitHub PR template (uppercase)",
  },
  {
    provider: "gitlab",
    kind: "pr_message",
    relativePath: ".gitlab/merge_request_template.md",
    label: "GitLab default MR template",
  },
  {
    provider: "gitlab",
    kind: "pr_message",
    relativePath: ".gitlab/merge_request_templates/Default.md",
    label: "GitLab Default MR template",
  },
  {
    provider: "azure-devops",
    kind: "pr_message",
    relativePath: ".azuredevops/pull_request_template.md",
    label: "Azure DevOps PR template",
  },
  {
    provider: "gitea",
    kind: "pr_message",
    relativePath: ".gitea/pull_request_template.md",
    label: "Gitea PR template",
  },
  {
    provider: "generic",
    kind: "pr_message",
    relativePath: "PULL_REQUEST_TEMPLATE.md",
    label: "Root PR template",
  },
  {
    provider: "generic",
    kind: "pr_message",
    relativePath: "docs/pull_request_template.md",
    label: "Docs PR template",
  },
];

const PROJECT_REPORT_RULES: ScanRule[] = [
  {
    provider: "github",
    kind: "report",
    relativePath: ".github/REPORT_TEMPLATE.md",
    label: "GitHub report template",
  },
  {
    provider: "generic",
    kind: "report",
    relativePath: "docs/REPORT_TEMPLATE.md",
    label: "Docs report template",
  },
];

const PROJECT_DIR_SCANS: {
  provider: string;
  kind: TemplateKind;
  relativeDir: string;
  labelPrefix: string;
}[] = [
  {
    provider: "github",
    kind: "pr_message",
    relativeDir: ".github/PULL_REQUEST_TEMPLATE",
    labelPrefix: "GitHub PR template",
  },
  {
    provider: "gitlab",
    kind: "pr_message",
    relativeDir: ".gitlab/merge_request_templates",
    labelPrefix: "GitLab MR template",
  },
];

function readFileIfExists(repoRoot: string, relativePath: string): string | null {
  const abs = path.join(repoRoot, relativePath);
  if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) {
    return null;
  }
  return fs.readFileSync(abs, "utf8");
}

function scanDirectoryTemplates(
  repoRoot: string,
  provider: string,
  kind: TemplateKind,
  relativeDir: string,
  labelPrefix: string
): DiscoveredTemplate[] {
  const absDir = path.join(repoRoot, relativeDir);
  if (!fs.existsSync(absDir) || !fs.statSync(absDir).isDirectory()) {
    return [];
  }
  const entries = fs
    .readdirSync(absDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /\.md$/i.test(entry.name))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));

  return entries.map((name) => {
    const relativePath = path.join(relativeDir, name).replace(/\\/g, "/");
    return {
      kind,
      source: "project" as const,
      provider,
      path: relativePath,
      label: `${labelPrefix}: ${name}`,
      content: fs.readFileSync(path.join(repoRoot, relativePath), "utf8"),
    };
  });
}

function scanRuleTemplates(repoRoot: string, rules: ScanRule[]): DiscoveredTemplate[] {
  const found: DiscoveredTemplate[] = [];
  for (const rule of rules) {
    const content = readFileIfExists(repoRoot, rule.relativePath);
    if (!content) {
      continue;
    }
    found.push({
      kind: rule.kind,
      source: "project",
      provider: rule.provider,
      path: rule.relativePath.replace(/\\/g, "/"),
      label: rule.label || rule.relativePath,
      content,
    });
  }
  return found;
}

function resolveHarnessFallback(repoRoot: string): ReportTemplateDiscovery["fallback"] {
  const candidates = [
    {
      prMessage: ".ai-harness/templates/PR_MESSAGE.md",
      report: ".ai-harness/templates/REPORT.md",
      changeSummary: ".ai-harness/templates/CHANGE_SUMMARY.md",
    },
    {
      prMessage: "templates/PR_MESSAGE.md",
      report: "templates/REPORT.md",
      changeSummary: "templates/CHANGE_SUMMARY.md",
    },
  ];

  for (const set of candidates) {
    const prMessage = path.join(repoRoot, set.prMessage);
    if (fs.existsSync(prMessage)) {
      return set;
    }
  }

  return {
    prMessage: "templates/PR_MESSAGE.md",
    report: "templates/REPORT.md",
    changeSummary: "templates/CHANGE_SUMMARY.md",
  };
}

function loadHarnessTemplate(repoRoot: string, relativePath: string): DiscoveredTemplate | null {
  const content = readFileIfExists(repoRoot, relativePath);
  if (!content) {
    return null;
  }
  return {
    kind: relativePath.includes("PR_MESSAGE")
      ? "pr_message"
      : relativePath.includes("CHANGE_SUMMARY")
        ? "change_summary"
        : "report",
    source: "harness-pack",
    provider: "harness",
    path: relativePath.replace(/\\/g, "/"),
    label: "Harness default template",
    content,
  };
}

function discoverReportTemplates(repoRoot: string): ReportTemplateDiscovery {
  const prCandidates: DiscoveredTemplate[] = [
    ...scanRuleTemplates(repoRoot, PROJECT_PR_RULES),
    ...PROJECT_DIR_SCANS.flatMap((scan) =>
      scanDirectoryTemplates(repoRoot, scan.provider, scan.kind, scan.relativeDir, scan.labelPrefix)
    ),
  ];

  const reportCandidates = scanRuleTemplates(repoRoot, PROJECT_REPORT_RULES);
  const fallbackPaths = resolveHarnessFallback(repoRoot);

  const primaryPr = prCandidates[0] ?? null;
  const primaryReport = reportCandidates[0] ?? loadHarnessTemplate(repoRoot, fallbackPaths.report);
  const primaryChangeSummary = loadHarnessTemplate(repoRoot, fallbackPaths.changeSummary);

  return {
    ok: true,
    status: primaryPr ? "ready" : "fallback",
    primary: {
      prMessage: primaryPr ?? loadHarnessTemplate(repoRoot, fallbackPaths.prMessage),
      report: primaryReport,
      changeSummary: primaryChangeSummary,
    },
    candidates: {
      prMessage: prCandidates,
    },
    fallback: fallbackPaths,
  };
}

function renderReportTemplatesMarkdown(discovery: ReportTemplateDiscovery): string {
  const lines: string[] = [
    "# Report Template Discovery",
    "",
    "> Auto-detected ship/report templates. Prefer **project** templates over harness defaults.",
    "",
    `status: ${discovery.status}`,
    "",
    "## Primary templates",
    "",
  ];

  for (const [key, template] of Object.entries(discovery.primary)) {
    if (!template) {
      lines.push(`- **${key}:** (none)`);
      continue;
    }
    lines.push(
      `- **${key}:** \`${template.path}\` (${template.source}, ${template.provider}) — ${template.label}`
    );
  }

  lines.push("");
  lines.push("## PR template candidates");
  lines.push("");
  if (discovery.candidates.prMessage.length === 0) {
    lines.push("- none — using harness fallback");
  } else {
    for (const candidate of discovery.candidates.prMessage) {
      lines.push(`- \`${candidate.path}\` — ${candidate.label}`);
    }
  }

  lines.push("");
  lines.push("## Harness fallback paths");
  lines.push("");
  lines.push(`- PR: \`${discovery.fallback.prMessage}\``);
  lines.push(`- Report: \`${discovery.fallback.report}\``);
  lines.push(`- Change summary: \`${discovery.fallback.changeSummary}\``);
  lines.push("");
  lines.push("## Ship rule");
  lines.push("");
  lines.push(
    "Fill session `PR_MESSAGE.md` using the **primary prMessage** template structure. Only use harness defaults when no project template exists."
  );
  lines.push("");

  return lines.join("\n");
}

export {
  discoverReportTemplates,
  renderReportTemplatesMarkdown,
  PROJECT_DIR_SCANS,
  PROJECT_PR_RULES,
};
export type { DiscoveredTemplate, ReportTemplateDiscovery, TemplateKind, TemplateSource };
