// Cost Tracker - track resource usage and calculate ROI

use crate::platform::types::{ResourceType, StepId};
use crate::platform::Result;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Cost tracker for resource usage and ROI calculation
pub struct CostTracker {
    usage_records: Vec<ResourceUsage>,
    budget_threshold: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResourceUsage {
    pub resource_type: ResourceType,
    pub quantity: f64,
    pub unit_cost: f64,
    pub timestamp_ms: u64,
    pub step_id: StepId,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CostReport {
    pub total_cost: f64,
    pub breakdown: HashMap<String, f64>,
    pub duration_ms: u64,
    pub cost_per_step: HashMap<StepId, f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ROIMetrics {
    pub automation_cost: f64,
    pub manual_cost: f64,
    pub time_saved_hours: f64,
    pub roi_percentage: f64,
}

impl CostTracker {
    pub fn new() -> Self {
        Self {
            usage_records: Vec::new(),
            budget_threshold: None,
        }
    }

    /// Create a new cost tracker with a budget threshold
    pub fn with_budget_threshold(threshold: f64) -> Self {
        Self {
            usage_records: Vec::new(),
            budget_threshold: Some(threshold),
        }
    }

    /// Set budget threshold for alerts
    pub fn set_budget_threshold(&mut self, threshold: f64) {
        self.budget_threshold = Some(threshold);
    }

    /// Track resource usage with budget alert checking
    pub fn track_usage(&mut self, usage: ResourceUsage) -> Result<()> {
        self.usage_records.push(usage);

        // Check budget threshold if set
        if let Some(threshold) = self.budget_threshold {
            let current_cost = self.calculate_total_cost();
            if current_cost > threshold {
                return Err(crate::platform::PlatformError::BudgetExceeded {
                    current: current_cost,
                    threshold,
                });
            }
        }

        Ok(())
    }

    /// Calculate total cost from all usage records
    fn calculate_total_cost(&self) -> f64 {
        self.usage_records
            .iter()
            .map(|usage| usage.quantity * usage.unit_cost)
            .sum()
    }

    /// Generate cost report with validation
    pub fn get_cost_report(&self, _workflow_id: &str) -> Result<CostReport> {
        let mut total_cost = 0.0;
        let mut breakdown: HashMap<String, f64> = HashMap::new();
        let mut cost_per_step: HashMap<StepId, f64> = HashMap::new();

        // Calculate costs and breakdowns
        for usage in &self.usage_records {
            let cost = usage.quantity * usage.unit_cost;
            total_cost += cost;

            let resource_key = usage.resource_type.to_string();
            *breakdown.entry(resource_key).or_insert(0.0) += cost;
            *cost_per_step.entry(usage.step_id.clone()).or_insert(0.0) += cost;
        }

        // Calculate duration
        let duration_ms = if !self.usage_records.is_empty() {
            let start = self
                .usage_records
                .iter()
                .map(|u| u.timestamp_ms)
                .min()
                .unwrap_or(0);
            let end = self
                .usage_records
                .iter()
                .map(|u| u.timestamp_ms)
                .max()
                .unwrap_or(0);
            end - start
        } else {
            0
        };

        let report = CostReport {
            total_cost,
            breakdown,
            duration_ms,
            cost_per_step,
        };

        // Validate that total cost equals sum of breakdowns (Property 5)
        self.validate_cost_report(&report)?;

        Ok(report)
    }

    /// Validate cost report accuracy (Requirements 10.4, 10.5)
    fn validate_cost_report(&self, report: &CostReport) -> Result<()> {
        const EPSILON: f64 = 0.01; // Allow small floating point errors

        // Validate: total_cost == sum(breakdown.values())
        let breakdown_sum: f64 = report.breakdown.values().sum();
        if (report.total_cost - breakdown_sum).abs() > EPSILON {
            return Err(crate::platform::PlatformError::InvalidInput(format!(
                "Cost validation failed: total_cost ({}) != sum(breakdown) ({})",
                report.total_cost, breakdown_sum
            )));
        }

        // Validate: total_cost == sum(cost_per_step.values())
        let step_sum: f64 = report.cost_per_step.values().sum();
        if (report.total_cost - step_sum).abs() > EPSILON {
            return Err(crate::platform::PlatformError::InvalidInput(format!(
                "Cost validation failed: total_cost ({}) != sum(cost_per_step) ({})",
                report.total_cost, step_sum
            )));
        }

        Ok(())
    }

    /// Calculate ROI comparing automation cost to manual effort
    pub fn calculate_roi(&self, _workflow_id: &str, manual_cost: f64) -> Result<ROIMetrics> {
        if manual_cost < 0.0 {
            return Err(crate::platform::PlatformError::InvalidInput(
                "manual_cost must be non-negative".to_string(),
            ));
        }

        let report = self.get_cost_report(_workflow_id)?;
        let automation_cost = report.total_cost;

        // Calculate ROI percentage: ((manual_cost - automation_cost) / automation_cost) * 100
        let roi_percentage = if automation_cost > 0.0 {
            ((manual_cost - automation_cost) / automation_cost) * 100.0
        } else if manual_cost > 0.0 {
            // If automation cost is 0 but manual cost > 0, ROI is infinite (use large number)
            f64::INFINITY
        } else {
            0.0
        };

        // Calculate time saved (assuming duration represents time saved)
        let time_saved_hours = (report.duration_ms as f64) / (1000.0 * 3600.0);

        Ok(ROIMetrics {
            automation_cost,
            manual_cost,
            time_saved_hours,
            roi_percentage,
        })
    }

    /// Check if budget threshold has been exceeded
    pub fn check_budget_alert(&self) -> Option<BudgetAlert> {
        if let Some(threshold) = self.budget_threshold {
            let current_cost = self.calculate_total_cost();
            if current_cost > threshold {
                return Some(BudgetAlert {
                    current_cost,
                    threshold,
                    exceeded_by: current_cost - threshold,
                });
            }
        }
        None
    }
}

/// Budget alert information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BudgetAlert {
    pub current_cost: f64,
    pub threshold: f64,
    pub exceeded_by: f64,
}

impl Default for CostTracker {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_track_usage() {
        let mut tracker = CostTracker::new();
        let usage = ResourceUsage {
            resource_type: ResourceType::LLMTokens {
                provider: "openai".to_string(),
                model: "gpt-4".to_string(),
            },
            quantity: 1000.0,
            unit_cost: 0.00003,
            timestamp_ms: 1000,
            step_id: "step1".to_string(),
        };

        tracker.track_usage(usage).unwrap();
        let report = tracker.get_cost_report("wf1").unwrap();
        assert!(report.total_cost > 0.0);
    }

    #[test]
    fn test_calculate_roi() {
        let mut tracker = CostTracker::new();
        let usage = ResourceUsage {
            resource_type: ResourceType::ComputeTime { cpu_ms: 5000 },
            quantity: 5.0,
            unit_cost: 0.0001,
            timestamp_ms: 1000,
            step_id: "step1".to_string(),
        };

        tracker.track_usage(usage).unwrap();
        let roi = tracker.calculate_roi("wf1", 100.0).unwrap();
        assert!(roi.roi_percentage > 0.0);
    }

    #[test]
    fn test_cost_breakdown_validation() {
        let mut tracker = CostTracker::new();

        // Add multiple resource types
        tracker
            .track_usage(ResourceUsage {
                resource_type: ResourceType::LLMTokens {
                    provider: "openai".to_string(),
                    model: "gpt-4".to_string(),
                },
                quantity: 1000.0,
                unit_cost: 0.00003,
                timestamp_ms: 1000,
                step_id: "step1".to_string(),
            })
            .unwrap();

        tracker
            .track_usage(ResourceUsage {
                resource_type: ResourceType::ComputeTime { cpu_ms: 5000 },
                quantity: 5.0,
                unit_cost: 0.0001,
                timestamp_ms: 2000,
                step_id: "step2".to_string(),
            })
            .unwrap();

        let report = tracker.get_cost_report("wf1").unwrap();

        // Verify total cost equals sum of breakdown
        let breakdown_sum: f64 = report.breakdown.values().sum();
        assert!((report.total_cost - breakdown_sum).abs() < 0.01);

        // Verify total cost equals sum of cost_per_step
        let step_sum: f64 = report.cost_per_step.values().sum();
        assert!((report.total_cost - step_sum).abs() < 0.01);
    }

    #[test]
    fn test_budget_threshold() {
        let mut tracker = CostTracker::with_budget_threshold(1.0);

        // Add usage within budget
        tracker
            .track_usage(ResourceUsage {
                resource_type: ResourceType::ComputeTime { cpu_ms: 1000 },
                quantity: 1.0,
                unit_cost: 0.5,
                timestamp_ms: 1000,
                step_id: "step1".to_string(),
            })
            .unwrap();

        // Add usage that exceeds budget
        let result = tracker.track_usage(ResourceUsage {
            resource_type: ResourceType::ComputeTime { cpu_ms: 2000 },
            quantity: 2.0,
            unit_cost: 0.5,
            timestamp_ms: 2000,
            step_id: "step2".to_string(),
        });

        assert!(result.is_err());
        match result {
            Err(crate::platform::PlatformError::BudgetExceeded { current, threshold }) => {
                assert!(current > threshold);
            }
            _ => panic!("Expected BudgetExceeded error"),
        }
    }

    #[test]
    fn test_budget_alert() {
        let mut tracker = CostTracker::with_budget_threshold(1.0);

        // No alert initially
        assert!(tracker.check_budget_alert().is_none());

        // Add usage that exceeds budget
        tracker
            .track_usage(ResourceUsage {
                resource_type: ResourceType::ComputeTime { cpu_ms: 5000 },
                quantity: 5.0,
                unit_cost: 0.5,
                timestamp_ms: 1000,
                step_id: "step1".to_string(),
            })
            .unwrap_or(());

        // Should have alert now
        let alert = tracker.check_budget_alert();
        assert!(alert.is_some());
        if let Some(alert) = alert {
            assert!(alert.current_cost > alert.threshold);
            assert_eq!(alert.exceeded_by, alert.current_cost - alert.threshold);
        }
    }

    #[test]
    fn test_roi_with_zero_automation_cost() {
        let tracker = CostTracker::new();
        let roi = tracker.calculate_roi("wf1", 100.0).unwrap();

        // With zero automation cost and positive manual cost, ROI should be infinite
        assert_eq!(roi.automation_cost, 0.0);
        assert_eq!(roi.manual_cost, 100.0);
        assert!(roi.roi_percentage.is_infinite());
    }

    #[test]
    fn test_roi_calculation() {
        let mut tracker = CostTracker::new();

        tracker
            .track_usage(ResourceUsage {
                resource_type: ResourceType::LLMTokens {
                    provider: "openai".to_string(),
                    model: "gpt-4".to_string(),
                },
                quantity: 10000.0,
                unit_cost: 0.00003,
                timestamp_ms: 1000,
                step_id: "step1".to_string(),
            })
            .unwrap();

        let manual_cost = 400.0; // $400 for manual work
        let roi = tracker.calculate_roi("wf1", manual_cost).unwrap();

        // automation_cost = 10000 * 0.00003 = 0.3
        // roi_percentage = ((400 - 0.3) / 0.3) * 100 = 133233.33%
        assert!((roi.automation_cost - 0.3).abs() < 0.01);
        assert_eq!(roi.manual_cost, 400.0);
        assert!(roi.roi_percentage > 100000.0);
    }

    #[test]
    fn test_multiple_steps_cost_tracking() {
        let mut tracker = CostTracker::new();

        // Step 1: LLM tokens
        tracker
            .track_usage(ResourceUsage {
                resource_type: ResourceType::LLMTokens {
                    provider: "openai".to_string(),
                    model: "gpt-4".to_string(),
                },
                quantity: 5000.0,
                unit_cost: 0.00003,
                timestamp_ms: 1000,
                step_id: "code_generation".to_string(),
            })
            .unwrap();

        // Step 2: Compute time
        tracker
            .track_usage(ResourceUsage {
                resource_type: ResourceType::ComputeTime { cpu_ms: 10000 },
                quantity: 10.0,
                unit_cost: 0.0001,
                timestamp_ms: 2000,
                step_id: "code_generation".to_string(),
            })
            .unwrap();

        // Step 3: Storage
        tracker
            .track_usage(ResourceUsage {
                resource_type: ResourceType::Storage { bytes: 1024000 },
                quantity: 1.0,
                unit_cost: 0.001,
                timestamp_ms: 3000,
                step_id: "artifact_storage".to_string(),
            })
            .unwrap();

        let report = tracker.get_cost_report("wf1").unwrap();

        // Verify we have costs for both steps
        assert_eq!(report.cost_per_step.len(), 2);
        assert!(report.cost_per_step.contains_key("code_generation"));
        assert!(report.cost_per_step.contains_key("artifact_storage"));

        // Verify duration calculation
        assert_eq!(report.duration_ms, 2000); // 3000 - 1000
    }
}
