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

    // Output skills to .codex/skills/<skill.id>/SKILL.md for standard Codex plugin format
    for (const skill of input.skills) {
      files.push({
        path: `.codex/skills/${skill.id}/SKILL.md`,
        contents: renderSkillFile(skill),
      });
    }

    // Rules go into .codex/rules/aix.rules or default.rules
    if (input.rules.length > 0) {
      files.push({
        path: '.codex/rules/aix.rules',
        contents: renderRulesFile(input.rules),
      });
    }

    if (input.agents.length > 0) {
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
