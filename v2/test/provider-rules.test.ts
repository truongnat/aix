import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { getCommonRulesConfig } from '../src/rules/common-rules.ts';
import {
  copyCoreRuleSources,
  installProviderRules,
} from '../src/lib/install-rule-surfaces.ts';
import {
  renderClaudeAdapter,
  renderClaudeSettings,
} from '../src/rules/render-claude-rules.ts';
import { renderCodexAdapter, renderCodexRulesFile } from '../src/rules/render-codex-rules.ts';

test('getCommonRulesConfig exposes shared command and read policies', () => {
  const config = getCommonRulesConfig();

  assert.ok(config.coreRuleFiles.includes('blocking.md'));
  assert.ok(config.coreRuleFiles.includes('sensitive-data.md'));
  assert.ok(config.commandPrefixPolicies.some((policy) => policy.pattern.join(' ') === 'gh pr view'));
  assert.ok(config.commandPrefixPolicies.some((policy) => policy.pattern.join(' ') === 'printenv'));
  assert.ok(config.commandPrefixPolicies.some((policy) => policy.pattern.join(' ') === 'env'));
  assert.ok(config.commandPrefixPolicies.some((policy) => policy.pattern.join(' ') === 'rm .env'));
  assert.ok(config.commandPrefixPolicies.some((policy) => policy.pattern.join(' ') === 'rm .env.local'));
  assert.ok(config.commandPrefixPolicies.some((policy) => policy.pattern.join(' ') === 'rm .envrc'));
  assert.ok(config.commandPrefixPolicies.some((policy) => policy.pattern.join(' ') === 'rm -rf secrets'));
  assert.ok(config.claudePermissions.deny.includes('Read(./.env)'));
  assert.ok(config.claudePermissions.deny.includes('Read(./.env.local)'));
  assert.ok(config.claudePermissions.deny.includes('Read(./.envrc)'));
  assert.ok(config.claudePermissions.deny.includes('Read(./**/secrets/**)'));
});

test('renderClaudeAdapter expands core rule references into ai-harness paths', () => {
  const template = '# Claude\n<!-- @core -->\n';
  const rendered = renderClaudeAdapter(template, ['blocking.md', 'phase-guards.md']);

  assert.equal(
    rendered,
    '# Claude\nRead and follow these shared core rules:\n\n- `.ai-harness/rules/core/blocking.md`\n- `.ai-harness/rules/core/phase-guards.md`\n\n'
  );
});

test('renderClaudeSettings merges runtime fragment with generated permissions', () => {
  const rendered = renderClaudeSettings(
    { extraKnownMarketplaces: { existing: { source: { source: 'github', repo: 'x/y' } } } },
    getCommonRulesConfig(),
  );

  assert.ok(rendered.permissions);
  assert.ok(rendered.permissions.allow.includes('Bash(rg *)'));
  assert.ok(rendered.permissions.deny.includes('Read(./.env)'));
  assert.ok(rendered.permissions.deny.includes('Read(./.env.local)'));
  assert.ok(rendered.permissions.deny.includes('Read(./.envrc)'));
  assert.ok(rendered.extraKnownMarketplaces['ai-engineering-harness']);
  assert.ok(rendered.extraKnownMarketplaces.existing);
});

test('renderCodexAdapter expands core rule references into ai-harness paths', () => {
  const template = '# Codex\n<!-- @core -->\n';
  const rendered = renderCodexAdapter(template, ['tool-routing.md']);

  assert.equal(
    rendered,
    '# Codex\nRead and follow these shared core rules:\n\n- `.ai-harness/rules/core/tool-routing.md`\n\n'
  );
});

