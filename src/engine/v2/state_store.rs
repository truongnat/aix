use crate::engine::v2::instance::{now_ms, WorkflowInstance};
use anyhow::{anyhow, Result};
use serde::{Deserialize, Serialize};
use std::fs::OpenOptions;
use std::io::{ErrorKind, Write};
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};

const DEFAULT_STALE_LOCK_TIMEOUT_MS: u64 = 30 * 60 * 1000;

#[derive(Debug, Clone, Serialize, Deserialize)]
struct LockFileMetadata {
    scope: String,
    pid: u32,
    started_at_ms: u64,
    hostname: String,
}

impl LockFileMetadata {
    fn new(scope: &str) -> Self {
        Self {
            scope: scope.to_string(),
            pid: std::process::id(),
            started_at_ms: now_ms(),
            hostname: hostname(),
        }
    }
}

fn hostname() -> String {
    std::env::var("HOSTNAME")
        .or_else(|_| std::env::var("COMPUTERNAME"))
        .ok()
        .filter(|v| !v.trim().is_empty())
        .unwrap_or_else(|| "unknown-host".to_string())
}

fn stale_lock_timeout_ms() -> u64 {
    std::env::var("ANTIGRAV_STALE_LOCK_TIMEOUT_MS")
        .ok()
        .and_then(|v| v.trim().parse::<u64>().ok())
        .filter(|v| *v > 0)
        .unwrap_or(DEFAULT_STALE_LOCK_TIMEOUT_MS)
}

fn process_is_alive(pid: u32) -> bool {
    if pid == 0 {
        return false;
    }
    Command::new("kill")
        .arg("-0")
        .arg(pid.to_string())
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .map(|status| status.success())
        .unwrap_or(false)
}

#[derive(Debug, Clone)]
pub struct WorkflowStateStore {
    state_dir: PathBuf,
}

impl WorkflowStateStore {
    pub fn new(project_root: &str) -> Result<Self> {
        let state_dir = Path::new(project_root).join(".agents").join("state");
        std::fs::create_dir_all(&state_dir)?;
        Ok(Self { state_dir })
    }

    pub fn state_file_path(&self, instance_id: &str) -> PathBuf {
        self.state_dir.join(format!("{}.json", instance_id))
    }

    fn lock_file_path(&self, instance_id: &str) -> PathBuf {
        self.state_dir.join(format!("{}.lock", instance_id))
    }

    fn repo_lock_file_path(&self) -> PathBuf {
        self.state_dir.join("repo.lock")
    }

    fn abort_file_path(&self, instance_id: &str) -> PathBuf {
        self.state_dir.join(format!("{}.abort", instance_id))
    }

    pub fn acquire_lock(&self, instance_id: &str) -> Result<WorkflowLockGuard> {
        let lock_path = self.lock_file_path(instance_id);
        Self::acquire_lock_file(&lock_path, &format!("workflow:{}", instance_id))
    }

    pub fn acquire_repo_lock(&self) -> Result<WorkflowLockGuard> {
        let lock_path = self.repo_lock_file_path();
        Self::acquire_lock_file(&lock_path, "repo")
    }

    fn acquire_lock_file(lock_path: &Path, scope: &str) -> Result<WorkflowLockGuard> {
        let metadata = LockFileMetadata::new(scope);
        match Self::write_lock_file(lock_path, &metadata) {
            Ok(()) => Ok(WorkflowLockGuard {
                lock_path: lock_path.to_path_buf(),
            }),
            Err(err) if err.kind() == ErrorKind::AlreadyExists => {
                if Self::try_reclaim_stale_lock(lock_path)? {
                    Self::write_lock_file(lock_path, &metadata).map_err(|write_err| {
                        anyhow!(
                            "Execution lock reclaim race for {} (lock='{}'): {}",
                            scope,
                            lock_path.display(),
                            write_err
                        )
                    })?;
                    return Ok(WorkflowLockGuard {
                        lock_path: lock_path.to_path_buf(),
                    });
                }

                let owner = Self::describe_lock_owner(lock_path)
                    .unwrap_or_else(|| "unknown-owner".to_string());
                Err(anyhow!(
                    "Execution lock already held for {} (lock='{}', owner={}): {}",
                    scope,
                    lock_path.display(),
                    owner,
                    err
                ))
            }
            Err(err) => Err(anyhow!(
                "Failed to acquire execution lock for {} (lock='{}'): {}",
                scope,
                lock_path.display(),
                err
            )),
        }
    }

