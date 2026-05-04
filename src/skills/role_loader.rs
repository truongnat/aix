use anyhow::{anyhow, Result};
use serde::Deserialize;
use std::fs;
use std::path::{Path, PathBuf};

#[derive(Debug, Clone, Deserialize, Default)]
pub struct RoleMeta {
    pub name: Option<String>,
    pub provider: Option<String>,
    pub model: Option<String>,
    pub temperature: Option<f32>,
}

#[derive(Debug, Clone)]
pub struct RoleProfile {
    pub name: String,
    pub provider: Option<String>,
    pub model: Option<String>,
    pub temperature: Option<f32>,
    pub prompt: String,
}

pub fn resolve_role_path(role_ref: &str, roles_dir: &Path) -> Option<PathBuf> {
    let as_path = Path::new(role_ref);
    if as_path.exists() {
        return Some(as_path.to_path_buf());
    }

    let candidate = if role_ref.to_ascii_lowercase().ends_with(".md") {
        roles_dir.join(role_ref)
    } else {
        roles_dir.join(format!("{}.md", role_ref))
    };
    if candidate.exists() {
        return Some(candidate);
    }

    let lookup = role_ref.trim().trim_end_matches(".md");
    if lookup.is_empty() {
        return None;
    }
    let files = collect_markdown_files_recursive(roles_dir).ok()?;
    let mut stem_matches = Vec::new();
    for path in files {
        let relative = path.strip_prefix(roles_dir).ok()?;
        let role_id = resource_id_from_relative_path(relative).ok()?;
        if role_id == lookup {
            return Some(path);
        }
        let stem = path.file_stem().and_then(|name| name.to_str())?;
        if stem == lookup {
            stem_matches.push(path);
        }
    }
    if stem_matches.len() == 1 {
        stem_matches.into_iter().next()
    } else {
        None
    }
}

pub fn load_role_profile_if_exists(
    role_ref: &str,
    roles_dir: &Path,
) -> Result<Option<RoleProfile>> {
    let Some(path) = resolve_role_path(role_ref, roles_dir) else {
        return Ok(None);
    };
    let content = fs::read_to_string(&path)?;
    let fallback = path
        .file_stem()
        .and_then(|v| v.to_str())
        .unwrap_or(role_ref);
    let profile = parse_role_markdown(&content, Some(fallback))?;
    Ok(Some(profile))
}

pub fn parse_role_markdown(content: &str, fallback_name: Option<&str>) -> Result<RoleProfile> {
    let (meta, prompt) = if let Some((meta_json, body)) = extract_json_code_block_and_body(content)
    {
        let parsed = serde_json::from_str::<RoleMeta>(&meta_json)
            .map_err(|err| anyhow!("Invalid role metadata JSON: {}", err))?;
        (parsed, body)
    } else {
        (RoleMeta::default(), content.trim().to_string())
    };

    let name = meta
        .name
        .clone()
        .or_else(|| fallback_name.map(|v| v.trim().to_string()))
        .unwrap_or_default();
    if name.trim().is_empty() {
        return Err(anyhow!("Role name is required"));
    }
    if prompt.trim().is_empty() {
        return Err(anyhow!("Role prompt body is required"));
    }
    if let Some(temp) = meta.temperature {
        if !temp.is_finite() || !(0.0..=2.0).contains(&temp) {
            return Err(anyhow!(
                "Role temperature must be a finite number in [0.0, 2.0]"
            ));
        }
    }

    Ok(RoleProfile {
        name: name.trim().to_string(),
        provider: meta.provider.map(|v| v.trim().to_string()),
        model: meta.model.map(|v| v.trim().to_string()),
        temperature: meta.temperature,
        prompt: prompt.trim().to_string(),
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

fn resource_id_from_relative_path(path: &Path) -> Result<String> {
    let mut base = path.to_path_buf();
    if base
        .extension()
        .and_then(|ext| ext.to_str())
        .map(|ext| ext.eq_ignore_ascii_case("md"))
        .unwrap_or(false)
    {
        base.set_extension("");
    }
    let id = base
        .iter()
        .map(|part| part.to_string_lossy().to_string())
        .collect::<Vec<_>>()
        .join("/");
    if id.trim().is_empty() {
        return Err(anyhow!("Invalid role filename"));
    }
    Ok(id)
}

#[cfg(test)]
mod tests {
    use super::{parse_role_markdown, resolve_role_path};

    #[test]
    fn parse_role_with_metadata_and_body() {
        let content = r#"# Role: Architect
```json
{"name":"architect","provider":"ollama","model":"qwen3:8b","temperature":0.2}
```
Design deterministic plans.
"#;
        let profile = parse_role_markdown(content, None).expect("parse role");
        assert_eq!(profile.name, "architect");
        assert_eq!(profile.provider.as_deref(), Some("ollama"));
        assert_eq!(profile.model.as_deref(), Some("qwen3:8b"));
        assert_eq!(profile.temperature, Some(0.2));
        assert!(profile.prompt.contains("deterministic plans"));
    }

    #[test]
    fn parse_role_without_metadata_uses_fallback_name() {
        let profile = parse_role_markdown("Implement clean minimal patches.", Some("implementer"))
            .expect("parse role");
        assert_eq!(profile.name, "implementer");
        assert!(profile.provider.is_none());
        assert_eq!(profile.prompt, "Implement clean minimal patches.");
    }

    #[test]
    fn resolve_role_supports_stem_and_filename() {
        let unique = format!(
            "agentic-sdlc-role-loader-test-{}",
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .expect("time")
                .as_nanos()
        );
        let root = std::env::temp_dir().join(unique);
        std::fs::create_dir_all(&root).expect("create temp root");
        std::fs::write(root.join("reviewer.md"), "review role").expect("write role");

        assert_eq!(
            resolve_role_path("reviewer", &root)
                .and_then(|v| v.file_name().map(|s| s.to_owned()))
                .and_then(|v| v.to_str().map(|s| s.to_string()))
                .as_deref(),
            Some("reviewer.md")
        );
        assert_eq!(
            resolve_role_path("reviewer.md", &root)
                .and_then(|v| v.file_name().map(|s| s.to_owned()))
                .and_then(|v| v.to_str().map(|s| s.to_string()))
                .as_deref(),
            Some("reviewer.md")
        );

        let _ = std::fs::remove_dir_all(root);
    }

    #[test]
    fn resolve_role_supports_nested_unique_stem_alias() {
        let unique = format!(
            "agentic-sdlc-role-loader-nested-test-{}",
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .expect("time")
                .as_nanos()
        );
        let root = std::env::temp_dir().join(unique);
        let nested = root.join("payments");
        std::fs::create_dir_all(&nested).expect("create nested roles");
        std::fs::write(nested.join("reviewer.md"), "review role").expect("write role");

        assert_eq!(
            resolve_role_path("payments/reviewer", &root)
                .and_then(|v| v.strip_prefix(&root).ok().map(|p| p.to_path_buf()))
                .and_then(|v| v.to_str().map(|s| s.replace('\\', "/"))),
            Some("payments/reviewer.md".to_string())
        );
        assert_eq!(
            resolve_role_path("reviewer", &root)
                .and_then(|v| v.strip_prefix(&root).ok().map(|p| p.to_path_buf()))
                .and_then(|v| v.to_str().map(|s| s.replace('\\', "/"))),
            Some("payments/reviewer.md".to_string())
        );

        let _ = std::fs::remove_dir_all(root);
    }
}
