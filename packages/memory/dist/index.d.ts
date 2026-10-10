import { PolicyEngine } from '@x/policy';

interface MemoryRecord {
    readonly id: string;
    readonly kind: 'solution' | 'decision' | 'prompt-template' | 'evidence';
    readonly title: string;
    readonly body: string;
    readonly tags: readonly string[];
    readonly version: string;
    readonly createdAt: string;
}
interface MemoryStore {
    push(rec: MemoryRecord): Promise<void>;
    search(query: string, opts?: {
        tags?: readonly string[];
        k?: number;
    }): Promise<readonly MemoryRecord[]>;
    get(id: string): Promise<MemoryRecord | undefined>;
    list(opts?: {
        kind?: MemoryRecord['kind'];
    }): Promise<readonly MemoryRecord[]>;
}

declare class MarkdownStore implements MemoryStore {
    #private;
    constructor(baseDir?: string);
    push(rec: MemoryRecord): Promise<void>;
    search(query: string, opts?: {
        tags?: readonly string[];
        k?: number;
    }): Promise<readonly MemoryRecord[]>;
    get(id: string): Promise<MemoryRecord | undefined>;
    list(opts?: {
        kind?: MemoryRecord['kind'];
    }): Promise<readonly MemoryRecord[]>;
}

declare class RedactedMemoryStore implements MemoryStore {
    #private;
    constructor(inner: MemoryStore, policy: PolicyEngine);
    push(rec: MemoryRecord): Promise<void>;
    search(query: string, opts?: {
        tags?: readonly string[];
        k?: number;
    }): Promise<readonly MemoryRecord[]>;
    get(id: string): Promise<MemoryRecord | undefined>;
    list(opts?: {
        kind?: MemoryRecord['kind'];
    }): Promise<readonly MemoryRecord[]>;
}

export { MarkdownStore, type MemoryRecord, type MemoryStore, RedactedMemoryStore };
