// Purpose: Write JSON HTTP responses.
// Layer: presentation
// Depends on: node:http

import type { ServerResponse } from "node:http";

export function jsonResponse(
  res: ServerResponse,
  statusCode: number,
  body: Record<string, unknown>
): void {
  res.statusCode = statusCode;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.end(`${JSON.stringify(body, null, 2)}\n`);
}
