import type { Provider } from '@x/core';
import type { ProviderAdapter, CompileInput, EmittedFile } from '../types.js';
import {
  renderAgentFile,
  renderRulesFile,
  renderSkillFile,
} from './compact-surface.js';

export class CodexAdapter implements ProviderAdapter {
  readonly id: Provider = 'codex';

  emit(input: CompileInput): readonly EmittedFile[] {
    const files: EmittedFile[] = [];

    // Skills emit to skills/<id>/SKILL.md — Agent Plugins 1.0 fixed location
    for (const skill of input.skills) {
      files.push({
        path: `skills/${skill.id}/SKILL.md`,
        contents: renderSkillFile(skill),
      });
    }

    // Rules go into .codex/rules/aix.rules or default.rules
    if (input.rules.length > 0) {
      files.push({
        path: 'AGENTS.md',
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
