// Process-based sandbox implementation
//
// Executes skills in isolated subprocess with resource monitoring and enforcement.

use super::{LimitViolation, ResourceLimits, ResourceMonitor, ResourceUsage, Sandbox, SandboxResult, SandboxType};
use crate::engine::budget::ExecutionError;
use crate::engine::context::ExecutionContext;
use crate::engine::security::SecurityViolationError;
use crate::skill::capability::SkillIOType;
use crate::skill::io::{SkillInput, SkillOutput};
use crate::skill::Skill;
use anyhow::{anyhow, Result};
use async_trait::async_trait;
use std::collections::HashSet;
use std::path::PathBuf;
use std::process::Stdio;
use std::sync::{Arc, Mutex};
use std::time::Duration;
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::process::Command;
use tokio::time::{sleep, Instant};

/// Process-based sandbox configuration
#[derive(Debug, Clone)]
pub struct ProcessSandboxConfig {
    /// Directory for sandbox execution
    pub sandbox_dir: PathBuf,
    /// Monitoring interval in milliseconds
    pub monitor_interval_ms: u64,
}

impl Default for ProcessSandboxConfig {
    fn default() -> Self {
        Self {
            sandbox_dir: PathBuf::from(".agents/sandbox/subprocess"),
            monitor_interval_ms: 20,
        }
    }
}

/// Process-based sandbox implementation
pub struct ProcessSandbox {
    config: ProcessSandboxConfig,
    active_children: Arc<Mutex<HashSet<u32>>>,
}

impl Default for ProcessSandbox {
    fn default() -> Self {
        Self::new(ProcessSandboxConfig::default())
    }
}

impl ProcessSandbox {
    /// Create new process sandbox with configuration
    pub fn new(config: ProcessSandboxConfig) -> Self {
        Self {
            config,
            active_children: Arc::new(Mutex::new(HashSet::new())),
        }
    }

    /// Create with custom sandbox directory
    pub fn with_sandbox_dir(sandbox_dir: impl Into<PathBuf>) -> Self {
        Self::new(ProcessSandboxConfig {
            sandbox_dir: sandbox_dir.into(),
            ..Default::default()
        })
    }

    /// Register active child process
    fn register_pid(&self, pid: Option<u32>) {
        if let Some(pid) = pid {
            self.active_children.lock().unwrap().insert(pid);
        }
    }

    /// Unregister child process
    fn unregister_pid(&self, pid: Option<u32>) {
        if let Some(pid) = pid {
            self.active_children.lock().unwrap().remove(&pid);
        }
    }

    /// Kill child process
    async fn kill_child(&self, child: &mut tokio::process::Child) {
        let _ = child.kill().await;
        let _ = child.wait().await;
    }

    /// Parse subprocess output based on skill output type
    fn parse_output(&self, output_type: SkillIOType, raw: &str) -> Result<SkillOutput> {
        match output_type {
            SkillIOType::Text => Ok(SkillOutput::text(raw.to_string())),
            SkillIOType::Number => Ok(SkillOutput::Number(raw.parse::<f64>().map_err(|_| {
                anyhow!("Failed to parse subprocess output as Number: '{}'", raw)
            })?)),
            SkillIOType::Boolean => Ok(SkillOutput::Boolean(raw.parse::<bool>().map_err(
                |_| anyhow!("Failed to parse subprocess output as Boolean: '{}'", raw),
            )?)),
            SkillIOType::Json => Ok(SkillOutput::Json(serde_json::from_str(raw).map_err(
                |_| anyhow!("Failed to parse subprocess output as JSON: '{}'", raw),
            )?)),
        }
    }
}

#[async_trait]
impl Sandbox for ProcessSandbox {
    async fn execute(
        &self,
        _domain: &str,
        qualified_skill: &str,
        skill: Arc<dyn Skill>,
        input: SkillInput,
        context: ExecutionContext,
        timeout: Duration,
        limits: ResourceLimits,
    ) -> Result<SandboxResult> {
        // Get subprocess command from skill
        let spec = skill.subprocess_command(&input).ok_or_else(|| {
            anyhow!(
                "Skill '{}' has no subprocess execution command configured",
                qualified_skill
            )
        })?;

        // Create sandbox directory
        std::fs::create_dir_all(&self.config.sandbox_dir)?;

        // Spawn subprocess
        let mut command = Command::new(&spec.program);
        command
            .args(spec.args.iter())
            .env_clear()
            .current_dir(&self.config.sandbox_dir)
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::piped());

        let mut child = command.spawn()?;
        let child_pid = child.id();
        self.register_pid(child_pid);

        // Check memory limit (0 means deny immediately)
        if limits.max_memory_mb == 0 {
            self.kill_child(&mut child).await;
            self.unregister_pid(child_pid);
            return Err(ExecutionError::resource_limit_exceeded("memory_mb", 0, 1).into());
        }

