# Diff-Based Learning System

## Overview

The Diff-Based Learning system captures human edits to agent outputs and uses them to improve future executions. This enables continuous learning from human feedback, project-specific customization, and systematic identification of improvement areas.

## Architecture

### Components

1. **HumanEdit**: Captures the difference between agent output and human-edited version
2. **EditType**: Classifies the type of edit (Correction, StyleImprovement, AddedDetail, RemovedContent, Restructure)
3. **Pattern**: Identifies recurring patterns in edits through frequency analysis
4. **TrainingDataset**: Generates training examples for fine-tuning
5. **DiffLearningService**: Core service interface for all learning operations

### Data Flow

```
Agent Output → Human Edit → Capture → Pattern Analysis → Training Data → Learning Application
```

## Features

### 1. Edit Capture (Requirement 14.1)

Captures human edits with complete context:
- Original agent output
- Human-edited output
- Edit type classification
- Editor identification
- Timestamp for historical tracking

```rust
let edit = HumanEdit::new(
    "edit_001".to_string(),
    "workflow_id".to_string(),
    "step_id".to_string(),
    "original output".to_string(),
    "edited output".to_string(),
    EditType::Correction,
    "editor_id".to_string(),
    current_timestamp_ms(),
);

service.capture_edit(edit)?;
```

### 2. Pattern Analysis (Requirement 14.2)

Identifies patterns through:
- **Frequency Analysis**: Counts edits by type
- **Theme Detection**: Identifies common issues (e.g., "Frequent corrections needed")
- **Example Collection**: Stores representative examples for each pattern

```rust
let patterns = service.analyze_patterns("workflow_id")?;

for pattern in patterns {
    println!("Pattern: {}", pattern.description);
    println!("Frequency: {}", pattern.frequency);
    println!("Examples: {}", pattern.examples.len());
}
```

### 3. Training Data Generation (Requirement 14.3)

Creates training datasets with flexible filtering:
- **By Workflow**: Project-specific datasets
- **By Time Range**: Recent edits or historical analysis
- **By Edit Type**: Focus on specific improvement areas
- **By Frequency**: Filter out rare patterns

```rust
let filters = TrainingFilters::new()
    .with_workflow("code_generation".to_string())
    .with_time_range(start_ms, end_ms)
    .with_edit_types(vec![EditType::Correction, EditType::StyleImprovement])
    .with_min_frequency(3);

let dataset = service.generate_training_data(filters)?;
```

### 4. Learning Application (Requirement 14.4)

Applies identified patterns to improve future executions:
- Generates actionable recommendations
- Tracks which patterns have been applied
- Provides rationale for each recommendation

```rust
service.apply_learning("workflow_id")?;

// Recommendations are generated based on patterns:
// - "Improve accuracy: 5 corrections detected"
// - "Adjust output style: 3 style changes detected"
// - "Include more details: 2 additions detected"
```

### 5. Project-Specific Customization (Requirement 14.5)

Supports learning within specific contexts:
- **Per-Workflow**: Each workflow learns independently
- **Per-Tenant**: Multi-tenant isolation (when integrated with Tier 4)
- **Per-Editor**: Track individual editor preferences

```rust
// Code generation workflow
let code_filters = TrainingFilters::new()
    .with_workflow("code_generation".to_string());
let code_dataset = service.generate_training_data(code_filters)?;

// Documentation workflow
let doc_filters = TrainingFilters::new()
    .with_workflow("documentation".to_string());
let doc_dataset = service.generate_training_data(doc_filters)?;
```

## Edit Types

### Correction
Bug fixes and accuracy improvements. Indicates the agent made an error that needed fixing.

**Example**: Adding overflow protection to arithmetic operations

### StyleImprovement
Formatting and style adjustments. The output was correct but didn't match style preferences.

**Example**: Adding proper indentation and spacing to code

### AddedDetail
Additional information or documentation. The output was incomplete or lacked necessary details.

**Example**: Adding documentation comments to functions

### RemovedContent
Reducing verbosity or unnecessary content. The output was too verbose or included irrelevant information.

**Example**: Removing excessive test cases

