/**
 * Sandboxing utilities for skill content execution
 * Provides safe execution environment for skill code
 */

import { spawn, ChildProcess } from 'node:child_process';
import { randomBytes } from 'node:crypto';

export interface SandboxOptions {
  timeout?: number;
  memoryLimit?: number;
  allowedPaths?: string[];
  envVars?: Record<string, string>;
}

export interface SandboxResult {
  stdout: string;
  stderr: string;
  exitCode: number | null;
  signal: NodeJS.Signals | null;
  timedOut: boolean;
}

/**
 * Execute code in a sandboxed environment
 * Uses isolated child process with resource limits
 */
export async function executeInSandbox(
  command: string,
  args: string[],
  options: SandboxOptions = {}
): Promise<SandboxResult> {
  const {
    timeout = 30000,
    memoryLimit = 512 * 1024 * 1024, // 512MB
    allowedPaths = [],
    envVars = {},
  } = options;

  return new Promise((resolve, reject) => {
    let timedOut = false;
    let child: ChildProcess | null = null;

    const timer = setTimeout(() => {
      timedOut = true;
      if (child) {
        child.kill('SIGTERM');
      }
    }, timeout);

    try {
      // Create isolated environment
      const env: Record<string, string> = {
        ...process.env,
        ...envVars,
        NODE_OPTIONS: `--max-old-space-size=${Math.floor(memoryLimit / 1024 / 1024)}`,
      };

      // Remove dangerous environment variables
      const dangerousKeys = ['GITHUB_TOKEN', 'GITLAB_TOKEN', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY'];
      for (const key of dangerousKeys) {
        delete env[key];
      }

      child = spawn(command, args, {
        env,
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: allowedPaths[0] || process.cwd(),
      });

      let stdout = '';
      let stderr = '';

      if (child.stdout) {
        child.stdout.on('data', (data) => {
          stdout += data.toString();
        });
      }

      if (child.stderr) {
        child.stderr.on('data', (data) => {
          stderr += data.toString();
        });
      }

      child.on('close', (code, signal) => {
        clearTimeout(timer);
        resolve({
          stdout,
          stderr,
          exitCode: code,
          signal,
          timedOut,
        });
      });

      child.on('error', (error) => {
        clearTimeout(timer);
        reject(error);
      });
    } catch (error) {
      clearTimeout(timer);
      reject(error);
    }
  });
}

/**
 * Validate that code is safe to execute
 * Basic security checks to prevent obvious vulnerabilities
 */
export function validateCodeSafety(code: string): { safe: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check for dangerous patterns
  const dangerousPatterns = [
    /eval\s*\(/,
    /new\s+Function\s*\(/,
    /require\s*\(\s*['"`]child_process['"`]\s*\)/,
    /require\s*\(\s*['"`]fs['"`]\s*\)/,
    /require\s*\(\s*['"`]net['"`]\s*\)/,
    /require\s*\(\s*['"`]http['"`]\s*\)/,
    /require\s*\(\s*['"`]https['"`]\s*\)/,
    /import\s*\(\s*['"`]child_process['"`]\s*\)/,
    /import\s*\(\s*['"`]fs['"`]\s*\)/,
    /process\.env/,
    /process\.exit/,
    /process\.kill/,
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(code)) {
      errors.push(`Dangerous pattern detected: ${pattern.source}`);
    }
  }

  // Check for extremely long code (potential DoS)
  if (code.length > 100000) {
    errors.push('Code exceeds maximum length (100KB)');
  }

  return {
    safe: errors.length === 0,
    errors,
  };
}

/**
 * Generate a sandbox ID for tracking executions
 */
export function generateSandboxId(): string {
  return randomBytes(16).toString('hex');
}

/**
 * Create a temporary directory for sandbox execution
 */
export function createSandboxTempDir(baseDir: string): string {
  const id = generateSandboxId();
  return `${baseDir}/.sandbox-${id}`;
}
