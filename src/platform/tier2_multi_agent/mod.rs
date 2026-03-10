// Tier 2: Multi-Agent Coordination
//
// This tier provides negotiation protocols, shared memory with CRDT,
// and agent marketplace for multi-agent collaboration.

pub mod negotiation;
pub mod shared_memory;
pub mod marketplace;

// Re-exports
pub use negotiation::NegotiationProtocol;
pub use shared_memory::SharedMemory;
pub use marketplace::AgentMarketplace;
