// Trusted skill registry management
//
// This module manages trusted skill sources and validates
// whether skills require signature verification.

use super::types::{GovernanceConfig, TrustedSource, VerificationResult};
use anyhow::Result;
use std::path::Path;

/// Trusted skill registry
pub struct SkillRegistry {
    config: GovernanceConfig,
}

impl SkillRegistry {
    /// Create new registry with configuration
    pub fn new(config: GovernanceConfig) -> Self {
        Self { config }
    }

    /// Create registry with default configuration
    pub fn default() -> Self {
        Self::new(GovernanceConfig::default())
    }

    /// Check if a skill source is trusted
    pub fn is_trusted_source(&self, skill_id: &str) -> bool {
        self.config
            .trusted_sources
            .iter()
            .any(|source| source.matches(skill_id))
    }

    /// Check if signature is required for a skill
    pub fn requires_signature(&self, skill_id: &str) -> bool {
        // Check if global signature requirement is enabled
        if self.config.require_signatures {
            return true;
        }

        // Check if skill is local and unsigned local skills are allowed
        if self.is_local_skill(skill_id) && self.config.allow_unsigned_local {
            return false;
        }

        // Check if any trusted source requires signature
        for source in &self.config.trusted_sources {
            if source.matches(skill_id) {
                return source.require_signature;
            }
        }

        // Default: require signature for unknown sources
        true
    }

    /// Check if a skill is local (not from external source)
    pub fn is_local_skill(&self, skill_id: &str) -> bool {
        // Check if it starts with local paths
        if skill_id.starts_with(".agents/") || skill_id.starts_with("./") || skill_id.starts_with("/") {
            return true;
        }
        
        // Check if it contains URL scheme (http://, https://, git://, etc.)
        if skill_id.contains("://") {
            return false;
        }
        
        // Check if it looks like a domain (contains dots and slashes like github.com/user/repo)
        if skill_id.contains('/') && skill_id.split('/').next().map_or(false, |first| first.contains('.')) {
            return false;
        }
        
        // Default to local
        true
    }

    /// Validate skill source and determine verification requirements
    pub fn validate_source(&self, skill_id: &str, has_signature: bool) -> VerificationResult {
        // Check if source is trusted
        if self.is_trusted_source(skill_id) && !self.requires_signature(skill_id) {
            return VerificationResult::TrustedSource;
        }

        // Check if signature is required
        if self.requires_signature(skill_id) {
            if has_signature {
                // Signature will be verified separately
                VerificationResult::NoSignature
            } else {
                VerificationResult::Invalid(format!(
                    "Signature required for skill from source: {}",
                    skill_id
                ))
            }
        } else {
            // Signature not required
            if has_signature {
                // Signature provided, will be verified
                VerificationResult::NoSignature
            } else {
                // No signature, but not required
                VerificationResult::TrustedSource
            }
        }
    }

    /// Add trusted source to registry
    pub fn add_trusted_source(&mut self, source: TrustedSource) {
        self.config.trusted_sources.push(source);
    }

    /// Remove trusted source from registry
    pub fn remove_trusted_source(&mut self, pattern: &str) -> bool {
        let initial_len = self.config.trusted_sources.len();
        self.config
            .trusted_sources
            .retain(|s| s.pattern != pattern);
        self.config.trusted_sources.len() < initial_len
    }

    /// Get all trusted sources
    pub fn trusted_sources(&self) -> &[TrustedSource] {
        &self.config.trusted_sources
    }

    /// Load registry from configuration file
    pub fn load_from_file(path: impl AsRef<Path>) -> Result<Self> {
        let content = std::fs::read_to_string(path)?;
        let config: GovernanceConfig = toml::from_str(&content)?;
        Ok(Self::new(config))
    }

    /// Save registry to configuration file
    pub fn save_to_file(&self, path: impl AsRef<Path>) -> Result<()> {
        let content = toml::to_string_pretty(&self.config)?;
        std::fs::write(path, content)?;
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_registry_default() {
        let registry = SkillRegistry::default();
        assert_eq!(registry.trusted_sources().len(), 1);
    }

    #[test]
    fn test_is_trusted_source() {
        let registry = SkillRegistry::default();
        
        // Local skills should be trusted by default
        assert!(registry.is_trusted_source(".agents/skills/test.md"));
        
        // External skills should not be trusted
        assert!(!registry.is_trusted_source("github.com/user/repo/skill.md"));
    }

    #[test]
    fn test_is_local_skill() {
        let registry = SkillRegistry::default();
        
        assert!(registry.is_local_skill(".agents/skills/test.md"));
        assert!(registry.is_local_skill("./skills/test.md"));
        assert!(!registry.is_local_skill("github.com/user/repo/skill.md"));
        assert!(!registry.is_local_skill("https://example.com/skill.md"));
    }

    #[test]
    fn test_requires_signature_local() {
        let registry = SkillRegistry::default();
        
        // Local skills should not require signature by default
        assert!(!registry.requires_signature(".agents/skills/test.md"));
    }

    #[test]
    fn test_requires_signature_external() {
        let registry = SkillRegistry::default();
        
        // External skills should require signature
        assert!(registry.requires_signature("github.com/user/repo/skill.md"));
    }

    #[test]
    fn test_validate_source_trusted() {
        let registry = SkillRegistry::default();
        
        let result = registry.validate_source(".agents/skills/test.md", false);
        assert_eq!(result, VerificationResult::TrustedSource);
    }

    #[test]
    fn test_validate_source_requires_signature() {
        let registry = SkillRegistry::default();
        
        let result = registry.validate_source("github.com/user/repo/skill.md", false);
        assert!(result.is_invalid());
    }

    #[test]
    fn test_add_remove_trusted_source() {
        let mut registry = SkillRegistry::default();
        let initial_count = registry.trusted_sources().len();
        
        // Add source
        let source = TrustedSource::new("github.com/trusted/*".to_string(), false);
        registry.add_trusted_source(source);
        assert_eq!(registry.trusted_sources().len(), initial_count + 1);
        
        // Remove source
        let removed = registry.remove_trusted_source("github.com/trusted/*");
        assert!(removed);
        assert_eq!(registry.trusted_sources().len(), initial_count);
    }

    #[test]
    fn test_global_signature_requirement() {
        let mut config = GovernanceConfig::default();
        config.require_signatures = true;
        let registry = SkillRegistry::new(config);
        
        // Even local skills should require signature
        assert!(registry.requires_signature(".agents/skills/test.md"));
    }
}
