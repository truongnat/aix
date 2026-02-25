use crate::workflow::model::{Workflow, WorkflowMeta, WorkflowStep};
use anyhow::{anyhow, Result};
use serde::Deserialize;
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
    let content = fs::read_to_string(path)?;
    let ext = std::path::Path::new(path)
        .extension()
        .and_then(|s| s.to_str())
        .unwrap_or_default()
        .to_ascii_lowercase();
    match ext.as_str() {
        "yaml" | "yml" => parse_yaml_content(&content),
        _ => parse_markdown_content(&content),
    }
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

        // Skip empty lines
        if trimmed.is_empty() {
            continue;
        }

        // Parse "# Workflow:" - must be at start
        if trimmed.starts_with("# Workflow:") {
            state = ParseState::InMeta;
            workflow_name = trimmed
                .strip_prefix("# Workflow:")
                .map(|s| s.trim().to_string())
                .unwrap_or_default();
            continue;
        }

        // Parse "Domain:"
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

        // Parse "## Step:"
        if trimmed.starts_with("## Step:") {
            // Push previous step if exists
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

        // Parse "Skill:"
        if trimmed.starts_with("Skill:") {
            if let Some(ref mut step) = current_step {
                step.skill = trimmed
                    .strip_prefix("Skill:")
                    .map(|s| s.trim().to_string())
                    .unwrap_or_default();
            }
            continue;
        }

        // Parse "DependsOn:"
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

        // Parse "Condition:"
        if trimmed.starts_with("Condition:") {
            if let Some(ref mut step) = current_step {
                step.condition = trimmed
                    .strip_prefix("Condition:")
                    .map(|s| Some(s.trim().to_string()))
                    .unwrap_or(None);
            }
            continue;
        }

        // Parse "Retry:"
        if trimmed.starts_with("Retry:") {
            if let Some(ref mut step) = current_step {
                step.retry = trimmed
                    .strip_prefix("Retry:")
                    .and_then(|s| s.trim().parse().ok());
            }
            continue;
        }

        // Parse "OnFailure:"
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

        // Parse "Input:"
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

        // If in input mode, append to current step's input
        if state == ParseState::InInput {
            if let Some(ref mut step) = current_step {
                if !step.input.is_empty() {
                    step.input.push('\n');
                }
                step.input.push_str(trimmed);
            }
        }
    }

    // Push last step if exists
    if let Some(step) = current_step {
        steps.push(step);
    }

    // Validation
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

    // Validate dependencies exist
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

#[derive(Debug, Deserialize)]
struct WorkflowYaml {
    id: Option<String>,
    name: Option<String>,
    domain: Option<String>,
    goal: Option<String>,
    target_type: Option<String>,
    #[allow(dead_code)]
    roles: Option<Vec<String>>,
    steps: Vec<WorkflowYamlStepEntry>,
}

#[derive(Debug, Deserialize)]
#[serde(untagged)]
enum WorkflowYamlStepEntry {
    Named(String),
    Detailed(Box<WorkflowYamlStep>),
}

#[derive(Debug, Deserialize)]
struct WorkflowYamlStep {
    id: Option<String>,
    name: Option<String>,
    skill: Option<String>,
    action: Option<String>,
    input: Option<String>,
    depends_on: Option<Vec<String>>,
    #[serde(rename = "dependsOn")]
    depends_on_camel: Option<Vec<String>>,
    condition: Option<String>,
    retry: Option<u32>,
    on_failure: Option<String>,
    #[serde(rename = "onFailure")]
    on_failure_camel: Option<String>,
}

fn sanitize_step_id(raw: &str, fallback_idx: usize) -> String {
    let mut out = String::new();
    for ch in raw.chars() {
        if ch.is_ascii_alphanumeric() {
            out.push(ch.to_ascii_lowercase());
        } else {
            out.push('_');
        }
    }
    while out.contains("__") {
        out = out.replace("__", "_");
    }
    out = out.trim_matches('_').to_string();
    if out.is_empty() {
        format!("s{}", fallback_idx + 1)
    } else {
        out
    }
}

fn map_opinionated_step(alias: &str) -> Option<(&'static str, &'static str)> {
    match alias {
        "ensure_branch" => Some(("agent.ensure_branch", "default-thread")),
        "semantic_search" => Some(("agent.semantic_search", "3:::current task context")),
        "llm_plan" => Some((
            "agent.llm_subagent",
            "architect:::create implementation plan",
        )),
        "llm_implement" => Some((
            "agent.llm_subagent",
            "implementer:::implement approved plan",
        )),
        "write_files" => Some(("agent.write_file", "output.txt:::autogenerated content")),
        "run_tests" => Some(("agent.run_script", "cargo test")),
        "run_validation" => Some(("agent.run_script", "cargo test")),
        "git_commit" => Some(("agent.git_commit", "feat(agent): automated workflow commit")),
        "summarize" => Some(("demo.echo", "Workflow completed")),
        "detect_failure" => Some(("agent.run_script", "cargo test")),
        "analyze_conflicts" => Some(("agent.analyze_conflicts", "")),
        "git_merge_branch" => Some(("agent.git_merge_branch", "main")),
        "release_tag" => Some(("agent.run_script", "git tag v0.1.0")),
        _ => None,
    }
}

