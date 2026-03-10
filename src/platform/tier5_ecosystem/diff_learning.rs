// Diff Learning Service - capture human edits for improvement

use crate::platform::{PlatformError, Result};
use crate::platform::types::StepId;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

// ============================================================================
// Data Models (Subtask 19.1)
// ============================================================================

/// Human edit captured for learning
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HumanEdit {
    pub edit_id: String,
    pub workflow_id: String,
    pub step_id: StepId,
    pub original_output: String,
    pub edited_output: String,
    pub edit_type: EditType,
    pub editor_id: String,
    pub timestamp_ms: u64,
}

impl HumanEdit {
    pub fn new(
        edit_id: String,
        workflow_id: String,
        step_id: StepId,
        original_output: String,
        edited_output: String,
        edit_type: EditType,
        editor_id: String,
        timestamp_ms: u64,
    ) -> Self {
        Self {
            edit_id,
            workflow_id,
            step_id,
            original_output,
            edited_output,
            edit_type,
            editor_id,
            timestamp_ms,
        }
    }
}

/// Type of edit made by human
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum EditType {
    Correction,
    StyleImprovement,
    AddedDetail,
    RemovedContent,
    Restructure,
}

/// Pattern identified in human edits
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Pattern {
    pub pattern_id: String,
    pub description: String,
    pub frequency: u32,
    pub examples: Vec<HumanEdit>,
}

impl Pattern {
    pub fn new(pattern_id: String, description: String) -> Self {
        Self {
            pattern_id,
            description,
            frequency: 0,
            examples: Vec::new(),
        }
    }

    pub fn add_example(&mut self, edit: HumanEdit) {
        self.frequency += 1;
        self.examples.push(edit);
    }
}

/// Training dataset generated from edits
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrainingDataset {
    pub examples: Vec<TrainingExample>,
    pub metadata: DatasetMetadata,
}

impl TrainingDataset {
    pub fn new(metadata: DatasetMetadata) -> Self {
        Self {
            examples: Vec::new(),
            metadata,
        }
    }

    pub fn add_example(&mut self, example: TrainingExample) {
        self.examples.push(example);
    }
}

/// Individual training example
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrainingExample {
    pub input: String,
    pub output: String,
    pub edit_type: EditType,
    pub workflow_id: String,
    pub timestamp_ms: u64,
}

impl TrainingExample {
    pub fn from_edit(edit: &HumanEdit) -> Self {
        Self {
            input: edit.original_output.clone(),
            output: edit.edited_output.clone(),
            edit_type: edit.edit_type.clone(),
            workflow_id: edit.workflow_id.clone(),
            timestamp_ms: edit.timestamp_ms,
        }
    }
}

/// Metadata for training dataset
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DatasetMetadata {
    pub dataset_id: String,
    pub workflow_id: Option<String>,
    pub created_at_ms: u64,
    pub total_examples: usize,
    pub edit_type_distribution: HashMap<EditType, usize>,
}

impl DatasetMetadata {
    pub fn new(dataset_id: String, workflow_id: Option<String>, created_at_ms: u64) -> Self {
        Self {
            dataset_id,
            workflow_id,
            created_at_ms,
            total_examples: 0,
            edit_type_distribution: HashMap::new(),
        }
    }
}

/// Filters for generating training data
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct TrainingFilters {
    pub workflow_id: Option<String>,
    pub time_range: Option<TimeRange>,
    pub edit_types: Option<Vec<EditType>>,
    pub min_frequency: Option<u32>,
}

impl TrainingFilters {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn with_workflow(mut self, workflow_id: String) -> Self {
        self.workflow_id = Some(workflow_id);
        self
    }

    pub fn with_time_range(mut self, start_ms: u64, end_ms: u64) -> Self {
        self.time_range = Some(TimeRange { start_ms, end_ms });
        self
    }

    pub fn with_edit_types(mut self, edit_types: Vec<EditType>) -> Self {
        self.edit_types = Some(edit_types);
        self
    }

    pub fn with_min_frequency(mut self, min_frequency: u32) -> Self {
        self.min_frequency = Some(min_frequency);
        self
    }
}

/// Time range for filtering
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimeRange {
    pub start_ms: u64,
    pub end_ms: u64,
}

