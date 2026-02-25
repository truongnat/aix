use std::collections::HashMap;
use std::sync::Arc;

use crate::skill::Skill;
use crate::skill::SkillCapability;
use anyhow::{anyhow, Result};
use serde::{Deserialize, Serialize};

/// Canonical skill identity across domains.
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct QualifiedSkill {
    pub domain: String,
    pub skill: String,
}

impl QualifiedSkill {
    pub fn new(domain: impl Into<String>, skill: impl Into<String>) -> Self {
        Self {
            domain: domain.into(),
            skill: skill.into(),
        }
    }

    pub fn canonical_id(&self) -> String {
        format!("{}.{}", self.domain, self.skill)
    }

    pub fn parse_with_default(default_domain: &str, reference: &str) -> Self {
        if let Some((domain, skill)) = reference.split_once('.') {
            return Self::new(domain.trim(), skill.trim());
        }
        Self::new(default_domain, reference.trim())
    }
}

/// DomainRegistry provides domain-specific skill isolation.
/// Each domain has its own SkillRegistry, ensuring workflows can only
/// access skills within their designated domain.
pub struct DomainRegistry {
    domains: std::collections::HashMap<String, SkillRegistry>,
}

impl DomainRegistry {
    pub fn new() -> Self {
        Self {
            domains: std::collections::HashMap::new(),
        }
    }

    /// Register a new domain. Domain must exist before adding skills.
    pub fn register_domain(&mut self, name: &str) {
        self.domains.insert(name.to_string(), SkillRegistry::new());
    }

    /// Register a skill to a specific domain.
    /// Returns error if domain doesn't exist.
    pub fn register_skill(&mut self, domain: &str, skill: Arc<dyn Skill>) -> Result<()> {
        let registry = self
            .domains
            .get_mut(domain)
            .ok_or_else(|| anyhow!("Domain '{}' does not exist. Register domain first.", domain))?;

        registry.register(skill);
        Ok(())
    }

    /// Get a skill from a specific domain.
    /// Returns error if domain doesn't exist or skill not found in domain.
    pub fn get_skill(&self, domain: &str, skill_name: &str) -> Result<Arc<dyn Skill>> {
        let registry = self
            .domains
            .get(domain)
            .ok_or_else(|| anyhow!("Domain '{}' not found", domain))?;

        registry.get(skill_name)
    }

    /// Check if a domain exists
    pub fn has_domain(&self, domain: &str) -> bool {
        self.domains.contains_key(domain)
    }

    /// List all skills in a domain
    pub fn list_skills(&self, domain: &str) -> Result<Vec<Arc<dyn Skill>>> {
        let registry = self
            .domains
            .get(domain)
            .ok_or_else(|| anyhow!("Domain '{}' not found", domain))?;

        Ok(registry.list())
    }

    /// List domain names in deterministic order.
    pub fn list_domains(&self) -> Vec<String> {
        let mut domains: Vec<String> = self.domains.keys().cloned().collect();
        domains.sort();
        domains
    }

    /// Merge another domain registry into this one.
    /// Existing skills with the same domain/name are overwritten by `other`.
    pub fn merge_from(&mut self, other: DomainRegistry) {
        for (domain_name, other_registry) in other.domains {
            let target = self
                .domains
                .entry(domain_name)
                .or_insert_with(SkillRegistry::new);
            for (skill_name, skill) in other_registry.skills {
                target.skills.insert(skill_name, skill);
            }
        }
    }

    /// List all capabilities across domains sorted by domain then skill.
    #[allow(dead_code)]
    pub fn list_all_capabilities(&self) -> Vec<(String, SkillCapability)> {
        let mut all = Vec::new();
        for domain in self.list_domains() {
            if let Ok(mut skills) = self.list_skills(&domain) {
                skills.sort_by(|a, b| a.name().cmp(b.name()));
                for skill in skills {
                    all.push((domain.clone(), skill.capability()));
                }
            }
        }
        all
    }

    /// Resolve a possibly-qualified skill reference.
    pub fn resolve_skill_reference(
        &self,
        default_domain: &str,
        reference: &str,
    ) -> Result<(QualifiedSkill, Arc<dyn Skill>)> {
        let qualified = QualifiedSkill::parse_with_default(default_domain, reference);
        let skill = self
            .get_skill(&qualified.domain, &qualified.skill)
            .map_err(|_| {
                anyhow!(
                    "Skill '{}' not found in domain '{}'",
                    qualified.skill,
                    qualified.domain
                )
            })?;
        Ok((qualified, skill))
    }
}

/// Phase 18: Registry of registries for multi-domain capability routing.
#[allow(dead_code)]
pub struct MultiDomainRegistry {
    pub domains: HashMap<String, DomainRegistry>,
}

#[allow(dead_code)]
impl MultiDomainRegistry {
    pub fn new() -> Self {
        Self {
            domains: HashMap::new(),
        }
    }

    pub fn register_registry(&mut self, name: &str, registry: DomainRegistry) {
        self.domains.insert(name.to_string(), registry);
    }

    pub fn list_all_capabilities(&self) -> Vec<(String, SkillCapability)> {
        let mut all = Vec::new();
        let mut registry_names: Vec<String> = self.domains.keys().cloned().collect();
        registry_names.sort();

        for registry_name in registry_names {
            if let Some(registry) = self.domains.get(&registry_name) {
                for (domain, cap) in registry.list_all_capabilities() {
                    all.push((format!("{}.{}", registry_name, domain), cap));
                }
            }
        }

        all.sort_by(|a, b| a.0.cmp(&b.0).then_with(|| a.1.name.cmp(&b.1.name)));
        all
    }
}

/// Internal skill registry for a single domain
struct SkillRegistry {
    skills: std::collections::HashMap<String, Arc<dyn Skill>>,
}

impl SkillRegistry {
    fn new() -> Self {
        Self {
            skills: std::collections::HashMap::new(),
        }
    }

    fn register(&mut self, skill: Arc<dyn Skill>) {
        self.skills.insert(skill.name().to_string(), skill);
    }

    fn get(&self, name: &str) -> Result<Arc<dyn Skill>> {
        self.skills
            .get(name)
            .cloned()
            .ok_or_else(|| anyhow!("Skill '{}' not found in domain", name))
    }

    fn list(&self) -> Vec<Arc<dyn Skill>> {
        self.skills.values().cloned().collect()
    }
}
