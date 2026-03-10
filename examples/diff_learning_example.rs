// Example demonstrating the Diff-Based Learning system
//
// This example shows how to:
// 1. Capture human edits to agent outputs
// 2. Analyze patterns in the edits
// 3. Generate training datasets
// 4. Apply learning to improve future executions
//
// Note: This example shows the API usage. In a real binary project,
// you would need to make these types public or create a library crate.

fn main() {
    println!("=== Diff-Based Learning Example ===\n");

    println!("This example demonstrates the Diff-Based Learning API:");
    println!();

    // Example 1: Capturing edits
    println!("1. Capturing Human Edits");
    println!("   ----------------------");
    println!("   let mut service = InMemoryDiffLearningService::new();");
    println!();
    println!("   // Capture a correction");
    println!("   let edit = HumanEdit::new(");
    println!("       \"edit_001\".to_string(),");
    println!("       \"code_generation_workflow\".to_string(),");
    println!("       \"generate_function\".to_string(),");
    println!("       \"fn calculate(x: i32) -> i32 {{ x * 2 }}\".to_string(),");
    println!(
        "       \"fn calculate(x: i32) -> i32 {{ x.checked_mul(2).unwrap_or(0) }}\".to_string(),"
    );
    println!("       EditType::Correction,");
    println!("       \"developer_alice\".to_string(),");
    println!("       current_timestamp_ms(),");
    println!("   );");
    println!("   service.capture_edit(edit)?;");
    println!();
    println!("   ✓ Edit captured with full context:");
    println!("     - Original output: fn calculate(x: i32) -> i32 {{ x * 2 }}");
    println!("     - Edited output: Added overflow protection");
    println!("     - Edit type: Correction");
    println!("     - Editor: developer_alice");
    println!();

    // Example 2: Analyzing patterns
    println!("2. Analyzing Edit Patterns");
    println!("   ------------------------");
    println!("   let patterns = service.analyze_patterns(\"code_generation_workflow\")?;");
    println!();
    println!("   ✓ Patterns identified:");
    println!("     Pattern: Corrections needed in 5 outputs");
    println!("       Frequency: 5");
    println!("       Examples: 5 edits");
    println!();
    println!("     Pattern: Style improvements applied 3 times");
    println!("       Frequency: 3");
    println!("       Examples: 3 edits");
    println!();
    println!("     Pattern: Common themes");
    println!("       - Frequent corrections needed (5 occurrences)");
    println!("       - Style adjustments required (3 occurrences)");
    println!();

    // Example 3: Generating training data
    println!("3. Generating Training Datasets");
    println!("   ----------------------------");
    println!("   // Filter by edit type");
    println!("   let filters = TrainingFilters::new()");
    println!("       .with_workflow(\"code_generation_workflow\".to_string())");
    println!("       .with_edit_types(vec![EditType::Correction]);");
    println!();
    println!("   let dataset = service.generate_training_data(filters)?;");
    println!();
    println!("   ✓ Training dataset generated:");
    println!("     Total examples: 5");
    println!("     Edit type distribution:");
    println!("       Correction: 5");
    println!();
    println!("   // Filter by time range");
    println!("   let filters = TrainingFilters::new()");
    println!("       .with_time_range(start_ms, end_ms);");
    println!();
    println!("   // Filter by workflow");
    println!("   let filters = TrainingFilters::new()");
    println!("       .with_workflow(\"specific_workflow\".to_string());");
    println!();

    // Example 4: Applying learning
    println!("4. Applying Learning");
    println!("   -----------------");
    println!("   service.apply_learning(\"code_generation_workflow\")?;");
    println!();
    println!("   ✓ Learning applied:");
    println!("     - Improve accuracy: 5 corrections detected");
    println!("     - Adjust output style: 3 style changes detected");
    println!("     - Include more details: 2 additions detected");
    println!();

    // Example 5: Project-specific customization
    println!("5. Project-Specific Customization");
    println!("   -------------------------------");
    println!("   // Each workflow learns independently");
    println!("   let code_filters = TrainingFilters::new()");
    println!("       .with_workflow(\"code_generation_workflow\".to_string());");
    println!("   let code_dataset = service.generate_training_data(code_filters)?;");
    println!();
    println!("   let doc_filters = TrainingFilters::new()");
    println!("       .with_workflow(\"documentation_workflow\".to_string());");
    println!("   let doc_dataset = service.generate_training_data(doc_filters)?;");
    println!();
    println!("   ✓ Separate learning per workflow:");
    println!("     - Code generation: 5 examples");
    println!("     - Documentation: 3 examples");
    println!();

    // Summary
    println!("=== Example Complete ===");
    println!();
    println!("Key Features:");
    println!(
        "• Edit Capture: Records original output, edited output, edit type, editor, timestamp"
    );
    println!("• Pattern Analysis: Identifies frequent edit types and common themes");
    println!("• Training Data: Generates datasets filtered by workflow, time, edit type");
    println!("• Learning Application: Applies patterns to improve future executions");
    println!("• Project-Specific: Supports per-workflow and per-tenant customization");
    println!();
    println!("Edit Types:");
    println!("• Correction: Bug fixes and accuracy improvements");
    println!("• StyleImprovement: Formatting and style adjustments");
    println!("• AddedDetail: Additional information or documentation");
    println!("• RemovedContent: Reducing verbosity or unnecessary content");
    println!("• Restructure: Organizational changes");
    println!();
    println!("Use Cases:");
    println!("• Fine-tuning LLMs based on human corrections");
    println!("• Identifying systematic issues in agent outputs");
    println!("• Building project-specific style guides");
    println!("• Continuous improvement through feedback loops");
    println!("• Compliance and audit trail for human oversight");
}
