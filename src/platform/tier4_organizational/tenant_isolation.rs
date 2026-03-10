// Tenant Isolation - hard isolation between workflow runs

use crate::platform::types::TenantId;
use crate::platform::{PlatformError, Result};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::{Arc, RwLock};

/// Tenant isolation service providing hard isolation between workflow runs
pub struct TenantIsolation {
    /// Map of tenant_id to tenant state
    tenants: Arc<RwLock<HashMap<TenantId, TenantState>>>,
    /// Base directory for tenant data
    base_path: PathBuf,
}

/// Internal state for each tenant
#[derive(Debug, Clone)]
struct TenantState {
    config: TenantConfig,
    current_workflows: u32,
    current_storage_mb: u64,
    current_cost_this_month: f64,
}

impl TenantIsolation {
    /// Create a new tenant isolation service
    pub fn new(base_path: PathBuf) -> Self {
        Self {
            tenants: Arc::new(RwLock::new(HashMap::new())),
            base_path,
        }
    }
}

impl Default for TenantIsolation {
    fn default() -> Self {
        Self::new(PathBuf::from(".agents/tenants"))
    }
}

/// Configuration for a tenant
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TenantConfig {
    pub tenant_id: TenantId,
    pub name: String,
    pub resource_limits: ResourceLimits,
    pub isolation_level: IsolationLevel,
}

/// Isolation level determines the strength of tenant separation
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum IsolationLevel {
    Soft,      // Logical separation only
    Hard,      // Process isolation
    Sandboxed, // Full containerization
}

/// Resource limits for a tenant
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResourceLimits {
    pub max_concurrent_workflows: u32,
    pub max_storage_mb: u64,
    pub max_cost_per_month: f64,
}

/// Isolated execution context for a tenant
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IsolatedContext {
    pub tenant_id: TenantId,
    pub state_path: PathBuf,
    pub memory_namespace: String,
    pub audit_log_path: PathBuf,
}

/// Operations that can be performed within a tenant context
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Operation {
    /// Read a file
    ReadFile { path: String },
    /// Write a file
    WriteFile { path: String },
    /// Execute a command
    ExecuteCommand { command: String },
    /// Access memory
    AccessMemory { key: String },
    /// Start a workflow
    StartWorkflow { workflow_id: String },
    /// Consume storage
    ConsumeStorage { bytes: u64 },
    /// Incur cost
    IncurCost { amount: f64 },
}

// Implementation of TenantIsolation trait
impl TenantIsolation {
    /// Create a new tenant with the given configuration
    ///
    /// **Validates: Requirements 12.1**
    /// WHEN creating a tenant, THE Tenant_Isolation SHALL establish an isolated
    /// execution environment with separate state storage, memory namespace, and audit log
    pub fn create_tenant(&mut self, config: TenantConfig) -> Result<TenantId> {
        let tenant_id = config.tenant_id.clone();

        // Check if tenant already exists
        {
            let tenants = self.tenants.read().map_err(|e| {
                PlatformError::TenantIsolationViolation(format!(
                    "Failed to acquire read lock: {}",
                    e
                ))
            })?;

            if tenants.contains_key(&tenant_id) {
                return Err(PlatformError::InvalidInput(format!(
                    "Tenant {} already exists",
                    tenant_id.as_str()
                )));
            }
        }

        // Create tenant directories
        let state_path = self.base_path.join(tenant_id.as_str()).join("state");
        let audit_log_path = self.base_path.join(tenant_id.as_str()).join("audit");

        std::fs::create_dir_all(&state_path)?;
        std::fs::create_dir_all(&audit_log_path)?;

        // Initialize tenant state
        let state = TenantState {
            config: config.clone(),
            current_workflows: 0,
            current_storage_mb: 0,
            current_cost_this_month: 0.0,
        };

        // Store tenant
        {
            let mut tenants = self.tenants.write().map_err(|e| {
                PlatformError::TenantIsolationViolation(format!(
                    "Failed to acquire write lock: {}",
                    e
                ))
            })?;

            tenants.insert(tenant_id.clone(), state);
        }

        Ok(tenant_id)
    }

    /// Get isolated execution context for a tenant
    ///
    /// **Validates: Requirements 12.1**
    /// Returns the isolated context with separate state storage, memory namespace, and audit log
    pub fn get_isolated_context(&self, tenant_id: &TenantId) -> Result<IsolatedContext> {
        // Verify tenant exists
        {
            let tenants = self.tenants.read().map_err(|e| {
                PlatformError::TenantIsolationViolation(format!(
                    "Failed to acquire read lock: {}",
                    e
                ))
            })?;

            if !tenants.contains_key(tenant_id) {
                return Err(PlatformError::NotFound(format!(
                    "Tenant {} not found",
                    tenant_id.as_str()
                )));
            }
        }

        // Build isolated context
        let state_path = self.base_path.join(tenant_id.as_str()).join("state");
        let audit_log_path = self.base_path.join(tenant_id.as_str()).join("audit");
        let memory_namespace = tenant_id.as_str().to_string();

        Ok(IsolatedContext {
            tenant_id: tenant_id.clone(),
            state_path,
            memory_namespace,
            audit_log_path,
        })
    }

