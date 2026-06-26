import type { Result } from './types.js';

export class AppError extends Error {
  readonly code: string;
  readonly path: string | undefined;
  readonly cause: unknown | undefined;

  constructor(opts: { code: string; message: string; cause?: unknown; path?: string }) {
    super(opts.message);
    this.name = 'AppError';
    this.code = opts.code;
    this.path = opts.path;
    this.cause = opts.cause;
  }
}

export class ValidationError extends AppError {
  constructor(message: string, opts?: { path?: string; cause?: unknown }) {
    super({ code: 'VALIDATION', message, ...opts });
    this.name = 'ValidationError';
  }
}

export function ok<T, E = AppError>(value: T): Result<T, E> {
  return { ok: true, value };
}

export function fail<T, E = AppError>(error: E): Result<T, E> {
  return { ok: false, error };
}
