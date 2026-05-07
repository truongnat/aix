import { describe, it, expect } from 'vitest';
import { tokenize, embedText, cosine, embedTextAsync, initEmbeddings, isModelLoaded } from './embeddings.js';

describe('tokenize', () => {
  it('lowercases and splits on whitespace', () => {
    expect(tokenize('Hello World')).toEqual(['hello', 'world']);
  });

  it('strips non-alphanumeric', () => {
    expect(tokenize('foo_bar.baz')).toEqual(['foo', 'bar', 'baz']);
  });

  it('handles empty string', () => {
    expect(tokenize('')).toEqual([]);
  });

  it('handles unicode', () => {
    const tokens = tokenize('café résumé');
    expect(tokens).toEqual(['café', 'résumé']);
  });
});

describe('embedText (hash fallback)', () => {
  it('returns vector of correct dimensions', () => {
    const v = embedText('hello world', 384);
    expect(v).toHaveLength(384);
  });

  it('returns normalized vector (unit length)', () => {
    const v = embedText('test string with multiple tokens');
    const norm = Math.sqrt(v.reduce((s, x) => s + x * x, 0));
    expect(norm).toBeCloseTo(1.0, 4);
  });

  it('returns zero vector for empty input', () => {
    const v = embedText('', 384);
    expect(v.every(x => x === 0)).toBe(true);
  });

  it('similar texts produce higher cosine than unrelated texts', () => {
    const v1 = embedText('javascript react frontend');
    const v2 = embedText('javascript vue frontend');
    const v3 = embedText('postgresql database schema');
    const sim12 = cosine(v1, v2);
    const sim13 = cosine(v1, v3);
    expect(sim12).toBeGreaterThan(sim13);
  });
});

describe('cosine', () => {
  it('identical vectors have cosine 1', () => {
    const v = [0.5, 0.5, 0.5, 0.5];
    expect(cosine(v, v)).toBeCloseTo(1.0, 4);
  });

  it('orthogonal vectors have cosine 0', () => {
    const a = [1, 0, 0, 0];
    const b = [0, 1, 0, 0];
    expect(cosine(a, b)).toBeCloseTo(0, 4);
  });

  it('handles different lengths gracefully', () => {
    const a = [1, 0];
    const b = [1, 0, 0, 0];
    expect(cosine(a, b)).toBeCloseTo(1.0, 4);
  });
});

describe('embedTextAsync', () => {
  it('falls back to hash when model not loaded', async () => {
    const v = await embedTextAsync('hello world');
    expect(v).toHaveLength(384);
    const norm = Math.sqrt(v.reduce((s, x) => s + x * x, 0));
    expect(norm).toBeCloseTo(1.0, 4);
  });
});

describe('initEmbeddings', () => {
  it('returns boolean', async () => {
    const result = await initEmbeddings();
    expect(typeof result).toBe('boolean');
  });

  it('isModelLoaded reflects init state', async () => {
    await initEmbeddings();
    expect(typeof isModelLoaded()).toBe('boolean');
  });
});