### Restructure
Organizational changes. The content was correct but needed better structure.

**Example**: Reorganizing code sections for better readability

## Implementation Details

### InMemoryDiffLearningService

The default implementation stores edits in memory:

```rust
pub struct InMemoryDiffLearningService {
    edits: Vec<HumanEdit>,
    patterns: HashMap<String, Vec<Pattern>>,
    applied_learnings: HashMap<String, Vec<String>>,
}
```

**Key Methods**:
- `capture_edit()`: Validates and stores edits
- `analyze_patterns()`: Groups edits by type and identifies themes
- `generate_training_data()`: Filters edits and creates training examples
- `apply_learning()`: Generates recommendations from patterns

### Pattern Identification Algorithm

1. **Group by Type**: Organize edits by EditType
2. **Count Frequency**: Calculate how often each type occurs
3. **Identify Themes**: Detect patterns with frequency ≥ 3
4. **Collect Examples**: Store up to 5 representative examples per pattern
5. **Generate Descriptions**: Create human-readable pattern descriptions

### Training Dataset Format

```rust
pub struct TrainingDataset {
    pub examples: Vec<TrainingExample>,
    pub metadata: DatasetMetadata,
}

pub struct TrainingExample {
    pub input: String,           // Original agent output
    pub output: String,          // Human-edited version
    pub edit_type: EditType,     // Classification
    pub workflow_id: String,     // Context
    pub timestamp_ms: u64,       // When the edit occurred
}
```

## Use Cases

### 1. LLM Fine-Tuning
Generate training datasets to fine-tune language models based on human corrections.

### 2. Quality Monitoring
Track edit patterns to identify systematic issues in agent outputs.

### 3. Style Guide Development
Build project-specific style guides from accumulated style improvements.

### 4. Continuous Improvement
Create feedback loops where the system learns from every human edit.

### 5. Compliance & Audit
Maintain complete audit trail of human oversight and corrections.

## Testing

The implementation includes comprehensive tests:

- **Edit Capture**: Validation of required fields
- **Pattern Analysis**: Frequency counting and theme detection
- **Training Data**: Filtering by workflow, time, and edit type
- **Learning Application**: Recommendation generation
- **Project-Specific**: Workflow isolation

Run tests:
```bash
cargo test diff_learning
```

## Example Usage

See `examples/diff_learning_example.rs` for a complete demonstration:

```bash
cargo run --example diff_learning_example
```

## Integration Points

### With Tier 1 (Execution Intelligence)
- Feed learning recommendations into Adaptive Planner
- Use patterns to improve future planning decisions

### With Tier 4 (Organizational Scale)
- Integrate with tenant isolation for multi-tenant learning
- Track costs of human edits vs automated improvements

### With Tier 5 (Ecosystem)
- Combine with benchmarking to measure improvement over time
- Share anonymized patterns in workflow marketplace

## Future Enhancements

1. **Persistent Storage**: Database backend for edit history
2. **Advanced Analytics**: Machine learning for pattern detection
3. **Real-Time Learning**: Apply patterns immediately to running workflows
4. **Collaborative Filtering**: Learn from edits across multiple users
5. **Automated Fine-Tuning**: Direct integration with LLM training pipelines

## Performance Considerations

- **Memory Usage**: In-memory implementation suitable for moderate edit volumes
- **Pattern Caching**: Patterns are cached per workflow to avoid recomputation
- **Filtering Efficiency**: O(n) filtering where n is number of edits
- **Scalability**: For large-scale deployments, consider database backend

## Security & Privacy

- **PII Protection**: Ensure edited content doesn't contain sensitive information
- **Access Control**: Restrict edit capture to authorized editors
- **Audit Trail**: Maintain complete history for compliance
- **Data Retention**: Implement policies for edit history retention

## Metrics

Track these metrics to measure effectiveness:

- **Edit Frequency**: How often humans edit agent outputs
- **Pattern Prevalence**: Most common edit types
- **Learning Impact**: Reduction in edits after learning application
- **Time to Improvement**: How quickly patterns are identified and applied
- **Editor Satisfaction**: Feedback on learning effectiveness
