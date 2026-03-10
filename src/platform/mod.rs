// Platform improvements module - 5-tier architecture for enterprise adoption
//
// This module implements the next-level platform improvements organized into 5 tiers:
// - Tier 1: Execution Intelligence (adaptive planning, causal tracing, feedback)
// - Tier 2: Multi-Agent Coordination (negotiation, shared memory, marketplace)
// - Tier 3: Trust & Verification (formal verification, adversarial testing, commitment)
// - Tier 4: Organizational Scale (cost tracking, human review, tenant isolation)
// - Tier 5: Ecosystem (benchmarking, diff learning, workflow marketplace)

pub mod config;
pub mod error;
pub mod telemetry;
pub mod types;

// Tier 1: Execution Intelligence
pub mod tier1_execution_intelligence;

// Tier 2: Multi-Agent Coordination
pub mod tier2_multi_agent;

// Tier 3: Trust & Verification
pub mod tier3_trust_verification;

// Tier 4: Organizational Scale
pub mod tier4_organizational;

// Tier 5: Ecosystem & Network Effects
pub mod tier5_ecosystem;

// Integration module - wires all tiers into workflow engine
pub mod integration;

// End-to-end integration tests
#[cfg(test)]
mod e2e_integration_tests;

// Re-exports for convenience
pub use error::{PlatformError, Result};
