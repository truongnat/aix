// Workflow Marketplace - share and reuse workflow packages

use crate::platform::{PlatformError, Result};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

// ============================================================================
// Data Models (Subtask 20.1)
// ============================================================================

/// Workflow package for marketplace
#[derive(Debug, Clone, Serialize, Deserialize)]
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

impl WorkflowPackage {
    pub fn new(
        package_id: PackageId,
        name: String,
        version: String,
        author: String,
        description: String,
        workflow_content: String,
        license: String,
    ) -> Self {
        let timestamp = crate::platform::types::current_timestamp_ms();
        Self {
            package_id,
            name,
            version,
            author,
            description,
            workflow_content,
            dependencies: Vec::new(),
            tags: Vec::new(),
            license,
            created_at_ms: timestamp,
            updated_at_ms: timestamp,
        }
    }

    pub fn add_dependency(&mut self, dependency: Dependency) {
        self.dependencies.push(dependency);
    }

    pub fn add_tag(&mut self, tag: String) {
        if !self.tags.contains(&tag) {
            self.tags.push(tag);
        }
    }
}

/// Package identifier
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct PackageId(String);

impl PackageId {
    pub fn new(id: String) -> Result<Self> {
        if id.is_empty() || id.len() > 128 {
            return Err(PlatformError::InvalidInput(
                "PackageId must be between 1 and 128 characters".to_string(),
            ));
        }
        Ok(PackageId(id))
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl std::fmt::Display for PackageId {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.0)
    }
}

/// Package dependency
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Dependency {
    pub package_id: PackageId,
    pub version_constraint: String,
    pub optional: bool,
}

impl Dependency {
    pub fn new(package_id: PackageId, version_constraint: String) -> Self {
        Self {
            package_id,
            version_constraint,
            optional: false,
        }
    }

    pub fn optional(mut self) -> Self {
        self.optional = true;
        self
    }
}

/// Search query for finding workflows
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct SearchQuery {
    pub keywords: Vec<String>,
    pub tags: Vec<String>,
    pub min_rating: Option<f64>,
    pub compatible_version: Option<String>,
    pub author: Option<String>,
}

impl SearchQuery {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn with_keywords(mut self, keywords: Vec<String>) -> Self {
        self.keywords = keywords;
        self
    }

    pub fn with_tags(mut self, tags: Vec<String>) -> Self {
        self.tags = tags;
        self
    }

    pub fn with_min_rating(mut self, min_rating: f64) -> Self {
        self.min_rating = Some(min_rating);
        self
    }

    pub fn with_compatible_version(mut self, version: String) -> Self {
        self.compatible_version = Some(version);
        self
    }

    pub fn with_author(mut self, author: String) -> Self {
        self.author = Some(author);
        self
    }
}

/// User rating for a workflow
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Rating {
    pub user_id: String,
    pub score: f64,
    pub review: Option<String>,
    pub timestamp_ms: u64,
}

impl Rating {
    pub fn new(user_id: String, score: f64) -> Result<Self> {
        if !(1.0..=5.0).contains(&score) {
            return Err(PlatformError::InvalidInput(
                "Rating score must be between 1.0 and 5.0".to_string(),
            ));
        }

        Ok(Self {
            user_id,
            score,
            review: None,
            timestamp_ms: crate::platform::types::current_timestamp_ms(),
        })
    }

    pub fn with_review(mut self, review: String) -> Self {
        self.review = Some(review);
        self
    }
}

/// Aggregate rating information for a package
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AggregateRating {
    pub average_score: f64,
    pub total_ratings: usize,
    pub rating_distribution: HashMap<u8, usize>, // 1-5 stars -> count
    scores: Vec<f64>, // Store actual scores for accurate average
}

impl AggregateRating {
    pub fn new() -> Self {
        Self {
            average_score: 0.0,
            total_ratings: 0,
            rating_distribution: HashMap::new(),
            scores: Vec::new(),
        }
    }

    pub fn add_rating(&mut self, rating: &Rating) {
        let star_rating = rating.score.round() as u8;
        *self.rating_distribution.entry(star_rating).or_insert(0) += 1;
        self.scores.push(rating.score);
        self.total_ratings += 1;
        self.recalculate_average();
    }

    fn recalculate_average(&mut self) {
        if self.scores.is_empty() {
            self.average_score = 0.0;
            return;
        }

        let total_score: f64 = self.scores.iter().sum();
        self.average_score = total_score / self.scores.len() as f64;
    }
}

impl Default for AggregateRating {
    fn default() -> Self {
        Self::new()
    }
}

// ============================================================================
// WorkflowMarketplace Trait (Subtask 20.1)
// ============================================================================

/// Marketplace for sharing and discovering workflow packages
pub trait WorkflowMarketplace {
    /// Publish a workflow package to the marketplace
    fn publish_workflow(&mut self, workflow: WorkflowPackage) -> Result<PackageId>;

