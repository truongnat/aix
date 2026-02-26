use crate::skill::io::SkillOutput;
use anyhow::Result;
use std::collections::hash_map::DefaultHasher;
use std::hash::{Hash, Hasher};
use std::io::Write;
use std::path::PathBuf;

pub fn load_marker(skill_name: &str, key: &str) -> Result<Option<SkillOutput>> {
    let path = marker_path(skill_name, key)?;
    if !path.exists() {
        return Ok(None);
    }
    let body = std::fs::read_to_string(path)?;
    match serde_json::from_str::<SkillOutput>(&body) {
        Ok(output) => Ok(Some(output)),
        Err(_) => Ok(None),
    }
}

pub fn save_marker(skill_name: &str, key: &str, output: &SkillOutput) -> Result<()> {
    let path = marker_path(skill_name, key)?;
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent)?;
    }
    let tmp = path.with_extension(format!("tmp.{}", std::process::id()));
    let body = serde_json::to_vec_pretty(output)?;
    {
        let mut file = std::fs::OpenOptions::new()
            .create(true)
            .truncate(true)
            .write(true)
            .open(&tmp)?;
        file.write_all(&body)?;
        file.write_all(b"\n")?;
        file.sync_all()?;
    }
    std::fs::rename(tmp, path)?;
    Ok(())
}

fn marker_path(skill_name: &str, key: &str) -> Result<PathBuf> {
    let cwd = std::env::current_dir()?;
    let dir = cwd.join(".agents").join("state").join("idempotency");
    let skill_safe = skill_name
        .chars()
        .map(|ch| match ch {
            'a'..='z' | 'A'..='Z' | '0'..='9' => ch,
            _ => '-',
        })
        .collect::<String>();
    let fingerprint = hash_key(key);
    Ok(dir.join(format!("{}-{}.json", skill_safe, fingerprint)))
}

fn hash_key(key: &str) -> String {
    let mut hasher = DefaultHasher::new();
    key.hash(&mut hasher);
    format!("{:016x}", hasher.finish())
}
