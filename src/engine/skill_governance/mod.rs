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

#![allow(dead_code)]

pub mod audit;
pub mod crypto;
pub mod registry;
pub mod types;
pub mod verifier;
