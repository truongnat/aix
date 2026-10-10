// src/schema.ts
import { z } from "zod";
import { SKILL_NAME_MAX, SKILL_DESC_MAX } from "@x/core";
var SkillFrontmatterSchema = z.object({
  name: z.string().min(1).max(SKILL_NAME_MAX, `name t\u1ED1i \u0111a ${SKILL_NAME_MAX} k\xFD t\u1EF1`).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "kebab-case: ch\u1EEF-th\u01B0\u1EDDng/s\u1ED1/g\u1EA1ch-n\u1ED1i, kh\xF4ng \u0111\u1EA7u/cu\u1ED1i/l\u1EB7p d\u1EA5u -"),
  description: z.string().min(1, "description b\u1EAFt bu\u1ED9c").max(SKILL_DESC_MAX, `description t\u1ED1i \u0111a ${SKILL_DESC_MAX} k\xFD t\u1EF1`),
  license: z.string().optional(),
  compatibility: z.string().max(500).optional(),
  "disable-model-invocation": z.boolean().optional(),
  "user-invocable": z.boolean().optional(),
  "allowed-tools": z.string().optional(),
  metadata: z.record(z.string(), z.string()).default({})
}).strict();
var splitCsv = (v) => v ? v.split(",").map((s) => s.trim()).filter(Boolean) : [];
function parseMeta(metadata) {
  return {
    kind: metadata["kind"] ?? "domain",
    version: metadata["version"] ?? "0.1.0",
    tags: splitCsv(metadata["tags"]),
    roles: splitCsv(metadata["roles"]),
    compatible: splitCsv(metadata["compatible"])
  };
}

