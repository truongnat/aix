import type {
  AuditEvent,
  ExecutionPlan,
  GoalAnalysis,
  GoalSpec,
  RunState,
  TaskTicket,
  TaskStatus,
  VerificationResult,
  VerificationDecision,
} from "@/lib/contracts";
import type { GoalLifecycleAction, RunSession } from "@/lib/runtime/types";

const DEFAULT_GOAL_INPUT = "/goal rebuild onboarding hardening loop";

function nowMs() {
  return Date.now();
}

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function createAuditEvent(
  runId: string,
  eventType: string,
  summary: string,
  payload: AuditEvent["payload"],
): AuditEvent {
  return {
    event_id: createId("evt"),
    run_id: runId,
    event_type: eventType,
    summary,
    payload,
    created_at_ms: nowMs(),
  };
}

function normalizeGoalInput(input: string) {
  const trimmed = input.trim();
  return trimmed.startsWith("/goal") ? trimmed : `/goal ${trimmed}`;
}

function createGoalSpec(input: string): GoalSpec {
  const timestamp = nowMs();
  const normalizedInput = normalizeGoalInput(input);
  return {
    goal_id: createId("goal"),
    thread_id: "thread-local-ui",
    raw_input: normalizedInput,
    normalized_goal: normalizedInput.replace(/^\/goal\s*/u, "").trim(),
    goal_type: "delivery",
    constraints: [
      "Keep execution under harness supervision.",
      "Prefer minimal scope and explicit verification.",
    ],
    success_criteria: [
      "Goal is transformed into a verified execution plan.",
      "Task lifecycle remains resumable and auditable.",
    ],
    risk_level: "medium",
    created_at_ms: timestamp,
    updated_at_ms: timestamp,
  };
}

function analyzeGoal(spec: GoalSpec): GoalAnalysis {
  return {
    goal_id: spec.goal_id,
    summary:
      "The goal requires a plan-first execution loop where analysis, implementation, and verification remain visible in the local control room.",
    scope_in: ["Goal normalization", "Plan generation", "Task execution loop", "Verification surface"],
    scope_out: ["Deployment workflows", "Marketplace", "Non-local UI surfaces"],
    repo_signals: [
      "docs/LANGGRAPH_REBUILD_PLAN.md",
      "docs/LANGGRAPH_RUNTIME_CONTRACTS.md",
      "apps/web/src/lib/runtime/engine.ts",
    ],
    unknowns: ["Backend adapter is still local-only and not yet connected to a persisted runtime service."],
    recommended_next_action: "create_plan",
    created_at_ms: nowMs(),
  };
}

function createPlan(spec: GoalSpec): ExecutionPlan {
  const timestamp = nowMs();
  return {
    plan_id: createId("plan"),
    goal_id: spec.goal_id,
    title: "Goal loop execution plan",
    summary: `Analyze, execute, verify, and close the goal: ${spec.normalized_goal}`,
    phases: ["analysis", "planning", "execution", "verification"],
    tasks: ["task-analyze", "task-execute", "task-verify"],
    dependencies: [
      { from: "task-analyze", to: "task-execute" },
      { from: "task-execute", to: "task-verify" },
    ],
    acceptance_criteria: spec.success_criteria,
    verification_strategy: ["Doctor gate", "Task verification", "Visible audit trail"],
    status: "verified",
    created_at_ms: timestamp,
    updated_at_ms: timestamp,
  };
}

