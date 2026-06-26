export interface Embedder {
  embed(text: string): Promise<number[]>;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9_$]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 0 && t.length <= 50);
}

export class SimpleEmbedder implements Embedder {
  private vocab = new Map<string, number>();
  private frozen = false;

  embed(text: string): Promise<number[]> {
    const tokens = tokenize(text);
    const tf = new Map<string, number>();
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
      if (idx !== undefined) {
        vec[idx] = count;
      }
    }

    const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0));
    if (norm > 0) {
      for (let i = 0; i < vec.length; i++) {
        vec[i]! /= norm;
      }
    }

    return Promise.resolve(vec);
  }

  freeze(): void {
    this.frozen = true;
  }

  vocabSize(): number {
    return this.vocab.size;
  }
}
