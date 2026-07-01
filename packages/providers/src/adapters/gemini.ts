import type { Provider } from '@x/core';
import type { ProviderAdapter, CompileInput, EmittedFile } from '../types.js';
import {
  HEADER,
  renderAgentFile,
  renderAgentIndex,
  renderRulesFile,
  renderSkillFile,
  renderSkillIndex,
} from './compact-surface.js';

export class GeminiAdapter implements ProviderAdapter {
  readonly id: Provider = 'gemini';

  emit(input: CompileInput): readonly EmittedFile[] {
    const files: EmittedFile[] = [];

    files.push({
      path: 'GEMINI.md',
      contents: `${HEADER}# aix\n\nThis repository has aix provider material for Gemini CLI.\n\n## Skills\n\nDo not expect the full skill catalog in this file. Search the on-disk index, then open the matching skill before acting:\n\n- Skill index: \`skills/index.md\`\n- Skill details: \`skills/<skill-name>.md\`\n\nUse \`rg \"<topic>\" skills/index.md skills\` to find relevant skills.\n\n## Rules\n\nProject rules live in \`.gemini/aix-rules.md\`.\n\n## Agents\n\nSpecialized agent prompts live in \`agents/\`.\n`,
    });

    files.push({
      path: '.gemini/settings.json',
      contents: JSON.stringify({
        contextFileName: 'GEMINI.md',
      }, null, 2),
    });

    files.push({
      path: 'skills/index.md',
      contents: renderSkillIndex(input),
    });

    for (const skill of input.skills) {
      files.push({
        path: `skills/${skill.id}.md`,
        contents: renderSkillFile(skill),
      });
    }

    if (input.rules.length > 0) {
      files.push({
        path: '.gemini/aix-rules.md',
        contents: renderRulesFile(input.rules),
      });
    }

    if (input.agents.length > 0) {
      files.push({
        path: 'agents/index.md',
        contents: renderAgentIndex(input.agents),
      });

      for (const agent of input.agents) {
        files.push({
          path: `agents/${agent.name}.md`,
          contents: renderAgentFile(agent),
        });
      }
    }

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