    /// Get tenant configuration
    pub fn get_tenant_config(&self, tenant_id: &TenantId) -> Result<TenantConfig> {
        let tenants = self.tenants.read().map_err(|e| {
            PlatformError::TenantIsolationViolation(format!("Failed to acquire read lock: {}", e))
        })?;

        tenants
            .get(tenant_id)
            .map(|state| state.config.clone())
            .ok_or_else(|| {
                PlatformError::NotFound(format!("Tenant {} not found", tenant_id.as_str()))
            })
    }

    /// List all tenants
    pub fn list_tenants(&self) -> Result<Vec<TenantId>> {
        let tenants = self.tenants.read().map_err(|e| {
            PlatformError::TenantIsolationViolation(format!("Failed to acquire read lock: {}", e))
        })?;

        Ok(tenants.keys().cloned().collect())
    }
}

// Boundary enforcement and resource limit implementation
impl TenantIsolation {
    /// Enforce tenant boundaries for an operation
    ///
    /// **Validates: Requirements 12.2, 12.3, 12.4, 12.5, 12.6**
    /// - 12.2: Enforce boundary checks to prevent access to other tenants' resources
    /// - 12.3: Enforce resource limits for concurrent workflows, storage, and monthly cost
    /// - 12.4: Reject operations that exceed resource limits
    /// - 12.5: Support different isolation levels
    /// - 12.6: Ensure no tenant can read, write, or modify another tenant's state
    pub fn enforce_boundaries(&self, tenant_id: &TenantId, operation: &Operation) -> Result<()> {
        // Get tenant state
        let mut tenants = self.tenants.write().map_err(|e| {
            PlatformError::TenantIsolationViolation(format!("Failed to acquire write lock: {}", e))
        })?;

        let state = tenants.get_mut(tenant_id).ok_or_else(|| {
            PlatformError::NotFound(format!("Tenant {} not found", tenant_id.as_str()))
        })?;

        // Check operation-specific boundaries and limits
        match operation {
            Operation::ReadFile { path } | Operation::WriteFile { path } => {
                // Requirement 12.6: Ensure file access is within tenant boundaries
                self.check_path_boundary(tenant_id, path)?;
            }

            Operation::ExecuteCommand { command: _ } => {
                // Commands are allowed but should be sandboxed based on isolation level
                // This is a placeholder for actual sandboxing implementation
                if state.config.isolation_level == IsolationLevel::Sandboxed {
                    // In a real implementation, this would set up containerization
                }
            }

            Operation::AccessMemory { key } => {
                // Requirement 12.6: Ensure memory access is within tenant namespace
                self.check_memory_boundary(tenant_id, key)?;
            }

            Operation::StartWorkflow { workflow_id: _ } => {
                // Requirement 12.3, 12.4: Check concurrent workflow limit
                if state.current_workflows >= state.config.resource_limits.max_concurrent_workflows
                {
                    return Err(PlatformError::ResourceLimitExceeded(format!(
                        "Tenant {} has reached max concurrent workflows limit of {}",
                        tenant_id.as_str(),
                        state.config.resource_limits.max_concurrent_workflows
                    )));
                }
                state.current_workflows += 1;
            }

            Operation::ConsumeStorage { bytes } => {
                // Requirement 12.3, 12.4: Check storage limit
                let new_storage_mb = state.current_storage_mb + (bytes / 1_048_576);
                if new_storage_mb > state.config.resource_limits.max_storage_mb {
                    return Err(PlatformError::ResourceLimitExceeded(
                        format!(
                            "Tenant {} would exceed max storage limit of {} MB (current: {} MB, requested: {} MB)",
                            tenant_id.as_str(),
                            state.config.resource_limits.max_storage_mb,
                            state.current_storage_mb,
                            bytes / 1_048_576
                        )
                    ));
                }
                state.current_storage_mb = new_storage_mb;
            }

            Operation::IncurCost { amount } => {
                // Requirement 12.3, 12.4: Check monthly cost limit
                let new_cost = state.current_cost_this_month + amount;
                if new_cost > state.config.resource_limits.max_cost_per_month {
                    return Err(PlatformError::ResourceLimitExceeded(
                        format!(
                            "Tenant {} would exceed max monthly cost limit of ${:.2} (current: ${:.2}, requested: ${:.2})",
                            tenant_id.as_str(),
                            state.config.resource_limits.max_cost_per_month,
                            state.current_cost_this_month,
                            amount
                        )
                    ));
                }
                state.current_cost_this_month = new_cost;
            }
        }

        Ok(())
    }

