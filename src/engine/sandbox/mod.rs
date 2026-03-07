// Sandbox module for skill execution isolation
//
// This module provides abstractions for executing skills in isolated environments
// with resource monitoring and enforcement.

#![allow(dead_code)]
use crate::engine::context::ExecutionContext;
use crate::skill::io::{SkillInput, SkillOutput};
use crate::skill::Skill;
use anyhow::Result;
use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use std::time::Duration;

pub mod monitor;
pub mod process;

pub use monitor::ResourceMonitor;
pub use process::ProcessSandbox;

/// Type of sandbox implementation
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum SandboxType {
    /// Process-based isolation (current implementation)
    Process,
    /// Docker container-based isolation (future)
    Docker,
}

/// Resource limits for sandbox execution
#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub struct ResourceLimits {
    /// Maximum CPU usage percentage (0-100)
    pub max_cpu_percent: u32,
    /// Maximum memory in MB
    pub max_memory_mb: u32,
    /// Maximum execution time in milliseconds
    pub max_execution_time_ms: u64,
}

impl Default for ResourceLimits {
    fn default() -> Self {
        Self {
            max_cpu_percent: 100,
            max_memory_mb: u32::MAX,
            max_execution_time_ms: u64::MAX,
        }
    }
}

impl ResourceLimits {
    pub fn new(max_cpu_percent: u32, max_memory_mb: u32, max_execution_time_ms: u64) -> Self {
        Self {
            max_cpu_percent,
            max_memory_mb,
            max_execution_time_ms,
        }
    }

    pub fn unbounded() -> Self {
        Self::default()
    }
}

/// Resource usage statistics
#[derive(Debug, Clone, Copy, Default, Serialize, Deserialize)]
pub struct ResourceUsage {
    /// CPU usage percentage
    pub cpu_percent: f32,
    /// Memory usage in MB
    pub memory_mb: u32,
    /// Elapsed time in milliseconds
    pub elapsed_ms: u64,
}

/// Type of resource limit violation
#[derive(Debug, Clone, Serialize, Deserialize)]
#[allow(clippy::enum_variant_names)]
pub enum LimitViolation {
    CpuExceeded { actual: f32, limit: u32 },
    MemoryExceeded { actual: u32, limit: u32 },
    TimeoutExceeded { actual: u64, limit: u64 },
}

impl std::fmt::Display for LimitViolation {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            LimitViolation::CpuExceeded { actual, limit } => {
                write!(f, "CPU limit exceeded: {:.1}% > {}%", actual, limit)
            }
            LimitViolation::MemoryExceeded { actual, limit } => {
                write!(f, "Memory limit exceeded: {}MB > {}MB", actual, limit)
            }
            LimitViolation::TimeoutExceeded { actual, limit } => {
                write!(f, "Timeout exceeded: {}ms > {}ms", actual, limit)
            }
        }
    }
}

/// Result of sandbox execution
#[derive(Debug)]
pub struct SandboxResult {
    /// Skill output
    pub output: SkillOutput,
    /// Execution context (updated)
    pub context: ExecutionContext,
    /// Resource usage statistics
    pub resource_usage: ResourceUsage,
    /// Resource limit violations (if any)
    pub violations: Vec<LimitViolation>,
    /// Process exit code (if applicable)
    pub exit_code: Option<i32>,
    /// Process ID (if applicable)
    pub child_pid: Option<u32>,
}

/// Trait for sandbox implementations
#[async_trait]
#[allow(clippy::too_many_arguments)]
pub trait Sandbox: Send + Sync {
    /// Execute skill in isolated environment
    async fn execute(
        &self,
        domain: &str,
        qualified_skill: &str,
        skill: Arc<dyn Skill>,
        input: SkillInput,
        context: ExecutionContext,
        timeout: Duration,
        limits: ResourceLimits,
    ) -> Result<SandboxResult>;

    /// Check if sandbox is available
    fn is_available(&self) -> bool;

    /// Get sandbox type
    fn sandbox_type(&self) -> SandboxType;
}
