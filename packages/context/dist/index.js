// src/analyze.ts
import { readdir, readFile } from "fs/promises";
import { join, extname } from "path";
var LANGUAGE_MAP = {
  ".ts": "typescript",
  ".tsx": "typescript",
  ".js": "javascript",
  ".jsx": "javascript",
  ".mjs": "javascript",
  ".cjs": "javascript",
  ".mts": "typescript",
  ".cts": "typescript",
  ".py": "python",
  ".go": "go",
  ".rs": "rust",
  ".java": "java",
  ".rb": "ruby"
};
var IGNORE_DIRS = /* @__PURE__ */ new Set([
  "node_modules",
  ".git",
  "dist",
  ".turbo",
  "build",
  ".next",
  "coverage",
  ".aix",
  ".claude",
  ".cursor",
  "imports"
]);
function analyzeFile(filePath, content) {
  const ext = extname(filePath);
  const language = LANGUAGE_MAP[ext] ?? ext.slice(1);
  const lines = content.split("\n");
  return {
    path: filePath,
    language,
    functions: extractFunctions(content, lines),
    classes: extractClasses(content, lines),
    imports: extractImports(content)
  };
}
function extractFunctions(content, lines) {
  const functions = [];
  const re = /(?:export\s+)?(?:async\s+)?function\s+(['"`])?(\w+)\1?\s*\(([^)]*)\)/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    const name = m[2];
    const params = m[3].split(",").map((p) => p.trim()).filter(Boolean);
    const startLine = content.slice(0, m.index).split("\n").length;
    const endLine = findBlockEnd(lines, startLine - 1);
    functions.push({ name, params, startLine, endLine });
  }
  const arrowRe = /(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?(?:\(([^)]*)\)|(\w+))\s*=>/g;
  while ((m = arrowRe.exec(content)) !== null) {
    const name = m[1];
    const params = m[2] ? m[2].split(",").map((p) => p.trim()).filter(Boolean) : m[3] ? [m[3]] : [];
    const startLine = content.slice(0, m.index).split("\n").length;
    functions.push({ name, params, startLine, endLine: startLine });
  }
  return functions;
}
function findBlockEnd(lines, startIdx) {
  let depth = 0;
  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i];
    for (const ch of line) {
      if (ch === "{") depth++;
      if (ch === "}") depth--;
    }
    if (depth <= 0 && i > startIdx) return i + 1;
  }
  return lines.length;
}
function extractClasses(content, lines) {
  const classes = [];
  const re = /(?:export\s+)?(?:abstract\s+)?class\s+(\w+)/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    const name = m[1];
    const startLine = content.slice(0, m.index).split("\n").length;
    const startIdx = Math.max(0, startLine - 1);
    const classEnd = findBlockEnd(lines, startIdx);
    const classBody = lines.slice(startIdx, classEnd).join("\n");
    const methods = [];
    const methodRe = /(?:async\s+)?(?:get\s+)?(?:set\s+)?(\w+)\s*\([^)]*\)\s*\{/g;
    let mm;
    while ((mm = methodRe.exec(classBody)) !== null) {
      methods.push(mm[1]);
    }
    classes.push({ name, methods, startLine });
  }
  return classes;
}
function extractImports(content) {
  const imports = [];
  const re = /import\s+(?:\{[^}]*\}\s+from\s+)?['"]([^'"]+)['"]/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    imports.push(m[1]);
  }
  return imports;
}
function extractApiContracts(content) {
  const apis = [];
  const re = /(?:app|router|route)\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/gi;
  let m;
  while ((m = re.exec(content)) !== null) {
    apis.push({
      method: m[1].toUpperCase(),
      route: m[2],
      params: []
    });
  }
  return apis;
}
function buildFlowGraphs(files, fileContents) {
  const flows = [];
  for (const file of files) {
    const content = fileContents.get(file.path);
    if (!content) continue;
    const fnNames = new Set(file.functions.map((f) => f.name));
    for (const fn of file.functions) {
      const edges = [];
      for (const otherName of fnNames) {
        if (otherName === fn.name) continue;
        const escaped = otherName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const callRe = new RegExp(`\\b${escaped}\\s*\\(`, "g");
        if (callRe.test(content)) {
          edges.push({ from: fn.name, to: otherName });
        }
      }
      if (edges.length > 0) {
        const nodes = [fn.name, ...edges.map((e) => e.to)];
        flows.push({ name: fn.name, nodes: [...new Set(nodes)], edges });
      }
    }
  }
  return flows;
}
async function scanDirectory(dirPath, languages) {
  const files = [];
  const apis = [];
  const contents = /* @__PURE__ */ new Map();
  const entries = await readdir(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    if (IGNORE_DIRS.has(entry.name)) continue;
    const fullPath = join(dirPath, entry.name);
    if (entry.isDirectory()) {
      const sub = await scanDirectory(fullPath, languages);
      files.push(...sub.files);
      apis.push(...sub.apis);
      for (const [k, v] of sub.contents) {
        contents.set(k, v);
      }
    } else if (entry.isFile()) {
      const ext = extname(entry.name);
      if (!LANGUAGE_MAP[ext]) continue;
      if (languages && !languages.includes(LANGUAGE_MAP[ext])) continue;
      try {
        const content = await readFile(fullPath, "utf-8");
        contents.set(fullPath, content);
        files.push(analyzeFile(fullPath, content));
        apis.push(...extractApiContracts(content));
      } catch {
        continue;
      }
    }
  }
  return { files, apis, contents };
}
async function analyzeProject(projectPath, languages) {
  const { files, apis, contents } = await scanDirectory(projectPath, languages);
  const flows = buildFlowGraphs(files, contents);
  return { files, flows, apis };
}

