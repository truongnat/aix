use crate::engine::budget::{ExecutionError, ResourceBudget, ResourceUsage};
use crate::engine::security::SecurityViolationError;
use crate::skill::capability::CapabilityPermissions;
use crate::skill::io::SkillOutput;
use anyhow::Result;
use std::collections::{HashMap, HashSet};

#[derive(Debug, Clone)]
pub struct ExecutionContext {
    #[allow(dead_code)]
    pub workflow_name: String,
    #[allow(dead_code)]
    pub project_root: String,
    #[allow(dead_code)]
    pub workflow_instance_id: String,
    pub step_id: String,
    pub skill_name: String,
    pub memory: HashMap<String, SkillOutput>,
    #[allow(dead_code)]
    pub completed_steps: HashSet<String>,
    pub effective_permissions: CapabilityPermissions,
    pub permissions_used: CapabilityPermissions,
    pub resource_budget: ResourceBudget,
    pub baseline_resource_usage: ResourceUsage,
    pub resource_usage: ResourceUsage,
}

impl Default for ExecutionContext {
    fn default() -> Self {
        Self {
            workflow_name: String::new(),
            project_root: String::new(),
            workflow_instance_id: String::new(),
            step_id: String::new(),
            skill_name: String::new(),
            memory: HashMap::new(),
            completed_steps: HashSet::new(),
            effective_permissions: CapabilityPermissions::none(),
            permissions_used: CapabilityPermissions::none(),
            resource_budget: ResourceBudget::unbounded(),
            baseline_resource_usage: ResourceUsage::default(),
            resource_usage: ResourceUsage::default(),
        }
    }
}

impl ExecutionContext {
    fn require_permission(&self, is_allowed: bool, action: &'static str) -> Result<()> {
        if is_allowed {
            return Ok(());
        }
        Err(SecurityViolationError::new(
            &self.step_id,
            &self.skill_name,
            action,
            format!("Permission '{}' is not granted for this step", action),
        )
        .into())
    }

    fn ensure_metric_u64(&self, metric: &'static str, limit: u64, actual: u64) -> Result<()> {
        if actual > limit {
            return Err(ExecutionError::resource_limit_exceeded(metric, limit, actual).into());
        }
        Ok(())
    }

    fn ensure_metric_u32(&self, metric: &'static str, limit: u32, actual: u32) -> Result<()> {
        self.ensure_metric_u64(metric, u64::from(limit), u64::from(actual))
    }

    fn projected_resource_usage(&self) -> ResourceUsage {
        self.baseline_resource_usage
            .saturating_added(&self.resource_usage)
    }

    pub fn record_time_usage(&mut self, wall_time_ms: u64, cpu_ms: u64) -> Result<()> {
        let projected = self.projected_resource_usage();
        self.ensure_metric_u64(
            "wall_time_ms",
            self.resource_budget.max_wall_time_ms,
            projected.wall_time_ms.saturating_add(wall_time_ms),
        )?;
        self.ensure_metric_u64(
            "cpu_ms",
            self.resource_budget.max_cpu_ms,
            projected.cpu_ms.saturating_add(cpu_ms),
        )?;
        self.resource_usage.wall_time_ms = self
            .resource_usage
            .wall_time_ms
            .saturating_add(wall_time_ms);
        self.resource_usage.cpu_ms = self.resource_usage.cpu_ms.saturating_add(cpu_ms);
        Ok(())
    }

    #[allow(dead_code)]
    pub fn resource_usage(&self) -> ResourceUsage {
        self.resource_usage.clone()
    }

    #[allow(dead_code)]
    pub fn permissions_used(&self) -> CapabilityPermissions {
        self.permissions_used
    }

    #[allow(dead_code)]
    pub fn require_fs_read(&mut self) -> Result<()> {
        self.require_permission(self.effective_permissions.allow_fs_read, "fs_read")?;
        let projected = self.projected_resource_usage();
        self.ensure_metric_u32(
            "fs_reads",
            self.resource_budget.max_fs_reads,
            projected.fs_reads.saturating_add(1),
        )?;
        self.resource_usage.fs_reads = self.resource_usage.fs_reads.saturating_add(1);
        self.permissions_used.allow_fs_read = true;
        Ok(())
    }

    #[allow(dead_code)]
    pub fn require_fs_write(&mut self) -> Result<()> {
        self.require_permission(self.effective_permissions.allow_fs_write, "fs_write")?;
        let projected = self.projected_resource_usage();
        self.ensure_metric_u32(
            "fs_writes",
            self.resource_budget.max_fs_writes,
            projected.fs_writes.saturating_add(1),
        )?;
        self.resource_usage.fs_writes = self.resource_usage.fs_writes.saturating_add(1);
        self.permissions_used.allow_fs_write = true;
        Ok(())
    }

    pub fn require_network(&mut self) -> Result<()> {
        self.require_permission(self.effective_permissions.allow_network, "network")?;
        let projected = self.projected_resource_usage();
        self.ensure_metric_u32(
            "network_calls",
            self.resource_budget.max_network_calls,
            projected.network_calls.saturating_add(1),
        )?;
        self.resource_usage.network_calls = self.resource_usage.network_calls.saturating_add(1);
        self.permissions_used.allow_network = true;
        Ok(())
    }

    #[allow(dead_code)]
    pub fn require_env(&mut self) -> Result<()> {
        self.require_permission(self.effective_permissions.allow_env, "env")?;
        self.permissions_used.allow_env = true;
        Ok(())
    }

    pub fn require_process_spawn(&mut self) -> Result<()> {
        self.require_permission(
            self.effective_permissions.allow_process_spawn,
            "process_spawn",
        )?;
        self.permissions_used.allow_process_spawn = true;
        Ok(())
    }
}
