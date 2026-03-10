// Benchmark Service - measure and compare workflow performance

use crate::platform::{PlatformError, Result};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

// ============================================================================
// Data Models
// ============================================================================

/// Benchmark definition with test cases and metrics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Benchmark {
    pub benchmark_id: String,
    pub name: String,
    pub category: String,
    pub test_cases: Vec<TestCase>,
    pub metrics: Vec<MetricDefinition>,
}

impl Benchmark {
    pub fn new(
        benchmark_id: String,
        name: String,
        category: String,
        test_cases: Vec<TestCase>,
        metrics: Vec<MetricDefinition>,
    ) -> Self {
        Self {
            benchmark_id,
            name,
            category,
            test_cases,
            metrics,
        }
    }
}

/// Individual test case within a benchmark
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestCase {
    pub test_id: String,
    pub name: String,
    pub input: serde_json::Value,
    pub expected_output: Option<serde_json::Value>,
}

impl TestCase {
    pub fn new(test_id: String, name: String, input: serde_json::Value) -> Self {
        Self {
            test_id,
            name,
            input,
            expected_output: None,
        }
    }

    pub fn with_expected_output(mut self, output: serde_json::Value) -> Self {
        self.expected_output = Some(output);
        self
    }
}

/// Metric definition for benchmarking
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MetricDefinition {
    pub name: String,
    pub metric_type: MetricType,
    pub higher_is_better: bool,
}

impl MetricDefinition {
    pub fn new(name: String, metric_type: MetricType, higher_is_better: bool) -> Self {
        Self {
            name,
            metric_type,
            higher_is_better,
        }
    }
}

/// Types of metrics that can be measured
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MetricType {
    Quality { scale: f64 },
    TimeToCompletion,
    DefectRate,
    CostEfficiency,
    Custom { unit: String },
}

/// Result of running a benchmark
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BenchmarkResult {
    pub benchmark_id: String,
    pub workflow_version: String,
    pub provider: String,
    pub metrics: HashMap<String, f64>,
    pub timestamp_ms: u64,
    pub test_case_results: Vec<TestCaseResult>,
}

impl BenchmarkResult {
    pub fn new(
        benchmark_id: String,
        workflow_version: String,
        provider: String,
        timestamp_ms: u64,
    ) -> Self {
        Self {
            benchmark_id,
            workflow_version,
            provider,
            metrics: HashMap::new(),
            timestamp_ms,
            test_case_results: Vec::new(),
        }
    }

    pub fn add_metric(&mut self, name: String, value: f64) {
        self.metrics.insert(name, value);
    }

    pub fn add_test_case_result(&mut self, result: TestCaseResult) {
        self.test_case_results.push(result);
    }
}

/// Result of a single test case execution
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestCaseResult {
    pub test_id: String,
    pub passed: bool,
    pub duration_ms: u64,
    pub output: Option<serde_json::Value>,
    pub error: Option<String>,
}

/// Leaderboard entry for public comparison
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LeaderboardEntry {
    pub rank: usize,
    pub workflow_version: String,
    pub provider: String,
    pub category: String,
    pub normalized_score: f64,
    pub metrics: HashMap<String, f64>,
    pub timestamp_ms: u64,
}

impl LeaderboardEntry {
    pub fn new(
        rank: usize,
        workflow_version: String,
        provider: String,
        category: String,
        normalized_score: f64,
        metrics: HashMap<String, f64>,
        timestamp_ms: u64,
    ) -> Self {
        Self {
            rank,
            workflow_version,
            provider,
            category,
            normalized_score,
            metrics,
            timestamp_ms,
        }
    }
}

/// Comparison report between benchmark results
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Comparison {
    pub baseline: BenchmarkResult,
    pub comparison: BenchmarkResult,
    pub metric_comparisons: HashMap<String, MetricComparison>,
    pub overall_improvement: f64,
}