// src/embed.ts
function tokenize(text) {
  return text.toLowerCase().replace(/[^a-z0-9_$]/g, " ").split(/\s+/).filter((t) => t.length > 0 && t.length <= 50);
}
var SimpleEmbedder = class {
  vocab = /* @__PURE__ */ new Map();
  frozen = false;
  embed(text) {
    const tokens = tokenize(text);
    const tf = /* @__PURE__ */ new Map();
    for (const t of tokens) {
      tf.set(t, (tf.get(t) ?? 0) + 1);
    }
    if (!this.frozen) {
      for (const t of tf.keys()) {
        if (!this.vocab.has(t)) {
          this.vocab.set(t, this.vocab.size);
        }
      }
    }
    const vec = new Array(this.vocab.size).fill(0);
    for (const [term, count] of tf) {
      const idx = this.vocab.get(term);
      if (idx !== void 0) {
        vec[idx] = count;
      }
    }
    const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0));
    if (norm > 0) {
      for (let i = 0; i < vec.length; i++) {
        vec[i] /= norm;
      }
    }
    return Promise.resolve(vec);
  }
  freeze() {
    this.frozen = true;
  }
  vocabSize() {
    return this.vocab.size;
  }
};

// src/vector-store.ts
function cosineSimilarity(a, b) {
  let dot = 0;
  let na = 0;
  let nb = 0;
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) {
    const ai = a[i] ?? 0;
    const bi = b[i] ?? 0;
    dot += ai * bi;
    na += ai * ai;
    nb += bi * bi;
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}
var SimpleVectorStore = class _SimpleVectorStore {
  docs = /* @__PURE__ */ new Map();
  async index(docs) {
    for (const d of docs) {
      this.docs.set(d.id, { content: d.content, embedding: d.embedding });
    }
  }
  async query(embedding, k) {
    const scores = [];
    for (const [id, doc] of this.docs) {
      const score = cosineSimilarity(embedding, doc.embedding);
      scores.push({ id, content: doc.content, score });
    }
    scores.sort((a, b) => b.score - a.score);
    return scores.slice(0, k).map((s) => ({
      file: s.id,
      content: s.content,
      score: s.score
    }));
  }
  clear() {
    this.docs.clear();
  }
  size() {
    return this.docs.size;
  }
  toJSON() {
    return Array.from(this.docs.entries()).map(([id, doc]) => ({
      id,
      content: doc.content,
      embedding: doc.embedding
    }));
  }
  static fromJSON(data) {
    const store = new _SimpleVectorStore();
    for (const d of data) {
      store.docs.set(d.id, { content: d.content, embedding: d.embedding });
    }
    return store;
  }
};

