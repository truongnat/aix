# Workflow Marketplace

The Workflow Marketplace enables sharing and reusing workflow packages with versioning, ratings, and dependency resolution. This component is part of Tier 5: Ecosystem & Network Effects.

## Overview

The Workflow Marketplace provides a platform for:
- **Publishing** workflow packages with metadata and versioning
- **Discovering** workflows through search by keywords, tags, ratings, and authors
- **Installing** workflows with automatic dependency resolution
- **Rating** workflows to help users make informed decisions
- **Managing** workflow versions with semantic versioning support

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Workflow Marketplace                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Publish    │  │    Search    │  │   Install    │ │
│  │   Workflow   │  │  & Discover  │  │   Workflow   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Rating &   │  │  Dependency  │  │   Version    │ │
│  │   Reviews    │  │  Resolution  │  │  Management  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Core Components

### 1. WorkflowPackage

Represents a workflow package with metadata:

```rust
pub struct WorkflowPackage {
    pub package_id: PackageId,
    pub name: String,
    pub version: String,
    pub author: String,
    pub description: String,
    pub workflow_content: String,
    pub dependencies: Vec<Dependency>,
    pub tags: Vec<String>,
    pub license: String,
    pub created_at_ms: u64,
    pub updated_at_ms: u64,
}
```

### 2. SearchQuery

Query for discovering workflows:

```rust
pub struct SearchQuery {
    pub keywords: Vec<String>,
    pub tags: Vec<String>,
    pub min_rating: Option<f64>,
    pub compatible_version: Option<String>,
    pub author: Option<String>,
}
```

### 3. Rating

User rating for a workflow:

```rust
pub struct Rating {
    pub user_id: String,
    pub score: f64,           // 1.0 to 5.0
    pub review: Option<String>,
    pub timestamp_ms: u64,
}
```

### 4. Dependency

Package dependency with version constraint:

```rust
pub struct Dependency {
    pub package_id: PackageId,
    pub version_constraint: String,  // e.g., "^1.0", "~2.1", "*"
    pub optional: bool,
}
```

## Usage Examples

### Publishing a Workflow

```rust
use agentic_sdlc::platform::tier5_ecosystem::{
    InMemoryWorkflowMarketplace, WorkflowMarketplace, WorkflowPackageBuilder,
};

let mut marketplace = InMemoryWorkflowMarketplace::new();

let package = WorkflowPackageBuilder::new(
    "Data Pipeline".to_string(),
    "1.0.0".to_string(),
    "alice@example.com".to_string(),
)
.with_description("ETL data pipeline".to_string())
.with_content("workflow content here".to_string())
.add_tag("data".to_string())
.add_tag("etl".to_string())
.with_license("MIT".to_string())
.build()?;

let package_id = marketplace.publish_workflow(package)?;
```

### Searching for Workflows

```rust
use agentic_sdlc::platform::tier5_ecosystem::SearchQuery;

// Search by keywords
let query = SearchQuery::new()
    .with_keywords(vec!["data".to_string(), "pipeline".to_string()]);
let results = marketplace.search_workflows(query)?;

// Search by tags
let query = SearchQuery::new()
    .with_tags(vec!["etl".to_string()]);
let results = marketplace.search_workflows(query)?;

// Search with minimum rating
let query = SearchQuery::new()
    .with_min_rating(4.0);
let results = marketplace.search_workflows(query)?;

// Search by author
let query = SearchQuery::new()
    .with_author("alice@example.com".to_string());
let results = marketplace.search_workflows(query)?;
```

### Rating a Workflow

```rust
use agentic_sdlc::platform::tier5_ecosystem::Rating;

let rating = Rating::new("user1".to_string(), 5.0)?
    .with_review("Excellent workflow!".to_string());

marketplace.rate_workflow(&package_id, rating)?;

// Get aggregate rating
let aggregate = marketplace.get_aggregate_rating(&package_id)?;
println!("Average: {:.1} stars ({} ratings)", 
    aggregate.average_score, 
    aggregate.total_ratings
);
```

### Installing with Dependencies

```rust
use agentic_sdlc::platform::tier5_ecosystem::Dependency;

// Create a workflow with dependencies
let dependent_workflow = WorkflowPackageBuilder::new(
    "Advanced Analytics".to_string(),
    "1.0.0".to_string(),
    "bob@example.com".to_string(),
)
.with_content("analytics workflow".to_string())
.add_dependency(Dependency::new(
    pipeline_id.clone(),
    "^1.0".to_string()  // Compatible with 1.x
))
.build()?;

let analytics_id = marketplace.publish_workflow(dependent_workflow)?;

// Install will automatically resolve and install dependencies
marketplace.install_workflow(&analytics_id, "1.0.0")?;
```

