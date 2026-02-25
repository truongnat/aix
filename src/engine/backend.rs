#![allow(clippy::too_many_arguments)]

use crate::engine::budget::ExecutionError;
use crate::engine::context::ExecutionContext;
use crate::engine::security::SecurityViolationError;
use crate::skill::capability::SkillIOType;
use crate::skill::io::{SkillInput, SkillOutput};
use crate::skill::Skill;
use anyhow::{anyhow, Result};
use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use std::collections::HashSet;
use std::path::PathBuf;
use std::process::Stdio;
use std::sync::{Arc, Mutex};
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::process::Command;
use tokio::time::{sleep, Duration, Instant};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum BackendType {
    InProcess,
    Subprocess,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum IsolationMode {
    InProcess,
    SubprocessSandbox,
}

#[derive(Debug, Clone)]
pub struct BackendExecutionResult {
    pub output: SkillOutput,
    pub context: ExecutionContext,
    pub backend_type: BackendType,
    pub isolation_mode: IsolationMode,
    pub child_pid: Option<u32>,
}

#[async_trait]
pub trait ExecutionBackend: Send + Sync {
    fn backend_type(&self) -> BackendType;
    fn isolation_mode(&self) -> IsolationMode;

    async fn execute(
        &self,
        domain: &str,
        qualified_skill: &str,
        skill: Arc<dyn Skill>,
        input: SkillInput,
        context: ExecutionContext,
        timeout_ms: u64,
        max_memory_mb: u32,
    ) -> Result<BackendExecutionResult>;
}

pub struct InProcessBackend;

#[async_trait]
impl ExecutionBackend for InProcessBackend {
    fn backend_type(&self) -> BackendType {
        BackendType::InProcess
    }

    fn isolation_mode(&self) -> IsolationMode {
        IsolationMode::InProcess
    }

    async fn execute(
        &self,
        _domain: &str,
        _qualified_skill: &str,
        skill: Arc<dyn Skill>,
        input: SkillInput,
        mut context: ExecutionContext,
        _timeout_ms: u64,
        _max_memory_mb: u32,
    ) -> Result<BackendExecutionResult> {
        let output = skill.execute(input, &mut context).await?;
        Ok(BackendExecutionResult {
            output,
            context,
            backend_type: self.backend_type(),
            isolation_mode: self.isolation_mode(),
            child_pid: None,
        })
    }
}

pub struct SubprocessBackend {
    sandbox_dir: PathBuf,
    active_children: Arc<Mutex<HashSet<u32>>>,
}

impl Default for SubprocessBackend {
    fn default() -> Self {
        Self::new(".agent/sandbox/subprocess")
    }
}

impl SubprocessBackend {
    pub fn new(sandbox_dir: impl Into<PathBuf>) -> Self {
        Self {
            sandbox_dir: sandbox_dir.into(),
            active_children: Arc::new(Mutex::new(HashSet::new())),
        }
    }

    fn register_pid(&self, pid: Option<u32>) {
        if let Some(pid) = pid {
            self.active_children.lock().unwrap().insert(pid);
        }
    }

    fn unregister_pid(&self, pid: Option<u32>) {
        if let Some(pid) = pid {
            self.active_children.lock().unwrap().remove(&pid);
        }
    }
}

async fn kill_child(child: &mut tokio::process::Child) {
    let _ = child.kill().await;
    let _ = child.wait().await;
}

fn parse_output(output_type: SkillIOType, raw: &str) -> Result<SkillOutput> {
    match output_type {
        SkillIOType::Text => Ok(SkillOutput::text(raw.to_string())),
        SkillIOType::Number => {
            Ok(SkillOutput::Number(raw.parse::<f64>().map_err(|_| {
                anyhow!("Failed to parse subprocess output as Number: '{}'", raw)
            })?))
        }
        SkillIOType::Boolean => {
            Ok(SkillOutput::Boolean(raw.parse::<bool>().map_err(|_| {
                anyhow!("Failed to parse subprocess output as Boolean: '{}'", raw)
            })?))
        }
        SkillIOType::Json => Ok(SkillOutput::Json(
            serde_json::from_str(raw)
                .map_err(|_| anyhow!("Failed to parse subprocess output as JSON: '{}'", raw))?,
        )),
    }
}

async fn process_memory_mb(pid: u32) -> Result<u64> {
    let output = Command::new("ps")
        .arg("-o")
        .arg("rss=")
        .arg("-p")
        .arg(pid.to_string())
        .output()
        .await?;

    if !output.status.success() {
        return Ok(0);
    }

    let rss_kb = String::from_utf8_lossy(&output.stdout)
        .trim()
        .parse::<u64>()
        .unwrap_or(0);
    Ok((rss_kb.saturating_add(1023)) / 1024)
}

#[async_trait]
impl ExecutionBackend for SubprocessBackend {
    fn backend_type(&self) -> BackendType {
        BackendType::Subprocess
    }

    fn isolation_mode(&self) -> IsolationMode {
        IsolationMode::SubprocessSandbox
    }

    async fn execute(
        &self,
        _domain: &str,
        qualified_skill: &str,
        skill: Arc<dyn Skill>,
        input: SkillInput,
        context: ExecutionContext,
        timeout_ms: u64,
        max_memory_mb: u32,
    ) -> Result<BackendExecutionResult> {
        let spec = skill.subprocess_command(&input).ok_or_else(|| {
            anyhow!(
                "Skill '{}' has no subprocess execution command configured",
                qualified_skill
            )
        })?;

        std::fs::create_dir_all(&self.sandbox_dir)?;

        let mut command = Command::new(&spec.program);
        command
            .args(spec.args.iter())
            .env_clear()
            .current_dir(&self.sandbox_dir)
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::piped());

        let mut child = command.spawn()?;
        let child_pid = child.id();
        self.register_pid(child_pid);

        if max_memory_mb == 0 {
            kill_child(&mut child).await;
            self.unregister_pid(child_pid);
            return Err(ExecutionError::resource_limit_exceeded("memory_mb", 0, 1).into());
        }

        if let Some(stdin_text) = spec.stdin {
            if let Some(mut stdin) = child.stdin.take() {
                stdin.write_all(stdin_text.as_bytes()).await?;
                stdin.flush().await?;
            }
        } else if let Some(mut stdin) = child.stdin.take() {
            if let Some(text_input) = input.as_text() {
                stdin.write_all(text_input.as_bytes()).await?;
            }
            stdin.flush().await?;
        }

        let started_at = Instant::now();
        let exit_status = loop {
            if let Some(status) = child.try_wait()? {
                break status;
            }

            if started_at.elapsed().as_millis() > u128::from(timeout_ms) {
                kill_child(&mut child).await;
                self.unregister_pid(child_pid);
                return Err(SecurityViolationError::new(
                    &context.step_id,
                    qualified_skill,
                    "timeout",
                    format!("Subprocess execution exceeded {}ms timeout", timeout_ms),
                )
                .into());
            }

            if max_memory_mb != u32::MAX {
                if let Some(pid) = child_pid {
                    let memory_mb = process_memory_mb(pid).await.unwrap_or(0);
                    if memory_mb > u64::from(max_memory_mb) {
                        kill_child(&mut child).await;
                        self.unregister_pid(child_pid);
                        return Err(ExecutionError::resource_limit_exceeded(
                            "memory_mb",
                            u64::from(max_memory_mb),
                            memory_mb,
                        )
                        .into());
                    }
                }
            }

            sleep(Duration::from_millis(20)).await;
        };

        let mut stdout_bytes = Vec::new();
        if let Some(mut stdout) = child.stdout.take() {
            stdout.read_to_end(&mut stdout_bytes).await?;
        }
        let mut stderr_bytes = Vec::new();
        if let Some(mut stderr) = child.stderr.take() {
            stderr.read_to_end(&mut stderr_bytes).await?;
        }
        self.unregister_pid(child_pid);

        let stdout_text = String::from_utf8_lossy(&stdout_bytes).trim().to_string();
        let stderr_text = String::from_utf8_lossy(&stderr_bytes).trim().to_string();

        if !exit_status.success() {
            return Err(anyhow!(
                "Subprocess for '{}' exited with status {}. stderr: {}",
                qualified_skill,
                exit_status
                    .code()
                    .map(|code| code.to_string())
                    .unwrap_or_else(|| "terminated".to_string()),
                stderr_text
            ));
        }

        let output = parse_output(skill.capability().output_type, &stdout_text)?;
        Ok(BackendExecutionResult {
            output,
            context,
            backend_type: self.backend_type(),
            isolation_mode: self.isolation_mode(),
            child_pid,
        })
    }
}
