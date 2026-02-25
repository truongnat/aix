use crate::workflow::model::WorkflowStep;
use std::collections::{HashMap, HashSet, VecDeque};

/// Execution graph for workflow steps with dependency resolution
pub struct ExecutionGraph {
    /// Mapping of step to steps that depend on it
    pub adjacency: HashMap<String, Vec<String>>,
    /// In-degree count for each step
    pub in_degree: HashMap<String, usize>,
    /// All step IDs
    pub nodes: HashSet<String>,
}

impl ExecutionGraph {
    pub fn new() -> Self {
        Self {
            adjacency: HashMap::new(),
            in_degree: HashMap::new(),
            nodes: HashSet::new(),
        }
    }

    /// Build graph from workflow steps
    pub fn from_steps(steps: &[WorkflowStep]) -> Self {
        let mut graph = Self::new();
        for step in steps {
            graph.add_step(&step.id, &step.depends_on);
        }
        graph
    }

    /// Add a step and its dependencies to the graph
    pub fn add_step(&mut self, step_id: &str, depends_on: &[String]) {
        self.nodes.insert(step_id.to_string());

        // Ensure in_degree entry exists
        self.in_degree.entry(step_id.to_string()).or_insert(0);

        for dep in depends_on {
            self.nodes.insert(dep.to_string());
            self.adjacency
                .entry(dep.clone())
                .or_default()
                .push(step_id.to_string());

            *self.in_degree.entry(step_id.to_string()).or_insert(0) += 1;
        }
    }

    /// Get all steps with zero in-degree (ready to execute)
    #[allow(dead_code)]
    pub fn get_ready_steps(&self) -> Vec<String> {
        self.in_degree
            .iter()
            .filter(|(_, &deg)| deg == 0)
            .map(|(id, _)| id.clone())
            .collect()
    }

    /// Topological sort using Kahn's algorithm
    /// Returns execution order as Vec of step IDs
    #[allow(dead_code)]
    pub fn topo_sort(&self) -> Result<Vec<String>, String> {
        let mut in_degree = self.in_degree.clone();
        let mut queue: VecDeque<String> = in_degree
            .iter()
            .filter(|(_, &deg)| deg == 0)
            .map(|(id, _)| id.clone())
            .collect();

        let mut order = Vec::new();
        while let Some(u) = queue.pop_front() {
            order.push(u.clone());

            if let Some(neighbors) = self.adjacency.get(&u) {
                for v in neighbors {
                    let deg = in_degree.get_mut(v).unwrap();
                    *deg -= 1;
                    if *deg == 0 {
                        queue.push_back(v.clone());
                    }
                }
            }
        }

        if order.len() != self.nodes.len() {
            return Err("Cycle detected in workflow graph".to_string());
        }

        Ok(order)
    }
}
