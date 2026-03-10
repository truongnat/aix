// Example: Performance Benchmarking System
//
// This example demonstrates how to use the benchmarking system to measure
// and compare workflow performance across different versions and providers.

// Note: This example shows the API usage. In a real binary project,
// you would need to make these types public or create a library crate.

fn main() {
    println!("=== Performance Benchmarking Example ===\n");

    // Example 1: Creating a benchmark
    println!("1. Creating a benchmark...");
    example_create_benchmark();

    // Example 2: Running benchmarks
    println!("\n2. Running benchmarks...");
    example_run_benchmark();

    // Example 3: Comparing results
    println!("\n3. Comparing results...");
    example_compare_results();

    // Example 4: Leaderboard
    println!("\n4. Generating leaderboard...");
    example_leaderboard();

    // Example 5: Custom metrics
    println!("\n5. Using custom metrics...");
    example_custom_metrics();
}

fn example_create_benchmark() {
    println!("Creating a code generation benchmark with multiple test cases...");
    
    // In actual usage:
    // let benchmark = BenchmarkBuilder::new(
    //     "code_gen_v1".to_string(),
    //     "Code Generation Benchmark".to_string(),
    //     "code_generation".to_string(),
    // )
    // .add_test_case(
    //     TestCase::new(
    //         "simple_function".to_string(),
    //         "Generate simple function".to_string(),
    //         json!({"task": "create a function that adds two numbers"}),
    //     )
    // )
    // .add_metric(MetricDefinition::quality("Code Quality".to_string(), 100.0))
    // .add_metric(MetricDefinition::time_to_completion("Execution Time".to_string()))
    // .build()
    // .unwrap();
    
    println!("  ✓ Benchmark created with 3 test cases and 4 metrics");
}

fn example_run_benchmark() {
    println!("Running benchmark for version 1.0.0...");
    
    // In actual usage:
    // let service = DefaultBenchmarkService::new();
    // let result = service.run_benchmark(&benchmark).unwrap();
    
    println!("  ✓ Benchmark completed");
    println!("    - Test cases executed: 3");
    println!("    - Metrics collected: 4");
    println!("    - Code Quality: 95.0");
    println!("    - Execution Time: 1250ms");
    println!("    - Defect Rate: 0.05");
    println!("    - Cost Efficiency: 75.0");
}

fn example_compare_results() {
    println!("Comparing version 1.0.0 vs 2.0.0...");
    
    // In actual usage:
    // let comparison = service.compare_results(&result_v1, &result_v2).unwrap();
    
    println!("  ✓ Comparison completed");
    println!("    Overall improvement: +12.5%");
    println!("    Metric improvements:");
    println!("      - Code Quality: +5.3%");
    println!("      - Execution Time: -15.2% (faster)");
    println!("      - Defect Rate: -20.0% (fewer defects)");
    println!("      - Cost Efficiency: +18.5%");
}

fn example_leaderboard() {
    println!("Generating leaderboard for 'code_generation' category...");
    
    // In actual usage:
    // let leaderboard = service.get_leaderboard("code_generation").unwrap();
    
    println!("  ✓ Leaderboard generated");
    println!("\n  Rank | Version | Provider   | Score");
    println!("  -----|---------|------------|-------");
    println!("     1 | 2.0.0   | provider_b | 0.875");
    println!("     2 | 1.5.0   | provider_a | 0.823");
    println!("     3 | 1.0.0   | provider_a | 0.756");
}

fn example_custom_metrics() {
    println!("Creating benchmark with custom metrics...");
    
    // In actual usage:
    // let custom_metric = CustomMetricBuilder::new("Throughput".to_string())
    //     .with_unit("requests/sec".to_string())
    //     .higher_is_better(true)
    //     .build();
    
    println!("  ✓ Custom metric created: Throughput (requests/sec)");
    println!("  ✓ Optimization direction: higher is better");
    println!("  ✓ Benchmark executed with custom metric");
    println!("    - Throughput: 1250 requests/sec");
}
