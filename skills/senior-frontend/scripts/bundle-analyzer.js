#!/usr/bin/env node
/**
 * Frontend Bundle Analyzer
 * Analyzes package.json for heavy dependencies and bundle optimization opportunities.
 *
 * Usage:
 *   node bundle-analyzer.js [project_dir]
 *   node bundle-analyzer.js . --json
 *   node bundle-analyzer.js /path/to/project --verbose
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, relative } from 'node:path';
import { parseArgs } from 'node:util';

const HEAVY_PACKAGES = {
  moment: { size: '290KB', alternative: 'date-fns (12KB) or dayjs (2KB)', reason: 'Large locale files bundled by default' },
  lodash: { size: '71KB', alternative: 'lodash-es with tree-shaking or individual imports (lodash/get)', reason: 'Full library often imported when only few functions needed' },
  jquery: { size: '87KB', alternative: 'Native DOM APIs or React/Vue patterns', reason: 'Rarely needed in modern frameworks' },
  axios: { size: '14KB', alternative: 'Native fetch API (0KB) or ky (3KB)', reason: 'Fetch API covers most use cases' },
  underscore: { size: '17KB', alternative: 'Native ES6+ methods or lodash-es', reason: 'Most utilities now in standard JavaScript' },
  'chart.js': { size: '180KB', alternative: 'recharts (bundled with React) or lightweight-charts', reason: 'Consider if you need all chart types' },
  three: { size: '600KB', alternative: 'None - use dynamic import for 3D features', reason: 'Very large, should be lazy-loaded' },
  firebase: { size: '400KB+', alternative: 'Import specific modules (firebase/auth, firebase/firestore)', reason: 'Modular imports significantly reduce size' },
  'material-ui': { size: 'Large', alternative: 'shadcn/ui (copy-paste components) or Tailwind', reason: 'Heavy runtime, consider headless alternatives' },
  '@mui/material': { size: 'Large', alternative: 'shadcn/ui or Radix UI + Tailwind', reason: 'Heavy runtime, consider headless alternatives' },
  antd: { size: 'Large', alternative: 'shadcn/ui or Radix UI + Tailwind', reason: 'Heavy runtime, consider headless alternatives' },
};

const PACKAGE_OPTIMIZATIONS = {
  'react-icons': "Import individual icons: import { FaHome } from 'react-icons/fa'",
  'date-fns': "Use tree-shaking: import { format } from 'date-fns'",
  '@heroicons/react': 'Already tree-shakeable, good choice',
  'lucide-react': 'Already tree-shakeable, add to optimizePackageImports in next.config.js',
  'framer-motion': 'Use dynamic import for non-critical animations',
  recharts: 'Consider lazy loading for dashboard charts',
};

const DEV_ONLY_PREFIXES = ['typescript', '@types/', 'eslint', 'prettier', 'jest', 'vitest', '@testing-library', 'cypress', 'playwright', 'storybook', '@storybook', 'webpack', 'vite', 'rollup', 'esbuild', 'tailwindcss', 'postcss', 'autoprefixer', 'sass', 'less', 'husky', 'lint-staged'];

const STATE_LIBS = ['redux', '@reduxjs/toolkit', 'mobx', 'zustand', 'jotai', 'recoil', 'valtio'];

const IMPORT_CHECKS = [
  { pattern: /import\s+\*\s+as\s+\w+\s+from\s+['"]lodash['"]/, message: 'Avoid import * from lodash, use individual imports' },
  { pattern: /import\s+moment\s+from\s+['"]moment['"]/, message: 'Consider replacing moment with date-fns or dayjs' },
  { pattern: /import\s+\{\s*\w+(?:,\s*\w+){5,}\s*\}\s+from\s+['"]react-icons/, message: 'Import icons from specific icon sets (react-icons/fa)' },
];

function loadPackageJson(projectDir) {
  const pkgPath = join(projectDir, 'package.json');
  try {
    return JSON.parse(readFileSync(pkgPath, 'utf8'));
  } catch {
    return null;
  }
}

function analyzeDependencies(pkg) {
  const deps = pkg.dependencies || {};
  const devDeps = pkg.devDependencies || {};
  const issues = [], warnings = [], optimizations = [];

  for (const [name, info] of Object.entries(HEAVY_PACKAGES)) {
    if (deps[name]) issues.push({ package: name, type: 'heavy_dependency', ...info });
  }

  for (const pkg of Object.keys(deps)) {
    for (const prefix of DEV_ONLY_PREFIXES) {
      if (pkg.startsWith(prefix)) {
        warnings.push({ package: pkg, type: 'dev_in_production', message: `${pkg} should be in devDependencies, not dependencies` });
        break;
      }
    }
  }

  for (const [optPkg, tip] of Object.entries(PACKAGE_OPTIMIZATIONS)) {
    if (Object.keys(deps).some((d) => d.includes(optPkg))) {
      optimizations.push({ package: optPkg, tip });
    }
  }

  if (deps['prop-types'] && (devDeps['typescript'] || devDeps['@types/react'])) {
    warnings.push({ package: 'prop-types', type: 'redundant', message: 'prop-types is redundant when using TypeScript' });
  }

  const foundStateLibs = STATE_LIBS.filter((lib) => deps[lib]);
  if (foundStateLibs.length > 1) {
    warnings.push({ packages: foundStateLibs, type: 'multiple_state_libs', message: `Multiple state management libraries found: ${foundStateLibs.join(', ')}` });
  }

  return { total_dependencies: Object.keys(deps).length, total_dev_dependencies: Object.keys(devDeps).length, issues, warnings, optimizations };
}

function checkNextjsConfig(projectDir) {
  for (const name of ['next.config.js', 'next.config.mjs', 'next.config.ts']) {
    try {
      const content = readFileSync(join(projectDir, name), 'utf8');
      const suggestions = [];
      if (!content.includes('images')) suggestions.push('Configure images.remotePatterns for optimized image loading');
      if (!content.includes('optimizePackageImports')) suggestions.push('Add experimental.optimizePackageImports for lucide-react, @heroicons/react');
      if (!content.includes('transpilePackages') && !content.includes('swc')) suggestions.push('Consider transpilePackages for monorepo packages');
      return { found: true, path: join(projectDir, name), suggestions };
    } catch { /* continue */ }
  }
  return { found: false, suggestions: ['Create next.config.js with image and bundle optimizations'] };
}

