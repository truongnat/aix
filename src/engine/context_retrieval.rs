use anyhow::Result;
use serde::Deserialize;
use std::cmp::Ordering;
use std::collections::{HashMap, HashSet};
use std::path::PathBuf;

const VECTOR_DIM: usize = 32;

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

#[derive(Debug, Clone)]
pub struct VectorIndexContextRetrievalService {
    index_path: PathBuf,
    min_score: f32,
}

impl VectorIndexContextRetrievalService {
    pub fn from_env() -> Self {
        let index_path = PathBuf::from(
            std::env::var("ANTIGRAV_CONTEXT_INDEX_PATH")
                .ok()
                .unwrap_or_else(|| ".agents/memory/vector_index.json".to_string()),
        );
        let min_score = std::env::var("ANTIGRAV_CONTEXT_MIN_SCORE")
            .ok()
            .and_then(|v| v.trim().parse::<f32>().ok())
            .map(|v| v.clamp(0.0, 1.0))
            .unwrap_or(0.1);
        Self {
            index_path,
            min_score,
        }
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
        let entries = load_vector_index(&self.index_path)?;
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
pub struct GraphIndexContextRetrievalService {
    index_path: PathBuf,
    min_score: f64,
}

impl GraphIndexContextRetrievalService {
    pub fn from_env() -> Self {
        let index_path = PathBuf::from(
            std::env::var("ANTIGRAV_CONTEXT_GRAPH_INDEX_PATH")
                .ok()
                .unwrap_or_else(|| ".agents/memory/graph_index.json".to_string()),
        );
        let min_score = std::env::var("ANTIGRAV_CONTEXT_GRAPH_MIN_SCORE")
            .ok()
            .and_then(|v| v.trim().parse::<f64>().ok())
            .map(|v| v.clamp(0.0, 1.0))
            .unwrap_or(0.05);
        Self {
            index_path,
            min_score,
        }
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
        let nodes = load_graph_index(&self.index_path)?;
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
        for item in vector_items.into_iter().chain(graph_items.into_iter()) {
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

fn load_vector_index(path: &PathBuf) -> Result<Vec<VectorIndexEntry>> {
    if !path.exists() {
        return Ok(Vec::new());
    }
    let body = std::fs::read_to_string(path)?;
    let entries: Vec<VectorIndexEntry> = serde_json::from_str(&body)?;
    Ok(entries)
}

fn load_graph_index(path: &PathBuf) -> Result<Vec<GraphIndexNode>> {
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
        ContextRetrievalService, GraphIndexContextRetrievalService, HybridContextRetrievalService,
        VectorIndexContextRetrievalService,
    };
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
                {"id":"a","text":"email validation logic", "embedding":[1.0,0.0]},
                {"id":"b","text":"signup flow test cases", "embedding":[0.9,0.1]},
                {"id":"c","text":"database migration notes", "embedding":[0.0,1.0]}
            ]))
            .expect("json"),
        )
        .expect("write");

        let service = VectorIndexContextRetrievalService {
            index_path,
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
            index_path,
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
                {"id":"vec-a","text":"email validation logic", "embedding":[1.0,0.0]},
                {"id":"shared","text":"signup feature branch notes", "embedding":[0.8,0.2]}
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
                index_path: vector_path,
                min_score: 0.0,
            },
            graph: GraphIndexContextRetrievalService {
                index_path: graph_path,
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
}
