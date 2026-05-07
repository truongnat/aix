/**
 * Embeddings module — real transformer model with GitNexus graph enrichment.
 *
 * Strategy:
 *   1. Try loading @xenova/transformers for semantic embeddings (384-dim MiniLM).
 *   2. If model unavailable, fall back to TF-IDF-style hash embeddings (fast, offline).
 *   3. GitNexus enrichment: prepend graph context (callers/callees/file relations)
 *      to text before embedding, giving the model structural awareness.
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { embeddingCache } from './cache.js';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface EmbeddingOptions {
  dims?: number;
  graphPath?: string;
  enrichWithGraph?: boolean;
}

interface GraphData {
  nodes: { id: string; type: string; name: string; file: string; line: number }[];
  edges: { from: string; to: string; type: string }[];
}

/**
 * Chunk text into overlapping segments.
 */
export function chunkText(text: string, size: number, overlap: number): string[] {
  const clean = text.replace(/\r\n/g, '\n');
  const out: string[] = [];
  let i = 0;
  while (i < clean.length) {
    const end = Math.min(clean.length, i + size);
    out.push(clean.slice(i, end).trim());
    if (end >= clean.length) break;
    i = Math.max(0, end - overlap);
  }
  return out;
}

// ─── Transformer model (lazy-loaded) ────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pipeline: any = null;
let modelReady = false;
let modelFailed = false;

const MODEL_NAME = 'Xenova/all-MiniLM-L6-v2';
const MODEL_DIMS = 384;

async function loadModel(): Promise<boolean> {
  if (modelReady) return true;
  if (modelFailed) return false;
  try {
    const { pipeline: createPipeline } = await import('@xenova/transformers');
    pipeline = await createPipeline('feature-extraction', MODEL_NAME, {
      quantized: true,
    });
    modelReady = true;
    return true;
  } catch {
    modelFailed = true;
    return false;
  }
}

async function transformerEmbed(text: string): Promise<number[]> {
  const output = await pipeline(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data as Float32Array).slice(0, MODEL_DIMS);
}

