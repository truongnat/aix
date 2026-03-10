// Tier 3: Trust & Verification
//
// This tier provides formal verification, adversarial testing,
// and cryptographic commitment for trust and security.

pub mod formal_verifier;
pub mod verifiers;
pub mod adversarial_tester;
pub mod attack_vectors;
pub mod commitment;

#[cfg(test)]
mod integration_tests;

// Re-exports for formal verifier
pub use formal_verifier::{
    Artifact, ArtifactContent, Claim, DefaultFormalVerifier, FormalVerifier,
};

// Re-exports for built-in verifiers

// Re-exports for adversarial tester
pub use adversarial_tester::DefaultAdversarialTester;

// Re-exports for built-in attack vectors

// Re-exports for commitment service
pub use commitment::{
    CommitmentService, DefaultCommitmentService,
};
