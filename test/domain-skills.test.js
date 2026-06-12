const { test } = require("node:test");
const assert = require("node:assert/strict");
const cp = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const stackDetect = require(path.join(repoRoot, "dist", "shared", "stack-detect", "index.js"));
const domainSkills = require(path.join(repoRoot, "dist", "features", "domains", "index.js"));
const { skillHeadings } = require(
  path.join(repoRoot, "dist", "features", "validate", "domain", "constants.js")
);

function makeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "aih-domain-test-"));
}

test("parseProjectAnalysis validates and normalizes agent JSON", () => {
  const analysis = stackDetect.parseProjectAnalysis(
    JSON.stringify({
      domains: [
        { id: "backend", confidence: 0.9, evidence: ["fastapi in pyproject.toml"] },
        { id: "frontend", confidence: 2, evidence: ["nextjs"] },
        { id: "unknown-domain", confidence: 0.8, evidence: ["ignored"] },
      ],
      languages: ["python", "typescript"],
      frameworks: ["fastapi", "nextjs"],
      notes: "monorepo with web + service",
    })
  );

  assert.deepEqual(analysis.domains, ["frontend", "backend"]);
  assert.deepEqual(analysis.meta.languages, ["python", "typescript"]);
  assert.deepEqual(analysis.meta.frameworks, ["fastapi", "nextjs"]);
  assert.equal(analysis.meta.notes, "monorepo with web + service");
  assert.equal(analysis.meta.domains.length, 2);
  assert.equal(analysis.meta.domains[0].confidence, 1);
  assert.equal(analysis.meta.domains[1].confidence, 0.9);
});

test("parseProjectAnalysis rejects invalid JSON", () => {
  assert.throws(
    () => stackDetect.parseProjectAnalysis("{ not valid json"),
    /Project analysis must be valid JSON/
  );
});