// ─── Hash fallback (fast, zero-dep) ─────────────────────────────────────────

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function hashToken(token: string): number {
  let h = 2166136261;
  for (let i = 0; i < token.length; i++) {
    h ^= token.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function hashEmbed(text: string, dims: number): number[] {
  const v = new Array<number>(dims).fill(0);
  const tokens = tokenize(text);
  if (tokens.length === 0) return v;
  for (const t of tokens) {
    const h = hashToken(t);
    const idx = h % dims;
    v[idx] += 1;
  }
  const norm = Math.sqrt(v.reduce((s, x) => s + x * x, 0));
  if (norm > 0) {
    for (let i = 0; i < v.length; i++) v[i] /= norm;
  }
  return v;
}

// ─── GitNexus graph enrichment ──────────────────────────────────────────────

let cachedGraph: GraphData | null = null;
let cachedGraphPath: string | null = null;

function loadGraphForEnrichment(graphPath: string): GraphData | null {
  if (cachedGraphPath === graphPath && cachedGraph) return cachedGraph;
  if (!existsSync(graphPath)) return null;
  try {
    cachedGraph = JSON.parse(readFileSync(graphPath, 'utf8')) as GraphData;
    cachedGraphPath = graphPath;
    return cachedGraph;
  } catch {
    return null;
  }
}

export function enrichWithGraphContext(text: string, graphPath: string): string {
  const graph = loadGraphForEnrichment(graphPath);
  if (!graph) return text;

  // Extract file path from text (e.g. "# file: src/lib/foo.ts" prefix)
  const fileMatch = text.match(/^#\s*file:\s*(.+)$/m);
  if (!fileMatch) return text;
  const filePath = fileMatch[1].trim();

  // Find symbols defined in this file
  const fileNodes = graph.nodes.filter(n => n.file === filePath);
  if (fileNodes.length === 0) return text;

  const symbolNames = fileNodes.map(n => n.name);
  const symbolIds = new Set(fileNodes.map(n => n.id));

  // Callers: who calls symbols in this file
  const callerIds = new Set<string>();
  for (const edge of graph.edges) {
    if (edge.type === 'calls' && symbolIds.has(edge.to)) {
      callerIds.add(edge.from);
    }
  }
  const callers = graph.nodes
    .filter(n => callerIds.has(n.id))
    .map(n => `${n.name}@${n.file}`)
    .slice(0, 10);

  // Callees: what symbols in this file call
  const calleeIds = new Set<string>();
  for (const edge of graph.edges) {
    if (edge.type === 'calls' && symbolIds.has(edge.from)) {
      calleeIds.add(edge.to);
    }
  }
  const callees = graph.nodes
    .filter(n => calleeIds.has(n.id))
    .map(n => `${n.name}@${n.file}`)
    .slice(0, 10);

  // Imports: what this file imports
  const imports = graph.edges
    .filter(e => e.type === 'imports' && e.from === filePath)
    .map(e => e.to)
    .slice(0, 10);

  // Build enrichment prefix
  const parts: string[] = [];
  if (symbolNames.length > 0) {
    parts.push(`[symbols: ${symbolNames.join(', ')}]`);
  }
  if (callers.length > 0) {
    parts.push(`[callers: ${callers.join(', ')}]`);
  }
  if (callees.length > 0) {
    parts.push(`[calls: ${callees.join(', ')}]`);
  }
  if (imports.length > 0) {
    parts.push(`[imports: ${imports.join(', ')}]`);
  }

  if (parts.length === 0) return text;
  return `${parts.join(' ')}\n${text}`;
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Initialize the transformer model. Call once before embedTextAsync for batch ops.
 * Returns true if real model is available, false if falling back to hash.
 */
export async function initEmbeddings(): Promise<boolean> {
  return loadModel();
}

/**
 * Check if transformer model is loaded.
 */
export function isModelLoaded(): boolean {
  return modelReady;
}

/**
 * Embed text using transformer model with optional GitNexus graph enrichment.
 * Falls back to hash embeddings if model unavailable.
 */
export async function embedTextAsync(
  text: string,
  options: EmbeddingOptions = {}
): Promise<number[]> {
  const { graphPath, enrichWithGraph } = options;
  
  // Create cache key based on text and options
  const cacheKey = JSON.stringify({ text, graphPath, enrichWithGraph });
  const cached = embeddingCache.get(cacheKey);
  if (cached) return cached;

  let enrichedText = text;
  if (enrichWithGraph && graphPath) {
    enrichedText = enrichWithGraphContext(text, graphPath);
  }

  let embedding: number[];
  if (modelReady && pipeline) {
    embedding = await transformerEmbed(enrichedText);
  } else {
    // Fallback to hash
    embedding = hashEmbed(enrichedText, options.dims ?? MODEL_DIMS);
  }

  // Cache the result
  embeddingCache.set(cacheKey, embedding);
  return embedding;
}

/**
 * Synchronous embed — hash-only. Used where async is impractical.
 * Kept for backward compatibility.
 */
export function embedText(text: string, dims = 384): number[] {
  return hashEmbed(text, dims);
}

/**
 * Batch embed — uses transformer when available, with progress callback.
 */
export async function embedBatch(
  texts: string[],
  options: EmbeddingOptions & { onProgress?: (done: number, total: number) => void } = {}
): Promise<number[]> {
  const { graphPath, enrichWithGraph, onProgress } = options;
  
  // Check cache for each text
  const results: number[][] = new Array(texts.length);
  const uncachedIndices: number[] = [];
  const uncachedTexts: string[] = [];
  
  for (let i = 0; i < texts.length; i++) {
    const cacheKey = JSON.stringify({ text: texts[i], graphPath, enrichWithGraph });
    const cached = embeddingCache.get(cacheKey);
    if (cached) {
      results[i] = cached;
    } else {
      uncachedIndices.push(i);
      uncachedTexts.push(texts[i]);
    }
  }
  
  // Embed uncached texts
  if (uncachedTexts.length > 0) {
    const enrichedTexts = enrichWithGraph && graphPath
      ? uncachedTexts.map(t => enrichWithGraphContext(t, graphPath))
      : uncachedTexts;
    
    const newEmbeddings = modelReady && pipeline
      ? await Promise.all(enrichedTexts.map(t => transformerEmbed(t)))
      : enrichedTexts.map(t => hashEmbed(t, options.dims ?? MODEL_DIMS));
    
    // Cache new embeddings and place in results
    for (let i = 0; i < uncachedIndices.length; i++) {
      const idx = uncachedIndices[i];
      const embedding = newEmbeddings[i];
      results[idx] = embedding;
      
      const cacheKey = JSON.stringify({ text: texts[idx], graphPath, enrichWithGraph });
      embeddingCache.set(cacheKey, embedding);
      
      if (onProgress) onProgress(i + 1, uncachedTexts.length);
    }
  } else {
    if (onProgress) onProgress(texts.length, texts.length);
  }
  
  return results.flat();
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

/**
 * Get the default graph path for a project.
 */
export function defaultGraphPath(baseDir: string): string {
  return join(baseDir, '.agents', 'devkit', 'project-graph', 'graph.json');
}

/**
 * Get embedding dimensions (depends on active model).
 */
export function getEmbeddingDims(): number {
  return modelReady ? MODEL_DIMS : MODEL_DIMS;
}
