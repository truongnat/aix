// Agent Specialization Marketplace (Tier 2.3)
//
// Enables discovery and composition of specialized agents with search,
// performance tracking, ratings, and versioning.
//
// Requirements: 6.1-6.6

use crate::platform::types::{current_timestamp_ms, AgentId, TrustTier};
use crate::platform::{PlatformError, Result};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Agent marketplace for discovering and composing specialized agent teams
pub trait AgentMarketplaceTrait {
    /// Register a new agent in the marketplace
    fn register_agent(&mut self, agent: AgentProfile) -> Result<AgentId>;

    /// Search for agents matching criteria
    fn search_agents(&self, criteria: &SearchCriteria) -> Result<Vec<AgentProfile>>;

    /// Compose an optimal team for a task
    fn compose_team(&self, task: &Task) -> Result<Vec<AgentId>>;

    /// Rate an agent after execution
    fn rate_agent(&mut self, agent_id: &AgentId, rating: Rating) -> Result<()>;

    /// Update agent performance metrics
    fn update_performance(&mut self, agent_id: &AgentId, metrics: PerformanceUpdate) -> Result<()>;

    /// Get agent profile by ID
    fn get_agent(&self, agent_id: &AgentId) -> Result<AgentProfile>;
}

/// Agent profile with specialization, capabilities, and metrics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentProfile {
    pub agent_id: AgentId,
    pub name: String,
    pub version: String,
    pub specialization: Vec<String>,
    pub capabilities: Vec<Capability>,
    pub trust_tier: TrustTier,
    pub performance_metrics: PerformanceMetrics,
    pub pricing: PricingModel,
    pub description: String,
    pub author: String,
    pub created_at: u64,
    pub updated_at: u64,
}

/// Agent capability definition
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct Capability {
    pub name: String,
    pub description: String,
    pub proficiency: ProficiencyLevel,
}

/// Proficiency level for capabilities
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
pub enum ProficiencyLevel {
    Beginner,
    Intermediate,
    Advanced,
    Expert,
}

/// Performance metrics for an agent
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceMetrics {
    pub success_rate: f64,
    pub avg_duration_ms: u64,
    pub total_executions: u64,
    pub user_rating: f64,
    pub rating_count: u64,
    pub last_execution: Option<u64>,
}

impl Default for PerformanceMetrics {
    fn default() -> Self {
        Self {
            success_rate: 0.0,
            avg_duration_ms: 0,
            total_executions: 0,
            user_rating: 0.0,
            rating_count: 0,
            last_execution: None,
        }
    }
}

/// Pricing model for agent usage
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PricingModel {
    Free,
    PerExecution { cost: f64 },
    PerMinute { cost: f64 },
    Subscription { monthly_cost: f64 },
}

/// Search criteria for finding agents
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchCriteria {
    pub required_skills: Vec<String>,
    pub min_rating: Option<f64>,
    pub max_cost: Option<f64>,
    pub trust_tier: Option<TrustTier>,
    pub min_proficiency: Option<ProficiencyLevel>,
    pub version_constraint: Option<VersionConstraint>,
}

/// Version constraint for agent selection
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum VersionConstraint {
    Exact(String),
    MinVersion(String),
    Range { min: String, max: String },
}

/// Task definition for team composition
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Task {
    pub task_id: String,
    pub description: String,
    pub required_capabilities: Vec<String>,
    pub preferred_trust_tier: TrustTier,
    pub budget: Option<f64>,
    pub deadline_ms: Option<u64>,
}

/// User rating for an agent
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Rating {
    pub user_id: String,
    pub score: f64,
    pub review: Option<String>,
    pub timestamp_ms: u64,
}

impl Rating {
    pub fn new(user_id: String, score: f64, review: Option<String>) -> Result<Self> {
        if !(1.0..=5.0).contains(&score) {
            return Err(PlatformError::InvalidInput(
                "Rating score must be between 1.0 and 5.0".to_string(),
            ));
        }

        Ok(Self {
            user_id,
            score,
            review,
            timestamp_ms: current_timestamp_ms(),
        })
    }
}

/// Performance update after execution
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceUpdate {
    pub success: bool,
    pub duration_ms: u64,
    pub timestamp_ms: u64,
}

/// In-memory agent marketplace implementation
pub struct AgentMarketplace {
    agents: HashMap<AgentId, AgentProfile>,
    ratings: HashMap<AgentId, Vec<Rating>>,
    search_index: SearchIndex,
}