test("writeDomainSkillSurface creates generated skill files and config selection", () => {
  const target = makeTempDir();
  fs.mkdirSync(path.join(target, ".claude"), { recursive: true });
  fs.mkdirSync(path.join(target, ".cursor"), { recursive: true });
  fs.mkdirSync(path.join(target, ".codex"), { recursive: true });
  fs.mkdirSync(path.join(target, ".gemini"), { recursive: true });

  const result = domainSkills.writeDomainSkillSurface(repoRoot, target, ["frontend", "security"], {
    packRoot: repoRoot,
    targetAbs: target,
    dryRun: false,
    force: false,
  });

  assert.ok(result.created.includes(".harness/config.json"));
  assert.ok(result.created.includes(".harness/SKILLS.md"));
  assert.ok(result.created.includes(".harness/WORKFLOW.md"));
  assert.ok(result.created.includes(".harness/skills/.gitkeep"));
  assert.ok(result.created.includes(".harness/skills/frontend/SKILL.md"));
  assert.ok(result.created.includes(".harness/skills/security/SKILL.md"));
  assert.ok(result.created.includes(".claude/rules/domain-frontend.md"));
  assert.ok(result.created.includes(".cursor/rules/domain-security.mdc"));
  assert.ok(result.created.includes(".codex/rules/domain-frontend.rules"));
  assert.ok(result.created.includes(".codex/agents/domain-frontend.toml"));
  assert.ok(result.created.includes(".agents/skills/frontend/SKILL.md"));
  assert.ok(result.created.includes(".agents/skills/security/SKILL.md"));
  assert.ok(
    result.created.includes(".gemini/extensions/ai-engineering-harness/rules/domain-security.md")
  );

  const config = JSON.parse(fs.readFileSync(path.join(target, ".harness", "config.json"), "utf8"));
  assert.deepEqual(config.domains, ["frontend", "security"]);

  const skills = fs.readFileSync(path.join(target, ".harness", "SKILLS.md"), "utf8");
  const workflow = fs.readFileSync(path.join(target, ".harness", "WORKFLOW.md"), "utf8");
  const agents = fs.readFileSync(path.join(target, "AGENTS.md"), "utf8");
  assert.match(skills, /Selected Domain Skills/);
  assert.match(skills, /frontend/);
  assert.match(workflow, /Domain Selection/);
  assert.match(agents, /Generated Domain Skills/);
  assert.match(agents, /\.codex\/agents\/domain-frontend\.toml/);

  const codexRules = fs.readFileSync(
    path.join(target, ".codex", "rules", "domain-frontend.rules"),
    "utf8"
  );
  assert.match(codexRules, /pattern = \["git","status"\]/);
  assert.match(codexRules, /decision = "forbidden"/);
  assert.doesNotMatch(codexRules, /prefixes\s*=|action\s*=|message\s*=/);

  const frontendSkill = fs.readFileSync(
    path.join(target, ".harness", "skills", "frontend", "SKILL.md"),
    "utf8"
  );
  for (const heading of skillHeadings) {
    assert.match(
      frontendSkill,
      new RegExp(`^${heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "m")
    );
  }
});

test("runDomainsCommand generates the skill surface from an analysis file", async () => {
  const target = makeTempDir();
  const analysisFile = path.join(target, "domain-analysis.json");
  fs.writeFileSync(
    analysisFile,
    JSON.stringify(
      {
        domains: [
          { id: "frontend", confidence: 0.95, evidence: ["app router"] },
          { id: "security", confidence: 0.85, evidence: ["auth boundary"] },
        ],
        languages: ["typescript"],
        frameworks: ["nextjs"],
        notes: "fixture",
      },
      null,
      2
    )
  );

  let output = "";
  const originalWrite = process.stdout.write;
  process.stdout.write = (chunk) => {
    output += chunk;
    return true;
  };

  try {
    const { runDomainsCommand } = require(
      path.join(repoRoot, "dist", "features", "domains", "presentation", "domains-command.js")
    );
    const status = await runDomainsCommand(repoRoot, {
      command: "domains",
      evalCommand: "",
      evalTarget: "",
      providers: [],
      scope: "",
      visibility: "",
      target,
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
      analysisFile,
    });

    assert.equal(status, 0);
    assert.match(output, /Domain skills generated for: frontend, security/);
    const config = JSON.parse(
      fs.readFileSync(path.join(target, ".harness", "config.json"), "utf8")
    );
    assert.deepEqual(config.domains, ["frontend", "security"]);
    assert.ok(fs.existsSync(path.join(target, ".harness", "skills", "frontend", "SKILL.md")));
    assert.ok(fs.existsSync(path.join(target, ".harness", "skills", "security", "SKILL.md")));
    assert.ok(fs.existsSync(path.join(target, ".agents", "skills", "frontend", "SKILL.md")));
    assert.ok(fs.existsSync(path.join(target, ".codex", "agents", "domain-frontend.toml")));
  } finally {
    process.stdout.write = originalWrite;
  }
});

test("domains CLI reads project analysis JSON from stdin", () => {
  const target = makeTempDir();
  const analysis = {
    domains: [
      { id: "backend", confidence: 0.88, evidence: ["api routes"] },
      { id: "cloud", confidence: 0.7, evidence: ["deployment surface"] },
    ],
    languages: ["typescript"],
    frameworks: ["express"],
    notes: "stdin fixture",
  };
  fs.mkdirSync(target, { recursive: true });

  const run = cp.spawnSync(
    process.execPath,
    [path.join(repoRoot, "dist", "cli", "main.js"), "domains", "--target", target],
    {
      cwd: repoRoot,
      input: `${JSON.stringify(analysis)}\n`,
      encoding: "utf8",
    }
  );

  assert.equal(run.status, 0, run.stderr);
  assert.match(run.stdout, /Domain skills generated for: backend, cloud/);
  const config = JSON.parse(fs.readFileSync(path.join(target, ".harness", "config.json"), "utf8"));
  assert.deepEqual(config.domains, ["backend", "cloud"]);
  assert.ok(fs.existsSync(path.join(target, ".harness", "skills", "backend", "SKILL.md")));
  assert.ok(fs.existsSync(path.join(target, ".harness", "skills", "cloud", "SKILL.md")));
  assert.ok(fs.existsSync(path.join(target, ".agents", "skills", "backend", "SKILL.md")));
  assert.ok(fs.existsSync(path.join(target, ".codex", "agents", "domain-backend.toml")));
});