/// Comparison of a single metric
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MetricComparison {
    pub metric_name: String,
    pub baseline_value: f64,
    pub comparison_value: f64,
    pub normalized_baseline: f64,
    pub normalized_comparison: f64,
    pub improvement_percentage: f64,
    pub higher_is_better: bool,
}

// ============================================================================
// Service Trait
// ============================================================================

/// Benchmark service trait for performance measurement
pub trait BenchmarkService {
    /// Run a benchmark and collect metrics
    fn run_benchmark(&self, benchmark: &Benchmark) -> Result<BenchmarkResult>;

    /// Compare two benchmark results
    fn compare_results(
        &self,
        baseline: &BenchmarkResult,
        comparison: &BenchmarkResult,
    ) -> Result<Comparison>;

    /// Get leaderboard for a category
    fn get_leaderboard(&self, category: &str) -> Result<Vec<LeaderboardEntry>>;

    /// Store a benchmark result
    fn store_result(&mut self, result: BenchmarkResult) -> Result<()>;

    /// Get all results for a benchmark
    fn get_results(&self, benchmark_id: &str) -> Result<Vec<BenchmarkResult>>;
}

// ============================================================================
// Default Implementation
// ============================================================================

/// Default implementation of benchmark service
pub struct DefaultBenchmarkService {
    results: Vec<BenchmarkResult>,
}

impl DefaultBenchmarkService {
    pub fn new() -> Self {
        Self {
            results: Vec::new(),
        }
    }
}

impl Default for DefaultBenchmarkService {
    fn default() -> Self {
        Self::new()
    }
}

// ============================================================================
// Benchmark Execution
// ============================================================================

impl DefaultBenchmarkService {
    /// Execute a single test case
    fn execute_test_case(&self, test_case: &TestCase) -> TestCaseResult {
        let start_time = std::time::Instant::now();

        // Simulate test execution
        // In a real implementation, this would execute the actual workflow
        let passed = true;
        let output = Some(test_case.input.clone());
        let error = None;

        let duration_ms = start_time.elapsed().as_millis() as u64;

        TestCaseResult {
            test_id: test_case.test_id.clone(),
            passed,
            duration_ms,
            output,
            error,
        }
    }

    /// Calculate quality metric from test results
    fn calculate_quality(&self, test_results: &[TestCaseResult], scale: f64) -> f64 {
        if test_results.is_empty() {
            return 0.0;
        }

        let passed_count = test_results.iter().filter(|r| r.passed).count();
        let pass_rate = passed_count as f64 / test_results.len() as f64;

        pass_rate * scale
    }

    /// Calculate time to completion metric
    fn calculate_time_to_completion(&self, test_results: &[TestCaseResult]) -> f64 {
        if test_results.is_empty() {
            return 0.0;
        }

        let total_time: u64 = test_results.iter().map(|r| r.duration_ms).sum();
        total_time as f64
    }

    /// Calculate defect rate metric
    fn calculate_defect_rate(&self, test_results: &[TestCaseResult]) -> f64 {
        if test_results.is_empty() {
            return 0.0;
        }

        let failed_count = test_results.iter().filter(|r| !r.passed).count();
        failed_count as f64 / test_results.len() as f64
    }

    /// Calculate cost efficiency metric
    fn calculate_cost_efficiency(&self, test_results: &[TestCaseResult]) -> f64 {
        if test_results.is_empty() {
            return 0.0;
        }

        // Simple cost model: assume $0.01 per second of execution
        let total_time_seconds = self.calculate_time_to_completion(test_results) / 1000.0;
        let total_cost = total_time_seconds * 0.01;

        // Efficiency = passed tests / cost
        let passed_count = test_results.iter().filter(|r| r.passed).count();
        if total_cost > 0.0 {
            passed_count as f64 / total_cost
        } else {
            0.0
        }
    }

