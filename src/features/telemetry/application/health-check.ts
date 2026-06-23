// Purpose: Health check use case for telemetry server.
// Layer: application
// Depends on: nothing

export function runHealthCheck(): { ok: true } {
  return { ok: true };
}
