#![allow(clippy::too_many_arguments)]

use crate::engine::context::ExecutionContext;
use crate::engine::sandbox::{ProcessSandbox, ResourceLimits, Sandbox};
use crate::skill::io::{SkillInput, SkillOutput};
use crate::skill::Skill;
use anyhow::Result;
use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::sync::Arc;
use std::time::Duration;

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
    sandbox: ProcessSandbox,
}

impl Default for SubprocessBackend {
    fn default() -> Self {
        Self::new(".agents/sandbox/subprocess")
    }
}

impl SubprocessBackend {
    pub fn new(sandbox_dir: impl Into<PathBuf>) -> Self {
        Self {
            sandbox: ProcessSandbox::with_sandbox_dir(sandbox_dir),
        }
    }
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
        domain: &str,
        qualified_skill: &str,
        skill: Arc<dyn Skill>,
        input: SkillInput,
        context: ExecutionContext,
        timeout_ms: u64,
        max_memory_mb: u32,
    ) -> Result<BackendExecutionResult> {
        // Use new sandbox implementation
        let limits = ResourceLimits::new(100, max_memory_mb, timeout_ms);
        let timeout = Duration::from_millis(timeout_ms);

        let result = self
            .sandbox
            .execute(domain, qualified_skill, skill, input, context, timeout, limits)
            .await?;

        Ok(BackendExecutionResult {
            output: result.output,
            context: result.context,
            backend_type: self.backend_type(),
            isolation_mode: self.isolation_mode(),
            child_pid: result.child_pid,
        })
    }
}
