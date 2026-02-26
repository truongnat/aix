use crate::engine::v2::instance::{now_ms, WorkflowInstance};
use anyhow::{anyhow, Result};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs::OpenOptions;
use std::io::Write;
use std::path::{Path, PathBuf};

const THREAD_SESSION_SCHEMA_VERSION: u32 = 1;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct ThreadSessionRecord {
    pub thread_id: String,
    pub branch: String,
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
        let idx = upsert_thread_record(&mut index, &thread_id, &branch);
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
        let idx = upsert_thread_record(&mut index, &thread_id, &branch);
        {
            let record = index
                .threads
                .get_mut(idx)
                .ok_or_else(|| anyhow!("thread session record missing after upsert"))?;

            let previous_instance = record.last_workflow_instance_id.as_deref();
            if previous_instance != Some(instance.instance_id.as_str()) {
                record.run_count = record.run_count.saturating_add(1);
            }
            record.last_workflow_instance_id = Some(instance.instance_id.clone());
            record.last_workflow_name = Some(instance.workflow_name.clone());
            record.last_workflow_status = Some(format!("{:?}", instance.status));
            record.last_trace_id = Some(instance.trace_id.clone());
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
        if parsed.schema == 0 {
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

fn upsert_thread_record(index: &mut ThreadSessionIndex, thread_id: &str, branch: &str) -> usize {
    if let Some(idx) = index
        .threads
        .iter()
        .position(|record| record.thread_id == thread_id)
    {
        let record = &mut index.threads[idx];
        record.branch = branch.to_string();
        record.updated_at_ms = now_ms();
        return idx;
    }
    let now = now_ms();
    index.threads.push(ThreadSessionRecord {
        thread_id: thread_id.to_string(),
        branch: branch.to_string(),
        last_workflow_instance_id: None,
        last_workflow_name: None,
        last_workflow_status: None,
        last_trace_id: None,
        run_count: 0,
        created_at_ms: now,
        updated_at_ms: now,
    });
    index.threads.len().saturating_sub(1)
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
    use super::ThreadSessionStore;
    use crate::engine::v2::instance::{WorkflowInstance, WorkflowInstanceStatus};
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
    }
}
