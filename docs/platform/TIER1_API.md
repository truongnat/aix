# Tier 1: Execution Intelligence API

## Overview

Tier 1 provides adaptive workflow planning, causal decision tracing, and production feedback integration.

## Components

### 1. AdaptivePlanner

Dynamically re-plan workflow execution when context changes.

#### Interface

```rust
pub trait AdaptivePlanner {
    fn generate_plan(&self, workflow: &Workflow, context: &ExecutionContext) 
        -> Result<ExecutionPlan>;
    
    fn replan(&self, current_plan: &ExecutionPlan, trigger: &ReplanTrigger) 
        -> Result<ExecutionPlan>;
    
    fn should_replan(&self, context: &ExecutionContext) 
        -> Option<ReplanTrigger>;
}
```

#### Usage Example

```rust
use agentic_sdlc::platform::tier1_execution_intelligence::*;

// Create planner
let planner = DefaultAdaptivePlanner::new(config);

// Generate initial plan
let plan = planner.generate_plan(&workflow, &context)?;

// Check if replanning needed
if let Some(trigger) = planner.should_replan(&context) {
    let new_plan = planner.replan(&plan, &trigger)?;
    println!("Replanned due to: {:?}", trigger);
}
```

### 2. CausalTracer

Record decision causality and data lineage for audit trails.

#### Interface

```rust
pub trait CausalTracer {
    fn log_decision(&mut self, decision: Decision) -> Result<()>;
    fn log_step_trigger(&mut self, step_id: &StepId, cause: TriggerCause) -> Result<()>;
    fn log_output_derivation(&mut self, output: &StepOutput, sources: Vec<DataSource>) -> Result<()>;
    fn export_causal_graph(&self) -> Result<CausalGraph>;
}
```

#### Usage Example

```rust
use agentic_sdlc::platform::tier1_execution_intelligence::*;

let mut tracer = DefaultCausalTracer::new();

// Log a decision
tracer.log_decision(Decision {
    decision_id: "dec_001".to_string(),
    timestamp_ms: current_timestamp(),
    decision_type: DecisionType::StepSelection,
    inputs: vec![],
    rationale: "Selected based on priority".to_string(),
    confidence: 0.95,
})?;

// Export causal graph for audit
let graph = tracer.export_causal_graph()?;
```

### 3. FeedbackCollector

Ingest production signals and generate improvement recommendations.

#### Interface

```rust
pub trait FeedbackCollector {
    fn ingest_signal(&mut self, signal: ProductionSignal) -> Result<()>;
    fn aggregate_signals(&self, time_window: Duration) -> Result<FeedbackSummary>;
    fn get_recommendations(&self, workflow_id: &str) -> Result<Vec<Recommendation>>;
}
```

#### Usage Example

```rust
use agentic_sdlc::platform::tier1_execution_intelligence::*;

let mut collector = DefaultFeedbackCollector::new();

// Ingest production signal
collector.ingest_signal(ProductionSignal {
    signal_id: "sig_001".to_string(),
    timestamp_ms: current_timestamp(),
    signal_type: SignalType::ErrorRate { 
        service: "api".to_string(), 
        rate: 0.05 
    },
    severity: Severity::Medium,
    metadata: HashMap::new(),
})?;

// Get recommendations
let recommendations = collector.get_recommendations("workflow_123")?;
for rec in recommendations {
    println!("Recommendation: {}", rec.rationale);
}
```

## Configuration

```toml
[tier1_execution_intelligence]
max_replans = 5
confidence_threshold = 0.7
export_causal_graph = false
feedback_window_secs = 3600
```

## See Also

- [Usage Examples](../examples/TIER1_EXAMPLES.md)
- [Design Document](../../.kiro/specs/next-level-platform-improvements/design.md)