    fn write_lock_file(lock_path: &Path, metadata: &LockFileMetadata) -> std::io::Result<()> {
        let mut file = OpenOptions::new()
            .write(true)
            .create_new(true)
            .open(lock_path)?;
        let body = serde_json::to_vec_pretty(metadata)
            .unwrap_or_else(|_| format!("pid={}", metadata.pid).as_bytes().to_vec());
        file.write_all(&body)?;
        file.write_all(b"\n")?;
        file.sync_all()?;
        Ok(())
    }

    fn try_reclaim_stale_lock(lock_path: &Path) -> Result<bool> {
        let stale = match Self::read_lock_metadata(lock_path) {
            Some(metadata) => !process_is_alive(metadata.pid),
            None => Self::lock_age_ms(lock_path)
                .map(|age| age > stale_lock_timeout_ms())
                .unwrap_or(false),
        };
        if !stale {
            return Ok(false);
        }

        match std::fs::remove_file(lock_path) {
            Ok(()) => Ok(true),
            Err(err) if err.kind() == ErrorKind::NotFound => Ok(true),
            Err(err) => Err(anyhow!(
                "Failed to reclaim stale lock '{}': {}",
                lock_path.display(),
                err
            )),
        }
    }

    fn read_lock_metadata(lock_path: &Path) -> Option<LockFileMetadata> {
        let body = std::fs::read_to_string(lock_path).ok()?;
        if let Ok(metadata) = serde_json::from_str::<LockFileMetadata>(&body) {
            return Some(metadata);
        }
        for line in body.lines() {
            let trimmed = line.trim();
            if let Some(pid_str) = trimmed.strip_prefix("pid=") {
                if let Ok(pid) = pid_str.trim().parse::<u32>() {
                    return Some(LockFileMetadata {
                        scope: "legacy".to_string(),
                        pid,
                        started_at_ms: 0,
                        hostname: "unknown-host".to_string(),
                    });
                }
            }
        }
        None
    }

    fn describe_lock_owner(lock_path: &Path) -> Option<String> {
        let metadata = Self::read_lock_metadata(lock_path)?;
        Some(format!(
            "pid={} host={} started_at_ms={}",
            metadata.pid, metadata.hostname, metadata.started_at_ms
        ))
    }

    fn lock_age_ms(lock_path: &Path) -> Option<u64> {
        let modified = std::fs::metadata(lock_path).ok()?.modified().ok()?;
        let now = std::time::SystemTime::now();
        let age = now.duration_since(modified).ok()?;
        u64::try_from(age.as_millis()).ok()
    }

    pub fn save(&self, instance: &mut WorkflowInstance) -> Result<()> {
        instance.touch();
        let state_path = self.state_file_path(&instance.instance_id);
        let tmp_path = self.state_dir.join(format!(
            "{}.json.tmp.{}",
            instance.instance_id,
            std::process::id()
        ));
        let body = serde_json::to_vec_pretty(instance)?;
        {
            let mut file = OpenOptions::new()
                .create(true)
                .write(true)
                .truncate(true)
                .open(&tmp_path)?;
            file.write_all(&body)?;
            file.sync_all()?;
        }
        std::fs::rename(&tmp_path, &state_path)?;
        Ok(())
    }

    pub fn load(&self, instance_id: &str) -> Result<WorkflowInstance> {
        let state_path = self.state_file_path(instance_id);
        if !state_path.exists() {
            return Err(anyhow!(
                "Workflow instance '{}' not found at {}",
                instance_id,
                state_path.display()
            ));
        }
        let body = std::fs::read_to_string(&state_path)?;
        let instance: WorkflowInstance = serde_json::from_str(&body)?;
        Ok(instance)
    }