function analyzeImports(projectDir) {
  const issues = [];
  let filesChecked = 0;

  function walk(dir) {
    let entries;
    try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const entry of entries) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== 'node_modules') walk(full);
      } else if (entry.isFile() && /\.(ts|tsx|js|jsx)$/.test(entry.name)) {
        filesChecked++;
        let content;
        try { content = readFileSync(full, 'utf8'); } catch { continue; }
        for (const { pattern, message } of IMPORT_CHECKS) {
          if (pattern.test(content)) {
            issues.push({ file: relative(projectDir, full), issue: message });
          }
        }
      }
    }
  }

  for (const srcDir of ['src', 'app', 'pages']) {
    try {
      if (statSync(join(projectDir, srcDir)).isDirectory()) walk(join(projectDir, srcDir));
    } catch { /* skip */ }
  }

  return { files_checked: filesChecked, issues };
}

function calculateScore(analysis) {
  let score = 100;
  score -= analysis.dependencies.issues.length * 10;
  score -= analysis.dependencies.warnings.filter((w) => w.type === 'dev_in_production').length * 5;
  score -= (analysis.imports?.issues?.length ?? 0) * 3;
  if (!analysis.nextjs?.found) score -= 10;
  score = Math.max(0, Math.min(100, score));
  const grade = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F';
  return { score, grade };
}

function printReport(analysis) {
  const { score, grade } = calculateScore(analysis);
  const { RED, YELLOW, CYAN, BOLD, RESET } = { RED: '\x1b[31m', YELLOW: '\x1b[33m', CYAN: '\x1b[36m', BOLD: '\x1b[1m', RESET: '\x1b[0m' };

  console.log('='.repeat(60));
  console.log('FRONTEND BUNDLE ANALYSIS REPORT');
  console.log('='.repeat(60));
  console.log(`\n${BOLD}Bundle Health Score: ${score}/100 (${grade})${RESET}`);

  const { total_dependencies, total_dev_dependencies, issues, warnings, optimizations } = analysis.dependencies;
  console.log(`\nDependencies: ${total_dependencies} production, ${total_dev_dependencies} dev`);

  if (issues.length) {
    console.log(`\n${RED}--- HEAVY DEPENDENCIES ---${RESET}`);
    for (const issue of issues) {
      console.log(`\n  ${issue.package} (${issue.size})`);
      console.log(`    Reason: ${issue.reason}`);
      console.log(`    Alternative: ${issue.alternative}`);
    }
  }

  if (warnings.length) {
    console.log(`\n${YELLOW}--- WARNINGS ---${RESET}`);
    for (const w of warnings) {
      console.log(`  - ${w.package ?? w.packages?.join(', ')}: ${w.message}`);
    }
  }

  if (optimizations.length) {
    console.log(`\n${CYAN}--- OPTIMIZATION TIPS ---${RESET}`);
    for (const opt of optimizations) console.log(`  - ${opt.package}: ${opt.tip}`);
  }

  if (analysis.nextjs?.suggestions?.length) {
    console.log('\n--- NEXT.JS CONFIG ---');
    for (const s of analysis.nextjs.suggestions) console.log(`  - ${s}`);
  }

  const importIssues = analysis.imports?.issues ?? [];
  if (importIssues.length) {
    console.log('\n--- IMPORT ISSUES ---');
    for (const issue of importIssues.slice(0, 10)) console.log(`  - ${issue.file}: ${issue.issue}`);
  }

  console.log('\n--- RECOMMENDATIONS ---');
  if (score >= 90) console.log('  Bundle is well-optimized!');
  else if (issues.length) console.log('  1. Replace heavy dependencies with lighter alternatives');
  if (warnings.length) console.log('  2. Move dev-only packages to devDependencies');
  if (optimizations.length) console.log('  3. Apply import optimizations for tree-shaking');
  console.log('\n' + '='.repeat(60));
}

const { values, positionals } = parseArgs({
  args: process.argv.slice(2),
  options: {
    json: { type: 'boolean', default: false },
    verbose: { type: 'boolean', short: 'v', default: false },
  },
  allowPositionals: true,
});

const projectDir = resolve(positionals[0] || '.');
const pkg = loadPackageJson(projectDir);
if (!pkg) { console.error('Error: No valid package.json found'); process.exit(1); }

const analysis = {
  project: projectDir,
  dependencies: analyzeDependencies(pkg),
  nextjs: checkNextjsConfig(projectDir),
};

if (values.verbose) analysis.imports = analyzeImports(projectDir);

const { score, grade } = calculateScore(analysis);
analysis.score = score;
analysis.grade = grade;

if (values.json) {
  console.log(JSON.stringify(analysis, null, 2));
} else {
  printReport(analysis);
}
