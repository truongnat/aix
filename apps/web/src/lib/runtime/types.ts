import type { GoalAnalysis, GoalSpec, RunState, TaskTicket, VerificationResult } from "@/lib/contracts";
import type { RuntimePersistenceState } from "@/lib/runtime/persistence";

export interface RunSession {
  run: RunState;
  goalSpec: GoalSpec;
  goalAnalysis: GoalAnalysis;
  tasks: TaskTicket[];
  verificationResults: VerificationResult[];
}

export interface RuntimeStoreSnapshot {
  session: RunSession;
  persistence: RuntimePersistenceState;
}

export interface RuntimeServiceMetadata {
  adapterId: string;
  transport: "local_checkpoint" | "remote_runtime";
  capabilities: Array<"hydrate" | "persist" | "dispatch" | "reset">;
}

export interface RuntimeRequestState {
  isHydrating: boolean;
  isDispatching: boolean;
  pendingAction: GoalLifecycleAction["type"] | null;
  lastError: string | null;
}

export type GoalLifecycleAction =
  | { type: "submit_goal"; input: string }
  | { type: "reset_run" }
  | { type: "pause_run" }
  | { type: "resume_run" }
  | { type: "start_task"; taskId: string }
  | { type: "verify_task"; taskId: string }
  | { type: "retry_task"; taskId: string }
  | { type: "approve_repair"; taskId: string }
  | { type: "force_replan" };
