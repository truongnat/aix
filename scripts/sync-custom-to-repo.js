#!/usr/bin/env node

/**
 * Simple script to push changes to repo
 * Usage: node scripts/sync-custom-to-repo.js
 */

const { execSync } = require('child_process');

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

function main() {
  log('=== Sync to Repo ===', 'cyan');

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

  log('Pushing to origin...', 'cyan');
  exec('git push origin main');
  log('Pushed successfully', 'green');

  log('\n=== Sync complete ===', 'green');
}

main();
