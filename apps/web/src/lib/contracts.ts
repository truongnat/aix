export type RiskLevel = "low" | "medium" | "high";
export type GoalType = "delivery" | "bugfix" | "analysis" | "migration";
export type PlanStatus = "draft" | "verified" | "rejected" | "superseded";
export type TaskStatus =
  | "pending"
  | "ready"
  | "running"
  | "verifying"
  | "completed"
  | "failed"
  | "blocked"
  | "skipped";
export type VerificationDecision =
  | "accept"
  | "retry"
  | "repair"
  | "replan"
  | "block_for_human";
export type RunStatus =
  | "idle"
  | "analyzing"
  | "planning"
  | "verifying_plan"
  | "decomposing"
  | "running"
  | "verifying_task"
  | "repairing"
  | "blocked"
  | "completed"
  | "failed"
  | "aborted";

export interface GoalSpec {
  goal_id: string;
  thread_id: string;
  raw_input: string;
  normalized_goal: string;
  goal_type: GoalType;
  constraints: string[];
  success_criteria: string[];
  risk_level: RiskLevel;
  created_at_ms: number;
  updated_at_ms: number;
}

export interface GoalAnalysis {
  goal_id: string;
  summary: string;
  scope_in: string[];
  scope_out: string[];
  repo_signals: string[];
  unknowns: string[];
  recommended_next_action: string;
  created_at_ms: number;
}

export interface PlanDependency {
  from: string;
  to: string;
}

export interface ExecutionPlan {
  plan_id: string;
  goal_id: string;
  title: string;
  summary: string;
  phases: string[];
  tasks: string[];
  dependencies: PlanDependency[];
  acceptance_criteria: string[];
  verification_strategy: string[];
  status: PlanStatus;
  created_at_ms: number;
  updated_at_ms: number;
}

export interface TaskTicket {
  task_id: string;
  plan_id: string;
  phase: string;
  title: string;
  objective: string;
  input_context: string[];
  action_type: "analysis" | "code_change" | "test_run" | "verification" | "git_operation" | "reporting";
  constraints: string[];
  expected_output: string;
  validation_commands: string[];
  done_criteria: string[];
  rollback_strategy: string;
  status: TaskStatus;
  attempt_count: number;
  created_at_ms: number;
  updated_at_ms: number;
}

export interface VerificationResult {
  verification_id: string;
  task_id: string;
  ok: boolean;
  decision: VerificationDecision;
  findings: string[];
  evidence: string[];
  retryable: boolean;
  needs_replan: boolean;
  requires_human: boolean;
  created_at_ms: number;
}

export interface AuditEvent {
  event_id: string;
  run_id: string;
  event_type: string;
  summary: string;
  payload: Record<string, string | number | boolean | null>;
  created_at_ms: number;
}

export interface RunState {
  run_id: string;
  thread_id: string;
  goal_spec: GoalSpec;
  goal_analysis: GoalAnalysis;
  plan: ExecutionPlan;
  task_queue: string[];
  current_task_id: string;
  current_phase: string;
  completed_tasks: string[];
  failed_tasks: string[];
  verification_results: VerificationResult[];
  artifacts: string[];
  audit_events: AuditEvent[];
  status: RunStatus;
  created_at_ms: number;
  updated_at_ms: number;
}