// ============================================================================
// DiffLearningService Trait (Subtask 19.1)
// ============================================================================

/// Service for capturing and learning from human edits
pub trait DiffLearningService {
    /// Capture a human edit for learning
    fn capture_edit(&mut self, edit: HumanEdit) -> Result<()>;

    /// Analyze patterns in edits for a workflow
    fn analyze_patterns(&self, workflow_id: &str) -> Result<Vec<Pattern>>;

    /// Generate training data from captured edits
    fn generate_training_data(&self, filters: TrainingFilters) -> Result<TrainingDataset>;

    /// Apply learning to future executions
    fn apply_learning(&mut self, workflow_id: &str) -> Result<()>;
}

// ============================================================================
// Implementation (Subtasks 19.2-19.5)
// ============================================================================

/// In-memory implementation of diff learning service
pub struct InMemoryDiffLearningService {
    edits: Vec<HumanEdit>,
    patterns: HashMap<String, Vec<Pattern>>,
    applied_learnings: HashMap<String, Vec<String>>,
}

impl InMemoryDiffLearningService {
    pub fn new() -> Self {
        Self {
            edits: Vec::new(),
            patterns: HashMap::new(),
            applied_learnings: HashMap::new(),
        }
    }

    /// Get all edits for a workflow
    fn get_workflow_edits(&self, workflow_id: &str) -> Vec<&HumanEdit> {
        self.edits
            .iter()
            .filter(|e| e.workflow_id == workflow_id)
            .collect()
    }

    /// Filter edits based on criteria
    fn filter_edits(&self, filters: &TrainingFilters) -> Vec<&HumanEdit> {
        self.edits
            .iter()
            .filter(|edit| {
                // Filter by workflow
                if let Some(ref wf_id) = filters.workflow_id {
                    if &edit.workflow_id != wf_id {
                        return false;
                    }
                }

                // Filter by time range
                if let Some(ref time_range) = filters.time_range {
                    if edit.timestamp_ms < time_range.start_ms
                        || edit.timestamp_ms > time_range.end_ms
                    {
                        return false;
                    }
                }

                // Filter by edit types
                if let Some(ref edit_types) = filters.edit_types {
                    if !edit_types.contains(&edit.edit_type) {
                        return false;
                    }
                }

                true
            })
            .collect()
    }

    /// Identify common themes in edits
    fn identify_themes(&self, edits: &[&HumanEdit]) -> Vec<String> {
        let mut themes = Vec::new();

        // Group by edit type
        let mut type_counts: HashMap<EditType, usize> = HashMap::new();
        for edit in edits {
            *type_counts.entry(edit.edit_type.clone()).or_insert(0) += 1;
        }

        // Generate themes based on frequency
        for (edit_type, count) in type_counts {
            if count >= 3 {
                let theme = match edit_type {
                    EditType::Correction => "Frequent corrections needed",
                    EditType::StyleImprovement => "Style adjustments required",
                    EditType::AddedDetail => "Missing details in output",
                    EditType::RemovedContent => "Excessive content generated",
                    EditType::Restructure => "Output structure needs improvement",
                };
                themes.push(format!("{} ({} occurrences)", theme, count));
            }
        }

        themes
    }
}

impl Default for InMemoryDiffLearningService {
    fn default() -> Self {
        Self::new()
    }
}

impl DiffLearningService for InMemoryDiffLearningService {
    /// Subtask 19.2: Implement edit capture
    fn capture_edit(&mut self, edit: HumanEdit) -> Result<()> {
        // Validate edit
        if edit.edit_id.is_empty() {
            return Err(PlatformError::InvalidInput(
                "edit_id cannot be empty".to_string(),
            ));
        }

        if edit.workflow_id.is_empty() {
            return Err(PlatformError::InvalidInput(
                "workflow_id cannot be empty".to_string(),
            ));
        }

        if edit.original_output.is_empty() {
            return Err(PlatformError::InvalidInput(
                "original_output cannot be empty".to_string(),
            ));
        }

        if edit.edited_output.is_empty() {
            return Err(PlatformError::InvalidInput(
                "edited_output cannot be empty".to_string(),
            ));
        }

        // Store the edit
        self.edits.push(edit);

        Ok(())
    }

