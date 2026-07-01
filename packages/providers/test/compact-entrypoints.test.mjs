import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CodexAdapter, GeminiAdapter } from '../dist/index.js';

const CODEX_DEFAULT_PROJECT_DOC_MAX_BYTES = 32 * 1024;

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

test('CodexAdapter keeps AGENTS.md compact and moves skills to retrievable files', () => {
  const input = largeInput();
  const files = new CodexAdapter().emit(input);
  const agentsFile = files.find(file => file.path === 'AGENTS.md');

  assert.ok(agentsFile, 'AGENTS.md should be emitted');
  assert.ok(
    Buffer.byteLength(agentsFile.contents, 'utf8') < CODEX_DEFAULT_PROJECT_DOC_MAX_BYTES,
    'AGENTS.md should stay under the Codex default project_doc_max_bytes',
  );
  assert.equal(agentsFile.contents.includes(input.longDescription), false);
  assert.ok(files.some(file => file.path === '.codex/skills/index.md'));
  assert.ok(files.some(file => file.path === '.codex/skills/planning.md'));
});

test('GeminiAdapter keeps GEMINI.md compact and moves skills to retrievable files', () => {
  const input = largeInput();
  const files = new GeminiAdapter().emit(input);
  const geminiFile = files.find(file => file.path === 'GEMINI.md');

  assert.ok(geminiFile, 'GEMINI.md should be emitted');
  assert.ok(Buffer.byteLength(geminiFile.contents, 'utf8') < 8 * 1024);
  assert.equal(geminiFile.contents.includes(input.longDescription), false);
  assert.ok(files.some(file => file.path === 'skills/index.md'));
  assert.ok(files.some(file => file.path === 'skills/planning.md'));
  assert.ok(files.some(file => file.path === '.gemini/settings.json'));
});