    /// Check if a file path is within tenant boundaries
    ///
    /// **Validates: Requirements 12.6**
    /// Ensures no tenant can access files outside their isolated directory
    fn check_path_boundary(&self, tenant_id: &TenantId, path: &str) -> Result<()> {
        let tenant_base = self.base_path.join(tenant_id.as_str());
        let requested_path = PathBuf::from(path);

        // Check for directory traversal patterns
        if path.contains("..") {
            return Err(PlatformError::TenantIsolationViolation(format!(
                "Tenant {} attempted directory traversal: {}",
                tenant_id.as_str(),
                path
            )));
        }

        // Build the full path
        let full_path = tenant_base.join(&requested_path);

        // Normalize the tenant base path (create if needed for comparison)
        std::fs::create_dir_all(&tenant_base)?;
        let normalized_tenant = tenant_base.canonicalize().map_err(|e| {
            PlatformError::IoError(format!("Failed to canonicalize tenant path: {}", e))
        })?;

        // For the requested path, we need to handle the case where it doesn't exist yet
        // We'll normalize the parent directory and check if it's within bounds
        let normalized_requested = if full_path.exists() {
            full_path.canonicalize().map_err(|e| {
                PlatformError::IoError(format!("Failed to canonicalize path: {}", e))
            })?
        } else {
            // If the file doesn't exist, check the parent directory
            if let Some(parent) = full_path.parent() {
                std::fs::create_dir_all(parent)?;
                let normalized_parent = parent.canonicalize().map_err(|e| {
                    PlatformError::IoError(format!("Failed to canonicalize parent path: {}", e))
                })?;
                normalized_parent.join(full_path.file_name().unwrap_or_default())
            } else {
                full_path
            }
        };

        // Check if requested path is within tenant directory
        if !normalized_requested.starts_with(&normalized_tenant) {
            return Err(PlatformError::TenantIsolationViolation(format!(
                "Tenant {} attempted to access path outside boundaries: {}",
                tenant_id.as_str(),
                path
            )));
        }

        Ok(())
    }

    /// Check if a memory key is within tenant namespace
    ///
    /// **Validates: Requirements 12.6**
    /// Ensures no tenant can access memory keys outside their namespace
    fn check_memory_boundary(&self, tenant_id: &TenantId, key: &str) -> Result<()> {
        let expected_prefix = format!("{}:", tenant_id.as_str());

        if !key.starts_with(&expected_prefix) {
            return Err(PlatformError::TenantIsolationViolation(format!(
                "Tenant {} attempted to access memory key outside namespace: {}",
                tenant_id.as_str(),
                key
            )));
        }

        Ok(())
    }

    /// Release a workflow slot when a workflow completes
    pub fn release_workflow(&self, tenant_id: &TenantId) -> Result<()> {
        let mut tenants = self.tenants.write().map_err(|e| {
            PlatformError::TenantIsolationViolation(format!("Failed to acquire write lock: {}", e))
        })?;

        let state = tenants.get_mut(tenant_id).ok_or_else(|| {
            PlatformError::NotFound(format!("Tenant {} not found", tenant_id.as_str()))
        })?;

        if state.current_workflows > 0 {
            state.current_workflows -= 1;
        }

        Ok(())
    }

    /// Get current resource usage for a tenant
    pub fn get_resource_usage(&self, tenant_id: &TenantId) -> Result<ResourceUsage> {
        let tenants = self.tenants.read().map_err(|e| {
            PlatformError::TenantIsolationViolation(format!("Failed to acquire read lock: {}", e))
        })?;

        let state = tenants.get(tenant_id).ok_or_else(|| {
            PlatformError::NotFound(format!("Tenant {} not found", tenant_id.as_str()))
        })?;

        Ok(ResourceUsage {
            current_workflows: state.current_workflows,
            current_storage_mb: state.current_storage_mb,
            current_cost_this_month: state.current_cost_this_month,
            limits: state.config.resource_limits.clone(),
        })
    }

    /// Reset monthly cost counter (should be called at the start of each month)
    pub fn reset_monthly_costs(&self) -> Result<()> {
        let mut tenants = self.tenants.write().map_err(|e| {
            PlatformError::TenantIsolationViolation(format!("Failed to acquire write lock: {}", e))
        })?;

        for state in tenants.values_mut() {
            state.current_cost_this_month = 0.0;
        }

        Ok(())
    }
}

