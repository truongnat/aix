/**
 * Simple in-memory cache with optional disk persistence
 * Supports TTL-based expiration and size limits
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

interface CacheEntry<T> {
  value: T;
  expires: number;
}

export class Cache<T> {
  private store: Map<string, CacheEntry<T>> = new Map();
  private maxSize: number;
  private defaultTTL: number;
  private persistPath?: string;

  constructor(options: { maxSize?: number; defaultTTL?: number; persistPath?: string } = {}) {
    this.maxSize = options.maxSize ?? 1000;
    this.defaultTTL = options.defaultTTL ?? 5 * 60 * 1000; // 5 minutes
    this.persistPath = options.persistPath;
    
    if (this.persistPath) {
      this.loadFromDisk();
    }
  }

  set(key: string, value: T, ttl?: number): void {
    const expires = Date.now() + (ttl ?? this.defaultTTL);
    
    // Evict if at capacity (LRU)
    if (this.store.size >= this.maxSize && !this.store.has(key)) {
      const oldest = this.findOldest();
      if (oldest) this.store.delete(oldest);
    }
    
    this.store.set(key, { value, expires });
    
    if (this.persistPath) {
      this.saveToDisk();
    }
  }

  get(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expires) {
      this.store.delete(key);
      if (this.persistPath) this.saveToDisk();
      return null;
    }
    
    return entry.value;
  }

  has(key: string): boolean {
    const entry = this.store.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expires) {
      this.store.delete(key);
      if (this.persistPath) this.saveToDisk();
      return false;
    }
    return true;
  }

  delete(key: string): boolean {
    const deleted = this.store.delete(key);
    if (deleted && this.persistPath) {
      this.saveToDisk();
    }
    return deleted;
  }

  clear(): void {
    this.store.clear();
    if (this.persistPath) {
      this.saveToDisk();
    }
  }

  size(): number {
    // Clean expired entries first
    this.cleanExpired();
    return this.store.size;
  }

  private findOldest(): string | null {
    let oldest: string | null = null;
    let oldestExpires = Infinity;
    
    for (const [key, entry] of this.store.entries()) {
      if (entry.expires < oldestExpires) {
        oldestExpires = entry.expires;
        oldest = key;
      }
    }
    
    return oldest;
  }

  private cleanExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expires) {
        this.store.delete(key);
      }
    }
  }

  private saveToDisk(): void {
    if (!this.persistPath) return;
    
    try {
      const dir = join(this.persistPath, '..');
      mkdirSync(dir, { recursive: true });
      
      const data = Array.from(this.store.entries());
      writeFileSync(this.persistPath, JSON.stringify(data), 'utf8');
    } catch {
      // Silently fail on disk write errors
    }
  }

  private loadFromDisk(): void {
    if (!this.persistPath || !existsSync(this.persistPath)) return;
    
    try {
      const data = JSON.parse(readFileSync(this.persistPath, 'utf8')) as [string, CacheEntry<T>][];
      this.store = new Map(data);
    } catch {
      // Silently fail on disk read errors
    }
  }
}

// Singleton caches for common use cases
const graphCache = new Cache<{ nodes: any[]; edges: any[] }>({ 
  maxSize: 100, 
  defaultTTL: 10 * 60 * 1000, // 10 minutes
  persistPath: '.cache/graph.json'
});

const embeddingCache = new Cache<number[]>({ 
  maxSize: 10000, 
  defaultTTL: 60 * 60 * 1000, // 1 hour
  persistPath: '.cache/embeddings.json'
});

export { graphCache, embeddingCache };
