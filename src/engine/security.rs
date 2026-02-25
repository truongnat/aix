use crate::skill::capability::CapabilityPermissions;
use crate::skill::capability::TrustTier;
use anyhow::{anyhow, Result};
use serde::{Deserialize, Serialize};

fn default_external_mutation_penalty() -> u32 {
    20
}

fn default_step_timeout_ms() -> u64 {
    30_000
}

fn default_max_trust_tier() -> TrustTier {
    TrustTier::Untrusted
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DomainSecurityPolicy {
    pub override_permissions: Option<CapabilityPermissions>,
    #[serde(default)]
    pub strict_mode: bool,
    #[serde(default = "default_max_trust_tier")]
    pub max_trust_tier: TrustTier,
    #[serde(default = "default_external_mutation_penalty")]
    pub external_mutation_penalty: u32,
    #[serde(default = "default_step_timeout_ms")]
    pub step_timeout_ms: u64,
}

impl Default for DomainSecurityPolicy {
    fn default() -> Self {
        Self {
            override_permissions: None,
            strict_mode: false,
            max_trust_tier: default_max_trust_tier(),
            external_mutation_penalty: default_external_mutation_penalty(),
            step_timeout_ms: default_step_timeout_ms(),
        }
    }
}

impl DomainSecurityPolicy {
    #[allow(dead_code)]
    pub fn most_restrictive(
        left: &DomainSecurityPolicy,
        right: &DomainSecurityPolicy,
    ) -> DomainSecurityPolicy {
        DomainSecurityPolicy {
            override_permissions: Some(
                left.max_allowed_permissions()
                    .intersection(&right.max_allowed_permissions()),
            ),
            strict_mode: left.strict_mode || right.strict_mode,
            max_trust_tier: left.max_trust_tier.min(right.max_trust_tier),
            external_mutation_penalty: left
                .external_mutation_penalty
                .max(right.external_mutation_penalty),
            step_timeout_ms: left.step_timeout_ms.min(right.step_timeout_ms),
        }
    }

    pub fn max_allowed_permissions(&self) -> CapabilityPermissions {
        self.override_permissions
            .unwrap_or_else(CapabilityPermissions::all)
    }

    pub fn effective_permissions_for(
        &self,
        declared_permissions: &CapabilityPermissions,
    ) -> CapabilityPermissions {
        declared_permissions.intersection(&self.max_allowed_permissions())
    }

    pub fn allows_declared_permissions(
        &self,
        declared_permissions: &CapabilityPermissions,
    ) -> bool {
        declared_permissions.is_subset_of(&self.max_allowed_permissions())
    }

    pub fn denied_declared_actions(
        &self,
        declared_permissions: &CapabilityPermissions,
    ) -> Vec<&'static str> {
        declared_permissions.denied_actions_against(&self.max_allowed_permissions())
    }

    pub fn allows_trust_tier(&self, trust_tier: TrustTier) -> bool {
        trust_tier <= self.max_trust_tier
    }

    #[allow(dead_code)]
    pub fn ensure_resume_not_broader_than(&self, original: &DomainSecurityPolicy) -> Result<()> {
        let requested = self.max_allowed_permissions();
        let baseline = original.max_allowed_permissions();
        if !requested.is_subset_of(&baseline) {
            return Err(anyhow!(
                "Security policy resume rejected: requested permissions are broader than snapshot policy"
            ));
        }

        if original.strict_mode && !self.strict_mode {
            return Err(anyhow!(
                "Security policy resume rejected: strict_mode cannot be disabled on resume"
            ));
        }

        if self.max_trust_tier > original.max_trust_tier {
            return Err(anyhow!(
                "Security policy resume rejected: max trust tier cannot be broadened on resume"
            ));
        }

        if self.external_mutation_penalty < original.external_mutation_penalty {
            return Err(anyhow!(
                "Security policy resume rejected: external mutation penalty cannot be reduced on resume"
            ));
        }

        if self.step_timeout_ms > original.step_timeout_ms {
            return Err(anyhow!(
                "Security policy resume rejected: step timeout cannot be increased on resume"
            ));
        }

        Ok(())
    }
}

#[derive(Debug, Clone)]
pub struct SecurityViolationError {
    pub step_id: String,
    pub skill: String,
    pub action: String,
    pub reason: String,
}

impl SecurityViolationError {
    pub fn new(step_id: &str, skill: &str, action: &str, reason: impl Into<String>) -> Self {
        Self {
            step_id: step_id.to_string(),
            skill: skill.to_string(),
            action: action.to_string(),
            reason: reason.into(),
        }
    }
}

impl std::fmt::Display for SecurityViolationError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "Security violation in step '{}' (skill '{}', action '{}'): {}",
            self.step_id, self.skill, self.action, self.reason
        )
    }
}

impl std::error::Error for SecurityViolationError {}
