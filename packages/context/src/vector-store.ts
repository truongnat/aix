import type { RagHit } from './types.js';

export interface VectorStore {
  index(docs: { id: string; content: string; embedding: number[] }[]): Promise<void>;
  query(embedding: number[], k: number): Promise<RagHit[]>;
}

function cosineSimilarity(a: number[], b: number[]): number {
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

export class SimpleVectorStore implements VectorStore {
  private docs = new Map<string, { content: string; embedding: number[] }>();

  async index(docs: { id: string; content: string; embedding: number[] }[]): Promise<void> {
    for (const d of docs) {
      this.docs.set(d.id, { content: d.content, embedding: d.embedding });
    }
  }

  async query(embedding: number[], k: number): Promise<RagHit[]> {
    const scores: { id: string; content: string; score: number }[] = [];

    for (const [id, doc] of this.docs) {
      const score = cosineSimilarity(embedding, doc.embedding);
      scores.push({ id, content: doc.content, score });
    }

    scores.sort((a, b) => b.score - a.score);

    return scores.slice(0, k).map(s => ({
      file: s.id,
      content: s.content,
      score: s.score,
    }));
  }

  clear(): void {
    this.docs.clear();
  }

  size(): number {
    return this.docs.size;
  }

  toJSON(): { id: string; content: string; embedding: number[] }[] {
    return Array.from(this.docs.entries()).map(([id, doc]) => ({
      id,
      content: doc.content,
      embedding: doc.embedding,
    }));
  }

  static fromJSON(
    data: { id: string; content: string; embedding: number[] }[],
  ): SimpleVectorStore {
    const store = new SimpleVectorStore();
    for (const d of data) {
      store.docs.set(d.id, { content: d.content, embedding: d.embedding });
    }
    return store;
  }
}