// src/registry.ts
import { readdir, readFile, stat } from "fs/promises";
import { join } from "path";
import matter from "gray-matter";
import { SKILL_BODY_MAX_TOKENS } from "@x/core";
function tokenEstimate(text) {
  return Math.ceil(text.length / 4);
}
var SkillRegistry = class _SkillRegistry {
  #skills;
  constructor(skills) {
    this.#skills = new Map(skills.map((s) => [s.id, s]));
  }
  static async load(contentRoot) {
    const skillsDir = join(contentRoot, "skills");
    const skills = [];
    let skillDirs;
    try {
      skillDirs = await readdir(skillsDir);
    } catch {
      return new _SkillRegistry([]);
    }
    for (const dirName of skillDirs) {
      const skillDir = join(skillsDir, dirName);
      let dirStat;
      try {
        dirStat = await stat(skillDir);
      } catch {
        continue;
      }
      if (!dirStat.isDirectory()) continue;
      const skillMdPath = join(skillDir, "SKILL.md");
      let mdStat;
      try {
        mdStat = await stat(skillMdPath);
      } catch {
        continue;
      }
      if (!mdStat.isFile()) continue;
      const raw = await readFile(skillMdPath, "utf-8");
      const parsed = matter(raw);
      const result = SkillFrontmatterSchema.safeParse(parsed.data);
      if (!result.success) {
        console.warn(`[registry] SKIP ${dirName}: frontmatter invalid \u2014 ${result.error.issues.map((i) => i.message).join("; ")}`);
        continue;
      }
      const frontmatter = result.data;
      const body = parsed.content;
      const estimate = tokenEstimate(body);
      if (estimate > SKILL_BODY_MAX_TOKENS) {
        console.warn(`[registry] WARN ${dirName}: body ~${estimate} tokens (max ${SKILL_BODY_MAX_TOKENS})`);
      }
      const references = [];
      const scripts = [];
      const assets = [];
      const subDirs = [];
      try {
        for (const entry of await readdir(skillDir)) {
          const subPath = join(skillDir, entry);
          const subStat = await stat(subPath);
          if (subStat.isDirectory()) {
            subDirs.push(entry);
          }
        }
      } catch {
      }
      for (const subDir of subDirs) {
        const subPath = join(skillDir, subDir);
        const target = subDir === "references" ? references : subDir === "scripts" ? scripts : subDir === "assets" ? assets : null;
        if (target) {
          try {
            for (const file of await readdir(subPath)) {
              target.push(join(subPath, file));
            }
          } catch {
          }
        }
      }
      if (frontmatter.name !== dirName) {
        console.warn(`[registry] SKIP ${dirName}: frontmatter name "${frontmatter.name}" \u2260 dir name`);
        continue;
      }
      skills.push({
        id: frontmatter.name,
        dir: skillDir,
        frontmatter,
        meta: parseMeta(frontmatter.metadata),
        body,
        bodyTokenEstimate: estimate,
        references,
        scripts,
        assets
      });
    }
    return new _SkillRegistry(skills);
  }
  all() {
    return [...this.#skills.values()];
  }
  get(name) {
    return this.#skills.get(name);
  }
  byKind(kind) {
    return this.all().filter((s) => s.meta.kind === kind);
  }
  byRole(role) {
    return this.all().filter((s) => s.meta.roles.includes(role));
  }
  search(query) {
    const q = query.toLowerCase();
    return this.all().filter(
      (s) => s.id.toLowerCase().includes(q) || s.frontmatter.description.toLowerCase().includes(q) || s.meta.tags.some((t) => t.toLowerCase().includes(q))
    ).map((s) => this.#toEntry(s));
  }
  toCatalog() {
    return this.all().map((s) => this.#toEntry(s));
  }
  validateAll() {
    const errors = [];
    for (const skill of this.#skills.values()) {
      if (skill.bodyTokenEstimate > SKILL_BODY_MAX_TOKENS) {
        errors.push({
          code: "WARN",
          message: `Skill "${skill.id}" body qu\xE1 d\xE0i: ~${skill.bodyTokenEstimate} tokens (max ${SKILL_BODY_MAX_TOKENS})`,
          path: skill.dir,
          cause: void 0
        });
      }
    }
    return errors;
  }
  #toEntry(skill) {
    return {
      name: skill.frontmatter.name,
      description: skill.frontmatter.description,
      kind: skill.meta.kind,
      tags: skill.meta.tags,
      version: skill.meta.version,
      roles: skill.meta.roles,
      compatible: skill.meta.compatible,
      dir: skill.dir
    };
  }
};

// src/migrator.ts
import { readdir as readdir2, mkdir, copyFile, readFile as readFile2, writeFile } from "fs/promises";
import { join as join2 } from "path";
import { statSync } from "fs";
import matter2 from "gray-matter";
import { SKILL_DESC_MAX as SKILL_DESC_MAX2 } from "@x/core";
var DEFAULT_SOURCE_KINDS = {
  "skills/skills": "domain",
  "system-design-skills": "reference",
  "ai-engineering-harness/skills": "process",
  "dev-memory/skills": "domain"
};
function resolveKind(sourcePath, kindMap) {
  const map = kindMap ?? DEFAULT_SOURCE_KINDS;
  for (const [key, kind] of Object.entries(map)) {
    if (sourcePath.endsWith(key) || sourcePath.endsWith("/" + key)) return kind;
  }
  return void 0;
}
async function detectKindFromFrontmatter(skillDir) {
  try {
    const raw = await readFile2(join2(skillDir, "SKILL.md"), "utf-8");
    const parsed = matter2(raw);
    const k = parsed.data?.["x-kind"];
    if (typeof k === "string" && ["domain", "process", "reference"].includes(k)) {
      return k;
    }
  } catch {
  }
  return void 0;
}
async function scanSkillDir(dirPath, name) {
  try {
    const entries = await readdir2(dirPath);
    if (!entries.includes("SKILL.md")) return null;
    const files = [];
    const subdirs = /* @__PURE__ */ new Map();
    for (const entry of entries) {
      if (entry.startsWith(".")) continue;
      const fullPath = join2(dirPath, entry);
      let isDir = false;
      try {
        isDir = statSync(fullPath).isDirectory();
      } catch {
        continue;
      }
      if (isDir) {
        const subFiles = (await readdir2(fullPath)).map((f) => join2(entry, f));
        subdirs.set(entry, subFiles);
      } else {
        files.push(entry);
      }
    }
    return { name, sourceDir: dirPath, files, subdirs, kind: "domain" };
  } catch {
    return null;
  }
}
async function migrateSkills(opts) {
  const dryRun = opts.write !== true;
  const errors = [];
  const allSkills = [];
  for (const source of opts.sources) {
    let sourceEntries;
    try {
      sourceEntries = await readdir2(source);
    } catch (e) {
      errors.push({ code: "IO", message: `Cannot read source: ${source}`, cause: e, path: source });
      continue;
    }
    const sourceKind = resolveKind(source, opts.kindMap);
    const isMerge = sourceEntries.includes("SKILL.md");
    if (isMerge) {
      const name = "system-design-pro";
      const files = [];
      const subdirs = /* @__PURE__ */ new Map();
      for (const entry of sourceEntries) {
        if (entry.startsWith(".")) continue;
        const fullPath = join2(source, entry);
        let isDir = false;
        try {
          isDir = statSync(fullPath).isDirectory();
        } catch {
          continue;
        }
        if (isDir) {
          if (entry === "references") {
            const refs = (await readdir2(fullPath)).filter((f) => f.endsWith(".md")).map((f) => join2("references", f));
            subdirs.set("references", refs);
          }
        } else {
          files.push(entry);
        }
      }
      allSkills.push({
        name,
        sourceDir: source,
        files,
        subdirs,
        kind: sourceKind ?? "reference"
      });
    } else {
      for (const entry of sourceEntries) {
        if (entry.startsWith(".")) continue;
        const skillDir = join2(source, entry);
        const skill = await scanSkillDir(skillDir, entry);
        if (!skill) continue;
        if (sourceKind) {
          skill.kind = sourceKind;
        } else {
          const detected = await detectKindFromFrontmatter(skill.sourceDir);
          if (detected) skill.kind = detected;
        }
        allSkills.push(skill);
      }
    }
  }
  const byName = /* @__PURE__ */ new Map();
  for (const skill of allSkills) {
    const existing = byName.get(skill.name) ?? [];
    existing.push(skill);
    byName.set(skill.name, existing);
  }
  const duplicates = [];
  const dropped = [];
  const keepSet = /* @__PURE__ */ new Set();
  for (const [name, entries] of byName) {
    if (entries.length === 1) {
      keepSet.add(entries[0]);
    } else {
      duplicates.push({ name, sources: entries.map((e) => e.sourceDir) });
      const preferred = entries.find((e) => e.sourceDir.includes("skills/skills")) ?? entries[0];
      keepSet.add(preferred);
      for (const e of entries) {
        if (e !== preferred) {
          dropped.push({
            name: e.name,
            reason: `Duplicate: keeping "${preferred.sourceDir}", dropping "${e.sourceDir}"`
          });
        }
      }
    }
  }
  const converted = [...keepSet].map((s) => ({ from: s.sourceDir, to: join2(opts.outDir, s.name) }));
  if (!dryRun) {
    for (const skill of keepSet) {
      const targetDir = join2(opts.outDir, skill.name);
      await mkdir(targetDir, { recursive: true });
      for (const file of skill.files) {
        const src = join2(skill.sourceDir, file);
        const dest = join2(targetDir, file);
        try {
          if (file === "SKILL.md") {
            const raw = await readFile2(src, "utf-8");
            const parsed = matter2(raw);
            const knownKeys = /* @__PURE__ */ new Set(["name", "description", "license", "compatibility", "metadata", "disable-model-invocation", "user-invocable", "allowed-tools"]);
            const cleaned = {};
            const meta = {};
            for (const [key, val] of Object.entries(parsed.data)) {
              if (key.startsWith("x-")) {
                const v = Array.isArray(val) ? val.join(",") : String(val);
                meta[key.slice(2)] = v;
              } else if (knownKeys.has(key)) {
                cleaned[key] = val;
              }
            }
            if (!cleaned["name"] || String(cleaned["name"]).trim() === "") {
              cleaned["name"] = skill.name;
            }
            let skillName = String(cleaned["name"]).toLowerCase().trim();
            skillName = skillName.replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
            if (!skillName) skillName = skill.name;
            cleaned["name"] = skillName;
            if (!cleaned["description"] || String(cleaned["description"]).trim() === "") {
              cleaned["description"] = `Skill: ${skillName}`;
            }
            if (typeof cleaned["description"] === "string" && cleaned["description"].length > SKILL_DESC_MAX2) {
              cleaned["description"] = cleaned["description"].slice(0, SKILL_DESC_MAX2);
            }
            meta["kind"] ??= skill.kind;
            meta["version"] ??= "0.1.0";
            meta["compatible"] ??= "claude,cursor,codex,gemini";
            const existing = cleaned["metadata"];
            cleaned["metadata"] = { ...existing ?? {}, ...meta };
            const engine = opts.policyEngine;
            if (engine) {
              for (const key of Object.keys(cleaned)) {
                const val = cleaned[key];
                if (typeof val === "string") {
                  cleaned[key] = engine.redact(val).clean;
                } else if (Array.isArray(val)) {
                  cleaned[key] = val.map((v) => typeof v === "string" ? engine.redact(v).clean : v);
                }
              }
              const cleanBody = engine.redact(parsed.content).clean;
              const output = matter2.stringify(cleanBody, cleaned);
              await writeFile(dest, output, "utf-8");
            } else {
              const output = matter2.stringify(parsed.content, cleaned);
              await writeFile(dest, output, "utf-8");
            }
          } else {
            await copyFile(src, dest);
          }
        } catch (e) {
          errors.push({ code: "IO", message: `Failed to copy ${src}`, cause: e, path: src });
        }
      }
      for (const [subdir, files] of skill.subdirs) {
        for (const file of files) {
          const src = join2(skill.sourceDir, file);
          const dest = join2(targetDir, file);
          try {
            await mkdir(join2(targetDir, subdir), { recursive: true });
            await copyFile(src, dest);
          } catch (e) {
            errors.push({ code: "IO", message: `Failed to copy ${src}`, cause: e, path: src });
          }
        }
      }
    }
  }
  return { converted, duplicates, dropped, errors };
}
export {
  SkillFrontmatterSchema,
  SkillRegistry,
  migrateSkills
};
//# sourceMappingURL=index.js.map