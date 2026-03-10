// Feedback Collector - ingest production signals and generate recommendations

use crate::platform::{Result};
use crate::platform::types::Severity;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::time::Duration;

/// Trait for feedback collection and recommendation generation
pub trait FeedbackCollectorTrait {
    fn ingest_signal(&mut self, signal: ProductionSignal) -> Result<()>;
    fn aggregate_signals(&self, time_window: Duration) -> Result<FeedbackSummary>;
    fn get_recommendations(&self, workflow_id: &str) -> Result<Vec<Recommendation>>;
}

/// Feedback collector for production signal ingestion
pub struct FeedbackCollector {
    signals: Vec<ProductionSignal>,
    config: FeedbackConfig,
    recommendation_history: HashMap<String, Vec<RecommendationEffectiveness>>,
}

#[derive(Debug, Clone)]
pub struct FeedbackConfig {
    pub aggregation_window_secs: u64,
}

impl Default for FeedbackConfig {
    fn default() -> Self {
        Self {
            aggregation_window_secs: 3600, // 1 hour
        }
    }
}

/// Production signal from monitoring systems
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProductionSignal {
    pub signal_id: String,
    pub timestamp_ms: u64,
    pub signal_type: SignalType,
    pub severity: Severity,
    pub metadata: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SignalType {
    ErrorRate { service: String, rate: f64 },
    UserFeedback { rating: i32, comment: String },
    Incident { incident_id: String, impact: String },
    PerformanceMetric { metric: String, value: f64 },
}

/// Aggregated feedback summary
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FeedbackSummary {
    pub time_window_ms: u64,
    pub total_signals: usize,
    pub error_rate: f64,
    pub avg_user_rating: f64,
    pub incident_count: usize,
    pub performance_metrics: HashMap<String, f64>,
}

/// Recommendation for workflow improvement
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Recommendation {
    pub recommendation_id: String,
    pub workflow_id: String,
    pub action: RecommendedAction,
    pub confidence: f64,
    pub rationale: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RecommendedAction {
    IncreaseTimeout { step_id: String, new_timeout_ms: u64 },
    AddRetry { step_id: String, max_retries: u32 },
    ChangeStrategy { step_id: String, new_strategy: String },
    AddValidation { step_id: String, validation_type: String },
    OptimizeResource { resource_type: String, optimization: String },
}

/// Tracks effectiveness of applied recommendations
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RecommendationEffectiveness {
    pub recommendation_id: String,
    pub applied_at_ms: u64,
    pub before_metrics: FeedbackSummary,
    pub after_metrics: Option<FeedbackSummary>,
    pub improvement_score: Option<f64>,
}

impl FeedbackCollector {
    pub fn new(config: FeedbackConfig) -> Self {
        Self {
            signals: Vec::new(),
            config,
            recommendation_history: HashMap::new(),
        }
    }
    
    pub fn default() -> Self {
        Self::new(FeedbackConfig::default())
    }
    
    /// Ingest a production signal
    pub fn ingest_signal(&mut self, signal: ProductionSignal) -> Result<()> {
        self.signals.push(signal);
        Ok(())
    }
    
    /// Aggregate signals over a time window
    pub fn aggregate_signals(&self, time_window: Duration) -> Result<FeedbackSummary> {
        let window_ms = time_window.as_millis() as u64;
        let current_time = crate::platform::types::current_timestamp_ms();
        let cutoff_time = current_time.saturating_sub(window_ms);
        
        let recent_signals: Vec<_> = self.signals.iter()
            .filter(|s| s.timestamp_ms >= cutoff_time)
            .collect();
        
        let mut error_count = 0;
        let mut user_ratings = Vec::new();
        let mut incident_count = 0;
        let mut performance_metrics: HashMap<String, Vec<f64>> = HashMap::new();
        
        for signal in &recent_signals {
            match &signal.signal_type {
                SignalType::ErrorRate { .. } => error_count += 1,
                SignalType::UserFeedback { rating, .. } => user_ratings.push(*rating as f64),
                SignalType::Incident { .. } => incident_count += 1,
                SignalType::PerformanceMetric { metric, value } => {
                    performance_metrics.entry(metric.clone())
                        .or_insert_with(Vec::new)
                        .push(*value);
                }
            }
        }
        
        let error_rate = if !recent_signals.is_empty() {
            error_count as f64 / recent_signals.len() as f64
        } else {
            0.0
        };
        
        let avg_user_rating = if !user_ratings.is_empty() {
            user_ratings.iter().sum::<f64>() / user_ratings.len() as f64
        } else {
            0.0
        };
        
        let avg_performance_metrics: HashMap<String, f64> = performance_metrics.iter()
            .map(|(k, v)| (k.clone(), v.iter().sum::<f64>() / v.len() as f64))
            .collect();
        
        Ok(FeedbackSummary {
            time_window_ms: window_ms,
            total_signals: recent_signals.len(),
            error_rate,
            avg_user_rating,
            incident_count,
            performance_metrics: avg_performance_metrics,
        })
    }
    
    /// Generate recommendations based on signals
    pub fn get_recommendations(&self, workflow_id: &str) -> Result<Vec<Recommendation>> {
        let summary = self.aggregate_signals(Duration::from_secs(self.config.aggregation_window_secs))?;
        let mut recommendations = Vec::new();
        
        // Analyze signal patterns and generate recommendations
        
        // 1. High error rate → Add retry logic
        if summary.error_rate > 0.1 {
            let confidence = (summary.error_rate - 0.1) / 0.9; // Scale confidence based on severity
            recommendations.push(Recommendation {
                recommendation_id: uuid::Uuid::new_v4().to_string(),
                workflow_id: workflow_id.to_string(),
                action: RecommendedAction::AddRetry {
                    step_id: "error_prone_step".to_string(),
                    max_retries: 3,
                },
                confidence: confidence.min(0.95),
                rationale: format!(
                    "High error rate detected: {:.2}%. Adding retry logic can improve reliability.",
                    summary.error_rate * 100.0
                ),
            });
        }
        
        // 2. Low user satisfaction → Add quality validation
        if summary.avg_user_rating < 3.0 && summary.avg_user_rating > 0.0 {
            let confidence = (3.0 - summary.avg_user_rating) / 3.0;
            recommendations.push(Recommendation {
                recommendation_id: uuid::Uuid::new_v4().to_string(),
                workflow_id: workflow_id.to_string(),
                action: RecommendedAction::AddValidation {
                    step_id: "output_generation".to_string(),
                    validation_type: "quality_check".to_string(),
                },
                confidence: confidence.min(0.9),
                rationale: format!(
                    "Low user satisfaction: {:.1}/5.0. Adding quality validation can improve output quality.",
                    summary.avg_user_rating
                ),
            });
        }
        
        // 3. High incident count → Change strategy
        if summary.incident_count > 5 {
            recommendations.push(Recommendation {
                recommendation_id: uuid::Uuid::new_v4().to_string(),
                workflow_id: workflow_id.to_string(),
                action: RecommendedAction::ChangeStrategy {
                    step_id: "critical_step".to_string(),
                    new_strategy: "defensive".to_string(),
                },
                confidence: 0.85,
                rationale: format!(
                    "{} incidents detected. Consider using a more defensive execution strategy.",
                    summary.incident_count
                ),
            });
        }
        
        // 4. Performance degradation → Optimize resources
        for (metric, value) in &summary.performance_metrics {
            if metric.contains("latency") && *value > 1000.0 {
                recommendations.push(Recommendation {
                    recommendation_id: uuid::Uuid::new_v4().to_string(),
                    workflow_id: workflow_id.to_string(),
                    action: RecommendedAction::OptimizeResource {
                        resource_type: "compute".to_string(),
                        optimization: "increase_parallelism".to_string(),
                    },
                    confidence: 0.75,
                    rationale: format!(
                        "High latency detected for {}: {:.0}ms. Consider optimizing resource allocation.",
                        metric, value
                    ),
                });
            }
        }
        
        Ok(recommendations)
    }
    
    /// Track effectiveness of a recommendation
    pub fn track_recommendation_effectiveness(
        &mut self,
        recommendation_id: String,
        workflow_id: String,
        before_metrics: FeedbackSummary,
    ) -> Result<()> {
        let effectiveness = RecommendationEffectiveness {
            recommendation_id: recommendation_id.clone(),
            applied_at_ms: crate::platform::types::current_timestamp_ms(),
            before_metrics,
            after_metrics: None,
            improvement_score: None,
        };
        
        self.recommendation_history
            .entry(workflow_id)
            .or_insert_with(Vec::new)
            .push(effectiveness);
        
        Ok(())
    }
    
    /// Update effectiveness metrics after recommendation is applied
    pub fn update_recommendation_effectiveness(
        &mut self,
        recommendation_id: &str,
        workflow_id: &str,
        after_metrics: FeedbackSummary,
    ) -> Result<()> {
        if let Some(history) = self.recommendation_history.get_mut(workflow_id) {
            if let Some(effectiveness) = history.iter_mut()
                .find(|e| e.recommendation_id == recommendation_id) {
                
                // Calculate improvement score
                let before = &effectiveness.before_metrics;
                let after = &after_metrics;
                
                let mut improvements = Vec::new();
                
                // Error rate improvement (lower is better)
                if before.error_rate > 0.0 {
                    let error_improvement = (before.error_rate - after.error_rate) / before.error_rate;
                    improvements.push(error_improvement);
                }
                
                // User rating improvement (higher is better)
                if before.avg_user_rating > 0.0 {
                    let rating_improvement = (after.avg_user_rating - before.avg_user_rating) / 5.0;
                    improvements.push(rating_improvement);
                }
                
                // Incident count improvement (lower is better)
                if before.incident_count > 0 {
                    let incident_improvement = (before.incident_count as f64 - after.incident_count as f64) 
                        / before.incident_count as f64;
                    improvements.push(incident_improvement);
                }
                
                let improvement_score = if !improvements.is_empty() {
                    improvements.iter().sum::<f64>() / improvements.len() as f64
                } else {
                    0.0
                };
                
                effectiveness.after_metrics = Some(after_metrics);
                effectiveness.improvement_score = Some(improvement_score);
            }
        }
        
        Ok(())
    }
    
    /// Get effectiveness history for a workflow
    pub fn get_effectiveness_history(&self, workflow_id: &str) -> Vec<&RecommendationEffectiveness> {
        self.recommendation_history
            .get(workflow_id)
            .map(|h| h.iter().collect())
            .unwrap_or_default()
    }
    
    /// Get all signals
    pub fn get_signals(&self) -> &[ProductionSignal] {
        &self.signals
    }
}

impl Default for FeedbackCollector {
    fn default() -> Self {
        Self::new(FeedbackConfig::default())
    }
}

impl FeedbackCollectorTrait for FeedbackCollector {
    fn ingest_signal(&mut self, signal: ProductionSignal) -> Result<()> {
        self.ingest_signal(signal)
    }
    
    fn aggregate_signals(&self, time_window: Duration) -> Result<FeedbackSummary> {
        self.aggregate_signals(time_window)
    }
    
    fn get_recommendations(&self, workflow_id: &str) -> Result<Vec<Recommendation>> {
        self.get_recommendations(workflow_id)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_ingest_signal() {
        let mut collector = FeedbackCollector::default();
        let signal = ProductionSignal {
            signal_id: "s1".to_string(),
            timestamp_ms: crate::platform::types::current_timestamp_ms(),
            signal_type: SignalType::ErrorRate {
                service: "api".to_string(),
                rate: 0.05,
            },
            severity: Severity::Medium,
            metadata: HashMap::new(),
        };
        
        collector.ingest_signal(signal).unwrap();
        assert_eq!(collector.get_signals().len(), 1);
    }

    #[test]
    fn test_aggregate_signals() {
        let mut collector = FeedbackCollector::default();
        let current_time = crate::platform::types::current_timestamp_ms();
        
        // Add some signals
        for i in 0..5 {
            collector.ingest_signal(ProductionSignal {
                signal_id: format!("s{}", i),
                timestamp_ms: current_time - (i * 1000),
                signal_type: SignalType::UserFeedback {
                    rating: 4,
                    comment: "good".to_string(),
                },
                severity: Severity::Low,
                metadata: HashMap::new(),
            }).unwrap();
        }
        
        let summary = collector.aggregate_signals(Duration::from_secs(3600)).unwrap();
        assert_eq!(summary.total_signals, 5);
        assert_eq!(summary.avg_user_rating, 4.0);
    }

    #[test]
    fn test_get_recommendations() {
        let mut collector = FeedbackCollector::default();
        let current_time = crate::platform::types::current_timestamp_ms();
        
        // Add high error rate signals
        for i in 0..10 {
            collector.ingest_signal(ProductionSignal {
                signal_id: format!("s{}", i),
                timestamp_ms: current_time - (i * 1000),
                signal_type: SignalType::ErrorRate {
                    service: "api".to_string(),
                    rate: 0.15,
                },
                severity: Severity::High,
                metadata: HashMap::new(),
            }).unwrap();
        }
        
        let recommendations = collector.get_recommendations("wf1").unwrap();
        assert!(!recommendations.is_empty());
    }
    
    #[test]
    fn test_track_recommendation_effectiveness() {
        let mut collector = FeedbackCollector::default();
        
        let before_metrics = FeedbackSummary {
            time_window_ms: 3600000,
            total_signals: 100,
            error_rate: 0.15,
            avg_user_rating: 2.5,
            incident_count: 8,
            performance_metrics: HashMap::new(),
        };
        
        collector.track_recommendation_effectiveness(
            "rec1".to_string(),
            "wf1".to_string(),
            before_metrics.clone(),
        ).unwrap();
        
        let history = collector.get_effectiveness_history("wf1");
        assert_eq!(history.len(), 1);
        assert_eq!(history[0].recommendation_id, "rec1");
    }
    
    #[test]
    fn test_update_recommendation_effectiveness() {
        let mut collector = FeedbackCollector::default();
        
        let before_metrics = FeedbackSummary {
            time_window_ms: 3600000,
            total_signals: 100,
            error_rate: 0.15,
            avg_user_rating: 2.5,
            incident_count: 8,
            performance_metrics: HashMap::new(),
        };
        
        collector.track_recommendation_effectiveness(
            "rec1".to_string(),
            "wf1".to_string(),
            before_metrics.clone(),
        ).unwrap();
        
        let after_metrics = FeedbackSummary {
            time_window_ms: 3600000,
            total_signals: 100,
            error_rate: 0.05,  // Improved
            avg_user_rating: 4.0,  // Improved
            incident_count: 2,  // Improved
            performance_metrics: HashMap::new(),
        };
        
        collector.update_recommendation_effectiveness("rec1", "wf1", after_metrics).unwrap();
        
        let history = collector.get_effectiveness_history("wf1");
        assert_eq!(history.len(), 1);
        assert!(history[0].after_metrics.is_some());
        assert!(history[0].improvement_score.is_some());
        
        // Should show positive improvement
        let score = history[0].improvement_score.unwrap();
        assert!(score > 0.0, "Expected positive improvement score, got {}", score);
    }
    
    #[test]
    fn test_recommendation_confidence_scaling() {
        let mut collector = FeedbackCollector::default();
        let current_time = crate::platform::types::current_timestamp_ms();
        
        // Add signals with very high error rate
        for i in 0..20 {
            collector.ingest_signal(ProductionSignal {
                signal_id: format!("s{}", i),
                timestamp_ms: current_time - (i * 1000),
                signal_type: SignalType::ErrorRate {
                    service: "api".to_string(),
                    rate: 0.5,
                },
                severity: Severity::Critical,
                metadata: HashMap::new(),
            }).unwrap();
        }
        
        let recommendations = collector.get_recommendations("wf1").unwrap();
        assert!(!recommendations.is_empty());
        
        // Confidence should be high for severe issues
        let retry_rec = recommendations.iter()
            .find(|r| matches!(r.action, RecommendedAction::AddRetry { .. }));
        assert!(retry_rec.is_some());
        assert!(retry_rec.unwrap().confidence > 0.7);
    }
    
    #[test]
    fn test_multiple_recommendation_types() {
        let mut collector = FeedbackCollector::default();
        let current_time = crate::platform::types::current_timestamp_ms();
        
        // Add various signal types
        for i in 0..5 {
            // High error rate
            collector.ingest_signal(ProductionSignal {
                signal_id: format!("error_{}", i),
                timestamp_ms: current_time - (i * 1000),
                signal_type: SignalType::ErrorRate {
                    service: "api".to_string(),
                    rate: 0.2,
                },
                severity: Severity::High,
                metadata: HashMap::new(),
            }).unwrap();
            
            // Low user ratings
            collector.ingest_signal(ProductionSignal {
                signal_id: format!("rating_{}", i),
                timestamp_ms: current_time - (i * 1000),
                signal_type: SignalType::UserFeedback {
                    rating: 2,
                    comment: "poor quality".to_string(),
                },
                severity: Severity::Medium,
                metadata: HashMap::new(),
            }).unwrap();
            
            // Incidents
            collector.ingest_signal(ProductionSignal {
                signal_id: format!("incident_{}", i),
                timestamp_ms: current_time - (i * 1000),
                signal_type: SignalType::Incident {
                    incident_id: format!("inc_{}", i),
                    impact: "service degradation".to_string(),
                },
                severity: Severity::Critical,
                metadata: HashMap::new(),
            }).unwrap();
        }
        
        let recommendations = collector.get_recommendations("wf1").unwrap();
        
        // Should generate multiple types of recommendations
        assert!(recommendations.len() >= 2);
        
        let has_retry = recommendations.iter()
            .any(|r| matches!(r.action, RecommendedAction::AddRetry { .. }));
        let has_validation = recommendations.iter()
            .any(|r| matches!(r.action, RecommendedAction::AddValidation { .. }));
        
        assert!(has_retry, "Should recommend adding retry logic");
        assert!(has_validation, "Should recommend adding validation");
    }
    
    #[test]
    fn test_performance_metric_recommendations() {
        let mut collector = FeedbackCollector::default();
        let current_time = crate::platform::types::current_timestamp_ms();
        
        // Add high latency signals
        for i in 0..5 {
            collector.ingest_signal(ProductionSignal {
                signal_id: format!("perf_{}", i),
                timestamp_ms: current_time - (i * 1000),
                signal_type: SignalType::PerformanceMetric {
                    metric: "api_latency".to_string(),
                    value: 1500.0,  // High latency
                },
                severity: Severity::Medium,
                metadata: HashMap::new(),
            }).unwrap();
        }
        
        let recommendations = collector.get_recommendations("wf1").unwrap();
        
        let has_optimization = recommendations.iter()
            .any(|r| matches!(r.action, RecommendedAction::OptimizeResource { .. }));
        
        assert!(has_optimization, "Should recommend resource optimization for high latency");
    }
}
