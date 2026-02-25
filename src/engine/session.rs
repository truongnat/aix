use crate::engine::git::{BranchingPolicy, GitBranchOrchestrator};
use crate::engine::project::AgentProjectLayout;
use anyhow::{anyhow, Result};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum LlmProvider {
    Ollama,
    OpenAI,
    Gemini,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LlmAdapter {
    pub provider: LlmProvider,
    pub model: String,
    pub temperature: f32,
}

impl Default for LlmAdapter {
    fn default() -> Self {
        Self {
            provider: LlmProvider::Ollama,
            model: "qwen3:8b".to_string(),
            temperature: 0.1,
        }
    }
}

#[derive(Debug, Clone)]
pub struct AgentSession {
    pub project_root: String,
    pub active_thread_id: String,
    pub active_branch: String,
    pub branching_policy: BranchingPolicy,
    pub loaded_workflows: Vec<String>,
    pub vector_index_handle: String,
    pub llm_adapter: LlmAdapter,
}

impl AgentSession {
    pub fn new(
        project_root: &str,
        active_thread_id: &str,
        layout: &AgentProjectLayout,
        llm_adapter: LlmAdapter,
    ) -> Result<Self> {
        let branch_rules = layout.load_branching_rules()?;
        let prefix = branch_rules
            .prefix
            .as_deref()
            .unwrap_or("thread/")
            .to_string();
        let branching_policy = BranchingPolicy {
            prefix: prefix.clone(),
            allow_auto_create: branch_rules.allow_auto_create.unwrap_or(true),
            allow_auto_checkout: branch_rules.allow_auto_checkout.unwrap_or(true),
        };
        let active_branch =
            GitBranchOrchestrator::branch_for_thread_with_prefix(active_thread_id, &prefix);
        let mut loaded_workflows: Vec<String> = layout.loaded_workflows.keys().cloned().collect();
        loaded_workflows.sort();
        Ok(Self {
            project_root: project_root.to_string(),
            active_thread_id: active_thread_id.to_string(),
            active_branch,
            branching_policy,
            loaded_workflows,
            vector_index_handle: layout
                .memory_dir
                .join("vector_index.json")
                .to_string_lossy()
                .to_string(),
            llm_adapter,
        })
    }

    pub fn ensure_thread_branch(&self) -> Result<()> {
        if self.llm_adapter.model.trim().is_empty() {
            return Err(anyhow!(
                "Session llm adapter model is empty; configure a valid model name"
            ));
        }
        if self.vector_index_handle.trim().is_empty() {
            return Err(anyhow!(
                "Session vector index handle is empty; expected path under .agent/memory"
            ));
        }
        let orchestrator = GitBranchOrchestrator::new_with_policy(
            &self.project_root,
            self.branching_policy.clone(),
        );
        orchestrator.ensure_branch_checked_out(&self.active_branch)
    }

    pub fn summary_line(&self) -> String {
        format!(
            "🧵 Session thread='{}' branch='{}' workflows={} llm={:?}/{} vector_index='{}'",
            self.active_thread_id,
            self.active_branch,
            self.loaded_workflows.len(),
            self.llm_adapter.provider,
            self.llm_adapter.model,
            self.vector_index_handle
        )
    }
}
