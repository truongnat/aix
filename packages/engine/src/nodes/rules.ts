import { resolveSkillsRoot } from '../session-store.js';
import { SkillRegistry } from '@x/registry';
import type { EngineState } from '../state.js';

export async function rulesNode(state: EngineState): Promise<EngineState> {
  let rules: string[] = [];
  try {
    const contentRoot = resolveSkillsRoot();
    const registry = await SkillRegistry.load(contentRoot);
    const coderSkills = registry.byRole('coder');
    const reviewerSkills = registry.byRole('reviewer');

    rules = [
      ...coderSkills.map(s => `${s.id}: ${s.frontmatter.description}`),
      ...reviewerSkills.map(s => `${s.id}: ${s.frontmatter.description}`),
    ];
  } catch {
    rules = ['default-coder-rule: Follow best practices', 'default-reviewer-rule: Check for correctness'];
  }

  return { ...state, rules };
}
