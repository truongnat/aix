import { readFile } from 'node:fs/promises';
import type { CodeAnalysis, FlowGraph, RagHit } from './types.js';
import type { Embedder } from './embed.js';
import type { VectorStore } from './vector-store.js';
import { SimpleEmbedder } from './embed.js';
import { SimpleVectorStore } from './vector-store.js';
import { analyzeProject } from './analyze.js';
import { toWiki as genWiki, toMermaid as genMermaid } from './wiki.js';

export class ContextEngine {
  private constructor(
    private readonly embedder: Embedder,
    private readonly vectorStore: VectorStore,
  ) {}

  static async create(
    opts: { embedder?: Embedder; vectorStore?: VectorStore } = {},
  ): Promise<ContextEngine> {
    return new ContextEngine(
      opts.embedder ?? new SimpleEmbedder(),
      opts.vectorStore ?? new SimpleVectorStore(),
    );
  }

  async build(projectPath: string): Promise<CodeAnalysis> {
    return analyzeProject(projectPath);
  }

  async index(analysis: CodeAnalysis): Promise<void> {
    for (const file of analysis.files) {
      let content: string;
      try {
        content = await readFile(file.path, 'utf-8');
      } catch {
        continue;
      }
      const embedding = await this.embedder.embed(content);
      await this.vectorStore.index([{ id: file.path, content, embedding }]);
    }
  }

  async query(q: string, k = 5): Promise<readonly RagHit[]> {
    const embedding = await this.embedder.embed(q);
    return this.vectorStore.query(embedding, k);
  }

  async toWiki(analysis: CodeAnalysis, outDir: string): Promise<void> {
    return genWiki(analysis, outDir);
  }

  async toMermaid(flow: FlowGraph): Promise<string> {
    return genMermaid(flow);
  }
}