    /// Search for workflows matching query criteria
    fn search_workflows(&self, query: SearchQuery) -> Result<Vec<WorkflowPackage>>;

    /// Install a workflow package with dependency resolution
    fn install_workflow(&mut self, package_id: &PackageId, version: &str) -> Result<()>;

    /// Rate a workflow package
    fn rate_workflow(&mut self, package_id: &PackageId, rating: Rating) -> Result<()>;

    /// Get aggregate rating for a package
    fn get_aggregate_rating(&self, package_id: &PackageId) -> Result<AggregateRating>;

    /// Get a specific workflow package
    fn get_workflow(&self, package_id: &PackageId, version: &str) -> Result<WorkflowPackage>;
}

// ============================================================================
// Default Implementation (Subtasks 20.2-20.5)
// ============================================================================

/// In-memory implementation of workflow marketplace
pub struct InMemoryWorkflowMarketplace {
    packages: HashMap<PackageId, Vec<WorkflowPackage>>, // PackageId -> versions
    ratings: HashMap<PackageId, Vec<Rating>>,
    installed: HashMap<PackageId, String>, // PackageId -> installed version
    search_index: HashMap<String, Vec<PackageId>>, // keyword/tag -> packages
}

impl InMemoryWorkflowMarketplace {
    pub fn new() -> Self {
        Self {
            packages: HashMap::new(),
            ratings: HashMap::new(),
            installed: HashMap::new(),
            search_index: HashMap::new(),
        }
    }

    /// Index a package for search
    fn index_package(&mut self, package: &WorkflowPackage) {
        // Index by name words
        for word in package.name.to_lowercase().split_whitespace() {
            self.search_index
                .entry(word.to_string())
                .or_insert_with(Vec::new)
                .push(package.package_id.clone());
        }

        // Index by description words
        for word in package.description.to_lowercase().split_whitespace() {
            self.search_index
                .entry(word.to_string())
                .or_insert_with(Vec::new)
                .push(package.package_id.clone());
        }

        // Index by tags
        for tag in &package.tags {
            self.search_index
                .entry(tag.to_lowercase())
                .or_insert_with(Vec::new)
                .push(package.package_id.clone());
        }

        // Index by author
        self.search_index
            .entry(package.author.to_lowercase())
            .or_insert_with(Vec::new)
            .push(package.package_id.clone());
    }

    /// Check if version matches constraint
    fn version_matches(&self, version: &str, constraint: &str) -> bool {
        // Simple version matching - in production would use semver crate
        if constraint == "*" {
            return true;
        }

        if constraint.starts_with("^") {
            // Caret: compatible with version
            let constraint_version = &constraint[1..];
            return version.starts_with(constraint_version);
        }

        if constraint.starts_with("~") {
            // Tilde: approximately equivalent
            let constraint_version = &constraint[1..];
            return version.starts_with(constraint_version);
        }

        // Exact match
        version == constraint
    }

    /// Resolve dependencies for a package
    fn resolve_dependencies(
        &self,
        package: &WorkflowPackage,
        resolved: &mut Vec<(PackageId, String)>,
        visited: &mut std::collections::HashSet<PackageId>,
    ) -> Result<()> {
        // Detect circular dependencies
        if visited.contains(&package.package_id) {
            return Err(PlatformError::DependencyError(format!(
                "Circular dependency detected: {}",
                package.package_id
            )));
        }

        visited.insert(package.package_id.clone());

        // Resolve each dependency
        for dep in &package.dependencies {
            // Skip if already resolved
            if resolved.iter().any(|(id, _)| id == &dep.package_id) {
                continue;
            }

            // Find matching version
            let versions = self.packages.get(&dep.package_id).ok_or_else(|| {
                PlatformError::DependencyError(format!(
                    "Dependency not found: {}",
                    dep.package_id
                ))
            })?;

            let matching_version = versions
                .iter()
                .find(|v| self.version_matches(&v.version, &dep.version_constraint))
                .ok_or_else(|| {
                    PlatformError::DependencyError(format!(
                        "No matching version for {}: {}",
                        dep.package_id, dep.version_constraint
                    ))
                })?;

            // Recursively resolve dependencies
            self.resolve_dependencies(matching_version, resolved, visited)?;

            // Add to resolved list
            resolved.push((dep.package_id.clone(), matching_version.version.clone()));
        }

        Ok(())
    }

