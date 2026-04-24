#!/usr/bin/env node

/**
 * Sync custom skills/workflows/templates to upstream repo via PR
 * Usage: node scripts/sync-custom-to-repo.mjs
 */

const { execSync } = require('child_process');
const { existsSync, readdirSync, lstatSync, rmSync, mkdirSync, cpSync } = require('fs');
const { join, resolve } = require('path');
const os = require('os');

// Constants
const REPO_URL = 'https://github.com/truongnat/skills.git';
const REPO_ROOT = resolve(__dirname, '..');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function step(message, action) {
  log(`\n${message}...`, 'cyan');
  const start = Date.now();
  try {
    await action();
    const elapsed = ((Date.now() - start) / 1000).toFixed(2);
    log(`✓ ${message} (${elapsed}s)`, 'green');
  } catch (error) {
    log(`✗ ${message} failed: ${error.message}`, 'yellow');
    throw error;
  }
}

async function detectCustomSkills() {
  const skillsDir = path.join(REPO_ROOT, 'skills');
  if (!await fs.exists(skillsDir)) return [];

  const skills = [];
  for await (const d of await fs.readdir(skillsDir, { withFileTypes: true })) {
    if (d.isDirectory() && await fs.exists(path.join(skillsDir, d.name, 'SKILL.md'))) {
      skills.push(d.name);
    }
  }
  return skills;
}

async function detectCustomWorkflows() {
  const workflowsDir = path.join(REPO_ROOT, 'workflows');
  if (!await fs.exists(workflowsDir)) return [];

  const workflows = [];
  for await (const d of await fs.readdir(workflowsDir, { withFileTypes: true })) {
    if (d.isDirectory()) {
      workflows.push(d.name);
    }
  }
  return workflows;
}

async function detectCustomTemplates() {
  const templatesDir = path.join(REPO_ROOT, 'templates');
  if (!await fs.exists(templatesDir)) return [];

  const templates = [];
  for await (const d of await fs.readdir(templatesDir, { withFileTypes: true })) {
    if (d.isDirectory()) {
      templates.push(d.name);
    }
  }
  return templates;
}

async function main() {
  log('=== Sync Custom to Upstream Repo ===', 'cyan');

  // Detect custom additions
  const customSkills = await detectCustomSkills();
  const customWorkflows = await detectCustomWorkflows();
  const customTemplates = await detectCustomTemplates();

  const total = customSkills.length + customWorkflows.length + customTemplates.length;

  if (total === 0) {
    log('No custom additions detected. Nothing to sync.', 'yellow');
    return;
  }

  log(`Found ${total} custom addition(s):`, 'green');
  if (customSkills.length > 0) log(`  Skills: ${customSkills.join(', ')}`, 'cyan');
  if (customWorkflows.length > 0) log(`  Workflows: ${customWorkflows.join(', ')}`, 'cyan');
  if (customTemplates.length > 0) log(`  Templates: ${customTemplates.join(', ')}`, 'cyan');

  const tempDir = path.join(os.tmpdir(), `skills-sync-${Date.now()}`);
  const branchName = `sync-custom-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`;

  try {
    await step('Cloning upstream repo to temp directory', async () => {
      await fs.mkdir(tempDir, { recursive: true });
      await $`git clone ${REPO_URL} ${tempDir}`;
    });

    await step('Creating new branch in cloned repo', async () => {
      await $`git checkout -b ${branchName}`.cwd(tempDir);
    });

    await step('Copying custom skills to cloned repo', async () => {
      if (customSkills.length > 0) {
        const destSkillsDir = path.join(tempDir, 'skills');
        await fs.mkdir(destSkillsDir, { recursive: true });
        for (const skill of customSkills) {
          const src = path.join(REPO_ROOT, 'skills', skill);
          const dest = path.join(destSkillsDir, skill);
          await $`cp -r ${src} ${dest}`;
        }
      }
    });

    await step('Copying custom workflows to cloned repo', async () => {
      if (customWorkflows.length > 0) {
        const destWorkflowsDir = path.join(tempDir, 'workflows');
        await fs.mkdir(destWorkflowsDir, { recursive: true });
        for (const wf of customWorkflows) {
          const src = path.join(REPO_ROOT, 'workflows', wf);
          const dest = path.join(destWorkflowsDir, wf);
          await $`cp -r ${src} ${dest}`;
        }
      }
    });

    await step('Copying custom templates to cloned repo', async () => {
      if (customTemplates.length > 0) {
        const destTemplatesDir = path.join(tempDir, 'templates');
        await fs.mkdir(destTemplatesDir, { recursive: true });
        for (const tpl of customTemplates) {
          const src = path.join(REPO_ROOT, 'templates', tpl);
          const dest = path.join(destTemplatesDir, tpl);
          await $`cp -r ${src} ${dest}`;
        }
      }
    });

    await step('Committing changes in cloned repo', async () => {
      await $`git add -A`.cwd(tempDir);
      const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
      await $`git commit -m "Sync custom changes - ${timestamp}"`.cwd(tempDir);
    });

    await step('Pushing branch to upstream', async () => {
      await $`git push -u origin ${branchName}`.cwd(tempDir);
    });

    await step('Creating pull request', async () => {
      try {
        await $`gh pr create --base main --head ${branchName} --title "Sync custom changes" --body "Sync custom skills/workflows/templates from local devkit"`.cwd(tempDir);
        log('PR created successfully', 'green');
      } catch (error) {
        log('GitHub CLI not available or failed', 'yellow');
        log('Please create PR manually:', 'yellow');
        log(`  Branch: ${branchName}`, 'yellow');
      }
    });

  } finally {
    await step('Cleaning up temp directory', async () => {
      await fs.rm(tempDir, { recursive: true, force: true });
    });
  }

  log('\n=== Sync complete ===', 'green');
}

main();