function createTasks(plan: ExecutionPlan): TaskTicket[] {
  const timestamp = nowMs();
  return [
    {
      task_id: "task-analyze",
      plan_id: plan.plan_id,
      phase: "analysis",
      title: "Analyze goal context",
      objective: "Resolve scope, repo signals, and missing assumptions before execution.",
      input_context: ["GoalSpec", "GoalAnalysis", "Repo signals"],
      action_type: "analysis",
      constraints: ["Do not execute code changes yet."],
      expected_output: "A stable analysis artifact ready for execution.",
      validation_commands: ["doctor", "contract review"],
      done_criteria: ["Scope is explicit", "Unknowns are visible"],
      rollback_strategy: "Re-run analysis and clear pending tasks.",
      status: "completed",
      attempt_count: 1,
      created_at_ms: timestamp,
      updated_at_ms: timestamp,
    },
    {
      task_id: "task-execute",
      plan_id: plan.plan_id,
      phase: "execution",
      title: "Execute controlled task",
      objective: "Run the current implementation step under harness constraints.",
      input_context: ["ExecutionPlan", "TaskTicket", "Harness policy"],
      action_type: "code_change",
      constraints: ["Keep work scoped to the current goal loop."],
      expected_output: "Task result plus explicit execution evidence.",
      validation_commands: ["build", "tests", "harness checks"],
      done_criteria: ["Execution evidence exists", "Task can move to verification"],
      rollback_strategy: "Mark task failed and fall back to repair or replan.",
      status: "running",
      attempt_count: 1,
      created_at_ms: timestamp,
      updated_at_ms: timestamp,
    },
    {
      task_id: "task-verify",
      plan_id: plan.plan_id,
      phase: "verification",
      title: "Verify task result",
      objective: "Decide whether the run can complete, retry, or replan.",
      input_context: ["TaskExecutionReport", "Verification policy"],
      action_type: "verification",
      constraints: ["Do not hide failure states."],
      expected_output: "A verification decision with evidence.",
      validation_commands: ["verification report"],
      done_criteria: ["Decision is explicit", "Next transition is deterministic"],
      rollback_strategy: "Return to execution with retry or repair.",
      status: "pending",
      attempt_count: 0,
      created_at_ms: timestamp,
      updated_at_ms: timestamp,
    },
  ];
}

function createVerificationForTask(task: TaskTicket): VerificationResult {
  const passed = task.attempt_count > 1;
  return {
    verification_id: createId("verify"),
    task_id: task.task_id,
    ok: passed,
    decision: passed ? "accept" : "repair",
    findings: passed
      ? ["Verification passed after the repair loop completed."]
      : ["Execution loop is still mocked locally and needs a concrete runtime adapter."],
    evidence: passed
      ? [
          "The task was retried with an additional execution attempt.",
          "Local runtime state advanced through repair and verification without contract drift.",
        ]
      : [
          "The local control room is running on a client-side reducer, not a persisted LangGraph backend yet.",
        ],
    retryable: !passed,
    needs_replan: false,
    requires_human: false,
    created_at_ms: nowMs(),
  };
}

function createSeedVerification(taskId: string): VerificationResult {
  return {
    verification_id: createId("verify"),
    task_id: taskId,
    ok: false,
    decision: "repair",
    findings: ["The shell is live, but the runtime adapter is still local-only."],
    evidence: [
      "State transitions currently run inside a client-side reducer.",
      "The next phase is to swap the reducer adapter with a persisted runtime service.",
    ],
    retryable: true,
    needs_replan: false,
    requires_human: false,
    created_at_ms: nowMs(),
  };
}

function updateRunState(
  session: RunSession,
  updates: Partial<RunState>,
  event?: AuditEvent,
): RunSession {
  const nextRun: RunState = {
    ...session.run,
    ...updates,
    updated_at_ms: nowMs(),
    audit_events: event ? [event, ...session.run.audit_events] : session.run.audit_events,
  };
  return { ...session, run: nextRun };
}

function updateTask(task: TaskTicket, status: TaskStatus, attemptDelta = 0): TaskTicket {
  return {
    ...task,
    status,
    updated_at_ms: nowMs(),
    attempt_count: task.attempt_count + attemptDelta,
  };
}

function updateVerificationDecision(
  result: VerificationResult,
  decision: VerificationDecision,
  ok: boolean,
  findings: string[],
  evidence: string[],
): VerificationResult {
  return {
    ...result,
    ok,
    decision,
    findings,
    evidence,
  };
}

function statusFromTask(session: RunSession, taskId: string, status: TaskStatus): TaskTicket[] {
  return session.tasks.map((task) =>
    task.task_id === taskId
      ? updateTask(task, status, status === "running" ? 1 : 0)
      : task,
  );
}

