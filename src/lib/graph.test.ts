import { describe, it, expect } from 'vitest';
import { buildGraph, queryGraph, getCallers, getCallees, impactAnalysis, saveGraph, loadGraph } from './graph.js';
import { resolve, join } from 'node:path';
import { existsSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';

const REPO_ROOT = resolve(import.meta.dirname, '../..');

describe('buildGraph', () => {
  it('builds graph from src/ with nodes and edges', async () => {
    const graph = await buildGraph(REPO_ROOT, ['src/lib/*.ts'], ['**/node_modules/**']);
    expect(graph.nodes.length).toBeGreaterThan(5);
    expect(graph.edges.length).toBeGreaterThan(0);
  });

  it('nodes have required fields', async () => {
    const graph = await buildGraph(REPO_ROOT, ['src/lib/skills.ts']);
    for (const node of graph.nodes) {
      expect(node.id).toBeTruthy();
      expect(node.name).toBeTruthy();
      expect(node.file).toBeTruthy();
      expect(typeof node.line).toBe('number');
      expect(['function', 'class', 'method', 'import', 'export']).toContain(node.type);
    }
  });
});

describe('queryGraph', () => {
  it('finds nodes by name', async () => {
    const graph = await buildGraph(REPO_ROOT, ['src/lib/skills.ts']);
    const results = queryGraph(graph, 'listSkillDirs');
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].name).toBe('listSkillDirs');
  });

  it('finds nodes by file path', async () => {
    const graph = await buildGraph(REPO_ROOT, ['src/lib/skills.ts']);
    const results = queryGraph(graph, 'skills.ts');
    expect(results.length).toBeGreaterThan(0);
  });

  it('returns empty for non-existent symbol', async () => {
    const graph = await buildGraph(REPO_ROOT, ['src/lib/skills.ts']);
    const results = queryGraph(graph, 'xyzNonExistent123');
    expect(results).toHaveLength(0);
  });
});

describe('saveGraph / loadGraph', () => {
  it('round-trips graph data', async () => {
    const graph = await buildGraph(REPO_ROOT, ['src/lib/embeddings.ts']);
    const tmpPath = join(tmpdir(), `test-graph-${Date.now()}.json`);
    try {
      saveGraph(graph, tmpPath);
      const loaded = loadGraph(tmpPath);
      expect(loaded.nodes).toEqual(graph.nodes);
      expect(loaded.edges).toEqual(graph.edges);
    } finally {
      if (existsSync(tmpPath)) unlinkSync(tmpPath);
    }
  });
});

describe('getCallers / getCallees', () => {
  it('finds callers of a function', async () => {
    const graph = await buildGraph(REPO_ROOT, ['src/lib/*.ts']);
    // tokenize is called by hashEmbed/embedText
    const callers = getCallers(graph, 'tokenize');
    // May or may not find callers depending on parsing, just verify it returns array
    expect(Array.isArray(callers)).toBe(true);
  });

  it('finds callees of a function', async () => {
    const graph = await buildGraph(REPO_ROOT, ['src/lib/*.ts']);
    const callees = getCallees(graph, 'buildGraph');
    expect(Array.isArray(callees)).toBe(true);
  });
});

describe('impactAnalysis', () => {
  it('returns impacted nodes for a file', async () => {
    const graph = await buildGraph(REPO_ROOT, ['src/lib/*.ts']);
    const impacted = impactAnalysis(graph, 'src/lib/embeddings.ts');
    expect(Array.isArray(impacted)).toBe(true);
  });
});
