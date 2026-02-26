use crate::engine::context_retrieval::{
    ContextRetrievalService, GraphIndexContextRetrievalService, HybridContextRetrievalService,
    VectorIndexContextRetrievalService,
};
use crate::engine::workflow_engine::instance::WorkflowInstance;
use crate::skill::io::{SkillInput, SkillOutput};
use crate::workflow::model::{Workflow, WorkflowStep};
use anyhow::Result;
use serde_json::Value;
use std::collections::HashSet;
use std::sync::Arc;

#[derive(Debug, Clone)]
pub struct ContextInjectionResult {
    pub input: SkillInput,
    pub injected_items: u32,
}

impl ContextInjectionResult {
    fn passthrough(input: SkillInput) -> Self {
        Self {
            input,
            injected_items: 0,
        }
    }
}

pub trait ContextService: Send + Sync {
    fn inject(
        &self,
        workflow: &Workflow,
        step: &WorkflowStep,
        instance: &WorkflowInstance,
        qualified_skill_name: &str,
        input: SkillInput,
    ) -> Result<ContextInjectionResult>;
}

#[derive(Clone)]
pub struct DeterministicContextService {
    max_items: usize,
    max_chars_per_item: usize,
    retrieval_service: Arc<dyn ContextRetrievalService>,
}

impl Default for DeterministicContextService {
    fn default() -> Self {
        let max_items = std::env::var("ANTIGRAV_CONTEXT_MAX_ITEMS")
            .ok()
            .and_then(|v| v.trim().parse::<usize>().ok())
            .filter(|v| *v > 0)
            .unwrap_or(5);
        let max_chars_per_item = std::env::var("ANTIGRAV_CONTEXT_MAX_CHARS")
            .ok()
            .and_then(|v| v.trim().parse::<usize>().ok())
            .filter(|v| *v > 32)
            .unwrap_or(300);
        let retrieval_mode = std::env::var("ANTIGRAV_CONTEXT_RETRIEVAL_MODE")
            .ok()
            .unwrap_or_else(|| "vector".to_string())
            .trim()
            .to_ascii_lowercase();
        let retrieval_service: Arc<dyn ContextRetrievalService> = match retrieval_mode.as_str() {
            "off" | "disabled" | "none" => {
                Arc::new(crate::engine::context_retrieval::NoopContextRetrievalService)
            }
            "graph" => Arc::new(GraphIndexContextRetrievalService::from_env()),
            "hybrid" => Arc::new(HybridContextRetrievalService::from_env()),
            _ => Arc::new(VectorIndexContextRetrievalService::from_env()),
        };
        Self {
            max_items,
            max_chars_per_item,
            retrieval_service,
        }
    }
}

impl DeterministicContextService {
    #[cfg(test)]
    pub fn with_retrieval_service(retrieval_service: Arc<dyn ContextRetrievalService>) -> Self {
        Self {
            retrieval_service,
            ..Self::default()
        }
    }
}

#[derive(Debug, Clone)]
struct ContextSnippet {
    source_step: String,
    id: String,
    score: Option<f64>,
    text: String,
}

impl ContextService for DeterministicContextService {
    fn inject(
        &self,
        workflow: &Workflow,
        step: &WorkflowStep,
        instance: &WorkflowInstance,
        qualified_skill_name: &str,
        input: SkillInput,
    ) -> Result<ContextInjectionResult> {
        if !is_llm_subagent_skill(qualified_skill_name) {
            return Ok(ContextInjectionResult::passthrough(input));
        }
        let SkillInput::Text(text) = input else {
            return Ok(ContextInjectionResult::passthrough(input));
        };

        let mut snippets = Vec::new();
        let mut seen_keys = HashSet::new();
        for dep in &step.depends_on {
            let Some(output) = instance.step_results.get(dep) else {
                continue;
            };
            for snippet in extract_snippets_from_output(dep, output, self.max_chars_per_item) {
                if push_unique_snippet(&mut snippets, &mut seen_keys, snippet, self.max_items) {
                    continue;
                }
            }
            if snippets.len() >= self.max_items {
                break;
            }
        }

        let remaining = self.max_items.saturating_sub(snippets.len());
        if remaining > 0 {
            let query = derive_retrieval_query(&text, workflow, step);
            if !query.is_empty() {
                let retrieved = self.retrieval_service.retrieve(&query, remaining)?;
                for item in retrieved {
                    let snippet = ContextSnippet {
                        source_step: item.source,
                        id: item.id,
                        score: Some(item.score),
                        text: truncate_chars(item.text.trim(), self.max_chars_per_item),
                    };
                    let _ =
                        push_unique_snippet(&mut snippets, &mut seen_keys, snippet, self.max_items);
                }
            }
        }

        if snippets.is_empty() {
            return Ok(ContextInjectionResult::passthrough(SkillInput::Text(text)));
        }

        let injected = render_injected_input(&text, &snippets, workflow, step);
        Ok(ContextInjectionResult {
            input: SkillInput::Text(injected),
            injected_items: u32::try_from(snippets.len()).unwrap_or(u32::MAX),
        })
    }
}