    /// Match package against search query
    fn matches_query(&self, package: &WorkflowPackage, query: &SearchQuery) -> bool {
        // Check keywords
        if !query.keywords.is_empty() {
            let package_text = format!(
                "{} {} {}",
                package.name.to_lowercase(),
                package.description.to_lowercase(),
                package.tags.join(" ").to_lowercase()
            );

            let matches_keywords = query
                .keywords
                .iter()
                .any(|kw| package_text.contains(&kw.to_lowercase()));

            if !matches_keywords {
                return false;
            }
        }

        // Check tags
        if !query.tags.is_empty() {
            let has_tag = query
                .tags
                .iter()
                .any(|tag| package.tags.contains(tag));

            if !has_tag {
                return false;
            }
        }

        // Check author
        if let Some(ref author) = query.author {
            if !package.author.eq_ignore_ascii_case(author) {
                return false;
            }
        }

        // Check rating
        if let Some(min_rating) = query.min_rating {
            if let Some(ratings) = self.ratings.get(&package.package_id) {
                let mut agg = AggregateRating::new();
                for rating in ratings {
                    agg.add_rating(rating);
                }
                if agg.average_score < min_rating {
                    return false;
                }
            } else {
                // No ratings yet
                return false;
            }
        }

        true
    }
}

impl Default for InMemoryWorkflowMarketplace {
    fn default() -> Self {
        Self::new()
    }
}

impl WorkflowMarketplace for InMemoryWorkflowMarketplace {
    /// Subtask 20.2: Implement workflow publishing
    fn publish_workflow(&mut self, workflow: WorkflowPackage) -> Result<PackageId> {
        // Validate package
        if workflow.name.is_empty() {
            return Err(PlatformError::InvalidInput(
                "Workflow name cannot be empty".to_string(),
            ));
        }

        if workflow.version.is_empty() {
            return Err(PlatformError::InvalidInput(
                "Workflow version cannot be empty".to_string(),
            ));
        }

        if workflow.workflow_content.is_empty() {
            return Err(PlatformError::InvalidInput(
                "Workflow content cannot be empty".to_string(),
            ));
        }

        // Check if version already exists
        if let Some(versions) = self.packages.get(&workflow.package_id) {
            if versions.iter().any(|v| v.version == workflow.version) {
                return Err(PlatformError::InvalidInput(format!(
                    "Version {} already exists for package {}",
                    workflow.version, workflow.package_id
                )));
            }
        }

        // Index for search
        self.index_package(&workflow);

        // Store package
        let package_id = workflow.package_id.clone();
        self.packages
            .entry(package_id.clone())
            .or_insert_with(Vec::new)
            .push(workflow);

        Ok(package_id)
    }

    /// Subtask 20.3: Implement workflow search and discovery
    fn search_workflows(&self, query: SearchQuery) -> Result<Vec<WorkflowPackage>> {
        let mut results = Vec::new();
        let mut seen_packages = std::collections::HashSet::new();

        // Collect all packages
        for versions in self.packages.values() {
            for package in versions {
                // Skip duplicates (only return latest version)
                if seen_packages.contains(&package.package_id) {
                    continue;
                }

                // Check if matches query
                if self.matches_query(package, &query) {
                    results.push(package.clone());
                    seen_packages.insert(package.package_id.clone());
                }
            }
        }

        // Sort by rating (highest first)
        results.sort_by(|a, b| {
            let rating_a = self
                .ratings
                .get(&a.package_id)
                .map(|ratings| {
                    let mut agg = AggregateRating::new();
                    for r in ratings {
                        agg.add_rating(r);
                    }
                    agg.average_score
                })
                .unwrap_or(0.0);

            let rating_b = self
                .ratings
                .get(&b.package_id)
                .map(|ratings| {
                    let mut agg = AggregateRating::new();
                    for r in ratings {
                        agg.add_rating(r);
                    }
                    agg.average_score
                })
                .unwrap_or(0.0);

            rating_b.partial_cmp(&rating_a).unwrap_or(std::cmp::Ordering::Equal)
        });

        Ok(results)
    }

    /// Subtask 20.4: Implement workflow installation with dependency resolution
    fn install_workflow(&mut self, package_id: &PackageId, version: &str) -> Result<()> {
        // Find the package
        let versions = self.packages.get(package_id).ok_or_else(|| {
            PlatformError::NotFound(format!("Package not found: {}", package_id))
        })?;

        let package = versions
            .iter()
            .find(|v| v.version == version)
            .ok_or_else(|| {
                PlatformError::NotFound(format!(
                    "Version {} not found for package {}",
                    version, package_id
                ))
            })?;

        // Resolve dependencies
        let mut resolved = Vec::new();
        let mut visited = std::collections::HashSet::new();
        self.resolve_dependencies(package, &mut resolved, &mut visited)?;

        // Install dependencies in correct order
        for (dep_id, dep_version) in resolved {
            if !self.installed.contains_key(&dep_id) {
                self.installed.insert(dep_id.clone(), dep_version.clone());
            }
        }

        // Install the package itself
        self.installed.insert(package_id.clone(), version.to_string());

        Ok(())
    }

    /// Subtask 20.5: Implement rating and review system
    fn rate_workflow(&mut self, package_id: &PackageId, rating: Rating) -> Result<()> {
        // Verify package exists
        if !self.packages.contains_key(package_id) {
            return Err(PlatformError::NotFound(format!(
                "Package not found: {}",
                package_id
            )));
        }

        // Check if user already rated this package
        if let Some(ratings) = self.ratings.get_mut(package_id) {
            // Remove existing rating from same user
            ratings.retain(|r| r.user_id != rating.user_id);
            ratings.push(rating);
        } else {
            self.ratings.insert(package_id.clone(), vec![rating]);
        }

        Ok(())
    }

