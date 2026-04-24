#!/usr/bin/env node

/**
 * Simple script to push changes to repo
 * Usage: node scripts/sync-custom-to-repo.js [options]
 * Options:
 *   --push: Push directly to main branch
 *   --pr: Create branch, push, and create PR
 *   --repo <url>: Target repository URL (e.g., https://github.com/user/repo.git)
 *   --branch <name>: Custom branch name (default: sync-custom-<timestamp>)
 */

const { execSync } = require('child_process');
const { existsSync, readdirSync, lstatSync } = require('fs');
const { join, resolve } = require('path');

const REPO_ROOT = resolve(__dirname, '..');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
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

function main() {
  const args = process.argv.slice(2);
  const pushToMain = args.includes('--push');
  const createPr = args.includes('--pr');
  const repoArgIndex = args.indexOf('--repo');
  const targetRepo = repoArgIndex !== -1 ? args[repoArgIndex + 1] : null;
  const branchArgIndex = args.indexOf('--branch');
  const customBranchName = branchArgIndex !== -1 ? args[branchArgIndex + 1] : null;

  if (!pushToMain && !createPr) {
    log('Usage:', 'yellow');
    log('  node scripts/sync-custom-to-repo.js --push [--repo <url>]', 'cyan');
    log('  node scripts/sync-custom-to-repo.js --pr [--repo <url>] [--branch <name>]', 'cyan');
    log('');
    log('Options:', 'yellow');
    log('  --repo <url>  Target repository (e.g., https://github.com/user/repo.git)', 'cyan');
    log('  --branch <name>  Custom branch name', 'cyan');
    return;
  }

  log('=== Sync to Repo ===', 'cyan');
  if (targetRepo) {
    log(`Target repo: ${targetRepo}`, 'cyan');
  } else {
    log('Target repo: origin (from git config)', 'cyan');
  }
  log('');

  // Check working tree
  const status = exec('git status --porcelain');
  if (!status) {
    log('No changes to sync. Working tree is clean.', 'yellow');
    return;
  }

  log('Staging all changes...', 'cyan');
  exec('git add -A');

  log('Committing changes...', 'cyan');
  const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
  exec(`git commit -m "Sync custom changes - ${timestamp}"`);
  log('Changes committed', 'green');

  // Add remote if specified
  if (targetRepo) {
    log('Adding target remote...', 'cyan');
    exec('git remote remove sync-target 2>/dev/null || true', { ignoreError: true });
    exec(`git remote add sync-target ${targetRepo}`);
    log('Remote added', 'green');
  }

  const remote = targetRepo ? 'sync-target' : 'origin';

  if (pushToMain) {
    log(`Pushing to ${remote}...`, 'cyan');
    exec(`git push ${remote} main`);
    log('Pushed successfully', 'green');
  } else if (createPr) {
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const branchName = customBranchName || `sync-custom-${timestamp}`;
    
    log(`Creating branch: ${branchName}`, 'cyan');
    exec(`git checkout -b ${branchName}`);
    
    log(`Pushing to ${remote}...`, 'cyan');
    exec(`git push -u ${remote} ${branchName}`);
    log('Branch pushed successfully', 'green');
    
    // Create PR
    try {
      const repoUrl = targetRepo || exec('git config --get remote.origin.url');
      const repoMatch = repoUrl.match(/github\.com[:/](.+?)(\.git)?$/);
      if (repoMatch) {
        const repoPath = repoMatch[1];
        exec(`gh pr create --base main --head ${branchName} --repo ${repoPath} --title "Sync custom changes" --body "Sync custom skills/workflows/templates from local devkit"`);
        log('PR created successfully', 'green');
      } else {
        throw new Error('Not a GitHub repo');
      }
    } catch (error) {
      log('GitHub CLI not available or failed', 'yellow');
      log('Please create PR manually:', 'yellow');
      log(`  Remote: ${remote}`, 'yellow');
      log(`  Branch: ${branchName}`, 'yellow');
    }
  }

  // Cleanup temporary remote
  if (targetRepo) {
    exec('git remote remove sync-target', { ignoreError: true });
  }

  log('\n=== Sync complete ===', 'green');
}

main();
