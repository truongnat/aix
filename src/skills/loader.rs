use crate::engine::registry::DomainRegistry;
use crate::skills::model::{FileSkill, SkillMeta};
use anyhow::{anyhow, Result};
use std::fs;
use std::path::{Path, PathBuf};
use std::sync::Arc;

#[allow(dead_code)]
pub fn load_skills() -> Result<DomainRegistry> {
    load_skills_from_dir(Path::new(".agents/skills"))
}

fn load_skills_from_dir(root: &Path) -> Result<DomainRegistry> {
    let mut domains = DomainRegistry::new();
    if !root.exists() {
        return Ok(domains);
    }

    for path in collect_markdown_files_recursive(root)? {
        let content = fs::read_to_string(&path)?;
        let Ok((meta, body)) = parse_skill_markdown(&content) else {
            // Ignore non-skill markdown files in .agents/skills.
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

fn collect_markdown_files_recursive(root: &Path) -> Result<Vec<PathBuf>> {
    let mut files = Vec::new();
    walk_directory_files(root, &mut |path| {
        let is_markdown = path
            .extension()
            .and_then(|ext| ext.to_str())
            .map(|ext| ext.eq_ignore_ascii_case("md"))
            .unwrap_or(false);
        if is_markdown {
            files.push(path.to_path_buf());
        }
    })?;
    files.sort();
    Ok(files)
}

fn walk_directory_files(root: &Path, visit: &mut impl FnMut(&Path)) -> Result<()> {
    if !root.exists() {
        return Ok(());
    }
    for entry in fs::read_dir(root)? {
        let entry = entry?;
        let path = entry.path();
        if path.is_dir() {
            walk_directory_files(&path, visit)?;
            continue;
        }
        if path.is_file() {
            visit(&path);
        }
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::load_skills_from_dir;

    #[test]
    fn load_skills_reads_nested_markdown_files() {
        let unique = format!(
            "agentic-sdlc-skill-loader-recursive-{}",
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .expect("time")
                .as_nanos()
        );
        let root = std::env::temp_dir().join(unique);
        std::fs::create_dir_all(root.join(".agents").join("skills").join("quality"))
            .expect("create skills dir");
        std::fs::write(
            root.join(".agents")
                .join("skills")
                .join("quality")
                .join("lint.md"),
            r#"# Skill: lint
Schema: antigrav.skill@v1
```json
{"name":"lint","domain":"quality","executor":"shell","model":"n/a"}
```
Run lint checks.
"#,
        )
        .expect("write skill");

        let domains =
            load_skills_from_dir(&root.join(".agents").join("skills")).expect("load skills");

        assert!(domains.has_domain("quality"));
        let _ = std::fs::remove_dir_all(root);
    }
}
