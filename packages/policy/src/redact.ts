export interface Finding {
  readonly type: 'secret' | 'pii';
  readonly subtype: string;
  readonly span: readonly [number, number];
}

export interface RedactResult {
  readonly clean: string;
  readonly findings: readonly Finding[];
}

const REDACT_REPLACEMENT = '••••';

interface PatternDef {
  type: Finding['type'];
  subtype: string;
  regex: RegExp;
}

const SENSITIVE_KEY = /(?:password|passwd|secret|token|api[_-]?key|auth[_-]?token|access[_-]?token|bearer)/i;
// Env-style references (${VAR}, $VAR) name a secret without holding it, so they stay readable.
const SECRET_REFERENCE = /^\$\{?[A-Za-z_][A-Za-z0-9_]*\}?$/;

const PATTERNS: PatternDef[] = [
  // Quoted JSON/YAML value under a sensitive key; lookbehind keeps the key and quotes intact.
  { type: 'secret', subtype: 'json-key-value', regex: /(?<=["']?[\w-]*(?:password|passwd|secret|token|api[_-]?key|auth[_-]?token|access[_-]?token)[\w-]*["']?\s*[:=]\s*["'])[^"'\n]+(?=["'])/gi },
  { type: 'secret', subtype: 'api-key', regex: /(?:api[_-]?key|apikey|api[_-]?secret)[=:]\s*['"]?([a-zA-Z0-9_\-]{16,64})['"]?/gi },
  { type: 'secret', subtype: 'bearer-token', regex: /(?:Bearer\s+)([a-zA-Z0-9_\-.\+=]{20,2048})/g },
  { type: 'secret', subtype: 'jwt', regex: /eyJ[a-zA-Z0-9_\-]+\.eyJ[a-zA-Z0-9_\-]+\.[a-zA-Z0-9_\-]+/g },
  { type: 'secret', subtype: 'aws-key', regex: /(?:AKIA|ASIA)[a-zA-Z0-9_\-]{16,}/g },
  { type: 'secret', subtype: 'github-token', regex: /gh[pousr]_[a-zA-Z0-9_\-]{36,}/g },
  { type: 'secret', subtype: 'npm-token', regex: /npm_[a-zA-Z0-9_\-]{36,}/g },
  { type: 'secret', subtype: 'slack-token', regex: /xox[baprs]-[0-9a-zA-Z\-]{10,}/g },
  { type: 'secret', subtype: 'ssh-key', regex: /-----BEGIN\s+(?:RSA|DSA|EC|OPENSSH|PRIVATE)\s+KEY-----[\s\S]+?-----END\s+(?:RSA|DSA|EC|OPENSSH|PRIVATE)\s+KEY-----/g },
  { type: 'secret', subtype: 'pg-connection', regex: /postgres(?:ql)?:\/\/[^:]+:[^@]+@[^\s]+/g },
  { type: 'secret', subtype: 'redis-connection', regex: /redis:\/\/[^:]+:[^@]+@[^\s]+/g },
  { type: 'secret', subtype: 'mongo-connection', regex: /mongodb(?:\+srv)?:\/\/[^:]+:[^@]+@[^\s]+/g },
  { type: 'secret', subtype: 'generic-password', regex: /password[=:]\s*['"]?([^'"\s]{6,})['"]?/gi },
  { type: 'secret', subtype: 'generic-token', regex: /token[=:]\s*['"]?([a-zA-Z0-9_\-\.]{16,})['"]?/gi },
  { type: 'secret', subtype: 'private-key', regex: /private[_-]?key[=:]\s*['"]?([a-zA-Z0-9_\-+\/=]{16,})['"]?/gi },
  { type: 'pii', subtype: 'email', regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g },
  { type: 'pii', subtype: 'ip-address', regex: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g },
  { type: 'pii', subtype: 'phone', regex: /(?<![\w.-])(?:\+\d{1,3}[-.\s]?)?(?:\(\d{3}\)[-.\s]?|\d{3}[-.\s])\d{3}[-.\s]\d{4}(?![\w.-])/g },
  { type: 'pii', subtype: 'ssn', regex: /\b\d{3}-\d{2}-\d{4}\b/g },
  { type: 'pii', subtype: 'credit-card', regex: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g },
];

export function redact(input: string): RedactResult {
  let clean = input;
  const allFindings: Finding[] = [];

  for (const pattern of PATTERNS) {
    const matches: Finding[] = [];
    let m: RegExpExecArray | null;
    const re = new RegExp(pattern.regex.source, pattern.regex.flags);

    while ((m = re.exec(clean)) !== null) {
      matches.push({
        type: pattern.type,
        subtype: pattern.subtype,
        span: [m.index, m.index + m[0].length] as const,
      });
    }

    allFindings.push(...matches);
    clean = clean.replace(re, () => REDACT_REPLACEMENT);
  }

  return { clean: clean, findings: allFindings };
}

/** Redact string values in JSON-shaped data without rewriting keys or scalar types. */
export function redactStrings<T>(value: T): T {
  if (typeof value === 'string') return redact(value).clean as T;
  if (Array.isArray(value)) return value.map(item => redactStrings(item)) as T;
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        typeof item === 'string' && SENSITIVE_KEY.test(key) && !SECRET_REFERENCE.test(item)
          ? '[REDACTED]'
          : redactStrings(item),
      ]),
    ) as T;
  }
  return value;
}