test('renderCodexRulesFile emits prefix_rule entries from common policy config', () => {
  const rendered = renderCodexRulesFile(getCommonRulesConfig());

  assert.match(rendered, /prefix_rule\(/);
  assert.match(rendered, /pattern = \["gh", "pr", "view"\]/);
  assert.match(rendered, /decision = "prompt"/);
  assert.match(rendered, /justification = "Viewing pull requests requires approval"/);
  assert.match(rendered, /pattern = \["printenv"\]/);
  assert.match(rendered, /pattern = \["env"\]/);
  assert.match(rendered, /pattern = \["rm", "\.env"\]/);
  assert.match(rendered, /pattern = \["rm", "\.env\.local"\]/);
  assert.match(rendered, /pattern = \["rm", "-rf", "secrets"\]/);
  assert.match(rendered, /decision = "forbidden"/);
  assert.match(rendered, /Do not dump environment variables because they can expose secrets/);
  assert.match(rendered, /Do not delete sensitive environment or secrets files without explicit approval/);
});

test('copyCoreRuleSources mirrors core rules into .ai-harness rules surface', async () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'aih-v2-rules-core-'));
  const sourceRoot = path.join(tempRoot, 'source-rules');
  const coreRulesRoot = path.join(sourceRoot, 'core');
  const coreRoot = path.join(tempRoot, '.ai-harness');

  fs.mkdirSync(coreRulesRoot, { recursive: true });
  fs.writeFileSync(path.join(coreRulesRoot, 'blocking.md'), 'Stop.\n');

  await copyCoreRuleSources(sourceRoot, coreRoot);

  assert.equal(
    fs.readFileSync(path.join(coreRoot, 'rules', 'core', 'blocking.md'), 'utf8'),
    'Stop.\n'
  );
});

test('installProviderRules generates Claude and Codex provider artifacts', async () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'aih-v2-provider-rules-'));
  const templatesRoot = path.join(tempRoot, 'templates');
  const claudeRoot = path.join(tempRoot, '.claude');
  const codexRoot = path.join(tempRoot, '.codex');
  const coreRoot = path.join(tempRoot, '.ai-harness');

  fs.mkdirSync(path.join(templatesRoot, 'claude'), { recursive: true });
  fs.mkdirSync(path.join(templatesRoot, 'codex'), { recursive: true });
  fs.writeFileSync(path.join(templatesRoot, 'claude', 'CLAUDE.md'), '# Claude\n<!-- @core -->\n');
  fs.writeFileSync(path.join(templatesRoot, 'codex', 'AGENTS.md'), '# Codex\n<!-- @core -->\n');

  await installProviderRules({
    provider: 'claude',
    providerRoot: claudeRoot,
    coreRoot,
    adapterTemplatePath: path.join(templatesRoot, 'claude', 'CLAUDE.md'),
    commonRules: getCommonRulesConfig(),
    claudeSettingsBase: {
      extraKnownMarketplaces: {
        'ai-engineering-harness': {
          source: { source: 'github', repo: 'truongnat/ai-engineering-harness' },
        },
      },
    },
  });

  await installProviderRules({
    provider: 'codex',
    providerRoot: codexRoot,
    coreRoot,
    adapterTemplatePath: path.join(templatesRoot, 'codex', 'AGENTS.md'),
    commonRules: getCommonRulesConfig(),
  });

  assert.match(
    fs.readFileSync(path.join(claudeRoot, 'CLAUDE.md'), 'utf8'),
    /`\.ai-harness\/rules\/core\/blocking\.md`/
  );
  assert.match(
    fs.readFileSync(path.join(claudeRoot, 'CLAUDE.md'), 'utf8'),
    /`\.ai-harness\/rules\/core\/sensitive-data\.md`/
  );
  const claudeSettings = JSON.parse(
    fs.readFileSync(path.join(claudeRoot, 'settings.json'), 'utf8'),
  ) as { permissions: { deny: string[] } };
  assert.ok(claudeSettings.permissions.deny.includes('Read(./.env)'));
  assert.ok(claudeSettings.permissions.deny.includes('Read(./.env.local)'));
  assert.ok(claudeSettings.permissions.deny.includes('Read(./.envrc)'));

  assert.match(
    fs.readFileSync(path.join(codexRoot, 'AGENTS.md'), 'utf8'),
    /`\.ai-harness\/rules\/core\/blocking\.md`/
  );
  assert.match(
    fs.readFileSync(path.join(codexRoot, 'AGENTS.md'), 'utf8'),
    /`\.ai-harness\/rules\/core\/sensitive-data\.md`/
  );
  assert.match(
    fs.readFileSync(path.join(codexRoot, 'rules', 'default.rules'), 'utf8'),
    /prefix_rule\(/
  );
  assert.match(
    fs.readFileSync(path.join(codexRoot, 'rules', 'default.rules'), 'utf8'),
    /pattern = \["printenv"\]/
  );
  assert.match(
    fs.readFileSync(path.join(codexRoot, 'rules', 'default.rules'), 'utf8'),
    /pattern = \["rm", "\.env"\]/
  );
  assert.match(
    fs.readFileSync(path.join(codexRoot, 'rules', 'default.rules'), 'utf8'),
    /pattern = \["rm", "-rf", "secrets"\]/
  );
});