## Version Constraints

The marketplace supports semantic versioning constraints:

- **Exact**: `"1.0.0"` - Exact version match
- **Wildcard**: `"*"` - Any version
- **Caret**: `"^1.0"` - Compatible with 1.x (1.0.0, 1.1.0, 1.2.0, but not 2.0.0)
- **Tilde**: `"~1.0"` - Approximately equivalent (1.0.x)

## Dependency Resolution

The marketplace automatically resolves dependencies:

1. **Depth-First Resolution**: Recursively resolves all dependencies
2. **Circular Detection**: Detects and prevents circular dependencies
3. **Version Matching**: Finds compatible versions based on constraints
4. **Installation Order**: Installs dependencies before dependent packages

Example dependency chain:
```
Package A (depends on B ^1.0)
  └─ Package B v1.2.0 (depends on C ~2.0)
      └─ Package C v2.0.5
```

Installing A will automatically install B and C in the correct order.

## Rating System

### Individual Ratings
- Users can rate workflows from 1.0 to 5.0 stars
- Optional text reviews
- Users can update their ratings

### Aggregate Ratings
- Average score calculated from all ratings
- Total number of ratings
- Distribution of star ratings (1-5 stars)

### Search Ranking
- Search results are sorted by average rating (highest first)
- Helps users discover high-quality workflows

## Implementation Details

### Data Storage

The `InMemoryWorkflowMarketplace` implementation stores:
- **Packages**: HashMap of PackageId to versions
- **Ratings**: HashMap of PackageId to rating list
- **Installed**: HashMap of PackageId to installed version
- **Search Index**: HashMap of keywords/tags to package IDs

### Search Indexing

Workflows are indexed by:
- Name words (tokenized)
- Description words (tokenized)
- Tags
- Author

This enables fast keyword-based search.

### Validation

The marketplace validates:
- Package names and versions are non-empty
- Workflow content is non-empty
- Rating scores are between 1.0 and 5.0
- No duplicate versions for the same package
- Dependencies exist and have compatible versions

## Error Handling

Common errors:
- `InvalidInput`: Invalid package data or rating
- `NotFound`: Package or version not found
- `DependencyError`: Dependency resolution failed (missing, circular, incompatible)

## Testing

The implementation includes comprehensive tests:

### Unit Tests
- Package validation
- Rating validation
- Search by keywords, tags, author, rating
- Version matching
- Dependency resolution
- Circular dependency detection

### Integration Tests
- Complete marketplace workflow
- Dependency chain installation
- Semantic versioning compatibility
- Search ranking by rating

Run tests:
```bash
cargo test workflow_marketplace
```

## Performance Considerations

- **Search**: O(n) where n = number of packages (with indexing optimization)
- **Publish**: O(1) for storage, O(m) for indexing where m = words/tags
- **Install**: O(d) where d = number of dependencies
- **Rating**: O(1) for adding, O(r) for aggregate where r = number of ratings

## Future Enhancements

Potential improvements:
1. **Persistent Storage**: Database backend for production use
2. **Full-Text Search**: Advanced search with relevance ranking
3. **Dependency Graphs**: Visualize package dependencies
4. **Download Statistics**: Track package popularity
5. **Security Scanning**: Automated security checks for published workflows
6. **Package Signing**: Cryptographic signatures for authenticity
7. **Private Packages**: Support for private/organization-specific packages
8. **Package Deprecation**: Mark packages as deprecated
9. **Changelog**: Track changes between versions
10. **API Integration**: REST API for marketplace operations

## Requirements Satisfied

This implementation satisfies **Requirement 15** from the design document:

- ✅ 15.1: Store workflow packages with metadata and versioning
- ✅ 15.2: Search workflows by keywords, tags, rating, version
- ✅ 15.3: Resolve and install dependencies in correct order
- ✅ 15.4: Record ratings with scores and reviews
- ✅ 15.5: Support semantic versioning
- ✅ 15.6: Display aggregate ratings for informed decisions

## Related Components

- **Benchmarking**: Measure workflow performance
- **Diff Learning**: Learn from human edits to improve workflows
- **Cost Tracking**: Track workflow execution costs

## Example Application

See `examples/workflow_marketplace_example.rs` for a complete demonstration of:
- Publishing multiple workflow packages
- Managing dependencies
- Rating and reviewing workflows
- Searching with various criteria
- Installing workflows with dependency resolution
- Version management

Run the example:
```bash
cargo run --example workflow_marketplace_example
```
