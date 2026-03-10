//! Office Runtime - Global state management for Office simulation

use std::sync::Arc;
use tokio::sync::RwLock;

use anyhow::anyhow;

use crate::office::office::ExecutionMode;
use crate::office::roles::Role;
use crate::office::tasks::OfficeTask;
use crate::office::Office;
use crate::office::OfficeStateStore;

/// Global office state
pub struct OfficeRuntime {
    pub office: Office,
    pub state_store: OfficeStateStore,
}

impl OfficeRuntime {
    /// Create a new runtime
    pub fn new(project_root: &str) -> Result<Self, anyhow::Error> {
        let state_store = OfficeStateStore::new(project_root)?;

        // Try to load existing state, otherwise create new office
        let office = if state_store.exists() {
            state_store.load()?.unwrap_or_else(Office::new)
        } else {
            Office::new()
        };

        Ok(Self {
            office,
            state_store,
        })
    }

    /// Save current state
    pub fn save(&self) -> Result<(), anyhow::Error> {
        self.state_store.save(&self.office)
    }

    /// Start office with task
    pub fn start(
        &mut self,
        task: String,
        parallel: bool,
        roles: Option<String>,
    ) -> Result<(), anyhow::Error> {
        let mode = if parallel {
            ExecutionMode::Parallel
        } else {
            ExecutionMode::Sequential
        };
        self.office.set_mode(mode);

        // Parse roles if provided
        let selected_roles: Vec<Role> = if let Some(roles_str) = roles {
            roles_str
                .split(',')
                .filter_map(|s| Role::from_str(s.trim()))
                .collect()
        } else {
            Role::all()
        };

        // Create office with selected roles
        self.office = Office::with_roles(selected_roles);
        self.office.set_mode(mode);

        // Add initial task
        let task_id = format!(
            "task-{}",
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_millis()
        );
        let task = OfficeTask::new(
            task_id.clone(),
            "Initial Task".to_string(),
            task.clone(),
            task,
        );
        self.office.add_task(task);

        self.office.start();
        self.save()?;
        Ok(())
    }

    /// Add a task
    pub fn add_task(
        &mut self,
        title: String,
        description: String,
        input: String,
        role: Option<String>,
    ) -> Result<String, anyhow::Error> {
        let task_id = format!(
            "task-{}",
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_millis()
        );

        let task = OfficeTask::new(task_id.clone(), title, description, input);

        if let Some(role_str) = role {
            if let Some(r) = Role::from_str(&role_str) {
                self.office.add_task_for_role(task, r);
            } else {
                self.office.add_task(task);
            }
        } else {
            self.office.add_task(task);
        }

        self.save()?;
        Ok(task_id)
    }

    /// Assign task to role
    pub fn assign_task(&mut self, task_id: String, role: String) -> Result<(), anyhow::Error> {
        let task = self
            .office
            .get_task(&task_id)
            .cloned()
            .ok_or_else(|| anyhow!("Task '{}' not found", task_id))?;
        let role = Role::from_str(&role).ok_or_else(|| anyhow!("Unknown role '{}'", role))?;
        self.office.add_task_for_role(task, role);
        self.save()?;
        Ok(())
    }

    /// Pause office
    pub fn pause(&mut self) -> Result<(), anyhow::Error> {
        self.office.pause();
        self.save()?;
        Ok(())
    }

    /// Resume office
    pub fn resume(&mut self) -> Result<(), anyhow::Error> {
        self.office.resume();
        self.save()?;
        Ok(())
    }

    /// Stop office
    pub fn stop(&mut self) -> Result<(), anyhow::Error> {
        self.office.stop();
        self.save()?;
        Ok(())
    }

    /// Send message
    pub fn send_message(
        &mut self,
        from: String,
        to: String,
        content: String,
    ) -> Result<(), anyhow::Error> {
        if let (Some(f), Some(t)) = (Role::from_str(&from), Role::from_str(&to)) {
            self.office.send_message(f, t, content);
            self.save()?;
        }
        Ok(())
    }
}

/// Global office runtime wrapped in Arc<RwLock>
pub type SharedOfficeRuntime = Arc<RwLock<OfficeRuntime>>;

/// Get or create the global office runtime
pub fn get_or_create_office_runtime(
    project_root: &str,
) -> Result<SharedOfficeRuntime, anyhow::Error> {
    Ok(Arc::new(RwLock::new(OfficeRuntime::new(project_root)?)))
}
