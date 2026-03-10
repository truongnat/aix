//! Task definitions for Office simulation

use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};

use super::roles::Role;

/// Task status
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum TaskStatus {
    /// Task is pending and not started
    Pending,
    /// Task is currently being worked on
    InProgress,
    /// Task completed successfully
    Completed,
    /// Task failed
    Failed,
    /// Task is paused
    Paused,
    /// Task is cancelled
    Cancelled,
}

/// Task priority
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum Priority {
    Low,
    Medium,
    High,
    Critical,
}

/// Office task representation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OfficeTask {
    pub id: String,
    pub title: String,
    pub description: String,
    pub assigned_role: Option<Role>,
    pub status: TaskStatus,
    pub priority: Priority,
    pub input: String,
    pub output: Option<String>,
    pub error: Option<String>,
    pub created_at_ms: u64,
    pub started_at_ms: Option<u64>,
    pub completed_at_ms: Option<u64>,
    pub depends_on: Vec<String>,
    pub confidence: Option<f32>,
}

impl OfficeTask {
    /// Create a new task
    pub fn new(id: String, title: String, description: String, input: String) -> Self {
        Self {
            id,
            title,
            description,
            assigned_role: None,
            status: TaskStatus::Pending,
            priority: Priority::Medium,
            input,
            output: None,
            error: None,
            created_at_ms: SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap()
                .as_millis() as u64,
            started_at_ms: None,
            completed_at_ms: None,
            depends_on: Vec::new(),
            confidence: None,
        }
    }

    /// Assign task to a role
    pub fn assign_to(mut self, role: Role) -> Self {
        self.assigned_role = Some(role);
        self
    }

    /// Set priority
    pub fn with_priority(mut self, priority: Priority) -> Self {
        self.priority = priority;
        self
    }

    /// Add dependency
    pub fn depends_on(mut self, task_id: String) -> Self {
        self.depends_on.push(task_id);
        self
    }

    /// Start the task
    pub fn start(&mut self) {
        self.status = TaskStatus::InProgress;
        self.started_at_ms = Some(
            SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap()
                .as_millis() as u64,
        );
    }

    /// Complete the task
    pub fn complete(&mut self, output: String) {
        self.status = TaskStatus::Completed;
        self.output = Some(output);
        self.completed_at_ms = Some(
            SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap()
                .as_millis() as u64,
        );
    }

    /// Fail the task
    pub fn fail(&mut self, error: String) {
        self.status = TaskStatus::Failed;
        self.error = Some(error);
        self.completed_at_ms = Some(
            SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap()
                .as_millis() as u64,
        );
    }

    /// Pause the task
    pub fn pause(&mut self) {
        self.status = TaskStatus::Paused;
    }

    /// Resume the task
    pub fn resume(&mut self) {
        self.status = TaskStatus::InProgress;
    }

    /// Cancel the task
    pub fn cancel(&mut self) {
        self.status = TaskStatus::Cancelled;
    }

    /// Get duration in milliseconds
    pub fn duration_ms(&self) -> Option<u64> {
        match (self.started_at_ms, self.completed_at_ms) {
            (Some(start), Some(end)) => Some(end - start),
            (Some(start), None) => {
                let now = SystemTime::now()
                    .duration_since(UNIX_EPOCH)
                    .unwrap()
                    .as_millis() as u64;
                Some(now - start)
            }
            _ => None,
        }
    }

    /// Check if task is ready to run (dependencies completed)
    pub fn is_ready(&self, completed_ids: &[String]) -> bool {
        if self.status != TaskStatus::Pending && self.status != TaskStatus::Paused {
            return false;
        }
        self.depends_on
            .iter()
            .all(|dep| completed_ids.contains(dep))
    }
}

impl TaskStatus {
    pub fn is_terminal(&self) -> bool {
        matches!(
            self,
            TaskStatus::Completed | TaskStatus::Failed | TaskStatus::Cancelled
        )
    }
}
