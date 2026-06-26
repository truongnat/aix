import type { Provider } from '@x/core';
import type { LoadedSkill, SkillCatalogEntry } from '@x/registry';

export interface McpServerDef {
  readonly name: string;
  readonly transport: 'stdio' | 'http';
  readonly command?: string;
  readonly args?: readonly string[];
  readonly url?: string;
  readonly env?: Readonly<Record<string, string>>;
}

export interface AgentDef {
  readonly name: string;
  readonly description: string;
  readonly systemPrompt: string;
}

export interface RuleDoc {
  readonly name: string;
  readonly content: string;
  readonly priority?: number;
}

export interface CompileInput {
  readonly skills: readonly LoadedSkill[];
  readonly catalog: readonly SkillCatalogEntry[];
  readonly agents: readonly AgentDef[];
  readonly rules: readonly RuleDoc[];
  readonly mcpServers: readonly McpServerDef[];
}

export interface EmittedFile {
  readonly path: string;
  readonly contents: string;
  readonly mode?: number;
}

export interface ProviderAdapter {
  readonly id: Provider;
  emit(input: CompileInput): readonly EmittedFile[];
}
