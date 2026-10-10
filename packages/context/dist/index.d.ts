interface AnalyzedFile {
    readonly path: string;
    readonly language: string;
    readonly functions: readonly FunctionDef[];
    readonly classes: readonly ClassDef[];
    readonly imports: readonly string[];
}
interface FunctionDef {
    readonly name: string;
    readonly params: readonly string[];
    readonly returnType?: string;
    readonly startLine: number;
    readonly endLine: number;
}
interface ClassDef {
    readonly name: string;
    readonly methods: readonly string[];
    readonly startLine: number;
}
interface FlowGraph {
    readonly name: string;
    readonly nodes: readonly string[];
    readonly edges: readonly {
        from: string;
        to: string;
        label?: string;
    }[];
}
interface ApiContract {
    readonly route: string;
    readonly method: string;
    readonly params: readonly string[];
    readonly responseType?: string;
}
interface CodeAnalysis {
    readonly files: readonly AnalyzedFile[];
    readonly flows: readonly FlowGraph[];
    readonly apis: readonly ApiContract[];
}
interface RagHit {
    readonly file: string;
    readonly content: string;
    readonly score: number;
}

declare function analyzeProject(projectPath: string, languages?: string[]): Promise<CodeAnalysis>;

interface Embedder {
    embed(text: string): Promise<number[]>;
}
declare class SimpleEmbedder implements Embedder {
    private vocab;
    private frozen;
    embed(text: string): Promise<number[]>;
    freeze(): void;
    vocabSize(): number;
}

interface VectorStore {
    index(docs: {
        id: string;
        content: string;
        embedding: number[];
    }[]): Promise<void>;
    query(embedding: number[], k: number): Promise<RagHit[]>;
}
declare class SimpleVectorStore implements VectorStore {
    private docs;
    index(docs: {
        id: string;
        content: string;
        embedding: number[];
    }[]): Promise<void>;
    query(embedding: number[], k: number): Promise<RagHit[]>;
    clear(): void;
    size(): number;
    toJSON(): {
        id: string;
        content: string;
        embedding: number[];
    }[];
    static fromJSON(data: {
        id: string;
        content: string;
        embedding: number[];
    }[]): SimpleVectorStore;
}

declare function toMermaid(flow: FlowGraph): string;
declare function toWiki(analysis: CodeAnalysis, outDir: string): Promise<void>;

declare class ContextEngine {
    private readonly embedder;
    private readonly vectorStore;
    private constructor();
    static create(opts?: {
        embedder?: Embedder;
        vectorStore?: VectorStore;
    }): Promise<ContextEngine>;
    build(projectPath: string): Promise<CodeAnalysis>;
    index(analysis: CodeAnalysis): Promise<void>;
    query(q: string, k?: number): Promise<readonly RagHit[]>;
    toWiki(analysis: CodeAnalysis, outDir: string): Promise<void>;
    toMermaid(flow: FlowGraph): Promise<string>;
}

export { type AnalyzedFile, type ApiContract, type ClassDef, type CodeAnalysis, ContextEngine, type Embedder, type FlowGraph, type FunctionDef, type RagHit, SimpleEmbedder, SimpleVectorStore, type VectorStore, analyzeProject, toMermaid, toWiki };
