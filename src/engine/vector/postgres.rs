// PostgreSQL + pgvector backend implementation using tokio-postgres

use super::{
    Result, VectorBackend, VectorDocument, VectorError, VectorQuery, VectorSearchResult,
    VectorStats,
};
use async_trait::async_trait;
use pgvector::Vector;
use std::sync::Arc;
use tokio::sync::Mutex;
use tokio_postgres::{Client, NoTls};
use uuid::Uuid;

/// PostgreSQL vector backend
pub struct PostgresVectorBackend {
    client: Arc<Mutex<Client>>,
}

impl PostgresVectorBackend {
    /// Create new PostgreSQL backend
    pub async fn new(database_url: &str) -> Result<Self> {
        let (client, connection) = tokio_postgres::connect(database_url, NoTls)
            .await
            .map_err(|e| VectorError::ConnectionError(e.to_string()))?;

        // Spawn connection handler
        tokio::spawn(async move {
            if let Err(e) = connection.await {
                eprintln!("PostgreSQL connection error: {}", e);
            }
        });

        Ok(Self {
            client: Arc::new(Mutex::new(client)),
        })
    }

    /// Create from environment variable
    pub async fn from_env() -> Result<Self> {
        let database_url = std::env::var("DATABASE_URL")
            .map_err(|_| VectorError::ConfigError("DATABASE_URL not set".to_string()))?;

        Self::new(&database_url).await
    }

    /// Initialize database schema
    pub async fn init_schema(&self) -> Result<()> {
        let client = self.client.lock().await;

        // Enable pgvector extension
        client
            .execute("CREATE EXTENSION IF NOT EXISTS vector", &[])
            .await
            .map_err(|e| VectorError::DatabaseError(e.to_string()))?;

        // Create documents table
        client
            .execute(
                r#"
                CREATE TABLE IF NOT EXISTS vector_documents (
                    id UUID PRIMARY KEY,
                    content TEXT NOT NULL,
                    embedding vector NOT NULL,
                    metadata JSONB NOT NULL DEFAULT '{}',
                    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                )
                "#,
                &[],
            )
            .await
            .map_err(|e| VectorError::DatabaseError(e.to_string()))?;

        // Create index for vector similarity search (HNSW)
        client
            .execute(
                r#"
                CREATE INDEX IF NOT EXISTS vector_documents_embedding_idx
                ON vector_documents
                USING hnsw (embedding vector_cosine_ops)
                "#,
                &[],
            )
            .await
            .map_err(|e| VectorError::DatabaseError(e.to_string()))?;

        // Create index for metadata queries
        client
            .execute(
                r#"
                CREATE INDEX IF NOT EXISTS vector_documents_metadata_idx
                ON vector_documents
                USING gin (metadata)
                "#,
                &[],
            )
            .await
            .map_err(|e| VectorError::DatabaseError(e.to_string()))?;

        Ok(())
    }

    /// Drop all tables (for testing)
    #[cfg(test)]
    pub async fn drop_schema(&self) -> Result<()> {
        let client = self.client.lock().await;
        client
            .execute("DROP TABLE IF EXISTS vector_documents CASCADE", &[])
            .await
            .map_err(|e| VectorError::DatabaseError(e.to_string()))?;

        Ok(())
    }
}

#[async_trait]
impl VectorBackend for PostgresVectorBackend {
    async fn insert(&self, document: VectorDocument) -> Result<Uuid> {
        let embedding = Vector::from(document.embedding.clone());
        let client = self.client.lock().await;

        client
            .execute(
                r#"
                INSERT INTO vector_documents (id, content, embedding, metadata, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6)
                "#,
                &[
                    &document.id,
                    &document.content,
                    &embedding,
                    &document.metadata,
                    &document.created_at,
                    &document.updated_at,
                ],
            )
            .await
            .map_err(|e| VectorError::DatabaseError(e.to_string()))?;

        Ok(document.id)
    }

