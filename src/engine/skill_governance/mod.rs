// Skill governance module
//
// This module provides cryptographic verification and trust management
// for imported skills, addressing supply chain security concerns.
//
// Features:
// - Ed25519 signature generation and verification
// - Trusted skill registry management
// - Audit logging for governance events
// - Integration with TrustTier system

pub mod audit;
pub mod crypto;
pub mod registry;
pub mod types;
pub mod verifier;

pub use audit::AuditLogger;
pub use crypto::{
    compute_content_hash, decode_public_key, decode_signing_key, encode_public_key,
    encode_signing_key, generate_keypair, sign_skill, verify_signature,
};
pub use registry::SkillRegistry;
pub use types::{
    AuditEvent, GovernanceConfig, PublicKey, SkillSignature, TrustedSource, VerificationResult,
};
pub use verifier::SkillVerifier;
