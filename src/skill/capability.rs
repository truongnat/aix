use serde::{Deserialize, Serialize};

/// Skill I/O type enum for capability declaration
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum SkillIOType {
    Text,
    Json,
    Number,
    Boolean,
}

impl SkillIOType {
    #[allow(dead_code)]
    pub fn as_str(&self) -> &'static str {
        match self {
            SkillIOType::Text => "text",
            SkillIOType::Json => "json",
            SkillIOType::Number => "number",
            SkillIOType::Boolean => "boolean",
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub struct CapabilityPermissions {
    pub allow_fs_read: bool,
    pub allow_fs_write: bool,
    pub allow_network: bool,
    pub allow_env: bool,
    pub allow_process_spawn: bool,
}

impl CapabilityPermissions {
    pub const fn new(
        allow_fs_read: bool,
        allow_fs_write: bool,
        allow_network: bool,
        allow_env: bool,
        allow_process_spawn: bool,
    ) -> Self {
        Self {
            allow_fs_read,
            allow_fs_write,
            allow_network,
            allow_env,
            allow_process_spawn,
        }
    }

    pub const fn none() -> Self {
        Self::new(false, false, false, false, false)
    }

    pub const fn all() -> Self {
        Self::new(true, true, true, true, true)
    }

    pub fn intersection(&self, other: &Self) -> Self {
        Self {
            allow_fs_read: self.allow_fs_read && other.allow_fs_read,
            allow_fs_write: self.allow_fs_write && other.allow_fs_write,
            allow_network: self.allow_network && other.allow_network,
            allow_env: self.allow_env && other.allow_env,
            allow_process_spawn: self.allow_process_spawn && other.allow_process_spawn,
        }
    }

    pub fn is_subset_of(&self, allowed: &Self) -> bool {
        (!self.allow_fs_read || allowed.allow_fs_read)
            && (!self.allow_fs_write || allowed.allow_fs_write)
            && (!self.allow_network || allowed.allow_network)
            && (!self.allow_env || allowed.allow_env)
            && (!self.allow_process_spawn || allowed.allow_process_spawn)
    }

    pub fn denied_actions_against(&self, allowed: &Self) -> Vec<&'static str> {
        let mut denied = Vec::new();
        if self.allow_fs_read && !allowed.allow_fs_read {
            denied.push("fs_read");
        }
        if self.allow_fs_write && !allowed.allow_fs_write {
            denied.push("fs_write");
        }
        if self.allow_network && !allowed.allow_network {
            denied.push("network");
        }
        if self.allow_env && !allowed.allow_env {
            denied.push("env");
        }
        if self.allow_process_spawn && !allowed.allow_process_spawn {
            denied.push("process_spawn");
        }
        denied
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum SideEffectClass {
    Pure,
    Idempotent,
    ExternalMutation,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
pub enum TrustTier {
    Trusted,
    Constrained,
    Untrusted,
}

impl TrustTier {
    pub fn isolation_penalty(&self) -> u32 {
        match self {
            TrustTier::Trusted => 0,
            TrustTier::Constrained => 5,
            TrustTier::Untrusted => 15,
        }
    }
}

/// Skill capability metadata
#[derive(Debug, Clone)]
#[allow(dead_code)]
pub struct SkillCapability {
    pub name: String,
    pub description: String,
    pub input_type: SkillIOType,
    pub output_type: SkillIOType,
    pub estimated_cost: u32,
    pub estimated_latency_ms: u32,
    pub permissions: CapabilityPermissions,
    pub side_effect_class: SideEffectClass,
    pub trust_tier: TrustTier,
}

impl SkillCapability {
    pub fn new(
        name: &str,
        description: &str,
        input_type: SkillIOType,
        output_type: SkillIOType,
        permissions: CapabilityPermissions,
        side_effect_class: SideEffectClass,
    ) -> Self {
        Self {
            name: name.to_string(),
            description: description.to_string(),
            input_type,
            output_type,
            estimated_cost: 1,         // Default cost
            estimated_latency_ms: 100, // Default latency
            permissions,
            side_effect_class,
            trust_tier: TrustTier::Trusted,
        }
    }

    pub fn with_cost(mut self, cost: u32) -> Self {
        self.estimated_cost = cost;
        self
    }

    pub fn with_latency(mut self, latency: u32) -> Self {
        self.estimated_latency_ms = latency;
        self
    }

    pub fn with_trust_tier(mut self, trust_tier: TrustTier) -> Self {
        self.trust_tier = trust_tier;
        self
    }
}