    async fn insert_batch(&self, documents: Vec<VectorDocument>) -> Result<Vec<Uuid>> {
        let mut ids = Vec::new();
        let mut client = self.client.lock().await;

        // Use transaction for batch insert
        let transaction = client
            .transaction()
            .await
            .map_err(|e| VectorError::DatabaseError(e.to_string()))?;

        for document in documents {
            let embedding = Vector::from(document.embedding.clone());

            transaction
                .execute(
                    r#"
                    INSERT INTO vector_documents (id, content, embedding, metadata, created_at, updated_at)
                    VALUES ($1, $2, $3, $4, $5, $6)
                    "#,
                    &[
                        &document.id,
                        &document.content,
                        &embedding,
                        &document.metadata,
                        &document.created_at,
                        &document.updated_at,
                    ],
                )
                .await
                .map_err(|e| VectorError::DatabaseError(e.to_string()))?;

            ids.push(document.id);
        }

        transaction
            .commit()
            .await
            .map_err(|e| VectorError::DatabaseError(e.to_string()))?;

        Ok(ids)
    }

    async fn get(&self, id: Uuid) -> Result<Option<VectorDocument>> {
        let client = self.client.lock().await;

        let row = client
            .query_opt(
                r#"
                SELECT id, content, embedding, metadata, created_at, updated_at
                FROM vector_documents
                WHERE id = $1
                "#,
                &[&id],
            )
            .await
            .map_err(|e| VectorError::DatabaseError(e.to_string()))?;

        match row {
            Some(row) => {
                let embedding: Vector = row.get("embedding");
                Ok(Some(VectorDocument {
                    id: row.get("id"),
                    content: row.get("content"),
                    embedding: embedding.to_vec(),
                    metadata: row.get("metadata"),
                    created_at: row.get("created_at"),
                    updated_at: row.get("updated_at"),
                }))
            }
            None => Ok(None),
        }
    }

    async fn update(&self, document: VectorDocument) -> Result<()> {
        let embedding = Vector::from(document.embedding.clone());
        let client = self.client.lock().await;

        let rows_affected = client
            .execute(
                r#"
                UPDATE vector_documents
                SET content = $2, embedding = $3, metadata = $4, updated_at = $5
                WHERE id = $1
                "#,
                &[
                    &document.id,
                    &document.content,
                    &embedding,
                    &document.metadata,
                    &document.updated_at,
                ],
            )
            .await
            .map_err(|e| VectorError::DatabaseError(e.to_string()))?;

        if rows_affected == 0 {
            return Err(VectorError::DocumentNotFound(document.id.to_string()));
        }

        Ok(())
    }

    async fn delete(&self, id: Uuid) -> Result<()> {
        let client = self.client.lock().await;

        let rows_affected = client
            .execute(
                r#"
                DELETE FROM vector_documents
                WHERE id = $1
                "#,
                &[&id],
            )
            .await
            .map_err(|e| VectorError::DatabaseError(e.to_string()))?;

        if rows_affected == 0 {
            return Err(VectorError::DocumentNotFound(id.to_string()));
        }

        Ok(())
    }

    async fn search(&self, query: VectorQuery) -> Result<Vec<VectorSearchResult>> {
        let embedding = Vector::from(query.embedding.clone());
        let client = self.client.lock().await;

        // Build query with optional filter
        let sql = if query.filter.is_some() {
            r#"
            SELECT id, content, embedding, metadata, created_at, updated_at,
                   1 - (embedding <=> $1) as score,
                   embedding <=> $1 as distance
            FROM vector_documents
            WHERE metadata @> $3
            ORDER BY embedding <=> $1
            LIMIT $2
            "#
        } else {
            r#"
            SELECT id, content, embedding, metadata, created_at, updated_at,
                   1 - (embedding <=> $1) as score,
                   embedding <=> $1 as distance
            FROM vector_documents
            ORDER BY embedding <=> $1
            LIMIT $2
            "#
        };

        let rows = if let Some(filter) = query.filter {
            client
                .query(sql, &[&embedding, &(query.limit as i64), &filter])
                .await
        } else {
            client
                .query(sql, &[&embedding, &(query.limit as i64)])
                .await
        }
        .map_err(|e| VectorError::QueryError(e.to_string()))?;

        let mut results = Vec::new();
        for row in rows {
            let embedding: Vector = row.get("embedding");
            let score: f32 = row.get("score");
            let distance: f32 = row.get("distance");

            // Apply threshold if specified
            if let Some(threshold) = query.threshold {
                if score < threshold {
                    continue;
                }
            }

            results.push(VectorSearchResult {
                document: VectorDocument {
                    id: row.get("id"),
                    content: row.get("content"),
                    embedding: embedding.to_vec(),
                    metadata: row.get("metadata"),
                    created_at: row.get("created_at"),
                    updated_at: row.get("updated_at"),
                },
                score,
                distance,
            });
        }

        Ok(results)
    }