    fn get_aggregate_rating(&self, package_id: &PackageId) -> Result<AggregateRating> {
        let ratings = self.ratings.get(package_id).ok_or_else(|| {
            PlatformError::NotFound(format!("No ratings found for package: {}", package_id))
        })?;

        let mut aggregate = AggregateRating::new();
        for rating in ratings {
            aggregate.add_rating(rating);
        }

        Ok(aggregate)
    }

    fn get_workflow(&self, package_id: &PackageId, version: &str) -> Result<WorkflowPackage> {
        let versions = self.packages.get(package_id).ok_or_else(|| {
            PlatformError::NotFound(format!("Package not found: {}", package_id))
        })?;

        versions
            .iter()
            .find(|v| v.version == version)
            .cloned()
            .ok_or_else(|| {
                PlatformError::NotFound(format!(
                    "Version {} not found for package {}",
                    version, package_id
                ))
            })
    }
}

// ============================================================================
// Builder Pattern
// ============================================================================

/// Builder for creating workflow packages
pub struct WorkflowPackageBuilder {
    package_id: Option<PackageId>,
    name: String,
    version: String,
    author: String,
    description: String,
    workflow_content: String,
    dependencies: Vec<Dependency>,
    tags: Vec<String>,
    license: String,
}

impl WorkflowPackageBuilder {
    pub fn new(name: String, version: String, author: String) -> Self {
        Self {
            package_id: None,
            name,
            version,
            author,
            description: String::new(),
            workflow_content: String::new(),
            dependencies: Vec::new(),
            tags: Vec::new(),
            license: "MIT".to_string(),
        }
    }

    pub fn with_package_id(mut self, package_id: PackageId) -> Self {
        self.package_id = Some(package_id);
        self
    }

    pub fn with_description(mut self, description: String) -> Self {
        self.description = description;
        self
    }

    pub fn with_content(mut self, content: String) -> Self {
        self.workflow_content = content;
        self
    }

    pub fn add_dependency(mut self, dependency: Dependency) -> Self {
        self.dependencies.push(dependency);
        self
    }

    pub fn add_tag(mut self, tag: String) -> Self {
        if !self.tags.contains(&tag) {
            self.tags.push(tag);
        }
        self
    }

    pub fn with_license(mut self, license: String) -> Self {
        self.license = license;
        self
    }

    pub fn build(self) -> Result<WorkflowPackage> {
        let package_id = self.package_id.unwrap_or_else(|| {
            PackageId::new(format!("{}_{}", self.name, self.version)).unwrap()
        });

        let mut package = WorkflowPackage::new(
            package_id,
            self.name,
            self.version,
            self.author,
            self.description,
            self.workflow_content,
            self.license,
        );

        package.dependencies = self.dependencies;
        package.tags = self.tags;

        Ok(package)
    }
}

// ============================================================================
// Tests
// ============================================================================

#[cfg(test)]
mod tests {
    use super::*;

    // Helper function for creating test packages
    pub(super) fn create_test_package(name: &str, version: &str) -> WorkflowPackage {
        WorkflowPackageBuilder::new(
            name.to_string(),
            version.to_string(),
            "test_author".to_string(),
        )
        .with_description("Test workflow package".to_string())
        .with_content("workflow content here".to_string())
        .add_tag("test".to_string())
        .build()
        .unwrap()
    }

    #[test]
    fn test_package_id_validation() {
        // Valid ID
        assert!(PackageId::new("valid_id".to_string()).is_ok());

        // Empty ID
        assert!(PackageId::new("".to_string()).is_err());

        // Too long ID
        let long_id = "a".repeat(129);
        assert!(PackageId::new(long_id).is_err());
    }

    #[test]
    fn test_rating_validation() {
        // Valid rating
        assert!(Rating::new("user1".to_string(), 4.5).is_ok());

        // Invalid ratings
        assert!(Rating::new("user1".to_string(), 0.5).is_err());
        assert!(Rating::new("user1".to_string(), 5.5).is_err());
    }

    #[test]
    fn test_publish_workflow() {
        let mut marketplace = InMemoryWorkflowMarketplace::new();
        let package = create_test_package("test_workflow", "1.0.0");

        let result = marketplace.publish_workflow(package);
        assert!(result.is_ok());
    }

    #[test]
    fn test_publish_duplicate_version() {
        let mut marketplace = InMemoryWorkflowMarketplace::new();
        let package1 = create_test_package("test_workflow", "1.0.0");
        let package2 = create_test_package("test_workflow", "1.0.0");

        marketplace.publish_workflow(package1).unwrap();
        let result = marketplace.publish_workflow(package2);
        assert!(result.is_err());
    }

