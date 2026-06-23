import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  copyBuiltDist,
  copyCoreSkillSources,
  copyCoreToolSources,
  copyProviderSkillSources,
} from '../src/lib/install-skill-surfaces.ts';
import { resolveInstallRoots } from '../src/lib/install-targets.ts';
import { installCore } from '../src/local/index.ts';

test('resolveInstallRoots maps local scope to cwd surfaces', () => {
  const roots = resolveInstallRoots('local', '/repo/app', '/Users/example');

  assert.equal(roots.coreRoot, path.join('/repo/app', '.ai-harness'));
  assert.equal(roots.providerRoots.claude, path.join('/repo/app', '.claude'));
  assert.equal(roots.providerRoots.codex, path.join('/repo/app', '.codex'));
});

test('resolveInstallRoots maps global scope to home surfaces', () => {
  const roots = resolveInstallRoots('global', '/repo/app', '/Users/example');

  assert.equal(roots.coreRoot, path.join('/Users/example', '.ai-harness'));
  assert.equal(roots.providerRoots.claude, path.join('/Users/example', '.claude'));
  assert.equal(roots.providerRoots.codex, path.join('/Users/example', '.codex'));
});

test('copyCoreSkillSources mirrors source skills into core skills surface', async () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'aih-v2-core-'));
  const sourceRoot = path.join(tempRoot, 'source');
  const skillDir = path.join(sourceRoot, 'brainstorming');
  const coreRoot = path.join(tempRoot, '.ai-harness');

  fs.mkdirSync(path.join(skillDir, 'references'), { recursive: true });
  fs.writeFileSync(
    path.join(skillDir, 'SKILL.md'),
    'Read `tools/preview/references/design-guide.md`.\n'
  );
  fs.writeFileSync(path.join(skillDir, 'references', 'notes.md'), 'notes\n');

  await copyCoreSkillSources(sourceRoot, coreRoot);

  assert.equal(
    fs.readFileSync(path.join(coreRoot, 'skills', 'brainstorming', 'SKILL.md'), 'utf8'),
    'Read `.ai-harness/tools/preview/references/design-guide.md`.\n'
  );
  assert.equal(
    fs.readFileSync(
      path.join(coreRoot, 'skills', 'brainstorming', 'references', 'notes.md'),
      'utf8'
    ),
    'notes\n'
  );
});

test('copyCoreToolSources mirrors source tools into core tools surface', async () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'aih-v2-tools-'));
  const sourceRoot = path.join(tempRoot, 'source-tools');
  const toolDir = path.join(sourceRoot, 'preview');
  const coreRoot = path.join(tempRoot, '.ai-harness');

  fs.mkdirSync(path.join(toolDir, 'references'), { recursive: true });
  fs.writeFileSync(path.join(toolDir, 'index.ts'), 'export const tool = true;\n');
  fs.writeFileSync(path.join(toolDir, 'references', 'guide.md'), 'guide\n');

  await copyCoreToolSources(sourceRoot, coreRoot);

  assert.equal(
    fs.readFileSync(path.join(coreRoot, 'tools', 'preview', 'index.ts'), 'utf8'),
    'export const tool = true;\n'
  );
  assert.equal(
    fs.readFileSync(path.join(coreRoot, 'tools', 'preview', 'references', 'guide.md'), 'utf8'),
    'guide\n'
  );
});

test('copyBuiltDist mirrors build artifacts into core dist surface', async () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'aih-v2-dist-'));
  const sourceRoot = path.join(tempRoot, 'source-dist');
  const coreRoot = path.join(tempRoot, '.ai-harness');

  fs.mkdirSync(path.join(sourceRoot, 'lib'), { recursive: true });
  fs.writeFileSync(path.join(sourceRoot, 'lib', 'install.js'), 'module.exports = {};\n');

  await copyBuiltDist(sourceRoot, coreRoot);

  assert.equal(
    fs.readFileSync(path.join(coreRoot, 'dist', 'lib', 'install.js'), 'utf8'),
    'module.exports = {};\n'
  );
});

test('installCore creates the core root and writes .harness.json', async () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'aih-v2-install-core-'));
  const coreRoot = path.join(tempRoot, '.ai-harness');

  await installCore(coreRoot);

  const writtenConfig = JSON.parse(
    fs.readFileSync(path.join(coreRoot, '.harness.json'), 'utf8'),
  ) as { version: string; core: string[] };

  assert.equal(writtenConfig.version, '0.0.1');
  assert.ok(writtenConfig.core.includes('skills'));
});

for (const provider of ['claude', 'codex'] as const) {
  test(`copyProviderSkillSources mirrors source skills into ${provider} runtime surface`, async () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), `aih-v2-${provider}-`));
    const sourceRoot = path.join(tempRoot, 'source');
    const skillDir = path.join(sourceRoot, 'plan');
    const providerRoot = path.join(tempRoot, `.${provider}`);
    const coreRoot = path.join(tempRoot, '.ai-harness');

    fs.mkdirSync(path.join(skillDir, 'assets'), { recursive: true });
    fs.writeFileSync(path.join(skillDir, 'SKILL.md'), '# plan\n');
    fs.writeFileSync(path.join(skillDir, 'assets', 'template.md'), 'template\n');

    await copyProviderSkillSources(sourceRoot, provider, providerRoot, coreRoot);

    assert.equal(
      fs.readFileSync(path.join(providerRoot, 'skills', 'plan', 'SKILL.md'), 'utf8'),
      '# plan\n'
    );
    assert.equal(
      fs.readFileSync(path.join(providerRoot, 'skills', 'plan', 'assets', 'template.md'), 'utf8'),
      'template\n'
    );
  });
}

test('copyProviderSkillSources rewrites tool references to .ai-harness paths', async () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'aih-v2-provider-rewrite-'));
  const sourceRoot = path.join(tempRoot, 'source');
  const skillDir = path.join(sourceRoot, 'visualize-question');
  const providerRoot = path.join(tempRoot, '.claude');
  const coreRoot = path.join(tempRoot, '.ai-harness');

  fs.mkdirSync(path.join(skillDir, 'scripts'), { recursive: true });
  fs.writeFileSync(
    path.join(skillDir, 'SKILL.md'),
    'Read `tools/preview/references/design-guide.md` then call `tools/preview`.\n',
  );
  fs.writeFileSync(
    path.join(skillDir, 'scripts', 'example.ts'),
    "import { askVisualQuestion } from '../../../tools/preview/index';\n",
  );

  await copyProviderSkillSources(sourceRoot, 'claude', providerRoot, coreRoot);

  assert.equal(
    fs.readFileSync(path.join(providerRoot, 'skills', 'visualize-question', 'SKILL.md'), 'utf8'),
    'Read `.ai-harness/tools/preview/references/design-guide.md` then call `.ai-harness/tools/preview`.\n'
  );
  assert.equal(
    fs.readFileSync(
      path.join(providerRoot, 'skills', 'visualize-question', 'scripts', 'example.ts'),
      'utf8'
    ),
    "import { askVisualQuestion } from '../../../../.ai-harness/tools/preview/index';\n"
  );
});
