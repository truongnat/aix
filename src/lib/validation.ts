/**
 * Input validation utilities for CLI security
 * Prevents path traversal, injection attacks, and invalid inputs
 */

import { resolve, normalize, relative } from 'node:path';

/**
 * Validate a file path to prevent directory traversal attacks
 * Returns the normalized absolute path if safe, throws if unsafe
 */
export function validatePath(input: string, allowedRoot?: string): string {
  if (!input || typeof input !== 'string') {
    throw new Error('Invalid path: must be a non-empty string');
  }

  // Normalize the path
  const normalized = normalize(input);
  
  // Check for path traversal attempts
  if (normalized.includes('..')) {
    throw new Error('Invalid path: path traversal not allowed');
  }

  // Convert to absolute path
  const absolutePath = resolve(normalized);

  // If allowedRoot is specified, ensure the path is within it
  if (allowedRoot) {
    const allowedRootResolved = resolve(allowedRoot);
    const relativePath = normalize(relative(allowedRootResolved, absolutePath));
    
    if (relativePath.startsWith('..')) {
      throw new Error(`Invalid path: must be within ${allowedRoot}`);
    }
  }

  return absolutePath;
}

/**
 * Validate a project directory
 */
export function validateProjectDir(input: string): string {
  return validatePath(input);
}

/**
 * Validate a skill directory name
 * Only allows lowercase letters, numbers, and hyphens
 */
export function validateSkillName(input: string): string {
  if (!input || typeof input !== 'string') {
    throw new Error('Invalid skill name: must be a non-empty string');
  }

  // Kebab-case pattern
  const pattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  if (!pattern.test(input)) {
    throw new Error(
      'Invalid skill name: must be kebab-case (lowercase letters, numbers, hyphens only)'
    );
  }

  return input;
}

/**
 * Validate a query string (for KB search, routing, etc.)
 * Sanitizes to prevent injection attacks
 */
export function validateQuery(input: string): string {
  if (!input || typeof input !== 'string') {
    throw new Error('Invalid query: must be a non-empty string');
  }

  // Remove potential shell metacharacters
  const sanitized = input
    .replace(/[;&|`$()]/g, '')
    .trim();

  if (sanitized.length === 0) {
    throw new Error('Invalid query: empty after sanitization');
  }

  // Limit length
  if (sanitized.length > 10000) {
    throw new Error('Invalid query: too long (max 10000 characters)');
  }

  return sanitized;
}

/**
 * Validate a numeric parameter (e.g., top-k, chunk-size)
 */
export function validateNumber(input: unknown, min: number, max: number, paramName: string): number {
  const num = Number(input);
  
  if (isNaN(num)) {
    throw new Error(`Invalid ${paramName}: must be a number`);
  }

  if (num < min || num > max) {
    throw new Error(`Invalid ${paramName}: must be between ${min} and ${max}`);
  }

  return Math.floor(num); // Ensure integer
}

/**
 * Validate a boolean flag
 */
export function validateBoolean(input: unknown): boolean {
  if (typeof input === 'boolean') return input;
  if (typeof input === 'string') {
    const lower = input.toLowerCase();
    if (lower === 'true' || lower === '1') return true;
    if (lower === 'false' || lower === '0') return false;
  }
  if (typeof input === 'number') {
    return input !== 0;
  }
  
  throw new Error('Invalid boolean value');
}

/**
 * Validate a JSON string
 */
export function validateJSON(input: string): unknown {
  try {
    return JSON.parse(input);
  } catch {
    throw new Error('Invalid JSON: cannot parse');
  }
}

/**
 * Validate a URL (for external references, API endpoints, etc.)
 */
export function validateURL(input: string): string {
  if (!input || typeof input !== 'string') {
    throw new Error('Invalid URL: must be a non-empty string');
  }

  try {
    const url = new URL(input);
    
    // Only allow http/https
    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new Error('Invalid URL: only http and https protocols allowed');
    }

    return input;
  } catch {
    throw new Error('Invalid URL: malformed URL');
  }
}

/**
 * Validate a GitHub repo URL or owner/repo string
 */
export function validateRepo(input: string): string {
  if (!input || typeof input !== 'string') {
    throw new Error('Invalid repo: must be a non-empty string');
  }

  // Accept either URL or owner/repo format
  if (input.includes('/')) {
    // owner/repo format
    const parts = input.split('/');
    if (parts.length !== 2 || parts[0].length === 0 || parts[1].length === 0) {
      throw new Error('Invalid repo: must be owner/repo format');
    }
  } else {
    // Single component - assume it's a repo name in a known context
    if (input.length === 0) {
      throw new Error('Invalid repo: empty string');
    }
  }

  return input;
}
