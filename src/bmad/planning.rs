//! BMAD Planning Module
//!
//! Provides agile planning capabilities for BMAD-METHOD integration.

use super::{BmadAgent, ScaleLevel};
use serde::{Deserialize, Serialize};

/// User story definition
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserStory {
    pub id: String,
    pub title: String,
    pub description: String,
    pub acceptance_criteria: Vec<String>,
    pub priority: Priority,
    pub estimate: Option<Estimate>,
    pub status: StoryStatus,
    pub assignee: Option<BmadAgent>,
}

impl UserStory {
    pub fn new(title: String, description: String) -> Self {
        Self {
            id: simple_id(),
            title,
            description,
            acceptance_criteria: Vec::new(),
            priority: Priority::Medium,
            estimate: None,
            status: StoryStatus::Backlog,
            assignee: None,
        }
    }

    pub fn with_priority(mut self, priority: Priority) -> Self {
        self.priority = priority;
        self
    }

    pub fn with_estimate(mut self, estimate: Estimate) -> Self {
        self.estimate = Some(estimate);
        self
    }
}

/// Priority levels
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq, PartialOrd, Ord)]
#[serde(rename_all = "lowercase")]
pub enum Priority {
    Critical,
    High,
    Medium,
    Low,
}

/// Story point estimate
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum Estimate {
    /// 1 point - Very small task
    XS,
    /// 2 points - Small task
    S,
    /// 3 points - Medium task
    M,
    /// 5 points - Large task
    L,
    /// 8 points - Very large task
    XL,
    /// 13 points - Huge task
    XXL,
}

impl Estimate {
    pub fn points(&self) -> u8 {
        match self {
            Estimate::XS => 1,
            Estimate::S => 2,
            Estimate::M => 3,
            Estimate::L => 5,
            Estimate::XL => 8,
            Estimate::XXL => 13,
        }
    }
}

/// Story status
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum StoryStatus {
    Backlog,
    ToDo,
    InProgress,
    InReview,
    Done,
    Blocked,
}

/// Sprint definition
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Sprint {
    pub id: String,
    pub name: String,
    pub goal: String,
    pub stories: Vec<UserStory>,
    pub capacity: u32,
    pub velocity: Option<u32>,
    pub status: SprintStatus,
}

impl Sprint {
    pub fn new(name: String, goal: String, capacity: u32) -> Self {
        Self {
            id: simple_id(),
            name,
            goal,
            stories: Vec::new(),
            capacity,
            velocity: None,
            status: SprintStatus::Planning,
        }
    }

    pub fn add_story(&mut self, story: UserStory) {
        self.stories.push(story);
    }

    pub fn total_points(&self) -> u32 {
        self.stories
            .iter()
            .filter(|s| s.status != StoryStatus::Done)
            .filter_map(|s| s.estimate.map(|e| e.points() as u32))
            .sum()
    }

    pub fn is_at_capacity(&self) -> bool {
        self.total_points() <= self.capacity
    }
}

/// Sprint status
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum SprintStatus {
    Planning,
    Active,
    Completed,
}

/// Product backlog
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProductBacklog {
    pub name: String,
    pub stories: Vec<UserStory>,
    pub scale_level: ScaleLevel,
}

impl ProductBacklog {
    pub fn new(name: String) -> Self {
        Self {
            name,
            stories: Vec::new(),
            scale_level: ScaleLevel::Medium,
        }
    }

    pub fn add_story(&mut self, story: UserStory) {
        self.stories.push(story);
        self.sort_by_priority();
    }

    pub fn sort_by_priority(&mut self) {
        self.stories.sort_by(|a, b| b.priority.cmp(&a.priority));
    }

    pub fn top_n(&self, n: usize) -> Vec<&UserStory> {
        self.stories.iter().take(n).collect()
    }
}

/// Sprint planning service
pub struct SprintPlanner;

impl SprintPlanner {
    /// Create a sprint from backlog based on capacity
    pub fn plan_sprint(backlog: &ProductBacklog, capacity: u32, goal: &str) -> Sprint {
        let mut sprint = Sprint::new(
            format!("Sprint {}", simple_id()[..8].to_string()),
            goal.to_string(),
            capacity,
        );

        let mut remaining_capacity = capacity;

        for story in &backlog.stories {
            if story.status != StoryStatus::Backlog {
                continue;
            }

            if let Some(estimate) = story.estimate {
                let points = estimate.points() as u32;
                if points <= remaining_capacity {
                    let mut story_clone = story.clone();
                    story_clone.status = StoryStatus::ToDo;
                    sprint.add_story(story_clone);
                    remaining_capacity -= points;
                }
            }
        }

        sprint
    }

    /// Calculate team velocity from completed sprints
    pub fn calculate_velocity(sprints: &[Sprint]) -> u32 {
        let completed: Vec<_> = sprints
            .iter()
            .filter(|s| s.status == SprintStatus::Completed)
            .collect();

        if completed.is_empty() {
            return 0;
        }

        let total: u32 = completed.iter().map(|s| s.total_points()).sum();
        total / completed.len() as u32
    }
}

/// Simple ID generation
fn simple_id() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    let duration = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap();
    format!("{:x}{:x}", duration.as_secs(), duration.subsec_nanos())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_user_story() {
        let story = UserStory::new(
            "Login".to_string(),
            "As a user, I want to login".to_string(),
        )
        .with_priority(Priority::High)
        .with_estimate(Estimate::M);

        assert_eq!(story.priority, Priority::High);
        assert_eq!(story.estimate.unwrap().points(), 3);
    }

    #[test]
    fn test_sprint_planning() {
        let mut backlog = ProductBacklog::new("Product".to_string());
        backlog.add_story(
            UserStory::new("Story 1".to_string(), "Desc 1".to_string())
                .with_priority(Priority::High)
                .with_estimate(Estimate::L),
        );
        backlog.add_story(
            UserStory::new("Story 2".to_string(), "Desc 2".to_string())
                .with_priority(Priority::Low)
                .with_estimate(Estimate::S),
        );

        let sprint = SprintPlanner::plan_sprint(&backlog, 10, "Sprint Goal");
        assert!(!sprint.stories.is_empty());
    }
}
