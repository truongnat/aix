#!/usr/bin/env node
/**
 * Security Pattern Scanner for Next.js/TypeScript Projects
 * Detects common vulnerability patterns based on OWASP guidelines.
 *
 * Usage:
 *   node pattern-scanner.js [path] [--json] [--category xss] [--exit-code]
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { parseArgs } from 'node:util';

const RESET = '\x1b[0m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const GREEN = '\x1b[32m';
const BLUE = '\x1b[34m';
const CYAN = '\x1b[36m';

const VULNERABILITY_PATTERNS = {
  XSS: [
    {
      name: 'dangerouslySetInnerHTML',
      pattern: /dangerouslySetInnerHTML\s*=\s*\{/,
      severity: 'HIGH',
      description: 'dangerouslySetInnerHTML can lead to XSS if used with unsanitized input',
      recommendation: 'Use DOMPurify to sanitize HTML: dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}',
    },
    {
      name: 'innerHTML assignment',
      pattern: /\.innerHTML\s*=/,
      severity: 'HIGH',
      description: 'Direct innerHTML assignment can lead to XSS',
      recommendation: 'Use textContent for plain text, or DOMPurify.sanitize() for HTML',
    },
    {
      name: 'outerHTML assignment',
      pattern: /\.outerHTML\s*=/,
      severity: 'HIGH',
      description: 'Direct outerHTML assignment can lead to XSS',
      recommendation: 'Avoid outerHTML with user input; use safe DOM manipulation methods',
    },
    {
      name: 'document.write',
      pattern: /document\.write(?:ln)?\s*\(/,
      severity: 'HIGH',
      description: 'document.write can lead to XSS and is deprecated',
      recommendation: 'Use safe DOM manipulation methods instead',
    },
    {
      name: 'eval() usage',
      pattern: /\beval\s*\(/,
      severity: 'CRITICAL',
      description: 'eval() executes arbitrary code and is extremely dangerous',
      recommendation: 'Never use eval(); use JSON.parse() for JSON or safer alternatives',
    },
    {
      name: 'new Function()',
      pattern: /new\s+Function\s*\(/,
      severity: 'CRITICAL',
      description: 'new Function() is equivalent to eval() and executes arbitrary code',
      recommendation: 'Avoid dynamic code execution; use safer alternatives',
    },
  ],
  Injection: [
    {
      name: 'SQL string concatenation',
      pattern: /(SELECT|INSERT|UPDATE|DELETE|DROP)\s+.*\$\{/i,
      severity: 'CRITICAL',
      description: 'SQL query with template literal - potential SQL injection',
      recommendation: 'Use parameterized queries or ORM methods',
    },
    {
      name: 'Raw SQL query',
      pattern: /\$queryRaw\s*`[^`]*\$\{/,
      severity: 'HIGH',
      description: 'Prisma $queryRaw with interpolation - potential SQL injection',
      recommendation: 'Use Prisma.sql template tag: $queryRaw(Prisma.sql`...`)',
    },
    {
      name: 'exec with variable',
      pattern: /exec(?:Sync)?\s*\([^)]*\$\{/,
      severity: 'CRITICAL',
      description: 'Command execution with interpolated variable - command injection risk',
      recommendation: 'Use execFile() or spawn() with array arguments instead',
    },
    {
      name: 'spawn with shell',
      pattern: /spawn\s*\([^)]*shell\s*:\s*true/,
      severity: 'HIGH',
      description: 'spawn() with shell: true is vulnerable to command injection',
      recommendation: 'Remove shell: true and pass arguments as array',
    },
  ],
  Authentication: [
    {
      name: 'Server Action without auth',
      pattern: /['"]use server['"]\s*\n\s*\n?\s*export\s+(?:async\s+)?function/,
      severity: 'MEDIUM',
      description: 'Server Action may be missing authentication check',
      recommendation: 'Add auth() or getSession() check at the start of Server Actions',
    },
    {
      name: 'JWT decode without verify',
      pattern: /jwt\.decode\s*\(/,
      severity: 'HIGH',
      description: 'jwt.decode() does not verify signature - use jwt.verify() instead',
      recommendation: 'Always use jwt.verify() with proper secret/key verification',
    },
    {
      name: 'Weak password check',
      pattern: /password\.length\s*[<>=]+\s*[1-7]\b/,
      severity: 'MEDIUM',
      description: 'Password length requirement is too weak',
      recommendation: 'Require minimum 12 characters and use zxcvbn for strength checking',
    },
  ],
  NextJS: [
    {
      name: 'NEXT_PUBLIC secret exposure',
      pattern: /NEXT_PUBLIC_[A-Z_]*(SECRET|KEY|PASSWORD|TOKEN|CREDENTIAL|DATABASE)/,
      severity: 'CRITICAL',
      description: 'Sensitive variable exposed to client via NEXT_PUBLIC_ prefix',
      recommendation: 'Remove NEXT_PUBLIC_ prefix; keep secrets server-side only',
    },
    {
      name: 'Unrestricted image domains',
      pattern: /remotePatterns\s*:\s*\[\s*\{[^}]*hostname\s*:\s*['"]?\*\*?['"]?/,
      severity: 'MEDIUM',
      description: 'Image optimization allows any remote domain',
      recommendation: 'Restrict remotePatterns to specific trusted domains',
    },
    {
      name: 'Missing allowed origins',
      pattern: /serverActions\s*:\s*\{(?![^}]*allowedOrigins)/,
      severity: 'LOW',
      description: 'Server Actions may benefit from allowedOrigins configuration',
      recommendation: 'Configure serverActions.allowedOrigins for CSRF protection',
    },
  ],
  Cryptography: [
    {
      name: 'MD5 hashing',
      pattern: /createHash\s*\(\s*['"]md5['"]\s*\)/,
      severity: 'HIGH',
      description: 'MD5 is cryptographically broken - do not use for security',
      recommendation: 'Use SHA-256 or bcrypt for passwords',
    },
    {
      name: 'SHA1 hashing',
      pattern: /createHash\s*\(\s*['"]sha1['"]\s*\)/,
      severity: 'MEDIUM',
      description: 'SHA1 is deprecated for security purposes',
      recommendation: 'Use SHA-256 or stronger',
    },
    {
      name: 'Hardcoded encryption key',
      pattern: /(?:encrypt|decrypt|createCipher)\s*\([^)]*['"][A-Za-z0-9]{16,}['"]/,
      severity: 'CRITICAL',
      description: 'Hardcoded encryption key detected',
      recommendation: 'Store encryption keys in environment variables',
    },
  ],
  Redirect: [
    {
      name: 'Open redirect',
      pattern: /redirect\s*\(\s*req\.(?:query|params|body)/,
      severity: 'MEDIUM',
      description: 'Redirect with user-controlled input - potential open redirect',
      recommendation: 'Validate redirect URLs against allowlist of trusted domains',
    },
    {
      name: 'Location assignment',
      pattern: /(?:window\.)?location(?:\.href)?\s*=\s*[^;]*req\./,
      severity: 'MEDIUM',
      description: 'Location assignment with request data - potential open redirect',
      recommendation: 'Validate URLs before redirecting',
    },
  ],
  Logging: [
    {
      name: 'Password in logs',
      pattern: /console\.(?:log|info|debug|warn|error)\s*\([^)]*password/i,
      severity: 'HIGH',
      description: 'Potential password logging detected',
      recommendation: 'Never log sensitive data like passwords',
    },
    {
      name: 'Token in logs',
      pattern: /console\.(?:log|info|debug|warn|error)\s*\([^)]*token/i,
      severity: 'MEDIUM',
      description: 'Potential token logging detected',
      recommendation: 'Avoid logging authentication tokens',
    },
    {
      name: 'Error stack exposure',
      pattern: /res\.(?:json|send)\s*\([^)]*error\.(?:stack|message)/,
      severity: 'MEDIUM',
      description: 'Error details may be exposed to client',
      recommendation: 'Return generic error messages; log details server-side',
    },
  ],
};

const SKIP_DIRS = new Set(['node_modules', '.git', '.next', 'dist', 'build', '.turbo', 'coverage', '.cache']);
const SCAN_EXTENSIONS = new Set(['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs']);

function shouldSkip(filePath) {
  const parts = filePath.split(/[/\\]/);
  return parts.some((p) => SKIP_DIRS.has(p)) || !SCAN_EXTENSIONS.has(extname(filePath));
}

function scanFile(filePath, categoryFilter) {
  const findings = [];
  let content;
  try {
    content = readFileSync(filePath, 'utf8');
  } catch {
    return findings;
  }
  const lines = content.split('\n');
  for (const [category, patterns] of Object.entries(VULNERABILITY_PATTERNS)) {
    if (categoryFilter && !categoryFilter.includes(category.toLowerCase())) continue;
    for (const p of patterns) {
      lines.forEach((line, i) => {
        if (p.pattern.test(line)) {
          findings.push({
            severity: p.severity,
            category,
            subcategory: p.name,
            file: filePath,
            line: i + 1,
            code: line.trim().slice(0, 100),
            description: p.description,
            recommendation: p.recommendation,
          });
        }
      });
    }
  }
  return findings;
}

function scanDir(rootDir, categoryFilter) {
  const findings = [];
  let filesScanned = 0;
  const severityCount = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, INFO: 0 };

  function walk(dir) {
    let entries;
    try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const entry of entries) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name)) walk(full);
      } else if (entry.isFile() && !shouldSkip(full)) {
        filesScanned++;
        for (const f of scanFile(full, categoryFilter)) {
          severityCount[f.severity] = (severityCount[f.severity] || 0) + 1;
          findings.push(f);
        }
      }
    }
  }
  walk(rootDir);
  return { findings, filesScanned, severityCount };
}

function printFindings({ findings, filesScanned, severityCount }, asJson) {
  if (asJson) {
    console.log(JSON.stringify({ stats: { filesScanned, severityCount }, findings }, null, 2));
    return;
  }

  console.log(`\n${BLUE}========================================${RESET}`);
  console.log(`${BLUE}  Security Pattern Scan Results${RESET}`);
  console.log(`${BLUE}========================================${RESET}\n`);
  console.log(`Files scanned: ${filesScanned}`);
  console.log(`Total findings: ${findings.length}`);
  console.log(`  ${RED}Critical: ${severityCount.CRITICAL}${RESET}`);
  console.log(`  ${YELLOW}High: ${severityCount.HIGH}${RESET}`);
  console.log(`  ${CYAN}Medium: ${severityCount.MEDIUM}${RESET}`);
  console.log(`  Low: ${severityCount.LOW || 0}`);
  console.log(`  Info: ${severityCount.INFO || 0}`);

  if (!findings.length) {
    console.log(`\n${GREEN}No security issues detected!${RESET}`);
    return;
  }

  const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, INFO: 4 };
  const sorted = [...findings].sort((a, b) => (order[a.severity] ?? 5) - (order[b.severity] ?? 5));
  let lastCategory = null;
  for (const f of sorted) {
    if (f.category !== lastCategory) {
      lastCategory = f.category;
      console.log(`\n${BLUE}--- ${f.category} ---${RESET}\n`);
    }
    const color = f.severity === 'CRITICAL' ? RED : f.severity === 'HIGH' ? YELLOW : f.severity === 'MEDIUM' ? CYAN : RESET;
    console.log(`${color}[${f.severity}] ${f.subcategory}${RESET}`);
    console.log(`  File: ${f.file}:${f.line}`);
    console.log(`  Code: ${f.code}`);
    console.log(`  Risk: ${f.description}`);
    console.log(`  Fix:  ${f.recommendation}\n`);
  }
}

const { values, positionals } = parseArgs({
  args: process.argv.slice(2),
  options: {
    json: { type: 'boolean', default: false },
    'exit-code': { type: 'boolean', default: false },
    category: { type: 'string', multiple: true },
  },
  allowPositionals: true,
});

const targetPath = positionals[0] || '.';
const categoryFilter = values.category?.map((c) => c.toLowerCase()) ?? null;

process.stderr.write(`${BLUE}Scanning ${targetPath} for security patterns...${RESET}\n\n`);
const result = scanDir(targetPath, categoryFilter);
printFindings(result, values.json);

if (values['exit-code'] && (result.severityCount.CRITICAL > 0 || result.severityCount.HIGH > 0)) {
  process.exit(1);
}
