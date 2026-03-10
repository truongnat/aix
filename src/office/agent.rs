//! Office Agent - Representation of a role in the office

use serde::{Deserialize, Serialize};
use std::collections::VecDeque;

use super::roles::Role;

/// Message between agents
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentMessage {
    pub from: Role,
    pub to: Role,
    pub content: String,
    pub timestamp_ms: u64,
}

/// Agent state
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum AgentState {
    Idle,
    Working,
    Waiting,
    Blocked,
}

/// Office agent representing a role in the company
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OfficeAgent {
    pub role: Role,
    pub name: String,
    pub state: AgentState,
    pub current_task_id: Option<String>,
    pub task_queue: VecDeque<String>, // Task IDs
    pub completed_tasks: Vec<String>,
    pub failed_tasks: Vec<String>,
    pub messages: Vec<AgentMessage>,
    pub skills: Vec<String>,
}

impl OfficeAgent {
    /// Create a new agent with a role
    pub fn new(role: Role) -> Self {
        let name = match role {
            Role::CEO => "CEO Agent".to_string(),
            Role::CTO => "CTO Agent".to_string(),
            Role::PM => "PM Agent".to_string(),
            Role::Engineer => "Engineer Agent".to_string(),
            Role::Designer => "Designer Agent".to_string(),
            Role::QA => "QA Agent".to_string(),
        };

        Self {
            role,
            name,
            state: AgentState::Idle,
            current_task_id: None,
            task_queue: VecDeque::new(),
            completed_tasks: Vec::new(),
            failed_tasks: Vec::new(),
            messages: Vec::new(),
            skills: role.typical_skills().iter().map(|s| s.to_string()).collect(),
        }
    }

    /// Add a task to the queue
    pub fn assign_task(&mut self, task_id: String) {
        self.task_queue.push_back(task_id);
        if self.state == AgentState::Idle {
            self.state = AgentState::Waiting;
        }
    }

    /// Get next task ID without removing
    pub fn peek_next_task(&self) -> Option<&String> {
        self.task_queue.front()
    }

    /// Get and remove next task ID
    pub fn get_next_task(&mut self) -> Option<String> {
        if let Some(task_id) = self.task_queue.pop_front() {
            self.current_task_id = Some(task_id.clone());
            self.state = AgentState::Working;
            Some(task_id)
        } else {
            None
        }
    }

    /// Mark current task as completed
    pub fn complete_current_task(&mut self) {
        if let Some(task_id) = self.current_task_id.take() {
            self.completed_tasks.push(task_id);
        }
        self.state = if self.task_queue.is_empty() {
            AgentState::Idle
        } else {
            AgentState::Waiting
        };
    }

    /// Mark current task as failed
    pub fn fail_current_task(&mut self) {
        if let Some(task_id) = self.current_task_id.take() {
            self.failed_tasks.push(task_id);
        }
        self.state = if self.task_queue.is_empty() {
            AgentState::Idle
        } else {
            AgentState::Waiting
        };
    }

    /// Block the agent
    pub fn block(&mut self) {
        self.state = AgentState::Blocked;
    }

    /// Unblock the agent
    pub fn unblock(&mut self) {
        if self.task_queue.is_empty() {
            self.state = AgentState::Idle;
        } else {
            self.state = AgentState::Waiting;
        }
    }

    /// Send a message to another agent
    pub fn send_message(&mut self, to: Role, content: String) -> AgentMessage {
        let msg = AgentMessage {
            from: self.role,
            to,
            content,
            timestamp_ms: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_millis() as u64,
        };
        msg
    }

    /// Receive a message
    pub fn receive_message(&mut self, msg: AgentMessage) {
        self.messages.push(msg);
    }

    /// Get pending task count
    pub fn pending_tasks(&self) -> usize {
        self.task_queue.len()
    }

    /// Get total completed task count
    pub fn total_completed(&self) -> usize {
        self.completed_tasks.len()
    }

    /// Get total failed task count
    pub fn total_failed(&self) -> usize {
        self.failed_tasks.len()
    }

    /// Check if agent is available
    pub fn is_available(&self) -> bool {
        self.state == AgentState::Idle || self.state == AgentState::Waiting
    }

    /// Get status summary
    pub fn status_summary(&self) -> String {
        format!(
            "{}: {} ({} pending, {} completed, {} failed)",
            self.name,
            format!("{:?}", self.state),
            self.pending_tasks(),
            self.total_completed(),
            self.total_failed()
        )
    }
}
