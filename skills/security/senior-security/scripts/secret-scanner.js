#!/usr/bin/env node
/**
 * Secret Scanner
 * Detects hardcoded secrets, API keys, and credentials in source code.
 *
 * Usage:
 *   node secret-scanner.js /path/to/project
 *   node secret-scanner.js /path/to/file.js
 *   node secret-scanner.js /path/to/project --format json
 *   node secret-scanner.js --list-patterns
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { parseArgs } from 'node:util';

const SECRET_PATTERNS = [
  // Cloud Provider Keys
  { id: 'AWS001', name: 'AWS Access Key ID', description: 'AWS access key identifier', regex: /AKIA[0-9A-Z]{16}/, severity: 'critical', recommendation: 'Use IAM roles or AWS Secrets Manager instead of hardcoded keys' },
  { id: 'AWS002', name: 'AWS Secret Access Key', description: 'AWS secret access key', regex: /(?:aws_secret_access_key|AWS_SECRET_ACCESS_KEY)\s*[:=]\s*["']?[A-Za-z0-9/+=]{40}["']?/i, severity: 'critical', recommendation: 'Use IAM roles or AWS Secrets Manager' },
  { id: 'GCP001', name: 'Google API Key', description: 'Google Cloud API key', regex: /AIza[0-9A-Za-z-_]{35}/, severity: 'high', recommendation: 'Use workload identity or service accounts with minimal permissions' },
  { id: 'GH001', name: 'GitHub Personal Access Token', description: 'GitHub PAT', regex: /ghp_[A-Za-z0-9]{36}/, severity: 'critical', recommendation: 'Use GitHub Actions secrets or environment variables' },
  { id: 'GH002', name: 'GitHub OAuth Token', description: 'GitHub OAuth app token', regex: /gho_[A-Za-z0-9]{36}/, severity: 'critical', recommendation: 'Store in environment variables, never in code' },
  { id: 'GH003', name: 'GitHub App Installation Token', description: 'GitHub App token', regex: /ghs_[A-Za-z0-9]{36}/, severity: 'critical', recommendation: 'Rotate immediately and use environment variables' },

  // API Service Keys
  { id: 'OAI001', name: 'OpenAI API Key', description: 'OpenAI API key', regex: /sk-[A-Za-z0-9]{48}/, severity: 'critical', recommendation: 'Use environment variables: process.env.OPENAI_API_KEY' },
  { id: 'ANT001', name: 'Anthropic API Key', description: 'Anthropic Claude API key', regex: /sk-ant-[A-Za-z0-9-]{95}/, severity: 'critical', recommendation: 'Use environment variables: process.env.ANTHROPIC_API_KEY' },
  { id: 'STR001', name: 'Stripe Secret Key', description: 'Stripe live secret key', regex: /sk_live_[A-Za-z0-9]{24,}/, severity: 'critical', recommendation: 'Use Stripe environment configuration, never hardcode' },
  { id: 'STR002', name: 'Stripe Test Secret Key', description: 'Stripe test secret key', regex: /sk_test_[A-Za-z0-9]{24,}/, severity: 'medium', recommendation: 'Even test keys should use environment variables' },
  { id: 'SLK001', name: 'Slack Bot Token', description: 'Slack bot/app token', regex: /xox[baprs]-[0-9]{10,13}-[0-9]{10,13}[a-zA-Z0-9-]*/, severity: 'critical', recommendation: 'Use Slack app configuration and environment variables' },
  { id: 'SLK002', name: 'Slack Webhook URL', description: 'Slack incoming webhook', regex: /https:\/\/hooks\.slack\.com\/services\/T[A-Z0-9]+\/B[A-Z0-9]+\/[A-Za-z0-9]+/, severity: 'high', recommendation: 'Store webhook URLs in environment variables' },
  { id: 'SG001', name: 'SendGrid API Key', description: 'SendGrid email API key', regex: /SG\.[A-Za-z0-9_-]{22}\.[A-Za-z0-9_-]{43}/, severity: 'critical', recommendation: 'Use environment variables for email service credentials' },
  { id: 'TW001', name: 'Twilio API Key', description: 'Twilio SID or auth token', regex: /AC[0-9a-fA-F]{32}/, severity: 'high', recommendation: 'Use Twilio environment variable configuration' },

  // Database Credentials
  { id: 'DB001', name: 'PostgreSQL Connection String', description: 'PostgreSQL URL with credentials', regex: /postgres(?:ql)?:\/\/[^:]+:[^@]+@[^/\s"']+\/[^\s"']+/, severity: 'critical', recommendation: 'Use DATABASE_URL environment variable; never hardcode credentials' },
  { id: 'DB002', name: 'MySQL Connection String', description: 'MySQL URL with credentials', regex: /mysql:\/\/[^:]+:[^@]+@[^/\s"']+\/[^\s"']+/, severity: 'critical', recommendation: 'Use environment variables for database credentials' },
  { id: 'DB003', name: 'MongoDB Connection String', description: 'MongoDB URI with credentials', regex: /mongodb(?:\+srv)?:\/\/[^:]+:[^@]+@[^\s"']+/, severity: 'critical', recommendation: 'Use MONGODB_URI environment variable' },
  { id: 'DB004', name: 'Redis Connection String', description: 'Redis URL with credentials', regex: /redis:\/\/[^:]*:[^@]+@[^\s"']+/, severity: 'critical', recommendation: 'Use REDIS_URL environment variable' },

  // Cryptographic Material
  { id: 'CRYPT001', name: 'Private Key', description: 'PEM-encoded private key', regex: /-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/, severity: 'critical', recommendation: 'Store private keys in secrets manager, never in code' },
  { id: 'CRYPT002', name: 'Certificate', description: 'PEM-encoded certificate', regex: /-----BEGIN CERTIFICATE-----/, severity: 'medium', recommendation: 'Store certificates in appropriate secret stores' },

  // Generic Patterns
  { id: 'GEN001', name: 'JWT Token', description: 'JSON Web Token', regex: /eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/, severity: 'high', recommendation: 'JWTs in source code indicate hardcoded auth bypass; use proper auth flows' },
  { id: 'GEN002', name: 'Generic API Key', description: 'Generic API key assignment', regex: /(?:api[_-]?key|apikey|api_secret|secret_key)\s*[:=]\s*["'][A-Za-z0-9_\-]{20,}["']/i, severity: 'high', recommendation: 'Use environment variables for all API keys' },
  { id: 'GEN003', name: 'Hardcoded Password', description: 'Password assignment in code', regex: /(?:password|passwd|pwd)\s*[:=]\s*["'][^"']{8,}["']/i, severity: 'high', recommendation: 'Never hardcode passwords; use environment variables or secrets manager' },
  { id: 'GEN004', name: 'Bearer Token', description: 'Hardcoded bearer token', regex: /[Bb]earer\s+[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/, severity: 'high', recommendation: 'Bearer tokens must be dynamic; never hardcode them' },
];

const SKIP_DIRS = new Set(['node_modules', '.git', '.next', 'dist', 'build', '.turbo', 'coverage', '.cache', '__pycache__']);
const SKIP_FILES = new Set(['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml']);

const RESET = '\x1b[0m', RED = '\x1b[31m', YELLOW = '\x1b[33m', GREEN = '\x1b[32m', BLUE = '\x1b[34m', CYAN = '\x1b[36m';

function mask(text) {
  return text.length > 20 ? `${text.slice(0, 8)}...${text.slice(-4)}` : `${text.slice(0, 4)}...`;
}

function scanFile(filePath) {
  const findings = [];
  let content;
  try { content = readFileSync(filePath, 'utf8'); } catch { return findings; }
  const lines = content.split('\n');
  lines.forEach((line, i) => {
    for (const p of SECRET_PATTERNS) {
      const m = p.regex.exec(line);
      if (m) findings.push({ patternId: p.id, name: p.name, severity: p.severity, filePath, lineNumber: i + 1, matchedText: mask(m[0]), recommendation: p.recommendation });
    }
  });
  return findings;
}

function scanTarget(target) {
  const findings = [];
  let stat;
  try { stat = statSync(target); } catch (e) { console.error(`Error: ${e.message}`); process.exit(1); }

  if (stat.isFile()) {
    findings.push(...scanFile(target));
  } else {
    function walk(dir) {
      let entries;
      try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
      for (const entry of entries) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) { if (!SKIP_DIRS.has(entry.name)) walk(full); }
        else if (entry.isFile() && !SKIP_FILES.has(entry.name)) findings.push(...scanFile(full));
      }
    }
    walk(target);
  }
  return findings;
}

const { values, positionals } = parseArgs({
  args: process.argv.slice(2),
  options: {
    format: { type: 'string', default: 'text' },
    'list-patterns': { type: 'boolean', default: false },
  },
  allowPositionals: true,
});

if (values['list-patterns']) {
  console.log('Available secret patterns:\n');
  for (const p of SECRET_PATTERNS) {
    console.log(`  ${p.id.padEnd(12)} ${p.name}`);
    console.log(`              Severity: ${p.severity}`);
    console.log(`              ${p.description}\n`);
  }
  process.exit(0);
}

const target = positionals[0];
if (!target) { console.error('Usage: node secret-scanner.js <path> [--format json|text]'); process.exit(1); }

const findings = scanTarget(target);
const bySeverity = { critical: 0, high: 0, medium: 0, low: 0 };
for (const f of findings) bySeverity[f.severity] = (bySeverity[f.severity] || 0) + 1;

if (values.format === 'json') {
  console.log(JSON.stringify({ summary: bySeverity, findings }, null, 2));
} else {
  console.log(`\n${BLUE}Secret Scan Results${RESET}`);
  console.log(`${'─'.repeat(40)}`);
  console.log(`  ${RED}Critical: ${bySeverity.critical}${RESET}  ${YELLOW}High: ${bySeverity.high}${RESET}  ${CYAN}Medium: ${bySeverity.medium}${RESET}  Low: ${bySeverity.low}`);

  if (!findings.length) {
    console.log(`\n${GREEN}No secrets detected!${RESET}\n`);
  } else {
    const order = ['critical', 'high', 'medium', 'low'];
    for (const f of [...findings].sort((a, b) => order.indexOf(a.severity) - order.indexOf(b.severity))) {
      const color = f.severity === 'critical' ? RED : f.severity === 'high' ? YELLOW : f.severity === 'medium' ? CYAN : RESET;
      console.log(`\n${color}[${f.severity.toUpperCase()}] ${f.name} (${f.patternId})${RESET}`);
      console.log(`  File: ${f.filePath}:${f.lineNumber}`);
      console.log(`  Match: ${f.matchedText}`);
      console.log(`  Fix: ${f.recommendation}`);
    }
    console.log('');
  }
}

if (bySeverity.critical > 0 || bySeverity.high > 0) process.exit(1);
