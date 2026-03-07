// Vector store module
//
// Provides scalable vector storage with PostgreSQL + pgvector backend.

pub mod types;
pub mod error;
pub mod backend;
pub mod postgres;

pub use types::*;
pub use error::*;
pub use backend::VectorBackend;
pub use postgres::PostgresVectorBackend;
