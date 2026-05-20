use anyhow::{anyhow, Result};

pub const PACKAGE_SCHEMA_VERSION: &str = "v1";

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum PackageMarkdownKind {
    Workflow,
    Skill,
    Role,
    Rule,
}

impl PackageMarkdownKind {
    pub fn as_str(self) -> &'static str {
        match self {
            PackageMarkdownKind::Workflow => "workflow",
            PackageMarkdownKind::Skill => "skill",
            PackageMarkdownKind::Role => "role",
            PackageMarkdownKind::Rule => "rule",
        }
    }

    pub fn expected_schema(self) -> String {
        format!("agentic-sdlc.{}@{}", self.as_str(), PACKAGE_SCHEMA_VERSION)
    }

    pub fn legacy_schema(self) -> String {
        format!("antigrav.{}@{}", self.as_str(), PACKAGE_SCHEMA_VERSION)
    }
}

pub fn extract_schema_header(markdown: &str) -> Option<String> {
    for line in markdown.lines().take(24) {
        let trimmed = line.trim();
        if let Some(schema) = trimmed.strip_prefix("Schema:") {
            let schema = schema.trim();
            if !schema.is_empty() {
                return Some(schema.to_string());
            }
            return None;
        }
    }
    None
}

pub fn validate_schema_header(markdown: &str, kind: PackageMarkdownKind) -> Result<()> {
    let expected = kind.expected_schema();
    let legacy = kind.legacy_schema();
    let Some(actual) = extract_schema_header(markdown) else {
        return Err(anyhow!(
            "Missing schema header. Expected line: 'Schema: {}'",
            expected
        ));
    };
    if actual != expected && actual != legacy {
        return Err(anyhow!(
            "Invalid schema header '{}'. Expected '{}'{}",
            actual,
            expected,
            if legacy == expected {
                String::new()
            } else {
                format!(" or legacy '{}'", legacy)
            }
        ));
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::{extract_schema_header, validate_schema_header, PackageMarkdownKind};

    #[test]
    fn extracts_schema_header_when_present() {
        let markdown = "# Workflow: feature\nSchema: agentic-sdlc.workflow@v1\n";
        assert_eq!(
            extract_schema_header(markdown).as_deref(),
            Some("agentic-sdlc.workflow@v1")
        );
    }

    #[test]
    fn validates_schema_header_by_kind() {
        let markdown = "# Role: planner\nSchema: agentic-sdlc.role@v1\n";
        assert!(validate_schema_header(markdown, PackageMarkdownKind::Role).is_ok());
        assert!(validate_schema_header(markdown, PackageMarkdownKind::Skill).is_err());
    }

    #[test]
    fn accepts_legacy_schema_header() {
        let markdown = "# Skill: legacy\nSchema: antigrav.skill@v1\n";
        assert!(validate_schema_header(markdown, PackageMarkdownKind::Skill).is_ok());
    }
}
