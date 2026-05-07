/**
 * Vector Store using efficient in-memory index with cosine similarity.
 * Provides optimized search without external dependencies.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

export interface VectorDoc {
  id: string;
  vector: number[];
  metadata?: Record<string, unknown>;
  norm?: number; // Precomputed norm for faster similarity search
}

export interface SearchResult {
  id: string;
  score: number;
  metadata?: Record<string, unknown>;
}

/**
 * Cosine similarity between two vectors.
 */
export function cosine(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length);
  let s = 0;
  for (let i = 0; i < n; i++) s += a[i] * b[i];
  return s;
}

export class VectorStore {
  private docs: VectorDoc[] = [];
  private indexReady = false;
  private dimension: number;

  constructor(dimension: number) {
    this.dimension = dimension;
  }

  /**
   * Add a vector to the store.
   */
  add(doc: VectorDoc): number {
    this.docs.push(doc);
    this.indexReady = false;
    return this.docs.length - 1;
  }

  /**
   * Add multiple vectors to the store.
   */
  addBatch(docs: VectorDoc[]): number[] {
    const startIdx = this.docs.length;
    this.docs.push(...docs);
    this.indexReady = false;
    return Array.from({ length: docs.length }, (_, i) => startIdx + i);
  }

  /**
   * Build index (precompute norms for faster search).
   */
  buildIndex(): void {
    // Precompute norms for all vectors
    for (const doc of this.docs) {
      const norm = Math.sqrt(doc.vector.reduce((s, x) => s + x * x, 0));
      doc.norm = norm;
    }
    this.indexReady = true;
  }

  /**
   * Search for nearest neighbors using cosine similarity.
   */
  search(vector: number[], k: number = 10): SearchResult[] {
    if (this.docs.length === 0) return [];
    
    if (!this.indexReady) {
      this.buildIndex();
    }

    // Compute query norm once
    const queryNorm = Math.sqrt(vector.reduce((s, x) => s + x * x, 0));
    
    // Calculate similarities
    const scored = this.docs.map((doc) => {
      const docNorm = doc.norm || Math.sqrt(doc.vector.reduce((s, x) => s + x * x, 0));
      const similarity = cosine(vector, doc.vector) / (queryNorm * docNorm);
      return {
        id: doc.id,
        score: similarity,
        metadata: doc.metadata,
      };
    });

    // Sort by score (descending) and return top k
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, k);
  }

  /**
   * Get the number of vectors in the store.
   */
  size(): number {
    return this.docs.length;
  }

  /**
   * Save the index to disk.
   */
  save(indexPath: string): void {
    const dir = dirname(indexPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    // Build index before saving
    if (!this.indexReady) {
      this.buildIndex();
    }

    writeFileSync(indexPath, JSON.stringify(this.docs, null, 2), 'utf8');
  }

  /**
   * Load the index from disk.
   */
  load(indexPath: string): void {
    if (!existsSync(indexPath)) {
      throw new Error(`Index file not found: ${indexPath}`);
    }

    this.docs = JSON.parse(readFileSync(indexPath, 'utf8')) as VectorDoc[];
    this.indexReady = false;
  }

  /**
   * Clear the store.
   */
  clear(): void {
    this.docs = [];
    this.indexReady = false;
  }
}

/**
 * Create a vector store for the knowledge base.
 */
export function createKbVectorStore(dimension: number = 384): VectorStore {
  return new VectorStore(dimension);
}

/**
 * Create a vector store for skill embeddings.
 */
export function createSkillVectorStore(dimension: number = 384): VectorStore {
  return new VectorStore(dimension);
}