    /// Subtask 19.3: Implement pattern analysis
    fn analyze_patterns(&self, workflow_id: &str) -> Result<Vec<Pattern>> {
        let workflow_edits = self.get_workflow_edits(workflow_id);

        if workflow_edits.is_empty() {
            return Ok(Vec::new());
        }

        let mut patterns = Vec::new();

        // Group edits by type for frequency analysis
        let mut type_groups: HashMap<EditType, Vec<&HumanEdit>> = HashMap::new();
        for edit in &workflow_edits {
            type_groups
                .entry(edit.edit_type.clone())
                .or_insert_with(Vec::new)
                .push(edit);
        }

        // Create patterns for each edit type
        for (edit_type, edits) in type_groups {
            let frequency = edits.len() as u32;

            let description = match edit_type {
                EditType::Correction => {
                    format!("Corrections needed in {} outputs", frequency)
                }
                EditType::StyleImprovement => {
                    format!("Style improvements applied {} times", frequency)
                }
                EditType::AddedDetail => {
                    format!("Details added to {} outputs", frequency)
                }
                EditType::RemovedContent => {
                    format!("Content removed from {} outputs", frequency)
                }
                EditType::Restructure => {
                    format!("Structure changed in {} outputs", frequency)
                }
            };

            let mut pattern = Pattern::new(
                format!("{}_{:?}", workflow_id, edit_type),
                description,
            );
            pattern.frequency = frequency;

            // Add examples (up to 5)
            for edit in edits.iter().take(5) {
                pattern.examples.push((*edit).clone());
            }

            patterns.push(pattern);
        }

        // Identify common themes
        let themes = self.identify_themes(&workflow_edits);
        if !themes.is_empty() {
            let mut theme_pattern = Pattern::new(
                format!("{}_themes", workflow_id),
                format!("Common themes: {}", themes.join("; ")),
            );
            theme_pattern.frequency = themes.len() as u32;
            patterns.push(theme_pattern);
        }

        // Cache patterns
        self.patterns
            .clone()
            .insert(workflow_id.to_string(), patterns.clone());

        Ok(patterns)
    }

    /// Subtask 19.4: Implement training data generation
    fn generate_training_data(&self, filters: TrainingFilters) -> Result<TrainingDataset> {
        let filtered_edits = self.filter_edits(&filters);

        // Apply minimum frequency filter if specified
        let final_edits: Vec<&HumanEdit> = if let Some(min_freq) = filters.min_frequency {
            // Group by edit type and filter
            let mut type_counts: HashMap<EditType, usize> = HashMap::new();
            for edit in &filtered_edits {
                *type_counts.entry(edit.edit_type.clone()).or_insert(0) += 1;
            }

            filtered_edits
                .into_iter()
                .filter(|edit| {
                    type_counts
                        .get(&edit.edit_type)
                        .map(|&count| count >= min_freq as usize)
                        .unwrap_or(false)
                })
                .collect()
        } else {
            filtered_edits
        };

        // Create metadata
        let mut edit_type_distribution: HashMap<EditType, usize> = HashMap::new();
        for edit in &final_edits {
            *edit_type_distribution
                .entry(edit.edit_type.clone())
                .or_insert(0) += 1;
        }

        let mut metadata = DatasetMetadata::new(
            format!("dataset_{}", crate::platform::types::current_timestamp_ms()),
            filters.workflow_id.clone(),
            crate::platform::types::current_timestamp_ms(),
        );
        metadata.total_examples = final_edits.len();
        metadata.edit_type_distribution = edit_type_distribution;

        // Create dataset
        let mut dataset = TrainingDataset::new(metadata);

        // Add training examples
        for edit in final_edits {
            dataset.add_example(TrainingExample::from_edit(edit));
        }

        Ok(dataset)
    }

