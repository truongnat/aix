use crate::engine::context::ExecutionContext;
use crate::skill::capability::{
    CapabilityPermissions, SideEffectClass, SkillCapability, SkillIOType, TrustTier,
};
use crate::skill::io::{SkillInput, SkillOutput};
use crate::skill::Skill;
use anyhow::Result;
use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::collections::HashSet;
use std::path::PathBuf;

const VECTOR_DIM: usize = 32;

#[derive(Debug, Clone, Serialize, Deserialize)]
struct MemoryEntry {
    id: String,
    text: String,
    embedding: Vec<f32>,
    neighbors: Vec<String>,
}

#[derive(Debug, Clone)]
pub struct EmbedDocumentSkill {
    index_path: PathBuf,
}

#[derive(Debug, Clone)]
pub struct SemanticSearchSkill {
    index_path: PathBuf,
}

impl EmbedDocumentSkill {
    pub fn new(index_path: impl Into<PathBuf>) -> Self {
        Self {
            index_path: index_path.into(),
        }
    }
}

impl SemanticSearchSkill {
    pub fn new(index_path: impl Into<PathBuf>) -> Self {
        Self {
            index_path: index_path.into(),
        }
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

fn load_index(path: &PathBuf) -> Result<Vec<MemoryEntry>> {
    if !path.exists() {
        return Ok(Vec::new());
    }
    let content = std::fs::read_to_string(path)?;
    let entries: Vec<MemoryEntry> = serde_json::from_str(&content)?;
    Ok(entries)
}

fn save_index(path: &PathBuf, entries: &[MemoryEntry]) -> Result<()> {
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent)?;
    }
    std::fs::write(path, serde_json::to_string_pretty(entries)?)?;
    Ok(())
}

fn parse_doc_input(input: &str) -> (String, String) {
    if let Some((id, content)) = input.split_once(":::") {
        (id.trim().to_string(), content.trim().to_string())
    } else {
        let mut id = "doc".to_string();
        for token in tokenize(input).into_iter().take(4) {
            id.push('-');
            id.push_str(&token);
        }
        (id, input.trim().to_string())
    }
}

fn rebuild_graph(entries: &mut [MemoryEntry]) {
    for i in 0..entries.len() {
        let mut scored = Vec::new();
        for j in 0..entries.len() {
            if i == j {
                continue;
            }
            let sim = cosine_similarity(&entries[i].embedding, &entries[j].embedding);
            scored.push((sim, entries[j].id.clone()));
        }
        scored.sort_by(|a, b| b.0.partial_cmp(&a.0).unwrap_or(std::cmp::Ordering::Equal));
        entries[i].neighbors = scored
            .into_iter()
            .filter(|(sim, _)| *sim > 0.35)
            .take(5)
            .map(|(_, id)| id)
            .collect();
    }
}

#[async_trait]
impl Skill for EmbedDocumentSkill {
    fn name(&self) -> &str {
        "embed_document"
    }

    fn capability(&self) -> SkillCapability {
        SkillCapability::new(
            self.name(),
            "Embed and store a project document into local vector memory",
            SkillIOType::Text,
            SkillIOType::Json,
            CapabilityPermissions::new(true, true, false, false, false),
            SideEffectClass::ExternalMutation,
        )
        .with_trust_tier(TrustTier::Trusted)
    }

    async fn execute(&self, input: SkillInput, ctx: &mut ExecutionContext) -> Result<SkillOutput> {
        ctx.require_fs_read()?;
        ctx.require_fs_write()?;

        let text = input.as_text().unwrap_or_default();
        let (id, content) = parse_doc_input(text);
        let embedding = embed(&content);

        let mut entries = load_index(&self.index_path)?;
        entries.retain(|entry| entry.id != id);
        entries.push(MemoryEntry {
            id: id.clone(),
            text: content,
            embedding,
            neighbors: Vec::new(),
        });
        rebuild_graph(&mut entries);
        save_index(&self.index_path, &entries)?;

        Ok(SkillOutput::json(json!({
            "status": "indexed",
            "id": id,
            "entries": entries.len()
        })))
    }
}

#[async_trait]
impl Skill for SemanticSearchSkill {
    fn name(&self) -> &str {
        "semantic_search"
    }

    fn capability(&self) -> SkillCapability {
        SkillCapability::new(
            self.name(),
            "Search project vector memory by semantic similarity",
            SkillIOType::Text,
            SkillIOType::Json,
            CapabilityPermissions::new(true, false, false, false, false),
            SideEffectClass::Idempotent,
        )
        .with_trust_tier(TrustTier::Trusted)
    }

    async fn execute(&self, input: SkillInput, ctx: &mut ExecutionContext) -> Result<SkillOutput> {
        ctx.require_fs_read()?;
        let raw = input.as_text().unwrap_or_default().trim();
        let (top_k, query) = if let Some((left, right)) = raw.split_once(":::") {
            let k = left.trim().parse::<usize>().unwrap_or(3).clamp(1, 20);
            (k, right.trim())
        } else {
            (3, raw)
        };
        let query_embedding = embed(query);
        let entries = load_index(&self.index_path)?;
        let mut scored = entries
            .iter()
            .map(|entry| {
                (
                    cosine_similarity(&query_embedding, &entry.embedding),
                    entry.id.clone(),
                    entry.text.clone(),
                    entry.neighbors.clone(),
                )
            })
            .collect::<Vec<_>>();
        scored.sort_by(|a, b| b.0.partial_cmp(&a.0).unwrap_or(std::cmp::Ordering::Equal));

        let mut selected = Vec::new();
        let mut seen = HashSet::new();
        for (score, id, text, neighbors) in scored.into_iter().take(top_k) {
            if seen.insert(id.clone()) {
                selected.push(json!({
                    "id": id,
                    "score": score,
                    "text": text,
                    "neighbors": neighbors
                }));
            }
        }

        Ok(SkillOutput::json(json!({
            "query": query,
            "results": selected
        })))
    }
}
