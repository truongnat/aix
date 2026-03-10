# Performance Benchmarking System

## Overview

The Performance Benchmarking system (Tier 5.1) provides a comprehensive framework for measuring and comparing workflow quality, time, and defect rate across different versions and providers. It enables objective performance comparison and maintains public leaderboards for tracking improvements over time.

## Features

### Core Capabilities

1. **Benchmark Definition**: Define benchmarks with name, category, test cases, and metric definitions
2. **Benchmark Execution**: Execute benchmarks and collect metrics (quality, time, defect rate, cost efficiency)
3. **Result Comparison**: Normalize metrics and generate comparison reports between different runs
4. **Public Leaderboard**: Maintain leaderboards organized by category for public comparison
5. **Custom Metrics**: Support custom metric definitions with configurable scales and optimization directions

## Architecture

### Data Models

#### Benchmark
Defines a complete benchmark with test cases and metrics to measure:
```rust
pub struct Benchmark {
    pub benchmark_id: String,
    pub name: String,
    pub category: String,
    pub test_cases: Vec<TestCase>,
    pub metrics: Vec<MetricDefinition>,
}
```

#### TestCase
Individual test case within a benchmark:
```rust
pub struct TestCase {
    pub test_id: String,
    pub name: String,
    pub input: serde_json::Value,
    pub expected_output: Option<serde_json::Value>,
}
```

#### MetricDefinition
Defines a metric to be measured:
```rust
pub struct MetricDefinition {
    pub name: String,
    pub metric_type: MetricType,
    pub higher_is_better: bool,
}

pub enum MetricType {
    Quality { scale: f64 },
    TimeToCompletion,
    DefectRate,
    CostEfficiency,
    Custom { unit: String },
}
```

#### BenchmarkResult
Result of running a benchmark:
```rust
pub struct BenchmarkResult {
    pub benchmark_id: String,
    pub workflow_version: String,
    pub provider: String,
    pub metrics: HashMap<String, f64>,
    pub timestamp_ms: u64,
    pub test_case_results: Vec<TestCaseResult>,
}
```

#### LeaderboardEntry
Entry in the public leaderboard:
```rust
pub struct LeaderboardEntry {
    pub rank: usize,
    pub workflow_version: String,
    pub provider: String,
    pub category: String,
    pub normalized_score: f64,
    pub metrics: HashMap<String, f64>,
    pub timestamp_ms: u64,
}
```

### Service Trait

The `BenchmarkService` trait defines the core operations:

```rust
pub trait BenchmarkService {
    fn run_benchmark(&self, benchmark: &Benchmark) -> Result<BenchmarkResult>;
    fn compare_results(&self, baseline: &BenchmarkResult, comparison: &BenchmarkResult) -> Result<Comparison>;
    fn get_leaderboard(&self, category: &str) -> Result<Vec<LeaderboardEntry>>;
    fn store_result(&mut self, result: BenchmarkResult) -> Result<()>;
    fn get_results(&self, benchmark_id: &str) -> Result<Vec<BenchmarkResult>>;
}
```

## Usage Examples

### Creating a Benchmark

```rust
use agentic_sdlc::platform::tier5_ecosystem::{
    BenchmarkBuilder, TestCase, MetricDefinition
};

let benchmark = BenchmarkBuilder::new(
    "workflow_v1".to_string(),
    "Code Generation Benchmark".to_string(),
    "code_generation".to_string(),
)
.add_test_case(
    TestCase::new(
        "simple_function".to_string(),
        "Generate simple function".to_string(),
        serde_json::json!({
            "task": "create a function that adds two numbers"
        }),
    )
)
.add_metric(MetricDefinition::quality("Code Quality".to_string(), 100.0))
.add_metric(MetricDefinition::time_to_completion("Execution Time".to_string()))
.add_metric(MetricDefinition::defect_rate("Defect Rate".to_string()))
.build()
.unwrap();
```

### Running a Benchmark

```rust
use agentic_sdlc::platform::tier5_ecosystem::{
    DefaultBenchmarkService, BenchmarkService
};

let service = DefaultBenchmarkService::new();
let result = service.run_benchmark(&benchmark)?;

println!("Benchmark completed:");
println!("  Version: {}", result.workflow_version);
println!("  Provider: {}", result.provider);
println!("  Metrics:");
for (name, value) in &result.metrics {
    println!("    {}: {}", name, value);
}
```

### Comparing Results

```rust
let baseline = service.run_benchmark(&benchmark)?;
let comparison = service.run_benchmark(&benchmark)?;

let comp = service.compare_results(&baseline, &comparison)?;

println!("Overall improvement: {:.2}%", comp.overall_improvement);
for (metric_name, metric_comp) in &comp.metric_comparisons {
    println!("  {}: {:.2}%", metric_name, metric_comp.improvement_percentage);
}
```

### Getting Leaderboard