/// Search index for efficient agent discovery
#[derive(Debug, Clone)]
struct SearchIndex {
    by_skill: HashMap<String, Vec<AgentId>>,
    by_trust_tier: HashMap<TrustTier, Vec<AgentId>>,
}

impl SearchIndex {
    fn new() -> Self {
        Self {
            by_skill: HashMap::new(),
            by_trust_tier: HashMap::new(),
        }
    }

    fn index_agent(&mut self, agent: &AgentProfile) {
        // Index by skills
        for skill in &agent.specialization {
            self.by_skill
                .entry(skill.clone())
                .or_default()
                .push(agent.agent_id.clone());
        }

        for capability in &agent.capabilities {
            self.by_skill
                .entry(capability.name.clone())
                .or_default()
                .push(agent.agent_id.clone());
        }

        // Index by trust tier
        self.by_trust_tier
            .entry(agent.trust_tier)
            .or_default()
            .push(agent.agent_id.clone());
    }

    fn remove_agent(&mut self, agent: &AgentProfile) {
        // Remove from skill index
        for skill in &agent.specialization {
            if let Some(agents) = self.by_skill.get_mut(skill) {
                agents.retain(|id| id != &agent.agent_id);
            }
        }

        for capability in &agent.capabilities {
            if let Some(agents) = self.by_skill.get_mut(&capability.name) {
                agents.retain(|id| id != &agent.agent_id);
            }
        }

        // Remove from trust tier index
        if let Some(agents) = self.by_trust_tier.get_mut(&agent.trust_tier) {
            agents.retain(|id| id != &agent.agent_id);
        }
    }
}

impl AgentMarketplace {
    pub fn new() -> Self {
        Self {
            agents: HashMap::new(),
            ratings: HashMap::new(),
            search_index: SearchIndex::new(),
        }
    }
}

impl Default for AgentMarketplace {
    fn default() -> Self {
        Self::new()
    }
}

impl AgentMarketplaceTrait for AgentMarketplace {
    fn register_agent(&mut self, agent: AgentProfile) -> Result<AgentId> {
        // Validate agent profile
        if agent.agent_id.is_empty() {
            return Err(PlatformError::InvalidInput(
                "Agent ID cannot be empty".to_string(),
            ));
        }

        if agent.name.is_empty() {
            return Err(PlatformError::InvalidInput(
                "Agent name cannot be empty".to_string(),
            ));
        }

        if agent.version.is_empty() {
            return Err(PlatformError::InvalidInput(
                "Agent version cannot be empty".to_string(),
            ));
        }

        // Check if agent already exists
        if self.agents.contains_key(&agent.agent_id) {
            return Err(PlatformError::InvalidInput(format!(
                "Agent {} already registered",
                agent.agent_id
            )));
        }

        let agent_id = agent.agent_id.clone();

        // Index agent for search
        self.search_index.index_agent(&agent);

        // Store agent profile
        self.agents.insert(agent_id.clone(), agent);

        Ok(agent_id)
    }

    fn search_agents(&self, criteria: &SearchCriteria) -> Result<Vec<AgentProfile>> {
        let mut candidates: Vec<&AgentProfile> = self.agents.values().collect();

        // Filter by required skills
        if !criteria.required_skills.is_empty() {
            candidates.retain(|agent| {
                criteria.required_skills.iter().all(|required_skill| {
                    agent.specialization.contains(required_skill)
                        || agent
                            .capabilities
                            .iter()
                            .any(|cap| &cap.name == required_skill)
                })
            });
        }

        // Filter by minimum rating
        if let Some(min_rating) = criteria.min_rating {
            candidates.retain(|agent| agent.performance_metrics.user_rating >= min_rating);
        }

        // Filter by maximum cost
        if let Some(max_cost) = criteria.max_cost {
            candidates.retain(|agent| match &agent.pricing {
                PricingModel::Free => true,
                PricingModel::PerExecution { cost } => *cost <= max_cost,
                PricingModel::PerMinute { cost } => *cost <= max_cost,
                PricingModel::Subscription { monthly_cost } => *monthly_cost <= max_cost,
            });
        }

        // Filter by trust tier
        if let Some(trust_tier) = criteria.trust_tier {
            candidates.retain(|agent| agent.trust_tier >= trust_tier);
        }

        // Filter by minimum proficiency
        if let Some(min_proficiency) = criteria.min_proficiency {
            candidates.retain(|agent| {
                agent
                    .capabilities
                    .iter()
                    .any(|cap| cap.proficiency >= min_proficiency)
            });
        }

        // Filter by version constraint
        if let Some(ref version_constraint) = criteria.version_constraint {
            candidates
                .retain(|agent| matches_version_constraint(&agent.version, version_constraint));
        }

        // Sort by rating (descending) and success rate
        candidates.sort_by(|a, b| {
            b.performance_metrics
                .user_rating
                .partial_cmp(&a.performance_metrics.user_rating)
                .unwrap()
                .then_with(|| {
                    b.performance_metrics
                        .success_rate
                        .partial_cmp(&a.performance_metrics.success_rate)
                        .unwrap()
                })
        });

        Ok(candidates.into_iter().cloned().collect())
    }

