#!/usr/bin/env node

/**
 * Sync custom skills/workflows/templates to upstream repo via PR
 * Cross-platform: works on macOS, Linux, Windows
 * Usage: node scripts/sync-custom-to-repo.cjs
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

function exec(command, cwd = REPO_ROOT) {
  try {
    return execSync(command, { cwd, stdio: 'inherit', encoding: 'utf8' });
  } catch (error) {
    throw new Error(`Command failed: ${command}\n${error.message}`);
  }
}

function detectCustomItems(itemType) {
  const dirPath = join(REPO_ROOT, itemType);
  if (!existsSync(dirPath)) return [];

  try {
    return readdirSync(dirPath)
      .filter(name => {
        const fullPath = join(dirPath, name);
        const stat = lstatSync(fullPath);

        if (itemType === 'skills') {
          return stat.isDirectory() && existsSync(join(fullPath, 'SKILL.md'));
        }
        return stat.isDirectory();
      });
  } catch (error) {
    return [];
  }
}

function main() {
  log('=== Sync Custom to Upstream Repo ===', 'cyan');
  log(`Platform: ${process.platform} (${os.arch()})`, 'cyan');

  // Detect custom additions
  const customSkills = detectCustomItems('skills');
  const customWorkflows = detectCustomItems('workflows');
  const customTemplates = detectCustomItems('templates');

  const total = customSkills.length + customWorkflows.length + customTemplates.length;

  if (total === 0) {
    log('No custom additions detected. Nothing to sync.', 'yellow');
    return;
  }

  log(`\nFound ${total} custom addition(s):`, 'green');
  if (customSkills.length > 0) log(`  Skills: ${customSkills.join(', ')}`, 'cyan');
  if (customWorkflows.length > 0) log(`  Workflows: ${customWorkflows.join(', ')}`, 'cyan');
  if (customTemplates.length > 0) log(`  Templates: ${customTemplates.join(', ')}`, 'cyan');

  const tempDir = join(os.tmpdir(), `skills-sync-${Date.now()}`);
  const branchName = `sync-custom-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`;

  try {
    // Step 1: Clone repo
    log(`\nCloning upstream repo...`, 'cyan');
    mkdirSync(tempDir, { recursive: true });
    exec(`git clone ${REPO_URL} "${tempDir}"`);
    log('✓ Repo cloned', 'green');

    // Step 2: Create branch
    log(`Creating branch: ${branchName}...`, 'cyan');
    exec(`git checkout -b ${branchName}`, tempDir);
    log('✓ Branch created', 'green');

    // Step 3: Copy skills
    if (customSkills.length > 0) {
      log(`\nCopying skills...`, 'cyan');
      const destSkillsDir = join(tempDir, 'skills');
      mkdirSync(destSkillsDir, { recursive: true });
      for (const skill of customSkills) {
        const src = join(REPO_ROOT, 'skills', skill);
        const dest = join(destSkillsDir, skill);
        cpSync(src, dest, { recursive: true, force: true });
        log(`  ✓ ${skill}`, 'green');
      }
    }

    // Step 4: Copy workflows
    if (customWorkflows.length > 0) {
      log(`\nCopying workflows...`, 'cyan');
      const destWorkflowsDir = join(tempDir, 'workflows');
      mkdirSync(destWorkflowsDir, { recursive: true });
      for (const wf of customWorkflows) {
        const src = join(REPO_ROOT, 'workflows', wf);
        const dest = join(destWorkflowsDir, wf);
        cpSync(src, dest, { recursive: true, force: true });
        log(`  ✓ ${wf}`, 'green');
      }
    }

    // Step 5: Copy templates
    if (customTemplates.length > 0) {
      log(`\nCopying templates...`, 'cyan');
      const destTemplatesDir = join(tempDir, 'templates');
      mkdirSync(destTemplatesDir, { recursive: true });
      for (const tpl of customTemplates) {
        const src = join(REPO_ROOT, 'templates', tpl);
        const dest = join(destTemplatesDir, tpl);
        cpSync(src, dest, { recursive: true, force: true });
        log(`  ✓ ${tpl}`, 'green');
      }
    }

    // Step 6: Commit
    log(`\nCommitting changes...`, 'cyan');
    exec(`git add -A`, tempDir);
    const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
    exec(`git commit -m "Sync custom changes - ${timestamp}"`, tempDir);
    log('✓ Changes committed', 'green');

    // Step 7: Push
    log(`Pushing to upstream...`, 'cyan');
    exec(`git push -u origin ${branchName}`, tempDir);
    log('✓ Branch pushed', 'green');

    // Step 8: Create PR
    log(`\nCreating pull request...`, 'cyan');
    try {
      exec(
        `gh pr create --base main --head ${branchName} --title "Sync custom changes" --body "Sync ${total} custom items (${customSkills.length} skills, ${customWorkflows.length} workflows, ${customTemplates.length} templates)"`,
        tempDir
      );
      log('✓ PR created', 'green');
    } catch (error) {
      log('⚠ GitHub CLI not available or failed', 'yellow');
      log(`Please create PR manually:`, 'yellow');
      log(`  Branch: ${branchName}`, 'yellow');
      log(`  Base: main`, 'yellow');
    }

  } catch (error) {
    log(`\n✗ Error: ${error.message}`, 'yellow');
    process.exit(1);
  } finally {
    // Cleanup
    log(`\nCleaning up...`, 'cyan');
    try {
      if (existsSync(tempDir)) {
        rmSync(tempDir, { recursive: true, force: true });
      }
      log('✓ Cleanup complete', 'green');
    } catch (error) {
      log(`⚠ Cleanup failed (temp dir may still exist): ${tempDir}`, 'yellow');
    }
  }

  log('\n=== Sync complete ===', 'green');
}

main();