    pub fn list_instances(&self) -> Result<Vec<WorkflowInstance>> {
        let mut out = Vec::new();
        if !self.state_dir.exists() {
            return Ok(out);
        }
        for entry in std::fs::read_dir(&self.state_dir)? {
            let entry = entry?;
            let path = entry.path();
            if path.extension().and_then(|s| s.to_str()) != Some("json") {
                continue;
            }
            let body = match std::fs::read_to_string(&path) {
                Ok(v) => v,
                Err(_) => continue,
            };
            let parsed: WorkflowInstance = match serde_json::from_str(&body) {
                Ok(v) => v,
                Err(_) => continue,
            };
            out.push(parsed);
        }
        out.sort_by(|a, b| b.updated_at_ms.cmp(&a.updated_at_ms));
        Ok(out)
    }

    pub fn request_abort(&self, instance_id: &str) -> Result<()> {
        let marker = self.abort_file_path(instance_id);
        OpenOptions::new()
            .create(true)
            .write(true)
            .truncate(true)
            .open(marker)?;
        Ok(())
    }

    pub fn clear_abort_request(&self, instance_id: &str) -> Result<()> {
        let marker = self.abort_file_path(instance_id);
        if marker.exists() {
            std::fs::remove_file(marker)?;
        }
        Ok(())
    }

    pub fn is_abort_requested(&self, instance_id: &str) -> bool {
        self.abort_file_path(instance_id).exists()
    }
}

#[derive(Debug)]
pub struct WorkflowLockGuard {
    lock_path: PathBuf,
}

impl Drop for WorkflowLockGuard {
    fn drop(&mut self) {
        let _ = std::fs::remove_file(&self.lock_path);
    }
}

#[cfg(test)]
mod tests {
    use super::{LockFileMetadata, WorkflowStateStore};
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

    #[test]
    fn state_store_roundtrip() {
        let root = temp_root("agentic-sdlc-v2-state-test");
        let store = WorkflowStateStore::new(root.to_str().expect("path")).expect("store");

        let workflow = Workflow {
            meta: WorkflowMeta {
                name: "state-roundtrip".to_string(),
                domain: Some("demo".to_string()),
                goal: None,
                target_type: None,
                routing_policy: None,
                security_policy: None,
                resource_budget: None,
                projected_cost: None,
                projected_latency_ms: None,
                projected_steps: None,
            },
            steps: vec![WorkflowStep::new("s1", "demo.echo", "ok")],
        };
        let mut instance =
            crate::engine::v2::instance::WorkflowInstance::new(&workflow, Some("wf.md".into()));
        store.save(&mut instance).expect("save");
        let loaded = store.load(&instance.instance_id).expect("load");
        assert_eq!(loaded.workflow_name, "state-roundtrip");
        assert_eq!(loaded.schema, 1);

        let _ = std::fs::remove_dir_all(root);
    }

    #[test]
    fn reclaims_stale_repo_lock_when_pid_is_dead() {
        let root = temp_root("agentic-sdlc-v2-stale-lock");
        let store = WorkflowStateStore::new(root.to_str().expect("path")).expect("store");

        let lock_path = root.join(".agents").join("state").join("repo.lock");
        let stale = LockFileMetadata {
            scope: "repo".to_string(),
            pid: 999_999,
            started_at_ms: 0,
            hostname: "test".to_string(),
        };
        std::fs::write(
            &lock_path,
            serde_json::to_string_pretty(&stale).expect("json"),
        )
        .expect("write stale lock");

        let _guard = store.acquire_repo_lock().expect("reclaim stale repo lock");
        let metadata = WorkflowStateStore::read_lock_metadata(&lock_path).expect("metadata");
        assert_eq!(metadata.pid, std::process::id());

        let _ = std::fs::remove_dir_all(root);
    }

    #[test]
    fn active_repo_lock_is_not_reclaimed() {
        let root = temp_root("agentic-sdlc-v2-active-lock");
        let store = WorkflowStateStore::new(root.to_str().expect("path")).expect("store");

        let lock_path = root.join(".agents").join("state").join("repo.lock");
        let active = LockFileMetadata {
            scope: "repo".to_string(),
            pid: std::process::id(),
            started_at_ms: 0,
            hostname: "test".to_string(),
        };
        std::fs::write(
            &lock_path,
            serde_json::to_string_pretty(&active).expect("json"),
        )
        .expect("write active lock");

        let err = store
            .acquire_repo_lock()
            .expect_err("lock must remain held");
        let msg = err.to_string();
        assert!(msg.contains("already held"));

        let _ = std::fs::remove_dir_all(root);
    }
}