    #[test]
    fn test_publish_validation() {
        let mut marketplace = InMemoryWorkflowMarketplace::new();

        // Empty name
        let mut package = create_test_package("", "1.0.0");
        assert!(marketplace.publish_workflow(package.clone()).is_err());

        // Empty version
        package.name = "test".to_string();
        package.version = String::new();
        assert!(marketplace.publish_workflow(package.clone()).is_err());

        // Empty content
        package.version = "1.0.0".to_string();
        package.workflow_content = String::new();
        assert!(marketplace.publish_workflow(package).is_err());
    }

    #[test]
    fn test_search_by_keywords() {
        let mut marketplace = InMemoryWorkflowMarketplace::new();

        let package1 = WorkflowPackageBuilder::new(
            "Data Processing".to_string(),
            "1.0.0".to_string(),
            "author1".to_string(),
        )
        .with_description("Process data efficiently".to_string())
        .with_content("content".to_string())
        .build()
        .unwrap();

        let package2 = WorkflowPackageBuilder::new(
            "API Integration".to_string(),
            "1.0.0".to_string(),
            "author2".to_string(),
        )
        .with_description("Integrate with APIs".to_string())
        .with_content("content".to_string())
        .build()
        .unwrap();

        marketplace.publish_workflow(package1).unwrap();
        marketplace.publish_workflow(package2).unwrap();

        // Search for "data"
        let query = SearchQuery::new().with_keywords(vec!["data".to_string()]);
        let results = marketplace.search_workflows(query).unwrap();
        assert_eq!(results.len(), 1);
        assert_eq!(results[0].name, "Data Processing");
    }

    #[test]
    fn test_search_by_tags() {
        let mut marketplace = InMemoryWorkflowMarketplace::new();

        let package1 = WorkflowPackageBuilder::new(
            "Workflow 1".to_string(),
            "1.0.0".to_string(),
            "author1".to_string(),
        )
        .with_content("content".to_string())
        .add_tag("automation".to_string())
        .build()
        .unwrap();

        let package2 = WorkflowPackageBuilder::new(
            "Workflow 2".to_string(),
            "1.0.0".to_string(),
            "author2".to_string(),
        )
        .with_content("content".to_string())
        .add_tag("testing".to_string())
        .build()
        .unwrap();

        marketplace.publish_workflow(package1).unwrap();
        marketplace.publish_workflow(package2).unwrap();

        // Search by tag
        let query = SearchQuery::new().with_tags(vec!["automation".to_string()]);
        let results = marketplace.search_workflows(query).unwrap();
        assert_eq!(results.len(), 1);
        assert_eq!(results[0].name, "Workflow 1");
    }

    #[test]
    fn test_search_by_author() {
        let mut marketplace = InMemoryWorkflowMarketplace::new();

        let package1 = WorkflowPackageBuilder::new(
            "Workflow 1".to_string(),
            "1.0.0".to_string(),
            "alice".to_string(),
        )
        .with_content("content".to_string())
        .build()
        .unwrap();

        let package2 = WorkflowPackageBuilder::new(
            "Workflow 2".to_string(),
            "1.0.0".to_string(),
            "bob".to_string(),
        )
        .with_content("content".to_string())
        .build()
        .unwrap();

        marketplace.publish_workflow(package1).unwrap();
        marketplace.publish_workflow(package2).unwrap();

        // Search by author
        let query = SearchQuery::new().with_author("alice".to_string());
        let results = marketplace.search_workflows(query).unwrap();
        assert_eq!(results.len(), 1);
        assert_eq!(results[0].author, "alice");
    }

    #[test]
    fn test_search_by_min_rating() {
        let mut marketplace = InMemoryWorkflowMarketplace::new();

        let package1 = create_test_package("workflow1", "1.0.0");
        let package2 = create_test_package("workflow2", "1.0.0");

        let pkg1_id = marketplace.publish_workflow(package1).unwrap();
        let pkg2_id = marketplace.publish_workflow(package2).unwrap();

        // Rate packages
        marketplace
            .rate_workflow(&pkg1_id, Rating::new("user1".to_string(), 5.0).unwrap())
            .unwrap();
        marketplace
            .rate_workflow(&pkg2_id, Rating::new("user1".to_string(), 3.0).unwrap())
            .unwrap();

        // Search with min rating
        let query = SearchQuery::new().with_min_rating(4.0);
        let results = marketplace.search_workflows(query).unwrap();
        assert_eq!(results.len(), 1);
    }

    #[test]
    fn test_install_workflow_simple() {
        let mut marketplace = InMemoryWorkflowMarketplace::new();
        let package = create_test_package("test_workflow", "1.0.0");
        let package_id = marketplace.publish_workflow(package).unwrap();

        let result = marketplace.install_workflow(&package_id, "1.0.0");
        assert!(result.is_ok());
        assert!(marketplace.installed.contains_key(&package_id));
    }

