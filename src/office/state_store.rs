//! Office State Store - Persistence for Office simulation

use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;

use anyhow::Result;

use super::agent::{AgentMessage, AgentState};
use super::office::{ExecutionMode, Office, OfficeEvent};
use super::roles::Role;
use super::tasks::{OfficeTask, Priority, TaskStatus};

/// Office state for persistence
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct OfficeState {
    pub version: u32,
    pub agents: HashMap<String, AgentStateData>,
    pub tasks: HashMap<String, TaskStateData>,
    pub mode: String,
    pub running: bool,
    pub paused: bool,
    pub events: Vec<OfficeEventData>,
}

/// Serialized agent data
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct AgentStateData {
    pub role: String,
    pub name: String,
    pub state: String,
    pub current_task_id: Option<String>,
    pub task_queue: Vec<String>,
    pub completed_tasks: Vec<String>,
    pub failed_tasks: Vec<String>,
    pub messages: Vec<MessageData>,
    pub skills: Vec<String>,
}

/// Serialized message data
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct MessageData {
    pub from: String,
    pub to: String,
    pub content: String,
    pub timestamp_ms: u64,
}

/// Serialized task data
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct TaskStateData {
    pub id: String,
    pub title: String,
    pub description: String,
    pub assigned_role: Option<String>,
    pub status: String,
    pub priority: String,
    pub input: String,
    pub output: Option<String>,
    pub error: Option<String>,
    pub created_at_ms: u64,
    pub started_at_ms: Option<u64>,
    pub completed_at_ms: Option<u64>,
    pub depends_on: Vec<String>,
    pub confidence: Option<f32>,
}

/// Serialized event data
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct OfficeEventData {
    pub variant: String,
    pub task_id: Option<String>,
    pub role: Option<String>,
    pub from: Option<String>,
    pub to: Option<String>,
    pub content: Option<String>,
    pub error: Option<String>,
}

impl From<&Office> for OfficeState {
    fn from(office: &Office) -> Self {
        let mut agents = HashMap::new();
        for (role, agent) in office.all_agents() {
            let role_str = format!("{:?}", role);
            agents.insert(
                role_str.clone(),
                AgentStateData {
                    role: role_str,
                    name: agent.name.clone(),
                    state: format!("{:?}", agent.state),
                    current_task_id: agent.current_task_id.clone(),
                    task_queue: agent.task_queue.iter().cloned().collect(),
                    completed_tasks: agent.completed_tasks.clone(),
                    failed_tasks: agent.failed_tasks.clone(),
                    messages: agent
                        .messages
                        .iter()
                        .map(|m| MessageData {
                            from: format!("{:?}", m.from),
                            to: format!("{:?}", m.to),
                            content: m.content.clone(),
                            timestamp_ms: m.timestamp_ms,
                        })
                        .collect(),
                    skills: agent.skills.clone(),
                },
            );
        }

        let mut tasks = HashMap::new();
        for (id, task) in office.all_tasks() {
            tasks.insert(
                id.clone(),
                TaskStateData {
                    id: task.id.clone(),
                    title: task.title.clone(),
                    description: task.description.clone(),
                    assigned_role: task.assigned_role.map(|r| format!("{:?}", r)),
                    status: format!("{:?}", task.status),
                    priority: format!("{:?}", task.priority),
                    input: task.input.clone(),
                    output: task.output.clone(),
                    error: task.error.clone(),
                    created_at_ms: task.created_at_ms,
                    started_at_ms: task.started_at_ms,
                    completed_at_ms: task.completed_at_ms,
                    depends_on: task.depends_on.clone(),
                    confidence: task.confidence,
                },
            );
        }

        let events = office
            .events()
            .iter()
            .map(|e| match e {
                OfficeEvent::TaskAssigned { task_id, role } => OfficeEventData {
                    variant: "TaskAssigned".to_string(),
                    task_id: Some(task_id.clone()),
                    role: Some(format!("{:?}", role)),
                    from: None,
                    to: None,
                    content: None,
                    error: None,
                },
                OfficeEvent::TaskStarted { task_id, role } => OfficeEventData {
                    variant: "TaskStarted".to_string(),
                    task_id: Some(task_id.clone()),
                    role: Some(format!("{:?}", role)),
                    from: None,
                    to: None,
                    content: None,
                    error: None,
                },
                OfficeEvent::TaskCompleted { task_id, role } => OfficeEventData {
                    variant: "TaskCompleted".to_string(),
                    task_id: Some(task_id.clone()),
                    role: Some(format!("{:?}", role)),
                    from: None,
                    to: None,
                    content: None,
                    error: None,
                },
                OfficeEvent::TaskFailed {
                    task_id,
                    role,
                    error,
                } => OfficeEventData {
                    variant: "TaskFailed".to_string(),
                    task_id: Some(task_id.clone()),
                    role: Some(format!("{:?}", role)),
                    from: None,
                    to: None,
                    content: None,
                    error: Some(error.clone()),
                },
                OfficeEvent::TaskPaused { task_id, role } => OfficeEventData {
                    variant: "TaskPaused".to_string(),
                    task_id: Some(task_id.clone()),
                    role: Some(format!("{:?}", role)),
                    from: None,
                    to: None,
                    content: None,
                    error: None,
                },
                OfficeEvent::TaskResumed { task_id, role } => OfficeEventData {
                    variant: "TaskResumed".to_string(),
                    task_id: Some(task_id.clone()),
                    role: Some(format!("{:?}", role)),
                    from: None,
                    to: None,
                    content: None,
                    error: None,
                },
                OfficeEvent::AgentMessage { from, to, content } => OfficeEventData {
                    variant: "AgentMessage".to_string(),
                    task_id: None,
                    role: None,
                    from: Some(format!("{:?}", from)),
                    to: Some(format!("{:?}", to)),
                    content: Some(content.clone()),
                    error: None,
                },
                OfficeEvent::AgentStateChanged { role, state } => OfficeEventData {
                    variant: "AgentStateChanged".to_string(),
                    task_id: None,
                    role: Some(format!("{:?}", role)),
                    from: None,
                    to: None,
                    content: Some(format!("{:?}", state)),
                    error: None,
                },
            })
            .collect();

        Self {
            version: 1,
            agents,
            tasks,
            mode: format!("{:?}", office.mode()),
            running: office.is_running(),
            paused: office.is_paused(),
            events,
        }
    }
}

