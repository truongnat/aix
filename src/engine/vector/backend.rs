// Vector backend trait

use super::{Result, VectorDocument, VectorQuery, VectorSearchResult, VectorStats};
use async_trait::async_trait;
use uuid::Uuid;

/// Vector backend trait
#[async_trait]
pub trait VectorBackend: Send + Sync {
    /// Insert a document
    async fn insert(&self, document: VectorDocument) -> Result<Uuid>;

    /// Insert multiple documents
    async fn insert_batch(&self, documents: Vec<VectorDocument>) -> Result<Vec<Uuid>>;

    /// Get a document by ID
    async fn get(&self, id: Uuid) -> Result<Option<VectorDocument>>;

    /// Update a document
    async fn update(&self, document: VectorDocument) -> Result<()>;

    /// Delete a document
    async fn delete(&self, id: Uuid) -> Result<()>;

    /// Search for similar vectors
    async fn search(&self, query: VectorQuery) -> Result<Vec<VectorSearchResult>>;

    /// Get statistics
    async fn stats(&self) -> Result<VectorStats>;

    /// Clear all documents
    async fn clear(&self) -> Result<()>;
}
