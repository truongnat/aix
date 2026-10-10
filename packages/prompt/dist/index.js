// src/assembler.ts
var PromptAssembler = class {
  constructor(registry, memory, parts) {
    this.registry = registry;
    this.memory = memory;
    this.parts = parts;
  }
  registry;
  memory;
  parts;
  async assemble(ctx) {
    const system = [
      this.parts.base.trim(),
      this.parts.responseContract.trim(),
      this.parts.toneFormat.trim()
    ].filter(Boolean).join("\n\n");
    const relevantSkills = this.registry.byRole(ctx.role);
    const skillLines = relevantSkills.map(
      (s) => `- ${s.id}: ${s.frontmatter.description}`
    );
    const skillBlock = skillLines.length > 0 ? `

Available skills:
${skillLines.join("\n")}` : "";
    const systemWithSkills = system + skillBlock;
    const skillMetadata = relevantSkills.map((s) => ({
      name: s.frontmatter.name,
      description: s.frontmatter.description,
      kind: s.meta.kind,
      tags: s.meta.tags,
      version: s.meta.version,
      roles: s.meta.roles,
      compatible: s.meta.compatible,
      dir: s.dir
    }));
    const fewShot = ctx.tags.length > 0 ? await this.memory.search(ctx.task, { tags: ctx.tags, k: 3 }) : [];
    const totalChars = systemWithSkills.length + fewShot.reduce((s, r) => s + r.body.length, 0) + ctx.task.length;
    const tokenEstimate = Math.ceil(totalChars / 4);
    return {
      system: systemWithSkills,
      skillMetadata,
      fewShot,
      user: ctx.task,
      tokenEstimate
    };
  }
};

// src/linter.ts
function lintPrompt(p) {
  const issues = [];
  if (!p.system.toLowerCase().includes("success") && !p.system.toLowerCase().includes("criteria")) {
    issues.push({ level: "warn", message: "System prompt may be missing success criteria" });
  }
  if (p.tokenEstimate > 4e3) {
    issues.push({ level: "warn", message: `Token estimate ${p.tokenEstimate} is high, consider trimming` });
  }
  const hasJson = p.system.toLowerCase().includes("json");
  const hasMarkdown = p.system.toLowerCase().includes("markdown");
  if (hasJson && hasMarkdown) {
    issues.push({ level: "warn", message: "Potential contradiction: both JSON and Markdown output formats mentioned" });
  }
  if (!p.system.toLowerCase().includes("output") && !p.system.toLowerCase().includes("respond")) {
    issues.push({ level: "error", message: "No output constraints found in system prompt" });
  }
  if (p.skillMetadata.length === 0) {
    issues.push({ level: "warn", message: "No skills are included in the prompt assembly" });
  }
  return issues;
}

// src/system-parts.ts
var DEFAULT_SYSTEM_PARTS = {
  base: "You are an expert AI engineer. Follow the instructions carefully and produce high-quality results.",
  responseContract: "Respond with valid JSON following the specified schema exactly. Do not include markdown code fences around JSON output.",
  toneFormat: "Be concise, professional, and precise. Use technical accuracy. Avoid unnecessary pleasantries."
};
export {
  DEFAULT_SYSTEM_PARTS,
  PromptAssembler,
  lintPrompt
};
//# sourceMappingURL=index.js.map