fn is_llm_subagent_skill(skill_ref: &str) -> bool {
    let normalized = skill_ref.trim().to_ascii_lowercase();
    normalized == "llm_subagent" || normalized.ends_with(".llm_subagent")
}

fn extract_snippets_from_output(
    source_step: &str,
    output: &SkillOutput,
    max_chars_per_item: usize,
) -> Vec<ContextSnippet> {
    match output {
        SkillOutput::Json(value) => {
            extract_snippets_from_json(source_step, value, max_chars_per_item)
        }
        SkillOutput::Text(text) => vec![ContextSnippet {
            source_step: source_step.to_string(),
            id: "text".to_string(),
            score: None,
            text: truncate_chars(text.trim(), max_chars_per_item),
        }],
        SkillOutput::Number(value) => vec![ContextSnippet {
            source_step: source_step.to_string(),
            id: "number".to_string(),
            score: None,
            text: value.to_string(),
        }],
        SkillOutput::Boolean(value) => vec![ContextSnippet {
            source_step: source_step.to_string(),
            id: "boolean".to_string(),
            score: None,
            text: value.to_string(),
        }],
    }
}

fn extract_snippets_from_json(
    source_step: &str,
    value: &Value,
    max_chars_per_item: usize,
) -> Vec<ContextSnippet> {
    let mut snippets = Vec::new();

    if let Some(results) = value.get("results").and_then(|v| v.as_array()) {
        for (idx, item) in results.iter().enumerate() {
            let id = item
                .get("id")
                .and_then(|v| v.as_str())
                .map(|v| v.to_string())
                .unwrap_or_else(|| format!("result-{}", idx + 1));
            let score = item.get("score").and_then(|v| v.as_f64());
            let text = item
                .get("text")
                .and_then(|v| v.as_str())
                .map(|v| v.to_string())
                .unwrap_or_else(|| item.to_string());
            snippets.push(ContextSnippet {
                source_step: source_step.to_string(),
                id,
                score,
                text: truncate_chars(text.trim(), max_chars_per_item),
            });
        }
        return snippets;
    }

    if let Some(conflicts) = value.get("conflicts").and_then(|v| v.as_array()) {
        for (idx, item) in conflicts.iter().enumerate() {
            let text = item
                .as_str()
                .map(|v| v.to_string())
                .unwrap_or_else(|| item.to_string());
            snippets.push(ContextSnippet {
                source_step: source_step.to_string(),
                id: format!("conflict-{}", idx + 1),
                score: None,
                text: truncate_chars(text.trim(), max_chars_per_item),
            });
        }
        return snippets;
    }

    snippets.push(ContextSnippet {
        source_step: source_step.to_string(),
        id: "json".to_string(),
        score: None,
        text: truncate_chars(&value.to_string(), max_chars_per_item),
    });
    snippets
}

fn push_unique_snippet(
    snippets: &mut Vec<ContextSnippet>,
    seen_keys: &mut HashSet<String>,
    snippet: ContextSnippet,
    max_items: usize,
) -> bool {
    if snippets.len() >= max_items {
        return false;
    }
    let key = format!("{}::{}", snippet.source_step, snippet.id);
    if !seen_keys.insert(key) {
        return false;
    }
    snippets.push(snippet);
    true
}

fn derive_retrieval_query(
    original_input: &str,
    workflow: &Workflow,
    _step: &WorkflowStep,
) -> String {
    let payload = if let Some((_, body)) = original_input.split_once(":::") {
        body.trim()
    } else {
        original_input.trim()
    };
    let goal = workflow.meta.goal.as_deref().unwrap_or_default().trim();
    if payload.is_empty() {
        return goal.to_string();
    }
    if goal.is_empty() {
        return payload.to_string();
    }
    format!("{} {}", payload, goal)
}

fn render_injected_input(
    original_input: &str,
    snippets: &[ContextSnippet],
    workflow: &Workflow,
    step: &WorkflowStep,
) -> String {
    let mut block = String::new();
    block.push_str("Context Service Injection (deterministic):\n");
    block.push_str(&format!(
        "workflow={} step={}\n",
        workflow.meta.name, step.id
    ));
    for snippet in snippets {
        if let Some(score) = snippet.score {
            block.push_str(&format!(
                "- source={} id={} score={:.4} text={}\n",
                snippet.source_step, snippet.id, score, snippet.text
            ));
        } else {
            block.push_str(&format!(
                "- source={} id={} text={}\n",
                snippet.source_step, snippet.id, snippet.text
            ));
        }
    }
    let block = block.trim_end();

    if let Some((role, payload)) = original_input.split_once(":::") {
        let role = role.trim();
        let payload = payload.trim();
        if payload.is_empty() {
            return format!("{}:::\n\n{}", role, block);
        }
        return format!("{}:::{}\n\n{}", role, payload, block);
    }

    let input = original_input.trim();
    if input.is_empty() {
        return block.to_string();
    }
    format!("{}\n\n{}", input, block)
}

