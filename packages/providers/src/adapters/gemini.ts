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

    // Skills emit to skills/<id>/SKILL.md — spec layout + Gemini auto-discovery
    for (const skill of input.skills) {
      files.push({
        path: `skills/${skill.id}/SKILL.md`,
        contents: renderSkillFile(skill),
      });
    }

    // Rules go into .agents/AGENTS.md
    if (input.rules.length > 0) {
      files.push({
        path: 'AGENTS.md',
        contents: renderRulesFile(input.rules),
      });
    }

    if (input.agents.length > 0) {
      for (const agent of input.agents) {
        files.push({
          path: `agents/${agent.name}.md`,
          contents: renderAgentFile(agent),
        });
      }
    }

    // gemini-extension.json: documented fields only — skills auto-discover from skills/
    files.push({
      path: 'gemini-extension.json',
      contents: JSON.stringify({
        name: 'aix',
        version: '0.2.0',
        description: 'AI Engineering Platform — skills, spine workflow, memory',
        contextFileName: 'AGENTS.md',
        mcpServers: Object.fromEntries(input.mcpServers.map(s => [s.name, { transport: s.transport }])),
      }, null, 2),
    });

    return files;
  }
}
