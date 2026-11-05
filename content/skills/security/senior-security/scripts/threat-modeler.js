#!/usr/bin/env node
/**
 * Threat Modeler
 * Performs STRIDE threat analysis on system components.
 * Generates threat model documentation with risk scores.
 *
 * Usage:
 *   node threat-modeler.js --component "User Authentication"
 *   node threat-modeler.js --component "API Gateway" --assets "user_data,sessions"
 *   node threat-modeler.js --interactive
 *   node threat-modeler.js --list-threats
 */

import { parseArgs } from 'node:util';
import { createInterface } from 'node:readline';

const STRIDE = ['Spoofing', 'Tampering', 'Repudiation', 'Information Disclosure', 'Denial of Service', 'Elevation of Privilege'];

const THREAT_DATABASE = {
  authentication: [
    { category: 'Spoofing', name: 'Credential Theft', description: 'Attacker obtains valid credentials through phishing or theft', attackVector: 'Phishing emails, keyloggers, credential stuffing', impact: 'Full account compromise, data access', likelihood: 4, severity: 5, mitigations: ['Implement multi-factor authentication (MFA)', 'Use phishing-resistant authentication (FIDO2/WebAuthn)', 'Deploy credential monitoring and breach detection', 'Enforce strong password policies with complexity requirements'] },
    { category: 'Spoofing', name: 'Session Hijacking', description: 'Attacker steals or forges session tokens', attackVector: 'XSS, network interception, token theft from storage', impact: 'Impersonation, unauthorized access', likelihood: 3, severity: 5, mitigations: ['Use HttpOnly and Secure cookie flags', 'Implement short session timeouts with refresh tokens', 'Bind sessions to IP/user-agent (with care for mobile)', 'Use SameSite=Strict for CSRF protection'] },
    { category: 'Tampering', name: 'JWT Manipulation', description: 'Attacker modifies JWT claims due to weak validation', attackVector: 'Algorithm confusion attacks (RS256 to HS256), none algorithm', impact: 'Privilege escalation, identity spoofing', likelihood: 2, severity: 5, mitigations: ['Always verify algorithm explicitly', 'Use jwt.verify() not jwt.decode()', 'Implement token blacklisting for logout', 'Set short expiration times (15 min access, 7 day refresh)'] },
    { category: 'Information Disclosure', name: 'Timing Attack on Passwords', description: 'Attacker infers password validity through response timing', attackVector: 'Measuring response time differences for valid vs invalid passwords', impact: 'Username enumeration, account discovery', likelihood: 2, severity: 3, mitigations: ['Use constant-time comparison (crypto.timingSafeEqual)', 'Always hash before comparing', 'Return identical error messages for invalid username/password', 'Add artificial delay on failed attempts'] },
    { category: 'Denial of Service', name: 'Brute Force Attack', description: 'Attacker attempts many passwords to gain access', attackVector: 'Automated password guessing, credential stuffing', impact: 'Account lockout, resource exhaustion', likelihood: 4, severity: 3, mitigations: ['Implement rate limiting on login endpoints', 'Use exponential backoff for failed attempts', 'Deploy CAPTCHA after N failures', 'Alert on anomalous login patterns'] },
  ],
  api: [
    { category: 'Spoofing', name: 'API Key Theft', description: 'Attacker steals API keys from client-side code or logs', attackVector: 'Source code inspection, log analysis, man-in-the-middle', impact: 'Unauthorized API access, quota abuse', likelihood: 3, severity: 4, mitigations: ['Never expose secret keys client-side (use NEXT_PUBLIC_ prefix only for public data)', 'Rotate keys regularly', 'Implement IP allowlisting for sensitive APIs', 'Monitor key usage patterns for anomalies'] },
    { category: 'Tampering', name: 'Request Manipulation', description: 'Attacker modifies API requests to bypass business logic', attackVector: 'Parameter tampering, mass assignment, IDOR', impact: 'Data manipulation, unauthorized actions', likelihood: 3, severity: 4, mitigations: ['Validate all inputs server-side', 'Use allowlists for accepted fields (avoid mass assignment)', 'Implement object-level authorization checks (IDOR prevention)', 'Log all write operations'] },
    { category: 'Repudiation', name: 'Missing Audit Trail', description: 'No record of actions taken via API', attackVector: 'Any API operation without logging', impact: 'Cannot trace security incidents, compliance failures', likelihood: 3, severity: 3, mitigations: ['Log all state-changing operations with user ID, timestamp, payload', 'Use append-only audit log storage', 'Include request ID in all responses', 'Implement log integrity (cryptographic signing)'] },
    { category: 'Denial of Service', name: 'API Rate Limit Bypass', description: 'Attacker circumvents rate limits to exhaust resources', attackVector: 'Distributed requests, header spoofing, algorithm exploitation', impact: 'Service unavailability, cost amplification', likelihood: 3, severity: 4, mitigations: ['Rate limit by user ID (not just IP)', 'Implement token bucket or sliding window algorithms', 'Add global rate limits in addition to per-user limits', 'Use WAF for additional protection'] },
  ],
  data: [
    { category: 'Information Disclosure', name: 'SQL Injection', description: 'Attacker extracts or modifies database content via SQL injection', attackVector: 'Unsanitized query parameters, stored procedures, ORM misuse', impact: 'Full database compromise, data exfiltration', likelihood: 2, severity: 5, mitigations: ['Use parameterized queries or ORM methods exclusively', 'Apply principle of least privilege to database accounts', 'Implement database activity monitoring', 'Sanitize error messages (never expose SQL errors to users)'] },
    { category: 'Information Disclosure', name: 'Sensitive Data Exposure', description: 'Sensitive data transmitted or stored without encryption', attackVector: 'Network interception, log scraping, unauthorized database access', impact: 'Data breach, regulatory fines (GDPR, HIPAA, PCI)', likelihood: 2, severity: 5, mitigations: ['Encrypt sensitive data at rest (AES-256)', 'Enforce TLS 1.2+ in transit', 'Never log sensitive fields (passwords, tokens, PII)', 'Implement data classification and handling policies'] },
    { category: 'Tampering', name: 'Mass Assignment', description: 'Attacker injects unexpected fields into object creation/update', attackVector: 'POST/PUT requests with extra fields that map to privileged properties', impact: 'Privilege escalation, data integrity compromise', likelihood: 3, severity: 4, mitigations: ['Use DTOs/allowlists explicitly selecting allowed fields', 'Never pass raw request bodies to ORM create/update', 'Implement field-level authorization', 'Validate output shape as well as input'] },
  ],
};