    async fn stats(&self) -> Result<VectorStats> {
        let client = self.client.lock().await;

        let row = client
            .query_one(
                r#"
                SELECT 
                    COUNT(*) as total_documents,
                    COALESCE(SUM(pg_column_size(embedding)), 0) as total_size_bytes,
                    COALESCE(AVG(array_length(embedding::real[], 1)), 0) as avg_embedding_dim
                FROM vector_documents
                "#,
                &[],
            )
            .await
            .map_err(|e| VectorError::DatabaseError(e.to_string()))?;

        Ok(VectorStats {
            total_documents: row.get("total_documents"),
            total_size_bytes: row.get("total_size_bytes"),
            avg_embedding_dim: row.get::<_, f64>("avg_embedding_dim") as i32,
        })
    }

    async fn clear(&self) -> Result<()> {
        let client = self.client.lock().await;

        client
            .execute("DELETE FROM vector_documents", &[])
            .await
            .map_err(|e| VectorError::DatabaseError(e.to_string()))?;

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    async fn setup_test_backend() -> PostgresVectorBackend {
        // Use test database
        let database_url = std::env::var("TEST_DATABASE_URL")
            .unwrap_or_else(|_| "postgresql://localhost/agentic_sdlc_test".to_string());

        let backend = PostgresVectorBackend::new(&database_url)
            .await
            .expect("Failed to connect to test database");

        backend
            .init_schema()
            .await
            .expect("Failed to initialize schema");

        backend.clear().await.expect("Failed to clear database");

        backend
    }

    #[tokio::test]
    #[ignore] // Requires PostgreSQL
    async fn test_insert_and_get() {
        let backend = setup_test_backend().await;

        let doc = VectorDocument::new(
            "test content".to_string(),
            vec![0.1, 0.2, 0.3],
            serde_json::json!({"key": "value"}),
        );

        let id = backend.insert(doc.clone()).await.unwrap();

        let retrieved = backend.get(id).await.unwrap().unwrap();

        assert_eq!(retrieved.content, doc.content);
        assert_eq!(retrieved.embedding, doc.embedding);
    }

    #[tokio::test]
    #[ignore] // Requires PostgreSQL
    async fn test_search() {
        let backend = setup_test_backend().await;

        // Insert test documents
        let doc1 = VectorDocument::new(
            "document 1".to_string(),
            vec![1.0, 0.0, 0.0],
            serde_json::json!({}),
        );
        let doc2 = VectorDocument::new(
            "document 2".to_string(),
            vec![0.0, 1.0, 0.0],
            serde_json::json!({}),
        );

        backend.insert(doc1).await.unwrap();
        backend.insert(doc2).await.unwrap();

        // Search for similar to doc1
        let query = VectorQuery::new(vec![0.9, 0.1, 0.0]).with_limit(1);

        let results = backend.search(query).await.unwrap();

        assert_eq!(results.len(), 1);
        assert_eq!(results[0].document.content, "document 1");
    }

    #[tokio::test]
    #[ignore] // Requires PostgreSQL
    async fn test_stats() {
        let backend = setup_test_backend().await;

        let doc = VectorDocument::new(
            "test".to_string(),
            vec![0.1, 0.2, 0.3],
            serde_json::json!({}),
        );

        backend.insert(doc).await.unwrap();

        let stats = backend.stats().await.unwrap();

        assert_eq!(stats.total_documents, 1);
        assert_eq!(stats.avg_embedding_dim, 3);
    }
}
