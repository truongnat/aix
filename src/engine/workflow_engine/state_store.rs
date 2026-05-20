use crate::engine::workflow_engine::instance::{now_ms, WorkflowInstance};
use anyhow::{anyhow, Result};
use serde::{Deserialize, Serialize};
use std::fs::OpenOptions;
use std::io::{ErrorKind, Write};
use std::path::{Path, PathBuf};
#[cfg(unix)]
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
    std::env::var("AGENTIC_SDLC_STALE_LOCK_TIMEOUT_MS")
        .ok()
        .and_then(|v| v.trim().parse::<u64>().ok())
        .filter(|v| *v > 0)
        .unwrap_or(DEFAULT_STALE_LOCK_TIMEOUT_MS)
}

fn process_is_alive(pid: u32) -> bool {
    if pid == 0 {
        return false;
    }
    #[cfg(unix)]
    {
        Command::new("kill")
            .arg("-0")
            .arg(pid.to_string())
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .status()
            .map(|status| status.success())
            .unwrap_or(false)
    }
    #[cfg(windows)]
    {
        // On Windows, check if it's the current process or use OpenProcess
        if pid == std::process::id() {
            return true;
        }
        // Try to open process with query information rights
        // SAFETY: Windows API call with valid PID
        unsafe {
            use windows_sys::Win32::Foundation::CloseHandle;
            use windows_sys::Win32::System::Threading::OpenProcess;
            use windows_sys::Win32::System::Threading::PROCESS_QUERY_INFORMATION;
            let handle = OpenProcess(PROCESS_QUERY_INFORMATION, 0, pid);
            if handle == 0 {
                false
            } else {
                CloseHandle(handle);
                true
            }
        }
    }
}

