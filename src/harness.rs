use crate::engine::budget::ExecutionBudget;
use crate::engine::security::DomainSecurityPolicy;
use anyhow::{anyhow, Result};
use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};

const DEFAULT_HARNESS_CONFIG_PATH: &str = "harness.yaml";

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HarnessConfig {
    #[serde(default = "default_schema")]
    pub schema: String,
    #[serde(default = "default_name")]
    pub name: String,
    #[serde(default)]
    pub workflow: HarnessWorkflowConfig,
    #[serde(default)]
    pub runtime: HarnessRuntimeConfig,
    #[serde(default)]
    pub providers: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HarnessWorkflowConfig {
    #[serde(default = "default_workflow_id")]
    pub id: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct HarnessRuntimeConfig {
    #[serde(default)]
    pub max_steps: Option<usize>,
    #[serde(default)]
    pub step_timeout_ms: Option<u64>,
    #[serde(default)]
    pub disable_network: Option<bool>,
    #[serde(default)]
    pub read_only: Option<bool>,
    #[serde(default)]
    pub strict_mode: Option<bool>,
}

impl Default for HarnessConfig {
    fn default() -> Self {
        Self {
            schema: default_schema(),
            name: default_name(),
            workflow: HarnessWorkflowConfig::default(),
            runtime: HarnessRuntimeConfig::default(),
            providers: Vec::new(),
        }
    }
}

impl Default for HarnessWorkflowConfig {
    fn default() -> Self {
        Self {
            id: default_workflow_id(),
        }
    }
}

impl HarnessConfig {
    pub fn load(path: &Path) -> Result<Self> {
        let body = std::fs::read_to_string(path)
            .map_err(|err| anyhow!("Failed to read harness config '{}': {}", path.display(), err))?;
        let config: HarnessConfig = serde_yaml::from_str(&body).map_err(|err| {
            anyhow!(
                "Failed to parse harness config '{}': {}",
                path.display(),
                err
            )
        })?;
        config.validate()?;
        Ok(config)
    }

    pub fn write_default(path: &Path, workflow_id: &str, force: bool) -> Result<Self> {
        if path.exists() && !force {
            return Err(anyhow!(
                "Harness config '{}' already exists. Use --force to overwrite.",
                path.display()
            ));
        }
        let mut config = HarnessConfig::default();
        config.workflow.id = workflow_id.trim().to_string();
        config.validate()?;
        if let Some(parent) = path.parent() {
            if !parent.as_os_str().is_empty() {
                std::fs::create_dir_all(parent)?;
            }
        }
        let yaml = serde_yaml::to_string(&config)?;
        std::fs::write(path, yaml)?;
        Ok(config)
    }

    pub fn validate(&self) -> Result<()> {
        if self.schema.trim().is_empty() {
            return Err(anyhow!("Harness config schema must not be empty"));
        }
        if self.name.trim().is_empty() {
            return Err(anyhow!("Harness config name must not be empty"));
        }
        if self.workflow.id.trim().is_empty() {
            return Err(anyhow!("Harness config workflow.id must not be empty"));
        }
        Ok(())
    }

    pub fn apply_env_overrides(&self) {
        if let Some(provider) = self.providers.first() {
            let trimmed = provider.trim();
            if !trimmed.is_empty() {
                unsafe {
                    std::env::set_var("AGENTIC_SDLC_LLM_PROVIDER", trimmed);
                }
            }
        }
    }

    pub fn apply_runtime_overrides(
        &self,
        budget: &mut ExecutionBudget,
        security_policy: &mut DomainSecurityPolicy,
    ) {
        if let Some(max_steps) = self.runtime.max_steps {
            budget.max_steps = max_steps;
        }
        if let Some(step_timeout_ms) = self.runtime.step_timeout_ms {
            security_policy.step_timeout_ms = security_policy.step_timeout_ms.min(step_timeout_ms);
        }
        let mut permissions = security_policy.max_allowed_permissions();
        if self.runtime.disable_network.unwrap_or(false) {
            permissions.allow_network = false;
        }
        if self.runtime.read_only.unwrap_or(false) {
            permissions.allow_fs_write = false;
            permissions.allow_process_spawn = false;
        }
        security_policy.override_permissions = Some(permissions);
        if self.runtime.strict_mode.unwrap_or(false) {
            security_policy.strict_mode = true;
            security_policy.external_mutation_penalty =
                security_policy.external_mutation_penalty.max(20);
        }
    }
}

pub fn default_config_path() -> PathBuf {
    PathBuf::from(DEFAULT_HARNESS_CONFIG_PATH)
}

fn default_schema() -> String {
    "agentic-sdlc.harness@v1".to_string()
}

fn default_name() -> String {
    "app-builder-harness".to_string()
}

fn default_workflow_id() -> String {
    "starter/app-builder".to_string()
}

#[cfg(test)]
mod tests {
    use super::HarnessConfig;

    #[test]
    fn default_harness_config_roundtrip() {
        let root = tempfile::tempdir().expect("tempdir");
        let path = root.path().join("harness.yaml");
        let written =
            HarnessConfig::write_default(&path, "starter/app-builder", true).expect("write");
        let loaded = HarnessConfig::load(&path).expect("load");
        assert_eq!(written.workflow.id, loaded.workflow.id);
        assert_eq!(loaded.schema, "agentic-sdlc.harness@v1");
        assert_eq!(loaded.name, "app-builder-harness");
    }
}
