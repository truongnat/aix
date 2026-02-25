use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DecomposedGoal {
    pub main_objective: String,
    pub sub_goals: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AutonomyLimits {
    pub max_subgoals: usize,
    pub max_total_steps: usize,
    pub max_replans: usize,
}

impl Default for AutonomyLimits {
    fn default() -> Self {
        Self {
            max_subgoals: 8,
            max_total_steps: 32,
            max_replans: 5,
        }
    }
}

pub trait GoalDecomposer {
    fn decompose(&self, objective: &str) -> DecomposedGoal;
}

pub struct DeterministicDecomposer;

impl DeterministicDecomposer {
    pub fn new() -> Self {
        Self
    }
}

impl GoalDecomposer for DeterministicDecomposer {
    fn decompose(&self, objective: &str) -> DecomposedGoal {
        let connectors = [" and ", " then ", " after ", " before ", ", then ", " & "];

        let mut sub_goals = vec![objective.to_string()];

        for connector in connectors {
            let mut new_sub_goals = Vec::new();
            for goal in sub_goals {
                if goal.to_lowercase().contains(connector) {
                    let parts: Vec<String> = goal
                        .split(&connector.to_lowercase())
                        .map(|s| s.trim().to_string())
                        .filter(|s| !s.is_empty())
                        .collect();
                    new_sub_goals.extend(parts);
                } else {
                    new_sub_goals.push(goal);
                }
            }
            sub_goals = new_sub_goals;
        }

        // Final trimming just in case
        let final_goals = sub_goals
            .into_iter()
            .map(|s| s.trim().to_string())
            .filter(|s| !s.is_empty())
            .take(8) // Bounded by max sub-goals
            .collect();

        DecomposedGoal {
            main_objective: objective.to_string(),
            sub_goals: final_goals,
        }
    }
}
