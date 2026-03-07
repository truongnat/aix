// Common types for vector store

use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Vector document
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VectorDocument {
    pub id: Uuid,
    pub content: String,
    pub embedding: Vec<f32>,
    pub metadata: serde_json::Value,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
}

/// Vector search query
#[derive(Debug, Clone)]
pub struct VectorQuery {
    pub embedding: Vec<f32>,
    pub limit: usize,
    pub threshold: Option<f32>,
    pub filter: Option<serde_json::Value>,
}

/// Vector search result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VectorSearchResult {
    pub document: VectorDocument,
    pub score: f32,
    pub distance: f32,
}

/// Vector store statistics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VectorStats {
    pub total_documents: i64,
    pub total_size_bytes: i64,
    pub avg_embedding_dim: i32,
}

impl VectorDocument {
    pub fn new(content: String, embedding: Vec<f32>, metadata: serde_json::Value) -> Self {
        let now = chrono::Utc::now();
        Self {
            id: Uuid::new_v4(),
            content,
            embedding,
            metadata,
            created_at: now,
            updated_at: now,
        }
    }
}

impl VectorQuery {
    pub fn new(embedding: Vec<f32>) -> Self {
        Self {
            embedding,
            limit: 10,
            threshold: None,
            filter: None,
        }
    }

    pub fn with_limit(mut self, limit: usize) -> Self {
        self.limit = limit;
        self
    }

    pub fn with_threshold(mut self, threshold: f32) -> Self {
        self.threshold = Some(threshold);
        self
    }

    pub fn with_filter(mut self, filter: serde_json::Value) -> Self {
        self.filter = Some(filter);
        self
    }
}
