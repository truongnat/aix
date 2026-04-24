#!/usr/bin/env node

/**
 * Sync custom skills/workflows/templates to upstream repo via PR
 * Usage: node scripts/sync-custom-to-repo.js
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

function exec(cmd, options = {}) {
  try {
    return execSync(cmd, { encoding: 'utf8', ...options }).trim();
  } catch (error) {
    if (options.ignoreError) return '';
    throw error;
  }
}

function step(message, action) {
  log(`\n${message}...`, 'cyan');
  const start = Date.now();
  try {
    action();
    const elapsed = ((Date.now() - start) / 1000).toFixed(2);
    log(`✓ ${message} (${elapsed}s)`, 'green');
  } catch (error) {
    log(`✗ ${message} failed: ${error.message}`, 'yellow');
    throw error;
  }
}

function detectCustomSkills() {
  const skillsDir = join(REPO_ROOT, 'skills');
  if (!existsSync(skillsDir)) return [];

  const skills = readdirSync(skillsDir, { withFileTypes: true })
    .filter(d => d.isDirectory() && existsSync(join(skillsDir, d.name, 'SKILL.md')))
    .map(d => d.name);

  return skills;
}

function detectCustomWorkflows() {
  const workflowsDir = join(REPO_ROOT, 'workflows');
  if (!existsSync(workflowsDir)) return [];

  const workflows = readdirSync(workflowsDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  return workflows;
}

function detectCustomTemplates() {
  const templatesDir = join(REPO_ROOT, 'templates');
  if (!existsSync(templatesDir)) return [];

  const templates = readdirSync(templatesDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  return templates;
}

function main() {
  log('=== Sync Custom to Upstream Repo ===', 'cyan');

  // Detect custom additions
  const customSkills = detectCustomSkills();
  const customWorkflows = detectCustomWorkflows();
  const customTemplates = detectCustomTemplates();

  const total = customSkills.length + customWorkflows.length + customTemplates.length;

  if (total === 0) {
    log('No custom additions detected. Nothing to sync.', 'yellow');
    return;
  }

  log(`Found ${total} custom addition(s):`, 'green');
  if (customSkills.length > 0) log(`  Skills: ${customSkills.join(', ')}`, 'cyan');
  if (customWorkflows.length > 0) log(`  Workflows: ${customWorkflows.join(', ')}`, 'cyan');
  if (customTemplates.length > 0) log(`  Templates: ${customTemplates.join(', ')}`, 'cyan');

  const tempDir = join(os.tmpdir(), `skills-sync-${Date.now()}`);
  const branchName = `sync-custom-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`;

  try {
    step('Cloning upstream repo to temp directory', () => {
      mkdirSync(tempDir, { recursive: true });
      exec(`git clone ${REPO_URL} ${tempDir}`);
    });

    step('Creating new branch in cloned repo', () => {
      exec(`git checkout -b ${branchName}`, { cwd: tempDir });
    });

    step('Copying custom skills to cloned repo', () => {
      if (customSkills.length > 0) {
        const destSkillsDir = join(tempDir, 'skills');
        mkdirSync(destSkillsDir, { recursive: true });
        customSkills.forEach(skill => {
          const src = join(REPO_ROOT, 'skills', skill);
          const dest = join(destSkillsDir, skill);
          cpSync(src, dest, { recursive: true });
        });
      }
    });

    step('Copying custom workflows to cloned repo', () => {
      if (customWorkflows.length > 0) {
        const destWorkflowsDir = join(tempDir, 'workflows');
        mkdirSync(destWorkflowsDir, { recursive: true });
        customWorkflows.forEach(wf => {
          const src = join(REPO_ROOT, 'workflows', wf);
          const dest = join(destWorkflowsDir, wf);
          cpSync(src, dest, { recursive: true });
        });
      }
    });

    step('Copying custom templates to cloned repo', () => {
      if (customTemplates.length > 0) {
        const destTemplatesDir = join(tempDir, 'templates');
        mkdirSync(destTemplatesDir, { recursive: true });
        customTemplates.forEach(tpl => {
          const src = join(REPO_ROOT, 'templates', tpl);
          const dest = join(destTemplatesDir, tpl);
          cpSync(src, dest, { recursive: true });
        });
      }
    });

    step('Committing changes in cloned repo', () => {
      exec('git add -A', { cwd: tempDir });
      const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
      exec(`git commit -m "Sync custom changes - ${timestamp}"`, { cwd: tempDir });
    });

    step('Pushing branch to upstream', () => {
      exec(`git push -u origin ${branchName}`, { cwd: tempDir });
    });

    step('Creating pull request', () => {
      try {
        exec(`gh pr create --base main --head ${branchName} --title "Sync custom changes" --body "Sync custom skills/workflows/templates from local devkit"`, { cwd: tempDir });
        log('PR created successfully', 'green');
      } catch (error) {
        log('GitHub CLI not available or failed', 'yellow');
        log('Please create PR manually:', 'yellow');
        log(`  Branch: ${branchName}`, 'yellow');
      }
    });

  } finally {
    step('Cleaning up temp directory', () => {
      rmSync(tempDir, { recursive: true, force: true });
    });
  }

  log('\n=== Sync complete ===', 'green');
}

main();
