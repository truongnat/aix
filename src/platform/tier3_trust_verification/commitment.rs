// Cryptographic Commitment - sign decisions for non-repudiation

use crate::platform::tier1_execution_intelligence::causal_tracer::Decision;
use crate::platform::types::AgentId;
use crate::platform::{PlatformError, Result};
use ed25519_dalek::{Signature as Ed25519Signature, Signer, SigningKey, Verifier, VerifyingKey};
use rand::rngs::OsRng;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::{Arc, RwLock};
use std::time::{SystemTime, UNIX_EPOCH};

/// Cryptographic commitment service for signing decisions
pub trait CommitmentService: Send + Sync {
    /// Sign a decision with an agent's private key
    fn sign_decision(&self, decision: &Decision, agent_id: &AgentId) -> Result<SignedDecision>;

    /// Verify a signed decision's authenticity
    fn verify_signature(&self, signed: &SignedDecision) -> Result<bool>;

    /// Get audit trail of all signed decisions for a workflow
    fn get_audit_trail(&self, workflow_id: &str) -> Result<Vec<SignedDecision>>;
}

/// Default implementation of commitment service
pub struct DefaultCommitmentService {
    /// Certificate authority for managing agent certificates
    certificate_authority: Arc<RwLock<CertificateAuthority>>,
    /// Audit trail storage (workflow_id -> signed decisions)
    audit_trail: Arc<RwLock<HashMap<String, Vec<SignedDecision>>>>,
}

/// Certificate authority for agent identities
struct CertificateAuthority {
    /// Agent signing keys (agent_id -> signing key)
    signing_keys: HashMap<AgentId, SigningKey>,
    /// Agent certificates (agent_id -> certificate)
    certificates: HashMap<AgentId, Certificate>,
    /// Key rotation policy (days until rotation)
    rotation_policy_days: u64,
}

/// Signed decision with cryptographic proof
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SignedDecision {
    /// The original decision
    pub decision: Decision,
    /// Cryptographic signature
    pub signature: Signature,
    /// Agent certificate with public key
    pub certificate: Certificate,
    /// Optional workflow ID for audit trail
    pub workflow_id: Option<String>,
}

/// Cryptographic signature
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Signature {
    /// Signature algorithm (Ed25519 or RSA-4096)
    pub algorithm: String,
    /// Signature bytes
    pub value: Vec<u8>,
    /// Timestamp when signature was created
    pub timestamp_ms: u64,
}

/// Agent certificate
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Certificate {
    /// Agent identifier
    pub agent_id: AgentId,
    /// Public key bytes
    pub public_key: Vec<u8>,
    /// Certificate issuer
    pub issuer: String,
    /// Valid from timestamp
    pub valid_from: u64,
    /// Valid until timestamp
    pub valid_until: u64,
}

