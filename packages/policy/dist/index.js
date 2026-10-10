// src/redact.ts
var REDACT_REPLACEMENT = "\u2022\u2022\u2022\u2022";
var PATTERNS = [
  { type: "secret", subtype: "api-key", regex: /(?:api[_-]?key|apikey|api[_-]?secret)[=:]\s*['"]?([a-zA-Z0-9_\-]{16,64})['"]?/gi },
  { type: "secret", subtype: "bearer-token", regex: /(?:Bearer\s+)([a-zA-Z0-9_\-.\+=]{20,2048})/g },
  { type: "secret", subtype: "jwt", regex: /eyJ[a-zA-Z0-9_\-]+\.eyJ[a-zA-Z0-9_\-]+\.[a-zA-Z0-9_\-]+/g },
  { type: "secret", subtype: "aws-key", regex: /(?:AKIA|ASIA)[a-zA-Z0-9_\-]{16,}/g },
  { type: "secret", subtype: "github-token", regex: /gh[pousr]_[a-zA-Z0-9_\-]{36,}/g },
  { type: "secret", subtype: "npm-token", regex: /npm_[a-zA-Z0-9_\-]{36,}/g },
  { type: "secret", subtype: "slack-token", regex: /xox[baprs]-[0-9a-zA-Z\-]{10,}/g },
  { type: "secret", subtype: "ssh-key", regex: /-----BEGIN\s+(?:RSA|DSA|EC|OPENSSH|PRIVATE)\s+KEY-----[\s\S]+?-----END\s+(?:RSA|DSA|EC|OPENSSH|PRIVATE)\s+KEY-----/g },
  { type: "secret", subtype: "pg-connection", regex: /postgres(?:ql)?:\/\/[^:]+:[^@]+@[^\s]+/g },
  { type: "secret", subtype: "redis-connection", regex: /redis:\/\/[^:]+:[^@]+@[^\s]+/g },
  { type: "secret", subtype: "mongo-connection", regex: /mongodb(?:\+srv)?:\/\/[^:]+:[^@]+@[^\s]+/g },
  { type: "secret", subtype: "generic-password", regex: /password[=:]\s*['"]?([^'"\s]{6,})['"]?/gi },
  { type: "secret", subtype: "generic-token", regex: /token[=:]\s*['"]?([a-zA-Z0-9_\-\.]{16,})['"]?/gi },
  { type: "secret", subtype: "private-key", regex: /private[_-]?key[=:]\s*['"]?([a-zA-Z0-9_\-+\/=]{16,})['"]?/gi },
  { type: "pii", subtype: "email", regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g },
  { type: "pii", subtype: "ip-address", regex: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g },
  { type: "pii", subtype: "phone", regex: /\b\+?\d{1,3}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}\b/g },
  { type: "pii", subtype: "ssn", regex: /\b\d{3}-\d{2}-\d{4}\b/g },
  { type: "pii", subtype: "credit-card", regex: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g }
];
function redact(input) {
  let clean = input;
  const allFindings = [];
  for (const pattern of PATTERNS) {
    const matches = [];
    let m;
    const re = new RegExp(pattern.regex.source, pattern.regex.flags);
    while ((m = re.exec(clean)) !== null) {
      matches.push({
        type: pattern.type,
        subtype: pattern.subtype,
        span: [m.index, m.index + m[0].length]
      });
    }
    allFindings.push(...matches);
    clean = clean.replace(re, () => REDACT_REPLACEMENT);
  }
  return { clean, findings: allFindings };
}

// src/denylist.ts
var DENY_PATTERNS = [
  /rm\s+-rf\s+\//,
  />\s*\/dev\/sda/,
  /:(){ :\|:& };:/,
  /mkfs\.\w+/,
  /dd\s+if=\/dev\/zero/,
  /wget\s+.*\|\s*bash/,
  /curl\s+.*\|\s*bash/,
  /chmod\s+-R\s+777\s+\//,
  /chown\s+-R\s+\/:/,
  /\/(etc|usr|var|bin|sbin)\/.*>/,
  /drop\s+table/i,
  /truncate\s+table/i,
  /shutdown\s+-[rh]/,
  /reboot/,
  /halt/,
  /init\s+0/,
  /poweroff/,
  /killall/,
  /pkill\s+-9/
];
var DENY_PREFIXES = [
  "sudo",
  "su ",
  "passwd"
];
function checkShell(command) {
  for (const pattern of DENY_PATTERNS) {
    if (pattern.test(command)) {
      return {
        ok: false,
        error: {
          code: "POLICY",
          message: `Shell command denied: matches dangerous pattern "${pattern}"`,
          cause: void 0,
          path: void 0
        }
      };
    }
  }
  for (const prefix of DENY_PREFIXES) {
    if (command.trimStart().startsWith(prefix)) {
      return {
        ok: false,
        error: {
          code: "POLICY",
          message: `Shell command denied: starts with prohibited prefix "${prefix}"`,
          cause: void 0,
          path: void 0
        }
      };
    }
  }
  return { ok: true, value: void 0 };
}
function auditSkillSource(dir) {
  if (dir.includes("..") || dir.includes("~")) {
    return {
      ok: false,
      error: {
        code: "POLICY",
        message: `Skill source path contains prohibited characters: "${dir}"`,
        path: dir,
        cause: void 0
      }
    };
  }
  return { ok: true, value: void 0 };
}

// src/policy-engine.ts
var PolicyEngine = class {
  redact(input) {
    return redact(input);
  }
  checkShell(command) {
    return checkShell(command);
  }
  auditSkillSource(dir) {
    return auditSkillSource(dir);
  }
};

// src/browser-redact.ts
function redactBrowserInput(input, opts) {
  let result = input;
  if (opts?.stripCookies !== false) {
    result = result.replace(/Cookie:\s*[^\r\n]+/gi, "Cookie: \u2022\u2022\u2022\u2022");
    result = result.replace(/set-cookie:\s*[^\r\n]+/gi, "Set-Cookie: \u2022\u2022\u2022\u2022");
  }
  if (opts?.stripAuthorization !== false) {
    result = result.replace(/Authorization:\s*[^\r\n]+/gi, "Authorization: \u2022\u2022\u2022\u2022");
    result = result.replace(/Proxy-Authorization:\s*[^\r\n]+/gi, "Proxy-Authorization: \u2022\u2022\u2022\u2022");
  }
  if (opts?.maskPasswordFields !== false) {
    result = result.replace(/(password[^=]*=\s*)([^&\s]+)/gi, "$1\u2022\u2022\u2022\u2022");
    result = result.replace(/(passwd[^=]*=\s*)([^&\s]+)/gi, "$1\u2022\u2022\u2022\u2022");
    result = result.replace(/<input[^>]*type=["']?password["']?[^>]*>/gi, (match) => {
      return match.replace(/\s+value=["'][^"']*["']/i, ' value="\u2022\u2022\u2022\u2022"');
    });
  }
  return result;
}
function redactNetworkLog(log) {
  return log.replace(/Cookie:\s*[^\r\n]+/gi, "Cookie: \u2022\u2022\u2022\u2022").replace(/set-cookie:\s*[^\r\n]+/gi, "Set-Cookie: \u2022\u2022\u2022\u2022").replace(/Authorization:\s*[^\r\n]+/gi, "Authorization: \u2022\u2022\u2022\u2022").replace(/Proxy-Authorization:\s*[^\r\n]+/gi, "Proxy-Authorization: \u2022\u2022\u2022\u2022");
}
function isLoginUrl(url) {
  const loginPatterns = [
    /\/login\b/i,
    /\/signin\b/i,
    /\/sign-in\b/i,
    /\/auth\b/i,
    /\/authenticate\b/i,
    /\/logon\b/i,
    /\/log-in\b/i,
    /\?.*action=login/i,
    /\?.*action=signin/i
  ];
  return loginPatterns.some((p) => p.test(url));
}
export {
  PolicyEngine,
  auditSkillSource,
  checkShell,
  isLoginUrl,
  redact,
  redactBrowserInput,
  redactNetworkLog
};
//# sourceMappingURL=index.js.map