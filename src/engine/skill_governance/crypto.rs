// Cryptographic operations for skill signatures
//
// This module provides Ed25519 signature generation and verification
// for skill content authentication.

use super::types::SkillSignature;
use anyhow::{anyhow, Result};
use base64::{engine::general_purpose::STANDARD as BASE64, Engine};
use ed25519_dalek::{Signature, Signer, SigningKey, Verifier, VerifyingKey};
use sha2::{Digest, Sha256};

/// Generate Ed25519 key pair
pub fn generate_keypair() -> (SigningKey, VerifyingKey) {
    let signing_key = SigningKey::generate(&mut rand::rngs::OsRng);
    let verifying_key = signing_key.verifying_key();
    (signing_key, verifying_key)
}

/// Compute SHA-256 hash of content
pub fn compute_content_hash(content: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(content.as_bytes());
    let result = hasher.finalize();
    format!("sha256:{}", hex::encode(result))
}

/// Sign skill content
pub fn sign_skill(
    skill_id: &str,
    content: &str,
    signer_id: &str,
    signing_key: &SigningKey,
) -> Result<SkillSignature> {
    // Compute content hash
    let content_hash = compute_content_hash(content);

    // Create timestamp
    let timestamp = chrono::Utc::now().to_rfc3339();

    // Create signature object (without signature yet)
    let sig_obj = SkillSignature::new(
        skill_id.to_string(),
        content_hash,
        timestamp,
        signer_id.to_string(),
        String::new(), // Placeholder
    );

    // Sign the message
    let message = sig_obj.signed_message();
    let signature = signing_key.sign(message.as_bytes());

    // Encode signature as base64
    let signature_b64 = BASE64.encode(signature.to_bytes());

    // Return complete signature
    Ok(SkillSignature {
        signature: signature_b64,
        ..sig_obj
    })
}

/// Verify skill signature
pub fn verify_signature(
    content: &str,
    signature: &SkillSignature,
    public_key: &VerifyingKey,
) -> Result<bool> {
    // Verify content hash matches
    let computed_hash = compute_content_hash(content);
    if computed_hash != signature.content_hash {
        return Ok(false);
    }

    // Decode signature from base64
    let signature_bytes = BASE64
        .decode(&signature.signature)
        .map_err(|e| anyhow!("Failed to decode signature: {}", e))?;

    let sig = Signature::from_bytes(
        &signature_bytes
            .try_into()
            .map_err(|_| anyhow!("Invalid signature length"))?,
    );

    // Verify signature
    let message = signature.signed_message();
    match public_key.verify(message.as_bytes(), &sig) {
        Ok(()) => Ok(true),
        Err(_) => Ok(false),
    }
}

/// Encode public key to base64
pub fn encode_public_key(key: &VerifyingKey) -> String {
    BASE64.encode(key.to_bytes())
}

/// Decode public key from base64
pub fn decode_public_key(encoded: &str) -> Result<VerifyingKey> {
    let bytes = BASE64
        .decode(encoded)
        .map_err(|e| anyhow!("Failed to decode public key: {}", e))?;

    let key_bytes: [u8; 32] = bytes
        .try_into()
        .map_err(|_| anyhow!("Invalid public key length"))?;

    VerifyingKey::from_bytes(&key_bytes).map_err(|e| anyhow!("Invalid public key: {}", e))
}

/// Encode signing key to base64 (for storage)
pub fn encode_signing_key(key: &SigningKey) -> String {
    BASE64.encode(key.to_bytes())
}

/// Decode signing key from base64
pub fn decode_signing_key(encoded: &str) -> Result<SigningKey> {
    let bytes = BASE64
        .decode(encoded)
        .map_err(|e| anyhow!("Failed to decode signing key: {}", e))?;

    let key_bytes: [u8; 32] = bytes
        .try_into()
        .map_err(|_| anyhow!("Invalid signing key length"))?;

    Ok(SigningKey::from_bytes(&key_bytes))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_generate_keypair() {
        let (signing_key, verifying_key) = generate_keypair();

        // Test that keys can sign and verify
        let message = b"test message";
        let signature = signing_key.sign(message);
        assert!(verifying_key.verify(message, &signature).is_ok());
    }

    #[test]
    fn test_compute_content_hash() {
        let content = "test content";
        let hash = compute_content_hash(content);

        assert!(hash.starts_with("sha256:"));
        assert_eq!(hash.len(), 71); // "sha256:" + 64 hex chars

        // Same content should produce same hash
        let hash2 = compute_content_hash(content);
        assert_eq!(hash, hash2);
    }

    #[test]
    fn test_sign_and_verify_skill() {
        let (signing_key, verifying_key) = generate_keypair();
        let content = "# Test Skill\n\nThis is a test skill.";
        let skill_id = "test/skill.md";
        let signer_id = "test@example.com";

        // Sign the skill
        let signature = sign_skill(skill_id, content, signer_id, &signing_key).unwrap();

        // Verify signature
        let valid = verify_signature(content, &signature, &verifying_key).unwrap();
        assert!(valid);

        // Verify with wrong content fails
        let wrong_content = "# Wrong Content";
        let valid = verify_signature(wrong_content, &signature, &verifying_key).unwrap();
        assert!(!valid);
    }

    #[test]
    fn test_encode_decode_public_key() {
        let (_, verifying_key) = generate_keypair();

        // Encode and decode
        let encoded = encode_public_key(&verifying_key);
        let decoded = decode_public_key(&encoded).unwrap();

        // Should be equal
        assert_eq!(verifying_key.to_bytes(), decoded.to_bytes());
    }

    #[test]
    fn test_encode_decode_signing_key() {
        let (signing_key, _) = generate_keypair();

        // Encode and decode
        let encoded = encode_signing_key(&signing_key);
        let decoded = decode_signing_key(&encoded).unwrap();

        // Should be equal
        assert_eq!(signing_key.to_bytes(), decoded.to_bytes());
    }

    #[test]
    fn test_signature_with_tampered_content() {
        let (signing_key, verifying_key) = generate_keypair();
        let content = "original content";
        let skill_id = "test/skill.md";
        let signer_id = "test@example.com";

        // Sign original content
        let signature = sign_skill(skill_id, content, signer_id, &signing_key).unwrap();

        // Try to verify with tampered content
        let tampered = "tampered content";
        let valid = verify_signature(tampered, &signature, &verifying_key).unwrap();
        assert!(!valid);
    }

    #[test]
    fn test_signature_with_wrong_key() {
        let (signing_key, _) = generate_keypair();
        let (_, wrong_key) = generate_keypair();
        let content = "test content";
        let skill_id = "test/skill.md";
        let signer_id = "test@example.com";

        // Sign with one key
        let signature = sign_skill(skill_id, content, signer_id, &signing_key).unwrap();

        // Try to verify with different key
        let valid = verify_signature(content, &signature, &wrong_key).unwrap();
        assert!(!valid);
    }
}
