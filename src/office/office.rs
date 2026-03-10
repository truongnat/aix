//! Office - Main orchestrator for company simulation
//!
//! Manages multiple agents (roles) and coordinates parallel task execution

use std::collections::{HashMap, HashSet};
use std::sync::Arc;
use tokio::sync::RwLock;

use super::agent::{AgentState, OfficeAgent};
use super::roles::Role;
use super::tasks::{OfficeTask, TaskStatus};

/// Office execution mode
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ExecutionMode {
    /// Sequential execution (one task at a time)
    Sequential,
    /// Parallel execution (multiple tasks at once)
    Parallel,
    /// Role-based execution (tasks assigned to specific roles)
    RoleBased,
}

/// Office event for monitoring
#[derive(Debug, Clone)]
pub enum OfficeEvent {
    TaskAssigned { task_id: String, role: Role },
    TaskStarted { task_id: String, role: Role },
    TaskCompleted { task_id: String, role: Role },
    TaskFailed { task_id: String, role: Role, error: String },
    TaskPaused { task_id: String, role: Role },
    TaskResumed { task_id: String, role: Role },
    AgentMessage { from: Role, to: Role, content: String },
    AgentStateChanged { role: Role, state: AgentState },
}

/// Office statistics
#[derive(Debug, Clone, serde::Serialize)]
pub struct OfficeStats {
    pub total_tasks: usize,
    pub completed_tasks: usize,
    pub failed_tasks: usize,
    pub pending_tasks: usize,
    pub in_progress_tasks: usize,
}

/// Main Office orchestrator
pub struct Office {
    /// All agents in the office
    agents: HashMap<Role, OfficeAgent>,
    /// All tasks
    tasks: HashMap<String, OfficeTask>,
    /// Execution mode
    mode: ExecutionMode,
    /// Is office running
    running: bool,
    /// Is office paused
    paused: bool,
    /// Event listeners
    events: Vec<OfficeEvent>,
}

impl Office {
    /// Create a new office with all roles
    pub fn new() -> Self {
        let mut agents = HashMap::new();
        for role in Role::all() {
            agents.insert(role, OfficeAgent::new(role));
        }

        Self {
            agents,
            tasks: HashMap::new(),
            mode: ExecutionMode::Parallel,
            running: false,
            paused: false,
            events: Vec::new(),
        }
    }

    /// Create office with specific roles
    pub fn with_roles(roles: Vec<Role>) -> Self {
        let mut agents = HashMap::new();
        for role in roles {
            agents.insert(role, OfficeAgent::new(role));
        }

        Self {
            agents,
            tasks: HashMap::new(),
            mode: ExecutionMode::Parallel,
            running: false,
            paused: false,
            events: Vec::new(),
        }
    }

    /// Set execution mode
    pub fn set_mode(&mut self, mode: ExecutionMode) {
        self.mode = mode;
    }

    /// Add a task to the office
    pub fn add_task(&mut self, task: OfficeTask) {
        let task_id = task.id.clone();
        self.tasks.insert(task_id, task);
    }

    /// Add a task and assign to a role
    pub fn add_task_for_role(&mut self, task: OfficeTask, role: Role) {
        let task_id = task.id.clone();
        let previous_role = self.tasks.get(&task_id).and_then(|t| t.assigned_role);

        if let Some(t) = self.tasks.get_mut(&task_id) {
            t.assigned_role = Some(role);
        } else {
            let mut t = task;
            t.assigned_role = Some(role);
            self.tasks.insert(task_id.clone(), t);
        }

        if previous_role != Some(role) {
            self.unassign_task_from_agents(&task_id);
        }

        // Assign to agent
        if let Some(agent) = self.agents.get_mut(&role) {
            let already_assigned = agent
                .current_task_id
                .as_deref()
                .is_some_and(|id| id == task_id)
                || agent.task_queue.iter().any(|id| id == &task_id);
            if !already_assigned {
                agent.assign_task(task_id);
            }
        }
    }

    fn unassign_task_from_agents(&mut self, task_id: &str) {
        for agent in self.agents.values_mut() {
            agent.task_queue.retain(|id| id != task_id);
            if agent.current_task_id.as_deref() == Some(task_id) {
                agent.current_task_id = None;
                agent.state = if agent.task_queue.is_empty() {
                    AgentState::Idle
                } else {
                    AgentState::Waiting
                };
            } else if agent.state == AgentState::Waiting && agent.task_queue.is_empty() {
                agent.state = AgentState::Idle;
            }
        }
    }

    /// Get task by ID
    pub fn get_task(&self, task_id: &str) -> Option<&OfficeTask> {
        self.tasks.get(task_id)
    }

    /// Get mutable task by ID
    pub fn get_task_mut(&mut self, task_id: &str) -> Option<&mut OfficeTask> {
        self.tasks.get_mut(task_id)
    }

    /// Get agent by role
    pub fn get_agent(&self, role: Role) -> Option<&OfficeAgent> {
        self.agents.get(&role)
    }

    /// Get agent by role (mutable)
    pub fn get_agent_mut(&mut self, role: Role) -> Option<&mut OfficeAgent> {
        self.agents.get_mut(&role)
    }

    /// Get all tasks
    pub fn all_tasks(&self) -> &HashMap<String, OfficeTask> {
        &self.tasks
    }

    /// Get all agents
    pub fn all_agents(&self) -> &HashMap<Role, OfficeAgent> {
        &self.agents
    }

    /// Get completed task IDs
    pub fn completed_task_ids(&self) -> Vec<String> {
        self.tasks
            .iter()
            .filter(|(_, t)| t.status == TaskStatus::Completed)
            .map(|(id, _)| id.clone())
            .collect()
    }

