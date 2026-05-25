use crate::engine::project::AgentProjectLayout;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub(crate) struct TaskTicket {
    pub(crate) id: String,
    pub(crate) title: String,
    pub(crate) objective: String,
    pub(crate) expected_output: String,
    pub(crate) validation_commands: Vec<String>,
    pub(crate) done_criteria: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub(crate) struct ExecutionPlan {
    pub(crate) goal: String,
    pub(crate) assumptions: Vec<String>,
    pub(crate) risks: Vec<String>,
    pub(crate) acceptance_criteria: Vec<String>,
    pub(crate) tasks: Vec<TaskTicket>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub(crate) struct PlanVerificationReport {
    pub(crate) ok: bool,
    pub(crate) checks: Vec<PlanVerificationCheck>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub(crate) struct PlanVerificationCheck {
    pub(crate) name: String,
    pub(crate) ok: bool,
    pub(crate) message: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub(crate) struct PlanOutput {
    #[serde(default)]
    pub(crate) schema_version: String,
    pub(crate) plan: ExecutionPlan,
    pub(crate) verification: PlanVerificationReport,
}

pub(crate) fn generate_plan(layout: &AgentProjectLayout, goal: &str) -> ExecutionPlan {
    let cleaned_goal = goal.trim();
    let repo_hint = detect_repo_hint(layout);
    let tasks = vec![
        TaskTicket {
            id: "T1-scope-contract".to_string(),
            title: "Lock scope and contract".to_string(),
            objective: format!(
                "Clarify scope for goal '{}' and define acceptance boundaries.",
                cleaned_goal
            ),
            expected_output: "A short scope note with explicit in-scope and out-of-scope items."
                .to_string(),
            validation_commands: vec!["asd doctor --json".to_string()],
            done_criteria: vec![
                "Scope statement is explicit.".to_string(),
                "Risks and assumptions are documented.".to_string(),
            ],
        },
        TaskTicket {
            id: "T2-implement-core".to_string(),
            title: "Implement core changes".to_string(),
            objective: "Apply minimal code changes to satisfy the goal.".to_string(),
            expected_output: "Code updated with smallest safe diff.".to_string(),
            validation_commands: vec![
                "cargo test".to_string(),
                "cargo run --bin asd -- workflow check".to_string(),
            ],
            done_criteria: vec![
                "Feature behavior matches requested goal.".to_string(),
                "No unrelated refactor introduced.".to_string(),
            ],
        },
        TaskTicket {
            id: "T3-verify-harness".to_string(),
            title: "Verify and close".to_string(),
            objective: "Run verification gates and produce final outcome summary.".to_string(),
            expected_output: "Verification report with pass/fail and residual risks.".to_string(),
            validation_commands: vec![
                "cargo run --bin asd -- doctor --json".to_string(),
                "cargo test".to_string(),
            ],
            done_criteria: vec![
                "All critical checks pass.".to_string(),
                "Residual risks are explicit.".to_string(),
            ],
        },
    ];

    ExecutionPlan {
        goal: cleaned_goal.to_string(),
        assumptions: vec![
            format!("Repository context: {}", repo_hint),
            "Implementation proceeds through harness-verified tasks only.".to_string(),
        ],
        risks: vec![
            "Goal may be underspecified and require re-planning.".to_string(),
            "Existing uncommitted changes can affect execution stability.".to_string(),
        ],
        acceptance_criteria: vec![
            "Output behavior satisfies the requested goal.".to_string(),
            "Verification commands pass at task and final levels.".to_string(),
            "Plan remains atomic and recoverable per task.".to_string(),
        ],
        tasks,
    }
}

pub(crate) fn verify_plan(plan: &ExecutionPlan) -> PlanVerificationReport {
    let mut checks = Vec::new();
    checks.push(PlanVerificationCheck {
        name: "goal_non_empty".to_string(),
        ok: !plan.goal.trim().is_empty(),
        message: if plan.goal.trim().is_empty() {
            "Goal is empty.".to_string()
        } else {
            "Goal is present.".to_string()
        },
    });
    checks.push(PlanVerificationCheck {
        name: "tasks_non_empty".to_string(),
        ok: !plan.tasks.is_empty(),
        message: if plan.tasks.is_empty() {
            "Plan has no tasks.".to_string()
        } else {
            format!("Plan has {} tasks.", plan.tasks.len())
        },
    });
    let task_shapes_ok = plan.tasks.iter().all(|task| {
        !task.id.trim().is_empty()
            && !task.objective.trim().is_empty()
            && !task.validation_commands.is_empty()
            && !task.done_criteria.is_empty()
    });
    checks.push(PlanVerificationCheck {
        name: "task_shape_valid".to_string(),
        ok: task_shapes_ok,
        message: if task_shapes_ok {
            "All tasks have objective, validation, and done criteria.".to_string()
        } else {
            "One or more tasks are missing required fields.".to_string()
        },
    });
    checks.push(PlanVerificationCheck {
        name: "acceptance_criteria_present".to_string(),
        ok: !plan.acceptance_criteria.is_empty(),
        message: if plan.acceptance_criteria.is_empty() {
            "Plan is missing acceptance criteria.".to_string()
        } else {
            "Acceptance criteria are defined.".to_string()
        },
    });
    let ok = checks.iter().all(|item| item.ok);
    PlanVerificationReport { ok, checks }
}

fn detect_repo_hint(layout: &AgentProjectLayout) -> String {
    let root = std::path::Path::new(&layout.project_root);
    if root.join("Cargo.toml").exists() {
        "Rust repository".to_string()
    } else if root.join("package.json").exists() {
        "Node.js repository".to_string()
    } else if root.join("go.mod").exists() {
        "Go repository".to_string()
    } else if root.join("pyproject.toml").exists() {
        "Python repository".to_string()
    } else {
        "Generic repository".to_string()
    }
}

#[cfg(test)]
mod tests {
    use super::{generate_plan, verify_plan, PlanOutput};
    use crate::engine::project::AgentProjectLayout;

    #[test]
    fn plan_output_uses_schema_v1() {
        let unique = format!(
            "agentic-sdlc-plan-schema-{}",
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .expect("time")
                .as_nanos()
        );
        let root = std::env::temp_dir().join(unique);
        std::fs::create_dir_all(&root).expect("create root");
        let layout = AgentProjectLayout::discover(root.to_string_lossy().as_ref()).expect("layout");
        let plan = generate_plan(&layout, "ship plan schema");
        let verification = verify_plan(&plan);
        assert!(verification.ok);
        let output = PlanOutput {
            schema_version: "plan.v1".to_string(),
            plan,
            verification,
        };
        assert_eq!(output.schema_version, "plan.v1");
        let _ = std::fs::remove_dir_all(root);
    }
}
