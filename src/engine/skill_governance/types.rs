// Core types for skill governance
//
// This module defines the types used for cryptographic verification
// and trust management of imported skills.

use serde::{Deserialize, Serialize};
use std::fmt;

/// Skill signature containing cryptographic proof
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SkillSignature {
    /// Version of signature format
    pub version: u32,
    /// Skill identifier (e.g., github.com/user/repo/skill.md)
    pub skill_id: String,
    /// SHA-256 hash of skill content
    pub content_hash: String,
    /// Timestamp when signature was created
    pub timestamp: String,
    /// Signer identifier (e.g., email or key ID)
    pub signer: String,
    /// Base64-encoded Ed25519 signature
    pub signature: String,
}

impl SkillSignature {
    pub fn new(
        skill_id: String,
        content_hash: String,
        timestamp: String,
        signer: String,
        signature: String,
    ) -> Self {
        Self {
            version: 1,
            skill_id,
            content_hash,
            timestamp,
            signer,
            signature,
        }
    }

    /// Get the message that was signed
    pub fn signed_message(&self) -> String {
        format!(
            "Skill Signature v{}\n---\nskill_id: {}\ncontent_hash: {}\ntimestamp: {}\nsigner: {}\n---",
            self.version, self.skill_id, self.content_hash, self.timestamp, self.signer
        )
    }
}

impl fmt::Display for SkillSignature {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(
            f,
            "{}\nsignature: {}",
            self.signed_message(),
            self.signature
        )
    }
}

/// Public key for signature verification
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PublicKey {
    /// Key identifier (e.g., email or key ID)
    pub key_id: String,
    /// Algorithm (currently only Ed25519)
    pub algorithm: String,
    /// Base64-encoded public key bytes
    pub key_data: String,
    /// Optional description
    pub description: Option<String>,
}

impl PublicKey {
    pub fn new(key_id: String, key_data: String) -> Self {
        Self {
            key_id,
            algorithm: "Ed25519".to_string(),
            key_data,
            description: None,
        }
    }

    pub fn with_description(mut self, description: String) -> Self {
        self.description = Some(description);
        self
    }
}

/// Trusted skill source configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrustedSource {
    /// Source pattern (e.g., "github.com/org/*")
    pub pattern: String,
    /// Whether signatures are required
    pub require_signature: bool,
    /// Optional description
    pub description: Option<String>,
}

impl TrustedSource {
    pub fn new(pattern: String, require_signature: bool) -> Self {
        Self {
            pattern,
            require_signature,
            description: None,
        }
    }

    pub fn with_description(mut self, description: String) -> Self {
        self.description = Some(description);
        self
    }

    /// Check if a skill ID matches this source pattern
    pub fn matches(&self, skill_id: &str) -> bool {
        // Simple glob matching: * matches any characters
        let pattern_parts: Vec<&str> = self.pattern.split('*').collect();

        if pattern_parts.len() == 1 {
            // No wildcard, exact match
            return skill_id == self.pattern;
        }

        // Check prefix and suffix
        let prefix = pattern_parts[0];
        let suffix = pattern_parts.last().unwrap();

        skill_id.starts_with(prefix) && skill_id.ends_with(suffix)
    }
}

/// Skill governance configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GovernanceConfig {
    /// List of trusted sources
    pub trusted_sources: Vec<TrustedSource>,
    /// Whether to require signatures for all skills
    pub require_signatures: bool,
    /// Whether to allow unsigned local skills
    pub allow_unsigned_local: bool,
    /// Whether to enable audit logging
    pub enable_audit_log: bool,
}

impl Default for GovernanceConfig {
    fn default() -> Self {
        Self {
            trusted_sources: vec![TrustedSource::new(".agents/skills/*".to_string(), false)
                .with_description("Local skills directory".to_string())],
            require_signatures: false,
            allow_unsigned_local: true,
            enable_audit_log: true,
        }
    }
}