    /// Subtask 19.5: Implement learning application
    fn apply_learning(&mut self, workflow_id: &str) -> Result<()> {
        // Analyze patterns for this workflow
        let patterns = self.analyze_patterns(workflow_id)?;

        if patterns.is_empty() {
            return Ok(());
        }

        // Generate learning recommendations
        let mut recommendations = Vec::new();

        for pattern in &patterns {
            let recommendation = match pattern.description.as_str() {
                desc if desc.contains("Corrections needed") => {
                    format!(
                        "Improve accuracy: {} corrections detected",
                        pattern.frequency
                    )
                }
                desc if desc.contains("Style improvements") => {
                    format!(
                        "Adjust output style: {} style changes detected",
                        pattern.frequency
                    )
                }
                desc if desc.contains("Details added") => {
                    format!(
                        "Include more details: {} additions detected",
                        pattern.frequency
                    )
                }
                desc if desc.contains("Content removed") => {
                    format!(
                        "Reduce verbosity: {} removals detected",
                        pattern.frequency
                    )
                }
                desc if desc.contains("Structure changed") => {
                    format!(
                        "Improve structure: {} restructures detected",
                        pattern.frequency
                    )
                }
                _ => format!("Pattern detected: {}", pattern.description),
            };

            recommendations.push(recommendation);
        }

        // Store applied learnings
        self.applied_learnings
            .insert(workflow_id.to_string(), recommendations);

        Ok(())
    }
}

// ============================================================================
// Tests
// ============================================================================

#[cfg(test)]
mod tests {
    use super::*;

    fn create_test_edit(
        edit_id: &str,
        workflow_id: &str,
        edit_type: EditType,
        timestamp_ms: u64,
    ) -> HumanEdit {
        HumanEdit::new(
            edit_id.to_string(),
            workflow_id.to_string(),
            "step1".to_string(),
            "original output".to_string(),
            "edited output".to_string(),
            edit_type,
            "editor1".to_string(),
            timestamp_ms,
        )
    }

    #[test]
    fn test_capture_edit() {
        let mut service = InMemoryDiffLearningService::new();
        let edit = create_test_edit("edit1", "wf1", EditType::Correction, 1000);

        assert!(service.capture_edit(edit).is_ok());
        assert_eq!(service.edits.len(), 1);
    }

    #[test]
    fn test_capture_edit_validation() {
        let mut service = InMemoryDiffLearningService::new();

        // Empty edit_id
        let mut edit = create_test_edit("", "wf1", EditType::Correction, 1000);
        assert!(service.capture_edit(edit.clone()).is_err());

        // Empty workflow_id
        edit.edit_id = "edit1".to_string();
        edit.workflow_id = String::new();
        assert!(service.capture_edit(edit.clone()).is_err());

        // Empty original_output
        edit.workflow_id = "wf1".to_string();
        edit.original_output = String::new();
        assert!(service.capture_edit(edit.clone()).is_err());

        // Empty edited_output
        edit.original_output = "original".to_string();
        edit.edited_output = String::new();
        assert!(service.capture_edit(edit).is_err());
    }

    #[test]
    fn test_analyze_patterns() {
        let mut service = InMemoryDiffLearningService::new();

        // Add multiple edits of same type
        for i in 0..5 {
            let edit = create_test_edit(
                &format!("edit{}", i),
                "wf1",
                EditType::Correction,
                1000 + i,
            );
            service.capture_edit(edit).unwrap();
        }

        // Add edits of different type
        for i in 0..3 {
            let edit = create_test_edit(
                &format!("edit_style{}", i),
                "wf1",
                EditType::StyleImprovement,
                2000 + i,
            );
            service.capture_edit(edit).unwrap();
        }

        let patterns = service.analyze_patterns("wf1").unwrap();

        // Should have patterns for both edit types plus themes
        assert!(patterns.len() >= 2);

        // Check correction pattern
        let correction_pattern = patterns
            .iter()
            .find(|p| p.description.contains("Corrections"))
            .unwrap();
        assert_eq!(correction_pattern.frequency, 5);
    }

    #[test]
    fn test_generate_training_data() {
        let mut service = InMemoryDiffLearningService::new();

        // Add edits for different workflows
        service
            .capture_edit(create_test_edit("e1", "wf1", EditType::Correction, 1000))
            .unwrap();
        service
            .capture_edit(create_test_edit("e2", "wf1", EditType::Correction, 2000))
            .unwrap();
        service
            .capture_edit(create_test_edit("e3", "wf2", EditType::StyleImprovement, 3000))
            .unwrap();

        // Filter by workflow
        let filters = TrainingFilters::new().with_workflow("wf1".to_string());
        let dataset = service.generate_training_data(filters).unwrap();

        assert_eq!(dataset.examples.len(), 2);
        assert_eq!(dataset.metadata.total_examples, 2);
    }

