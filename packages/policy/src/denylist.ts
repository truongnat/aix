import type { Result } from '@x/core';

const DENY_PATTERNS: RegExp[] = [
  // Recursive rm (any flag order: -rf, -fr, -R, -f -r, --recursive) aimed at /, /*, ~, ~/*, $HOME.
  /\brm\s+(?:-{1,2}[\w-]+\s+)*?(?:-[a-zA-Z]*[rR][a-zA-Z]*|--recursive)\s+(?:-{1,2}[\w-]+\s+)*(?:\/|~|\$HOME|\$\{HOME\})\/?\*?(?=\s|$|[;&|])/,
  />\s*\/dev\/sda/,
  /: ?\(\) ?\{.*?:\|:.*?& ?\} ?; ?:?/,
  /mkfs\.\w+/,
  /dd\s+if=\/dev\/zero/,
  /wget\s+.*\|\s*bash/,
  /curl\s+.*\|\s*bash/,
  /chmod\s+-R\s+777\s+\//,
  /chown\s+-R\s+\/:/,
  /\/(etc|usr|var|bin|sbin)\/.*>/,
  /drop\s+table/i,
  /truncate\s+table/i,
  // `\b` alone would still match `reboot-docs`; hyphen/dot neighbours mean a compound word, not the command.
  /(?<![\w.-])(?:halt|reboot|shutdown|poweroff)(?![\w.-])/,
  /init\s+0/,
  // sudo/su anywhere a new command can start, not just at the beginning of the line.
  /(?:^|[;&|(`])\s*(?:sudo|su)(?=\s|$)/,
  /killall/,
  /pkill\s+-9/,
];

const DENY_PREFIXES: string[] = [
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