/// Office state store for persistence
pub struct OfficeStateStore {
    root: PathBuf,
}

impl OfficeStateStore {
    /// Create a new store
    pub fn new(root: &str) -> Result<Self> {
        let root = PathBuf::from(root);
        let office_dir = root.join(".agentic-sdlc").join("office");
        let legacy_office_dir = root.join(".antigrav").join("office");
        let selected_dir = if !office_dir.exists() && legacy_office_dir.exists() {
            legacy_office_dir
        } else {
            office_dir
        };
        fs::create_dir_all(&selected_dir)?;
        Ok(Self { root: selected_dir })
    }

    /// Get the state file path
    fn state_path(&self) -> PathBuf {
        self.root.join("state.json")
    }

    /// Save office state
    pub fn save(&self, office: &Office) -> Result<()> {
        let state = OfficeState::from(office);
        let json = serde_json::to_string_pretty(&state)?;
        fs::write(self.state_path(), json)?;
        Ok(())
    }

    /// Load office state
    pub fn load(&self) -> Result<Option<Office>> {
        let path = self.state_path();
        if !path.exists() {
            return Ok(None);
        }

        let json = fs::read_to_string(&path)?;
        let state: OfficeState = serde_json::from_str(&json)?;

        let mut roles = Vec::new();
        for role_str in state.agents.keys() {
            if let Some(role) = Role::from_str(role_str) {
                if !roles.contains(&role) {
                    roles.push(role);
                }
            }
        }

        let mut office = if roles.is_empty() {
            Office::new()
        } else {
            Office::with_roles(roles)
        };

        // Load agents
        for (role_str, agent_data) in &state.agents {
            if let Some(role) = Role::from_str(role_str) {
                if let Some(agent) = office.get_agent_mut(role) {
                    agent.name = agent_data.name.clone();
                    agent.state = match agent_data.state.as_str() {
                        "Idle" => AgentState::Idle,
                        "Working" => AgentState::Working,
                        "Waiting" => AgentState::Waiting,
                        "Blocked" => AgentState::Blocked,
                        _ => AgentState::Idle,
                    };
                    agent.current_task_id = agent_data.current_task_id.clone();
                    agent.task_queue = agent_data.task_queue.iter().cloned().collect();
                    agent.completed_tasks = agent_data.completed_tasks.clone();
                    agent.failed_tasks = agent_data.failed_tasks.clone();
                    agent.skills = agent_data.skills.clone();
                    agent.messages = agent_data
                        .messages
                        .iter()
                        .map(|m| {
                            let from_role = Role::from_str(&m.from).unwrap_or(Role::Engineer);
                            let to_role = Role::from_str(&m.to).unwrap_or(Role::Engineer);
                            AgentMessage {
                                from: from_role,
                                to: to_role,
                                content: m.content.clone(),
                                timestamp_ms: m.timestamp_ms,
                            }
                        })
                        .collect();
                }
            }
        }

        // Load tasks
        for task_data in state.tasks.values() {
            let status = match task_data.status.as_str() {
                "Pending" => TaskStatus::Pending,
                "InProgress" => TaskStatus::InProgress,
                "Completed" => TaskStatus::Completed,
                "Failed" => TaskStatus::Failed,
                "Paused" => TaskStatus::Paused,
                "Cancelled" => TaskStatus::Cancelled,
                _ => TaskStatus::Pending,
            };

            let priority = match task_data.priority.as_str() {
                "Low" => Priority::Low,
                "Medium" => Priority::Medium,
                "High" => Priority::High,
                "Critical" => Priority::Critical,
                _ => Priority::Medium,
            };

            let mut task = OfficeTask::new(
                task_data.id.clone(),
                task_data.title.clone(),
                task_data.description.clone(),
                task_data.input.clone(),
            );
            task.created_at_ms = task_data.created_at_ms;
            task.status = status;
            task.priority = priority;
            task.output = task_data.output.clone();
            task.error = task_data.error.clone();
            task.started_at_ms = task_data.started_at_ms;
            task.completed_at_ms = task_data.completed_at_ms;
            task.depends_on = task_data.depends_on.clone();
            task.confidence = task_data.confidence;

            if let Some(role_str) = &task_data.assigned_role {
                task.assigned_role = Role::from_str(role_str);
            }

            office.add_task(task);
        }

        // Set mode
        office.set_mode(match state.mode.as_str() {
            "Sequential" => ExecutionMode::Sequential,
            "Parallel" => ExecutionMode::Parallel,
            "RoleBased" => ExecutionMode::RoleBased,
            _ => ExecutionMode::Parallel,
        });

        // Set running state
        if state.running {
            office.start();
        }
        if state.paused {
            office.pause();
        }

        Ok(Some(office))
    }