    /// Normalize a metric value to 0-1 scale
    fn normalize_metric(&self, value: f64, metric_type: &MetricType, all_values: &[f64]) -> f64 {
        if all_values.is_empty() {
            return 0.0;
        }

        let min_val = all_values.iter().cloned().fold(f64::INFINITY, f64::min);
        let max_val = all_values.iter().cloned().fold(f64::NEG_INFINITY, f64::max);

        if (max_val - min_val).abs() < f64::EPSILON {
            return 0.5; // All values are the same
        }

        // Normalize to 0-1 range
        let normalized = (value - min_val) / (max_val - min_val);

        // For metrics where lower is better, invert the normalization
        match metric_type {
            MetricType::TimeToCompletion | MetricType::DefectRate => 1.0 - normalized,
            _ => normalized,
        }
    }
}

impl BenchmarkService for DefaultBenchmarkService {
    fn run_benchmark(&self, benchmark: &Benchmark) -> Result<BenchmarkResult> {
        if benchmark.test_cases.is_empty() {
            return Err(PlatformError::BenchmarkError(
                "Benchmark must have at least one test case".to_string(),
            ));
        }

        if benchmark.metrics.is_empty() {
            return Err(PlatformError::BenchmarkError(
                "Benchmark must have at least one metric".to_string(),
            ));
        }

        let timestamp_ms = crate::platform::types::current_timestamp_ms();

        // Execute all test cases
        let mut test_results = Vec::new();
        for test_case in &benchmark.test_cases {
            let result = self.execute_test_case(test_case);
            test_results.push(result);
        }

        // Calculate metrics
        let mut result = BenchmarkResult::new(
            benchmark.benchmark_id.clone(),
            "1.0.0".to_string(),   // Default version
            "default".to_string(), // Default provider
            timestamp_ms,
        );

        for metric_def in &benchmark.metrics {
            let value = match &metric_def.metric_type {
                MetricType::Quality { scale } => self.calculate_quality(&test_results, *scale),
                MetricType::TimeToCompletion => self.calculate_time_to_completion(&test_results),
                MetricType::DefectRate => self.calculate_defect_rate(&test_results),
                MetricType::CostEfficiency => self.calculate_cost_efficiency(&test_results),
                MetricType::Custom { .. } => 0.0, // Custom metrics not implemented yet
            };

            result.add_metric(metric_def.name.clone(), value);
        }

        // Add test case results
        for test_result in test_results {
            result.add_test_case_result(test_result);
        }

        Ok(result)
    }

    fn compare_results(
        &self,
        baseline: &BenchmarkResult,
        comparison: &BenchmarkResult,
    ) -> Result<Comparison> {
        if baseline.benchmark_id != comparison.benchmark_id {
            return Err(PlatformError::BenchmarkError(
                "Cannot compare results from different benchmarks".to_string(),
            ));
        }

        let mut metric_comparisons = HashMap::new();
        let mut total_improvement = 0.0;
        let mut metric_count = 0;

        // Compare each metric
        for (metric_name, baseline_value) in &baseline.metrics {
            if let Some(comparison_value) = comparison.metrics.get(metric_name) {
                // Collect all values for normalization
                let all_values = vec![*baseline_value, *comparison_value];

                // Determine metric type and higher_is_better from metric name
                let (metric_type, higher_is_better) = match metric_name.as_str() {
                    name if name.contains("quality") || name.contains("Quality") => {
                        (MetricType::Quality { scale: 100.0 }, true)
                    }
                    name if name.contains("time") || name.contains("Time") => {
                        (MetricType::TimeToCompletion, false)
                    }
                    name if name.contains("defect") || name.contains("Defect") => {
                        (MetricType::DefectRate, false)
                    }
                    name if name.contains("cost") || name.contains("Cost") => {
                        (MetricType::CostEfficiency, true)
                    }
                    _ => (
                        MetricType::Custom {
                            unit: "".to_string(),
                        },
                        true,
                    ),
                };

                let normalized_baseline =
                    self.normalize_metric(*baseline_value, &metric_type, &all_values);
                let normalized_comparison =
                    self.normalize_metric(*comparison_value, &metric_type, &all_values);

                // Calculate improvement percentage
                let improvement = if higher_is_better {
                    if *baseline_value > 0.0 {
                        ((*comparison_value - *baseline_value) / *baseline_value) * 100.0
                    } else {
                        0.0
                    }
                } else if *baseline_value > 0.0 {
                    ((*baseline_value - *comparison_value) / *baseline_value) * 100.0
                } else {
                    0.0
                };

                metric_comparisons.insert(
                    metric_name.clone(),
                    MetricComparison {
                        metric_name: metric_name.clone(),
                        baseline_value: *baseline_value,
                        comparison_value: *comparison_value,
                        normalized_baseline,
                        normalized_comparison,
                        improvement_percentage: improvement,
                        higher_is_better,
                    },
                );

                total_improvement += improvement;
                metric_count += 1;
            }
        }

        let overall_improvement = if metric_count > 0 {
            total_improvement / metric_count as f64
        } else {
            0.0
        };

        Ok(Comparison {
            baseline: baseline.clone(),
            comparison: comparison.clone(),
            metric_comparisons,
            overall_improvement,
        })
    }