pub fn parse_yaml_content(content: &str) -> Result<Workflow> {
    let spec: WorkflowYaml = serde_yaml::from_str(content)?;
    if spec.steps.is_empty() {
        return Err(anyhow!("At least one step is required"));
    }

    let workflow_name = spec
        .id
        .clone()
        .or(spec.name.clone())
        .unwrap_or_else(|| "workflow".to_string());
    let mut steps: Vec<WorkflowStep> = Vec::new();

    for (idx, entry) in spec.steps.iter().enumerate() {
        let mut step = match entry {
            WorkflowYamlStepEntry::Named(alias) => {
                let id = sanitize_step_id(alias, idx);
                let (skill, input) = map_opinionated_step(alias).ok_or_else(|| {
                    anyhow!(
                        "Unknown shorthand step '{}' in YAML workflow. Provide object form with explicit skill/input.",
                        alias
                    )
                })?;
                WorkflowStep::new(&id, skill, input)
            }
            WorkflowYamlStepEntry::Detailed(def) => {
                let id_seed = def
                    .id
                    .as_ref()
                    .or(def.name.as_ref())
                    .map(|s| s.as_str())
                    .unwrap_or("");
                let id = sanitize_step_id(id_seed, idx);
                let (skill, default_input) = if let Some(skill) = def.skill.as_ref() {
                    (skill.clone(), "")
                } else if let Some(action) = def.action.as_ref() {
                    if let Some((mapped_skill, mapped_input)) = map_opinionated_step(action) {
                        (mapped_skill.to_string(), mapped_input)
                    } else {
                        return Err(anyhow!(
                            "Unknown action '{}' in workflow YAML step '{}'",
                            action,
                            id
                        ));
                    }
                } else {
                    return Err(anyhow!(
                        "YAML workflow step '{}' is missing 'skill' or 'action'",
                        id
                    ));
                };
                let mut step =
                    WorkflowStep::new(&id, &skill, def.input.as_deref().unwrap_or(default_input));
                step.depends_on = def
                    .depends_on
                    .clone()
                    .or(def.depends_on_camel.clone())
                    .unwrap_or_default();
                step.condition = def.condition.clone();
                step.retry = def.retry;
                let on_failure = def
                    .on_failure
                    .as_ref()
                    .or(def.on_failure_camel.as_ref())
                    .cloned();
                if let Some(strategy) = on_failure {
                    step.on_failure = strategy
                        .parse()
                        .map_err(|_| anyhow!("Invalid FailureStrategy: {}", strategy))?;
                }
                step
            }
        };

        if step.depends_on.is_empty() && idx > 0 {
            let prev_id = steps[idx - 1].id.clone();
            step.depends_on.push(prev_id);
        }
        steps.push(step);
    }

    let step_ids: HashMap<&str, ()> = steps.iter().map(|s| (s.id.as_str(), ())).collect();
    for step in &steps {
        if step.skill.is_empty() {
            return Err(anyhow!("Step '{}' is missing a skill", step.id));
        }
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

    Ok(Workflow {
        meta: WorkflowMeta {
            name: workflow_name,
            domain: spec.domain,
            goal: spec.goal,
            target_type: spec.target_type,
            routing_policy: None,
            security_policy: None,
            resource_budget: None,
            projected_cost: None,
            projected_latency_ms: None,
            projected_steps: None,
        },
        steps,
    })
}

#[cfg(test)]
mod tests {
    use super::parse_yaml_content;

    #[test]
    fn parse_yaml_shorthand_steps() {
        let yaml = r#"
id: feature
domain: demo
steps:
  - ensure_branch
  - semantic_search
  - llm_plan
  - llm_implement
  - run_tests
  - git_commit
"#;
        let workflow = parse_yaml_content(yaml).expect("parse yaml");
        assert_eq!(workflow.meta.name, "feature");
        assert_eq!(workflow.steps.len(), 6);
        assert_eq!(workflow.steps[0].skill, "agent.ensure_branch");
        assert_eq!(workflow.steps[5].skill, "agent.git_commit");
        assert_eq!(
            workflow.steps[1].depends_on,
            vec!["ensure_branch".to_string()]
        );
    }
}
