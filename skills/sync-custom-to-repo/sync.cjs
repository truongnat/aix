#!/usr/bin/env node

/**
 * Sync custom skills/workflows/templates to upstream repo via PR
 * Usage: node .agents/devkit/skills/sync-custom-to-repo/sync.cjs
 */

const { execSync } = require('child_process');
const { existsSync, readdirSync, rmSync, mkdirSync } = require('fs');
const { join, resolve } = require('path');
const os = require('os');

// Constants
const REPO_URL = 'https://github.com/truongnat/skills.git';
const REPO_ROOT = resolve(__dirname, '../..');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
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

  const skills = [];
  const dirs = readdirSync(skillsDir, { withFileTypes: true });
  for (const d of dirs) {
    if (d.isDirectory() && existsSync(join(skillsDir, d.name, 'SKILL.md'))) {
      skills.push(d.name);
    }
  }
  return skills;
}

function detectCustomWorkflows() {
  const workflowsDir = join(REPO_ROOT, 'workflows');
  if (!existsSync(workflowsDir)) return [];

  const workflows = [];
  const dirs = readdirSync(workflowsDir, { withFileTypes: true });
  for (const d of dirs) {
    if (d.isDirectory()) {
      workflows.push(d.name);
    }
  }
  return workflows;
}

function detectCustomTemplates() {
  const templatesDir = join(REPO_ROOT, 'templates');
  if (!existsSync(templatesDir)) return [];

  const templates = [];
  const dirs = readdirSync(templatesDir, { withFileTypes: true });
  for (const d of dirs) {
    if (d.isDirectory()) {
      templates.push(d.name);
    }
  }
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
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const contentStr = [...customSkills, ...customWorkflows, ...customTemplates].join('-').slice(0, 30);
  const branchName = `sync-${contentStr}-${dateStr}`;

  try {
    step('Cloning upstream repo to temp directory', () => {
      mkdirSync(tempDir, { recursive: true });
      execSync(`git clone ${REPO_URL} ${tempDir}`, { stdio: 'inherit' });
    });

    step('Creating new branch in cloned repo', () => {
      execSync('git checkout -b ' + branchName, { cwd: tempDir, stdio: 'inherit' });
    });

    step('Copying custom skills to cloned repo', () => {
      if (customSkills.length > 0) {
        const destSkillsDir = join(tempDir, 'skills');
        mkdirSync(destSkillsDir, { recursive: true });
        for (const skill of customSkills) {
          const src = join(REPO_ROOT, 'skills', skill);
          const dest = join(destSkillsDir, skill);
          execSync(`xcopy "${src}" "${dest}" /E /I /Y`, { stdio: 'inherit' });
        }
      }
    });

    step('Copying custom workflows to cloned repo', () => {
      if (customWorkflows.length > 0) {
        const destWorkflowsDir = join(tempDir, 'workflows');
        mkdirSync(destWorkflowsDir, { recursive: true });
        for (const wf of customWorkflows) {
          const src = join(REPO_ROOT, 'workflows', wf);
          const dest = join(destWorkflowsDir, wf);
          execSync(`xcopy "${src}" "${dest}" /E /I /Y`, { stdio: 'inherit' });
        }
      }
    });

    step('Copying custom templates to cloned repo', () => {
      if (customTemplates.length > 0) {
        const destTemplatesDir = join(tempDir, 'templates');
        mkdirSync(destTemplatesDir, { recursive: true });
        for (const tpl of customTemplates) {
          const src = join(REPO_ROOT, 'templates', tpl);
          const dest = join(destTemplatesDir, tpl);
          execSync(`xcopy "${src}" "${dest}" /E /I /Y`, { stdio: 'inherit' });
        }
      }
    });

    step('Committing changes in cloned repo', () => {
      execSync('git add -A', { cwd: tempDir, stdio: 'inherit' });
      const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
      const changesDesc = [];
      if (customSkills.length > 0) changesDesc.push(`${customSkills.length} skill(s)`);
      if (customWorkflows.length > 0) changesDesc.push(`${customWorkflows.length} workflow(s)`);
      if (customTemplates.length > 0) changesDesc.push(`${customTemplates.length} template(s)`);
      execSync(`git commit -m "Sync ${changesDesc.join(', ')} - ${timestamp}"`, { cwd: tempDir, stdio: 'inherit' });
    });

    step('Pushing branch to upstream', () => {
      execSync(`git push -u origin ${branchName}`, { cwd: tempDir, stdio: 'inherit' });
    });

    step('Creating pull request', () => {
      try {
        execSync(`gh pr create --base main --head ${branchName} --title "Sync custom changes" --body "Sync custom skills/workflows/templates from local devkit"`, { cwd: tempDir, stdio: 'inherit' });
        log('PR created successfully', 'green');
      } catch (error) {
        log('GitHub CLI not available or failed', 'yellow');
        const prUrl = `${REPO_URL.replace('.git', '')}/pull/new/${branchName}`;
        log(`Branch đã sẵn sàng: ${prUrl}`, 'cyan');
      }
    });

  } finally {
    step('Cleaning up temp directory', () => {
      rmSync(tempDir, { recursive: true, force: true });
    });
  }

  log('\n=== Sync complete ===', 'green');
  log('\n=== Summary ===', 'cyan');

  // Summary title
  const summaryParts = [];
  if (customSkills.length > 0) summaryParts.push(`${customSkills.length} skill(s)`);
  if (customWorkflows.length > 0) summaryParts.push(`${customWorkflows.length} workflow(s)`);
  if (customTemplates.length > 0) summaryParts.push(`${customTemplates.length} template(s)`);
  const summaryTitle = summaryParts.length > 0 ? summaryParts.join(', ') : 'No changes';
  log(`Synced: ${summaryTitle}`, 'green');

  log(`Branch: ${branchName}`, 'cyan');
  if (customSkills.length > 0) {
    log(`Skills synced (${customSkills.length}):`, 'green');
    customSkills.forEach(skill => log(`  - ${skill}`, 'reset'));
  }
  if (customWorkflows.length > 0) {
    log(`Workflows synced (${customWorkflows.length}):`, 'green');
    customWorkflows.forEach(wf => log(`  - ${wf}`, 'reset'));
  }
  if (customTemplates.length > 0) {
    log(`Templates synced (${customTemplates.length}):`, 'green');
    customTemplates.forEach(tpl => log(`  - ${tpl}`, 'reset'));
  }
}

main();
