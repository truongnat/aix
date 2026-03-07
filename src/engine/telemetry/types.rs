// Core types for telemetry
//
// This module defines the types used for OpenTelemetry integration
// and observability.

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Telemetry configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TelemetryConfig {
    /// Enable/disable telemetry
    pub enabled: bool,
    /// OTLP endpoint URL
    pub endpoint: String,
    /// Service name
    pub service_name: String,
    /// Export interval in milliseconds
    pub export_interval_ms: u64,
    /// Batch size for export
    pub batch_size: usize,
    /// Timeout for export in milliseconds
    pub timeout_ms: u64,
    /// Sample rate (0.0 to 1.0)
    pub sample_rate: f64,
    /// Enable metrics collection
    pub enable_metrics: bool,
    /// Metrics collection interval in milliseconds
    pub metrics_interval_ms: u64,
}

impl Default for TelemetryConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            endpoint: "http://localhost:4317".to_string(),
            service_name: "agentic-sdlc".to_string(),
            export_interval_ms: 5000,
            batch_size: 512,
            timeout_ms: 10000,
            sample_rate: 1.0,
            enable_metrics: true,
            metrics_interval_ms: 60000,
        }
    }
}

impl TelemetryConfig {
    /// Create config from environment variables
    pub fn from_env() -> Self {
        let mut config = Self::default();

        if let Ok(endpoint) = std::env::var("OTEL_EXPORTER_OTLP_ENDPOINT") {
            config.endpoint = endpoint;
        }

        if let Ok(service_name) = std::env::var("OTEL_SERVICE_NAME") {
            config.service_name = service_name;
        }

        if let Ok(sample_rate) = std::env::var("OTEL_TRACES_SAMPLER_ARG") {
            if let Ok(rate) = sample_rate.parse::<f64>() {
                config.sample_rate = rate.clamp(0.0, 1.0);
            }
        }

        config
    }
}

/// Span attributes for workflow execution
#[derive(Debug, Clone, Default)]
pub struct SpanAttributes {
    /// Workflow ID
    pub workflow_id: Option<String>,
    /// Workflow name
    pub workflow_name: Option<String>,
    /// Step ID
    pub step_id: Option<String>,
    /// Skill ID
    pub skill_id: Option<String>,
    /// Step status
    pub step_status: Option<String>,
    /// Duration in milliseconds
    pub duration_ms: Option<u64>,
    /// Cost
    pub cost: Option<u32>,
    /// LLM provider
    pub llm_provider: Option<String>,
    /// LLM model
    pub llm_model: Option<String>,
    /// LLM tokens
    pub llm_tokens: Option<u32>,
    /// Error message
    pub error_message: Option<String>,
    /// Custom attributes
    pub custom: HashMap<String, String>,
}

impl SpanAttributes {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn with_workflow(mut self, id: String, name: String) -> Self {
        self.workflow_id = Some(id);
        self.workflow_name = Some(name);
        self
    }

    pub fn with_step(mut self, id: String, skill_id: String) -> Self {
        self.step_id = Some(id);
        self.skill_id = Some(skill_id);
        self
    }

    pub fn with_status(mut self, status: String) -> Self {
        self.step_status = Some(status);
        self
    }

    pub fn with_duration(mut self, duration_ms: u64) -> Self {
        self.duration_ms = Some(duration_ms);
        self
    }

    pub fn with_cost(mut self, cost: u32) -> Self {
        self.cost = Some(cost);
        self
    }

    pub fn with_llm(mut self, provider: String, model: String, tokens: u32) -> Self {
        self.llm_provider = Some(provider);
        self.llm_model = Some(model);
        self.llm_tokens = Some(tokens);
        self
    }

    pub fn with_error(mut self, error: String) -> Self {
        self.error_message = Some(error);
        self
    }

    pub fn with_custom(mut self, key: String, value: String) -> Self {
        self.custom.insert(key, value);
        self
    }
}

