use crate::engine::budget::ExecutionBudget;
use crate::engine::events::ExecutionEvent;
use crate::engine::registry::DomainRegistry;
use anyhow::{anyhow, Result};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::sync::Arc;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReflectionReport {
    pub score: u8,
    pub rationale: String,
    pub improvements: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExperienceEntry {
    pub objective: String,
    pub sub_goals: Vec<String>,
    pub final_score: u8,
    pub actual_cost: u32,
}

pub struct ReflectiveScorer {
    _domain_registry: Arc<DomainRegistry>,
    client: Client,
    ollama_url: String,
    model: String,
    experience_path: String,
}

impl ReflectiveScorer {
    pub fn new(domain_registry: Arc<DomainRegistry>) -> Self {
        Self {
            _domain_registry: domain_registry,
            client: Client::new(),
            ollama_url: "http://127.0.0.1:11434/api/generate".to_string(),
            model: "qwen2.5-coder:7b".to_string(),
            experience_path: ".agents/memory/experiences.json".to_string(),
        }
    }

    pub async fn reflect(
        &self,
        objective: &str,
        trace: &[ExecutionEvent],
        final_memory: &str,
        projected_cost: u32,
        actual_cost: u32,
        budget: &ExecutionBudget,
    ) -> Result<ReflectionReport> {
        let mut report =
            self.heuristic_reflection(objective, trace, projected_cost, actual_cost, budget)?;

        // LLM reflection can enrich hints but should not weaken deterministic penalties.
        if let Ok(llm_report) = self
            .llm_reflection(objective, trace, final_memory, projected_cost, actual_cost)
            .await
        {
            report.score = report.score.min(llm_report.score.min(10));
            report.rationale = format!("{} {}", report.rationale, llm_report.rationale);
            for improvement in llm_report.improvements {
                if !report.improvements.contains(&improvement) {
                    report.improvements.push(improvement);
                }
            }
        }

        Ok(report)
    }

    fn heuristic_reflection(
        &self,
        objective: &str,
        trace: &[ExecutionEvent],
        projected_cost: u32,
        actual_cost: u32,
        budget: &ExecutionBudget,
    ) -> Result<ReflectionReport> {
        let failures = trace
            .iter()
            .filter(|event| matches!(event, ExecutionEvent::StepFailed { .. }))
            .count();

        let budget_exceeded = trace
            .iter()
            .filter(|event| matches!(event, ExecutionEvent::BudgetExceeded { .. }))
            .count();

        let mut score: i32 = 10;
        score -= (failures as i32) * 2;
        score -= (budget_exceeded as i32) * 3;

        let mut improvements = Vec::new();
        if actual_cost > projected_cost {
            score -= 1;
            improvements.push(format!(
                "Actual cost exceeded projection by {}. Prefer lower-cost skill paths.",
                actual_cost - projected_cost
            ));
        }

        if budget_exceeded > 0 {
            improvements
                .push("Budget limit was reached. Split the goal or increase budget.".to_string());
        }

        let high_cost_threshold = budget.max_total_cost.saturating_mul(8) / 10;
        let history = ExperienceStore::new(&self.experience_path)
            .load()
            .unwrap_or_default();
        let repeated_high_cost = history
            .iter()
            .filter(|entry| {
                entry.objective == objective && entry.actual_cost >= high_cost_threshold
            })
            .count();
        if repeated_high_cost >= 2 {
            score -= 1;
            improvements.push(
                "Repeated high-cost pattern detected for this objective. Add a cheaper deterministic strategy."
                    .to_string(),
            );
        }

        let score = score.clamp(0, 10) as u8;
        let rationale = format!(
            "Projected cost: {}. Actual cost: {}. Failed steps: {}. Budget exceed events: {}.",
            projected_cost, actual_cost, failures, budget_exceeded
        );

        Ok(ReflectionReport {
            score,
            rationale,
            improvements,
        })
    }

    async fn llm_reflection(
        &self,
        objective: &str,
        trace: &[ExecutionEvent],
        final_memory: &str,
        projected_cost: u32,
        actual_cost: u32,
    ) -> Result<ReflectionReport> {
        let trace_summary = trace
            .iter()
            .map(|event| format!("{:?}", event))
            .collect::<Vec<_>>()
            .join("\n");

        let prompt = format!(
            "You are a deterministic workflow runtime reviewer.\n\
             Objective: {objective}\n\
             Projected Cost: {projected_cost}\n\
             Actual Cost: {actual_cost}\n\
             Execution Trace:\n{trace_summary}\n\
             Final Memory:\n{final_memory}\n\n\
             Return strict JSON with fields:\n\
             - score (integer 0..10)\n\
             - rationale (string)\n\
             - improvements (array of strings)\n\
             Keep the response short and focused on cost optimization."
        );

        let response = self
            .client
            .post(&self.ollama_url)
            .json(&json!({
                "model": self.model,
                "prompt": prompt,
                "stream": false,
                "format": "json"
            }))
            .send()
            .await?;

        if !response.status().is_success() {
            return Err(anyhow!("Ollama reflection endpoint returned non-success"));
        }

        let json_val: serde_json::Value = response.json().await?;
        let content = json_val["response"]
            .as_str()
            .ok_or_else(|| anyhow!("Invalid Ollama reflection response: {:?}", json_val))?;

        let mut report: ReflectionReport = serde_json::from_str(content)
            .map_err(|_| anyhow!("Failed to parse reflection response JSON"))?;
        report.score = report.score.min(10);
        Ok(report)
    }
}

pub struct ExperienceStore {
    path: String,
}

impl ExperienceStore {
    pub fn new(path: &str) -> Self {
        Self {
            path: path.to_string(),
        }
    }

    pub fn load(&self) -> Result<Vec<ExperienceEntry>> {
        if let Ok(data) = std::fs::read_to_string(&self.path) {
            Ok(serde_json::from_str(&data).unwrap_or_default())
        } else {
            Ok(Vec::new())
        }
    }

    pub fn learn(&self, entry: ExperienceEntry) -> Result<()> {
        let mut experiences = self.load()?;
        experiences.push(entry);

        // Keep only top 100 entries.
        if experiences.len() > 100 {
            experiences.remove(0);
        }

        let json = serde_json::to_string_pretty(&experiences)?;
        if let Some(parent) = std::path::Path::new(&self.path).parent() {
            std::fs::create_dir_all(parent)?;
        }
        std::fs::write(&self.path, json)?;
        Ok(())
    }
}
