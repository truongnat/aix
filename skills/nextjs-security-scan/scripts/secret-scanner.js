#!/usr/bin/env node
/**
 * Secret Scanner for Next.js Projects
 * Detects hardcoded secrets, API keys, and credentials in source code.
 *
 * By default skips real .env files and analyzes .env.example templates.
 *
 * Usage:
 *   node secret-scanner.js [path] [--json] [--exit-code] [--include-env-files]
 */

import { readdirSync, readFileSync } from 'node:fs';
import { join, extname, basename } from 'node:path';
import { parseArgs } from 'node:util';

const RESET = '\x1b[0m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const GREEN = '\x1b[32m';
const BLUE = '\x1b[34m';
const CYAN = '\x1b[36m';

const SECRET_PATTERNS = [
  { name: 'AWS Access Key ID', pattern: /AKIA[0-9A-Z]{16}/, severity: 'CRITICAL' },
  { name: 'AWS Secret Access Key', pattern: /(?:aws_secret_access_key|AWS_SECRET_ACCESS_KEY)\s*[:=]\s*["']?[A-Za-z0-9/+=]{40}["']?/i, severity: 'CRITICAL' },
  { name: 'GitHub Token', pattern: /gh[pousr]_[A-Za-z0-9_]{36,}/, severity: 'CRITICAL' },
  { name: 'GitHub OAuth', pattern: /gho_[A-Za-z0-9]{36}/, severity: 'CRITICAL' },
  { name: 'OpenAI API Key', pattern: /sk-[A-Za-z0-9]{48}/, severity: 'CRITICAL' },
  { name: 'Anthropic API Key', pattern: /sk-ant-[A-Za-z0-9-]{95}/, severity: 'CRITICAL' },
  { name: 'Stripe Secret Key', pattern: /sk_live_[A-Za-z0-9]{24,}/, severity: 'CRITICAL' },
  { name: 'Stripe Publishable Key (Live)', pattern: /pk_live_[A-Za-z0-9]{24,}/, severity: 'HIGH' },
  { name: 'Google API Key', pattern: /AIza[0-9A-Za-z-_]{35}/, severity: 'HIGH' },
  { name: 'Slack Token', pattern: /xox[baprs]-[0-9]{10,13}-[0-9]{10,13}[a-zA-Z0-9-]*/, severity: 'CRITICAL' },
  { name: 'Slack Webhook', pattern: /https:\/\/hooks\.slack\.com\/services\/T[A-Z0-9]+\/B[A-Z0-9]+\/[A-Za-z0-9]+/, severity: 'HIGH' },
  { name: 'Discord Webhook', pattern: /https:\/\/discord(?:app)?\.com\/api\/webhooks\/[0-9]+\/[A-Za-z0-9_-]+/, severity: 'HIGH' },
  { name: 'SendGrid API Key', pattern: /SG\.[A-Za-z0-9_-]{22}\.[A-Za-z0-9_-]{43}/, severity: 'CRITICAL' },
  { name: 'Firebase API Key', pattern: /(?:firebase_api_key|FIREBASE_API_KEY)\s*[:=]\s*["']?[A-Za-z0-9_-]{39}["']?/i, severity: 'HIGH' },
  { name: 'PostgreSQL Connection String', pattern: /postgres(?:ql)?:\/\/[^:]+:[^@]+@[^/]+\/[^\s"']+/, severity: 'CRITICAL' },
  { name: 'MySQL Connection String', pattern: /mysql:\/\/[^:]+:[^@]+@[^/]+\/[^\s"']+/, severity: 'CRITICAL' },
  { name: 'MongoDB Connection String', pattern: /mongodb(?:\+srv)?:\/\/[^:]+:[^@]+@[^\s"']+/, severity: 'CRITICAL' },
  { name: 'Redis Connection String', pattern: /redis:\/\/[^:]*:[^@]+@[^\s"']+/, severity: 'CRITICAL' },
  { name: 'Private Key', pattern: /-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/, severity: 'CRITICAL' },
  { name: 'JWT Token', pattern: /eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/, severity: 'HIGH' },
  { name: 'Generic API Key Assignment', pattern: /(?:api[_-]?key|apikey|api_secret|secret_key)\s*[:=]\s*["'][A-Za-z0-9_-]{20,}["']/i, severity: 'HIGH' },
  { name: 'Password Assignment', pattern: /(?:password|passwd|pwd)\s*[:=]\s*["'][^"']{8,}["']/i, severity: 'HIGH' },
  { name: 'Bearer Token', pattern: /[Bb]earer\s+[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/, severity: 'HIGH' },
  { name: 'NEXT_PUBLIC with Secret', pattern: /NEXT_PUBLIC_[A-Z_]*(?:SECRET|KEY|PASSWORD|TOKEN|CREDENTIAL)/, severity: 'CRITICAL' },
];

const SKIP_DIRS = new Set(['node_modules', '.git', '.next', 'dist', 'build', '.turbo', 'coverage', '.cache']);
const SKIP_FILES = new Set(['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml']);
const REAL_ENV_FILES = new Set(['.env', '.env.local', '.env.development', '.env.production', '.env.staging', '.env.test', '.env.dev', '.env.prod', '.env.development.local', '.env.production.local', '.env.test.local', '.env.staging.local']);
const ENV_TEMPLATE_FILES = new Set(['.env.example', '.env.sample', '.env.template', '.env.defaults']);
const SCAN_EXTENSIONS = new Set(['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs', '.json', '.yaml', '.yml', '.toml', '.md', '.txt', '.sh', '.bash']);

const SENSITIVE_VAR_PATTERNS = [/.*SECRET.*/i, /.*KEY.*/i, /.*TOKEN.*/i, /.*PASSWORD.*/i, /.*CREDENTIAL.*/i, /.*AUTH.*/i, /.*API_KEY.*/i, /.*PRIVATE.*/i, /DATABASE_URL/, /REDIS_URL/, /MONGODB_URI/, /.*_URI$/, /.*_DSN$/, /AWS_.*/, /STRIPE_.*/, /OPENAI_.*/, /ANTHROPIC_.*/];

function isSensitiveVar(name) {
  return SENSITIVE_VAR_PATTERNS.some((p) => p.test(name.toUpperCase()));
}

function shouldSkip(filePath, includeEnvFiles) {
  const parts = filePath.split(/[/\\]/);
  if (parts.some((p) => SKIP_DIRS.has(p))) return true;
  const name = basename(filePath);
  if (SKIP_FILES.has(name)) return true;
  if (REAL_ENV_FILES.has(name) && !includeEnvFiles) return true;
  if (ENV_TEMPLATE_FILES.has(name)) return true;
  const ext = extname(filePath);
  if (ext && !SCAN_EXTENSIONS.has(ext)) return true;
  return false;
}

function mask(text) {
  return text.length > 20 ? text.slice(0, 10) + '...' + text.slice(-5) : text.slice(0, 5) + '...';
}

function scanFile(filePath) {
  const findings = [];
  let content;
  try { content = readFileSync(filePath, 'utf8'); } catch { return findings; }
  const lines = content.split('\n');
  lines.forEach((line, i) => {
    for (const p of SECRET_PATTERNS) {
      const m = p.pattern.exec(line);
      if (m) {
        findings.push({ severity: p.severity, category: p.name, file: filePath, line: i + 1, match: mask(m[0]), description: `Potential ${p.name} detected` });
      }
    }
  });
  return findings;
}

function analyzeEnvTemplate(filePath) {
  let content;
  try { content = readFileSync(filePath, 'utf8'); } catch { return null; }
  const lines = content.split('\n');
  const variables = [], missingDescriptions = [], sensitiveVars = [], suggestions = [];
  let prevLineComment = false;
  for (const line of lines) {
    const stripped = line.trim();
    if (stripped.startsWith('#')) { prevLineComment = true; continue; }
    if (stripped.includes('=') && !stripped.startsWith('#')) {
      const varName = stripped.split('=')[0].trim();
      const varValue = stripped.split('=').slice(1).join('=').trim();
      if (varName) {
        variables.push(varName);
        if (isSensitiveVar(varName)) {
          sensitiveVars.push(varName);
          if (varValue && !/(your_|xxx|placeholder|changeme|example|replace|todo|fill|<|>|insert)/i.test(varValue) && varValue.length > 10) {
            suggestions.push(`${varName}: Value looks like a real secret. Use a placeholder like 'your_${varName.toLowerCase()}_here'`);
          }
          if (!prevLineComment) missingDescriptions.push(varName);
        }
      }
    }
    prevLineComment = false;
  }
  return { file: filePath, variables, missingDescriptions, sensitiveVars, suggestions: suggestions.slice(0, 5) };
}

function findEnvTemplates(rootDir) {
  const templates = [];
  function walk(dir) {
    let entries;
    try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const entry of entries) {
      const full = join(dir, entry.name);
      if (entry.isDirectory() && !SKIP_DIRS.has(entry.name)) walk(full);
      else if (entry.isFile() && ENV_TEMPLATE_FILES.has(entry.name)) templates.push(full);
    }
  }
  walk(rootDir);
  return templates;
}

function scanDir(rootDir, includeEnvFiles) {
  const findings = [];
  function walk(dir) {
    let entries;
    try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const entry of entries) {
      const full = join(dir, entry.name);
      if (entry.isDirectory() && !SKIP_DIRS.has(entry.name)) walk(full);
      else if (entry.isFile() && !shouldSkip(full, includeEnvFiles)) {
        findings.push(...scanFile(full));
      }
    }
  }
  walk(rootDir);
  return findings;
}

const { values, positionals } = parseArgs({
  args: process.argv.slice(2),
  options: {
    json: { type: 'boolean', default: false },
    'exit-code': { type: 'boolean', default: false },
    'include-env-files': { type: 'boolean', default: false },
    'skip-env-analysis': { type: 'boolean', default: false },
  },
  allowPositionals: true,
});

const targetPath = positionals[0] || '.';
process.stderr.write(`${BLUE}Scanning ${targetPath} for secrets...${RESET}\n`);
if (!values['include-env-files']) process.stderr.write(`${BLUE}(Skipping real .env files - use --include-env-files to scan them)${RESET}\n\n`);

const findings = scanDir(targetPath, values['include-env-files']);
const envAnalyses = values['skip-env-analysis'] ? [] : findEnvTemplates(targetPath).map(analyzeEnvTemplate).filter(Boolean);

if (values.json) {
  console.log(JSON.stringify({ secrets: findings, env_templates: envAnalyses }, null, 2));
} else {
  console.log(`\n${BLUE}========================================${RESET}`);
  console.log(`${BLUE}  Secret Scan Results${RESET}`);
  console.log(`${BLUE}========================================${RESET}\n`);

  if (!findings.length) {
    console.log(`${GREEN}No secrets detected in source code!${RESET}`);
  } else {
    const critical = findings.filter((f) => f.severity === 'CRITICAL');
    const high = findings.filter((f) => f.severity === 'HIGH');
    console.log(`Total findings: ${findings.length}`);
    console.log(`  ${RED}Critical: ${critical.length}${RESET}`);
    console.log(`  ${YELLOW}High: ${high.length}${RESET}\n`);
    const order = ['CRITICAL', 'HIGH', 'MEDIUM'];
    for (const f of [...findings].sort((a, b) => order.indexOf(a.severity) - order.indexOf(b.severity))) {
      const color = f.severity === 'CRITICAL' ? RED : f.severity === 'HIGH' ? YELLOW : RESET;
      console.log(`${color}[${f.severity}] ${f.category}${RESET}`);
      console.log(`  File: ${f.file}:${f.line}`);
      console.log(`  Match: ${f.match}\n`);
    }
  }

  if (envAnalyses.length) {
    console.log(`\n${CYAN}========================================${RESET}`);
    console.log(`${CYAN}  Environment Template Analysis${RESET}`);
    console.log(`${CYAN}========================================${RESET}\n`);
    for (const a of envAnalyses) {
      console.log(`${BLUE}File: ${a.file}${RESET}`);
      console.log(`  Total variables: ${a.variables.length}`);
      console.log(`  Sensitive variables: ${a.sensitiveVars.length}`);
      if (a.sensitiveVars.length) { console.log(`\n  ${YELLOW}Sensitive variables:${RESET}`); a.sensitiveVars.forEach((v) => console.log(`    - ${v}`)); }
      if (a.missingDescriptions.length) { console.log(`\n  ${YELLOW}Missing descriptions:${RESET}`); a.missingDescriptions.slice(0, 5).forEach((v) => console.log(`    - ${v}`)); }
      if (a.suggestions.length) { console.log(`\n  ${BLUE}Suggestions:${RESET}`); a.suggestions.forEach((s) => console.log(`    - ${s}`)); }
      console.log('');
    }
  }
}

if (values['exit-code'] && findings.filter((f) => ['CRITICAL', 'HIGH'].includes(f.severity)).length > 0) {
  process.exit(1);
}