#[derive(Debug, Clone)]
pub struct WorkflowStateStore {
    state_dir: PathBuf,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum ManualApprovalDecisionKind {
    Approved,
    Rejected,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct ManualApprovalDecision {
    pub instance_id: String,
    pub step_id: String,
    pub decision: ManualApprovalDecisionKind,
    pub approver: String,
    #[serde(default)]
    pub note: Option<String>,
    pub decided_at_ms: u64,
}

impl WorkflowStateStore {
    pub fn new(project_root: &str) -> Result<Self> {
        let state_dir = Path::new(project_root).join(".agents").join("state");
        std::fs::create_dir_all(&state_dir)?;
        let store = Self { state_dir };
        store.cleanup_stale_runtime_artifacts()?;
        Ok(store)
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

    fn approval_file_path(&self, instance_id: &str, step_id: &str) -> PathBuf {
        let safe_instance = sanitize_file_fragment(instance_id);
        let safe_step = sanitize_file_fragment(step_id);
        self.state_dir
            .join(format!("{}.{}.approval.json", safe_instance, safe_step))
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
        out.sort_by_key(|instance| std::cmp::Reverse(instance.updated_at_ms));
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

    pub fn record_manual_approval_decision(
        &self,
        instance_id: &str,
        step_id: &str,
        decision: ManualApprovalDecisionKind,
        approver: Option<&str>,
        note: Option<&str>,
    ) -> Result<ManualApprovalDecision> {
        let normalized_instance = instance_id.trim();
        if normalized_instance.is_empty() {
            return Err(anyhow!("instance_id is required"));
        }
        let normalized_step = step_id.trim();
        if normalized_step.is_empty() {
            return Err(anyhow!("step_id is required"));
        }
        let approver = approver
            .map(str::trim)
            .filter(|v| !v.is_empty())
            .map(ToString::to_string)
            .or_else(|| {
                std::env::var("USER")
                    .ok()
                    .map(|v| v.trim().to_string())
                    .filter(|v| !v.is_empty())
            })
            .unwrap_or_else(|| "operator".to_string());
        let note = note
            .map(str::trim)
            .filter(|v| !v.is_empty())
            .map(str::to_string);

        let payload = ManualApprovalDecision {
            instance_id: normalized_instance.to_string(),
            step_id: normalized_step.to_string(),
            decision,
            approver,
            note,
            decided_at_ms: now_ms(),
        };
        let path = self.approval_file_path(normalized_instance, normalized_step);
        let body = serde_json::to_vec_pretty(&payload)?;
        let mut file = OpenOptions::new()
            .create(true)
            .write(true)
            .truncate(true)
            .open(path)?;
        file.write_all(&body)?;
        file.write_all(b"\n")?;
        file.sync_all()?;
        Ok(payload)
    }

    pub fn load_manual_approval_decision(
        &self,
        instance_id: &str,
        step_id: &str,
    ) -> Result<Option<ManualApprovalDecision>> {
        let normalized_instance = instance_id.trim();
        if normalized_instance.is_empty() {
            return Ok(None);
        }
        let normalized_step = step_id.trim();
        if normalized_step.is_empty() {
            return Ok(None);
        }
        let path = self.approval_file_path(normalized_instance, normalized_step);
        if !path.exists() {
            return Ok(None);
        }
        let body = std::fs::read_to_string(path)?;
        let payload: ManualApprovalDecision = serde_json::from_str(&body)?;
        Ok(Some(payload))
    }

    pub fn cleanup_stale_runtime_artifacts(&self) -> Result<usize> {
        let mut removed = 0usize;
        if !self.state_dir.exists() {
            return Ok(removed);
        }

        for entry in std::fs::read_dir(&self.state_dir)? {
            let entry = entry?;
            let path = entry.path();
            let Some(file_name) = path.file_name().and_then(|value| value.to_str()) else {
                continue;
            };

            if file_name == "repo.lock" || file_name.ends_with(".lock") {
                if Self::try_reclaim_stale_lock(&path)? {
                    removed = removed.saturating_add(1);
                }
                continue;
            }

            if let Some(pid) = Self::tmp_file_pid(file_name) {
                let stale = !process_is_alive(pid)
                    || Self::lock_age_ms(&path)
                        .map(|age| age > stale_lock_timeout_ms())
                        .unwrap_or(false);
                if stale {
                    match std::fs::remove_file(&path) {
                        Ok(()) => removed = removed.saturating_add(1),
                        Err(err) if err.kind() == ErrorKind::NotFound => {}
                        Err(err) => {
                            return Err(anyhow!(
                                "Failed to remove stale tmp file '{}': {}",
                                path.display(),
                                err
                            ));
                        }
                    }
                }
            }
        }

        Ok(removed)
    }

    fn tmp_file_pid(file_name: &str) -> Option<u32> {
        let (_, pid) = file_name.rsplit_once(".json.tmp.")?;
        pid.trim().parse::<u32>().ok()
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

fn sanitize_file_fragment(value: &str) -> String {
    let mut out = String::new();
    for ch in value.trim().chars() {
        let normalized = match ch {
            'a'..='z' | 'A'..='Z' | '0'..='9' | '_' | '-' => ch,
            _ => '-',
        };
        out.push(normalized);
    }
    let compact = out
        .split('-')
        .filter(|part| !part.is_empty())
        .collect::<Vec<_>>()
        .join("-");
    if compact.is_empty() {
        "unknown".to_string()
    } else {
        compact
    }
}

#[cfg(test)]
mod tests {
    use super::{LockFileMetadata, ManualApprovalDecisionKind, WorkflowStateStore};
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
        let mut instance = crate::engine::workflow_engine::instance::WorkflowInstance::new(
            &workflow,
            Some("wf.md".into()),
        );
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
    fn cleanup_removes_stale_tmp_files_for_dead_pid() {
        let root = temp_root("agentic-sdlc-v2-stale-tmp");
        let store = WorkflowStateStore::new(root.to_str().expect("path")).expect("store");
        let tmp_path = root
            .join(".agents")
            .join("state")
            .join("starter-app-builder-1.json.tmp.999999");
        std::fs::write(&tmp_path, b"partial-state").expect("write tmp");

        let removed = store
            .cleanup_stale_runtime_artifacts()
            .expect("cleanup stale artifacts");
        assert_eq!(removed, 1);
        assert!(!tmp_path.exists());

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

    #[test]
    fn manual_approval_decision_roundtrip() {
        let root = temp_root("agentic-sdlc-v2-manual-approval");
        let store = WorkflowStateStore::new(root.to_str().expect("path")).expect("store");

        let saved = store
            .record_manual_approval_decision(
                "run-123",
                "release_gate",
                ManualApprovalDecisionKind::Approved,
                Some("qa.lead"),
                Some("validated release checklist"),
            )
            .expect("record approval");
        assert_eq!(saved.instance_id, "run-123");
        assert_eq!(saved.step_id, "release_gate");
        assert_eq!(saved.approver, "qa.lead");
        assert_eq!(saved.note.as_deref(), Some("validated release checklist"));

        let loaded = store
            .load_manual_approval_decision("run-123", "release_gate")
            .expect("load approval")
            .expect("approval exists");
        assert_eq!(loaded.decision, ManualApprovalDecisionKind::Approved);
        assert_eq!(loaded.approver, "qa.lead");

        let _ = std::fs::remove_dir_all(root);
    }
}
