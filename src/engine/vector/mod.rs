// Vector store module
//
// Provides scalable vector storage with PostgreSQL + pgvector backend.

#![allow(dead_code)]

pub mod backend;
pub mod error;
pub mod postgres;
pub mod types;

pub use backend::VectorBackend;
pub use error::*;
pub use types::*;
