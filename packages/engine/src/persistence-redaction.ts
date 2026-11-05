import { redact, redactStrings } from '@x/policy';
import type { SessionState } from '@x/core';
import type { EngineState, TaskItem, TicketPlan, VerificationEvidence } from './state.js';

function preserveReference(value: string): string {
  if (redact(value).findings.some(finding => finding.type === 'secret')) {
    throw new Error('Operational reference contains a recognized secret');
  }
  return value;
}

function redactTask(task: TaskItem): TaskItem {
  return { ...redactStrings(task), id: preserveReference(task.id) };
}

/** Sanitize the engine's typed channels; unrelated user data gets ordinary string redaction. */
export function redactEngineChannel(channel: string, value: unknown): unknown {
  if (value === undefined || value === null) return value;
  switch (channel) {
    case 'session': {
      const session = value as SessionState;
      return {
        ...redactStrings(session),
        id: preserveReference(session.id),
        evidence: session.evidence.map(entry => ({
          ...redactStrings(entry),
          ...(entry.ref === undefined ? {} : { ref: preserveReference(entry.ref) }),
        })),
      };
    }
    case 'tasks':
      return (value as readonly TaskItem[]).map(redactTask);
    case 'current':
      return redactTask(value as TaskItem);
    case 'ticketPlans':
      return (value as readonly TicketPlan[]).map(ticket => ({
        ...redactStrings(ticket),
        ticketId: preserveReference(ticket.ticketId),
        files: ticket.files.map(preserveReference),
      }));
    case 'writtenFiles':
      return (value as readonly string[]).map(preserveReference);
    case 'verification': {
      const verification = value as VerificationEvidence;
      return {
        ...redactStrings(verification),
        cwd: preserveReference(verification.cwd),
        files: Object.fromEntries(Object.entries(verification.files).map(([file, hash]) => [
          preserveReference(file), preserveReference(hash),
        ])),
      };
    }
    // LangGraph persists its initial input as a full state on this internal channel.
    case '__start__':
      return redactEngineState(value as EngineState);
    default:
      return redactStrings(value);
  }
}

export function redactEngineState<T extends Partial<EngineState>>(state: T): T {
  return Object.fromEntries(
    Object.entries(state).map(([channel, value]) => [channel, redactEngineChannel(channel, value)]),
  ) as T;
}

export function redactEngineChannels(channels: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(channels).map(([channel, value]) => [channel, redactEngineChannel(channel, value)]),
  );
}