/// Metrics for workflow execution
#[derive(Debug, Clone, Default)]
pub struct WorkflowMetrics {
    /// Total workflow executions
    pub executions_total: u64,
    /// Total workflow duration in milliseconds
    pub duration_total_ms: u64,
    /// Total workflow cost
    pub cost_total: u32,
    /// Total errors
    pub errors_total: u64,
    /// Step metrics
    pub step_metrics: HashMap<String, StepMetrics>,
}

/// Metrics for step execution
#[derive(Debug, Clone, Default)]
pub struct StepMetrics {
    /// Total step executions
    pub executions_total: u64,
    /// Total step duration in milliseconds
    pub duration_total_ms: u64,
    /// Total step cost
    pub cost_total: u32,
    /// Total errors
    pub errors_total: u64,
    /// LLM metrics (if applicable)
    pub llm_metrics: Option<LlmMetrics>,
}

/// Metrics for LLM calls
#[derive(Debug, Clone, Default)]
pub struct LlmMetrics {
    /// Total LLM calls
    pub calls_total: u64,
    /// Total tokens used
    pub tokens_total: u32,
    /// Total cost
    pub cost_total: u32,
    /// Provider breakdown
    pub provider_metrics: HashMap<String, ProviderMetrics>,
}

/// Metrics per LLM provider
#[derive(Debug, Clone, Default)]
pub struct ProviderMetrics {
    /// Total calls to this provider
    pub calls_total: u64,
    /// Total tokens used
    pub tokens_total: u32,
    /// Total cost
    pub cost_total: u32,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_telemetry_config_default() {
        let config = TelemetryConfig::default();
        assert!(config.enabled);
        assert_eq!(config.endpoint, "http://localhost:4317");
        assert_eq!(config.service_name, "agentic-sdlc");
        assert_eq!(config.sample_rate, 1.0);
    }

    #[test]
    fn test_telemetry_config_from_env() {
        std::env::set_var("OTEL_EXPORTER_OTLP_ENDPOINT", "http://custom:4317");
        std::env::set_var("OTEL_SERVICE_NAME", "test-service");

        let config = TelemetryConfig::from_env();
        assert_eq!(config.endpoint, "http://custom:4317");
        assert_eq!(config.service_name, "test-service");

        std::env::remove_var("OTEL_EXPORTER_OTLP_ENDPOINT");
        std::env::remove_var("OTEL_SERVICE_NAME");
    }

    #[test]
    fn test_span_attributes_builder() {
        let attrs = SpanAttributes::new()
            .with_workflow("wf-1".to_string(), "test-workflow".to_string())
            .with_step("step-1".to_string(), "test-skill".to_string())
            .with_status("completed".to_string())
            .with_duration(1000)
            .with_cost(10);

        assert_eq!(attrs.workflow_id, Some("wf-1".to_string()));
        assert_eq!(attrs.workflow_name, Some("test-workflow".to_string()));
        assert_eq!(attrs.step_id, Some("step-1".to_string()));
        assert_eq!(attrs.duration_ms, Some(1000));
        assert_eq!(attrs.cost, Some(10));
    }

    #[test]
    fn test_span_attributes_with_llm() {
        let attrs = SpanAttributes::new().with_llm("openai".to_string(), "gpt-4".to_string(), 1000);

        assert_eq!(attrs.llm_provider, Some("openai".to_string()));
        assert_eq!(attrs.llm_model, Some("gpt-4".to_string()));
        assert_eq!(attrs.llm_tokens, Some(1000));
    }

    #[test]
    fn test_span_attributes_with_custom() {
        let attrs = SpanAttributes::new()
            .with_custom("key1".to_string(), "value1".to_string())
            .with_custom("key2".to_string(), "value2".to_string());

        assert_eq!(attrs.custom.len(), 2);
        assert_eq!(attrs.custom.get("key1"), Some(&"value1".to_string()));
    }

    #[test]
    fn test_workflow_metrics_default() {
        let metrics = WorkflowMetrics::default();
        assert_eq!(metrics.executions_total, 0);
        assert_eq!(metrics.duration_total_ms, 0);
        assert_eq!(metrics.cost_total, 0);
    }
}
