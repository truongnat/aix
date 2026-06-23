// Purpose: Harness telemetry event shape.
// Layer: domain
// Depends on: nothing

export interface Event {
  type: string;
  [key: string]: unknown;
}
