const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const stackDetect = require(path.join(repoRoot, "dist", "lib", "stack-detect.js"));
const domainSkills = require(path.join(repoRoot, "dist", "lib", "domain-skill-generation.js"));
const { skillHeadings } = require(path.join(repoRoot, "dist", "lib", "validate", "constants.js"));

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
  assert.ok(result.created.includes(".codex/rules/domain-frontend.md"));
  assert.ok(
    result.created.includes(".gemini/extensions/ai-engineering-harness/rules/domain-security.md")
  );

  const config = JSON.parse(fs.readFileSync(path.join(target, ".harness", "config.json"), "utf8"));
  assert.deepEqual(config.domains, ["frontend", "security"]);

  const skills = fs.readFileSync(path.join(target, ".harness", "SKILLS.md"), "utf8");
  const workflow = fs.readFileSync(path.join(target, ".harness", "WORKFLOW.md"), "utf8");
  assert.match(skills, /Selected Domain Skills/);
  assert.match(skills, /frontend/);
  assert.match(workflow, /Domain Selection/);

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