    #[test]
    fn test_generate_training_data_with_time_range() {
        let mut service = InMemoryDiffLearningService::new();

        service
            .capture_edit(create_test_edit("e1", "wf1", EditType::Correction, 1000))
            .unwrap();
        service
            .capture_edit(create_test_edit("e2", "wf1", EditType::Correction, 2000))
            .unwrap();
        service
            .capture_edit(create_test_edit("e3", "wf1", EditType::Correction, 3000))
            .unwrap();

        // Filter by time range
        let filters = TrainingFilters::new().with_time_range(1500, 2500);
        let dataset = service.generate_training_data(filters).unwrap();

        assert_eq!(dataset.examples.len(), 1);
        assert_eq!(dataset.examples[0].timestamp_ms, 2000);
    }

    #[test]
    fn test_generate_training_data_with_edit_types() {
        let mut service = InMemoryDiffLearningService::new();

        service
            .capture_edit(create_test_edit("e1", "wf1", EditType::Correction, 1000))
            .unwrap();
        service
            .capture_edit(create_test_edit("e2", "wf1", EditType::StyleImprovement, 2000))
            .unwrap();
        service
            .capture_edit(create_test_edit("e3", "wf1", EditType::AddedDetail, 3000))
            .unwrap();

        // Filter by edit types
        let filters =
            TrainingFilters::new().with_edit_types(vec![EditType::Correction, EditType::AddedDetail]);
        let dataset = service.generate_training_data(filters).unwrap();

        assert_eq!(dataset.examples.len(), 2);
    }

    #[test]
    fn test_apply_learning() {
        let mut service = InMemoryDiffLearningService::new();

        // Add multiple corrections
        for i in 0..5 {
            service
                .capture_edit(create_test_edit(
                    &format!("e{}", i),
                    "wf1",
                    EditType::Correction,
                    1000 + i,
                ))
                .unwrap();
        }

        assert!(service.apply_learning("wf1").is_ok());

        // Check that learnings were applied
        let learnings = service.applied_learnings.get("wf1").unwrap();
        assert!(!learnings.is_empty());
        assert!(learnings[0].contains("Improve accuracy"));
    }

    #[test]
    fn test_pattern_frequency_analysis() {
        let mut service = InMemoryDiffLearningService::new();

        // Add 10 corrections
        for i in 0..10 {
            service
                .capture_edit(create_test_edit(
                    &format!("e{}", i),
                    "wf1",
                    EditType::Correction,
                    1000 + i,
                ))
                .unwrap();
        }

        // Add 3 style improvements
        for i in 0..3 {
            service
                .capture_edit(create_test_edit(
                    &format!("s{}", i),
                    "wf1",
                    EditType::StyleImprovement,
                    2000 + i,
                ))
                .unwrap();
        }

        let patterns = service.analyze_patterns("wf1").unwrap();

        let correction_pattern = patterns
            .iter()
            .find(|p| p.description.contains("Corrections"))
            .unwrap();
        assert_eq!(correction_pattern.frequency, 10);

        let style_pattern = patterns
            .iter()
            .find(|p| p.description.contains("Style"))
            .unwrap();
        assert_eq!(style_pattern.frequency, 3);
    }

    #[test]
    fn test_project_specific_customization() {
        let mut service = InMemoryDiffLearningService::new();

        // Add edits for workflow 1
        service
            .capture_edit(create_test_edit("e1", "wf1", EditType::Correction, 1000))
            .unwrap();

        // Add edits for workflow 2
        service
            .capture_edit(create_test_edit("e2", "wf2", EditType::StyleImprovement, 2000))
            .unwrap();

        // Generate training data for each workflow
        let filters1 = TrainingFilters::new().with_workflow("wf1".to_string());
        let dataset1 = service.generate_training_data(filters1).unwrap();

        let filters2 = TrainingFilters::new().with_workflow("wf2".to_string());
        let dataset2 = service.generate_training_data(filters2).unwrap();

        // Each dataset should only contain edits for its workflow
        assert_eq!(dataset1.examples.len(), 1);
        assert_eq!(dataset1.examples[0].workflow_id, "wf1");

        assert_eq!(dataset2.examples.len(), 1);
        assert_eq!(dataset2.examples[0].workflow_id, "wf2");
    }
}
