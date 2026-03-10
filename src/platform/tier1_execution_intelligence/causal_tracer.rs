// Causal Tracer - record decision causality and data lineage

use crate::platform::types::{DataSource, StepId};
use crate::platform::Result;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Causal tracer for decision and data lineage tracking
pub struct CausalTracer {
    decisions: Vec<Decision>,
    triggers: Vec<StepTrigger>,
    derivations: Vec<OutputDerivation>,
}

/// A decision made during execution
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Decision {
    pub decision_id: String,
    pub timestamp_ms: u64,
    pub decision_type: DecisionType,
    pub inputs: Vec<DataSource>,
    pub rationale: String,
    pub confidence: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DecisionType {
    PlanGeneration,
    Replan,
    StepExecution,
    ErrorHandling,
    ResourceAllocation,
}

/// Step trigger with causal information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StepTrigger {
    pub step_id: StepId,
    pub timestamp_ms: u64,
    pub cause: TriggerCause,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TriggerCause {
    DependencyResolved { dependency_step: StepId },
    UserRequest { request_id: String },
    ReplanDecision { plan_version: u32, reason: String },
    FeedbackSignal { signal_type: String, value: f64 },
}

/// Output derivation tracking
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OutputDerivation {
    pub output_id: String,
    pub step_id: StepId,
    pub timestamp_ms: u64,
    pub sources: Vec<DataSource>,
}

/// Causal graph representation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CausalGraph {
    pub nodes: Vec<CausalNode>,
    pub edges: Vec<CausalEdge>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CausalNode {
    pub node_id: String,
    pub node_type: NodeType,
    pub timestamp_ms: u64,
    pub data: serde_json::Value,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum NodeType {
    Decision,
    StepExecution,
    DataTransformation,
    ExternalEvent,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CausalEdge {
    pub from_node: String,
    pub to_node: String,
    pub edge_type: EdgeType,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum EdgeType {
    Causes,
    DependsOn,
    DerivedFrom,
}

impl CausalTracer {
    pub fn new() -> Self {
        Self {
            decisions: Vec::new(),
            triggers: Vec::new(),
            derivations: Vec::new(),
        }
    }

    /// Log a decision
    pub fn log_decision(&mut self, decision: Decision) -> Result<()> {
        self.decisions.push(decision);
        Ok(())
    }

    /// Log a step trigger
    pub fn log_step_trigger(&mut self, step_id: &StepId, cause: TriggerCause) -> Result<()> {
        self.triggers.push(StepTrigger {
            step_id: step_id.clone(),
            timestamp_ms: crate::platform::types::current_timestamp_ms(),
            cause,
        });
        Ok(())
    }

    /// Log output derivation
    pub fn log_output_derivation(
        &mut self,
        output_id: String,
        step_id: StepId,
        sources: Vec<DataSource>,
    ) -> Result<()> {
        self.derivations.push(OutputDerivation {
            output_id,
            step_id,
            timestamp_ms: crate::platform::types::current_timestamp_ms(),
            sources,
        });
        Ok(())
    }

    /// Export causal graph
    pub fn export_causal_graph(&self) -> Result<CausalGraph> {
        let mut nodes = Vec::new();
        let mut edges = Vec::new();
        let mut node_map: HashMap<String, usize> = HashMap::new();

        // Create nodes for decisions
        for decision in &self.decisions {
            let node = CausalNode {
                node_id: decision.decision_id.clone(),
                node_type: NodeType::Decision,
                timestamp_ms: decision.timestamp_ms,
                data: serde_json::json!({
                    "type": format!("{:?}", decision.decision_type),
                    "confidence": decision.confidence,
                    "rationale": decision.rationale,
                }),
            };
            node_map.insert(decision.decision_id.clone(), nodes.len());
            nodes.push(node);

            // Create edges from inputs to decision
            for input in &decision.inputs {
                let input_node_id = format!("data_{}", input.reference);
                if !node_map.contains_key(&input_node_id) {
                    let input_node = CausalNode {
                        node_id: input_node_id.clone(),
                        node_type: NodeType::DataTransformation,
                        timestamp_ms: input.timestamp_ms,
                        data: serde_json::json!({
                            "source_type": format!("{:?}", input.source_type),
                            "reference": input.reference,
                        }),
                    };
                    node_map.insert(input_node_id.clone(), nodes.len());
                    nodes.push(input_node);
                }

                edges.push(CausalEdge {
                    from_node: input_node_id,
                    to_node: decision.decision_id.clone(),
                    edge_type: EdgeType::DependsOn,
                });
            }
        }

        // Create nodes for step triggers
        for trigger in &self.triggers {
            let node_id = format!("trigger_{}", trigger.step_id);
            let node = CausalNode {
                node_id: node_id.clone(),
                node_type: NodeType::StepExecution,
                timestamp_ms: trigger.timestamp_ms,
                data: serde_json::json!({
                    "step_id": trigger.step_id,
                    "cause": format!("{:?}", trigger.cause),
                }),
            };
            node_map.insert(node_id.clone(), nodes.len());
            nodes.push(node);

            // Create edges based on cause
            match &trigger.cause {
                TriggerCause::DependencyResolved { dependency_step } => {
                    let dep_node_id = format!("trigger_{}", dependency_step);
                    edges.push(CausalEdge {
                        from_node: dep_node_id,
                        to_node: node_id,
                        edge_type: EdgeType::Causes,
                    });
                }
                TriggerCause::ReplanDecision { plan_version, .. } => {
                    // Link to replan decision if it exists
                    let decision_id = format!("replan_v{}", plan_version);
                    if node_map.contains_key(&decision_id) {
                        edges.push(CausalEdge {
                            from_node: decision_id,
                            to_node: node_id,
                            edge_type: EdgeType::Causes,
                        });
                    }
                }
                TriggerCause::UserRequest { request_id } => {
                    // Create external event node for user request
                    let req_node_id = format!("request_{}", request_id);
                    if !node_map.contains_key(&req_node_id) {
                        let req_node = CausalNode {
                            node_id: req_node_id.clone(),
                            node_type: NodeType::ExternalEvent,
                            timestamp_ms: trigger.timestamp_ms,
                            data: serde_json::json!({
                                "type": "user_request",
                                "request_id": request_id,
                            }),
                        };
                        node_map.insert(req_node_id.clone(), nodes.len());
                        nodes.push(req_node);
                    }
                    edges.push(CausalEdge {
                        from_node: req_node_id,
                        to_node: node_id,
                        edge_type: EdgeType::Causes,
                    });
                }
                TriggerCause::FeedbackSignal { signal_type, value } => {
                    // Create external event node for feedback signal
                    let signal_node_id = format!("signal_{}_{}", signal_type, trigger.timestamp_ms);
                    let signal_node = CausalNode {
                        node_id: signal_node_id.clone(),
                        node_type: NodeType::ExternalEvent,
                        timestamp_ms: trigger.timestamp_ms,
                        data: serde_json::json!({
                            "type": "feedback_signal",
                            "signal_type": signal_type,
                            "value": value,
                        }),
                    };
                    node_map.insert(signal_node_id.clone(), nodes.len());
                    nodes.push(signal_node);

                    edges.push(CausalEdge {
                        from_node: signal_node_id,
                        to_node: node_id,
                        edge_type: EdgeType::Causes,
                    });
                }
            }
        }

        // Create nodes for output derivations
        for derivation in &self.derivations {
            let node_id = format!("output_{}", derivation.output_id);
            let node = CausalNode {
                node_id: node_id.clone(),
                node_type: NodeType::DataTransformation,
                timestamp_ms: derivation.timestamp_ms,
                data: serde_json::json!({
                    "output_id": derivation.output_id,
                    "step_id": derivation.step_id,
                }),
            };
            node_map.insert(node_id.clone(), nodes.len());
            nodes.push(node);

            // Create edges from sources to output
            for source in &derivation.sources {
                let source_node_id = format!("data_{}", source.reference);
                if !node_map.contains_key(&source_node_id) {
                    let source_node = CausalNode {
                        node_id: source_node_id.clone(),
                        node_type: NodeType::DataTransformation,
                        timestamp_ms: source.timestamp_ms,
                        data: serde_json::json!({
                            "source_type": format!("{:?}", source.source_type),
                            "reference": source.reference,
                        }),
                    };
                    node_map.insert(source_node_id.clone(), nodes.len());
                    nodes.push(source_node);
                }

                edges.push(CausalEdge {
                    from_node: source_node_id,
                    to_node: node_id.clone(),
                    edge_type: EdgeType::DerivedFrom,
                });
            }

            // Link step trigger to output
            let trigger_node_id = format!("trigger_{}", derivation.step_id);
            if node_map.contains_key(&trigger_node_id) {
                edges.push(CausalEdge {
                    from_node: trigger_node_id,
                    to_node: node_id,
                    edge_type: EdgeType::Causes,
                });
            }
        }

        let graph = CausalGraph { nodes, edges };

        // Validate acyclicity
        if !is_acyclic(&graph) {
            return Err(crate::platform::PlatformError::CausalTracingError(
                "Causal graph contains cycles".to_string(),
            ));
        }

        Ok(graph)
    }

    /// Query causal chain from output back to root inputs
    pub fn query_causal_chain(&self, output_id: &str) -> Result<Vec<CausalNode>> {
        let graph = self.export_causal_graph()?;
        let output_node_id = format!("output_{}", output_id);

        // Find the output node
        let output_node = graph
            .nodes
            .iter()
            .find(|n| n.node_id == output_node_id)
            .ok_or_else(|| {
                crate::platform::PlatformError::NotFound(format!(
                    "Output node not found: {}",
                    output_id
                ))
            })?;

        // Traverse backwards to find all ancestors
        let mut chain = Vec::new();
        let mut visited = std::collections::HashSet::new();
        let mut queue = std::collections::VecDeque::new();

        queue.push_back(output_node.node_id.clone());
        visited.insert(output_node.node_id.clone());

        while let Some(current_id) = queue.pop_front() {
            // Find the node
            if let Some(node) = graph.nodes.iter().find(|n| n.node_id == current_id) {
                chain.push(node.clone());

                // Find all incoming edges
                for edge in &graph.edges {
                    if edge.to_node == current_id && !visited.contains(&edge.from_node) {
                        visited.insert(edge.from_node.clone());
                        queue.push_back(edge.from_node.clone());
                    }
                }
            }
        }

        // Sort by timestamp (oldest first)
        chain.sort_by_key(|n| n.timestamp_ms);

        Ok(chain)
    }

    /// Get all decisions
    pub fn get_decisions(&self) -> &[Decision] {
        &self.decisions
    }

    /// Get all triggers
    pub fn get_triggers(&self) -> &[StepTrigger] {
        &self.triggers
    }

    /// Get all derivations
    pub fn get_derivations(&self) -> &[OutputDerivation] {
        &self.derivations
    }
}

impl Default for CausalTracer {
    fn default() -> Self {
        Self::new()
    }
}

/// Check if a causal graph is acyclic using depth-first search
fn is_acyclic(graph: &CausalGraph) -> bool {
    use std::collections::{HashMap, HashSet};

    // Build adjacency list
    let mut adj_list: HashMap<String, Vec<String>> = HashMap::new();
    for node in &graph.nodes {
        adj_list.entry(node.node_id.clone()).or_default();
    }
    for edge in &graph.edges {
        adj_list
            .entry(edge.from_node.clone())
            .or_default()
            .push(edge.to_node.clone());
    }

    // Track visited nodes and nodes in current path
    let mut visited = HashSet::new();
    let mut in_path = HashSet::new();

    // DFS helper function
    fn has_cycle(
        node: &str,
        adj_list: &HashMap<String, Vec<String>>,
        visited: &mut HashSet<String>,
        in_path: &mut HashSet<String>,
    ) -> bool {
        if in_path.contains(node) {
            return true; // Cycle detected
        }

        if visited.contains(node) {
            return false; // Already processed
        }

        visited.insert(node.to_string());
        in_path.insert(node.to_string());

        if let Some(neighbors) = adj_list.get(node) {
            for neighbor in neighbors {
                if has_cycle(neighbor, adj_list, visited, in_path) {
                    return true;
                }
            }
        }

        in_path.remove(node);
        false
    }

    // Check each node
    for node in graph.nodes.iter() {
        if !visited.contains(&node.node_id)
            && has_cycle(&node.node_id, &adj_list, &mut visited, &mut in_path)
        {
            return false;
        }
    }

    true
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::platform::types::DataSourceType;

    #[test]
    fn test_log_decision() {
        let mut tracer = CausalTracer::new();
        let decision = Decision {
            decision_id: "d1".to_string(),
            timestamp_ms: 1000,
            decision_type: DecisionType::PlanGeneration,
            inputs: vec![],
            rationale: "test".to_string(),
            confidence: 0.9,
        };

        tracer.log_decision(decision).unwrap();
        assert_eq!(tracer.get_decisions().len(), 1);
    }

    #[test]
    fn test_log_step_trigger() {
        let mut tracer = CausalTracer::new();
        let cause = TriggerCause::UserRequest {
            request_id: "req1".to_string(),
        };

        tracer
            .log_step_trigger(&"step1".to_string(), cause)
            .unwrap();
        assert_eq!(tracer.get_triggers().len(), 1);
    }

    #[test]
    fn test_export_causal_graph() {
        let mut tracer = CausalTracer::new();

        let decision = Decision {
            decision_id: "d1".to_string(),
            timestamp_ms: 1000,
            decision_type: DecisionType::PlanGeneration,
            inputs: vec![],
            rationale: "test".to_string(),
            confidence: 0.9,
        };
        tracer.log_decision(decision).unwrap();

        let graph = tracer.export_causal_graph().unwrap();
        assert_eq!(graph.nodes.len(), 1);
    }

    #[test]
    fn test_acyclic_graph() {
        let graph = CausalGraph {
            nodes: vec![
                CausalNode {
                    node_id: "a".to_string(),
                    node_type: NodeType::Decision,
                    timestamp_ms: 1000,
                    data: serde_json::json!({}),
                },
                CausalNode {
                    node_id: "b".to_string(),
                    node_type: NodeType::StepExecution,
                    timestamp_ms: 2000,
                    data: serde_json::json!({}),
                },
            ],
            edges: vec![CausalEdge {
                from_node: "a".to_string(),
                to_node: "b".to_string(),
                edge_type: EdgeType::Causes,
            }],
        };

        assert!(is_acyclic(&graph));
    }

    #[test]
    fn test_cyclic_graph() {
        let graph = CausalGraph {
            nodes: vec![
                CausalNode {
                    node_id: "a".to_string(),
                    node_type: NodeType::Decision,
                    timestamp_ms: 1000,
                    data: serde_json::json!({}),
                },
                CausalNode {
                    node_id: "b".to_string(),
                    node_type: NodeType::StepExecution,
                    timestamp_ms: 2000,
                    data: serde_json::json!({}),
                },
            ],
            edges: vec![
                CausalEdge {
                    from_node: "a".to_string(),
                    to_node: "b".to_string(),
                    edge_type: EdgeType::Causes,
                },
                CausalEdge {
                    from_node: "b".to_string(),
                    to_node: "a".to_string(),
                    edge_type: EdgeType::Causes,
                },
            ],
        };

        assert!(!is_acyclic(&graph));
    }

    #[test]
    fn test_log_output_derivation() {
        let mut tracer = CausalTracer::new();

        let source = DataSource {
            source_type: DataSourceType::StepOutput,
            reference: "step1_output".to_string(),
            timestamp_ms: 1000,
        };

        tracer
            .log_output_derivation("output1".to_string(), "step2".to_string(), vec![source])
            .unwrap();

        assert_eq!(tracer.get_derivations().len(), 1);
    }

    #[test]
    fn test_query_causal_chain() {
        let mut tracer = CausalTracer::new();

        // Create a simple causal chain
        let source = DataSource {
            source_type: DataSourceType::UserInput,
            reference: "input1".to_string(),
            timestamp_ms: 1000,
        };

        tracer
            .log_step_trigger(
                &"step1".to_string(),
                TriggerCause::UserRequest {
                    request_id: "req1".to_string(),
                },
            )
            .unwrap();

        tracer
            .log_output_derivation("output1".to_string(), "step1".to_string(), vec![source])
            .unwrap();

        let chain = tracer.query_causal_chain("output1").unwrap();
        assert!(!chain.is_empty());
    }

    #[test]
    fn test_decision_with_inputs() {
        let mut tracer = CausalTracer::new();

        let input = DataSource {
            source_type: DataSourceType::StepOutput,
            reference: "prev_step".to_string(),
            timestamp_ms: 1000,
        };

        let decision = Decision {
            decision_id: "d1".to_string(),
            timestamp_ms: 2000,
            decision_type: DecisionType::Replan,
            inputs: vec![input],
            rationale: "Need to adjust plan based on previous step".to_string(),
            confidence: 0.85,
        };

        tracer.log_decision(decision).unwrap();

        let graph = tracer.export_causal_graph().unwrap();
        // Should have decision node and input data node
        assert!(graph.nodes.len() >= 2);
        // Should have edge from input to decision
        assert!(!graph.edges.is_empty());
    }

    #[test]
    fn test_dependency_chain() {
        let mut tracer = CausalTracer::new();

        // Step 1 triggered by user
        tracer
            .log_step_trigger(
                &"step1".to_string(),
                TriggerCause::UserRequest {
                    request_id: "req1".to_string(),
                },
            )
            .unwrap();

        // Step 2 triggered by step 1 completion
        tracer
            .log_step_trigger(
                &"step2".to_string(),
                TriggerCause::DependencyResolved {
                    dependency_step: "step1".to_string(),
                },
            )
            .unwrap();

        // Step 3 triggered by step 2 completion
        tracer
            .log_step_trigger(
                &"step3".to_string(),
                TriggerCause::DependencyResolved {
                    dependency_step: "step2".to_string(),
                },
            )
            .unwrap();

        let graph = tracer.export_causal_graph().unwrap();

        // Should have nodes for all steps plus user request
        assert!(graph.nodes.len() >= 4);

        // Should be acyclic
        assert!(is_acyclic(&graph));

        // Should have causal edges
        assert!(graph.edges.len() >= 2);
    }
}

#[cfg(test)]
mod property_tests {
    use super::*;
    use proptest::prelude::*;

    // **Validates: Requirements 2.5**
    // Property 2: Causal Graph is Acyclic
    //
    // This property test verifies that any causal graph constructed by the CausalTracer
    // is always acyclic. No event can be its own cause, directly or indirectly.
    //
    // The property states: ∀ graph: CausalGraph, ¬∃ path where path forms a cycle
    proptest! {
        #[test]
        fn prop_causal_graph_is_always_acyclic(
            num_decisions in 0usize..10,
            num_triggers in 0usize..10,
            num_derivations in 0usize..10,
        ) {
            let mut tracer = CausalTracer::new();

            // Add random decisions
            for i in 0..num_decisions {
                let decision = Decision {
                    decision_id: format!("decision_{}", i),
                    timestamp_ms: 1000 + (i as u64 * 100),
                    decision_type: DecisionType::PlanGeneration,
                    inputs: vec![],
                    rationale: format!("Decision {}", i),
                    confidence: 0.8,
                };
                tracer.log_decision(decision).unwrap();
            }

            // Add random step triggers with dependencies forming a DAG
            for i in 0..num_triggers {
                let cause = if i == 0 {
                    TriggerCause::UserRequest {
                        request_id: "req1".to_string(),
                    }
                } else {
                    // Create dependency on previous step to ensure DAG structure
                    TriggerCause::DependencyResolved {
                        dependency_step: format!("step_{}", i - 1),
                    }
                };

                tracer.log_step_trigger(&format!("step_{}", i), cause).unwrap();
            }

            // Add random output derivations
            for i in 0..num_derivations {
                let source = crate::platform::types::DataSource {
                    source_type: crate::platform::types::DataSourceType::UserInput,
                    reference: format!("input_{}", i),
                    timestamp_ms: 1000 + (i as u64 * 50),
                };

                tracer.log_output_derivation(
                    format!("output_{}", i),
                    format!("step_{}", i % num_triggers.max(1)),
                    vec![source],
                ).unwrap();
            }

            // Export the graph - this should never fail due to cycles
            let graph = tracer.export_causal_graph();

            // The graph must be successfully constructed (no cycle error)
            prop_assert!(graph.is_ok(), "Graph construction failed due to cycle detection");

            // Verify the graph is acyclic
            let graph = graph.unwrap();
            prop_assert!(is_acyclic(&graph), "Generated causal graph contains a cycle");
        }

        #[test]
        fn prop_query_causal_chain_returns_valid_path(
            num_steps in 1usize..10,
        ) {
            let mut tracer = CausalTracer::new();

            // Create a linear chain of steps
            for i in 0..num_steps {
                let cause = if i == 0 {
                    TriggerCause::UserRequest {
                        request_id: "req1".to_string(),
                    }
                } else {
                    TriggerCause::DependencyResolved {
                        dependency_step: format!("step_{}", i - 1),
                    }
                };

                tracer.log_step_trigger(&format!("step_{}", i), cause).unwrap();

                // Add output for this step
                let source = crate::platform::types::DataSource {
                    source_type: crate::platform::types::DataSourceType::StepOutput,
                    reference: format!("step_{}_input", i),
                    timestamp_ms: 1000 + (i as u64 * 100),
                };

                tracer.log_output_derivation(
                    format!("output_{}", i),
                    format!("step_{}", i),
                    vec![source],
                ).unwrap();
            }

            // Query the causal chain for the last output
            let last_output = format!("output_{}", num_steps - 1);
            let chain = tracer.query_causal_chain(&last_output);

            prop_assert!(chain.is_ok(), "Failed to query causal chain");

            let chain = chain.unwrap();

            // Chain should not be empty
            prop_assert!(!chain.is_empty(), "Causal chain is empty");

            // Chain should be sorted by timestamp (oldest first)
            for i in 1..chain.len() {
                prop_assert!(
                    chain[i - 1].timestamp_ms <= chain[i].timestamp_ms,
                    "Causal chain is not sorted by timestamp"
                );
            }
        }
    }
}
