use crate::engine::workflow_engine::instance::{now_ms, WorkflowInstance};
use anyhow::{anyhow, Result};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs::OpenOptions;
use std::io::Write;
use std::path::{Path, PathBuf};

const THREAD_SESSION_SCHEMA_VERSION: u32 = 2;
const MAX_THREAD_EVENT_HISTORY: usize = 64;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Default)]
#[serde(rename_all = "snake_case")]
pub enum ThreadLifecycleState {
    #[default]
    Open,
    Active,
    Merged,
    Blocked,
    Closed,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct ThreadSessionEvent {
    pub timestamp_ms: u64,
    pub event_type: String,
    pub message: String,
    #[serde(default)]
    pub workflow_instance_id: Option<String>,
    #[serde(default)]
    pub workflow_name: Option<String>,
    #[serde(default)]
    pub workflow_status: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct ThreadSessionRecord {
    pub thread_id: String,
    pub branch: String,
    #[serde(default)]
    pub lifecycle_state: ThreadLifecycleState,
    #[serde(default)]
    pub last_workflow_instance_id: Option<String>,
    #[serde(default)]
    pub last_workflow_name: Option<String>,
    #[serde(default)]
    pub last_workflow_status: Option<String>,
    #[serde(default)]
    pub last_trace_id: Option<String>,
    #[serde(default)]
    pub run_count: u32,
    #[serde(default)]
    pub history: Vec<ThreadSessionEvent>,
    pub created_at_ms: u64,
    pub updated_at_ms: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct ThreadSessionIndex {
    schema: u32,
    #[serde(default)]
    threads: Vec<ThreadSessionRecord>,
    #[serde(default)]
    instance_to_thread: HashMap<String, String>,
}

impl Default for ThreadSessionIndex {
    fn default() -> Self {
        Self {
            schema: THREAD_SESSION_SCHEMA_VERSION,
            threads: Vec::new(),
            instance_to_thread: HashMap::new(),
        }
    }
}

#[derive(Debug, Clone)]
pub struct ThreadSessionStore {
    state_dir: PathBuf,
    state_file: PathBuf,
}

impl ThreadSessionStore {
    pub fn new(project_root: &str) -> Result<Self> {
        let state_dir = Path::new(project_root).join(".agents").join("state");
        std::fs::create_dir_all(&state_dir)?;
        let state_file = state_dir.join("thread_sessions.json");
        Ok(Self {
            state_dir,
            state_file,
        })
    }

    pub fn ensure_thread(&self, thread_id: &str, branch: &str) -> Result<ThreadSessionRecord> {
        let thread_id = normalize_thread_id(thread_id)?;
        let branch = normalize_branch(branch)?;
        let mut index = self.load_index()?;
        let (idx, created) = upsert_thread_record(&mut index, &thread_id, &branch);
        if created {
            let record = index
                .threads
                .get_mut(idx)
                .ok_or_else(|| anyhow!("thread session record missing after upsert"))?;
            push_event(
                record,
                ThreadSessionEvent {
                    timestamp_ms: now_ms(),
                    event_type: "thread_opened".to_string(),
                    message: format!(
                        "Thread '{}' opened on branch '{}'",
                        record.thread_id, record.branch
                    ),
                    workflow_instance_id: None,
                    workflow_name: None,
                    workflow_status: None,
                },
            );
            record.lifecycle_state = ThreadLifecycleState::Open;
        }
        let record = index.threads[idx].clone();
        self.save_index(&index)?;
        Ok(record)
    }

    pub fn record_instance(
        &self,
        thread_id: &str,
        branch: &str,
        instance: &WorkflowInstance,
    ) -> Result<ThreadSessionRecord> {
        let thread_id = normalize_thread_id(thread_id)?;
        let branch = normalize_branch(branch)?;
        let mut index = self.load_index()?;
        let (idx, created) = upsert_thread_record(&mut index, &thread_id, &branch);
        {
            let record = index
                .threads
                .get_mut(idx)
                .ok_or_else(|| anyhow!("thread session record missing after upsert"))?;

            if created {
                push_event(
                    record,
                    ThreadSessionEvent {
                        timestamp_ms: now_ms(),
                        event_type: "thread_opened".to_string(),
                        message: format!(
                            "Thread '{}' opened on branch '{}'",
                            record.thread_id, record.branch
                        ),
                        workflow_instance_id: None,
                        workflow_name: None,
                        workflow_status: None,
                    },
                );
            }
            let previous_instance = record.last_workflow_instance_id.as_deref();
            if previous_instance != Some(instance.instance_id.as_str()) {
                record.run_count = record.run_count.saturating_add(1);
            }
            record.last_workflow_instance_id = Some(instance.instance_id.clone());
            record.last_workflow_name = Some(instance.workflow_name.clone());
            record.last_workflow_status = Some(format!("{:?}", instance.status));
            record.last_trace_id = Some(instance.trace_id.clone());
            record.lifecycle_state =
                derive_lifecycle_state(record.lifecycle_state.clone(), instance);
            push_event(
                record,
                ThreadSessionEvent {
                    timestamp_ms: now_ms(),
                    event_type: "workflow_recorded".to_string(),
                    message: format!(
                        "Recorded workflow '{}' with status {:?}",
                        instance.workflow_name, instance.status
                    ),
                    workflow_instance_id: Some(instance.instance_id.clone()),
                    workflow_name: Some(instance.workflow_name.clone()),
                    workflow_status: Some(format!("{:?}", instance.status)),
                },
            );
            record.updated_at_ms = now_ms();
        }
        index
            .instance_to_thread
            .insert(instance.instance_id.clone(), thread_id);
        let record = index.threads[idx].clone();
        self.save_index(&index)?;
        Ok(record)
    }

    pub fn get_thread(&self, thread_id: &str) -> Result<Option<ThreadSessionRecord>> {
        let thread_id = normalize_thread_id(thread_id)?;
        let index = self.load_index()?;
        Ok(index
            .threads
            .into_iter()
            .find(|record| record.thread_id == thread_id))
    }

    pub fn list_threads(&self) -> Result<Vec<ThreadSessionRecord>> {
        let mut threads = self.load_index()?.threads;
        threads.sort_by(|a, b| b.updated_at_ms.cmp(&a.updated_at_ms));
        Ok(threads)
    }

    pub fn resolve_thread_for_instance(
        &self,
        instance_id: &str,
    ) -> Result<Option<ThreadSessionRecord>> {
        let instance_id = instance_id.trim();
        if instance_id.is_empty() {
            return Ok(None);
        }
        let index = self.load_index()?;
        let Some(thread_id) = index.instance_to_thread.get(instance_id).cloned() else {
            return Ok(None);
        };
        Ok(index
            .threads
            .into_iter()
            .find(|record| record.thread_id == thread_id))
    }

    fn load_index(&self) -> Result<ThreadSessionIndex> {
        if !self.state_file.exists() {
            return Ok(ThreadSessionIndex::default());
        }
        let body = std::fs::read_to_string(&self.state_file)?;
        let mut parsed: ThreadSessionIndex =
            serde_json::from_str(&body).unwrap_or_else(|_| ThreadSessionIndex::default());
        if parsed.schema < THREAD_SESSION_SCHEMA_VERSION {
            migrate_index(&mut parsed);
            parsed.schema = THREAD_SESSION_SCHEMA_VERSION;
        }
        Ok(parsed)
    }

    fn save_index(&self, index: &ThreadSessionIndex) -> Result<()> {
        let body = serde_json::to_vec_pretty(index)?;
        let tmp_path = self
            .state_dir
            .join(format!("thread_sessions.json.tmp.{}", std::process::id()));
        {
            let mut file = OpenOptions::new()
                .create(true)
                .write(true)
                .truncate(true)
                .open(&tmp_path)?;
            file.write_all(&body)?;
            file.write_all(b"\n")?;
            file.sync_all()?;
        }
        std::fs::rename(tmp_path, &self.state_file)?;
        Ok(())
    }
}

fn upsert_thread_record(
    index: &mut ThreadSessionIndex,
    thread_id: &str,
    branch: &str,
) -> (usize, bool) {
    if let Some(idx) = index
        .threads
        .iter()
        .position(|record| record.thread_id == thread_id)
    {
        let record = &mut index.threads[idx];
        record.branch = branch.to_string();
        record.updated_at_ms = now_ms();
        return (idx, false);
    }
    let now = now_ms();
    index.threads.push(ThreadSessionRecord {
        thread_id: thread_id.to_string(),
        branch: branch.to_string(),
        lifecycle_state: ThreadLifecycleState::Open,
        last_workflow_instance_id: None,
        last_workflow_name: None,
        last_workflow_status: None,
        last_trace_id: None,
        run_count: 0,
        history: Vec::new(),
        created_at_ms: now,
        updated_at_ms: now,
    });
    (index.threads.len().saturating_sub(1), true)
}

fn push_event(record: &mut ThreadSessionRecord, event: ThreadSessionEvent) {
    record.history.push(event);
    if record.history.len() > MAX_THREAD_EVENT_HISTORY {
        let overflow = record
            .history
            .len()
            .saturating_sub(MAX_THREAD_EVENT_HISTORY);
        record.history.drain(0..overflow);
    }
}

fn derive_lifecycle_state(
    current: ThreadLifecycleState,
    instance: &WorkflowInstance,
) -> ThreadLifecycleState {
    use crate::engine::workflow_engine::instance::WorkflowInstanceStatus;
    let workflow = instance.workflow_name.to_ascii_lowercase();
    match instance.status {
        WorkflowInstanceStatus::Pending | WorkflowInstanceStatus::Running => {
            ThreadLifecycleState::Active
        }
        WorkflowInstanceStatus::Paused => ThreadLifecycleState::Blocked,
        WorkflowInstanceStatus::Failed | WorkflowInstanceStatus::Aborted => {
            ThreadLifecycleState::Blocked
        }
        WorkflowInstanceStatus::Completed => {
            if workflow.starts_with("thread-flow-") {
                ThreadLifecycleState::Merged
            } else if workflow.starts_with("chat-thread-") {
                ThreadLifecycleState::Active
            } else {
                match current {
                    ThreadLifecycleState::Merged => ThreadLifecycleState::Merged,
                    ThreadLifecycleState::Closed => ThreadLifecycleState::Closed,
                    _ => ThreadLifecycleState::Active,
                }
            }
        }
    }
}

fn migrate_index(index: &mut ThreadSessionIndex) {
    for record in &mut index.threads {
        if record.last_workflow_instance_id.is_some() {
            let inferred = match record
                .last_workflow_status
                .as_deref()
                .unwrap_or_default()
                .to_ascii_lowercase()
                .as_str()
            {
                "failed" | "aborted" => ThreadLifecycleState::Blocked,
                "completed" => {
                    let workflow = record
                        .last_workflow_name
                        .as_deref()
                        .unwrap_or_default()
                        .to_ascii_lowercase();
                    if workflow.starts_with("thread-flow-") {
                        ThreadLifecycleState::Merged
                    } else {
                        ThreadLifecycleState::Active
                    }
                }
                "running" | "pending" => ThreadLifecycleState::Active,
                "paused" => ThreadLifecycleState::Blocked,
                _ => ThreadLifecycleState::Open,
            };
            record.lifecycle_state = inferred;
            if record.history.is_empty() {
                push_event(
                    record,
                    ThreadSessionEvent {
                        timestamp_ms: record.updated_at_ms,
                        event_type: "migrated_workflow_record".to_string(),
                        message: format!(
                            "Migrated previous workflow '{}' status {:?}",
                            record.last_workflow_name.clone().unwrap_or_default(),
                            record.last_workflow_status
                        ),
                        workflow_instance_id: record.last_workflow_instance_id.clone(),
                        workflow_name: record.last_workflow_name.clone(),
                        workflow_status: record.last_workflow_status.clone(),
                    },
                );
            }
        } else {
            record.lifecycle_state = ThreadLifecycleState::Open;
        }
    }
}

fn normalize_thread_id(thread_id: &str) -> Result<String> {
    let normalized = thread_id.trim();
    if normalized.is_empty() {
        return Err(anyhow!("thread_id is required"));
    }
    Ok(normalized.to_string())
}

fn normalize_branch(branch: &str) -> Result<String> {
    let normalized = branch.trim();
    if normalized.is_empty() {
        return Err(anyhow!("branch is required"));
    }
    Ok(normalized.to_string())
}

#[cfg(test)]
mod tests {
    use super::{ThreadLifecycleState, ThreadSessionStore};
    use crate::engine::workflow_engine::instance::{WorkflowInstance, WorkflowInstanceStatus};
    use crate::workflow::model::{Workflow, WorkflowMeta, WorkflowStep};

    fn temp_root(prefix: &str) -> std::path::PathBuf {
        let unique = format!(
            "{}-{}",
            prefix,
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .expect("time")
                .as_nanos()
        );
        let root = std::env::temp_dir().join(unique);
        std::fs::create_dir_all(&root).expect("root");
        root
    }

    fn sample_instance(name: &str) -> WorkflowInstance {
        let workflow = Workflow {
            meta: WorkflowMeta {
                name: name.to_string(),
                domain: Some("agent".to_string()),
                goal: None,
                target_type: None,
                routing_policy: None,
                security_policy: None,
                resource_budget: None,
                projected_cost: None,
                projected_latency_ms: None,
                projected_steps: None,
            },
            steps: vec![WorkflowStep::new("s1", "demo.echo", "hello")],
        };
        WorkflowInstance::new(&workflow, None)
    }

    #[test]
    fn ensure_and_record_thread_session() {
        let root = temp_root("agentic-sdlc-thread-session");
        let store = ThreadSessionStore::new(root.to_str().expect("root")).expect("store");

        let ensured = store
            .ensure_thread("thread-a", "thread/thread-a")
            .expect("ensure");
        assert_eq!(ensured.thread_id, "thread-a");
        assert_eq!(ensured.branch, "thread/thread-a");
        assert_eq!(ensured.run_count, 0);

        let mut instance = sample_instance("feature");
        instance.status = WorkflowInstanceStatus::Completed;
        let recorded = store
            .record_instance("thread-a", "thread/thread-a", &instance)
            .expect("record");
        assert_eq!(
            recorded.last_workflow_instance_id,
            Some(instance.instance_id)
        );
        assert_eq!(recorded.last_workflow_status, Some("Completed".to_string()));
        assert_eq!(recorded.run_count, 1);
        assert_eq!(recorded.lifecycle_state, ThreadLifecycleState::Active);
        assert!(!recorded.history.is_empty());

        let by_instance = store
            .resolve_thread_for_instance(
                recorded
                    .last_workflow_instance_id
                    .as_deref()
                    .expect("instance id"),
            )
            .expect("resolve by instance")
            .expect("thread record");
        assert_eq!(by_instance.thread_id, "thread-a");

        let mut merge_instance = sample_instance("thread-flow-thread-a");
        merge_instance.status = WorkflowInstanceStatus::Completed;
        let merged = store
            .record_instance("thread-a", "thread/thread-a", &merge_instance)
            .expect("record merged");
        assert_eq!(merged.lifecycle_state, ThreadLifecycleState::Merged);
        assert!(merged
            .history
            .iter()
            .any(|event| event.message.contains("thread-flow-thread-a")));
    }
}