    fn compose_team(&self, task: &Task) -> Result<Vec<AgentId>> {
        // Get all agents matching trust tier and budget constraints
        let criteria = SearchCriteria {
            required_skills: vec![], // Don't filter by skills - we'll compose manually
            min_rating: None,
            max_cost: task.budget,
            trust_tier: Some(task.preferred_trust_tier),
            min_proficiency: Some(ProficiencyLevel::Intermediate),
            version_constraint: None,
        };

        let mut candidates = self.search_agents(&criteria)?;

        if candidates.is_empty() {
            return Err(PlatformError::NotFound(
                "No agents found matching task requirements".to_string(),
            ));
        }

        // Sort by rating (prefer rated agents) and success rate
        candidates.sort_by(|a, b| {
            // Prefer agents with ratings, then by rating value
            let a_has_rating = a.performance_metrics.rating_count > 0;
            let b_has_rating = b.performance_metrics.rating_count > 0;

            match (a_has_rating, b_has_rating) {
                (true, false) => std::cmp::Ordering::Less,
                (false, true) => std::cmp::Ordering::Greater,
                _ => b
                    .performance_metrics
                    .user_rating
                    .partial_cmp(&a.performance_metrics.user_rating)
                    .unwrap()
                    .then_with(|| {
                        b.performance_metrics
                            .success_rate
                            .partial_cmp(&a.performance_metrics.success_rate)
                            .unwrap()
                    }),
            }
        });

        // Compose team by selecting agents that collectively satisfy requirements
        let mut team = Vec::new();
        let mut covered_capabilities: Vec<String> = Vec::new();
        let mut total_cost = 0.0;

        for agent in candidates {
            // Check if agent adds new capabilities
            let new_capabilities: Vec<_> = agent
                .capabilities
                .iter()
                .filter(|cap| {
                    task.required_capabilities.contains(&cap.name)
                        && !covered_capabilities.contains(&cap.name)
                })
                .collect();

            if new_capabilities.is_empty() {
                continue; // Agent doesn't add value
            }

            // Check budget constraint
            if let Some(budget) = task.budget {
                let agent_cost = estimate_agent_cost(&agent.pricing);
                if total_cost + agent_cost > budget {
                    continue; // Would exceed budget
                }
                total_cost += agent_cost;
            }

            // Add agent to team
            team.push(agent.agent_id.clone());

            // Mark capabilities as covered
            for cap in new_capabilities {
                covered_capabilities.push(cap.name.clone());
            }

            // Check if all requirements are satisfied
            if task
                .required_capabilities
                .iter()
                .all(|req| covered_capabilities.contains(req))
            {
                break; // Team is complete
            }
        }

        // Verify all requirements are covered
        if !task
            .required_capabilities
            .iter()
            .all(|req| covered_capabilities.contains(req))
        {
            return Err(PlatformError::InvalidInput(
                "Unable to compose team that satisfies all requirements".to_string(),
            ));
        }

        Ok(team)
    }

    fn rate_agent(&mut self, agent_id: &AgentId, rating: Rating) -> Result<()> {
        // Verify agent exists
        let agent = self
            .agents
            .get_mut(agent_id)
            .ok_or_else(|| PlatformError::NotFound(format!("Agent {} not found", agent_id)))?;

        // Store rating
        self.ratings
            .entry(agent_id.clone())
            .or_default()
            .push(rating.clone());

        // Update aggregate rating
        let all_ratings = &self.ratings[agent_id];
        let total_score: f64 = all_ratings.iter().map(|r| r.score).sum();
        let count = all_ratings.len() as f64;

        agent.performance_metrics.user_rating = total_score / count;
        agent.performance_metrics.rating_count = all_ratings.len() as u64;
        agent.updated_at = current_timestamp_ms();

        Ok(())
    }

