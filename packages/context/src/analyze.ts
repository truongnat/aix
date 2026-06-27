// T4.1: replaces spec's flow.ts — folded into analyze.ts
import { readdir, readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import type {
  CodeAnalysis,
  AnalyzedFile,
  FunctionDef,
  ClassDef,
  FlowGraph,
  ApiContract,
} from './types.js';

const LANGUAGE_MAP: Record<string, string> = {
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.mjs': 'javascript',
  '.cjs': 'javascript',
  '.mts': 'typescript',
  '.cts': 'typescript',
  '.py': 'python',
  '.go': 'go',
  '.rs': 'rust',
  '.java': 'java',
  '.rb': 'ruby',
};

const IGNORE_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  '.turbo',
  'build',
  '.next',
  'coverage',
  '.aix',
  '.claude',
  '.cursor',
  'imports',
]);

function analyzeFile(filePath: string, content: string): AnalyzedFile {
  const ext = extname(filePath);
  const language = LANGUAGE_MAP[ext] ?? ext.slice(1);
  const lines = content.split('\n');

  return {
    path: filePath,
    language,
    functions: extractFunctions(content, lines),
    classes: extractClasses(content, lines),
    imports: extractImports(content),
  };
}

function extractFunctions(content: string, lines: string[]): FunctionDef[] {
  const functions: FunctionDef[] = [];
  const re = /(?:export\s+)?(?:async\s+)?function\s+(['"`])?(\w+)\1?\s*\(([^)]*)\)/g;

  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    const name = m[2]!;
    const params = m[3]!.split(',').map(p => p.trim()).filter(Boolean);
    const startLine = content.slice(0, m.index).split('\n').length;
    const endLine = findBlockEnd(lines, startLine - 1);
    functions.push({ name, params, startLine, endLine });
  }

  const arrowRe = /(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?(?:\(([^)]*)\)|(\w+))\s*=>/g;
  while ((m = arrowRe.exec(content)) !== null) {
    const name = m[1]!;
    const params = m[2]
      ? m[2].split(',').map(p => p.trim()).filter(Boolean)
      : m[3]
        ? [m[3]!]
        : [];
    const startLine = content.slice(0, m.index).split('\n').length;
    functions.push({ name, params, startLine, endLine: startLine });
  }

  return functions;
}

function findBlockEnd(lines: string[], startIdx: number): number {
  let depth = 0;
  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i]!;
    for (const ch of line) {
      if (ch === '{') depth++;
      if (ch === '}') depth--;
    }
    if (depth <= 0 && i > startIdx) return i + 1;
  }
  return lines.length;
}

function extractClasses(content: string, lines: string[]): ClassDef[] {
  const classes: ClassDef[] = [];
  const re = /(?:export\s+)?(?:abstract\s+)?class\s+(\w+)/g;

  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    const name = m[1]!;
    const startLine = content.slice(0, m.index).split('\n').length;

    const startIdx = Math.max(0, startLine - 1);
    const classEnd = findBlockEnd(lines, startIdx);
    const classBody = lines.slice(startIdx, classEnd).join('\n');

    const methods: string[] = [];
    const methodRe = /(?:async\s+)?(?:get\s+)?(?:set\s+)?(\w+)\s*\([^)]*\)\s*\{/g;
    let mm: RegExpExecArray | null;
    while ((mm = methodRe.exec(classBody)) !== null) {
      methods.push(mm[1]!);
    }

    classes.push({ name, methods, startLine });
  }

  return classes;
}

function extractImports(content: string): string[] {
  const imports: string[] = [];
  const re = /import\s+(?:\{[^}]*\}\s+from\s+)?['"]([^'"]+)['"]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    imports.push(m[1]!);
  }
  return imports;
}

function extractApiContracts(content: string): ApiContract[] {
  const apis: ApiContract[] = [];
  const re = /(?:app|router|route)\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    apis.push({
      method: m[1]!.toUpperCase(),
      route: m[2]!,
      params: [],
    });
  }
  return apis;
}

function buildFlowGraphs(
  files: AnalyzedFile[],
  fileContents: Map<string, string>,
): FlowGraph[] {
  const flows: FlowGraph[] = [];

  for (const file of files) {
    const content = fileContents.get(file.path);
    if (!content) continue;

    const fnNames = new Set(file.functions.map(f => f.name));

    for (const fn of file.functions) {
      const edges: { from: string; to: string; label?: string }[] = [];

      for (const otherName of fnNames) {
        if (otherName === fn.name) continue;
        const escaped = otherName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const callRe = new RegExp(`\\b${escaped}\\s*\\(`, 'g');
        if (callRe.test(content)) {
          edges.push({ from: fn.name, to: otherName });
        }
      }

      if (edges.length > 0) {
        const nodes = [fn.name, ...edges.map(e => e.to)];
        flows.push({ name: fn.name, nodes: [...new Set(nodes)], edges });
      }
    }
  }

  return flows;
}

async function scanDirectory(
  dirPath: string,
  languages?: string[],
): Promise<{ files: AnalyzedFile[]; apis: ApiContract[]; contents: Map<string, string> }> {
  const files: AnalyzedFile[] = [];
  const apis: ApiContract[] = [];
  const contents = new Map<string, string>();

  const entries = await readdir(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
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
      if (languages && !languages.includes(LANGUAGE_MAP[ext]!)) continue;

      try {
        const content = await readFile(fullPath, 'utf-8');
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

export async function analyzeProject(
  projectPath: string,
  languages?: string[],
): Promise<CodeAnalysis> {
  const { files, apis, contents } = await scanDirectory(projectPath, languages);
  const flows = buildFlowGraphs(files, contents);
  return { files, flows, apis };
}
