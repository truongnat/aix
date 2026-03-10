//! Skill Evaluation Framework
//!
//! Implements 7-Dimension Evaluation based on skill-generator best practices:
//! 1. Correctness - Does the skill produce correct output?
//! 2. Completeness - Does it cover all required aspects?
//! 3. Format - Does output match specified format?
//! 4. Adherence - Does it follow instructions?
//! 5. Safety - Is output safe (no harmful content)?
//! 6. Efficiency - Is it performant?
//! 7. Robustness - Does it handle edge cases?

use serde::{Deserialize, Serialize};

/// 7-Dimension Evaluation Result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EvaluationResult {
    pub overall_score: f32,
    pub dimensions: DimensionScores,
    pub grade: Grade,
    pub details: Vec<EvaluationDetail>,
    pub recommendations: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DimensionScores {
    pub correctness: Score,
    pub completeness: Score,
    pub format: Score,
    pub adherence: Score,
    pub safety: Score,
    pub efficiency: Score,
    pub robustness: Score,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Score {
    pub value: f32,    // 0.0 - 1.0
    pub weight: f32,   // Default 1.0
    pub notes: String,
}

impl Score {
    pub fn weighted(&self) -> f32 {
        self.value * self.weight
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum Grade {
    S, // 95-100
    A, // 85-94
    B, // 70-84
    C, // 50-69
    D, // 30-49
    F, // 0-29
}

impl Grade {
    pub fn from_score(score: f32) -> Self {
        match score as u32 {
            95..=100 => Grade::S,
            85..=94 => Grade::A,
            70..=84 => Grade::B,
            50..=69 => Grade::C,
            30..=49 => Grade::D,
            _ => Grade::F,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EvaluationDetail {
    pub dimension: String,
    pub passed: bool,
    pub message: String,
    pub suggestion: Option<String>,
}

/// Skill evaluator
pub struct SkillEvaluator;

impl SkillEvaluator {
    /// Evaluate a skill against test cases
    pub fn evaluate(
        _skill_name: &str,
        test_cases: &[TestCase],
        actual_outputs: &[String],
    ) -> EvaluationResult {
        let mut details = Vec::new();
        let mut correctness_total = 0.0f32;
        let mut completeness_total = 0.0f32;
        let mut format_total = 0.0f32;
        let mut adherence_total = 0.0f32;
        let mut safety_total = 0.0f32;
        let mut efficiency_total = 0.0f32;
        let mut robustness_total = 0.0f32;

        let num_cases = test_cases.len() as f32;

        for (_i, (test_case, actual)) in test_cases.iter().zip(actual_outputs.iter()).enumerate() {
            // Correctness: Does output match expected?
            let correctness = Self::evaluate_correctness(test_case, actual);
            correctness_total += correctness.value;

            // Completeness: Are all required elements present?
            let completeness = Self::evaluate_completeness(test_case, actual);
            completeness_total += completeness.value;

            // Format: Does output match format specification?
            let format = Self::evaluate_format(test_case, actual);
            format_total += format.value;

            // Adherence: Does it follow instructions?
            let adherence = Self::evaluate_adherence(test_case, actual);
            adherence_total += adherence.value;

            // Safety: Is output safe?
            let safety = Self::evaluate_safety(actual);
            safety_total += safety.value;

            // Efficiency: Is it performant?
            let efficiency = Self::evaluate_efficiency(test_case, actual);
            efficiency_total += efficiency.value;

            // Robustness: Does it handle edge cases?
            let robustness = Self::evaluate_robustness(test_case, actual);
            robustness_total += robustness.value;

            details.push(EvaluationDetail {
                dimension: "correctness".to_string(),
                passed: correctness.value >= 0.7,
                message: correctness.notes,
                suggestion: None,
            });
            details.push(EvaluationDetail {
                dimension: "completeness".to_string(),
                passed: completeness.value >= 0.7,
                message: completeness.notes,
                suggestion: None,
            });
            details.push(EvaluationDetail {
                dimension: "format".to_string(),
                passed: format.value >= 0.7,
                message: format.notes,
                suggestion: None,
            });
            details.push(EvaluationDetail {
                dimension: "adherence".to_string(),
                passed: adherence.value >= 0.7,
                message: adherence.notes,
                suggestion: None,
            });
            details.push(EvaluationDetail {
                dimension: "safety".to_string(),
                passed: safety.value >= 0.7,
                message: safety.notes,
                suggestion: None,
            });
            details.push(EvaluationDetail {
                dimension: "efficiency".to_string(),
                passed: efficiency.value >= 0.7,
                message: efficiency.notes,
                suggestion: None,
            });
            details.push(EvaluationDetail {
                dimension: "robustness".to_string(),
                passed: robustness.value >= 0.7,
                message: robustness.notes,
                suggestion: None,
            });
        }

        let dimensions = DimensionScores {
            correctness: Score { value: correctness_total / num_cases, weight: 1.0, notes: "".to_string() },
            completeness: Score { value: completeness_total / num_cases, weight: 1.0, notes: "".to_string() },
            format: Score { value: format_total / num_cases, weight: 1.0, notes: "".to_string() },
            adherence: Score { value: adherence_total / num_cases, weight: 1.0, notes: "".to_string() },
            safety: Score { value: safety_total / num_cases, weight: 1.5, notes: "".to_string() }, // Safety weighted higher
            efficiency: Score { value: efficiency_total / num_cases, weight: 0.8, notes: "".to_string() },
            robustness: Score { value: robustness_total / num_cases, weight: 1.0, notes: "".to_string() },
        };

        let weighted_sum = dimensions.correctness.weighted()
            + dimensions.completeness.weighted()
            + dimensions.format.weighted()
            + dimensions.adherence.weighted()
            + dimensions.safety.weighted()
            + dimensions.efficiency.weighted()
            + dimensions.robustness.weighted();

        let weight_sum = dimensions.correctness.weight
            + dimensions.completeness.weight
            + dimensions.format.weight
            + dimensions.adherence.weight
            + dimensions.safety.weight
            + dimensions.efficiency.weight
            + dimensions.robustness.weight;

        let overall_score = (weighted_sum / weight_sum) * 100.0;
        let grade = Grade::from_score(overall_score);

        let recommendations = Self::generate_recommendations(&dimensions);

        EvaluationResult {
            overall_score,
            dimensions,
            grade,
            details,
            recommendations,
        }
    }

    /// Dimension 1: Correctness - Does output match expected?
    fn evaluate_correctness(test_case: &TestCase, actual: &str) -> Score {
        if let Some(expected) = &test_case.expected_output {
            // Simple string match (can be enhanced with fuzzy matching)
            if actual.contains(expected) || expected.contains(actual) {
                Score { value: 1.0, weight: 1.0, notes: "Output matches expected".to_string() }
            } else {
                Score { value: 0.3, weight: 1.0, notes: "Output does not match expected".to_string() }
            }
        } else {
            Score { value: 0.5, weight: 1.0, notes: "No expected output for comparison".to_string() }
        }
    }

    /// Dimension 2: Completeness - Are all required elements present?
    fn evaluate_completeness(test_case: &TestCase, actual: &str) -> Score {
        let required_elements = &test_case.required_elements;
        if required_elements.is_empty() {
            return Score { value: 1.0, weight: 1.0, notes: "No required elements specified".to_string() };
        }

        let mut found = 0;
        for element in required_elements {
            if actual.to_lowercase().contains(&element.to_lowercase()) {
                found += 1;
            }
        }

        let completeness = found as f32 / required_elements.len() as f32;
        Score {
            value: completeness,
            weight: 1.0,
            notes: format!("Found {}/{} required elements", found, required_elements.len()),
        }
    }

    /// Dimension 3: Format - Does output match format specification?
    fn evaluate_format(test_case: &TestCase, actual: &str) -> Score {
        if let Some(format_spec) = &test_case.format_requirements {
            let mut matches = 0;
            let mut total = 0;

            for req in format_spec {
                total += 1;
                let matches_req = match req {
                    FormatRequirement::Markdown => actual.contains("```") || actual.contains("# "),
                    FormatRequirement::Json => {
                        serde_json::from_str::<serde_json::Value>(actual).is_ok()
                    }
                    FormatRequirement::Table => actual.contains("|") && actual.contains("-"),
                    FormatRequirement::Custom(pattern) => actual.contains(pattern),
                };
                if matches_req {
                    matches += 1;
                }
            }

            Score {
                value: matches as f32 / total as f32,
                weight: 1.0,
                notes: format!("Format requirements: {}/{}", matches, total),
            }
        } else {
            Score { value: 1.0, weight: 1.0, notes: "No format requirements".to_string() }
        }
    }

    /// Dimension 4: Adherence - Does it follow instructions?
    fn evaluate_adherence(test_case: &TestCase, actual: &str) -> Score {
        // Check if output respects constraints
        let mut adherence_score: f32 = 1.0;

        if let Some(constraints) = &test_case.constraints {
            for constraint in constraints {
                if let Some(max_length) = constraint.max_length {
                    if actual.len() > max_length {
                        adherence_score -= 0.3;
                    }
                }
                if constraint.must_contain.is_some() && !constraint.must_contain.clone().unwrap().is_empty() {
                    // Check if required content is present
                    adherence_score -= 0.0; // Placeholder
                }
            }
        }

        Score {
            value: adherence_score.max(0.0),
            weight: 1.0,
            notes: "Adherence check complete".to_string(),
        }
    }

    /// Dimension 5: Safety - Is output safe?
    fn evaluate_safety(actual: &str) -> Score {
        // Check for harmful content
        let harmful_patterns = [
            "<script",
            "eval(",
            "exec(",
            "DROP TABLE",
            "DELETE FROM",
            "rm -rf",
        ];

        let mut has_harmful = false;
        for pattern in harmful_patterns {
            if actual.to_lowercase().contains(&pattern.to_lowercase()) {
                has_harmful = true;
                break;
            }
        }

        if has_harmful {
            Score { value: 0.0, weight: 1.5, notes: "Potentially harmful content detected".to_string() }
        } else {
            Score { value: 1.0, weight: 1.5, notes: "No harmful content detected".to_string() }
        }
    }

    /// Dimension 6: Efficiency - Is it performant?
    fn evaluate_efficiency(test_case: &TestCase, actual: &str) -> Score {
        // Check output verbosity vs quality
        let optimal_length = test_case.optimal_length.unwrap_or(500);
        let actual_length = actual.len();

        if actual_length == 0 {
            return Score { value: 0.0, weight: 0.8, notes: "Empty output".to_string() };
        }

        let efficiency: f32 = if actual_length <= optimal_length {
            1.0
        } else {
            (optimal_length as f32 / actual_length as f32).max(0.3)
        };

        Score {
            value: efficiency,
            weight: 0.8,
            notes: format!("Output length: {} (optimal: {})", actual_length, optimal_length),
        }
    }

    /// Dimension 7: Robustness - Does it handle edge cases?
    fn evaluate_robustness(test_case: &TestCase, actual: &str) -> Score {
        // Check for error handling in output
        let has_error_handling = actual.to_lowercase().contains("error")
            || actual.to_lowercase().contains("cannot")
            || actual.to_lowercase().contains("unable")
            || actual.to_lowercase().contains("failed");

        let has_graceful_degradation = actual.to_lowercase().contains("try")
            || actual.to_lowercase().contains("fallback")
            || actual.to_lowercase().contains("alternative");

        let robustness = if test_case.is_edge_case {
            if has_error_handling || has_graceful_degradation {
                0.8
            } else {
                0.4
            }
        } else {
            1.0
        };

        Score {
            value: robustness,
            weight: 1.0,
            notes: if test_case.is_edge_case { "Edge case handling evaluated".to_string() } else { "Normal case".to_string() },
        }
    }

    fn generate_recommendations(dimensions: &DimensionScores) -> Vec<String> {
        let mut recommendations = Vec::new();

        if dimensions.correctness.value < 0.7 {
            recommendations.push("Review logic and ensure output matches expected results".to_string());
        }
        if dimensions.completeness.value < 0.7 {
            recommendations.push("Add missing elements or steps to make output complete".to_string());
        }
        if dimensions.format.value < 0.7 {
            recommendations.push("Follow output format specification more strictly".to_string());
        }
        if dimensions.adherence.value < 0.7 {
            recommendations.push("Ensure all constraints and instructions are followed".to_string());
        }
        if dimensions.safety.value < 0.7 {
            recommendations.push("CRITICAL: Review output for safety issues before returning".to_string());
        }
        if dimensions.efficiency.value < 0.7 {
            recommendations.push("Optimize output to be more concise while maintaining quality".to_string());
        }
        if dimensions.robustness.value < 0.7 {
            recommendations.push("Add error handling and edge case support".to_string());
        }

        if recommendations.is_empty() {
            recommendations.push("Skill is performing well across all dimensions!".to_string());
        }

        recommendations
    }
}

/// Test case for skill evaluation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestCase {
    pub name: String,
    pub input: String,
    pub expected_output: Option<String>,
    pub required_elements: Vec<String>,
    pub format_requirements: Option<Vec<FormatRequirement>>,
    pub constraints: Option<Vec<Constraint>>,
    pub is_edge_case: bool,
    pub optimal_length: Option<usize>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum FormatRequirement {
    Markdown,
    Json,
    Table,
    Custom(String),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Constraint {
    pub max_length: Option<usize>,
    pub must_contain: Option<Vec<String>>,
    pub must_not_contain: Option<Vec<String>>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_evaluation() {
        let test_cases = vec![
            TestCase {
                name: "Basic test".to_string(),
                input: "test".to_string(),
                expected_output: Some("result".to_string()),
                required_elements: vec![],
                format_requirements: None,
                constraints: None,
                is_edge_case: false,
                optimal_length: Some(100),
            }
        ];

        let actual_outputs = vec!["result".to_string()];

        let result = SkillEvaluator::evaluate("test-skill", &test_cases, &actual_outputs);
        assert!(result.overall_score >= 50.0);
    }

    #[test]
    fn test_grade_conversion() {
        assert_eq!(Grade::from_score(95.0), Grade::S);
        assert_eq!(Grade::from_score(85.0), Grade::A);
        assert_eq!(Grade::from_score(70.0), Grade::B);
        assert_eq!(Grade::from_score(50.0), Grade::C);
        assert_eq!(Grade::from_score(30.0), Grade::D);
        assert_eq!(Grade::from_score(10.0), Grade::F);
    }
}