    #[test]
    fn test_install_with_dependencies() {
        let mut marketplace = InMemoryWorkflowMarketplace::new();

        // Create dependency
        let dep_package = create_test_package("dependency", "1.0.0");
        let dep_id = marketplace.publish_workflow(dep_package).unwrap();

        // Create main package with dependency
        let main_package = WorkflowPackageBuilder::new(
            "main_workflow".to_string(),
            "1.0.0".to_string(),
            "author".to_string(),
        )
        .with_content("content".to_string())
        .add_dependency(Dependency::new(dep_id.clone(), "1.0.0".to_string()))
        .build()
        .unwrap();

        let main_id = marketplace.publish_workflow(main_package).unwrap();

        // Install main package
        let result = marketplace.install_workflow(&main_id, "1.0.0");
        assert!(result.is_ok());

        // Both packages should be installed
        assert!(marketplace.installed.contains_key(&main_id));
        assert!(marketplace.installed.contains_key(&dep_id));
    }

    #[test]
    fn test_circular_dependency_detection() {
        let mut marketplace = InMemoryWorkflowMarketplace::new();

        // Create package A
        let pkg_a_id = PackageId::new("package_a".to_string()).unwrap();
        let pkg_b_id = PackageId::new("package_b".to_string()).unwrap();

        // Package A depends on B
        let package_a = WorkflowPackageBuilder::new(
            "Package A".to_string(),
            "1.0.0".to_string(),
            "author".to_string(),
        )
        .with_package_id(pkg_a_id.clone())
        .with_content("content".to_string())
        .add_dependency(Dependency::new(pkg_b_id.clone(), "1.0.0".to_string()))
        .build()
        .unwrap();

        // Package B depends on A (circular)
        let package_b = WorkflowPackageBuilder::new(
            "Package B".to_string(),
            "1.0.0".to_string(),
            "author".to_string(),
        )
        .with_package_id(pkg_b_id.clone())
        .with_content("content".to_string())
        .add_dependency(Dependency::new(pkg_a_id.clone(), "1.0.0".to_string()))
        .build()
        .unwrap();

        marketplace.publish_workflow(package_a).unwrap();
        marketplace.publish_workflow(package_b).unwrap();

        // Installing should detect circular dependency
        let result = marketplace.install_workflow(&pkg_a_id, "1.0.0");
        assert!(result.is_err());
    }

    #[test]
    fn test_version_matching() {
        let marketplace = InMemoryWorkflowMarketplace::new();

        // Exact match
        assert!(marketplace.version_matches("1.0.0", "1.0.0"));
        assert!(!marketplace.version_matches("1.0.1", "1.0.0"));

        // Wildcard
        assert!(marketplace.version_matches("1.0.0", "*"));
        assert!(marketplace.version_matches("2.5.3", "*"));

        // Caret (compatible)
        assert!(marketplace.version_matches("1.0.0", "^1.0"));
        assert!(marketplace.version_matches("1.0.5", "^1.0"));
        assert!(!marketplace.version_matches("2.0.0", "^1.0"));

        // Tilde (approximately)
        assert!(marketplace.version_matches("1.0.0", "~1.0"));
        assert!(marketplace.version_matches("1.0.5", "~1.0"));
    }

    #[test]
    fn test_rate_workflow() {
        let mut marketplace = InMemoryWorkflowMarketplace::new();
        let package = create_test_package("test_workflow", "1.0.0");
        let package_id = marketplace.publish_workflow(package).unwrap();

        // Add rating
        let rating = Rating::new("user1".to_string(), 4.5).unwrap();
        let result = marketplace.rate_workflow(&package_id, rating);
        assert!(result.is_ok());

        // Get aggregate rating
        let aggregate = marketplace.get_aggregate_rating(&package_id).unwrap();
        assert_eq!(aggregate.total_ratings, 1);
        assert!((aggregate.average_score - 4.5).abs() < 0.01);
    }

    #[test]
    fn test_rate_workflow_multiple_users() {
        let mut marketplace = InMemoryWorkflowMarketplace::new();
        let package = create_test_package("test_workflow", "1.0.0");
        let package_id = marketplace.publish_workflow(package).unwrap();

        // Add multiple ratings
        marketplace
            .rate_workflow(&package_id, Rating::new("user1".to_string(), 5.0).unwrap())
            .unwrap();
        marketplace
            .rate_workflow(&package_id, Rating::new("user2".to_string(), 4.0).unwrap())
            .unwrap();
        marketplace
            .rate_workflow(&package_id, Rating::new("user3".to_string(), 3.0).unwrap())
            .unwrap();

        let aggregate = marketplace.get_aggregate_rating(&package_id).unwrap();
        assert_eq!(aggregate.total_ratings, 3);
        assert!((aggregate.average_score - 4.0).abs() < 0.01);
    }