function verifyCurrentTask(session: RunSession, taskId: string): RunSession {
  const targetTask = session.tasks.find((task) => task.task_id === taskId);
  if (!targetTask) {
    return session;
  }

  const verification = createVerificationForTask(targetTask);

  if (verification.ok) {
    const tasks: TaskTicket[] = session.tasks.map((task) => {
      if (task.task_id === taskId || task.task_id === "task-verify") {
        return updateTask(task, "completed");
      }
      return task;
    });
    const completedTasks = Array.from(
      new Set([
        ...session.run.completed_tasks,
        ...tasks.filter((task) => task.status === "completed").map((task) => task.task_id),
      ]),
    );
    return {
      ...updateRunState(
        { ...session, tasks, verificationResults: [verification] },
        {
          current_phase: "verification",
          current_task_id: taskId,
          completed_tasks: completedTasks,
          verification_results: [verification],
          status: "completed",
        },
        createAuditEvent(
          session.run.run_id,
          "task_verified",
          `Verified ${taskId} and closed the local run.`,
          { task_id: taskId },
        ),
      ),
      tasks,
      verificationResults: [verification],
    };
  }

  const tasks: TaskTicket[] = session.tasks.map((task) => {
    if (task.task_id === taskId) {
      return updateTask(task, "verifying");
    }
    if (task.task_id === "task-verify") {
      return updateTask(task, "running", Math.max(1 - task.attempt_count, 0));
    }
    return task;
  });
  return {
    ...updateRunState(
      { ...session, tasks },
      {
        current_phase: "verification",
        current_task_id: "task-verify",
        status: "verifying_task",
      },
      createAuditEvent(
        session.run.run_id,
        "task_sent_for_verification",
        `Moved ${taskId} into verification.`,
        { task_id: taskId },
      ),
    ),
    verificationResults: [verification, ...session.verificationResults],
  };
}

function createRunState(
  spec: GoalSpec,
  analysis: GoalAnalysis,
  plan: ExecutionPlan,
  tasks: TaskTicket[],
  verificationResults: VerificationResult[],
  overrides?: Partial<RunState>,
): RunState {
  const runId = createId("run");
  const auditEvents = [
    createAuditEvent(runId, "goal_received", "Accepted a new /goal from the local UI.", {
      goal: spec.normalized_goal,
    }),
    createAuditEvent(runId, "plan_verified", "Generated a verified local execution plan.", {
      plan_id: plan.plan_id,
    }),
  ];

  return {
    run_id: runId,
    thread_id: spec.thread_id,
    goal_spec: spec,
    goal_analysis: analysis,
    plan,
    task_queue: tasks.map((task) => task.task_id),
    current_task_id: tasks[1]?.task_id ?? tasks[0]?.task_id ?? "",
    current_phase: "planning",
    completed_tasks: tasks.filter((task) => task.status === "completed").map((task) => task.task_id),
    failed_tasks: tasks.filter((task) => task.status === "failed").map((task) => task.task_id),
    verification_results: verificationResults,
    artifacts: ["goal spec", "analysis", "verified plan"],
    audit_events: auditEvents,
    status: "running",
    created_at_ms: nowMs(),
    updated_at_ms: nowMs(),
    ...overrides,
  };
}

function createSessionFromGoalInput(input: string, seededVerification = false): RunSession {
  const spec = createGoalSpec(input);
  const analysis = analyzeGoal(spec);
  const plan = createPlan(spec);
  const tasks = createTasks(plan);
  const verification = seededVerification ? [createSeedVerification("task-execute")] : [];
  const run = createRunState(spec, analysis, plan, tasks, verification, {
    current_phase: seededVerification ? "execution" : "planning",
    current_task_id: "task-execute",
    verification_results: verification,
    status: seededVerification ? "verifying_task" : "running",
    artifacts: seededVerification
      ? ["goal spec", "analysis", "verified plan", "local runtime shell"]
      : ["goal spec", "analysis", "verified plan"],
  });

  if (seededVerification) {
    run.audit_events = [
      createAuditEvent(run.run_id, "task_sent_for_verification", "Moved task-execute into verification.", {
        task_id: "task-execute",
      }),
      ...run.audit_events,
    ];
  }

  return {
    run,
    goalSpec: spec,
    goalAnalysis: analysis,
    tasks: seededVerification
      ? tasks.map((task) => {
          if (task.task_id === "task-execute") {
            return updateTask(task, "verifying");
          }
          if (task.task_id === "task-verify") {
            return updateTask(task, "running", Math.max(1 - task.attempt_count, 0));
          }
          return task;
        })
      : tasks,
    verificationResults: verification,
  };
}