    /// Get ready tasks (dependencies satisfied)
    pub fn get_ready_tasks(&self) -> Vec<&OfficeTask> {
        let completed = self.completed_task_ids();
        self.tasks
            .values()
            .filter(|t| t.is_ready(&completed))
            .collect()
    }

    /// Start the office
    pub fn start(&mut self) {
        self.running = true;
        self.paused = false;
    }

    /// Stop the office
    pub fn stop(&mut self) {
        self.running = false;
    }

    /// Pause execution
    pub fn pause(&mut self) {
        self.paused = true;
        // Pause all in-progress tasks
        for task in self.tasks.values_mut() {
            if task.status == TaskStatus::InProgress {
                task.pause();
            }
        }
    }

    /// Resume execution
    pub fn resume(&mut self) {
        self.paused = false;
        // Resume all paused tasks
        for task in self.tasks.values_mut() {
            if task.status == TaskStatus::Paused {
                task.resume();
            }
        }
    }

    /// Check if running
    pub fn is_running(&self) -> bool {
        self.running
    }

    /// Check if paused
    pub fn is_paused(&self) -> bool {
        self.paused
    }

    /// Get execution mode
    pub fn mode(&self) -> ExecutionMode {
        self.mode
    }

    /// Get statistics
    pub fn stats(&self) -> OfficeStats {
        let mut total = 0;
        let mut completed = 0;
        let mut failed = 0;
        let mut pending = 0;
        let mut in_progress = 0;

        for task in self.tasks.values() {
            total += 1;
            match task.status {
                TaskStatus::Completed => completed += 1,
                TaskStatus::Failed => failed += 1,
                TaskStatus::Pending => pending += 1,
                TaskStatus::InProgress => in_progress += 1,
                TaskStatus::Paused => pending += 1,
                TaskStatus::Cancelled => {}
            }
        }

        OfficeStats {
            total_tasks: total,
            completed_tasks: completed,
            failed_tasks: failed,
            pending_tasks: pending,
            in_progress_tasks: in_progress,
        }
    }

    /// Get events
    pub fn events(&self) -> &[OfficeEvent] {
        &self.events
    }

    /// Clear events
    pub fn clear_events(&mut self) {
        self.events.clear();
    }

    /// Send message between agents
    pub fn send_message(&mut self, from: Role, to: Role, content: String) {
        if let Some(agent) = self.agents.get_mut(&from) {
            let msg = agent.send_message(to, content.clone());
            if let Some(target) = self.agents.get_mut(&to) {
                target.receive_message(msg);
            }
            self.events.push(OfficeEvent::AgentMessage { from, to, content });
        }
    }

    /// Find available agents for parallel execution
    pub fn find_available_agents(&self) -> Vec<Role> {
        self.agents
            .iter()
            .filter(|(_, a)| a.is_available())
            .map(|(r, _)| *r)
            .collect()
    }

    /// Get tasks that can run in parallel (no dependencies between them)
    pub fn get_parallelizable_tasks(&self, roles: &[Role]) -> Vec<OfficeTask> {
        let completed = self.completed_task_ids();
        let role_set: HashSet<Role> = roles.iter().cloned().collect();

        self.tasks
            .values()
            .filter(|t| {
                // Task is pending or paused
                (t.status == TaskStatus::Pending || t.status == TaskStatus::Paused)
                // Dependencies are satisfied
                && t.is_ready(&completed)
                // Either role-based with matching role, or unassigned
                && match t.assigned_role {
                    Some(r) => role_set.contains(&r),
                    None => true,
                }
            })
            .cloned()
            .collect()
    }

    /// Print status to console
    pub fn print_status(&self) {
        println!("\n{}", Role::color(&Role::CEO));
        println!("╔════════════════════════════════════════════════════════════╗");
        println!("║                    OFFICE STATUS                         ║");
        println!("╚════════════════════════════════════════════════════════════╝");
        println!("{}", Role::reset_color());

        let stats = self.stats();
        println!(
            "📊 Total: {} | ✅ Completed: {} | ❌ Failed: {} | ⏳ Pending: {} | 🔄 In Progress: {}",
            stats.total_tasks,
            stats.completed_tasks,
            stats.failed_tasks,
            stats.pending_tasks,
            stats.in_progress_tasks
        );
        println!("Mode: {:?} | Running: {} | Paused: {}", self.mode, self.running, self.paused);
        println!();

        // Print each agent
        for (role, agent) in &self.agents {
            let color = role.color();
            println!("{}{}: {}", color, role.description(), Role::reset_color());
            println!("   State: {:?} | Pending: {} | Completed: {} | Failed: {}",
                agent.state,
                agent.pending_tasks(),
                agent.total_completed(),
                agent.total_failed()
            );

            // Print current task if any
            if let Some(task_id) = &agent.current_task_id {
                if let Some(task) = self.tasks.get(task_id) {
                    println!("   Current: {} - {:?}", task.title, task.status);
                }
            }
            println!();
        }
    }

    /// Get tasks by role
    pub fn tasks_by_role(&self, role: Role) -> Vec<&OfficeTask> {
        self.tasks
            .values()
            .filter(|t| t.assigned_role == Some(role))
            .collect()
    }
}

impl Default for Office {
    fn default() -> Self {
        Self::new()
    }
}

/// Thread-safe Office wrapper
pub type SharedOffice = Arc<RwLock<Office>>;

impl Office {
    /// Create a new shared office
    pub fn shared() -> SharedOffice {
        Arc::new(RwLock::new(Office::new()))
    }

    /// Create shared office with roles
    pub fn shared_with_roles(roles: Vec<Role>) -> SharedOffice {
        Arc::new(RwLock::new(Office::with_roles(roles)))
    }
}