    fn update_performance(&mut self, agent_id: &AgentId, update: PerformanceUpdate) -> Result<()> {
        let agent = self
            .agents
            .get_mut(agent_id)
            .ok_or_else(|| PlatformError::NotFound(format!("Agent {} not found", agent_id)))?;

        let metrics = &mut agent.performance_metrics;

        // Update execution count
        let old_count = metrics.total_executions;
        let new_count = old_count + 1;
        metrics.total_executions = new_count;

        // Update success rate
        let old_successes = (metrics.success_rate * old_count as f64).round() as u64;
        let new_successes = if update.success {
            old_successes + 1
        } else {
            old_successes
        };
        metrics.success_rate = new_successes as f64 / new_count as f64;

        // Update average duration
        let old_total_duration = metrics.avg_duration_ms * old_count;
        let new_total_duration = old_total_duration + update.duration_ms;
        metrics.avg_duration_ms = new_total_duration / new_count;

        // Update last execution timestamp
        metrics.last_execution = Some(update.timestamp_ms);
        agent.updated_at = current_timestamp_ms();

        Ok(())
    }

    fn get_agent(&self, agent_id: &AgentId) -> Result<AgentProfile> {
        self.agents
            .get(agent_id)
            .cloned()
            .ok_or_else(|| PlatformError::NotFound(format!("Agent {} not found", agent_id)))
    }
}

/// Check if version matches constraint
fn matches_version_constraint(version: &str, constraint: &VersionConstraint) -> bool {
    match constraint {
        VersionConstraint::Exact(required) => version == required.as_str(),
        VersionConstraint::MinVersion(min) => version >= min.as_str(),
        VersionConstraint::Range { min, max } => version >= min.as_str() && version <= max.as_str(),
    }
}