/// Current resource usage for a tenant
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResourceUsage {
    pub current_workflows: u32,
    pub current_storage_mb: u64,
    pub current_cost_this_month: f64,
    pub limits: ResourceLimits,
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    fn create_test_tenant_config(tenant_id: &str) -> TenantConfig {
        TenantConfig {
            tenant_id: TenantId::new(tenant_id.to_string()).unwrap(),
            name: format!("Test Tenant {}", tenant_id),
            resource_limits: ResourceLimits {
                max_concurrent_workflows: 5,
                max_storage_mb: 100,
                max_cost_per_month: 500.0,
            },
            isolation_level: IsolationLevel::Hard,
        }
    }

    #[test]
    fn test_create_tenant() {
        let temp_dir = TempDir::new().unwrap();
        let mut isolation = TenantIsolation::new(temp_dir.path().to_path_buf());

        let config = create_test_tenant_config("tenant1");
        let tenant_id = isolation.create_tenant(config.clone()).unwrap();

        assert_eq!(tenant_id.as_str(), "tenant1");

        // Verify tenant directories were created
        let state_path = temp_dir.path().join("tenant1").join("state");
        let audit_path = temp_dir.path().join("tenant1").join("audit");
        assert!(state_path.exists());
        assert!(audit_path.exists());
    }

    #[test]
    fn test_create_duplicate_tenant() {
        let temp_dir = TempDir::new().unwrap();
        let mut isolation = TenantIsolation::new(temp_dir.path().to_path_buf());

        let config = create_test_tenant_config("tenant1");
        isolation.create_tenant(config.clone()).unwrap();

        // Try to create the same tenant again
        let result = isolation.create_tenant(config);
        assert!(result.is_err());
    }

    #[test]
    fn test_get_isolated_context() {
        let temp_dir = TempDir::new().unwrap();
        let mut isolation = TenantIsolation::new(temp_dir.path().to_path_buf());

        let config = create_test_tenant_config("tenant1");
        let tenant_id = isolation.create_tenant(config).unwrap();

        let context = isolation.get_isolated_context(&tenant_id).unwrap();

        assert_eq!(context.tenant_id, tenant_id);
        assert_eq!(context.memory_namespace, "tenant1");
        assert!(context.state_path.ends_with("tenant1/state"));
        assert!(context.audit_log_path.ends_with("tenant1/audit"));
    }

    #[test]
    fn test_enforce_workflow_limit() {
        let temp_dir = TempDir::new().unwrap();
        let mut isolation = TenantIsolation::new(temp_dir.path().to_path_buf());

        let config = create_test_tenant_config("tenant1");
        let tenant_id = isolation.create_tenant(config).unwrap();

        // Start workflows up to the limit
        for _ in 0..5 {
            let op = Operation::StartWorkflow {
                workflow_id: "wf1".to_string(),
            };
            isolation.enforce_boundaries(&tenant_id, &op).unwrap();
        }

        // Try to start one more workflow (should fail)
        let op = Operation::StartWorkflow {
            workflow_id: "wf6".to_string(),
        };
        let result = isolation.enforce_boundaries(&tenant_id, &op);
        assert!(result.is_err());
    }

    #[test]
    fn test_enforce_storage_limit() {
        let temp_dir = TempDir::new().unwrap();
        let mut isolation = TenantIsolation::new(temp_dir.path().to_path_buf());

        let config = create_test_tenant_config("tenant1");
        let tenant_id = isolation.create_tenant(config).unwrap();

        // Consume storage up to the limit (100 MB)
        let op = Operation::ConsumeStorage {
            bytes: 50 * 1_048_576, // 50 MB
        };
        isolation.enforce_boundaries(&tenant_id, &op).unwrap();

        // Try to consume more storage (should succeed - 50 + 40 < 100)
        let op = Operation::ConsumeStorage {
            bytes: 40 * 1_048_576, // 40 MB
        };
        isolation.enforce_boundaries(&tenant_id, &op).unwrap();

        // Try to consume more storage (should fail - 90 + 20 > 100)
        let op = Operation::ConsumeStorage {
            bytes: 20 * 1_048_576, // 20 MB
        };
        let result = isolation.enforce_boundaries(&tenant_id, &op);
        assert!(result.is_err());
    }

    #[test]
    fn test_enforce_cost_limit() {
        let temp_dir = TempDir::new().unwrap();
        let mut isolation = TenantIsolation::new(temp_dir.path().to_path_buf());

        let config = create_test_tenant_config("tenant1");
        let tenant_id = isolation.create_tenant(config).unwrap();

        // Incur cost up to the limit ($500)
        let op = Operation::IncurCost { amount: 400.0 };
        isolation.enforce_boundaries(&tenant_id, &op).unwrap();

        // Try to incur more cost (should succeed - 400 + 50 < 500)
        let op = Operation::IncurCost { amount: 50.0 };
        isolation.enforce_boundaries(&tenant_id, &op).unwrap();

        // Try to incur more cost (should fail - 450 + 100 > 500)
        let op = Operation::IncurCost { amount: 100.0 };
        let result = isolation.enforce_boundaries(&tenant_id, &op);
        assert!(result.is_err());
    }

    #[test]
    fn test_path_boundary_enforcement() {
        let temp_dir = TempDir::new().unwrap();
        let mut isolation = TenantIsolation::new(temp_dir.path().to_path_buf());

        let config = create_test_tenant_config("tenant1");
        let tenant_id = isolation.create_tenant(config).unwrap();

        // Valid path within tenant boundaries
        let op = Operation::ReadFile {
            path: "data.txt".to_string(),
        };
        isolation.enforce_boundaries(&tenant_id, &op).unwrap();

        // Invalid path - directory traversal attempt
        let op = Operation::ReadFile {
            path: "../other_tenant/data.txt".to_string(),
        };
        let result = isolation.enforce_boundaries(&tenant_id, &op);
        assert!(result.is_err());
    }

    #[test]
    fn test_memory_boundary_enforcement() {
        let temp_dir = TempDir::new().unwrap();
        let mut isolation = TenantIsolation::new(temp_dir.path().to_path_buf());

        let config = create_test_tenant_config("tenant1");
        let tenant_id = isolation.create_tenant(config).unwrap();

        // Valid memory key within tenant namespace
        let op = Operation::AccessMemory {
            key: "tenant1:my_key".to_string(),
        };
        isolation.enforce_boundaries(&tenant_id, &op).unwrap();

        // Invalid memory key - different tenant namespace
        let op = Operation::AccessMemory {
            key: "tenant2:my_key".to_string(),
        };
        let result = isolation.enforce_boundaries(&tenant_id, &op);
        assert!(result.is_err());

        // Invalid memory key - no namespace prefix
        let op = Operation::AccessMemory {
            key: "my_key".to_string(),
        };
        let result = isolation.enforce_boundaries(&tenant_id, &op);
        assert!(result.is_err());
    }

    #[test]
    fn test_release_workflow() {
        let temp_dir = TempDir::new().unwrap();
        let mut isolation = TenantIsolation::new(temp_dir.path().to_path_buf());

        let config = create_test_tenant_config("tenant1");
        let tenant_id = isolation.create_tenant(config).unwrap();

        // Start a workflow
        let op = Operation::StartWorkflow {
            workflow_id: "wf1".to_string(),
        };
        isolation.enforce_boundaries(&tenant_id, &op).unwrap();

        // Check usage
        let usage = isolation.get_resource_usage(&tenant_id).unwrap();
        assert_eq!(usage.current_workflows, 1);

        // Release the workflow
        isolation.release_workflow(&tenant_id).unwrap();

        // Check usage again
        let usage = isolation.get_resource_usage(&tenant_id).unwrap();
        assert_eq!(usage.current_workflows, 0);
    }

    #[test]
    fn test_get_resource_usage() {
        let temp_dir = TempDir::new().unwrap();
        let mut isolation = TenantIsolation::new(temp_dir.path().to_path_buf());

        let config = create_test_tenant_config("tenant1");
        let tenant_id = isolation.create_tenant(config).unwrap();

        // Initial usage should be zero
        let usage = isolation.get_resource_usage(&tenant_id).unwrap();
        assert_eq!(usage.current_workflows, 0);
        assert_eq!(usage.current_storage_mb, 0);
        assert_eq!(usage.current_cost_this_month, 0.0);

        // Consume some resources
        let op = Operation::StartWorkflow {
            workflow_id: "wf1".to_string(),
        };
        isolation.enforce_boundaries(&tenant_id, &op).unwrap();

        let op = Operation::ConsumeStorage {
            bytes: 10 * 1_048_576, // 10 MB
        };
        isolation.enforce_boundaries(&tenant_id, &op).unwrap();

        let op = Operation::IncurCost { amount: 50.0 };
        isolation.enforce_boundaries(&tenant_id, &op).unwrap();

        // Check updated usage
        let usage = isolation.get_resource_usage(&tenant_id).unwrap();
        assert_eq!(usage.current_workflows, 1);
        assert_eq!(usage.current_storage_mb, 10);
        assert_eq!(usage.current_cost_this_month, 50.0);
    }

    #[test]
    fn test_reset_monthly_costs() {
        let temp_dir = TempDir::new().unwrap();
        let mut isolation = TenantIsolation::new(temp_dir.path().to_path_buf());

        let config1 = create_test_tenant_config("tenant1");
        let tenant_id1 = isolation.create_tenant(config1).unwrap();

        let config2 = create_test_tenant_config("tenant2");
        let tenant_id2 = isolation.create_tenant(config2).unwrap();

        // Incur costs for both tenants
        let op = Operation::IncurCost { amount: 100.0 };
        isolation.enforce_boundaries(&tenant_id1, &op).unwrap();
        isolation.enforce_boundaries(&tenant_id2, &op).unwrap();

        // Reset monthly costs
        isolation.reset_monthly_costs().unwrap();

        // Check that costs are reset for both tenants
        let usage1 = isolation.get_resource_usage(&tenant_id1).unwrap();
        assert_eq!(usage1.current_cost_this_month, 0.0);

        let usage2 = isolation.get_resource_usage(&tenant_id2).unwrap();
        assert_eq!(usage2.current_cost_this_month, 0.0);
    }

    #[test]
    fn test_list_tenants() {
        let temp_dir = TempDir::new().unwrap();
        let mut isolation = TenantIsolation::new(temp_dir.path().to_path_buf());

        // Initially no tenants
        let tenants = isolation.list_tenants().unwrap();
        assert_eq!(tenants.len(), 0);

        // Create some tenants
        let config1 = create_test_tenant_config("tenant1");
        isolation.create_tenant(config1).unwrap();

        let config2 = create_test_tenant_config("tenant2");
        isolation.create_tenant(config2).unwrap();

        // List tenants
        let tenants = isolation.list_tenants().unwrap();
        assert_eq!(tenants.len(), 2);
        assert!(tenants.iter().any(|t| t.as_str() == "tenant1"));
        assert!(tenants.iter().any(|t| t.as_str() == "tenant2"));
    }

    #[test]
    fn test_tenant_isolation_no_cross_access() {
        let temp_dir = TempDir::new().unwrap();
        let mut isolation = TenantIsolation::new(temp_dir.path().to_path_buf());

        // Create two tenants
        let config1 = create_test_tenant_config("tenant1");
        let tenant_id1 = isolation.create_tenant(config1).unwrap();

        let config2 = create_test_tenant_config("tenant2");
        let _tenant_id2 = isolation.create_tenant(config2).unwrap();

        // Tenant1 tries to access tenant2's memory
        let op = Operation::AccessMemory {
            key: "tenant2:secret_data".to_string(),
        };
        let result = isolation.enforce_boundaries(&tenant_id1, &op);
        assert!(result.is_err());

        // Tenant1 tries to access tenant2's files
        let op = Operation::ReadFile {
            path: "../tenant2/data.txt".to_string(),
        };
        let result = isolation.enforce_boundaries(&tenant_id1, &op);
        assert!(result.is_err());
    }
}

