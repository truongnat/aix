import type { Result } from '@x/core';
import { redact } from './redact.js';
import type { RedactResult } from './redact.js';
import { checkShell, auditSkillSource } from './denylist.js';

export class PolicyEngine {
  redact(input: string): RedactResult {
    return redact(input);
  }

  checkShell(command: string): Result<void> {
    return checkShell(command);
  }

  auditSkillSource(dir: string): Result<void> {
    return auditSkillSource(dir);
  }
}
