import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const testDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(testDir, '../../..');
const cliPath = join(repoRoot, 'packages/cli/dist/index.js');

function walkFiles(dir) {
  if (!existsSync(dir)) return [];

  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(fullPath));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }
  return files;
}

function countSourceSkills() {
  // The registry dedupes skills by their `name` frontmatter, so leftover
  // duplicate copies on disk must not inflate the expected counts.
  const names = new Set();
  for (const file of walkFiles(join(repoRoot, 'skills')).filter(f => f.endsWith('SKILL.md'))) {
    const frontmatter = /^---\n([\s\S]*?)\n---/.exec(readFileSync(file, 'utf8'))?.[1] ?? '';
    const name = /^name:\s*(.+)$/m.exec(frontmatter)?.[1]?.trim();
    names.add(name ?? file);
  }
  return names.size;
}

function countSourceRules() {
  return walkFiles(join(repoRoot, 'content/rules'))
    .filter(file => file.endsWith('.md'))
    .length;
}

function countSourceAgents() {
  return walkFiles(join(repoRoot, 'content/agents'))
    .filter(file => file.endsWith('.md'))
    .length;
}

function parseInstallOutput(output) {
  const counts = {};
  const writtenPaths = [];
  let provider;

  for (const line of output.split('\n')) {
    const providerMatch = line.match(/^\[(claude|cursor|codex|gemini)\]$/);
    if (providerMatch) {
      provider = providerMatch[1];
      continue;
    }

    const writtenMatch = line.match(/^\s+Written:\s+(\d+)$/);
    if (provider && writtenMatch) {
      counts[provider] = Number(writtenMatch[1]);
      continue;
    }

    const pathMatch = line.match(/^\s+\+\s+(.+)$/);
    if (pathMatch) {
      writtenPaths.push(pathMatch[1]);
    }
  }

  return { counts, writtenPaths };
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

test('install --all writes provider artefacts with expected counts, schemas, and compact entrypoints', () => {
  const tmp = mkdtempSync(join(tmpdir(), 'aix-install-all-smoke-'));

  try {
    const output = execFileSync(process.execPath, [cliPath, 'install', '--all', '--force'], {
      cwd: tmp,
      encoding: 'utf8',
      maxBuffer: 1024 * 1024,
    });

    const skillCount = countSourceSkills();
    const ruleCount = countSourceRules();
    const agentCount = countSourceAgents();
    const hasRules = ruleCount > 0 ? 1 : 0;
    const agentOutputs = agentCount > 0 ? agentCount + 1 : 0;
    const { counts, writtenPaths } = parseInstallOutput(output);

    assert.deepEqual(counts, {
      claude: skillCount + agentCount + hasRules + 2,
      cursor: skillCount + ruleCount,
      codex: skillCount + hasRules + agentOutputs,
      gemini: skillCount + hasRules + agentOutputs + 1,
    });
    assert.equal(new Set(writtenPaths).size, writtenPaths.length, 'install --all should not emit duplicate paths');

    for (const relativePath of writtenPaths) {
      const fullPath = join(tmp, relativePath);
      assert.ok(statSync(fullPath).isFile(), `${relativePath} should be written`);
    }

    assert.equal(existsSync(join(tmp, 'AGENTS.md')), false, 'AGENTS.md should not be emitted at root');
    assert.equal(existsSync(join(tmp, 'GEMINI.md')), false, 'GEMINI.md should not be emitted at root');
    assert.equal(existsSync(join(tmp, 'SKILL.md')), false, 'Cursor install should not overwrite a root SKILL.md');

    const claudeManifest = readJson(join(tmp, '.claude-plugin/plugin.json'));
    assert.equal(claudeManifest.name, 'aix');
    assert.deepEqual(claudeManifest.skills, ['./skills/']);
    assert.equal(claudeManifest.author.name, 'truongdq');



    const geminiExtension = readJson(join(tmp, 'gemini-extension.json'));
    assert.equal(geminiExtension.name, 'aix');
    assert.equal(geminiExtension.skills.length, skillCount);

    assert.equal(walkFiles(join(tmp, '.codex/skills')).filter(file => file.endsWith('.md')).length, skillCount);
    assert.equal(walkFiles(join(tmp, '.agents/skills')).filter(file => file.endsWith('.md')).length, skillCount);
    assert.equal(walkFiles(join(tmp, 'skills')).filter(file => file.endsWith('SKILL.md')).length, skillCount);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});