    /// Check if state exists
    pub fn exists(&self) -> bool {
        self.state_path().exists()
    }

    /// Delete state
    pub fn delete(&self) -> Result<()> {
        let path = self.state_path();
        if path.exists() {
            fs::remove_file(path)?;
        }
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_office_state_serialize() {
        let office = Office::new();
        let state = OfficeState::from(&office);
        assert_eq!(state.version, 1);
        assert!(!state.agents.is_empty());
    }

    #[test]
    fn test_office_state_store() {
        let temp_dir = tempfile::tempdir().unwrap();
        let store = OfficeStateStore::new(temp_dir.path().to_str().unwrap()).unwrap();

        let office = Office::new();
        store.save(&office).unwrap();
        assert!(store.exists());

        let loaded = store.load().unwrap();
        assert!(loaded.is_some());
    }

    #[test]
    fn test_office_state_preserves_roles() {
        let temp_dir = tempfile::tempdir().unwrap();
        let store = OfficeStateStore::new(temp_dir.path().to_str().unwrap()).unwrap();

        let office = Office::with_roles(vec![Role::Engineer, Role::QA]);
        store.save(&office).unwrap();

        let loaded = store.load().unwrap().unwrap();
        let agents = loaded.all_agents();
        assert_eq!(agents.len(), 2);
        assert!(agents.contains_key(&Role::Engineer));
        assert!(agents.contains_key(&Role::QA));
    }

    #[test]
    fn test_office_state_preserves_task_created_at() {
        let temp_dir = tempfile::tempdir().unwrap();
        let store = OfficeStateStore::new(temp_dir.path().to_str().unwrap()).unwrap();

        let mut office = Office::new();
        let mut task = OfficeTask::new(
            "task-1".to_string(),
            "Title".to_string(),
            "Desc".to_string(),
            "Input".to_string(),
        );
        task.created_at_ms = 123;
        office.add_task(task);
        store.save(&office).unwrap();

        let loaded = store.load().unwrap().unwrap();
        let loaded_task = loaded.get_task("task-1").unwrap();
        assert_eq!(loaded_task.created_at_ms, 123);
    }
}
