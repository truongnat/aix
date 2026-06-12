// Purpose: Build anonymized telemetry export payloads.
// Layer: domain
// Depends on: summary.ts, telemetry schema constant

import crypto from "node:crypto";
import { TELEMETRY_SCHEMA_ID } from "../../telemetry/domain/constants";
import type { Summary } from "./summary";

export interface ExportOptions {
  anonymize?: boolean;
  includeFingerprint?: boolean;
}

export interface ExportPayload {
  schema: string;
  generatedAt: string;
  anonymized: boolean;
  aggregate: {
    totalEvents: number;
    skills: Record<string, number>;
    guardBlocks: Record<string, number>;
    guardPasses: Record<string, number>;
    tools: Array<{ command: string; count: number; failures: number }>;
    subagents: Record<string, number>;
  };
  fingerprint?: string;
}

function mapToObject(rows: [string, number][]): Record<string, number> {
  return Object.fromEntries(rows);
}

export function buildAnonymizedExport(summary: Summary, options: ExportOptions = {}): ExportPayload {
  const aggregate = {
    totalEvents: summary.totalEvents,
    skills: mapToObject(summary.skills),
    guardBlocks: mapToObject(summary.guardBlocks),
    guardPasses: mapToObject(summary.guardPasses),
    tools: summary.tools.map((entry) => ({
      command: entry.command,
      count: entry.count,
      failures: entry.failures,
    })),
    subagents: mapToObject(summary.subagents),
  };

  const payload: ExportPayload = {
    schema: TELEMETRY_SCHEMA_ID,
    generatedAt: new Date().toISOString(),
    anonymized: options.anonymize !== false,
    aggregate,
  };

  if (options.includeFingerprint) {
    payload.fingerprint = crypto
      .createHash("sha256")
      .update(JSON.stringify(aggregate))
      .digest("hex")
      .slice(0, 16);
  }

  return payload;
}