    fn get_leaderboard(&self, category: &str) -> Result<Vec<LeaderboardEntry>> {
        // Filter results by category
        let category_results: Vec<_> = self
            .results
            .iter()
            .filter(|_r| {
                // In a real implementation, we'd look up the benchmark category
                // For now, we'll include all results
                true
            })
            .collect();

        if category_results.is_empty() {
            return Ok(Vec::new());
        }

        // Calculate normalized scores for each result
        let mut entries: Vec<LeaderboardEntry> = Vec::new();

        for result in category_results {
            // Collect all metric values for normalization
            let mut all_metric_values: HashMap<String, Vec<f64>> = HashMap::new();
            for r in &self.results {
                for (metric_name, value) in &r.metrics {
                    all_metric_values
                        .entry(metric_name.clone())
                        .or_default()
                        .push(*value);
                }
            }

            // Calculate normalized score as average of normalized metrics
            let mut normalized_sum = 0.0;
            let mut metric_count = 0;

            for (metric_name, value) in &result.metrics {
                if let Some(all_values) = all_metric_values.get(metric_name) {
                    let metric_type = match metric_name.as_str() {
                        name if name.contains("quality") || name.contains("Quality") => {
                            MetricType::Quality { scale: 100.0 }
                        }
                        name if name.contains("time") || name.contains("Time") => {
                            MetricType::TimeToCompletion
                        }
                        name if name.contains("defect") || name.contains("Defect") => {
                            MetricType::DefectRate
                        }
                        name if name.contains("cost") || name.contains("Cost") => {
                            MetricType::CostEfficiency
                        }
                        _ => MetricType::Custom {
                            unit: "".to_string(),
                        },
                    };

                    let normalized = self.normalize_metric(*value, &metric_type, all_values);
                    normalized_sum += normalized;
                    metric_count += 1;
                }
            }

            let normalized_score = if metric_count > 0 {
                normalized_sum / metric_count as f64
            } else {
                0.0
            };

            entries.push(LeaderboardEntry::new(
                0, // Rank will be assigned after sorting
                result.workflow_version.clone(),
                result.provider.clone(),
                category.to_string(),
                normalized_score,
                result.metrics.clone(),
                result.timestamp_ms,
            ));
        }

        // Sort by normalized score (descending)
        entries.sort_by(|a, b| {
            b.normalized_score
                .partial_cmp(&a.normalized_score)
                .unwrap_or(std::cmp::Ordering::Equal)
        });

        // Assign ranks
        for (i, entry) in entries.iter_mut().enumerate() {
            entry.rank = i + 1;
        }

        Ok(entries)
    }