function riskLevel(score) {
  if (score >= 20) return 'Critical';
  if (score >= 12) return 'High';
  if (score >= 6) return 'Medium';
  return 'Low';
}

function getThreatsForComponent(component, assets) {
  const lc = component.toLowerCase();
  const keys = Object.keys(THREAT_DATABASE);
  const matched = keys.filter((k) => lc.includes(k) || (assets && assets.some((a) => a.toLowerCase().includes(k))));
  if (!matched.length) return THREAT_DATABASE.api; // default
  return matched.flatMap((k) => THREAT_DATABASE[k]);
}

function printThreatModel(component, assets, threats, format) {
  const scored = threats.map((t) => ({ ...t, riskScore: t.likelihood * t.severity, riskLevel: riskLevel(t.likelihood * t.severity) }));
  scored.sort((a, b) => b.riskScore - a.riskScore);

  if (format === 'json') {
    console.log(JSON.stringify({ component, assets, threats: scored }, null, 2));
    return;
  }

  const RESET = '\x1b[0m', RED = '\x1b[31m', YELLOW = '\x1b[33m', CYAN = '\x1b[36m', BLUE = '\x1b[34m', BOLD = '\x1b[1m';
  console.log(`\n${BOLD}STRIDE Threat Model: ${component}${RESET}`);
  if (assets?.length) console.log(`Assets: ${assets.join(', ')}`);
  console.log(`${'─'.repeat(60)}\n`);

  const byCategory = {};
  for (const t of scored) {
    if (!byCategory[t.category]) byCategory[t.category] = [];
    byCategory[t.category].push(t);
  }

  for (const [category, threats] of Object.entries(byCategory)) {
    console.log(`${BLUE}${category}${RESET}`);
    for (const t of threats) {
      const color = t.riskLevel === 'Critical' ? RED : t.riskLevel === 'High' ? YELLOW : t.riskLevel === 'Medium' ? CYAN : RESET;
      console.log(`  ${color}[${t.riskLevel.toUpperCase()} – Risk ${t.riskScore}] ${t.name}${RESET}`);
      console.log(`    ${t.description}`);
      console.log(`    Attack vector: ${t.attackVector}`);
      console.log(`    Impact: ${t.impact}`);
      console.log(`    Mitigations:`);
      t.mitigations.forEach((m) => console.log(`      • ${m}`));
      console.log('');
    }
  }

  const critical = scored.filter((t) => t.riskLevel === 'Critical').length;
  const high = scored.filter((t) => t.riskLevel === 'High').length;
  console.log(`${BOLD}Summary:${RESET} ${scored.length} threats — ${RED}${critical} Critical${RESET}, ${YELLOW}${high} High${RESET}`);
}

async function runInteractive() {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

  const component = await ask('Component name (e.g. "User Authentication"): ');
  const assetsStr = await ask('Assets to protect (comma-separated, or press Enter to skip): ');
  const assets = assetsStr ? assetsStr.split(',').map((s) => s.trim()) : [];
  const formatChoice = await ask('Output format [text/json]: ');
  rl.close();

  const threats = getThreatsForComponent(component, assets);
  printThreatModel(component, assets, threats, formatChoice.trim() === 'json' ? 'json' : 'text');
}

const { values } = parseArgs({
  args: process.argv.slice(2),
  options: {
    component: { type: 'string' },
    assets: { type: 'string' },
    interactive: { type: 'boolean', default: false },
    'list-threats': { type: 'boolean', default: false },
    format: { type: 'string', default: 'text' },
  },
  allowPositionals: true,
});

if (values['list-threats']) {
  for (const [key, threats] of Object.entries(THREAT_DATABASE)) {
    console.log(`\n${key.toUpperCase()}:`);
    for (const t of threats) console.log(`  [${t.category}] ${t.name} — Risk ${t.likelihood * t.severity}`);
  }
  process.exit(0);
}

if (values.interactive) {
  runInteractive().catch(console.error);
} else if (values.component) {
  const assets = values.assets ? values.assets.split(',').map((s) => s.trim()) : [];
  const threats = getThreatsForComponent(values.component, assets);
  printThreatModel(values.component, assets, threats, values.format);
} else {
  console.error('Usage: node threat-modeler.js --component "Name" [--assets "a,b"] [--interactive] [--list-threats]');
  process.exit(1);
}
