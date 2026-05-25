use crate::engine::project::AgentProjectLayout;
use crate::plan::{self, ExecutionPlan, PlanOutput, TaskTicket};
use anyhow::{anyhow, Context, Result};
use serde::Serialize;
use std::path::Path;
use std::process::Command;
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Debug, Clone, Serialize)]
pub(crate) struct CommandResult {
    pub(crate) command: String,
    pub(crate) ok: bool,
    pub(crate) exit_code: Option<i32>,
    pub(crate) stdout_preview: String,
    pub(crate) stderr_preview: String,
}

#[derive(Debug, Clone, Serialize)]
pub(crate) struct TaskExecutionReport {
    pub(crate) task_id: String,
    pub(crate) title: String,
    pub(crate) dry_run: bool,
    pub(crate) command_results: Vec<CommandResult>,
    pub(crate) verification_ok: bool,
}

#[derive(Debug, Clone, Serialize)]
pub(crate) struct ImplementReport {
    pub(crate) schema_version: String,
    pub(crate) run_id: String,
    pub(crate) goal: String,
    pub(crate) plan_source: String,
    pub(crate) selected_tasks: usize,
    pub(crate) reports: Vec<TaskExecutionReport>,
    pub(crate) ok: bool,
}

#[derive(Debug, Clone, Serialize, serde::Deserialize)]
struct ImplementRunRecord {
    run_id: String,
    goal: String,
    status: String,
    started_at_ms: u64,
    updated_at_ms: u64,
    completed_tasks: Vec<String>,
    failed_tasks: Vec<String>,
}

/// Load an execution plan from disk. This accepts either:
/// - full PlanOutput JSON (`{ plan, verification }`)
/// - bare ExecutionPlan JSON
fn load_plan_from_file(path: &Path) -> Result<ExecutionPlan> {
    let raw = std::fs::read_to_string(path)
        .with_context(|| format!("failed to read plan file '{}'", path.display()))?;
    if let Ok(wrapper) = serde_json::from_str::<PlanOutput>(&raw) {
        return Ok(wrapper.plan);
    }
    if let Ok(plan) = serde_json::from_str::<ExecutionPlan>(&raw) {
        return Ok(plan);
    }
    Err(anyhow!(
        "plan file '{}' is not valid PlanOutput/ExecutionPlan JSON",
        path.display()
    ))
}

/// Execute one validation command using the project root as working directory.
/// The command is intentionally run via `sh -lc` so existing shell snippets keep working.
fn run_validation_command(project_root: &str, command: &str) -> Result<CommandResult> {
    let output = Command::new("sh")
        .arg("-lc")
        .arg(command)
        .current_dir(project_root)
        .output()
        .with_context(|| format!("failed to execute command '{}'", command))?;
    Ok(CommandResult {
        command: command.to_string(),
        ok: output.status.success(),
        exit_code: output.status.code(),
        stdout_preview: truncate_output(&String::from_utf8_lossy(&output.stdout), 600),
        stderr_preview: truncate_output(&String::from_utf8_lossy(&output.stderr), 600),
    })
}

fn truncate_output(value: &str, max: usize) -> String {
    let cleaned = value.trim();
    if cleaned.chars().count() <= max {
        cleaned.to_string()
    } else {
        let mut out = cleaned.chars().take(max).collect::<String>();
        out.push_str("...");
        out
    }
}

fn select_tasks<'a>(plan: &'a ExecutionPlan, task_id: Option<&str>) -> Result<Vec<&'a TaskTicket>> {
    match task_id {
        Some(id) => {
            let task = plan
                .tasks
                .iter()
                .find(|item| item.id == id)
                .ok_or_else(|| anyhow!("task_id '{}' not found in plan", id))?;
            Ok(vec![task])
        }
        None => Ok(plan.tasks.iter().collect()),
    }
}