        // Write input to stdin
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

        // Monitor execution
        let started_at = Instant::now();
        let mut violations = Vec::new();
        let mut max_memory_seen = 0u32;
        let mut max_cpu_seen = 0.0f32;

        // Create resource monitor if we have a PID
        let monitor = child_pid.map(|pid| ResourceMonitor::new(pid, limits));

        let exit_status = loop {
            // Check if process finished
            if let Some(status) = child.try_wait()? {
                break status;
            }

            // Get current resource usage
            if let Some(ref mon) = monitor {
                match mon.current_usage().await {
                    Ok(usage) => {
                        max_memory_seen = max_memory_seen.max(usage.memory_mb);
                        max_cpu_seen = max_cpu_seen.max(usage.cpu_percent);

                        // Check for violations
                        if let Some(violation) = mon.check_limits(&usage) {
                            self.kill_child(&mut child).await;
                            self.unregister_pid(child_pid);
                            violations.push(violation.clone());

                            return Err(match violation {
                                LimitViolation::CpuExceeded { actual, limit } => {
                                    SecurityViolationError::new(
                                        &context.step_id,
                                        qualified_skill,
                                        "cpu_limit",
                                        format!("CPU limit exceeded: {:.1}% > {}%", actual, limit),
                                    )
                                    .into()
                                }
                                LimitViolation::MemoryExceeded { actual, limit } => {
                                    ExecutionError::resource_limit_exceeded(
                                        "memory_mb",
                                        u64::from(limit),
                                        u64::from(actual),
                                    )
                                    .into()
                                }
                                LimitViolation::TimeoutExceeded { actual, limit } => {
                                    SecurityViolationError::new(
                                        &context.step_id,
                                        qualified_skill,
                                        "timeout",
                                        format!("Timeout exceeded: {}ms > {}ms", actual, limit),
                                    )
                                    .into()
                                }
                            });
                        }
                    }
                    Err(_) => {
                        // Process might have exited, continue to check status
                    }
                }
            }

            sleep(Duration::from_millis(self.config.monitor_interval_ms)).await;
        };

        // Read output
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

        // Check exit status
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

        // Parse output
        let output = self.parse_output(skill.capability().output_type, &stdout_text)?;

        // Build result
        let elapsed_ms = started_at.elapsed().as_millis() as u64;
        let resource_usage = ResourceUsage {
            cpu_percent: max_cpu_seen,
            memory_mb: max_memory_seen,
            elapsed_ms,
        };

        Ok(SandboxResult {
            output,
            context,
            resource_usage,
            violations,
            exit_code: exit_status.code(),
            child_pid,
        })
    }

    fn is_available(&self) -> bool {
        // Process sandbox is always available on Unix-like systems
        cfg!(unix)
    }

    fn sandbox_type(&self) -> SandboxType {
        SandboxType::Process
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_process_sandbox_creation() {
        let sandbox = ProcessSandbox::default();
        assert!(sandbox.is_available());
        assert_eq!(sandbox.sandbox_type(), SandboxType::Process);
    }

    #[test]
    fn test_process_sandbox_with_custom_dir() {
        let sandbox = ProcessSandbox::with_sandbox_dir("/tmp/test-sandbox");
        assert_eq!(
            sandbox.config.sandbox_dir,
            PathBuf::from("/tmp/test-sandbox")
        );
    }

    #[test]
    fn test_resource_limits_default() {
        let limits = ResourceLimits::default();
        assert_eq!(limits.max_cpu_percent, 100);
        assert_eq!(limits.max_memory_mb, u32::MAX);
        assert_eq!(limits.max_execution_time_ms, u64::MAX);
    }

    #[test]
    fn test_resource_limits_custom() {
        let limits = ResourceLimits::new(50, 100, 5000);
        assert_eq!(limits.max_cpu_percent, 50);
        assert_eq!(limits.max_memory_mb, 100);
        assert_eq!(limits.max_execution_time_ms, 5000);
    }

    #[test]
    fn test_limit_violation_display() {
        let violation = LimitViolation::CpuExceeded {
            actual: 75.5,
            limit: 50,
        };
        assert_eq!(
            violation.to_string(),
            "CPU limit exceeded: 75.5% > 50%"
        );

        let violation = LimitViolation::MemoryExceeded {
            actual: 150,
            limit: 100,
        };
        assert_eq!(
            violation.to_string(),
            "Memory limit exceeded: 150MB > 100MB"
        );

        let violation = LimitViolation::TimeoutExceeded {
            actual: 6000,
            limit: 5000,
        };
        assert_eq!(
            violation.to_string(),
            "Timeout exceeded: 6000ms > 5000ms"
        );
    }
}
