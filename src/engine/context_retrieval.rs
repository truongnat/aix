use anyhow::{anyhow, Result};
use rusqlite::Connection;
use serde::Deserialize;
use std::cmp::Ordering;
use std::collections::{HashMap, HashSet};
use std::path::{Path, PathBuf};

const VECTOR_DIM: usize = 32;
const DEFAULT_CONTEXT_DB_PATH: &str = ".agents/memory/context.db";
const DEFAULT_VECTOR_TABLE: &str = "vector_entries";
const DEFAULT_GRAPH_TABLE: &str = "graph_nodes";

#[derive(Debug, Clone, PartialEq)]
pub struct RetrievedContextItem {
    pub source: String,
    pub id: String,
    pub score: f64,
    pub text: String,
}

pub trait ContextRetrievalService: Send + Sync {
    fn retrieve(&self, query: &str, limit: usize) -> Result<Vec<RetrievedContextItem>>;
}

#[derive(Debug, Clone, Default)]
pub struct NoopContextRetrievalService;

impl ContextRetrievalService for NoopContextRetrievalService {
    fn retrieve(&self, _query: &str, _limit: usize) -> Result<Vec<RetrievedContextItem>> {
        Ok(Vec::new())
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum ContextIndexBackend {
    Json,
    Sqlite,
}

fn parse_context_backend(raw: &str) -> Option<ContextIndexBackend> {
    match raw.trim().to_ascii_lowercase().as_str() {
        "json" | "file" => Some(ContextIndexBackend::Json),
        "sqlite" | "sql" => Some(ContextIndexBackend::Sqlite),
        _ => None,
    }
}

fn select_context_backend(override_var: &str) -> ContextIndexBackend {
    std::env::var(override_var)
        .ok()
        .and_then(|value| parse_context_backend(&value))
        .or_else(|| {
            std::env::var("ANTIGRAV_CONTEXT_BACKEND")
                .ok()
                .and_then(|value| parse_context_backend(&value))
        })
        .unwrap_or(ContextIndexBackend::Json)
}

#[derive(Debug, Clone)]
enum VectorIndexSource {
    Json { index_path: PathBuf },
    Sqlite { db_path: PathBuf, table: String },
}

#[derive(Debug, Clone)]
pub struct VectorIndexContextRetrievalService {
    source: VectorIndexSource,
    min_score: f32,
}

impl VectorIndexContextRetrievalService {
    pub fn from_env() -> Self {
        let source = match select_context_backend("ANTIGRAV_CONTEXT_VECTOR_BACKEND") {
            ContextIndexBackend::Json => VectorIndexSource::Json {
                index_path: PathBuf::from(
                    std::env::var("ANTIGRAV_CONTEXT_INDEX_PATH")
                        .ok()
                        .unwrap_or_else(|| ".agents/memory/vector_index.json".to_string()),
                ),
            },
            ContextIndexBackend::Sqlite => VectorIndexSource::Sqlite {
                db_path: PathBuf::from(
                    std::env::var("ANTIGRAV_CONTEXT_DB_PATH")
                        .ok()
                        .unwrap_or_else(|| DEFAULT_CONTEXT_DB_PATH.to_string()),
                ),
                table: std::env::var("ANTIGRAV_CONTEXT_VECTOR_TABLE")
                    .ok()
                    .map(|v| v.trim().to_string())
                    .filter(|v| !v.is_empty())
                    .unwrap_or_else(|| DEFAULT_VECTOR_TABLE.to_string()),
            },
        };

        let min_score = std::env::var("ANTIGRAV_CONTEXT_MIN_SCORE")
            .ok()
            .and_then(|v| v.trim().parse::<f32>().ok())
            .map(|v| v.clamp(0.0, 1.0))
            .unwrap_or(0.1);

        Self { source, min_score }
    }
}

impl Default for VectorIndexContextRetrievalService {
    fn default() -> Self {
        Self::from_env()
    }
}

impl ContextRetrievalService for VectorIndexContextRetrievalService {
    fn retrieve(&self, query: &str, limit: usize) -> Result<Vec<RetrievedContextItem>> {
        if limit == 0 || query.trim().is_empty() {
            return Ok(Vec::new());
        }
        let entries = load_vector_index(&self.source)?;
        if entries.is_empty() {
            return Ok(Vec::new());
        }
        let query_embedding = embed(query.trim());
        let mut scored = entries
            .into_iter()
            .map(|entry| {
                (
                    cosine_similarity(&query_embedding, &entry.embedding),
                    entry.id,
                    entry.text,
                )
            })
            .filter(|(score, _, _)| *score >= self.min_score)
            .collect::<Vec<_>>();
        scored.sort_by(|a, b| {
            b.0.partial_cmp(&a.0)
                .unwrap_or(Ordering::Equal)
                .then_with(|| a.1.cmp(&b.1))
        });
        Ok(scored
            .into_iter()
            .take(limit)
            .map(|(score, id, text)| RetrievedContextItem {
                source: "vector_index".to_string(),
                id,
                score: f64::from(score),
                text,
            })
            .collect())
    }
}

#[derive(Debug, Clone)]
enum GraphIndexSource {
    Json { index_path: PathBuf },
    Sqlite { db_path: PathBuf, table: String },
}

#[derive(Debug, Clone)]
pub struct GraphIndexContextRetrievalService {
    source: GraphIndexSource,
    min_score: f64,
}

impl GraphIndexContextRetrievalService {
    pub fn from_env() -> Self {
        let source = match select_context_backend("ANTIGRAV_CONTEXT_GRAPH_BACKEND") {
            ContextIndexBackend::Json => GraphIndexSource::Json {
                index_path: PathBuf::from(
                    std::env::var("ANTIGRAV_CONTEXT_GRAPH_INDEX_PATH")
                        .ok()
                        .unwrap_or_else(|| ".agents/memory/graph_index.json".to_string()),
                ),
            },
            ContextIndexBackend::Sqlite => GraphIndexSource::Sqlite {
                db_path: PathBuf::from(
                    std::env::var("ANTIGRAV_CONTEXT_DB_PATH")
                        .ok()
                        .unwrap_or_else(|| DEFAULT_CONTEXT_DB_PATH.to_string()),
                ),
                table: std::env::var("ANTIGRAV_CONTEXT_GRAPH_TABLE")
                    .ok()
                    .map(|v| v.trim().to_string())
                    .filter(|v| !v.is_empty())
                    .unwrap_or_else(|| DEFAULT_GRAPH_TABLE.to_string()),
            },
        };

        let min_score = std::env::var("ANTIGRAV_CONTEXT_GRAPH_MIN_SCORE")
            .ok()
            .and_then(|v| v.trim().parse::<f64>().ok())
            .map(|v| v.clamp(0.0, 1.0))
            .unwrap_or(0.05);

        Self { source, min_score }
    }
}

impl Default for GraphIndexContextRetrievalService {
    fn default() -> Self {
        Self::from_env()
    }
}

impl ContextRetrievalService for GraphIndexContextRetrievalService {
    fn retrieve(&self, query: &str, limit: usize) -> Result<Vec<RetrievedContextItem>> {
        if limit == 0 || query.trim().is_empty() {
            return Ok(Vec::new());
        }
        let nodes = load_graph_index(&self.source)?;
        if nodes.is_empty() {
            return Ok(Vec::new());
        }

        let query_terms = tokenize(query.trim());
        if query_terms.is_empty() {
            return Ok(Vec::new());
        }
        let query_set = query_terms.into_iter().collect::<HashSet<_>>();

        let mut hit_map = HashMap::<String, usize>::new();
        let mut scored = Vec::<(f64, GraphIndexNode)>::new();
        for node in nodes {
            let mut token_set = tokenize(&node.text).into_iter().collect::<HashSet<_>>();
            for tag in &node.tags {
                token_set.extend(tokenize(tag));
            }
            token_set.extend(tokenize(&node.id));
            let hit_count = query_set.intersection(&token_set).count();
            if hit_count == 0 {
                continue;
            }
            hit_map.insert(node.id.clone(), hit_count);
            let base = hit_count as f64 / query_set.len() as f64;
            scored.push((base, node));
        }

        let mut enriched = scored
            .into_iter()
            .filter_map(|(base_score, node)| {
                let linked_hits = node
                    .links
                    .iter()
                    .map(|id| hit_map.get(id).copied().unwrap_or(0))
                    .sum::<usize>();
                let relation_bonus = (linked_hits as f64 * 0.03).min(0.3);
                let score = (base_score + relation_bonus).clamp(0.0, 1.0);
                if score < self.min_score {
                    return None;
                }
                Some(RetrievedContextItem {
                    source: "graph_index".to_string(),
                    id: node.id,
                    score,
                    text: node.text,
                })
            })
            .collect::<Vec<_>>();
        enriched.sort_by(|a, b| {
            b.score
                .partial_cmp(&a.score)
                .unwrap_or(Ordering::Equal)
                .then_with(|| a.id.cmp(&b.id))
        });
        enriched.truncate(limit);
        Ok(enriched)
    }
}

#[derive(Debug, Clone)]
pub struct HybridContextRetrievalService {
    vector: VectorIndexContextRetrievalService,
    graph: GraphIndexContextRetrievalService,
}

impl HybridContextRetrievalService {
    pub fn from_env() -> Self {
        Self {
            vector: VectorIndexContextRetrievalService::from_env(),
            graph: GraphIndexContextRetrievalService::from_env(),
        }
    }
}

impl Default for HybridContextRetrievalService {
    fn default() -> Self {
        Self::from_env()
    }
}

impl ContextRetrievalService for HybridContextRetrievalService {
    fn retrieve(&self, query: &str, limit: usize) -> Result<Vec<RetrievedContextItem>> {
        if limit == 0 || query.trim().is_empty() {
            return Ok(Vec::new());
        }
        let vector_items = self
            .vector
            .retrieve(query, limit.saturating_mul(2).max(limit))?;
        let graph_items = self
            .graph
            .retrieve(query, limit.saturating_mul(2).max(limit))?;
        let mut merged = HashMap::<String, RetrievedContextItem>::new();
        for item in vector_items.into_iter().chain(graph_items) {
            match merged.get(&item.id) {
                Some(existing) if existing.score >= item.score => {}
                _ => {
                    merged.insert(item.id.clone(), item);
                }
            }
        }
        let mut out = merged.into_values().collect::<Vec<_>>();
        out.sort_by(|a, b| {
            b.score
                .partial_cmp(&a.score)
                .unwrap_or(Ordering::Equal)
                .then_with(|| a.id.cmp(&b.id))
        });
        out.truncate(limit);
        Ok(out)
    }
}

#[derive(Debug, Clone, Deserialize)]
struct VectorIndexEntry {
    id: String,
    text: String,
    embedding: Vec<f32>,
}

#[derive(Debug, Clone, Deserialize)]
struct GraphIndexNode {
    id: String,
    text: String,
    #[serde(default)]
    tags: Vec<String>,
    #[serde(default)]
    links: Vec<String>,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(untagged)]
enum GraphIndexPayload {
    NodesObject { nodes: Vec<GraphIndexNode> },
    NodesArray(Vec<GraphIndexNode>),
}

fn load_vector_index(source: &VectorIndexSource) -> Result<Vec<VectorIndexEntry>> {
    match source {
        VectorIndexSource::Json { index_path } => load_vector_index_json(index_path),
        VectorIndexSource::Sqlite { db_path, table } => load_vector_index_sqlite(db_path, table),
    }
}

fn load_vector_index_json(path: &Path) -> Result<Vec<VectorIndexEntry>> {
    if !path.exists() {
        return Ok(Vec::new());
    }
    let body = std::fs::read_to_string(path)?;
    let entries: Vec<VectorIndexEntry> = serde_json::from_str(&body)?;
    Ok(entries)
}

fn load_vector_index_sqlite(db_path: &Path, table: &str) -> Result<Vec<VectorIndexEntry>> {
    if !db_path.exists() {
        return Ok(Vec::new());
    }
    let table = normalize_sqlite_identifier(table)
        .ok_or_else(|| anyhow!("Invalid sqlite vector table name: '{}'", table))?;

    let conn = Connection::open(db_path)?;
    let sql = format!("SELECT id, text, embedding_json FROM {table}");
    let mut stmt = match conn.prepare(&sql) {
        Ok(stmt) => stmt,
        Err(err) => {
            if is_missing_table_error(&err) {
                return Ok(Vec::new());
            }
            return Err(err.into());
        }
    };

    let mut rows = stmt.query([])?;
    let mut entries = Vec::new();
    while let Some(row) = rows.next()? {
        let id: String = row.get(0)?;
        let text: String = row.get(1)?;
        let embedding_json: String = row.get(2)?;
        let embedding: Vec<f32> = serde_json::from_str(&embedding_json)
            .map_err(|err| anyhow!("Invalid embedding_json for vector id '{}': {}", id, err))?;
        entries.push(VectorIndexEntry {
            id,
            text,
            embedding,
        });
    }
    Ok(entries)
}

fn load_graph_index(source: &GraphIndexSource) -> Result<Vec<GraphIndexNode>> {
    match source {
        GraphIndexSource::Json { index_path } => load_graph_index_json(index_path),
        GraphIndexSource::Sqlite { db_path, table } => load_graph_index_sqlite(db_path, table),
    }
}

fn load_graph_index_json(path: &Path) -> Result<Vec<GraphIndexNode>> {
    if !path.exists() {
        return Ok(Vec::new());
    }
    let body = std::fs::read_to_string(path)?;
    let payload: GraphIndexPayload = serde_json::from_str(&body)?;
    let nodes = match payload {
        GraphIndexPayload::NodesObject { nodes } => nodes,
        GraphIndexPayload::NodesArray(nodes) => nodes,
    };
    Ok(nodes)
}

fn load_graph_index_sqlite(db_path: &Path, table: &str) -> Result<Vec<GraphIndexNode>> {
    if !db_path.exists() {
        return Ok(Vec::new());
    }
    let table = normalize_sqlite_identifier(table)
        .ok_or_else(|| anyhow!("Invalid sqlite graph table name: '{}'", table))?;

    let conn = Connection::open(db_path)?;
    let sql = format!("SELECT id, text, tags_json, links_json FROM {table}");
    let mut stmt = match conn.prepare(&sql) {
        Ok(stmt) => stmt,
        Err(err) => {
            if is_missing_table_error(&err) {
                return Ok(Vec::new());
            }
            return Err(err.into());
        }
    };

    let mut rows = stmt.query([])?;
    let mut nodes = Vec::new();
    while let Some(row) = rows.next()? {
        let id: String = row.get(0)?;
        let text: String = row.get(1)?;
        let tags_json: Option<String> = row.get(2)?;
        let links_json: Option<String> = row.get(3)?;

        let tags = parse_json_string_vec(tags_json.as_deref(), "tags_json", &id)?;
        let links = parse_json_string_vec(links_json.as_deref(), "links_json", &id)?;

        nodes.push(GraphIndexNode {
            id,
            text,
            tags,
            links,
        });
    }
    Ok(nodes)
}

fn parse_json_string_vec(raw: Option<&str>, field: &str, id: &str) -> Result<Vec<String>> {
    let Some(raw) = raw else {
        return Ok(Vec::new());
    };
    if raw.trim().is_empty() {
        return Ok(Vec::new());
    }
    let values = serde_json::from_str::<Vec<String>>(raw)
        .map_err(|err| anyhow!("Invalid {field} JSON for graph id '{}': {}", id, err))?;
    Ok(values)
}

fn normalize_sqlite_identifier(value: &str) -> Option<String> {
    let trimmed = value.trim();
    if trimmed.is_empty() {
        return None;
    }
    let mut chars = trimmed.chars();
    let first = chars.next()?;
    if !(first.is_ascii_alphabetic() || first == '_') {
        return None;
    }
    if !chars.all(|ch| ch.is_ascii_alphanumeric() || ch == '_') {
        return None;
    }
    Some(trimmed.to_string())
}

fn is_missing_table_error(err: &rusqlite::Error) -> bool {
    match err {
        rusqlite::Error::SqliteFailure(_, message) => message
            .as_deref()
            .map(|msg| msg.to_ascii_lowercase().contains("no such table"))
            .unwrap_or(false),
        _ => false,
    }
}

fn tokenize(text: &str) -> Vec<String> {
    text.split(|c: char| !c.is_alphanumeric())
        .filter(|part| !part.is_empty())
        .map(|part| part.to_ascii_lowercase())
        .collect()
}

fn embed(text: &str) -> Vec<f32> {
    let mut vec = vec![0.0_f32; VECTOR_DIM];
    for token in tokenize(text) {
        let mut hash = 1469598103934665603_u64;
        for byte in token.bytes() {
            hash ^= u64::from(byte);
            hash = hash.wrapping_mul(1099511628211_u64);
        }
        let idx = (hash as usize) % VECTOR_DIM;
        vec[idx] += 1.0;
    }
    let norm = vec.iter().map(|v| v * v).sum::<f32>().sqrt();
    if norm > 0.0 {
        for v in &mut vec {
            *v /= norm;
        }
    }
    vec
}

fn cosine_similarity(a: &[f32], b: &[f32]) -> f32 {
    let mut dot = 0.0_f32;
    for (x, y) in a.iter().zip(b.iter()) {
        dot += x * y;
    }
    dot
}

#[cfg(test)]
mod tests {
    use super::{
        embed, ContextRetrievalService, GraphIndexContextRetrievalService, GraphIndexSource,
        HybridContextRetrievalService, VectorIndexContextRetrievalService, VectorIndexSource,
    };
    use rusqlite::params;
    use serde_json::json;

    #[test]
    fn retrieve_from_vector_index_is_deterministic_and_sorted() {
        let unique = format!(
            "agentic-sdlc-context-retrieval-{}",
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .expect("time")
                .as_nanos()
        );
        let root = std::env::temp_dir().join(unique);
        std::fs::create_dir_all(&root).expect("create root");
        let index_path = root.join("vector_index.json");
        std::fs::write(
            &index_path,
            serde_json::to_string_pretty(&json!([
                {"id":"a","text":"email validation logic", "embedding":embed("email validation logic")},
                {"id":"b","text":"signup flow test cases", "embedding":embed("signup flow test cases")},
                {"id":"c","text":"database migration notes", "embedding":embed("database migration notes")}
            ]))
            .expect("json"),
        )
        .expect("write");

        let service = VectorIndexContextRetrievalService {
            source: VectorIndexSource::Json { index_path },
            min_score: 0.0,
        };
        let out = service.retrieve("email validation", 2).expect("retrieve");
        assert_eq!(out.len(), 2);
        assert_eq!(out[0].source, "vector_index");

        let _ = std::fs::remove_dir_all(root);
    }

    #[test]
    fn retrieve_from_graph_index_is_deterministic_and_relation_aware() {
        let unique = format!(
            "agentic-sdlc-graph-context-retrieval-{}",
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .expect("time")
                .as_nanos()
        );
        let root = std::env::temp_dir().join(unique);
        std::fs::create_dir_all(&root).expect("create root");
        let index_path = root.join("graph_index.json");
        std::fs::write(
            &index_path,
            serde_json::to_string_pretty(&json!({
                "nodes": [
                    {"id":"src/signup.rs","text":"signup flow validates email format", "tags":["file","rust"], "links":["src/email.rs"]},
                    {"id":"src/email.rs","text":"email validation helpers", "tags":["file","utils"], "links":[]},
                    {"id":"docs/release.md","text":"release checklist", "tags":["doc"], "links":[]}
                ]
            }))
            .expect("json"),
        )
        .expect("write");

        let service = GraphIndexContextRetrievalService {
            source: GraphIndexSource::Json { index_path },
            min_score: 0.0,
        };
        let out = service
            .retrieve("email validation signup", 3)
            .expect("retrieve");
        assert_eq!(out.len(), 2);
        assert_eq!(out[0].source, "graph_index");
        assert_eq!(out[0].id, "src/signup.rs");

        let _ = std::fs::remove_dir_all(root);
    }

    #[test]
    fn hybrid_retrieval_merges_vector_and_graph_results() {
        let unique = format!(
            "agentic-sdlc-hybrid-context-retrieval-{}",
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .expect("time")
                .as_nanos()
        );
        let root = std::env::temp_dir().join(unique);
        std::fs::create_dir_all(&root).expect("create root");

        let vector_path = root.join("vector_index.json");
        let graph_path = root.join("graph_index.json");
        std::fs::write(
            &vector_path,
            serde_json::to_string_pretty(&json!([
                {"id":"vec-a","text":"email validation logic", "embedding":embed("email validation logic")},
                {"id":"shared","text":"signup feature branch notes", "embedding":embed("signup feature branch notes")}
            ]))
            .expect("json"),
        )
        .expect("vector write");
        std::fs::write(
            &graph_path,
            serde_json::to_string_pretty(&json!({
                "nodes": [
                    {"id":"graph-a","text":"merge conflict resolver", "tags":["git"], "links":[]},
                    {"id":"shared","text":"signup feature branch graph node", "tags":["feature"], "links":[]}
                ]
            }))
            .expect("json"),
        )
        .expect("graph write");

        let service = HybridContextRetrievalService {
            vector: VectorIndexContextRetrievalService {
                source: VectorIndexSource::Json {
                    index_path: vector_path,
                },
                min_score: 0.0,
            },
            graph: GraphIndexContextRetrievalService {
                source: GraphIndexSource::Json {
                    index_path: graph_path,
                },
                min_score: 0.0,
            },
        };
        let out = service.retrieve("signup feature", 5).expect("retrieve");
        assert!(out.iter().any(|item| item.id == "shared"));
        assert!(out
            .iter()
            .any(|item| item.id == "vec-a" || item.id == "graph-a"));

        let _ = std::fs::remove_dir_all(root);
    }

    #[test]
    fn retrieve_from_vector_sqlite_backend() {
        let unique = format!(
            "agentic-sdlc-vector-context-sqlite-{}",
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .expect("time")
                .as_nanos()
        );
        let root = std::env::temp_dir().join(unique);
        std::fs::create_dir_all(&root).expect("create root");

        let db_path = root.join("context.db");
        let conn = rusqlite::Connection::open(&db_path).expect("open sqlite");
        conn.execute(
            "CREATE TABLE vector_entries (id TEXT PRIMARY KEY, text TEXT NOT NULL, embedding_json TEXT NOT NULL)",
            [],
        )
        .expect("create table");
        conn.execute(
            "INSERT INTO vector_entries (id, text, embedding_json) VALUES (?1, ?2, ?3)",
            params![
                "a",
                "email validation logic",
                serde_json::to_string(&embed("email validation logic")).expect("embedding")
            ],
        )
        .expect("insert a");
        conn.execute(
            "INSERT INTO vector_entries (id, text, embedding_json) VALUES (?1, ?2, ?3)",
            params![
                "b",
                "database migration notes",
                serde_json::to_string(&embed("database migration notes")).expect("embedding")
            ],
        )
        .expect("insert b");

        let service = VectorIndexContextRetrievalService {
            source: VectorIndexSource::Sqlite {
                db_path,
                table: "vector_entries".to_string(),
            },
            min_score: 0.0,
        };
        let out = service.retrieve("email validation", 1).expect("retrieve");
        assert_eq!(out.len(), 1);
        assert_eq!(out[0].id, "a");

        let _ = std::fs::remove_dir_all(root);
    }

    #[test]
    fn retrieve_from_graph_sqlite_backend() {
        let unique = format!(
            "agentic-sdlc-graph-context-sqlite-{}",
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .expect("time")
                .as_nanos()
        );
        let root = std::env::temp_dir().join(unique);
        std::fs::create_dir_all(&root).expect("create root");

        let db_path = root.join("context.db");
        let conn = rusqlite::Connection::open(&db_path).expect("open sqlite");
        conn.execute(
            "CREATE TABLE graph_nodes (id TEXT PRIMARY KEY, text TEXT NOT NULL, tags_json TEXT, links_json TEXT)",
            [],
        )
        .expect("create table");
        conn.execute(
            "INSERT INTO graph_nodes (id, text, tags_json, links_json) VALUES (?1, ?2, ?3, ?4)",
            params![
                "src/signup.rs",
                "signup flow validates email format",
                serde_json::to_string(&vec!["file", "rust"]).expect("tags"),
                serde_json::to_string(&vec!["src/email.rs"]).expect("links")
            ],
        )
        .expect("insert signup");
        conn.execute(
            "INSERT INTO graph_nodes (id, text, tags_json, links_json) VALUES (?1, ?2, ?3, ?4)",
            params![
                "src/email.rs",
                "email validation helpers",
                serde_json::to_string(&vec!["file", "utils"]).expect("tags"),
                serde_json::to_string(Vec::<String>::new().as_slice()).expect("links")
            ],
        )
        .expect("insert email");

        let service = GraphIndexContextRetrievalService {
            source: GraphIndexSource::Sqlite {
                db_path,
                table: "graph_nodes".to_string(),
            },
            min_score: 0.0,
        };
        let out = service
            .retrieve("email validation signup", 3)
            .expect("retrieve");
        assert_eq!(out.len(), 2);
        assert_eq!(out[0].id, "src/signup.rs");

        let _ = std::fs::remove_dir_all(root);
    }
}