/// Budget preflight gate: block plans that exceed conservative defaults before execution.
/// This keeps implement runs predictable even when callers omit explicit budget config.
fn enforce_plan_budget(plan: &ExecutionPlan) -> Result<()> {
    const MAX_TASKS_DEFAULT: usize = 30;
    const COST_UNITS_PER_TASK: u32 = 100;
    const MAX_TOTAL_COST_DEFAULT: u32 = 2500;

    if plan.tasks.len() > MAX_TASKS_DEFAULT {
        return Err(anyhow!(
            "plan budget exceeded: tasks={} > max_tasks={}",
            plan.tasks.len(),
            MAX_TASKS_DEFAULT
        ));
    }
    let projected_cost = (plan.tasks.len() as u32).saturating_mul(COST_UNITS_PER_TASK);
    if projected_cost > MAX_TOTAL_COST_DEFAULT {
        return Err(anyhow!(
            "plan budget exceeded: projected_cost={} > max_total_cost={}",
            projected_cost,
            MAX_TOTAL_COST_DEFAULT
        ));
    }
    Ok(())
}

fn now_ms() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_millis() as u64)
        .unwrap_or(0)
}

fn state_file_path(layout: &AgentProjectLayout) -> std::path::PathBuf {
    layout.memory_dir.join("implement_runs.json")
}

fn load_state_records(layout: &AgentProjectLayout) -> Result<Vec<ImplementRunRecord>> {
    let path = state_file_path(layout);
    if !path.exists() {
        return Ok(Vec::new());
    }
    let body = std::fs::read_to_string(&path)
        .with_context(|| format!("failed to read state file '{}'", path.display()))?;
    serde_json::from_str::<Vec<ImplementRunRecord>>(&body)
        .with_context(|| format!("failed to parse state file '{}'", path.display()))
}

fn save_state_records(layout: &AgentProjectLayout, records: &[ImplementRunRecord]) -> Result<()> {
    let path = state_file_path(layout);
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent).with_context(|| {
            format!("failed to create state directory '{}'", parent.display())
        })?;
    }
    let body = serde_json::to_string_pretty(records)?;
    std::fs::write(&path, body)
        .with_context(|| format!("failed to write state file '{}'", path.display()))
}

/// Upsert run state so each task result is checkpointed for resume and audit.
fn upsert_run_record(layout: &AgentProjectLayout, record: ImplementRunRecord) -> Result<()> {
    let mut records = load_state_records(layout)?;
    if let Some(slot) = records.iter_mut().find(|item| item.run_id == record.run_id) {
        *slot = record;
    } else {
        records.push(record);
    }
    save_state_records(layout, &records)
}

fn find_run_record(layout: &AgentProjectLayout, run_id: &str) -> Result<ImplementRunRecord> {
    let records = load_state_records(layout)?;
    records
        .into_iter()
        .find(|item| item.run_id == run_id)
        .ok_or_else(|| anyhow!("resume run '{}' not found", run_id))
}

fn next_run_id() -> String {
    format!("run-{}", now_ms())
}

