import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ClaudeAdapter } from '../dist/index.js';

function skill(id) {
  return {
    id,
    dir: `/tmp/${id}`,
    frontmatter: {
      name: id,
      description: `${id} description`,
      metadata: {
        kind: 'workflow',
        version: '1.0.0',
        compatible: 'claude',
      },
    },
    meta: {
      kind: 'workflow',
      version: '1.0.0',
      tags: [],
      roles: [],
      compatible: ['claude'],
    },
    body: `${id} body`,
    bodyTokenEstimate: 10,
    references: [],
    scripts: [],
    assets: [],
  };
}

const emptyInput = {
  skills: [],
  catalog: [],
  agents: [],
  rules: [],
  mcpServers: [],
};

test('ClaudeAdapter manifest points at the canonical skills directory', () => {
  const files = new ClaudeAdapter().emit({
    ...emptyInput,
    skills: [skill('planning'), skill('review')],
  });

  const manifestFile = files.find(file => file.path === '.claude-plugin/plugin.json');
  assert.ok(manifestFile, 'plugin manifest should be emitted');

  const manifest = JSON.parse(manifestFile.contents);
  assert.deepEqual(manifest.skills, ['./skills/']);
  assert.deepEqual(
    files
      .filter(file => file.path.endsWith('/SKILL.md'))
      .map(file => file.path)
      .sort(),
    ['skills/planning/SKILL.md', 'skills/review/SKILL.md'],
  );
});
