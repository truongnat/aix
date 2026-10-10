import { Provider } from '@x/core';
import { LoadedSkill, SkillCatalogEntry } from '@x/registry';

interface McpServerDef {
    readonly name: string;
    readonly transport: 'stdio' | 'http';
    readonly command?: string;
    readonly args?: readonly string[];
    readonly url?: string;
    readonly env?: Readonly<Record<string, string>>;
}
interface AgentDef {
    readonly name: string;
    readonly description: string;
    readonly systemPrompt: string;
}
interface RuleDoc {
    readonly name: string;
    readonly content: string;
    readonly priority?: number;
}
interface CompileInput {
    readonly skills: readonly LoadedSkill[];
    readonly catalog: readonly SkillCatalogEntry[];
    readonly agents: readonly AgentDef[];
    readonly rules: readonly RuleDoc[];
    readonly mcpServers: readonly McpServerDef[];
}
interface EmittedFile {
    readonly path: string;
    readonly contents: string;
    readonly mode?: number;
}
interface ProviderAdapter {
    readonly id: Provider;
    emit(input: CompileInput): readonly EmittedFile[];
}

declare class ClaudeAdapter implements ProviderAdapter {
    readonly id: Provider;
    emit(input: CompileInput): readonly EmittedFile[];
}

declare class CursorAdapter implements ProviderAdapter {
    readonly id: Provider;
    emit(input: CompileInput): readonly EmittedFile[];
}

declare class CodexAdapter implements ProviderAdapter {
    readonly id: Provider;
    emit(input: CompileInput): readonly EmittedFile[];
}

declare class GeminiAdapter implements ProviderAdapter {
    readonly id: Provider;
    emit(input: CompileInput): readonly EmittedFile[];
}

interface BrowserMcpConfig {
    readonly type: 'chrome-devtools' | 'claude-in-chrome';
    readonly host?: string;
    readonly port?: number;
}
declare function createBrowserMcpDef(config: BrowserMcpConfig): McpServerDef;

interface ModelCallOptions {
    readonly system: string;
    readonly user: string;
    readonly temperature?: number;
    readonly maxTokens?: number;
}
interface ModelCallResponse {
    readonly content: string;
    readonly tokens: number;
    readonly usd: number;
}
interface RuntimeProvider {
    readonly id: string;
    call(opts: ModelCallOptions): Promise<ModelCallResponse>;
}
declare class MockRuntimeProvider implements RuntimeProvider {
    readonly id = "mock";
    call(opts: ModelCallOptions): Promise<ModelCallResponse>;
}
declare class ApiRuntimeProvider implements RuntimeProvider {
    #private;
    readonly id: string;
    constructor();
    call(opts: ModelCallOptions): Promise<ModelCallResponse>;
}
declare function createProvider(): RuntimeProvider;

export { type AgentDef, ApiRuntimeProvider, type BrowserMcpConfig, ClaudeAdapter, CodexAdapter, type CompileInput, CursorAdapter, type EmittedFile, GeminiAdapter, type McpServerDef, MockRuntimeProvider, type ModelCallOptions, type ModelCallResponse, type ProviderAdapter, type RuleDoc, type RuntimeProvider, createBrowserMcpDef, createProvider };
