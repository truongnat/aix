import type { Result } from '@x/core';

const DENY_PATTERNS: RegExp[] = [
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
  /pkill\s+-9/,
];

const DENY_PREFIXES: string[] = [
  'sudo',
  'su ',
  'passwd',
];

export function checkShell(command: string): Result<void> {
  for (const pattern of DENY_PATTERNS) {
    if (pattern.test(command)) {
      return {
        ok: false,
        error: {
          code: 'POLICY',
          message: `Shell command denied: matches dangerous pattern "${pattern}"`,
          cause: undefined,
          path: undefined,
        },
      };
    }
  }

  for (const prefix of DENY_PREFIXES) {
    if (command.trimStart().startsWith(prefix)) {
      return {
        ok: false,
        error: {
          code: 'POLICY',
          message: `Shell command denied: starts with prohibited prefix "${prefix}"`,
          cause: undefined,
          path: undefined,
        },
      };
    }
  }

  return { ok: true, value: undefined };
}

export function auditSkillSource(dir: string): Result<void> {
  if (dir.includes('..') || dir.includes('~')) {
    return {
      ok: false,
      error: {
        code: 'POLICY',
        message: `Skill source path contains prohibited characters: "${dir}"`,
        path: dir,
        cause: undefined,
      },
    };
  }
  return { ok: true, value: undefined };
}
