import { isAbsolute, win32 } from 'node:path';
import { ValidationError } from '@x/core';
import { redact } from '@x/policy';
import type { PlannedTask } from './state.js';

export function parseJsonObject(content: string): Record<string, unknown> {
  const text = content.trim();
  const fenced = /^```(?:json)?\s*\n([\s\S]*?)\n```$/i.exec(text);
  let value: unknown;
  try {
    value = JSON.parse(fenced?.[1] ?? text);
  } catch {
    throw new ValidationError('Model response must contain a valid JSON object');
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new ValidationError('Model response must contain a JSON object');
  }
  return value as Record<string, unknown>;
}

export function assertNoSecret(value: string): void {
  if (redact(value).findings.some(finding => finding.type === 'secret')) {
    throw new ValidationError('Generated source or operational reference contains a recognized secret; no output was written');
  }
}

export function validateFilePath(value: unknown): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new ValidationError('Generated file path must be a non-empty string');
  }
  assertNoSecret(value);
  // Require one portable spelling so aliases cannot bypass target/duplicate checks.
  if (isAbsolute(value) || win32.isAbsolute(value) || /^[a-z]:/i.test(value)
    || /[\\\x00-\x1f\x7f]/.test(value)
    || value.split('/').some(part => part === '' || /^\.+$/.test(part))) {
    throw new ValidationError('Generated file path must be relative and stay inside the session sandbox');
  }
  return value;
}

function requiredText(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new ValidationError(`Planned task ${field} must be a non-empty string`);
  }
  return value;
}

function textList(value: unknown, field: string, nonEmpty = false): string[] {
  if (!Array.isArray(value) || (nonEmpty && value.length === 0)) {
    throw new ValidationError(`Planned task ${field} must be ${nonEmpty ? 'a non-empty' : 'an'} array`);
  }
  return value.map(item => requiredText(item, field));
}

export function parsePlannedTasks(value: unknown): PlannedTask[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new ValidationError('Plan must contain non-empty structured tasks');
  }
  const tasks = value.map((item: unknown): PlannedTask => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      throw new ValidationError('Plan task must be an object');
    }
    const task = item as Record<string, unknown>;
    const id = requiredText(task['id'], 'id');
    assertNoSecret(id);
    const dependencies = textList(task['dependencies'], 'dependencies');
    dependencies.forEach(assertNoSecret);
    const files = textList(task['files'], 'files', true).map(validateFilePath);
    if (new Set(files).size !== files.length || new Set(dependencies).size !== dependencies.length) {
      throw new ValidationError('Planned task files and dependencies must be unique');
    }
    if (files.some(file => files.some(other => other.startsWith(`${file}/`)))) {
      throw new ValidationError('Planned task file paths conflict with required directories');
    }
    return {
      id,
      title: requiredText(task['title'], 'title'),
      description: requiredText(task['description'], 'description'),
      dependencies,
      files,
      acceptanceCriteria: textList(task['acceptanceCriteria'], 'acceptanceCriteria', true),
    };
  });
  const ids = new Set(tasks.map(task => task.id));
  if (ids.size !== tasks.length) throw new ValidationError('Plan task IDs must be unique');
  if (tasks.some(task => task.dependencies.some(id => !ids.has(id) || id === task.id))) {
    throw new ValidationError('Plan task dependencies must reference other declared task IDs');
  }
  const resolved = new Set<string>();
  while (resolved.size < tasks.length) {
    const ready = tasks.filter(task => !resolved.has(task.id) && task.dependencies.every(id => resolved.has(id)));
    if (ready.length === 0) throw new ValidationError('Plan task dependencies contain a cycle');
    ready.forEach(task => resolved.add(task.id));
  }
  return tasks;
}