```rust
let mut service = DefaultBenchmarkService::new();

// Store multiple results
service.store_result(result_v1)?;
service.store_result(result_v2)?;
service.store_result(result_v3)?;

// Get leaderboard
let leaderboard = service.get_leaderboard("code_generation")?;

println!("Leaderboard:");
for entry in leaderboard {
    println!("  {}. {} ({}) - Score: {:.3}",
        entry.rank,
        entry.workflow_version,
        entry.provider,
        entry.normalized_score
    );
}
```

### Custom Metrics

```rust
use agentic_sdlc::platform::tier5_ecosystem::CustomMetricBuilder;

let custom_metric = CustomMetricBuilder::new("Throughput".to_string())
    .with_unit("requests/sec".to_string())
    .higher_is_better(true)
    .build();

let benchmark = BenchmarkBuilder::new(
    "perf_bench".to_string(),
    "Performance Benchmark".to_string(),
    "performance".to_string(),
)
.add_test_case(test_case)
.add_metric(custom_metric)
.build()?;
```

## Metric Types

### Standard Metrics

1. **Quality**: Measures output quality on a configurable scale
   - Higher is better
   - Calculated as pass rate × scale

2. **TimeToCompletion**: Measures execution time in milliseconds
   - Lower is better
   - Sum of all test case durations

3. **DefectRate**: Measures the rate of failed tests
   - Lower is better
   - Failed tests / total tests

4. **CostEfficiency**: Measures passed tests per unit cost
   - Higher is better
   - Passed tests / total cost

### Custom Metrics

Custom metrics allow domain-specific measurements:
- Configurable unit (e.g., "requests/sec", "lines of code")
- Configurable optimization direction (higher or lower is better)
- Flexible value calculation

## Metric Normalization

All metrics are normalized to a 0-1 scale for fair comparison:

1. **Collect all values** for a metric across all results
2. **Find min and max** values
3. **Normalize**: `(value - min) / (max - min)`
4. **Invert if needed**: For "lower is better" metrics, use `1 - normalized`

This ensures:
- Fair comparison across different metric types
- Consistent scoring in leaderboards
- Meaningful improvement percentages

## Leaderboard Scoring

Leaderboard entries are scored by:

1. **Normalize each metric** to 0-1 scale
2. **Average normalized scores** across all metrics
3. **Sort by score** (descending)
4. **Assign ranks** (1 = best)

## Implementation Details

### Benchmark Execution

1. **Validate benchmark**: Ensure test cases and metrics are defined
2. **Execute test cases**: Run each test case and collect results
3. **Calculate metrics**: Compute each metric from test results
4. **Store results**: Save with timestamp for historical tracking

### Result Comparison

1. **Validate compatibility**: Ensure results are from same benchmark
2. **Compare metrics**: Calculate improvement for each metric
3. **Normalize values**: Convert to 0-1 scale for fair comparison
4. **Calculate overall improvement**: Average across all metrics

### Leaderboard Generation

1. **Filter by category**: Select relevant results
2. **Normalize scores**: Calculate normalized score for each result
3. **Sort by score**: Order from best to worst
4. **Assign ranks**: Number entries sequentially

## Testing

The implementation includes comprehensive tests:

- **Unit tests**: Test individual components (builders, metrics, normalization)
- **Integration tests**: Test complete workflows (benchmark → compare → leaderboard)
- **Validation tests**: Test error handling and edge cases

Run tests with:
```bash
cargo test --bin agentic-sdlc platform::tier5_ecosystem::benchmarking
```

## Future Enhancements

Potential improvements for future iterations:

1. **Persistent Storage**: Store results in database for long-term tracking
2. **Real Execution**: Integrate with actual workflow execution engine
3. **Statistical Analysis**: Add confidence intervals and significance testing
4. **Visualization**: Generate charts and graphs for results
5. **Automated Regression Detection**: Alert when performance degrades
6. **Multi-dimensional Leaderboards**: Filter by provider, version, date range
7. **Benchmark Suites**: Group related benchmarks for comprehensive testing

## Requirements Satisfied

This implementation satisfies all requirements from the specification:

- ✅ **Requirement 13.1**: Define benchmarks with name, category, test cases, and metric definitions
- ✅ **Requirement 13.2**: Execute benchmarks and collect metrics (quality, time, defect rate, cost efficiency)
- ✅ **Requirement 13.3**: Normalize metrics and generate comparison reports
- ✅ **Requirement 13.4**: Maintain public leaderboard organized by category
- ✅ **Requirement 13.5**: Support custom metric definitions with configurable scales and optimization directions

## Design Specifications

Implements Component 5.1 from the design document:

- ✅ **BenchmarkService trait**: With run_benchmark, compare_results, get_leaderboard methods
- ✅ **Data models**: Benchmark, BenchmarkResult, MetricDefinition, LeaderboardEntry
- ✅ **Metrics**: Quality, TimeToCompletion, DefectRate, CostEfficiency
- ✅ **Custom metrics**: With higher_is_better flag
- ✅ **Normalization**: Metrics normalized to 0-1 scale
- ✅ **Historical tracking**: Results stored with timestamps
- ✅ **Category filtering**: Leaderboard supports category-based filtering
