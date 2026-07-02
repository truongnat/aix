import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CodexAdapter, GeminiAdapter } from '../dist/index.js';

function skill(id, description = `${id} description`) {
  return {
    id,
    dir: `/tmp/${id}`,
    frontmatter: {
      name: id,
      description,
      'x-kind': 'workflow',
      'x-version': '1.0.0',
      'x-tags': [],
      'x-roles': [],
      'x-compatible': ['codex', 'gemini'],
    },
    body: `${id} body`,
    bodyTokenEstimate: 10,
    references: [],
    scripts: [],
    assets: [],
  };
}

function catalogEntry(id, description) {
  return {
    name: id,
    description,
    kind: 'workflow',
    tags: [],
    version: '1.0.0',
    roles: [],
    compatible: ['codex', 'gemini'],
    dir: `/tmp/${id}`,
  };
}

function largeInput() {
  const longDescription = `long-description-${'x'.repeat(900)}`;
  const skills = [skill('planning', longDescription), skill('review', longDescription)];
  const catalog = Array.from({ length: 80 }, (_, index) =>
    catalogEntry(`skill-${index}`, `${longDescription}-${index}`),
  );

  return {
    skills,
    catalog,
    agents: [],
    rules: [{ name: 'spine', content: 'Follow the engineering spine.', priority: 10 }],
    mcpServers: [],
    longDescription,
  };
}

test('CodexAdapter emits skills and rules to correct folders', () => {
  const input = largeInput();
  const files = new CodexAdapter().emit(input);

  assert.ok(files.some(file => file.path === '.codex/skills/planning/SKILL.md'));
  assert.ok(files.some(file => file.path === '.codex/rules/aix.rules'));
});

test('GeminiAdapter emits skills and rules to correct folders', () => {
  const input = largeInput();
  const files = new GeminiAdapter().emit(input);

  assert.ok(files.some(file => file.path === '.agents/skills/planning/SKILL.md'));
  assert.ok(files.some(file => file.path === '.agents/AGENTS.md'));
});
