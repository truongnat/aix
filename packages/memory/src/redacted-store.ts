import type { PolicyEngine } from '@x/policy';
import type { MemoryRecord, MemoryStore } from './types.js';

export class RedactedMemoryStore implements MemoryStore {
  readonly #inner: MemoryStore;
  readonly #policy: PolicyEngine;

  constructor(inner: MemoryStore, policy: PolicyEngine) {
    this.#inner = inner;
    this.#policy = policy;
  }

  async push(rec: MemoryRecord): Promise<void> {
    const clean = this.#redact(rec);
    await this.#inner.push(clean);
  }

  async search(query: string, opts?: { tags?: readonly string[]; k?: number }): Promise<readonly MemoryRecord[]> {
    const results = await this.#inner.search(query, opts);
    return results.map(r => this.#redact(r));
  }

  async get(id: string): Promise<MemoryRecord | undefined> {
    const rec = await this.#inner.get(id);
    return rec ? this.#redact(rec) : undefined;
  }

  async list(opts?: { kind?: MemoryRecord['kind'] }): Promise<readonly MemoryRecord[]> {
    const results = await this.#inner.list(opts);
    return results.map(r => this.#redact(r));
  }

  #redact(rec: MemoryRecord): MemoryRecord {
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
      body: bodyResult.clean,
    };
  }
}
