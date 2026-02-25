use crate::workflow::model::{Workflow, WorkflowMeta, WorkflowStep};
use anyhow::{anyhow, Result};
use std::collections::HashMap;
use std::fs;

#[derive(Debug, Clone, PartialEq)]
enum ParseState {
    Start,
    InMeta,
    InStep,
    InInput,
}

pub fn load_workflow(path: &str) -> Result<Workflow> {
    let ext = std::path::Path::new(path)
        .extension()
        .and_then(|s| s.to_str())
        .unwrap_or_default()
        .to_ascii_lowercase();
    if ext == "yaml" || ext == "yml" {
        return Err(anyhow!(
            "YAML workflow is deprecated. Use Markdown workflow format (.md) only"
        ));
    }
    let content = fs::read_to_string(path)?;
    parse_markdown_content(&content)
}

pub fn parse_markdown_content(content: &str) -> Result<Workflow> {
    let lines: Vec<&str> = content.lines().collect();

    let mut state = ParseState::Start;
    let mut workflow_name = String::new();
    let mut domain: Option<String> = None;
    let mut max_cpu_ms: Option<u64> = None;
    let mut max_wall_time_ms: Option<u64> = None;
    let mut max_fs_reads: Option<u32> = None;
    let mut max_fs_writes: Option<u32> = None;
    let mut max_network_calls: Option<u32> = None;
    let mut max_memory_mb: Option<u32> = None;
    let mut steps: Vec<WorkflowStep> = Vec::new();

    let mut current_step: Option<WorkflowStep> = None;

    for line in lines {
        let trimmed = line.trim();

        if trimmed.is_empty() {
            continue;
        }

        if trimmed.starts_with("# Workflow:") {
            state = ParseState::InMeta;
            workflow_name = trimmed
                .strip_prefix("# Workflow:")
                .map(|s| s.trim().to_string())
                .unwrap_or_default();
            continue;
        }

        if trimmed.starts_with("Domain:") {
            domain = trimmed
                .strip_prefix("Domain:")
                .map(|s| Some(s.trim().to_string()))
                .unwrap_or(None);
            continue;
        }

        if trimmed.starts_with("MaxCpuMs:") {
            max_cpu_ms = trimmed
                .strip_prefix("MaxCpuMs:")
                .and_then(|s| s.trim().parse::<u64>().ok());
            continue;
        }

        if trimmed.starts_with("MaxWallTimeMs:") {
            max_wall_time_ms = trimmed
                .strip_prefix("MaxWallTimeMs:")
                .and_then(|s| s.trim().parse::<u64>().ok());
            continue;
        }

        if trimmed.starts_with("MaxFsReads:") {
            max_fs_reads = trimmed
                .strip_prefix("MaxFsReads:")
                .and_then(|s| s.trim().parse::<u32>().ok());
            continue;
        }

        if trimmed.starts_with("MaxFsWrites:") {
            max_fs_writes = trimmed
                .strip_prefix("MaxFsWrites:")
                .and_then(|s| s.trim().parse::<u32>().ok());
            continue;
        }

        if trimmed.starts_with("MaxNetworkCalls:") {
            max_network_calls = trimmed
                .strip_prefix("MaxNetworkCalls:")
                .and_then(|s| s.trim().parse::<u32>().ok());
            continue;
        }

        if trimmed.starts_with("MaxMemoryMb:") {
            max_memory_mb = trimmed
                .strip_prefix("MaxMemoryMb:")
                .and_then(|s| s.trim().parse::<u32>().ok());
            continue;
        }

        if trimmed.starts_with("## Step:") {
            if let Some(step) = current_step.take() {
                steps.push(step);
            }

            state = ParseState::InStep;
            let step_id = trimmed
                .strip_prefix("## Step:")
                .map(|s| s.trim().to_string())
                .unwrap_or_default();
            current_step = Some(WorkflowStep::new(&step_id, "", ""));
            continue;
        }

        if trimmed.starts_with("Skill:") {
            if let Some(ref mut step) = current_step {
                step.skill = trimmed
                    .strip_prefix("Skill:")
                    .map(|s| s.trim().to_string())
                    .unwrap_or_default();
            }
            continue;
        }

        if trimmed.starts_with("DependsOn:") {
            if let Some(ref mut step) = current_step {
                let deps = trimmed
                    .strip_prefix("DependsOn:")
                    .map(|s| {
                        s.split(',')
                            .map(|p| p.trim().to_string())
                            .filter(|p| !p.is_empty())
                            .collect()
                    })
                    .unwrap_or_default();
                step.depends_on = deps;
            }
            continue;
        }

        if trimmed.starts_with("Condition:") {
            if let Some(ref mut step) = current_step {
                step.condition = trimmed
                    .strip_prefix("Condition:")
                    .map(|s| Some(s.trim().to_string()))
                    .unwrap_or(None);
            }
            continue;
        }

        if trimmed.starts_with("Retry:") {
            if let Some(ref mut step) = current_step {
                step.retry = trimmed
                    .strip_prefix("Retry:")
                    .and_then(|s| s.trim().parse().ok());
            }
            continue;
        }

        if trimmed.starts_with("OnFailure:") {
            if let Some(ref mut step) = current_step {
                let strategy_str = trimmed
                    .strip_prefix("OnFailure:")
                    .map(|s| s.trim().to_string())
                    .unwrap_or_default();
                step.on_failure = strategy_str
                    .parse()
                    .map_err(|_| anyhow!("Invalid FailureStrategy: {}", strategy_str))?;
            }
            continue;
        }

        if trimmed.starts_with("Input:") {
            state = ParseState::InInput;
            if let Some(ref mut step) = current_step {
                let input_val = trimmed
                    .strip_prefix("Input:")
                    .map(|s| s.trim())
                    .unwrap_or("");
                if !input_val.is_empty() {
                    step.input = input_val.to_string();
                }
            }
            continue;
        }

        if state == ParseState::InInput {
            if let Some(ref mut step) = current_step {
                if !step.input.is_empty() {
                    step.input.push('\n');
                }
                step.input.push_str(trimmed);
            }
        }
    }

    if let Some(step) = current_step {
        steps.push(step);
    }

    if workflow_name.is_empty() {
        return Err(anyhow!("Workflow name is required"));
    }
    if steps.is_empty() {
        return Err(anyhow!("At least one step is required"));
    }
    for step in &steps {
        if step.skill.is_empty() {
            return Err(anyhow!("Step '{}' is missing a skill", step.id));
        }
    }

    let step_ids: HashMap<&str, ()> = steps.iter().map(|s| (s.id.as_str(), ())).collect();
    for step in &steps {
        for dep in &step.depends_on {
            if !step_ids.contains_key(dep.as_str()) {
                return Err(anyhow!(
                    "Step '{}' depends on non-existent step '{}'",
                    step.id,
                    dep
                ));
            }
        }
    }

    let resource_budget = if max_cpu_ms.is_some()
        || max_wall_time_ms.is_some()
        || max_fs_reads.is_some()
        || max_fs_writes.is_some()
        || max_network_calls.is_some()
        || max_memory_mb.is_some()
    {
        let mut budget = crate::engine::budget::ResourceBudget::default();
        if let Some(v) = max_cpu_ms {
            budget.max_cpu_ms = v;
        }
        if let Some(v) = max_wall_time_ms {
            budget.max_wall_time_ms = v;
        }
        if let Some(v) = max_fs_reads {
            budget.max_fs_reads = v;
        }
        if let Some(v) = max_fs_writes {
            budget.max_fs_writes = v;
        }
        if let Some(v) = max_network_calls {
            budget.max_network_calls = v;
        }
        if let Some(v) = max_memory_mb {
            budget.max_memory_mb = v;
        }
        Some(budget)
    } else {
        None
    };

    Ok(Workflow {
        meta: WorkflowMeta {
            name: workflow_name,
            domain,
            goal: None,
            target_type: None,
            routing_policy: None,
            security_policy: None,
            resource_budget,
            projected_cost: None,
            projected_latency_ms: None,
            projected_steps: None,
        },
        steps,
    })
}

#[cfg(test)]
mod tests {
    use super::parse_markdown_content;

    #[test]
    fn parse_markdown_steps_with_dependencies_and_retry() {
        let content = r#"
# Workflow: feature
Domain: demo

## Step: ensure_branch
Skill: agent.ensure_branch
Input: default-thread

## Step: semantic_search
Skill: agent.semantic_search
DependsOn: ensure_branch
Input: 3:::current task context

## Step: run_tests
Skill: agent.run_script
DependsOn: semantic_search
Retry: 2
OnFailure: Continue
Input: cargo test
"#;
        let workflow = parse_markdown_content(content).expect("parse markdown");
        assert_eq!(workflow.meta.name, "feature");
        assert_eq!(workflow.steps.len(), 3);
        assert_eq!(workflow.steps[0].skill, "agent.ensure_branch");
        assert_eq!(workflow.steps[2].skill, "agent.run_script");
        assert_eq!(
            workflow.steps[1].depends_on,
            vec!["ensure_branch".to_string()]
        );
        assert_eq!(workflow.steps[2].retry, Some(2));
    }
}