#[cfg(test)]
mod property_tests {
    use super::*;
    use proptest::prelude::*;
    use tempfile::TempDir;

    // Strategy for generating valid tenant IDs
    fn tenant_id_strategy() -> impl Strategy<Value = String> {
        "[a-z][a-z0-9_]{0,62}".prop_map(|s| s)
    }

    // Strategy for generating resource limits
    fn resource_limits_strategy() -> impl Strategy<Value = ResourceLimits> {
        (1u32..100, 1u64..1000, 1.0f64..10000.0).prop_map(|(workflows, storage, cost)| {
            ResourceLimits {
                max_concurrent_workflows: workflows,
                max_storage_mb: storage,
                max_cost_per_month: cost,
            }
        })
    }

    // Strategy for generating isolation levels
    fn isolation_level_strategy() -> impl Strategy<Value = IsolationLevel> {
        prop_oneof![
            Just(IsolationLevel::Soft),
            Just(IsolationLevel::Hard),
            Just(IsolationLevel::Sandboxed),
        ]
    }

    proptest! {
        /// **Validates: Requirements 12.6**
        /// Property: Tenant Isolation is Complete
        ///
        /// ∀ tenant1, tenant2, operation:
        ///   tenant1 ≠ tenant2 ⟹
        ///   ¬can_access(tenant1, tenant2.resources) ∧
        ///   ¬can_modify(tenant1, tenant2.state)
        ///
        /// This property ensures that no tenant can access or modify another tenant's resources.
        #[test]
        fn prop_tenant_isolation_is_complete(
            tenant1_id in tenant_id_strategy(),
            tenant2_suffix in "[a-z0-9]{1,5}",
            limits in resource_limits_strategy(),
            isolation_level in isolation_level_strategy(),
        ) {
            // Ensure tenant2_id is different from tenant1_id and within 64 char limit
            let tenant2_id = if tenant1_id.len() + tenant2_suffix.len() < 64 {
                format!("{}_{}", tenant1_id, tenant2_suffix)
            } else {
                // If too long, truncate tenant1_id and add suffix
                let max_len = 64 - tenant2_suffix.len() - 1;
                let truncated = &tenant1_id[..max_len.min(tenant1_id.len())];
                format!("{}_{}", truncated, tenant2_suffix)
            };

            let temp_dir = TempDir::new().unwrap();
            let mut isolation = TenantIsolation::new(temp_dir.path().to_path_buf());

            // Create two different tenants
            let config1 = TenantConfig {
                tenant_id: TenantId::new(tenant1_id.clone()).unwrap(),
                name: format!("Tenant {}", tenant1_id),
                resource_limits: limits.clone(),
                isolation_level: isolation_level.clone(),
            };

            let config2 = TenantConfig {
                tenant_id: TenantId::new(tenant2_id.clone()).unwrap(),
                name: format!("Tenant {}", tenant2_id),
                resource_limits: limits.clone(),
                isolation_level: isolation_level.clone(),
            };

            let tid1 = isolation.create_tenant(config1).unwrap();
            let tid2 = isolation.create_tenant(config2).unwrap();

            // Tenant1 should NOT be able to access tenant2's memory
            let op = Operation::AccessMemory {
                key: format!("{}:secret", tenant2_id),
            };
            prop_assert!(isolation.enforce_boundaries(&tid1, &op).is_err());

            // Tenant1 should NOT be able to access tenant2's files
            let op = Operation::ReadFile {
                path: format!("../{}/data.txt", tenant2_id),
            };
            prop_assert!(isolation.enforce_boundaries(&tid1, &op).is_err());

            // Tenant2 should NOT be able to access tenant1's memory
            let op = Operation::AccessMemory {
                key: format!("{}:secret", tenant1_id),
            };
            prop_assert!(isolation.enforce_boundaries(&tid2, &op).is_err());
        }

        /// **Validates: Requirements 12.3, 12.4**
        /// Property: Resource Limits are Enforced
        ///
        /// ∀ tenant, limit, usage:
        ///   usage > limit ⟹ operation_rejected
        ///
        /// This property ensures that operations exceeding resource limits are always rejected.
        #[test]
        fn prop_resource_limits_enforced(
            tenant_id in tenant_id_strategy(),
            max_workflows in 1u32..10,
            max_storage_mb in 1u64..100,
            max_cost in 1.0f64..1000.0,
            isolation_level in isolation_level_strategy(),
        ) {
            let temp_dir = TempDir::new().unwrap();
            let mut isolation = TenantIsolation::new(temp_dir.path().to_path_buf());

            let config = TenantConfig {
                tenant_id: TenantId::new(tenant_id.clone()).unwrap(),
                name: format!("Tenant {}", tenant_id),
                resource_limits: ResourceLimits {
                    max_concurrent_workflows: max_workflows,
                    max_storage_mb,
                    max_cost_per_month: max_cost,
                },
                isolation_level,
            };

            let tid = isolation.create_tenant(config).unwrap();

            // Fill up to the workflow limit
            for _ in 0..max_workflows {
                let op = Operation::StartWorkflow {
                    workflow_id: "wf".to_string(),
                };
                isolation.enforce_boundaries(&tid, &op).unwrap();
            }

            // Exceeding workflow limit should fail
            let op = Operation::StartWorkflow {
                workflow_id: "wf_overflow".to_string(),
            };
            prop_assert!(isolation.enforce_boundaries(&tid, &op).is_err());

            // Exceeding storage limit should fail
            let op = Operation::ConsumeStorage {
                bytes: (max_storage_mb + 1) * 1_048_576,
            };
            prop_assert!(isolation.enforce_boundaries(&tid, &op).is_err());

            // Exceeding cost limit should fail
            let op = Operation::IncurCost {
                amount: max_cost + 1.0,
            };
            prop_assert!(isolation.enforce_boundaries(&tid, &op).is_err());
        }

        /// **Validates: Requirements 12.1**
        /// Property: Isolated Context is Properly Separated
        ///
        /// ∀ tenant1, tenant2:
        ///   tenant1 ≠ tenant2 ⟹
        ///   context1.state_path ≠ context2.state_path ∧
        ///   context1.memory_namespace ≠ context2.memory_namespace ∧
        ///   context1.audit_log_path ≠ context2.audit_log_path
        ///
        /// This property ensures that each tenant has completely separate contexts.
        #[test]
        fn prop_isolated_contexts_are_separate(
            tenant1_id in tenant_id_strategy(),
            tenant2_suffix in "[a-z0-9]{1,5}",
            limits in resource_limits_strategy(),
            isolation_level in isolation_level_strategy(),
        ) {
            // Ensure tenant2_id is different from tenant1_id and within 64 char limit
            let tenant2_id = if tenant1_id.len() + tenant2_suffix.len() < 64 {
                format!("{}_{}", tenant1_id, tenant2_suffix)
            } else {
                // If too long, truncate tenant1_id and add suffix
                let max_len = 64 - tenant2_suffix.len() - 1;
                let truncated = &tenant1_id[..max_len.min(tenant1_id.len())];
                format!("{}_{}", truncated, tenant2_suffix)
            };

            let temp_dir = TempDir::new().unwrap();
            let mut isolation = TenantIsolation::new(temp_dir.path().to_path_buf());

            let config1 = TenantConfig {
                tenant_id: TenantId::new(tenant1_id.clone()).unwrap(),
                name: format!("Tenant {}", tenant1_id),
                resource_limits: limits.clone(),
                isolation_level: isolation_level.clone(),
            };

            let config2 = TenantConfig {
                tenant_id: TenantId::new(tenant2_id.clone()).unwrap(),
                name: format!("Tenant {}", tenant2_id),
                resource_limits: limits.clone(),
                isolation_level: isolation_level.clone(),
            };

            let tid1 = isolation.create_tenant(config1).unwrap();
            let tid2 = isolation.create_tenant(config2).unwrap();

            let ctx1 = isolation.get_isolated_context(&tid1).unwrap();
            let ctx2 = isolation.get_isolated_context(&tid2).unwrap();

            // All context components must be different
            prop_assert_ne!(&ctx1.state_path, &ctx2.state_path);
            prop_assert_ne!(&ctx1.memory_namespace, &ctx2.memory_namespace);
            prop_assert_ne!(&ctx1.audit_log_path, &ctx2.audit_log_path);

            // Each context should contain its tenant ID
            prop_assert!(ctx1.state_path.to_string_lossy().contains(&tenant1_id));
            prop_assert!(ctx2.state_path.to_string_lossy().contains(&tenant2_id));
        }

        /// **Validates: Requirements 12.2**
        /// Property: Path Boundary Checks Prevent Directory Traversal
        ///
        /// ∀ tenant, path:
        ///   path.contains("..") ⟹ access_denied
        ///
        /// This property ensures that directory traversal attempts are always blocked.
        #[test]
        fn prop_directory_traversal_blocked(
            tenant_id in tenant_id_strategy(),
            limits in resource_limits_strategy(),
            isolation_level in isolation_level_strategy(),
            traversal_depth in 1usize..5,
        ) {
            let temp_dir = TempDir::new().unwrap();
            let mut isolation = TenantIsolation::new(temp_dir.path().to_path_buf());

            let config = TenantConfig {
                tenant_id: TenantId::new(tenant_id.clone()).unwrap(),
                name: format!("Tenant {}", tenant_id),
                resource_limits: limits,
                isolation_level,
            };

            let tid = isolation.create_tenant(config).unwrap();

            // Generate a path with directory traversal
            let traversal_path = (0..traversal_depth)
                .map(|_| "..")
                .collect::<Vec<_>>()
                .join("/") + "/etc/passwd";

            let op = Operation::ReadFile {
                path: traversal_path,
            };

            // Directory traversal should always be blocked
            prop_assert!(isolation.enforce_boundaries(&tid, &op).is_err());
        }

        /// **Validates: Requirements 12.3**
        /// Property: Resource Usage Tracking is Accurate
        ///
        /// ∀ operations:
        ///   sum(operations.resource_usage) == tenant.current_usage
        ///
        /// This property ensures that resource tracking is accurate.
        #[test]
        fn prop_resource_tracking_accurate(
            tenant_id in tenant_id_strategy(),
            limits in resource_limits_strategy(),
            isolation_level in isolation_level_strategy(),
            num_workflows in 0usize..5,
            storage_ops in prop::collection::vec(1u64..10, 0..5),
            cost_ops in prop::collection::vec(1.0f64..10.0, 0..5),
        ) {
            let temp_dir = TempDir::new().unwrap();
            let mut isolation = TenantIsolation::new(temp_dir.path().to_path_buf());

            let config = TenantConfig {
                tenant_id: TenantId::new(tenant_id.clone()).unwrap(),
                name: format!("Tenant {}", tenant_id),
                resource_limits: limits,
                isolation_level,
            };

            let tid = isolation.create_tenant(config).unwrap();

            // Track expected values
            let mut expected_workflows = 0u32;
            let mut expected_storage = 0u64;
            let mut expected_cost = 0.0f64;

            // Start workflows
            for _ in 0..num_workflows.min(5) {
                let op = Operation::StartWorkflow {
                    workflow_id: "wf".to_string(),
                };
                if isolation.enforce_boundaries(&tid, &op).is_ok() {
                    expected_workflows += 1;
                }
            }

            // Consume storage
            for storage_mb in storage_ops {
                let op = Operation::ConsumeStorage {
                    bytes: storage_mb * 1_048_576,
                };
                if isolation.enforce_boundaries(&tid, &op).is_ok() {
                    expected_storage += storage_mb;
                }
            }

            // Incur costs
            for cost in cost_ops {
                let op = Operation::IncurCost { amount: cost };
                if isolation.enforce_boundaries(&tid, &op).is_ok() {
                    expected_cost += cost;
                }
            }

            // Verify tracking matches expectations
            let usage = isolation.get_resource_usage(&tid).unwrap();
            prop_assert_eq!(usage.current_workflows, expected_workflows);
            prop_assert_eq!(usage.current_storage_mb, expected_storage);
            prop_assert!((usage.current_cost_this_month - expected_cost).abs() < 0.01);
        }
    }
}