    fn store_result(&mut self, result: BenchmarkResult) -> Result<()> {
        self.results.push(result);
        Ok(())
    }

    fn get_results(&self, benchmark_id: &str) -> Result<Vec<BenchmarkResult>> {
        let results: Vec<BenchmarkResult> = self
            .results
            .iter()
            .filter(|r| r.benchmark_id == benchmark_id)
            .cloned()
            .collect();

        Ok(results)
    }
}

// ============================================================================
// Custom Metric Support
// ============================================================================

/// Builder for creating custom metrics
pub struct CustomMetricBuilder {
    name: String,
    unit: String,
    higher_is_better: bool,
}

impl CustomMetricBuilder {
    pub fn new(name: String) -> Self {
        Self {
            name,
            unit: String::new(),
            higher_is_better: true,
        }
    }

    pub fn with_unit(mut self, unit: String) -> Self {
        self.unit = unit;
        self
    }

    pub fn higher_is_better(mut self, higher_is_better: bool) -> Self {
        self.higher_is_better = higher_is_better;
        self
    }

    pub fn build(self) -> MetricDefinition {
        MetricDefinition {
            name: self.name,
            metric_type: MetricType::Custom { unit: self.unit },
            higher_is_better: self.higher_is_better,
        }
    }
}

/// Helper functions for creating standard metrics
impl MetricDefinition {
    pub fn quality(name: String, scale: f64) -> Self {
        Self {
            name,
            metric_type: MetricType::Quality { scale },
            higher_is_better: true,
        }
    }

    pub fn time_to_completion(name: String) -> Self {
        Self {
            name,
            metric_type: MetricType::TimeToCompletion,
            higher_is_better: false,
        }
    }

    pub fn defect_rate(name: String) -> Self {
        Self {
            name,
            metric_type: MetricType::DefectRate,
            higher_is_better: false,
        }
    }

    pub fn cost_efficiency(name: String) -> Self {
        Self {
            name,
            metric_type: MetricType::CostEfficiency,
            higher_is_better: true,
        }
    }

    pub fn custom(name: String, unit: String, higher_is_better: bool) -> Self {
        Self {
            name,
            metric_type: MetricType::Custom { unit },
            higher_is_better,
        }
    }
}

// ============================================================================
// Benchmark Builder
// ============================================================================

/// Builder for creating benchmarks
pub struct BenchmarkBuilder {
    benchmark_id: String,
    name: String,
    category: String,
    test_cases: Vec<TestCase>,
    metrics: Vec<MetricDefinition>,
}

impl BenchmarkBuilder {
    pub fn new(benchmark_id: String, name: String, category: String) -> Self {
        Self {
            benchmark_id,
            name,
            category,
            test_cases: Vec::new(),
            metrics: Vec::new(),
        }
    }

    pub fn add_test_case(mut self, test_case: TestCase) -> Self {
        self.test_cases.push(test_case);
        self
    }

    pub fn add_metric(mut self, metric: MetricDefinition) -> Self {
        self.metrics.push(metric);
        self
    }

    pub fn build(self) -> Result<Benchmark> {
        if self.test_cases.is_empty() {
            return Err(PlatformError::BenchmarkError(
                "Benchmark must have at least one test case".to_string(),
            ));
        }

        if self.metrics.is_empty() {
            return Err(PlatformError::BenchmarkError(
                "Benchmark must have at least one metric".to_string(),
            ));
        }

        Ok(Benchmark {
            benchmark_id: self.benchmark_id,
            name: self.name,
            category: self.category,
            test_cases: self.test_cases,
            metrics: self.metrics,
        })
    }
}

// ============================================================================
// Tests
// ============================================================================

#[cfg(test)]
mod tests {
    use super::*;

