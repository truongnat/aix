//! Office Module - Company Simulation with Multiple Roles
//!
//! This module provides a multi-role agent simulation system where
//! different roles (CEO, CTO, PM, Engineer, Designer, QA) can work
//! in parallel on tasks.

pub mod agent;
#[allow(clippy::module_inception)]
pub mod office;
pub mod roles;
pub mod runtime;
pub mod state_store;
pub mod tasks;

pub use office::Office;
pub use state_store::OfficeStateStore;
