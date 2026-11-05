import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { SkillRegistry } from '../dist/index.js';

async function fixture(t, entries) {
  const root = await mkdtemp(join(tmpdir(), 'aix-validation-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const [directory, metadata] of Object.entries(entries)) {
    const dir = join(root, 'skills', directory);
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, 'SKILL.md'), `---\n${metadata}\n---\nSkill instructions.\n`);
  }
  return root;
}
const valid = name => `name: ${name}\ndescription: A valid skill\nx-kind: process`;

test('invalid frontmatter remains a fatal diagnostic although the skill is skipped', async t => {
  const root = await fixture(t, { valid: valid('valid'), invalid: 'name: INVALID\nx-kind: process' });
  const registry = await SkillRegistry.load(root);
  assert.deepEqual(registry.all().map(skill => skill.id), ['valid']);
  const errors = registry.validateAll().filter(error => error.code !== 'WARN');
  assert.equal(errors.length, 1);
  assert.equal(errors[0].path, join(root, 'skills', 'invalid', 'SKILL.md'));
  assert.match(errors[0].message, /frontmatter/i);
  assert.deepEqual(registry.validateAll(), registry.validateAll(), 'diagnostics survive repeated validation');
});

test('malformed YAML is diagnosed without hiding valid skills', async t => {
  const root = await fixture(t, { valid: valid('valid'), broken: 'name: [unterminated' });
  const registry = await SkillRegistry.load(root);
  assert.equal(registry.get('valid')?.id, 'valid');
  const errors = registry.validateAll().filter(error => error.code !== 'WARN');
  assert.equal(errors.length, 1);
  assert.equal(errors[0].path, join(root, 'skills', 'broken', 'SKILL.md'));
});

test('duplicate skill names cannot silently overwrite the first skill', async t => {
  const root = await fixture(t, { 'a-first': valid('same'), 'b-second': valid('same') });
  const registry = await SkillRegistry.load(root);
  assert.equal(registry.all().length, 1);
  assert.equal(registry.get('same')?.dir, join(root, 'skills', 'a-first'));
  const errors = registry.validateAll().filter(error => error.code !== 'WARN');
  assert.equal(errors.length, 1);
  assert.match(errors[0].message, /duplicate/i);
  assert.match(errors[0].message, /same/);
  assert.equal(errors[0].path, join(root, 'skills', 'b-second', 'SKILL.md'));
});

for (const [label, entries, expected] of [
  ['invalid metadata', { invalid: 'name: INVALID\nx-kind: process' }, /frontmatter/i],
  ['duplicate metadata', { 'a-first': valid('same'), 'b-second': valid('same') }, /duplicate/i],
]) {
  test(`CLI validation exits nonzero for ${label}`, async t => {
    const root = await fixture(t, entries);
    const result = spawnSync(process.execPath, [fileURLToPath(new URL('../../cli/dist/index.js', import.meta.url)), 'skills', 'validate', '--content-root', root], { encoding: 'utf8', timeout: 10000 });
    assert.ifError(result.error);
    assert.equal(result.status, 1, result.stdout + result.stderr);
    assert.match(result.stderr, expected);
    assert.doesNotMatch(result.stdout, /skills valid/);
  });
}

test('CLI validation succeeds for valid metadata in the selected content root', async t => {
  const root = await fixture(t, { valid: valid('valid') });
  const result = spawnSync(process.execPath, [fileURLToPath(new URL('../../cli/dist/index.js', import.meta.url)), 'skills', 'validate', '--content-root', root], { encoding: 'utf8', timeout: 10000 });
  assert.ifError(result.error);
  assert.equal(result.status, 0, result.stdout + result.stderr);
  const registry = await SkillRegistry.load(root);
  assert.deepEqual(registry.all().map(skill => skill.id), ['valid']);
  assert.deepEqual(registry.validateAll(), []);
});
