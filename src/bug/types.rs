use anyhow::{Context, Result};
use std::path::{Path, PathBuf};

#[derive(Debug, Clone)]
pub(crate) struct LoadedBugInput {
    pub(crate) path: PathBuf,
    pub(crate) raw: String,
    pub(crate) lines: Vec<String>,
}

impl LoadedBugInput {
    pub(crate) fn from_file(path: impl AsRef<Path>) -> Result<Self> {
        let path_ref = path.as_ref();
        let raw = std::fs::read_to_string(path_ref)
            .with_context(|| format!("failed to read bug input '{}'", path_ref.display()))?;
        let lines = raw
            .lines()
            .map(|line| line.trim_end().to_string())
            .collect();
        Ok(Self {
            path: path_ref.to_path_buf(),
            raw,
            lines,
        })
    }
}

#[derive(Debug, Clone, Default)]
pub(crate) struct BugSignals {
    pub(crate) title: Option<String>,
    pub(crate) summary: Vec<String>,
    pub(crate) current_behavior: Vec<String>,
    pub(crate) expected_behavior: Vec<String>,
    pub(crate) reproduction_steps: Vec<String>,
    pub(crate) impact: Vec<String>,
    pub(crate) suspected_root_cause: Vec<String>,
    pub(crate) evidence: Vec<String>,
    pub(crate) missing_information: Vec<String>,
    pub(crate) investigation_points: Vec<String>,
    pub(crate) risk_level: String,
    pub(crate) file_paths: Vec<String>,
    pub(crate) api_points: Vec<String>,
    pub(crate) db_points: Vec<String>,
    pub(crate) error_signatures: Vec<String>,
    pub(crate) japanese_lines: Vec<String>,
    pub(crate) languages: Vec<String>,
    pub(crate) has_logs: bool,
}

#[cfg(test)]
mod tests {
    use super::LoadedBugInput;

    #[test]
    fn reads_input_file() {
        let unique = format!(
            "agentic-sdlc-bug-read-{}",
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .expect("time")
                .as_nanos()
        );
        let path = std::env::temp_dir().join(unique).with_extension("md");
        std::fs::write(&path, "# Ticket\nline 2\n").expect("write sample");

        let loaded = LoadedBugInput::from_file(&path).expect("load input");
        assert_eq!(loaded.lines.first().map(String::as_str), Some("# Ticket"));
        assert!(loaded.raw.contains("line 2"));

        let _ = std::fs::remove_file(path);
    }
}
