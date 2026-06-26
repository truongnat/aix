export interface AnalyzedFile {
  readonly path: string;
  readonly language: string;
  readonly functions: readonly FunctionDef[];
  readonly classes: readonly ClassDef[];
  readonly imports: readonly string[];
}

export interface FunctionDef {
  readonly name: string;
  readonly params: readonly string[];
  readonly returnType?: string;
  readonly startLine: number;
  readonly endLine: number;
}

export interface ClassDef {
  readonly name: string;
  readonly methods: readonly string[];
  readonly startLine: number;
}

export interface FlowGraph {
  readonly name: string;
  readonly nodes: readonly string[];
  readonly edges: readonly { from: string; to: string; label?: string }[];
}

export interface ApiContract {
  readonly route: string;
  readonly method: string;
  readonly params: readonly string[];
  readonly responseType?: string;
}

export interface CodeAnalysis {
  readonly files: readonly AnalyzedFile[];
  readonly flows: readonly FlowGraph[];
  readonly apis: readonly ApiContract[];
}

export interface RagHit {
  readonly file: string;
  readonly content: string;
  readonly score: number;
}
