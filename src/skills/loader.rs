use crate::engine::registry::DomainRegistry;
use crate::skills::model::{FileSkill, SkillMeta};
use anyhow::{anyhow, Result};
use std::collections::HashMap;
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
    if let Some((frontmatter, body)) = split_frontmatter(content) {
        let map = parse_simple_yaml_map(frontmatter);
        if map.contains_key("name") && map.contains_key("domain") && map.contains_key("executor") {
            let meta = skill_meta_from_frontmatter(&map)?;
            return Ok((meta, body.trim().to_string()));
        }
    }

    let (meta_json, body) = extract_json_code_block_and_body(content).ok_or_else(|| {
        anyhow!("Skill markdown must contain either frontmatter metadata or a fenced JSON metadata block")
    })?;
    let meta = serde_json::from_str::<SkillMeta>(&meta_json)
        .map_err(|err| anyhow!("Invalid skill metadata JSON: {}", err))?;
    Ok((meta, body))
}

fn skill_meta_from_frontmatter(map: &HashMap<String, String>) -> Result<SkillMeta> {
    let required = |key: &str| {
        map.get(key)
            .map(|v| v.trim().to_string())
            .filter(|v| !v.is_empty())
            .ok_or_else(|| anyhow!("Missing frontmatter key '{}'", key))
    };
    let name = required("name")?;
    let domain = required("domain")?;
    let executor = required("executor")?;
    Ok(SkillMeta {
        name,
        domain,
        executor,
        description: parse_optional_string(map, "description"),
        risk: parse_optional_string(map, "risk"),
        source: parse_optional_string(map, "source"),
        source_requested: parse_optional_string(map, "source_requested"),
        source_commit: parse_optional_string(map, "source_commit"),
        source_path: parse_optional_string(map, "source_path"),
        source_license: parse_optional_string(map, "source_license"),
        imported_at_ms: parse_optional_u64(map, "imported_at_ms"),
        tags: parse_optional_list(map, "tags"),
        version: parse_optional_string(map, "version"),
        author: parse_optional_string(map, "author"),
        license: parse_optional_string(map, "license"),
        dependencies: parse_optional_list(map, "dependencies"),
        model: parse_optional_string(map, "model"),
        temperature: parse_optional_f32(map, "temperature"),
        command: parse_optional_string(map, "command"),
        input_type: parse_optional_string(map, "input_type"),
        output_type: parse_optional_string(map, "output_type"),
        estimated_cost: parse_optional_u32(map, "estimated_cost"),
        estimated_latency_ms: parse_optional_u32(map, "estimated_latency_ms"),
        allow_fs_read: parse_optional_bool(map, "allow_fs_read"),
        allow_fs_write: parse_optional_bool(map, "allow_fs_write"),
        allow_network: parse_optional_bool(map, "allow_network"),
        allow_env: parse_optional_bool(map, "allow_env"),
        allow_process_spawn: parse_optional_bool(map, "allow_process_spawn"),
        side_effect_class: parse_optional_string(map, "side_effect_class"),
        trust_tier: parse_optional_string(map, "trust_tier"),
    })
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

fn split_frontmatter(markdown: &str) -> Option<(&str, &str)> {
    let mut lines = markdown.lines();
    if lines.next().map(str::trim) != Some("---") {
        return None;
    }
    let mut cursor = 4usize;
    for line in markdown.lines().skip(1) {
        let line_len = line.len().saturating_add(1);
        if line.trim() == "---" {
            let fm = &markdown[4..cursor.saturating_sub(1)];
            let body = &markdown[cursor + line_len..];
            return Some((fm, body));
        }
        cursor = cursor.saturating_add(line_len);
    }
    None
}

fn parse_simple_yaml_map(frontmatter: &str) -> HashMap<String, String> {
    let mut map = HashMap::<String, String>::new();
    let mut pending_list_key = None::<String>;
    let mut pending_list_values = Vec::<String>::new();
    let flush_pending =
        |map: &mut HashMap<String, String>, key: &mut Option<String>, values: &mut Vec<String>| {
            if let Some(k) = key.take() {
                if !values.is_empty() {
                    map.insert(k, format!("[{}]", values.join(", ")));
                }
                values.clear();
            }
        };
    for line in frontmatter.lines() {
        let trimmed = line.trim();
        if trimmed.is_empty() || trimmed.starts_with('#') {
            continue;
        }
        if let Some(item) = trimmed.strip_prefix("- ") {
            if pending_list_key.is_some() {
                let value = item.trim().trim_matches('"').trim_matches('\'').to_string();
                if !value.is_empty() {
                    pending_list_values.push(value);
                }
                continue;
            }
        }
        if pending_list_key.is_some() {
            flush_pending(&mut map, &mut pending_list_key, &mut pending_list_values);
        }
        let Some((key, value)) = trimmed.split_once(':') else {
            continue;
        };
        let key = key.trim().to_ascii_lowercase();
        if key.is_empty() {
            continue;
        }
        let value = value.trim();
        if value.is_empty() {
            pending_list_key = Some(key);
            continue;
        }
        map.insert(key, value.trim_matches('"').trim_matches('\'').to_string());
    }
    flush_pending(&mut map, &mut pending_list_key, &mut pending_list_values);
    map
}

fn parse_optional_string(map: &HashMap<String, String>, key: &str) -> Option<String> {
    map.get(key)
        .map(|v| v.trim().to_string())
        .filter(|v| !v.is_empty())
}

fn parse_optional_list(map: &HashMap<String, String>, key: &str) -> Option<Vec<String>> {
    let raw = map.get(key)?;
    let trimmed = raw.trim().trim_start_matches('[').trim_end_matches(']');
    let mut out = trimmed
        .split(',')
        .map(|item| item.trim().trim_matches('"').trim_matches('\'').to_string())
        .filter(|v| !v.is_empty())
        .collect::<Vec<_>>();
    out.sort();
    out.dedup();
    if out.is_empty() {
        None
    } else {
        Some(out)
    }
}

fn parse_optional_bool(map: &HashMap<String, String>, key: &str) -> Option<bool> {
    let raw = map.get(key)?.trim().to_ascii_lowercase();
    match raw.as_str() {
        "true" | "1" | "yes" | "on" => Some(true),
        "false" | "0" | "no" | "off" => Some(false),
        _ => None,
    }
}

fn parse_optional_u32(map: &HashMap<String, String>, key: &str) -> Option<u32> {
    map.get(key)?.trim().parse::<u32>().ok()
}

fn parse_optional_u64(map: &HashMap<String, String>, key: &str) -> Option<u64> {
    map.get(key)?.trim().parse::<u64>().ok()
}

fn parse_optional_f32(map: &HashMap<String, String>, key: &str) -> Option<f32> {
    map.get(key)?.trim().parse::<f32>().ok()
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
    let mut stack = vec![root.to_path_buf()];
    while let Some(current) = stack.pop() {
        let entries = match fs::read_dir(current) {
            Ok(e) => e,
            Err(_) => continue,
        };
        for entry in entries {
            let entry = match entry {
                Ok(e) => e,
                Err(_) => continue,
            };
            let path = entry.path();
            if path.is_dir() {
                if let Some(name) = path.file_name().and_then(|s| s.to_str()) {
                    if name == ".git" || name == "node_modules" || name == "target" {
                        continue;
                    }
                }
                stack.push(path);
                continue;
            }
            if path.is_file() {
                visit(&path);
            }
        }
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::{load_skills_from_dir, parse_skill_markdown};

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

    #[test]
    fn parse_skill_markdown_supports_frontmatter_metadata() {
        let body = r#"---
name: frontmatter-skill
domain: agent
executor: ollama
description: Frontmatter parser
risk: safe
source: self
tags:
  - frontmatter
  - parser
  - skill
model: qwen3:8b
temperature: 0.1
---
# Skill: frontmatter-skill
Schema: antigrav.skill@v1

## Overview
Test body.
"#;
        let (meta, parsed_body) = parse_skill_markdown(body).expect("parse");
        assert_eq!(meta.name, "frontmatter-skill");
        assert_eq!(meta.domain, "agent");
        assert_eq!(meta.executor, "ollama");
        assert_eq!(meta.tags.unwrap_or_default().len(), 3);
        assert!(parsed_body.contains("## Overview"));
    }

    #[test]
    fn load_skills_supports_folder_skill_layout() {
        let unique = format!(
            "agentic-sdlc-skill-loader-folder-{}",
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .expect("time")
                .as_nanos()
        );
        let root = std::env::temp_dir().join(unique);
        let skill_dir = root
            .join(".agents")
            .join("skills")
            .join("folder-skill")
            .join("references");
        std::fs::create_dir_all(&skill_dir).expect("create folder skill");
        std::fs::write(
            root.join(".agents")
                .join("skills")
                .join("folder-skill")
                .join("SKILL.md"),
            r#"---
name: folder-skill
domain: agent
executor: ollama
description: Folder skill entry
---
# Skill: folder-skill
Schema: antigrav.skill@v1

Use references docs.
"#,
        )
        .expect("write skill entry");
        std::fs::write(skill_dir.join("details.md"), "# Details\nAdditional docs")
            .expect("write references");

        let domains =
            load_skills_from_dir(&root.join(".agents").join("skills")).expect("load skills");
        assert!(domains.has_domain("agent"));

        let _ = std::fs::remove_dir_all(root);
    }
}
