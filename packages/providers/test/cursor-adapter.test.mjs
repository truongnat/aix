import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CursorAdapter } from '../dist/index.js';

function skill(id) {
  return {
    id,
    dir: `/tmp/${id}`,
    frontmatter: {
      name: id,
      description: `${id} description`,
      'x-kind': 'workflow',
      'x-version': '1.0.0',
      'x-tags': [],
      'x-roles': [],
      'x-compatible': ['cursor'],
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

test('CursorAdapter emits one unique project rule file per skill', () => {
  const files = new CursorAdapter().emit({
    ...emptyInput,
    skills: [skill('planning'), skill('review')],
  });

  const skillFiles = files.filter(file => file.path.startsWith('.cursor/rules/aix-skill-'));

  assert.deepEqual(
    skillFiles.map(file => file.path).sort(),
    ['.cursor/rules/aix-skill-planning.mdc', '.cursor/rules/aix-skill-review.mdc'],
  );
  assert.equal(new Set(files.map(file => file.path)).size, files.length, 'emitted paths must be unique');
});