export function createSeedSession(): RunSession {
  return createSessionFromGoalInput(DEFAULT_GOAL_INPUT, true);
}

export function applyGoalLifecycleAction(
  session: RunSession,
  action: GoalLifecycleAction,
): RunSession {
  switch (action.type) {
    case "submit_goal": {
      return createSessionFromGoalInput(action.input);
    }
    case "reset_run":
      return createSeedSession();
    case "pause_run":
      return updateRunState(
        session,
        { status: "blocked" },
        createAuditEvent(session.run.run_id, "run_paused", "Paused the local execution loop.", {}),
      );
    case "resume_run":
      return updateRunState(
        session,
        { status: "running" },
        createAuditEvent(session.run.run_id, "run_resumed", "Resumed the local execution loop.", {}),
      );
    case "start_task": {
      const tasks: TaskTicket[] = statusFromTask(session, action.taskId, "running").map((task) =>
        task.task_id === "task-verify" && task.status === "running"
          ? updateTask(task, "pending")
          : task,
      );
      return {
        ...updateRunState(
          { ...session, tasks },
          {
            current_phase: "running",
            current_task_id: action.taskId,
            status: "running",
          },
          createAuditEvent(
            session.run.run_id,
            "task_started",
            `Started ${action.taskId}.`,
            { task_id: action.taskId },
          ),
        ),
        tasks,
      };
    }
    case "verify_task":
      return verifyCurrentTask(session, action.taskId);
    case "retry_task": {
      const tasks: TaskTicket[] = session.tasks.map((task) =>
        task.task_id === action.taskId
          ? updateTask(task, "running", 1)
          : task,
      );
      const verificationResults = session.verificationResults.filter(
        (result) => result.task_id !== action.taskId,
      );
      return {
        ...updateRunState(
          { ...session, tasks, verificationResults },
          {
            current_phase: "repairing",
            current_task_id: action.taskId,
            status: "repairing",
          },
          createAuditEvent(
            session.run.run_id,
            "task_retry",
            `Retrying ${action.taskId} after verification failure.`,
            { task_id: action.taskId },
          ),
        ),
        tasks,
        verificationResults,
      };
    }
    case "approve_repair": {
      const verificationResults: VerificationResult[] = session.verificationResults.map((result) =>
        result.task_id === action.taskId
          ? updateVerificationDecision(
              result,
              "accept",
              true,
              ["Repair approved from the local control room."],
              [...result.evidence, "Manual repair approval issued in UI."],
            )
          : result,
      );
      const tasks: TaskTicket[] = session.tasks.map((task) => {
        if (task.task_id === action.taskId) {
          return updateTask(task, "completed");
        }
        if (task.task_id === "task-verify") {
          return updateTask(task, "completed");
        }
        return task;
      });
      return {
        ...updateRunState(
          { ...session, tasks, verificationResults },
          {
            current_phase: "verification",
            current_task_id: action.taskId,
            status: "completed",
            completed_tasks: Array.from(new Set([...session.run.completed_tasks, action.taskId])),
          },
          createAuditEvent(
            session.run.run_id,
            "repair_approved",
            `Accepted repair for ${action.taskId}.`,
            { task_id: action.taskId },
          ),
        ),
        tasks,
        verificationResults,
      };
    }
    case "force_replan": {
      const tasks: TaskTicket[] = session.tasks.map((task, index) =>
        updateTask(task, index === 0 ? "completed" : "pending"),
      );
      return {
        ...updateRunState(
          { ...session, tasks, verificationResults: [] },
          {
            current_phase: "planning",
            current_task_id: tasks[1]?.task_id ?? "",
            status: "planning",
            failed_tasks: [],
          },
          createAuditEvent(
            session.run.run_id,
            "replan_requested",
            "Forced a replan from the local control room.",
            {},
          ),
        ),
        tasks,
        verificationResults: [],
      };
    }
  }

  return session;
}
