use crate::engine::registry::DomainRegistry;
use crate::skills::model::{FileSkill, SkillMeta};
use anyhow::Result;
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

        let parts: Vec<&str> = content.splitn(3, "---").collect();
        if parts.len() < 3 {
            // Ignore non-skill markdown files in .agent/skills.
            continue;
        }

        let meta: SkillMeta = match serde_yaml::from_str(parts[1]) {
            Ok(meta) => meta,
            Err(_) => continue,
        };
        let body = parts[2].trim().to_string();

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
