#!/usr/bin/env node

/**
 * Sync custom skills/workflows/templates from local devkit to upstream repo
 * Usage: node scripts/sync-custom-to-repo.js [options]
 * Options:
 *   --dry-run: Show what would be done without executing
 *   --branch <name>: Custom branch name (default: auto-generated)
 *   --skip-pr: Skip creating PR, only push branch
 */

const { execSync } = require('child_process');
const { readFileSync, writeFileSync, existsSync, readdirSync, lstatSync } = require('fs');
const { join, resolve } = require('path');
const https = require('https');

const REPO_ROOT = resolve(__dirname, '..');
const BUNDLE_PATH = join(REPO_ROOT, '.agents', 'devkit');

// Colors for terminal output
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

function detectCustomSkills() {
  const bundleSkills = existsSync(join(BUNDLE_PATH, 'skills'))
    ? new Set(readdirSync(join(BUNDLE_PATH, 'skills')).filter(f => lstatSync(join(BUNDLE_PATH, 'skills', f)).isDirectory()))
    : new Set();

  const localSkills = existsSync(join(REPO_ROOT, 'skills'))
    ? readdirSync(join(REPO_ROOT, 'skills'), { withFileTypes: true })
      .filter(d => d.isDirectory() && existsSync(join(REPO_ROOT, 'skills', d.name, 'SKILL.md')))
      .map(d => d.name)
    : [];

  return localSkills.filter(skill => !bundleSkills.has(skill));
}