/// Verification result
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum VerificationResult {
    /// Signature is valid
    Valid,
    /// Signature is invalid
    Invalid(String),
    /// No signature provided
    NoSignature,
    /// Trusted source, signature not required
    TrustedSource,
}

impl VerificationResult {
    pub fn is_valid(&self) -> bool {
        matches!(
            self,
            VerificationResult::Valid | VerificationResult::TrustedSource
        )
    }

    pub fn is_invalid(&self) -> bool {
        matches!(self, VerificationResult::Invalid(_))
    }
}

impl fmt::Display for VerificationResult {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            VerificationResult::Valid => write!(f, "Valid signature"),
            VerificationResult::Invalid(reason) => write!(f, "Invalid signature: {}", reason),
            VerificationResult::NoSignature => write!(f, "No signature provided"),
            VerificationResult::TrustedSource => {
                write!(f, "Trusted source (signature not required)")
            }
        }
    }
}

/// Audit event for skill governance
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditEvent {
    /// Timestamp of event
    pub timestamp: String,
    /// Event type (e.g., "skill_import", "signature_verification")
    pub event_type: String,
    /// Skill identifier
    pub skill_id: String,
    /// Source of skill
    pub source: String,
    /// Whether signature was valid
    pub signature_valid: bool,
    /// Trust tier assigned
    pub trust_tier: String,
    /// Decision made (e.g., "allowed", "rejected")
    pub decision: String,
    /// Optional reason for decision
    pub reason: Option<String>,
}

impl AuditEvent {
    pub fn new(
        event_type: String,
        skill_id: String,
        source: String,
        signature_valid: bool,
        trust_tier: String,
        decision: String,
    ) -> Self {
        Self {
            timestamp: chrono::Utc::now().to_rfc3339(),
            event_type,
            skill_id,
            source,
            signature_valid,
            trust_tier,
            decision,
            reason: None,
        }
    }

    pub fn with_reason(mut self, reason: String) -> Self {
        self.reason = Some(reason);
        self
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_skill_signature_creation() {
        let sig = SkillSignature::new(
            "test/skill.md".to_string(),
            "sha256:abc123".to_string(),
            "2026-03-07T10:00:00Z".to_string(),
            "test@example.com".to_string(),
            "base64signature".to_string(),
        );

        assert_eq!(sig.version, 1);
        assert_eq!(sig.skill_id, "test/skill.md");
        assert!(sig.signed_message().contains("test/skill.md"));
    }

    #[test]
    fn test_trusted_source_exact_match() {
        let source = TrustedSource::new(".agents/skills/test.md".to_string(), false);
        assert!(source.matches(".agents/skills/test.md"));
        assert!(!source.matches(".agents/skills/other.md"));
    }

    #[test]
    fn test_trusted_source_wildcard_match() {
        let source = TrustedSource::new(".agents/skills/*".to_string(), false);
        assert!(source.matches(".agents/skills/test.md"));
        assert!(source.matches(".agents/skills/subdir/test.md"));
        assert!(!source.matches("other/test.md"));
    }

    #[test]
    fn test_trusted_source_prefix_suffix() {
        let source = TrustedSource::new("github.com/org/*/skill.md".to_string(), true);
        assert!(source.matches("github.com/org/repo/skill.md"));
        assert!(source.matches("github.com/org/another/skill.md"));
        assert!(!source.matches("github.com/other/repo/skill.md"));
        assert!(!source.matches("github.com/org/repo/other.md"));
    }

    #[test]
    fn test_verification_result_is_valid() {
        assert!(VerificationResult::Valid.is_valid());
        assert!(VerificationResult::TrustedSource.is_valid());
        assert!(!VerificationResult::NoSignature.is_valid());
        assert!(!VerificationResult::Invalid("test".to_string()).is_valid());
    }

    #[test]
    fn test_governance_config_default() {
        let config = GovernanceConfig::default();
        assert_eq!(config.trusted_sources.len(), 1);
        assert!(config.allow_unsigned_local);
        assert!(config.enable_audit_log);
    }
}