    #[test]
    fn test_rate_workflow_update_rating() {
        let mut marketplace = InMemoryWorkflowMarketplace::new();
        let package = create_test_package("test_workflow", "1.0.0");
        let package_id = marketplace.publish_workflow(package).unwrap();

        // Add initial rating
        marketplace
            .rate_workflow(&package_id, Rating::new("user1".to_string(), 3.0).unwrap())
            .unwrap();

        // Update rating from same user
        marketplace
            .rate_workflow(&package_id, Rating::new("user1".to_string(), 5.0).unwrap())
            .unwrap();

        let aggregate = marketplace.get_aggregate_rating(&package_id).unwrap();
        assert_eq!(aggregate.total_ratings, 1);
        assert!((aggregate.average_score - 5.0).abs() < 0.01);
    }

    #[test]
    fn test_aggregate_rating_distribution() {
        let mut marketplace = InMemoryWorkflowMarketplace::new();
        let package = create_test_package("test_workflow", "1.0.0");
        let package_id = marketplace.publish_workflow(package).unwrap();

        // Add ratings with different scores
        marketplace
            .rate_workflow(&package_id, Rating::new("user1".to_string(), 5.0).unwrap())
            .unwrap();
        marketplace
            .rate_workflow(&package_id, Rating::new("user2".to_string(), 5.0).unwrap())
            .unwrap();
        marketplace
            .rate_workflow(&package_id, Rating::new("user3".to_string(), 4.0).unwrap())
            .unwrap();
        marketplace
            .rate_workflow(&package_id, Rating::new("user4".to_string(), 3.0).unwrap())
            .unwrap();

        let aggregate = marketplace.get_aggregate_rating(&package_id).unwrap();
        assert_eq!(aggregate.rating_distribution.get(&5), Some(&2));
        assert_eq!(aggregate.rating_distribution.get(&4), Some(&1));
        assert_eq!(aggregate.rating_distribution.get(&3), Some(&1));
    }

    #[test]
    fn test_get_workflow() {
        let mut marketplace = InMemoryWorkflowMarketplace::new();
        let package = create_test_package("test_workflow", "1.0.0");
        let package_id = marketplace.publish_workflow(package.clone()).unwrap();

        let retrieved = marketplace.get_workflow(&package_id, "1.0.0").unwrap();
        assert_eq!(retrieved.name, package.name);
        assert_eq!(retrieved.version, package.version);
    }

    #[test]
    fn test_workflow_package_builder() {
        let package = WorkflowPackageBuilder::new(
            "Test Workflow".to_string(),
            "1.0.0".to_string(),
            "test_author".to_string(),
        )
        .with_description("A test workflow".to_string())
        .with_content("workflow content".to_string())
        .add_tag("test".to_string())
        .add_tag("automation".to_string())
        .with_license("Apache-2.0".to_string())
        .build()
        .unwrap();

        assert_eq!(package.name, "Test Workflow");
        assert_eq!(package.version, "1.0.0");
        assert_eq!(package.author, "test_author");
        assert_eq!(package.tags.len(), 2);
        assert_eq!(package.license, "Apache-2.0");
    }
}

// ============================================================================
// Integration Tests
// ============================================================================

#[cfg(test)]
mod integration_tests {
    use super::*;
    use super::tests::create_test_package;

    #[test]
    fn test_complete_marketplace_workflow() {
        let mut marketplace = InMemoryWorkflowMarketplace::new();

        // Publish multiple workflow packages
        let package1 = WorkflowPackageBuilder::new(
            "Data Pipeline".to_string(),
            "1.0.0".to_string(),
            "alice".to_string(),
        )
        .with_description("ETL data pipeline workflow".to_string())
        .with_content("pipeline workflow content".to_string())
        .add_tag("data".to_string())
        .add_tag("etl".to_string())
        .build()
        .unwrap();

        let package2 = WorkflowPackageBuilder::new(
            "API Testing".to_string(),
            "2.0.0".to_string(),
            "bob".to_string(),
        )
        .with_description("Automated API testing workflow".to_string())
        .with_content("testing workflow content".to_string())
        .add_tag("testing".to_string())
        .add_tag("api".to_string())
        .build()
        .unwrap();

        let pkg1_id = marketplace.publish_workflow(package1).unwrap();
        let pkg2_id = marketplace.publish_workflow(package2).unwrap();

        // Add ratings
        marketplace
            .rate_workflow(
                &pkg1_id,
                Rating::new("user1".to_string(), 5.0)
                    .unwrap()
                    .with_review("Excellent workflow!".to_string()),
            )
            .unwrap();

        marketplace
            .rate_workflow(&pkg1_id, Rating::new("user2".to_string(), 4.0).unwrap())
            .unwrap();

        marketplace
            .rate_workflow(&pkg2_id, Rating::new("user1".to_string(), 3.0).unwrap())
            .unwrap();

        // Search by tag
        let query = SearchQuery::new().with_tags(vec!["data".to_string()]);
        let results = marketplace.search_workflows(query).unwrap();
        assert_eq!(results.len(), 1);
        assert_eq!(results[0].name, "Data Pipeline");

        // Search with min rating
        let query = SearchQuery::new().with_min_rating(4.0);
        let results = marketplace.search_workflows(query).unwrap();
        assert_eq!(results.len(), 1);
        assert_eq!(results[0].name, "Data Pipeline");

        // Install workflow
        marketplace.install_workflow(&pkg1_id, "1.0.0").unwrap();
        assert!(marketplace.installed.contains_key(&pkg1_id));

        // Get aggregate rating
        let aggregate = marketplace.get_aggregate_rating(&pkg1_id).unwrap();
        assert_eq!(aggregate.total_ratings, 2);
        assert!((aggregate.average_score - 4.5).abs() < 0.01);
    }