fn truncate_chars(text: &str, max_chars: usize) -> String {
    if text.chars().count() <= max_chars {
        return text.to_string();
    }
    let prefix = text.chars().take(max_chars / 2).collect::<String>();
    let suffix = text
        .chars()
        .rev()
        .take(max_chars / 2)
        .collect::<Vec<_>>()
        .into_iter()
        .rev()
        .collect::<String>();
    format!("{}...(truncated)...{}", prefix, suffix)
}

#[cfg(test)]
mod tests {
    use super::{ContextService, DeterministicContextService};
    use crate::engine::context_retrieval::{ContextRetrievalService, RetrievedContextItem};
    use crate::engine::workflow_engine::instance::WorkflowInstance;
    use crate::skill::io::{SkillInput, SkillOutput};
    use crate::workflow::model::{FailureStrategy, Workflow, WorkflowMeta, WorkflowStep};
    use anyhow::Result;
    use serde_json::json;
    use std::collections::HashMap;
    use std::sync::Arc;

    fn sample_workflow() -> Workflow {
        Workflow {
            meta: WorkflowMeta {
                name: "ctx".to_string(),
                domain: Some("agent".to_string()),
                goal: None,
                target_type: None,
                routing_policy: None,
                security_policy: None,
                resource_budget: None,
                projected_cost: None,
                projected_latency_ms: None,
                projected_steps: None,
            },
            steps: vec![
                WorkflowStep {
                    id: "retrieve_context".to_string(),
                    skill: "agent.semantic_search".to_string(),
                    input: "3:::abc".to_string(),
                    depends_on: Vec::new(),
                    condition: None,
                    retry: None,
                    on_failure: FailureStrategy::FailFast,
                },
                WorkflowStep {
                    id: "plan".to_string(),
                    skill: "agent.llm_subagent".to_string(),
                    input: "architect:::Plan change".to_string(),
                    depends_on: vec!["retrieve_context".to_string()],
                    condition: None,
                    retry: None,
                    on_failure: FailureStrategy::FailFast,
                },
            ],
        }
    }

    #[test]
    fn injects_context_for_llm_subagent_from_dependency_results() {
        let workflow = sample_workflow();
        let mut instance = WorkflowInstance::new(&workflow, None);
        instance.step_results = HashMap::from([(
            "retrieve_context".to_string(),
            SkillOutput::json(json!({
                "results": [
                    {"id":"doc-1","score":0.91,"text":"important context"}
                ]
            })),
        )]);

        let service = DeterministicContextService::default();
        let step = &workflow.steps[1];
        let out = service
            .inject(
                &workflow,
                step,
                &instance,
                "agent.llm_subagent",
                SkillInput::Text(step.input.clone()),
            )
            .expect("inject");
        let text = out.input.as_text().expect("text").to_string();
        assert!(text.contains("Context Service Injection (deterministic):"));
        assert!(text.contains("source=retrieve_context"));
        assert_eq!(out.injected_items, 1);
    }

    #[test]
    fn skips_injection_for_non_llm_steps() {
        let workflow = sample_workflow();
        let instance = WorkflowInstance::new(&workflow, None);
        let service = DeterministicContextService::default();
        let step = &workflow.steps[0];
        let out = service
            .inject(
                &workflow,
                step,
                &instance,
                "agent.semantic_search",
                SkillInput::Text(step.input.clone()),
            )
            .expect("inject");
        assert_eq!(out.injected_items, 0);
        assert_eq!(out.input.as_text(), Some(step.input.as_str()));
    }

    #[derive(Default)]
    struct StubRetrievalService;

    impl ContextRetrievalService for StubRetrievalService {
        fn retrieve(&self, _query: &str, limit: usize) -> Result<Vec<RetrievedContextItem>> {
            let items = vec![
                RetrievedContextItem {
                    source: "vector_index".to_string(),
                    id: "doc-a".to_string(),
                    score: 0.9,
                    text: "backend context A".to_string(),
                },
                RetrievedContextItem {
                    source: "vector_index".to_string(),
                    id: "doc-b".to_string(),
                    score: 0.8,
                    text: "backend context B".to_string(),
                },
            ];
            Ok(items.into_iter().take(limit).collect())
        }
    }

    #[test]
    fn injects_backend_retrieval_when_dependency_context_is_missing() {
        let workflow = sample_workflow();
        let instance = WorkflowInstance::new(&workflow, None);
        let service =
            DeterministicContextService::with_retrieval_service(Arc::new(StubRetrievalService));
        let step = &workflow.steps[1];
        let out = service
            .inject(
                &workflow,
                step,
                &instance,
                "agent.llm_subagent",
                SkillInput::Text(step.input.clone()),
            )
            .expect("inject");
        let text = out.input.as_text().expect("text");
        assert!(text.contains("source=vector_index id=doc-a"));
        assert!(out.injected_items >= 1);
    }
}
