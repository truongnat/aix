import type { Provider } from '@x/core';
import type { ProviderAdapter, CompileInput, EmittedFile } from '../types.js';
import {
  renderAgentFile,
  renderRulesFile,
  renderSkillFile,
} from './compact-surface.js';

export class GeminiAdapter implements ProviderAdapter {
  readonly id: Provider = 'gemini';

  emit(input: CompileInput): readonly EmittedFile[] {
    const files: EmittedFile[] = [];

    // Output skills to .agents/skills/<skill.id>/SKILL.md for Antigravity auto-discovery
    for (const skill of input.skills) {
      files.push({
        path: `.agents/skills/${skill.id}/SKILL.md`,
        contents: renderSkillFile(skill),
      });
    }

    // Rules go into .agents/AGENTS.md
    if (input.rules.length > 0) {
      files.push({
        path: '.agents/AGENTS.md',
        contents: renderRulesFile(input.rules),
      });
    }

    if (input.agents.length > 0) {
      for (const agent of input.agents) {
        files.push({
          path: `.agents/subagents/${agent.name}.md`, // Optional subagent directory, depends on system but keeping it isolated
          contents: renderAgentFile(agent),
        });
      }
    }

    // Keep the gemini-extension.json for compatibility if needed by the CLI
    files.push({
      path: 'gemini-extension.json',
      contents: JSON.stringify({
        name: 'aix',
        version: '0.1.0',
        description: 'AI Engineering Platform',
        skills: input.skills.map(s => s.id),
        agents: input.agents.map(a => a.name),
        mcpServers: input.mcpServers.map(s => ({ name: s.name, transport: s.transport })),
      }, null, 2),
    });

    return files;
  }
}