impl DefaultCommitmentService {
    /// Create a new commitment service with default settings
    pub fn new() -> Self {
        Self {
            certificate_authority: Arc::new(RwLock::new(CertificateAuthority::new(365))),
            audit_trail: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    /// Create a new commitment service with custom rotation policy
    pub fn with_rotation_policy(rotation_days: u64) -> Self {
        Self {
            certificate_authority: Arc::new(RwLock::new(CertificateAuthority::new(rotation_days))),
            audit_trail: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    /// Register a new agent and generate certificate
    pub fn register_agent(&self, agent_id: &AgentId) -> Result<Certificate> {
        let mut ca = self
            .certificate_authority
            .write()
            .map_err(|_| PlatformError::LockError("Failed to acquire CA write lock".to_string()))?;
        ca.register_agent(agent_id)
    }

    /// Sign a decision and add it to the audit trail for a workflow
    pub fn sign_decision_for_workflow(
        &self,
        decision: &Decision,
        agent_id: &AgentId,
        workflow_id: &str,
    ) -> Result<SignedDecision> {
        let signed = CommitmentService::sign_decision(self, decision, agent_id)?;
        let signed = signed.with_workflow_id(workflow_id.to_string());
        signed.add_to_audit_trail(&self.audit_trail)?;
        Ok(signed)
    }

    /// Rotate keys for an agent
    pub fn rotate_keys(&self, agent_id: &AgentId) -> Result<Certificate> {
        let mut ca = self
            .certificate_authority
            .write()
            .map_err(|_| PlatformError::LockError("Failed to acquire CA write lock".to_string()))?;
        ca.rotate_keys(agent_id)
    }

    /// Get certificate for an agent
    pub fn get_certificate(&self, agent_id: &AgentId) -> Result<Certificate> {
        let ca = self
            .certificate_authority
            .read()
            .map_err(|_| PlatformError::LockError("Failed to acquire CA read lock".to_string()))?;
        ca.get_certificate(agent_id)
    }

    /// Check if certificate needs rotation
    pub fn needs_rotation(&self, agent_id: &AgentId) -> Result<bool> {
        let ca = self
            .certificate_authority
            .read()
            .map_err(|_| PlatformError::LockError("Failed to acquire CA read lock".to_string()))?;
        ca.needs_rotation(agent_id)
    }
}

impl Default for DefaultCommitmentService {
    fn default() -> Self {
        Self::new()
    }
}

impl CommitmentService for DefaultCommitmentService {
    fn sign_decision(&self, decision: &Decision, agent_id: &AgentId) -> Result<SignedDecision> {
        let ca = self
            .certificate_authority
            .read()
            .map_err(|_| PlatformError::LockError("Failed to acquire CA read lock".to_string()))?;

        // Get agent's signing key and certificate
        let signing_key = ca
            .signing_keys
            .get(agent_id)
            .ok_or_else(|| PlatformError::NotFound(format!("Agent {} not registered", agent_id)))?;

        let certificate = ca
            .certificates
            .get(agent_id)
            .ok_or_else(|| {
                PlatformError::NotFound(format!("Certificate for agent {} not found", agent_id))
            })?
            .clone();

        // Check certificate validity
        let now = current_timestamp_ms();
        if now < certificate.valid_from || now > certificate.valid_until {
            return Err(PlatformError::InvalidInput(format!(
                "Certificate for agent {} is not valid at current time",
                agent_id
            )));
        }

        // Serialize decision for signing
        let decision_bytes = serde_json::to_vec(decision).map_err(|e| {
            PlatformError::SerializationError(format!("Failed to serialize decision: {}", e))
        })?;

        // Create signature with timestamp
        let timestamp_ms = current_timestamp_ms();
        let mut message = decision_bytes.clone();
        message.extend_from_slice(&timestamp_ms.to_le_bytes());

        // Sign the message
        let signature_bytes = signing_key.sign(&message).to_bytes().to_vec();

        let signature = Signature {
            algorithm: "Ed25519".to_string(),
            value: signature_bytes,
            timestamp_ms,
        };

        let signed_decision = SignedDecision {
            decision: decision.clone(),
            signature,
            certificate,
            workflow_id: None,
        };

        Ok(signed_decision)
    }

    fn verify_signature(&self, signed: &SignedDecision) -> Result<bool> {
        // Check certificate validity
        let now = current_timestamp_ms();
        if now < signed.certificate.valid_from || now > signed.certificate.valid_until {
            return Ok(false);
        }

        // Verify algorithm
        if signed.signature.algorithm != "Ed25519" {
            return Err(PlatformError::InvalidInput(format!(
                "Unsupported signature algorithm: {}",
                signed.signature.algorithm
            )));
        }

        // Reconstruct the signed message
        let decision_bytes = serde_json::to_vec(&signed.decision).map_err(|e| {
            PlatformError::SerializationError(format!("Failed to serialize decision: {}", e))
        })?;

        let mut message = decision_bytes;
        message.extend_from_slice(&signed.signature.timestamp_ms.to_le_bytes());

        // Parse public key
        let public_key_bytes: [u8; 32] = signed
            .certificate
            .public_key
            .as_slice()
            .try_into()
            .map_err(|_| PlatformError::InvalidInput("Invalid public key length".to_string()))?;

        let verifying_key = VerifyingKey::from_bytes(&public_key_bytes)
            .map_err(|e| PlatformError::InvalidInput(format!("Invalid public key: {}", e)))?;

        // Parse signature
        let signature_bytes: [u8; 64] = signed
            .signature
            .value
            .as_slice()
            .try_into()
            .map_err(|_| PlatformError::InvalidInput("Invalid signature length".to_string()))?;

        let signature = Ed25519Signature::from_bytes(&signature_bytes);

        // Verify signature
        match verifying_key.verify(&message, &signature) {
            Ok(_) => Ok(true),
            Err(_) => Ok(false),
        }
    }

    fn get_audit_trail(&self, workflow_id: &str) -> Result<Vec<SignedDecision>> {
        let trail = self.audit_trail.read().map_err(|_| {
            PlatformError::LockError("Failed to acquire audit trail read lock".to_string())
        })?;

        Ok(trail.get(workflow_id).cloned().unwrap_or_default())
    }
}

impl CertificateAuthority {
    fn new(rotation_policy_days: u64) -> Self {
        Self {
            signing_keys: HashMap::new(),
            certificates: HashMap::new(),
            rotation_policy_days,
        }
    }

    fn register_agent(&mut self, agent_id: &AgentId) -> Result<Certificate> {
        // Generate new signing key
        let signing_key = SigningKey::generate(&mut OsRng);
        let verifying_key = signing_key.verifying_key();

        // Create certificate
        let now = current_timestamp_ms();
        let valid_until = now + (self.rotation_policy_days * 24 * 60 * 60 * 1000);

        let certificate = Certificate {
            agent_id: agent_id.clone(),
            public_key: verifying_key.to_bytes().to_vec(),
            issuer: "agentic-sdlc-ca".to_string(),
            valid_from: now,
            valid_until,
        };

        // Store key and certificate
        self.signing_keys.insert(agent_id.clone(), signing_key);
        self.certificates
            .insert(agent_id.clone(), certificate.clone());

        Ok(certificate)
    }

    fn rotate_keys(&mut self, agent_id: &AgentId) -> Result<Certificate> {
        // Remove old key and certificate
        self.signing_keys.remove(agent_id);
        self.certificates.remove(agent_id);

        // Register with new keys
        self.register_agent(agent_id)
    }

    fn get_certificate(&self, agent_id: &AgentId) -> Result<Certificate> {
        self.certificates.get(agent_id).cloned().ok_or_else(|| {
            PlatformError::NotFound(format!("Certificate for agent {} not found", agent_id))
        })
    }

    fn needs_rotation(&self, agent_id: &AgentId) -> Result<bool> {
        let certificate = self.get_certificate(agent_id)?;
        let now = current_timestamp_ms();

        // Check if certificate is within 10% of expiration
        let lifetime = certificate.valid_until - certificate.valid_from;
        let threshold = certificate.valid_until - (lifetime / 10);

        Ok(now >= threshold)
    }
}

impl SignedDecision {
    /// Set the workflow ID for audit trail tracking
    pub fn with_workflow_id(mut self, workflow_id: String) -> Self {
        self.workflow_id = Some(workflow_id);
        self
    }

    /// Add this signed decision to the audit trail
    pub fn add_to_audit_trail(
        &self,
        audit_trail: &Arc<RwLock<HashMap<String, Vec<SignedDecision>>>>,
    ) -> Result<()> {
        if let Some(workflow_id) = &self.workflow_id {
            let mut trail = audit_trail.write().map_err(|_| {
                PlatformError::LockError("Failed to acquire audit trail write lock".to_string())
            })?;

            trail
                .entry(workflow_id.clone())
                .or_default()
                .push(self.clone());
        }
        Ok(())
    }
}

/// Get current timestamp in milliseconds
fn current_timestamp_ms() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .expect("Time went backwards")
        .as_millis() as u64
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::platform::tier1_execution_intelligence::causal_tracer::{Decision, DecisionType};
    use crate::platform::types::{DataSource, DataSourceType};

    fn create_test_decision() -> Decision {
        Decision {
            decision_id: "test_decision_1".to_string(),
            timestamp_ms: current_timestamp_ms(),
            decision_type: DecisionType::StepExecution,
            inputs: vec![DataSource {
                source_type: DataSourceType::FileSystem,
                reference: "test.rs".to_string(),
                timestamp_ms: current_timestamp_ms(),
            }],
            rationale: "Test decision for unit testing".to_string(),
            confidence: 0.95,
        }
    }

    #[test]
    fn test_register_agent() {
        let service = DefaultCommitmentService::new();
        let agent_id = "test_agent".to_string();

        let certificate = service.register_agent(&agent_id).unwrap();

        assert_eq!(certificate.agent_id, agent_id);
        assert_eq!(certificate.issuer, "agentic-sdlc-ca");
        assert_eq!(certificate.public_key.len(), 32); // Ed25519 public key size
        assert!(certificate.valid_from <= current_timestamp_ms());
        assert!(certificate.valid_until > certificate.valid_from);
    }

    #[test]
    fn test_sign_decision() {
        let service = DefaultCommitmentService::new();
        let agent_id = "test_agent".to_string();

        // Register agent first
        service.register_agent(&agent_id).unwrap();

        // Sign a decision
        let decision = create_test_decision();
        let signed = service.sign_decision(&decision, &agent_id).unwrap();

        assert_eq!(signed.decision.decision_id, decision.decision_id);
        assert_eq!(signed.signature.algorithm, "Ed25519");
        assert_eq!(signed.signature.value.len(), 64); // Ed25519 signature size
        assert_eq!(signed.certificate.agent_id, agent_id);
    }

    #[test]
    fn test_verify_signature_valid() {
        let service = DefaultCommitmentService::new();
        let agent_id = "test_agent".to_string();

        // Register agent and sign decision
        service.register_agent(&agent_id).unwrap();
        let decision = create_test_decision();
        let signed = service.sign_decision(&decision, &agent_id).unwrap();

        // Verify signature
        let is_valid = service.verify_signature(&signed).unwrap();
        assert!(is_valid, "Signature should be valid");
    }

    #[test]
    fn test_verify_signature_tampered_decision() {
        let service = DefaultCommitmentService::new();
        let agent_id = "test_agent".to_string();

        // Register agent and sign decision
        service.register_agent(&agent_id).unwrap();
        let decision = create_test_decision();
        let mut signed = service.sign_decision(&decision, &agent_id).unwrap();

        // Tamper with the decision
        signed.decision.rationale = "Tampered rationale".to_string();

        // Verify signature should fail
        let is_valid = service.verify_signature(&signed).unwrap();
        assert!(!is_valid, "Signature should be invalid after tampering");
    }

    #[test]
    fn test_verify_signature_tampered_signature() {
        let service = DefaultCommitmentService::new();
        let agent_id = "test_agent".to_string();

        // Register agent and sign decision
        service.register_agent(&agent_id).unwrap();
        let decision = create_test_decision();
        let mut signed = service.sign_decision(&decision, &agent_id).unwrap();

        // Tamper with the signature
        signed.signature.value[0] ^= 0xFF;

        // Verify signature should fail
        let is_valid = service.verify_signature(&signed).unwrap();
        assert!(!is_valid, "Signature should be invalid after tampering");
    }

    #[test]
    fn test_sign_unregistered_agent() {
        let service = DefaultCommitmentService::new();
        let agent_id = "unregistered_agent".to_string();

        let decision = create_test_decision();
        let result = service.sign_decision(&decision, &agent_id);

        assert!(result.is_err());
        match result {
            Err(PlatformError::NotFound(msg)) => {
                assert!(msg.contains("not registered"));
            }
            _ => panic!("Expected NotFound error"),
        }
    }

    #[test]
    fn test_certificate_rotation() {
        let service = DefaultCommitmentService::new();
        let agent_id = "test_agent".to_string();

        // Register agent
        let cert1 = service.register_agent(&agent_id).unwrap();

        // Small delay to ensure different timestamps
        std::thread::sleep(std::time::Duration::from_millis(10));

        // Rotate keys
        let cert2 = service.rotate_keys(&agent_id).unwrap();

        // Certificates should be different
        assert_ne!(cert1.public_key, cert2.public_key);
        assert_ne!(cert1.valid_from, cert2.valid_from);
        assert_eq!(cert1.agent_id, cert2.agent_id);
    }

    #[test]
    fn test_needs_rotation() {
        let service = DefaultCommitmentService::with_rotation_policy(1); // 1 day
        let agent_id = "test_agent".to_string();

        // Register agent
        service.register_agent(&agent_id).unwrap();

        // Should not need rotation immediately
        let needs_rotation = service.needs_rotation(&agent_id).unwrap();
        assert!(!needs_rotation, "Should not need rotation immediately");
    }

    #[test]
    fn test_audit_trail() {
        let service = DefaultCommitmentService::new();
        let agent_id = "test_agent".to_string();
        let workflow_id = "workflow_123".to_string();

        // Register agent
        service.register_agent(&agent_id).unwrap();

        // Sign multiple decisions
        let decision1 = create_test_decision();
        let mut signed1 = service.sign_decision(&decision1, &agent_id).unwrap();
        signed1 = signed1.with_workflow_id(workflow_id.clone());
        signed1.add_to_audit_trail(&service.audit_trail).unwrap();

        let mut decision2 = create_test_decision();
        decision2.decision_id = "test_decision_2".to_string();
        let mut signed2 = service.sign_decision(&decision2, &agent_id).unwrap();
        signed2 = signed2.with_workflow_id(workflow_id.clone());
        signed2.add_to_audit_trail(&service.audit_trail).unwrap();

        // Get audit trail
        let trail = service.get_audit_trail(&workflow_id).unwrap();
        assert_eq!(trail.len(), 2);
        assert_eq!(trail[0].decision.decision_id, "test_decision_1");
        assert_eq!(trail[1].decision.decision_id, "test_decision_2");
    }

    #[test]
    fn test_audit_trail_chronological_order() {
        let service = DefaultCommitmentService::new();
        let agent_id = "test_agent".to_string();
        let workflow_id = "workflow_123".to_string();

        // Register agent
        service.register_agent(&agent_id).unwrap();

        // Sign decisions with different timestamps
        for i in 0..5 {
            let mut decision = create_test_decision();
            decision.decision_id = format!("decision_{}", i);
            let mut signed = service.sign_decision(&decision, &agent_id).unwrap();
            signed = signed.with_workflow_id(workflow_id.clone());
            signed.add_to_audit_trail(&service.audit_trail).unwrap();

            // Small delay to ensure different timestamps
            std::thread::sleep(std::time::Duration::from_millis(10));
        }

        // Get audit trail
        let trail = service.get_audit_trail(&workflow_id).unwrap();
        assert_eq!(trail.len(), 5);

        // Verify chronological order
        for i in 0..4 {
            assert!(
                trail[i].signature.timestamp_ms <= trail[i + 1].signature.timestamp_ms,
                "Audit trail should be in chronological order"
            );
        }
    }

    #[test]
    fn test_get_certificate() {
        let service = DefaultCommitmentService::new();
        let agent_id = "test_agent".to_string();

        // Register agent
        let cert1 = service.register_agent(&agent_id).unwrap();

        // Get certificate
        let cert2 = service.get_certificate(&agent_id).unwrap();

        assert_eq!(cert1.agent_id, cert2.agent_id);
        assert_eq!(cert1.public_key, cert2.public_key);
        assert_eq!(cert1.valid_from, cert2.valid_from);
        assert_eq!(cert1.valid_until, cert2.valid_until);
    }

    #[test]
    fn test_multiple_agents() {
        let service = DefaultCommitmentService::new();
        let agent1 = "agent_1".to_string();
        let agent2 = "agent_2".to_string();

        // Register both agents
        service.register_agent(&agent1).unwrap();
        service.register_agent(&agent2).unwrap();

        // Sign decisions with different agents
        let decision = create_test_decision();
        let signed1 = service.sign_decision(&decision, &agent1).unwrap();
        let signed2 = service.sign_decision(&decision, &agent2).unwrap();

        // Signatures should be different
        assert_ne!(signed1.signature.value, signed2.signature.value);
        assert_ne!(
            signed1.certificate.public_key,
            signed2.certificate.public_key
        );

        // Both should verify
        assert!(service.verify_signature(&signed1).unwrap());
        assert!(service.verify_signature(&signed2).unwrap());
    }
}
