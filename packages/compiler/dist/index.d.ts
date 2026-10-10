import { Provider } from '@x/core';
import { ProviderAdapter, CompileInput } from '@x/providers';

interface CompileOptions {
    readonly provider: Provider;
    readonly targetRoot: string;
    readonly dryRun: boolean;
    readonly force: boolean;
}
interface CompileResult {
    readonly written: readonly string[];
    readonly skipped: readonly string[];
    readonly conflicts: readonly string[];
}
declare class Compiler {
    #private;
    constructor(adapters: Record<Provider, ProviderAdapter>);
    compile(input: CompileInput, opts: CompileOptions): Promise<CompileResult>;
}

export { type CompileOptions, type CompileResult, Compiler };
