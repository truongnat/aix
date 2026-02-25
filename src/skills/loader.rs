use crate::engine::registry::DomainRegistry;
use crate::skills::model::{FileSkill, SkillMeta};
use anyhow::{anyhow, Result};
use std::fs;
use std::path::Path;
use std::sync::Arc;

#[allow(dead_code)]
pub fn load_skills() -> Result<DomainRegistry> {
    let mut domains = DomainRegistry::new();
    let path = Path::new(".agent/skills");
    if !path.exists() {
        return Ok(domains);
    }

    for entry in fs::read_dir(path)? {
        let entry = entry?;
        if !entry.path().is_file() {
            continue;
        }
        let content = fs::read_to_string(entry.path())?;
        let Ok((meta, body)) = parse_skill_markdown(&content) else {
            // Ignore non-skill markdown files in .agent/skills.
            continue;
        };

        // Register domain if not exists
        let domain = meta.domain.clone();
        if !domains.has_domain(&domain) {
            domains.register_domain(&domain);
        }

        // Register skill to domain
        domains.register_skill(&domain, Arc::new(FileSkill { meta, body }))?;
    }

    Ok(domains)
}

pub fn parse_skill_markdown(content: &str) -> Result<(SkillMeta, String)> {
    let (meta_json, body) = extract_json_code_block_and_body(content)
        .ok_or_else(|| anyhow!("Skill markdown must contain a fenced JSON metadata block"))?;
    let meta = serde_json::from_str::<SkillMeta>(&meta_json)
        .map_err(|err| anyhow!("Invalid skill metadata JSON: {}", err))?;
    Ok((meta, body))
}

fn extract_json_code_block_and_body(markdown: &str) -> Option<(String, String)> {
    let mut in_fence = false;
    let mut fence_lang = String::new();
    let mut block_start_offset = 0usize;
    let mut offset = 0usize;

    for line in markdown.split_inclusive('\n') {
        let trimmed = line.trim();
        if let Some(rest) = trimmed.strip_prefix("```") {
            if !in_fence {
                in_fence = true;
                fence_lang = rest.trim().to_ascii_lowercase();
                block_start_offset = offset + line.len();
            } else {
                if fence_lang.is_empty() || fence_lang == "json" {
                    let meta = markdown[block_start_offset..offset].trim().to_string();
                    if !meta.is_empty() {
                        let body = markdown[offset + line.len()..].trim().to_string();
                        return Some((meta, body));
                    }
                }
                in_fence = false;
                fence_lang.clear();
            }
        }
        offset += line.len();
    }
    None
}
