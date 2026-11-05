import { resolve, relative, isAbsolute } from 'node:path';

// Strictly approved test verification command presets
export const ALLOWED_TEST_PRESETS: readonly string[] = [
  'pnpm test',
  'pnpm run test',
  'npm test',
  'npm run test',
  'cargo test',
  'pytest',
  'vitest run',
  'vitest',
  'jest',
  'bun test',
];

// Strictly whitelisted flags that cannot be used to load external code or alter working directories
export const SAFE_TEST_FLAGS: Record<string, true> = {
  '-v': true,
  '--verbose': true,
  '-q': true,
  '--quiet': true,
  '--ci': true,
  '--run': true,
  '--bail': true,
  '--lib': true,
  '--no-color': true,
  '--color': true,
  '--': true,
};

export function validateVerificationCommand(command: string): { ok: true; binaryName: string; args: string[] } | { ok: false; error: string } {
  if (!command || !command.trim()) {
    return { ok: false, error: 'Command must not be empty' };
  }

  // Shell chaining, redirection, and substitution metacharacters
  if (/[\r\n;`$|&><]/.test(command)) {
    return { ok: false, error: 'Command must not contain shell chaining (; | &), redirection (> <), or substitution ($ `)' };
  }

  const parts = command.trim().split(/\s+/);
  const binaryArg = parts[0] ?? '';

  // Reject path separators in binary name - must be bare command from PATH (blocking ./pnpm, /tmp/evil/pnpm)
  if (binaryArg.includes('/') || binaryArg.includes('\\')) {
    return { ok: false, error: `Command binary "${binaryArg}" must not contain path separators. Use bare command name from PATH.` };
  }

  // Match against preset test commands (sort by token count descending so 3-word presets match before 2-word)
  const matchedPreset = ALLOWED_TEST_PRESETS
    .slice()
    .sort((a, b) => b.split(' ').length - a.split(' ').length)
    .find(preset => {
      const len = preset.split(' ').length;
      const candidate = parts.slice(0, len).map(p => p.toLowerCase()).join(' ');
      return candidate === preset;
    });

  if (!matchedPreset) {
    return {
      ok: false,
      error: `Command "${command}" does not match an allowed test runner preset (${ALLOWED_TEST_PRESETS.join(', ')})`,
    };
  }

  // Check remaining arguments: they MUST be either whitelisted safe flags, or safe relative file paths
  const presetTokensCount = matchedPreset.split(' ').length;
  const remainingArgs = parts.slice(presetTokensCount);

  for (const arg of remainingArgs) {
    // Prohibit any flag assignment with '=' (e.g. --prefix=..., --config=..., --eval=...)
    if (arg.includes('=')) {
      return { ok: false, error: `Flag assignment "${arg}" is prohibited in verification commands` };
    }

    if (arg.startsWith('-')) {
      // Must be in safe flag whitelist
      if (!SAFE_TEST_FLAGS[arg.toLowerCase()]) {
        return { ok: false, error: `Flag "${arg}" is not in the safe test runner flag whitelist (${Object.keys(SAFE_TEST_FLAGS).join(', ')})` };
      }
    } else {
      // Must be a relative path strictly within sandbox (no absolute path, no .., no external drive)
      if (arg.startsWith('/') || arg.startsWith('\\') || arg.includes('..') || /^[a-zA-Z]:/.test(arg)) {
        return { ok: false, error: `Target path "${arg}" must be a relative path within the sandbox without parent traversal` };
      }
    }
  }

  return { ok: true, binaryName: binaryArg, args: parts.slice(1) };

}

export function isPathContained(baseDir: string, targetPath: string): boolean {
  const fullPath = resolve(baseDir, targetPath);
  const rel = relative(baseDir, fullPath);
  if (rel.startsWith('..') || isAbsolute(rel)) return false;
  return true;
}

export function isAllowedNavigationUrl(url: string, appHtmlPath: string, isPackaged = false): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'file:') {
      return resolve(parsed.pathname) === resolve(appHtmlPath);
    }
    // Only permit localhost when NOT packaged
    if (!isPackaged) {
      if ((parsed.protocol === 'http:' || parsed.protocol === 'https:') && (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1')) {
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}