    fn create_test_benchmark() -> Benchmark {
        BenchmarkBuilder::new(
            "test_bench_1".to_string(),
            "Test Benchmark".to_string(),
            "testing".to_string(),
        )
        .add_test_case(TestCase::new(
            "test1".to_string(),
            "Test Case 1".to_string(),
            serde_json::json!({"input": "test"}),
        ))
        .add_test_case(TestCase::new(
            "test2".to_string(),
            "Test Case 2".to_string(),
            serde_json::json!({"input": "test2"}),
        ))
        .add_metric(MetricDefinition::quality("Quality".to_string(), 100.0))
        .add_metric(MetricDefinition::time_to_completion("Time".to_string()))
        .build()
        .unwrap()
    }

    #[test]
    fn test_benchmark_builder() {
        let benchmark = create_test_benchmark();
        assert_eq!(benchmark.benchmark_id, "test_bench_1");
        assert_eq!(benchmark.test_cases.len(), 2);
        assert_eq!(benchmark.metrics.len(), 2);
    }

    #[test]
    fn test_benchmark_builder_validation() {
        // No test cases
        let result =
            BenchmarkBuilder::new("test".to_string(), "Test".to_string(), "cat".to_string())
                .add_metric(MetricDefinition::quality("Quality".to_string(), 100.0))
                .build();
        assert!(result.is_err());

        // No metrics
        let result =
            BenchmarkBuilder::new("test".to_string(), "Test".to_string(), "cat".to_string())
                .add_test_case(TestCase::new(
                    "test1".to_string(),
                    "Test".to_string(),
                    serde_json::json!({}),
                ))
                .build();
        assert!(result.is_err());
    }

    #[test]
    fn test_run_benchmark() {
        let service = DefaultBenchmarkService::new();
        let benchmark = create_test_benchmark();

        let result = service.run_benchmark(&benchmark);
        assert!(result.is_ok());

        let result = result.unwrap();
        assert_eq!(result.benchmark_id, "test_bench_1");
        assert_eq!(result.test_case_results.len(), 2);
        assert!(result.metrics.contains_key("Quality"));
        assert!(result.metrics.contains_key("Time"));
    }

    #[test]
    fn test_compare_results() {
        let service = DefaultBenchmarkService::new();
        let benchmark = create_test_benchmark();

        let baseline = service.run_benchmark(&benchmark).unwrap();
        let comparison = service.run_benchmark(&benchmark).unwrap();

        let comp_result = service.compare_results(&baseline, &comparison);
        assert!(comp_result.is_ok());

        let comp = comp_result.unwrap();
        assert_eq!(comp.metric_comparisons.len(), 2);
    }

    #[test]
    fn test_compare_different_benchmarks() {
        let service = DefaultBenchmarkService::new();
        let benchmark1 = create_test_benchmark();
        let mut benchmark2 = create_test_benchmark();
        benchmark2.benchmark_id = "different".to_string();

        let result1 = service.run_benchmark(&benchmark1).unwrap();
        let result2 = service.run_benchmark(&benchmark2).unwrap();

        let comp_result = service.compare_results(&result1, &result2);
        assert!(comp_result.is_err());
    }

    #[test]
    fn test_leaderboard() {
        let mut service = DefaultBenchmarkService::new();
        let benchmark = create_test_benchmark();

        // Run benchmark multiple times with different versions
        let mut result1 = service.run_benchmark(&benchmark).unwrap();
        result1.workflow_version = "1.0.0".to_string();
        result1.provider = "provider_a".to_string();

        let mut result2 = service.run_benchmark(&benchmark).unwrap();
        result2.workflow_version = "2.0.0".to_string();
        result2.provider = "provider_b".to_string();

        service.store_result(result1).unwrap();
        service.store_result(result2).unwrap();

        let leaderboard = service.get_leaderboard("testing").unwrap();
        assert_eq!(leaderboard.len(), 2);
        assert_eq!(leaderboard[0].rank, 1);
        assert_eq!(leaderboard[1].rank, 2);
    }