    #[test]
    fn test_dependency_chain_installation() {
        let mut marketplace = InMemoryWorkflowMarketplace::new();

        // Create a chain: A -> B -> C
        let pkg_c = WorkflowPackageBuilder::new(
            "Package C".to_string(),
            "1.0.0".to_string(),
            "author".to_string(),
        )
        .with_content("content C".to_string())
        .build()
        .unwrap();

        let pkg_c_id = marketplace.publish_workflow(pkg_c).unwrap();

        let pkg_b = WorkflowPackageBuilder::new(
            "Package B".to_string(),
            "1.0.0".to_string(),
            "author".to_string(),
        )
        .with_content("content B".to_string())
        .add_dependency(Dependency::new(pkg_c_id.clone(), "1.0.0".to_string()))
        .build()
        .unwrap();

        let pkg_b_id = marketplace.publish_workflow(pkg_b).unwrap();

        let pkg_a = WorkflowPackageBuilder::new(
            "Package A".to_string(),
            "1.0.0".to_string(),
            "author".to_string(),
        )
        .with_content("content A".to_string())
        .add_dependency(Dependency::new(pkg_b_id.clone(), "1.0.0".to_string()))
        .build()
        .unwrap();

        let pkg_a_id = marketplace.publish_workflow(pkg_a).unwrap();

        // Install A should install B and C as well
        marketplace.install_workflow(&pkg_a_id, "1.0.0").unwrap();

        assert!(marketplace.installed.contains_key(&pkg_a_id));
        assert!(marketplace.installed.contains_key(&pkg_b_id));
        assert!(marketplace.installed.contains_key(&pkg_c_id));
    }

    #[test]
    fn test_semantic_versioning_compatibility() {
        let mut marketplace = InMemoryWorkflowMarketplace::new();

        // Publish multiple versions
        let v1 = create_test_package("my_workflow", "1.0.0");
        let v2 = create_test_package("my_workflow", "1.1.0");
        let v3 = create_test_package("my_workflow", "2.0.0");

        let pkg_id = marketplace.publish_workflow(v1).unwrap();
        marketplace.publish_workflow(v2).unwrap();
        marketplace.publish_workflow(v3).unwrap();

        // Create package with caret dependency (^1.0)
        let dependent = WorkflowPackageBuilder::new(
            "dependent".to_string(),
            "1.0.0".to_string(),
            "author".to_string(),
        )
        .with_content("content".to_string())
        .add_dependency(Dependency::new(pkg_id.clone(), "^1.0".to_string()))
        .build()
        .unwrap();

        let dep_id = marketplace.publish_workflow(dependent).unwrap();

        // Should install compatible version (1.1.0, not 2.0.0)
        marketplace.install_workflow(&dep_id, "1.0.0").unwrap();
        assert!(marketplace.installed.contains_key(&pkg_id));
    }

    #[test]
    fn test_search_ranking_by_rating() {
        let mut marketplace = InMemoryWorkflowMarketplace::new();

        // Create packages with different ratings
        let pkg1 = create_test_package("workflow1", "1.0.0");
        let pkg2 = create_test_package("workflow2", "1.0.0");
        let pkg3 = create_test_package("workflow3", "1.0.0");

        let id1 = marketplace.publish_workflow(pkg1).unwrap();
        let id2 = marketplace.publish_workflow(pkg2).unwrap();
        let id3 = marketplace.publish_workflow(pkg3).unwrap();

        // Rate packages
        marketplace
            .rate_workflow(&id1, Rating::new("user".to_string(), 3.0).unwrap())
            .unwrap();
        marketplace
            .rate_workflow(&id2, Rating::new("user".to_string(), 5.0).unwrap())
            .unwrap();
        marketplace
            .rate_workflow(&id3, Rating::new("user".to_string(), 4.0).unwrap())
            .unwrap();

        // Search should return results sorted by rating
        let results = marketplace.search_workflows(SearchQuery::new()).unwrap();
        assert_eq!(results.len(), 3);

        // Verify order (highest rating first)
        let ratings: Vec<f64> = results
            .iter()
            .map(|p| {
                marketplace
                    .get_aggregate_rating(&p.package_id)
                    .unwrap()
                    .average_score
            })
            .collect();

        assert!(ratings[0] >= ratings[1]);
        assert!(ratings[1] >= ratings[2]);
    }
}
