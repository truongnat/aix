// Skill signature verification
//
// This module provides the main verification workflow for skill signatures,
// combining registry checks and cryptographic verification.

use super::crypto::{decode_public_key, verify_signature};
use super::registry::SkillRegistry;
use super::types::{PublicKey, SkillSignature, VerificationResult};
use anyhow::{anyhow, Result};
use std::collections::HashMap;
use std::path::Path;

/// Skill signature verifier
pub struct SkillVerifier {
    registry: SkillRegistry,
    public_keys: HashMap<String, PublicKey>,
}

impl SkillVerifier {
    /// Create new verifier with registry
    pub fn new(registry: SkillRegistry) -> Self {
        Self {
            registry,
            public_keys: HashMap::new(),
        }
    }

    /// Create verifier with default registry
    pub fn default() -> Self {
        Self::new(SkillRegistry::default())
    }

    /// Add public key for verification
    pub fn add_public_key(&mut self, key: PublicKey) {
        self.public_keys.insert(key.key_id.clone(), key);
    }

    /// Load public keys from directory
    pub fn load_public_keys(&mut self, dir: impl AsRef<Path>) -> Result<usize> {
        let dir = dir.as_ref();
        if !dir.exists() {
            return Ok(0);
        }

        let mut count = 0;
        for entry in std::fs::read_dir(dir)? {
            let entry = entry?;
            let path = entry.path();

            if path.extension().and_then(|s| s.to_str()) == Some("json") {
                let content = std::fs::read_to_string(&path)?;
                let key: PublicKey = serde_json::from_str(&content)?;
                self.add_public_key(key);
                count += 1;
            }
        }

        Ok(count)
    }

    /// Verify skill with signature
    pub fn verify_skill(
        &self,
        skill_id: &str,
        content: &str,
        signature: Option<&SkillSignature>,
    ) -> VerificationResult {
        // Check registry first
        let has_signature = signature.is_some();
        let source_result = self.registry.validate_source(skill_id, has_signature);

        // If source validation failed, return that result
        if source_result.is_invalid() {
            return source_result;
        }

        // If trusted source and no signature required, we're done
        if source_result == VerificationResult::TrustedSource {
            return source_result;
        }

        // If no signature provided but required, fail
        let sig = match signature {
            Some(s) => s,
            None => {
                if self.registry.requires_signature(skill_id) {
                    return VerificationResult::Invalid(
                        "Signature required but not provided".to_string(),
                    );
                } else {
                    return VerificationResult::TrustedSource;
                }
            }
        };

        // Verify signature cryptographically
        match self.verify_signature_crypto(content, sig) {
            Ok(true) => VerificationResult::Valid,
            Ok(false) => VerificationResult::Invalid("Signature verification failed".to_string()),
            Err(e) => VerificationResult::Invalid(format!("Verification error: {}", e)),
        }
    }

    /// Verify signature cryptographically
    fn verify_signature_crypto(&self, content: &str, signature: &SkillSignature) -> Result<bool> {
        // Get public key for signer
        let public_key = self
            .public_keys
            .get(&signature.signer)
            .ok_or_else(|| anyhow!("Public key not found for signer: {}", signature.signer))?;

        // Decode public key
        let verifying_key = decode_public_key(&public_key.key_data)?;

        // Verify signature
        verify_signature(content, signature, &verifying_key)
    }

    /// Get registry reference
    pub fn registry(&self) -> &SkillRegistry {
        &self.registry
    }

    /// Get mutable registry reference
    pub fn registry_mut(&mut self) -> &mut SkillRegistry {
        &mut self.registry
    }

    /// Get public keys
    pub fn public_keys(&self) -> &HashMap<String, PublicKey> {
        &self.public_keys
    }
}

#[cfg(test)]
mod tests {
    use super::super::crypto::{encode_public_key, generate_keypair, sign_skill};
    use super::super::types::GovernanceConfig;
    use super::*;

    #[test]
    fn test_verifier_creation() {
        let verifier = SkillVerifier::default();
        assert_eq!(verifier.public_keys().len(), 0);
    }

    #[test]
    fn test_add_public_key() {
        let mut verifier = SkillVerifier::default();
        let (_, verifying_key) = generate_keypair();

        let key = PublicKey::new(
            "test@example.com".to_string(),
            encode_public_key(&verifying_key),
        );

        verifier.add_public_key(key);
        assert_eq!(verifier.public_keys().len(), 1);
    }

    #[test]
    fn test_verify_trusted_source_no_signature() {
        let verifier = SkillVerifier::default();
        let skill_id = ".agents/skills/test.md";
        let content = "# Test Skill";

        let result = verifier.verify_skill(skill_id, content, None);
        assert_eq!(result, VerificationResult::TrustedSource);
    }

    #[test]
    fn test_verify_untrusted_source_no_signature() {
        let verifier = SkillVerifier::default();
        let skill_id = "github.com/user/repo/skill.md";
        let content = "# Test Skill";

        let result = verifier.verify_skill(skill_id, content, None);
        assert!(result.is_invalid());
    }

    #[test]
    fn test_verify_with_valid_signature() {
        let mut verifier = SkillVerifier::default();
        let (signing_key, verifying_key) = generate_keypair();

        // Add public key
        let signer_id = "test@example.com";
        let key = PublicKey::new(signer_id.to_string(), encode_public_key(&verifying_key));
        verifier.add_public_key(key);

        // Sign skill
        let skill_id = "github.com/user/repo/skill.md";
        let content = "# Test Skill\n\nThis is a test.";
        let signature = sign_skill(skill_id, content, signer_id, &signing_key).unwrap();

        // Verify
        let result = verifier.verify_skill(skill_id, content, Some(&signature));
        assert_eq!(result, VerificationResult::Valid);
    }

    #[test]
    fn test_verify_with_invalid_signature() {
        let mut verifier = SkillVerifier::default();
        let (signing_key, verifying_key) = generate_keypair();

        // Add public key
        let signer_id = "test@example.com";
        let key = PublicKey::new(signer_id.to_string(), encode_public_key(&verifying_key));
        verifier.add_public_key(key);

        // Sign skill
        let skill_id = "github.com/user/repo/skill.md";
        let content = "# Test Skill";
        let signature = sign_skill(skill_id, content, signer_id, &signing_key).unwrap();

        // Verify with different content
        let tampered_content = "# Tampered Skill";
        let result = verifier.verify_skill(skill_id, tampered_content, Some(&signature));
        assert!(result.is_invalid());
    }

    #[test]
    fn test_verify_with_unknown_signer() {
        let verifier = SkillVerifier::default();
        let (signing_key, _) = generate_keypair();

        // Sign skill (but don't add public key to verifier)
        let skill_id = "github.com/user/repo/skill.md";
        let content = "# Test Skill";
        let signer_id = "unknown@example.com";
        let signature = sign_skill(skill_id, content, signer_id, &signing_key).unwrap();

        // Verify should fail (unknown signer)
        let result = verifier.verify_skill(skill_id, content, Some(&signature));
        assert!(result.is_invalid());
    }

    #[test]
    fn test_verify_with_global_signature_requirement() {
        let config = GovernanceConfig {
            require_signatures: true,
            ..Default::default()
        };
        let registry = SkillRegistry::new(config);
        let verifier = SkillVerifier::new(registry);

        // Even local skills should require signature
        let skill_id = ".agents/skills/test.md";
        let content = "# Test Skill";

        let result = verifier.verify_skill(skill_id, content, None);
        assert!(result.is_invalid());
    }
}