function detectCustomWorkflows() {
  const bundleWorkflows = existsSync(join(BUNDLE_PATH, 'workflows'))
    ? new Set(readdirSync(join(BUNDLE_PATH, 'workflows'), { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name))
    : new Set();

  const localWorkflows = existsSync(join(REPO_ROOT, 'workflows'))
    ? readdirSync(join(REPO_ROOT, 'workflows'), { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name)
    : [];

  return localWorkflows.filter(workflow => !bundleWorkflows.has(workflow));
}

function detectCustomTemplates() {
  const bundleTemplates = existsSync(join(BUNDLE_PATH, 'templates'))
    ? new Set(readdirSync(join(BUNDLE_PATH, 'templates'), { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name))
    : new Set();

  const localTemplates = existsSync(join(REPO_ROOT, 'templates'))
    ? readdirSync(join(REPO_ROOT, 'templates'), { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name)
    : [];

  return localTemplates.filter(template => !bundleTemplates.has(template));
}

function detectCustomCommands() {
  const bundleCommands = existsSync(join(BUNDLE_PATH, 'commands'))
    ? new Set(readdirSync(join(BUNDLE_PATH, 'commands')).filter(f => f.endsWith('.md')))
    : new Set();

  const localCommands = existsSync(join(REPO_ROOT, 'commands'))
    ? readdirSync(join(REPO_ROOT, 'commands')).filter(f => f.endsWith('.md'))
    : [];

  return localCommands.filter(cmd => !bundleCommands.has(cmd));
}

function generateBranchName(customSkills, customWorkflows, customTemplates, customCommands) {
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const parts = [];
  
  if (customSkills.length > 0) parts.push(`${customSkills.length}-skills`);
  if (customWorkflows.length > 0) parts.push(`${customWorkflows.length}-workflows`);
  if (customTemplates.length > 0) parts.push(`${customTemplates.length}-templates`);
  if (customCommands.length > 0) parts.push(`${customCommands.length}-commands`);
  
  return parts.length > 0 ? `sync-custom-${parts.join('-')}-${timestamp}` : `sync-custom-${timestamp}`;
}

function generatePRDescription(customSkills, customWorkflows, customTemplates, customCommands) {
  let description = '## Custom additions to devkit\n\n';
  
  if (customSkills.length > 0) {
    description += '### Skills\n';
    customSkills.forEach(skill => {
      const skillMd = join(REPO_ROOT, 'skills', skill, 'SKILL.md');
      if (existsSync(skillMd)) {
        const content = readFileSync(skillMd, 'utf8');
        const match = content.match(/description:\s*\|?\s*([\s\S]+?)\n/);
        const desc = match ? match[1].trim().split('\n')[0] : 'No description';
        description += `- **${skill}**: ${desc}\n`;
      } else {
        description += `- **${skill}**: (missing SKILL.md)\n`;
      }
    });
    description += '\n';
  }
  
  if (customWorkflows.length > 0) {
    description += '### Workflows\n';
    customWorkflows.forEach(wf => {
      const wfMd = join(REPO_ROOT, 'workflows', wf, `${wf}.md`);
      if (existsSync(wfMd)) {
        const content = readFileSync(wfMd, 'utf8');
        const match = content.match(/description:\s*(.+)/);
        const desc = match ? match[1].trim() : 'No description';
        description += `- **${wf}**: ${desc}\n`;
      } else {
        description += `- **${wf}**: (missing workflow file)\n`;
      }
    });
    description += '\n';
  }
  
  if (customTemplates.length > 0) {
    description += '### Templates\n';
    customTemplates.forEach(tpl => {
      description += `- **${tpl}**: Custom template\n`;
    });
    description += '\n';
  }
  
  if (customCommands.length > 0) {
    description += '### Commands\n';
    customCommands.forEach(cmd => {
      const cmdMd = join(REPO_ROOT, 'commands', `${cmd}`);
      if (existsSync(cmdMd)) {
        const content = readFileSync(cmdMd, 'utf8');
        const match = content.match(/description:\s*(.+)/);
        const desc = match ? match[1].trim() : 'No description';
        description += `- **${cmd}**: ${desc}\n`;
      } else {
        description += `- **${cmd}**: (missing command file)\n`;
      }
    });
    description += '\n';
  }
  
  description += '---\n\n';
  description += 'This PR was auto-generated by the sync-custom-to-repo script.';
  description += '\n\nPlease review the changes before merging.';
  
  return description;
}

function createPR(branchName, description, dryRun) {
  const remoteUrl = exec('git config --get remote.origin.url');
  const match = remoteUrl.match(/github\.com[:/](.+?)(\.git)?$/);
  if (!match) {
    log('Could not detect GitHub repository URL', 'yellow');
    log('Please create PR manually:', 'yellow');
    log(`  Branch: ${branchName}`, 'yellow');
    log(`  Description:\n${description}`, 'yellow');
    return false;
  }
  
  const repoPath = match[1];
  const prTitle = `Add custom skills/workflows/templates`;
  
  if (dryRun) {
    log('Would create PR:', 'cyan');
    log(`  Repository: ${repoPath}`, 'cyan');
    log(`  Branch: ${branchName}`, 'cyan');
    log(`  Title: ${prTitle}`, 'cyan');
    log(`  Description:\n${description}`, 'cyan');
    return true;
  }
  
  try {
    // Try using GitHub CLI
    exec(`gh pr create --base main --head ${branchName} --title "${prTitle}" --body "${description.replace(/\n/g, '\\n')}"`);
    log('PR created successfully using GitHub CLI', 'green');
    return true;
  } catch (error) {
    // Fallback to manual instructions
    log('GitHub CLI not available or failed', 'yellow');
    log('Please create PR manually:', 'yellow');
    log(`  Repository: https://github.com/${repoPath}`, 'yellow');
    log(`  Branch: ${branchName}`, 'yellow');
    log(`  Title: ${prTitle}`, 'yellow');
    log(`  Description:\n${description}`, 'yellow');
    return false;
  }
}

function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const skipPr = args.includes('--skip-pr');
  const branchArgIndex = args.indexOf('--branch');
  const customBranchName = branchArgIndex !== -1 ? args[branchArgIndex + 1] : null;
  
  log('=== Sync Custom to Repo ===', 'cyan');
  log('Detecting custom additions...\n', 'cyan');
  
  const customSkills = detectCustomSkills();
  const customWorkflows = detectCustomWorkflows();
  const customTemplates = detectCustomTemplates();
  const customCommands = detectCustomCommands();
  
  const total = customSkills.length + customWorkflows.length + customTemplates.length + customCommands.length;
  
  if (total === 0) {
    log('No custom additions detected. Nothing to sync.', 'yellow');
    return;
  }
  
  log(`Found ${total} custom addition(s):`, 'green');
  if (customSkills.length > 0) log(`  Skills: ${customSkills.join(', ')}`, 'blue');
  if (customWorkflows.length > 0) log(`  Workflows: ${customWorkflows.join(', ')}`, 'blue');
  if (customTemplates.length > 0) log(`  Templates: ${customTemplates.join(', ')}`, 'blue');
  if (customCommands.length > 0) log(`  Commands: ${customCommands.join(', ')}`, 'blue');
  log('');
  
  const branchName = customBranchName || generateBranchName(customSkills, customWorkflows, customTemplates, customCommands);
  log(`Branch name: ${branchName}`, 'cyan');
  log('');
  
  if (dryRun) {
    log('DRY RUN - No changes will be made', 'yellow');
    log('Would:', 'yellow');
    log(`  1. Create branch: ${branchName}`, 'yellow');
    log(`  2. Add and commit changes`, 'yellow');
    log(`  3. Push to remote`, 'yellow');
    if (!skipPr) log(`  4. Create PR`, 'yellow');
    log('');
    createPR(branchName, generatePRDescription(customSkills, customWorkflows, customTemplates, customCommands), true);
    return;
  }
  
  try {
    // Ensure working tree is clean
    const status = exec('git status --porcelain');
    if (status) {
      log('Working tree is not clean. Please commit or stash changes first.', 'yellow');
      return;
    }
    
    // Create and checkout branch
    log(`Creating branch: ${branchName}`, 'cyan');
    exec(`git checkout -b ${branchName}`);
    
    // Stage custom additions
    log('Staging changes...', 'cyan');
    const filesToStage = [];
    
    customSkills.forEach(skill => filesToStage.push(`skills/${skill}/`));
    customWorkflows.forEach(wf => filesToStage.push(`workflows/${wf}/`));
    customTemplates.forEach(tpl => filesToStage.push(`templates/${tpl}/`));
    customCommands.forEach(cmd => filesToStage.push(`commands/${cmd}`));
    
    // Update README.md if needed
    if (customSkills.length > 0) {
      filesToStage.push('skills/README.md');
    }
    if (customWorkflows.length > 0) {
      filesToStage.push('workflows/README.md');
    }
    
    filesToStage.forEach(file => {
      exec(`git add ${file}`, { ignoreError: true });
    });
    
    // Commit
    const commitMessage = `Add custom skills/workflows/templates\n\n`;
    const commitBody = [];
    if (customSkills.length > 0) commitBody.push(`Skills: ${customSkills.join(', ')}`);
    if (customWorkflows.length > 0) commitBody.push(`Workflows: ${customWorkflows.join(', ')}`);
    if (customTemplates.length > 0) commitBody.push(`Templates: ${customTemplates.join(', ')}`);
    if (customCommands.length > 0) commitBody.push(`Commands: ${customCommands.join(', ')}`);
    
    exec(`git commit -m "${commitMessage}${commitBody.join('\\n')}"`);
    log('Changes committed', 'green');
    
    // Push
    log('Pushing to remote...', 'cyan');
    exec(`git push -u origin ${branchName}`);
    log('Branch pushed successfully', 'green');
    
    // Create PR
    if (!skipPr) {
      const description = generatePRDescription(customSkills, customWorkflows, customTemplates, customCommands);
      createPR(branchName, description, false);
    } else {
      log('Skipping PR creation (--skip-pr flag)', 'yellow');
    }
    
    log('\n=== Sync complete ===', 'green');
    
  } catch (error) {
    log(`Error: ${error.message}`, 'yellow');
    log('Rolling back...', 'yellow');
    exec('git checkout main', { ignoreError: true });
    exec(`git branch -D ${branchName}`, { ignoreError: true });
  }
}

main();
