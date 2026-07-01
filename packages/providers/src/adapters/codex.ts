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

export class CodexAdapter implements ProviderAdapter {
  readonly id: Provider = 'codex';

  emit(input: CompileInput): readonly EmittedFile[] {
    const files: EmittedFile[] = [];

    files.push({
      path: 'AGENTS.md',
      contents: `${HEADER}# aix\n\nThis repository has aix provider material for Codex.\n\n## Skills\n\nDo not expect the full skill catalog in this file. Search the on-disk index, then open the matching skill before acting:\n\n- Skill index: \`.codex/skills/index.md\`\n- Skill details: \`.codex/skills/<skill-name>.md\`\n\nUse \`rg \"<topic>\" .codex/skills/index.md .codex/skills\` to find relevant skills.\n\n## Rules\n\nProject rules live in \`.codex/rules.md\`.\n\n## Agents\n\nSpecialized agent prompts live in \`.codex/agents/\`.\n`,
    });

    files.push({
      path: '.codex/skills/index.md',
      contents: renderSkillIndex(input),
    });

    for (const skill of input.skills) {
      files.push({
        path: `.codex/skills/${skill.id}.md`,
        contents: renderSkillFile(skill),
      });
    }

    if (input.rules.length > 0) {
      files.push({
        path: '.codex/rules.md',
        contents: renderRulesFile(input.rules),
      });
    }

    if (input.agents.length > 0) {
      files.push({
        path: '.codex/agents/index.md',
        contents: renderAgentIndex(input.agents),
      });

      for (const agent of input.agents) {
        files.push({
          path: `.codex/agents/${agent.name}.md`,
          contents: renderAgentFile(agent),
        });
      }
    }

    return files;
  }
}