    #[test]
    fn test_custom_metric() {
        let metric = CustomMetricBuilder::new("CustomMetric".to_string())
            .with_unit("requests/sec".to_string())
            .higher_is_better(true)
            .build();

        assert_eq!(metric.name, "CustomMetric");
        assert!(metric.higher_is_better);
        match metric.metric_type {
            MetricType::Custom { unit } => assert_eq!(unit, "requests/sec"),
            _ => panic!("Expected Custom metric type"),
        }
    }

    #[test]
    fn test_metric_normalization() {
        let service = DefaultBenchmarkService::new();
        let values = vec![10.0, 20.0, 30.0];

        // Quality metric (higher is better)
        let normalized =
            service.normalize_metric(20.0, &MetricType::Quality { scale: 100.0 }, &values);
        assert!((normalized - 0.5).abs() < 0.01);

        // Time metric (lower is better)
        let normalized = service.normalize_metric(20.0, &MetricType::TimeToCompletion, &values);
        assert!((normalized - 0.5).abs() < 0.01);
    }

    #[test]
    fn test_store_and_retrieve_results() {
        let mut service = DefaultBenchmarkService::new();
        let benchmark = create_test_benchmark();

        let result = service.run_benchmark(&benchmark).unwrap();
        service.store_result(result.clone()).unwrap();

        let retrieved = service.get_results(&benchmark.benchmark_id).unwrap();
        assert_eq!(retrieved.len(), 1);
        assert_eq!(retrieved[0].benchmark_id, result.benchmark_id);
    }
}

// ============================================================================
// Example Usage
// ============================================================================

#[cfg(test)]
mod integration_tests {
    use super::*;

    #[test]
    fn test_complete_benchmarking_workflow() {
        // Create a benchmark with multiple test cases and metrics
        let benchmark = BenchmarkBuilder::new(
            "workflow_v1".to_string(),
            "Workflow Performance Benchmark".to_string(),
            "code_generation".to_string(),
        )
        .add_test_case(TestCase::new(
            "simple_function".to_string(),
            "Generate simple function".to_string(),
            serde_json::json!({
                "task": "create a function that adds two numbers"
            }),
        ))
        .add_test_case(TestCase::new(
            "complex_class".to_string(),
            "Generate complex class".to_string(),
            serde_json::json!({
                "task": "create a class with multiple methods"
            }),
        ))
        .add_test_case(TestCase::new(
            "error_handling".to_string(),
            "Generate error handling".to_string(),
            serde_json::json!({
                "task": "add error handling to existing code"
            }),
        ))
        .add_metric(MetricDefinition::quality("Code Quality".to_string(), 100.0))
        .add_metric(MetricDefinition::time_to_completion(
            "Execution Time".to_string(),
        ))
        .add_metric(MetricDefinition::defect_rate("Defect Rate".to_string()))
        .add_metric(MetricDefinition::cost_efficiency(
            "Cost Efficiency".to_string(),
        ))
        .build()
        .unwrap();

        // Create service and run benchmark
        let mut service = DefaultBenchmarkService::new();

        // Run benchmark for version 1.0
        let mut result_v1 = service.run_benchmark(&benchmark).unwrap();
        result_v1.workflow_version = "1.0.0".to_string();
        result_v1.provider = "provider_a".to_string();

        // Verify results
        assert_eq!(result_v1.test_case_results.len(), 3);
        assert!(result_v1.metrics.contains_key("Code Quality"));
        assert!(result_v1.metrics.contains_key("Execution Time"));
        assert!(result_v1.metrics.contains_key("Defect Rate"));
        assert!(result_v1.metrics.contains_key("Cost Efficiency"));

        // Store result
        service.store_result(result_v1.clone()).unwrap();

        // Run benchmark for version 2.0
        let mut result_v2 = service.run_benchmark(&benchmark).unwrap();
        result_v2.workflow_version = "2.0.0".to_string();
        result_v2.provider = "provider_b".to_string();

        // Store result
        service.store_result(result_v2.clone()).unwrap();

        // Compare results
        let comparison = service.compare_results(&result_v1, &result_v2).unwrap();
        assert_eq!(comparison.metric_comparisons.len(), 4);

        // Verify each metric comparison has required fields
        for (metric_name, comp) in &comparison.metric_comparisons {
            assert!(!metric_name.is_empty());
            assert!(comp.normalized_baseline >= 0.0 && comp.normalized_baseline <= 1.0);
            assert!(comp.normalized_comparison >= 0.0 && comp.normalized_comparison <= 1.0);
        }

        // Get leaderboard
        let leaderboard = service.get_leaderboard("code_generation").unwrap();
        assert_eq!(leaderboard.len(), 2);
        assert_eq!(leaderboard[0].rank, 1);
        assert_eq!(leaderboard[1].rank, 2);

        // Verify leaderboard entries have all required data
        for entry in &leaderboard {
            assert!(!entry.workflow_version.is_empty());
            assert!(!entry.provider.is_empty());
            assert!(entry.normalized_score >= 0.0 && entry.normalized_score <= 1.0);
            assert!(!entry.metrics.is_empty());
        }
    }