// src/wiki.ts
import { mkdir, writeFile } from "fs/promises";
import { join as join2 } from "path";
function toMermaid(flow) {
  const lines = ["graph TD"];
  for (const node of flow.nodes) {
    const safeId = node.replace(/[^a-zA-Z0-9]/g, "_");
    lines.push(`  ${safeId}["${node}"]`);
  }
  for (const edge of flow.edges) {
    const fromId = edge.from.replace(/[^a-zA-Z0-9]/g, "_");
    const toId = edge.to.replace(/[^a-zA-Z0-9]/g, "_");
    const label = edge.label ? `|${edge.label}|` : "";
    lines.push(`  ${fromId} -->${label} ${toId}`);
  }
  return lines.join("\n");
}
async function toWiki(analysis, outDir) {
  await mkdir(outDir, { recursive: true });
  const indexLines = [
    "# Code Analysis",
    "",
    `- **Files:** ${analysis.files.length}`,
    `- **Functions:** ${analysis.files.reduce((s, f) => s + f.functions.length, 0)}`,
    `- **Classes:** ${analysis.files.reduce((s, f) => s + f.classes.length, 0)}`,
    `- **API Endpoints:** ${analysis.apis.length}`,
    `- **Flows:** ${analysis.flows.length}`,
    "",
    "## Files",
    ""
  ];
  const filesDir = join2(outDir, "files");
  await mkdir(filesDir, { recursive: true });
  for (const file of analysis.files) {
    const safeName = file.path.replace(/[/\\]/g, "_") + ".md";
    indexLines.push(`- [${file.path}](./files/${safeName})`);
    const fileLines = [
      `# ${file.path}`,
      "",
      `**Language:** ${file.language}`,
      ""
    ];
    if (file.functions.length > 0) {
      fileLines.push("## Functions", "");
      for (const fn of file.functions) {
        const params = fn.params.join(", ");
        fileLines.push(`- \`${fn.name}(${params})\` (lines ${fn.startLine}\u2013${fn.endLine})`);
      }
      fileLines.push("");
    }
    if (file.classes.length > 0) {
      fileLines.push("## Classes", "");
      for (const cls of file.classes) {
        fileLines.push(`- \`${cls.name}\` (line ${cls.startLine})`);
        if (cls.methods.length > 0) {
          fileLines.push(`  - Methods: ${cls.methods.join(", ")}`);
        }
      }
      fileLines.push("");
    }
    if (file.imports.length > 0) {
      fileLines.push("## Imports", "");
      for (const imp of file.imports) {
        fileLines.push(`- \`${imp}\``);
      }
      fileLines.push("");
    }
    await writeFile(join2(filesDir, safeName), fileLines.join("\n"), "utf-8");
  }
  if (analysis.apis.length > 0) {
    indexLines.push("## API Endpoints", "");
    for (const api of analysis.apis) {
      indexLines.push(`- \`${api.method} ${api.route}\``);
    }
    indexLines.push("");
  }
  if (analysis.flows.length > 0) {
    indexLines.push("## Data Flows", "");
    const flowsDir = join2(outDir, "flows");
    await mkdir(flowsDir, { recursive: true });
    for (const flow of analysis.flows) {
      const safeName = flow.name.replace(/[/\\]/g, "_") + ".md";
      indexLines.push(`- [${flow.name}](./flows/${safeName})`);
      const flowLines = [
        `# Flow: ${flow.name}`,
        "",
        "```mermaid",
        toMermaid(flow),
        "```",
        "",
        "### Nodes",
        ""
      ];
      for (const node of flow.nodes) {
        flowLines.push(`- \`${node}\``);
      }
      flowLines.push("", "### Edges", "");
      for (const edge of flow.edges) {
        const label = edge.label ? ` "${edge.label}"` : "";
        flowLines.push(`- \`${edge.from} \u2192 ${edge.to}${label}\``);
      }
      await writeFile(join2(flowsDir, safeName), flowLines.join("\n"), "utf-8");
    }
  }
  await writeFile(join2(outDir, "index.md"), indexLines.join("\n"), "utf-8");
}

// src/engine.ts
import { readFile as readFile2 } from "fs/promises";
var ContextEngine = class _ContextEngine {
  constructor(embedder, vectorStore) {
    this.embedder = embedder;
    this.vectorStore = vectorStore;
  }
  embedder;
  vectorStore;
  static async create(opts = {}) {
    return new _ContextEngine(
      opts.embedder ?? new SimpleEmbedder(),
      opts.vectorStore ?? new SimpleVectorStore()
    );
  }
  async build(projectPath) {
    return analyzeProject(projectPath);
  }
  async index(analysis) {
    for (const file of analysis.files) {
      let content;
      try {
        content = await readFile2(file.path, "utf-8");
      } catch {
        continue;
      }
      const embedding = await this.embedder.embed(content);
      await this.vectorStore.index([{ id: file.path, content, embedding }]);
    }
  }
  async query(q, k = 5) {
    const embedding = await this.embedder.embed(q);
    return this.vectorStore.query(embedding, k);
  }
  async toWiki(analysis, outDir) {
    return toWiki(analysis, outDir);
  }
  async toMermaid(flow) {
    return toMermaid(flow);
  }
};
export {
  ContextEngine,
  SimpleEmbedder,
  SimpleVectorStore,
  analyzeProject,
  toMermaid,
  toWiki
};
//# sourceMappingURL=index.js.map