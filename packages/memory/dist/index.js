// src/markdown-store.ts
import { mkdir, readdir, readFile, writeFile } from "fs/promises";
import { join } from "path";
var MEMORY_DIR = ".aix/runtime/memory";
function recordToMarkdown(rec) {
  return [
    "---",
    `id: ${rec.id}`,
    `kind: ${rec.kind}`,
    `title: ${rec.title}`,
    `tags: [${rec.tags.join(", ")}]`,
    `version: ${rec.version}`,
    `createdAt: ${rec.createdAt}`,
    "---",
    "",
    rec.body
  ].join("\n");
}
function parseMarkdownRecord(content) {
  const lines = content.split("\n");
  const meta = {};
  let bodyStart = 0;
  if (lines[0]?.trim() === "---") {
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim() === "---") {
        bodyStart = i + 1;
        break;
      }
      const colonIdx = line.indexOf(":");
      if (colonIdx !== -1) {
        meta[line.slice(0, colonIdx).trim()] = line.slice(colonIdx + 1).trim();
      }
    }
  }
  const body = lines.slice(bodyStart).join("\n").trim();
  const tagsRaw = meta["tags"] ?? "[]";
  const tags = tagsRaw.replace(/^\[|\]$/g, "").split(",").map((t) => t.trim()).filter(Boolean);
  return {
    id: meta["id"] ?? "",
    kind: meta["kind"] ?? "evidence",
    title: meta["title"] ?? "",
    body,
    tags,
    version: meta["version"] ?? "0.1.0",
    createdAt: meta["createdAt"] ?? (/* @__PURE__ */ new Date()).toISOString()
  };
}
function recordFilePath(id) {
  return join(MEMORY_DIR, `${id}.md`);
}
var MarkdownStore = class {
  #baseDir;
  constructor(baseDir = ".") {
    this.#baseDir = baseDir;
  }
  async push(rec) {
    const dir = join(this.#baseDir, MEMORY_DIR);
    await mkdir(dir, { recursive: true });
    const content = recordToMarkdown(rec);
    await writeFile(join(dir, `${rec.id}.md`), content, "utf-8");
  }
  async search(query, opts) {
    const dir = join(this.#baseDir, MEMORY_DIR);
    let files;
    try {
      files = await readdir(dir);
    } catch {
      return [];
    }
    const q = query.toLowerCase();
    const results = [];
    for (const file of files) {
      if (!file.endsWith(".md")) continue;
      try {
        const content = await readFile(join(dir, file), "utf-8");
        const rec = parseMarkdownRecord(content);
        const searchable = `${rec.title} ${rec.body}`.toLowerCase();
        if (!searchable.includes(q)) continue;
        if (opts?.tags && opts.tags.length > 0) {
          const hasAllTags = opts.tags.every((t) => rec.tags.includes(t));
          if (!hasAllTags) continue;
        }
        results.push(rec);
      } catch {
        continue;
      }
    }
    const limit = opts?.k ?? results.length;
    return results.slice(0, limit);
  }
  async get(id) {
    const filePath = recordFilePath(id);
    try {
      const content = await readFile(join(this.#baseDir, filePath), "utf-8");
      return parseMarkdownRecord(content);
    } catch {
      return void 0;
    }
  }
  async list(opts) {
    const dir = join(this.#baseDir, MEMORY_DIR);
    let files;
    try {
      files = await readdir(dir);
    } catch {
      return [];
    }
    const results = [];
    for (const file of files) {
      if (!file.endsWith(".md")) continue;
      try {
        const content = await readFile(join(dir, file), "utf-8");
        const rec = parseMarkdownRecord(content);
        if (opts?.kind && rec.kind !== opts.kind) continue;
        results.push(rec);
      } catch {
        continue;
      }
    }
    return results;
  }
};

// src/redacted-store.ts
var RedactedMemoryStore = class {
  #inner;
  #policy;
  constructor(inner, policy) {
    this.#inner = inner;
    this.#policy = policy;
  }
  async push(rec) {
    const clean = this.#redact(rec);
    await this.#inner.push(clean);
  }
  async search(query, opts) {
    const results = await this.#inner.search(query, opts);
    return results.map((r) => this.#redact(r));
  }
  async get(id) {
    const rec = await this.#inner.get(id);
    return rec ? this.#redact(rec) : void 0;
  }
  async list(opts) {
    const results = await this.#inner.list(opts);
    return results.map((r) => this.#redact(r));
  }
  #redact(rec) {
    const bodyResult = this.#policy.redact(rec.body);
    if (bodyResult.findings.length > 0) {
      console.warn(`[redact] redacted ${bodyResult.findings.length} item(s) in memory body`);
    }
    const titleResult = this.#policy.redact(rec.title);
    if (titleResult.findings.length > 0) {
      console.warn(`[redact] redacted ${titleResult.findings.length} item(s) in memory title`);
    }
    return {
      ...rec,
      title: titleResult.clean,
      body: bodyResult.clean
    };
  }
};
export {
  MarkdownStore,
  RedactedMemoryStore
};
//# sourceMappingURL=index.js.map