    #[test]
    fn test_custom_metrics_workflow() {
        // Create benchmark with custom metrics
        let custom_metric = CustomMetricBuilder::new("Throughput".to_string())
            .with_unit("requests/sec".to_string())
            .higher_is_better(true)
            .build();

        let benchmark = BenchmarkBuilder::new(
            "custom_bench".to_string(),
            "Custom Metrics Benchmark".to_string(),
            "performance".to_string(),
        )
        .add_test_case(TestCase::new(
            "load_test".to_string(),
            "Load Test".to_string(),
            serde_json::json!({"load": 1000}),
        ))
        .add_metric(custom_metric)
        .add_metric(MetricDefinition::quality("Quality".to_string(), 100.0))
        .build()
        .unwrap();

        let service = DefaultBenchmarkService::new();
        let result = service.run_benchmark(&benchmark).unwrap();

        assert!(result.metrics.contains_key("Throughput"));
        assert!(result.metrics.contains_key("Quality"));
    }

    #[test]
    fn test_metric_optimization_direction() {
        // Test that higher_is_better flag works correctly
        let quality_metric = MetricDefinition::quality("Quality".to_string(), 100.0);
        assert!(quality_metric.higher_is_better);

        let time_metric = MetricDefinition::time_to_completion("Time".to_string());
        assert!(!time_metric.higher_is_better);

        let defect_metric = MetricDefinition::defect_rate("Defects".to_string());
        assert!(!defect_metric.higher_is_better);

        let cost_metric = MetricDefinition::cost_efficiency("Cost".to_string());
        assert!(cost_metric.higher_is_better);
    }

    #[test]
    fn test_benchmark_result_tracking() {
        let mut service = DefaultBenchmarkService::new();
        let benchmark = BenchmarkBuilder::new(
            "tracking_test".to_string(),
            "Tracking Test".to_string(),
            "test".to_string(),
        )
        .add_test_case(TestCase::new(
            "test1".to_string(),
            "Test 1".to_string(),
            serde_json::json!({}),
        ))
        .add_metric(MetricDefinition::quality("Quality".to_string(), 100.0))
        .build()
        .unwrap();

        // Run and store multiple results
        for i in 1..=5 {
            let mut result = service.run_benchmark(&benchmark).unwrap();
            result.workflow_version = format!("1.{}.0", i);
            service.store_result(result).unwrap();
        }

        // Retrieve all results
        let results = service.get_results("tracking_test").unwrap();
        assert_eq!(results.len(), 5);

        // Verify timestamps are present
        for result in &results {
            assert!(result.timestamp_ms > 0);
        }
    }
}