/// Estimate cost for an agent based on pricing model
fn estimate_agent_cost(pricing: &PricingModel) -> f64 {
    match pricing {
        PricingModel::Free => 0.0,
        PricingModel::PerExecution { cost } => *cost,
        PricingModel::PerMinute { cost } => cost * 10.0, // Assume 10 minutes average
        PricingModel::Subscription { monthly_cost } => monthly_cost / 100.0, // Amortize
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn create_test_agent(id: &str, skills: Vec<&str>, rating: f64) -> AgentProfile {
        AgentProfile {
            agent_id: id.to_string(),
            name: format!("Agent {}", id),
            version: "1.0.0".to_string(),
            specialization: skills.iter().map(|s| s.to_string()).collect(),
            capabilities: skills
                .iter()
                .map(|s| Capability {
                    name: s.to_string(),
                    description: format!("{} capability", s),
                    proficiency: ProficiencyLevel::Advanced,
                })
                .collect(),
            trust_tier: TrustTier::Verified,
            performance_metrics: PerformanceMetrics {
                success_rate: 0.95,
                avg_duration_ms: 1000,
                total_executions: 100,
                user_rating: rating,
                rating_count: 0, // Start with 0 ratings
                last_execution: Some(current_timestamp_ms()),
            },
            pricing: PricingModel::PerExecution { cost: 1.0 },
            description: "Test agent".to_string(),
            author: "test".to_string(),
            created_at: current_timestamp_ms(),
            updated_at: current_timestamp_ms(),
        }
    }

    #[test]
    fn test_register_agent() {
        let mut marketplace = AgentMarketplace::new();
        let agent = create_test_agent("agent1", vec!["rust", "testing"], 4.5);

        let result = marketplace.register_agent(agent.clone());
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), "agent1");

        // Duplicate registration should fail
        let result = marketplace.register_agent(agent);
        assert!(result.is_err());
    }

    #[test]
    fn test_search_agents_by_skills() {
        let mut marketplace = AgentMarketplace::new();

        marketplace
            .register_agent(create_test_agent("agent1", vec!["rust", "testing"], 4.5))
            .unwrap();
        marketplace
            .register_agent(create_test_agent("agent2", vec!["python", "ml"], 4.0))
            .unwrap();
        marketplace
            .register_agent(create_test_agent("agent3", vec!["rust", "ml"], 4.8))
            .unwrap();

        let criteria = SearchCriteria {
            required_skills: vec!["rust".to_string()],
            min_rating: None,
            max_cost: None,
            trust_tier: None,
            min_proficiency: None,
            version_constraint: None,
        };

        let results = marketplace.search_agents(&criteria).unwrap();
        assert_eq!(results.len(), 2);
        assert!(results.iter().any(|a| a.agent_id == "agent1"));
        assert!(results.iter().any(|a| a.agent_id == "agent3"));
    }

    #[test]
    fn test_search_agents_by_rating() {
        let mut marketplace = AgentMarketplace::new();

        marketplace
            .register_agent(create_test_agent("agent1", vec!["rust"], 4.5))
            .unwrap();
        marketplace
            .register_agent(create_test_agent("agent2", vec!["rust"], 3.5))
            .unwrap();
        marketplace
            .register_agent(create_test_agent("agent3", vec!["rust"], 4.8))
            .unwrap();

        let criteria = SearchCriteria {
            required_skills: vec!["rust".to_string()],
            min_rating: Some(4.0),
            max_cost: None,
            trust_tier: None,
            min_proficiency: None,
            version_constraint: None,
        };

        let results = marketplace.search_agents(&criteria).unwrap();
        assert_eq!(results.len(), 2);
        // Should be sorted by rating descending
        assert_eq!(results[0].agent_id, "agent3");
        assert_eq!(results[1].agent_id, "agent1");
    }

    #[test]
    fn test_compose_team() {
        let mut marketplace = AgentMarketplace::new();

        marketplace
            .register_agent(create_test_agent("agent1", vec!["rust", "backend"], 4.5))
            .unwrap();
        marketplace
            .register_agent(create_test_agent("agent2", vec!["frontend", "react"], 4.0))
            .unwrap();
        marketplace
            .register_agent(create_test_agent("agent3", vec!["database", "sql"], 4.8))
            .unwrap();

        let task = Task {
            task_id: "task1".to_string(),
            description: "Build full-stack app".to_string(),
            required_capabilities: vec![
                "rust".to_string(),
                "frontend".to_string(),
                "database".to_string(),
            ],
            preferred_trust_tier: TrustTier::Verified,
            budget: Some(10.0),
            deadline_ms: None,
        };

        let team = marketplace.compose_team(&task).unwrap();
        assert_eq!(team.len(), 3);
        assert!(team.contains(&"agent1".to_string()));
        assert!(team.contains(&"agent2".to_string()));
        assert!(team.contains(&"agent3".to_string()));
    }

    #[test]
    fn test_rate_agent() {
        let mut marketplace = AgentMarketplace::new();
        let agent = create_test_agent("agent1", vec!["rust"], 4.0);
        marketplace.register_agent(agent).unwrap();

        let rating = Rating::new("user1".to_string(), 5.0, Some("Excellent!".to_string())).unwrap();
        marketplace
            .rate_agent(&"agent1".to_string(), rating)
            .unwrap();

        let agent = marketplace.get_agent(&"agent1".to_string()).unwrap();
        assert_eq!(agent.performance_metrics.user_rating, 5.0); // First rating
        assert_eq!(agent.performance_metrics.rating_count, 1);
    }

    #[test]
    fn test_update_performance() {
        let mut marketplace = AgentMarketplace::new();
        let agent = create_test_agent("agent1", vec!["rust"], 4.0);
        marketplace.register_agent(agent).unwrap();

        let update = PerformanceUpdate {
            success: true,
            duration_ms: 2000,
            timestamp_ms: current_timestamp_ms(),
        };

        marketplace
            .update_performance(&"agent1".to_string(), update)
            .unwrap();

        let agent = marketplace.get_agent(&"agent1".to_string()).unwrap();
        assert_eq!(agent.performance_metrics.total_executions, 101);
        assert!(agent.performance_metrics.avg_duration_ms > 1000);
    }

    #[test]
    fn test_version_constraint() {
        assert!(matches_version_constraint(
            "1.0.0",
            &VersionConstraint::Exact("1.0.0".to_string())
        ));
        assert!(!matches_version_constraint(
            "1.0.1",
            &VersionConstraint::Exact("1.0.0".to_string())
        ));

        assert!(matches_version_constraint(
            "1.5.0",
            &VersionConstraint::MinVersion("1.0.0".to_string())
        ));
        assert!(!matches_version_constraint(
            "0.9.0",
            &VersionConstraint::MinVersion("1.0.0".to_string())
        ));

        assert!(matches_version_constraint(
            "1.5.0",
            &VersionConstraint::Range {
                min: "1.0.0".to_string(),
                max: "2.0.0".to_string()
            }
        ));
    }

    #[test]
    fn test_rating_validation() {
        assert!(Rating::new("user1".to_string(), 3.5, None).is_ok());
        assert!(Rating::new("user1".to_string(), 0.5, None).is_err());
        assert!(Rating::new("user1".to_string(), 6.0, None).is_err());
    }
}
