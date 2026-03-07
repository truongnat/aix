// Error types for vector store

use std::fmt;

#[derive(Debug)]
pub enum VectorError {
    /// Database error
    DatabaseError(String),
    
    /// Connection error
    ConnectionError(String),
    
    /// Document not found
    DocumentNotFound(String),
    
    /// Invalid embedding dimension
    InvalidDimension(String),
    
    /// Query error
    QueryError(String),
    
    /// Migration error
    MigrationError(String),
    
    /// Configuration error
    ConfigError(String),
    
    /// Serialization error
    SerializationError(String),
    
    /// Other error
    Other(String),
}

impl fmt::Display for VectorError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            VectorError::DatabaseError(msg) => write!(f, "Database error: {}", msg),
            VectorError::ConnectionError(msg) => write!(f, "Connection error: {}", msg),
            VectorError::DocumentNotFound(msg) => write!(f, "Document not found: {}", msg),
            VectorError::InvalidDimension(msg) => write!(f, "Invalid dimension: {}", msg),
            VectorError::QueryError(msg) => write!(f, "Query error: {}", msg),
            VectorError::MigrationError(msg) => write!(f, "Migration error: {}", msg),
            VectorError::ConfigError(msg) => write!(f, "Configuration error: {}", msg),
            VectorError::SerializationError(msg) => write!(f, "Serialization error: {}", msg),
            VectorError::Other(msg) => write!(f, "Error: {}", msg),
        }
    }
}

impl std::error::Error for VectorError {}

impl From<tokio_postgres::Error> for VectorError {
    fn from(err: tokio_postgres::Error) -> Self {
        VectorError::DatabaseError(err.to_string())
    }
}

impl From<serde_json::Error> for VectorError {
    fn from(err: serde_json::Error) -> Self {
        VectorError::SerializationError(err.to_string())
    }
}

pub type Result<T> = std::result::Result<T, VectorError>;