pub(crate) fn run_implement(
    layout: &AgentProjectLayout,
    goal: Option<&str>,
    plan_file: Option<&str>,
    task_id: Option<&str>,
    dry_run: bool,
    resume_run: Option<&str>,
) -> Result<ImplementReport> {
    let (run_id, completed_before) = if let Some(run_id) = resume_run {
        let record = find_run_record(layout, run_id)?;
        (run_id.to_string(), record.completed_tasks)
    } else {
        (next_run_id(), Vec::new())
    };

    // Harness gate #1: always start from a structured plan.
    let plan = if let Some(path) = plan_file {
        load_plan_from_file(Path::new(path))?
    } else if let Some(raw_goal) = goal {
        plan::generate_plan(layout, raw_goal)
    } else {
        return Err(anyhow!(
            "implement requires either <goal> or --plan-file <path>"
        ));
    };

    // Harness gate #2: refuse execution if the plan fails structural verification.
    let verification = plan::verify_plan(&plan);
    if !verification.ok {
        return Err(anyhow!("plan verification failed before implementation"));
    }
    // Harness gate #3: enforce conservative budget limits prior to task execution.
    enforce_plan_budget(&plan)?;

    let started_at_ms = now_ms();
    upsert_run_record(
        layout,
        ImplementRunRecord {
            run_id: run_id.clone(),
            goal: plan.goal.clone(),
            status: "running".to_string(),
            started_at_ms,
            updated_at_ms: started_at_ms,
            completed_tasks: completed_before.clone(),
            failed_tasks: Vec::new(),
        },
    )?;

    let tasks = select_tasks(&plan, task_id)?;
    let mut reports = Vec::new();
    let mut completed_tasks = completed_before;
    let mut failed_tasks = Vec::new();
    for task in tasks {
        if completed_tasks.iter().any(|item| item == &task.id) {
            continue;
        }
        let mut command_results = Vec::new();
        for command in &task.validation_commands {
            if dry_run {
                command_results.push(CommandResult {
                    command: command.clone(),
                    ok: true,
                    exit_code: Some(0),
                    stdout_preview: "dry-run: skipped".to_string(),
                    stderr_preview: String::new(),
                });
                continue;
            }
            command_results.push(run_validation_command(&layout.project_root, command)?);
        }
        let verification_ok = command_results.iter().all(|entry| entry.ok);
        if verification_ok {
            completed_tasks.push(task.id.clone());
        } else {
            failed_tasks.push(task.id.clone());
        }
        reports.push(TaskExecutionReport {
            task_id: task.id.clone(),
            title: task.title.clone(),
            dry_run,
            command_results,
            verification_ok,
        });
        upsert_run_record(
            layout,
            ImplementRunRecord {
                run_id: run_id.clone(),
                goal: plan.goal.clone(),
                status: if failed_tasks.is_empty() {
                    "running".to_string()
                } else {
                    "failed".to_string()
                },
                started_at_ms,
                updated_at_ms: now_ms(),
                completed_tasks: completed_tasks.clone(),
                failed_tasks: failed_tasks.clone(),
            },
        )?;
    }

    let ok = reports.iter().all(|entry| entry.verification_ok);
    upsert_run_record(
        layout,
        ImplementRunRecord {
            run_id: run_id.clone(),
            goal: plan.goal.clone(),
            status: if ok { "completed" } else { "failed" }.to_string(),
            started_at_ms,
            updated_at_ms: now_ms(),
            completed_tasks,
            failed_tasks,
        },
    )?;
    Ok(ImplementReport {
        schema_version: "implement.v1".to_string(),
        run_id,
        goal: plan.goal.clone(),
        plan_source: if plan_file.is_some() {
            "file".to_string()
        } else {
            "generated".to_string()
        },
        selected_tasks: reports.len(),
        reports,
        ok,
    })
}

#[cfg(test)]
mod tests {
    use super::{enforce_plan_budget, run_implement};
    use crate::engine::project::AgentProjectLayout;
    use crate::plan::generate_plan;

    #[test]
    fn implement_resume_skips_completed_tasks() {
        let unique = format!(
            "agentic-sdlc-implement-resume-{}",
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .expect("time")
                .as_nanos()
        );
        let root = std::env::temp_dir().join(unique);
        std::fs::create_dir_all(&root).expect("create root");
        let layout = AgentProjectLayout::discover(root.to_string_lossy().as_ref()).expect("layout");
        layout.ensure_layout().expect("ensure layout");

        let first = run_implement(
            &layout,
            Some("resume flow"),
            None,
            None,
            true,
            None,
        )
        .expect("first run");
        assert!(first.ok);
        assert_eq!(first.selected_tasks, 3);

        let resumed = run_implement(
            &layout,
            Some("resume flow"),
            None,
            None,
            true,
            Some(&first.run_id),
        )
        .expect("resume run");
        assert!(resumed.ok);
        assert_eq!(resumed.schema_version, "implement.v1");
        assert_eq!(resumed.run_id, first.run_id);
        // All tasks are already marked completed in persisted state.
        assert_eq!(resumed.selected_tasks, 0);

        let _ = std::fs::remove_dir_all(root);
    }

    #[test]
    fn implement_budget_gate_rejects_oversized_plan() {
        let unique = format!(
            "agentic-sdlc-implement-budget-{}",
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .expect("time")
                .as_nanos()
        );
        let root = std::env::temp_dir().join(unique);
        std::fs::create_dir_all(&root).expect("create root");
        let layout = AgentProjectLayout::discover(root.to_string_lossy().as_ref()).expect("layout");
        let mut plan = generate_plan(&layout, "budget gate");
        // Force an oversize plan so budget preflight must fail.
        while plan.tasks.len() <= 30 {
            let template = plan.tasks[0].clone();
            plan.tasks.push(template);
        }
        let result = enforce_plan_budget(&plan);
        assert!(result.is_err());
        let _ = std::fs::remove_dir_all(root);
    }
}
