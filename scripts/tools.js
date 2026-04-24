#!/usr/bin/env node
/**
 * Unified script for devkit tools
 * Usage: node scripts/tools.js <command> [args...]
 * 
 * Commands:
 *   analyze-skills
 *   build-kb
 *   build-skill-index
 *   install-skill
 *   list-skills
 *   query-kb
 *   query-kb-batch
 *   validate-skills
 *   verify-bundle-install
 *   verify-kb
 */

const { execSync } = require('child_process');
const { resolve } = require('path');

const REPO_ROOT = resolve(__dirname, '..');

const command = process.argv[2];
const args = process.argv.slice(3);

if (!command) {
  console.error('Usage: node scripts/tools.js <command> [args...]');
  console.error('\nAvailable commands:');
  console.error('  analyze-skills');
  console.error('  build-kb');
  console.error('  build-skill-index');
  console.error('  install-skill');
  console.error('  list-skills');
  console.error('  query-kb');
  console.error('  query-kb-batch');
  console.error('  validate-skills');
  console.error('  verify-bundle-install');
  console.error('  verify-kb');
  process.exit(1);
}

try {
  execSync(`node "${REPO_ROOT}/dist/tools.js" ${command} ${args.join(' ')}`, {
    stdio: 'inherit',
  });
} catch (error) {
  process.exit(1);
}
