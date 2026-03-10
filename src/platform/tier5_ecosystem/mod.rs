// Tier 5: Ecosystem & Network Effects
//
// This tier provides benchmarking, diff-based learning,
// and workflow marketplace for ecosystem growth.

pub mod benchmarking;
pub mod diff_learning;
pub mod workflow_marketplace;

// Re-exports
pub use benchmarking::DefaultBenchmarkService;
pub use diff_learning::InMemoryDiffLearningService;
pub use workflow_marketplace::InMemoryWorkflowMarketplace;
