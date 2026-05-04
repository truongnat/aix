//! Architecture Enforcement Module
//!
//! Enforces .agents/constraints/arch.yaml rules:
//! - No DB in API layer
//! - Feature isolation
//! - Repository pattern enforcement

use crate::engine::constraints::{ArchRule, ArchConstraints, RuleSeverity, Violation};
use anyhow::Result;
use regex::Regex;
use std::collections::HashSet;
use std::path::Path;

/// Architecture enforcer for static analysis
pub struct ArchEnforcer {
    project_root: String,
}

impl ArchEnforcer {
    pub fn new(project_root: &str) -> Self {
        Self {
            project_root: project_root.to_string(),
        }
    }

    /// Enforce all architecture rules
    pub async fn enforce(&self, constraints: &ArchConstraints) -> Result<Vec<Violation>> {
        let mut all_violations = Vec::new();

        for rule in &constraints.rules {
            let violations = self.enforce_rule(rule).await?;
            all_violations.extend(violations);
        }

        // Enforce DB isolation rules
        if constraints.security.db_isolation.no_db_in_api {
            let db_violations = self.enforce_no_db_in_api().await?;
            all_violations.extend(db_violations);
        }

        // Enforce feature isolation
        if constraints.security.db_isolation.feature_isolation {
            let feature_violations = self.enforce_feature_isolation().await?;
            all_violations.extend(feature_violations);
        }

        // Enforce repository pattern
        if constraints.security.db_isolation.require_repository_pattern {
            let repo_violations = self.enforce_repository_pattern().await?;
            all_violations.extend(repo_violations);
        }

        Ok(all_violations)
    }

    /// Enforce a single architecture rule
    async fn enforce_rule(&self, rule: &ArchRule) -> Result<Vec<Violation>> {
        let mut violations = Vec::new();
        let pattern = Regex::new(&rule.pattern)?;
        
        let src_path = Path::new(&self.project_root).join("src");
        if !src_path.exists() {
            return Ok(violations);
        }

        self.scan_directory(&src_path, rule, &pattern, &mut violations).await?;

        Ok(violations)
    }

    async fn scan_directory(
        &self,
        dir: &Path,
        rule: &ArchRule,
        pattern: &Regex,
        violations: &mut Vec<Violation>,
    ) -> Result<()> {
        if !dir.is_dir() {
            return Ok(());
        }

        for entry in std::fs::read_dir(dir)? {
            let entry = entry?;
            let path = entry.path();
            
            if path.is_dir() {
                Box::pin(self.scan_directory(&path, rule, pattern, violations)).await?;
            } else if path.extension().map(|e| e == "rs").unwrap_or(false) {
                let content = std::fs::read_to_string(&path)?;
                let relative_path = path.strip_prefix(&self.project_root)
                    .unwrap_or(&path)
                    .to_string_lossy();

                if pattern.is_match(&content) {
                    let is_allowed = rule.allowed_paths.iter()
                        .any(|p| relative_path.contains(p));
                    let is_forbidden = rule.forbidden_paths.iter()
                        .any(|p| relative_path.contains(p));

                    if !is_allowed || is_forbidden {
                        let severity_prefix = match rule.severity {
                            RuleSeverity::Error => "ERROR",
                            RuleSeverity::Warning => "WARNING",
                            RuleSeverity::Info => "INFO",
                        };

                        violations.push(Violation {
                            rule: format!("{} [{}]", rule.id, severity_prefix),
                            file: relative_path.to_string(),
                            message: Some(rule.description.clone()),
                            fix: Some(format!(
                                "Review usage in {} - {}", 
                                relative_path, 
                                rule.description
                            )),
                        });
                    }
                }
            }
        }

        Ok(())
    }

    /// Enforce no direct DB access in API layer (Rule 3.2)
    async fn enforce_no_db_in_api(&self) -> Result<Vec<Violation>> {
        let mut violations = Vec::new();
        
        let api_paths = [
            "src/api",
            "src/handlers", 
            "src/controllers",
            "src/routes",
            "src/endpoint",
        ];

        let db_patterns = [
            Regex::new(r"use\s+rusqlite")?,
            Regex::new(r"use\s+tokio_postgres")?,
            Regex::new(r"use\s+sqlx")?,
            Regex::new(r"Connection")?,
            Regex::new(r"\.query\(")?,
            Regex::new(r"\.execute\(")?,
        ];

        for api_path in &api_paths {
            let full_path = Path::new(&self.project_root).join(api_path);
            if !full_path.exists() {
                continue;
            }

            for entry in walkdir::WalkDir::new(&full_path)
                .into_iter()
                .filter_map(|e| e.ok())
            {
                if entry.file_type().is_file() && entry.path().extension() == Some("rs".as_ref()) {
                    let content = std::fs::read_to_string(entry.path())?;
                    let relative_path = entry.path()
                        .strip_prefix(&self.project_root)
                        .unwrap_or(entry.path())
                        .to_string_lossy();

                    for pattern in &db_patterns {
                        if pattern.is_match(&content) {
                            violations.push(Violation {
                                rule: "3.2 [ERROR]".to_string(),
                                file: relative_path.to_string(),
                                message: Some(
                                    "Database access detected in API layer. Use repository pattern."
                                        .to_string(),
                                ),
                                fix: Some(
                                    "Move DB operations to a repository and inject via dependency".to_string()
                                ),
                            });
                            break; // Only report once per file
                        }
                    }
                }
            }
        }

        Ok(violations)
    }

    /// Enforce feature module isolation
    async fn enforce_feature_isolation(&self) -> Result<Vec<Violation>> {
        let mut violations = Vec::new();
        
        let features_path = Path::new(&self.project_root).join("src/feature");
        if !features_path.exists() {
            return Ok(violations);
        }

        let _feature_dirs: HashSet<String> = std::fs::read_dir(&features_path)?
            .filter_map(|e| e.ok())
            .filter(|e| e.file_type().map(|t| t.is_dir()).unwrap_or(false))
            .filter_map(|e| e.file_name().into_string().ok())
            .collect();

        // Check for imports from other features
        let import_re = Regex::new(r"use\s+crate::feature::(\w+)")?;

        for entry in walkdir::WalkDir::new(&features_path)
            .into_iter()
            .filter_map(|e| e.ok())
        {
            if entry.file_type().is_file() && entry.path().extension() == Some("rs".as_ref()) {
                let content = std::fs::read_to_string(entry.path())?;
                let relative_path = entry.path()
                    .strip_prefix(&self.project_root)
                    .unwrap_or(entry.path())
                    .to_string_lossy();

                for cap in import_re.captures_iter(&content) {
                    if let Some(feature_name) = cap.get(1) {
                        let imported_feature = feature_name.as_str();
                        let current_feature = entry.path()
                            .parent()
                            .and_then(|p| p.file_name())
                            .and_then(|n| n.to_str())
                            .unwrap_or("");

                        if imported_feature != current_feature {
                            violations.push(Violation {
                                rule: "ARCH-FI [ERROR]".to_string(),
                                file: relative_path.to_string(),
                                message: Some(format!(
                                    "Feature '{}' imports from feature '{}' - violates isolation",
                                    current_feature, imported_feature
                                )),
                                fix: Some(
                                    "Use dependency injection or shared interfaces".to_string(),
                                ),
                            });
                        }
                    }
                }
            }
        }

        Ok(violations)
    }

    /// Enforce repository pattern usage
    async fn enforce_repository_pattern(&self) -> Result<Vec<Violation>> {
        let mut violations = Vec::new();
        
        let src_path = Path::new(&self.project_root).join("src");
        
        // Look for direct DB usage outside repository/ modules
        let db_usage_pattern = Regex::new(
            r"(rusqlite::|tokio_postgres::|sqlx::|\.execute\(|\.query\(|\.query_row\()"
        )?;

        for entry in walkdir::WalkDir::new(&src_path)
            .into_iter()
            .filter_map(|e| e.ok())
        {
            if entry.file_type().is_file() && entry.path().extension() == Some("rs".as_ref()) {
                let relative_path = entry.path()
                    .strip_prefix(&self.project_root)
                    .unwrap_or(entry.path())
                    .to_string_lossy();

                // Skip if already in repository layer
                if relative_path.contains("/repository/") 
                    || relative_path.contains("/db/")
                    || relative_path.contains("/data/") {
                    continue;
                }

                let content = std::fs::read_to_string(entry.path())?;
                
                if db_usage_pattern.is_match(&content) {
                    violations.push(Violation {
                        rule: "ARCH-RP [WARNING]".to_string(),
                        file: relative_path.to_string(),
                        message: Some(
                            "Direct database usage detected. Consider using repository pattern."
                                .to_string(),
                        ),
                        fix: Some(
                            "Extract DB operations into a Repository struct in repository/ module"
                                .to_string(),
                        ),
                    });
                }
            }
        }

        Ok(violations)
    }

    /// Enforce feature branch scope - only src/feature/* should be touched
    pub fn enforce_feature_branch_scope(&self) -> Result<Vec<Violation>> {
        let mut violations = Vec::new();

        // Get changed files from git diff
        let output = std::process::Command::new("git")
            .args(["diff", "main", "--name-only"])
            .current_dir(&self.project_root)
            .output();

        if let Ok(output) = output {
            let stdout = String::from_utf8_lossy(&output.stdout);
            let changed_files: Vec<&str> = stdout.lines().collect();

            // Allowed prefix for feature branches
            let allowed_prefix = "src/feature/";

            for file in changed_files {
                let file = file.trim();
                if file.is_empty() || file.starts_with(".") {
                    // Skip hidden/config files
                    continue;
                }

                // Check if file is outside src/feature/
                if !file.starts_with(allowed_prefix) {
                    violations.push(Violation {
                        rule: "FB-001 [ERROR]".to_string(),
                        file: file.to_string(),
                        message: Some(format!(
                            "Feature branch touched file outside src/feature/: {}",
                            file
                        )),
                        fix: Some(format!(
                            "Move changes to src/feature/<your_feature>/ or revert: git checkout main -- {}",
                            file
                        )),
                    });
                }
            }
        }

        Ok(violations)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    #[tokio::test]
    async fn test_no_db_in_api() {
        let temp_dir = TempDir::new().unwrap();
        let project_root = temp_dir.path().to_str().unwrap();

        // Create API directory with DB usage
        let api_dir = temp_dir.path().join("src/api");
        std::fs::create_dir_all(&api_dir).unwrap();
        std::fs::write(
            api_dir.join("handler.rs"),
            "use rusqlite::Connection; fn query() { let conn = Connection::open(\"test.db\"); }"
        ).unwrap();

        let enforcer = ArchEnforcer::new(project_root);
        let violations = enforcer.enforce_no_db_in_api().await.unwrap();

        assert_eq!(violations.len(), 1);
        assert!(violations[0].rule.contains("3.2"));
    }

    #[tokio::test]
    async fn test_feature_isolation() {
        let temp_dir = TempDir::new().unwrap();
        let project_root = temp_dir.path().to_str().unwrap();

        // Create feature directories
        let feature_a = temp_dir.path().join("src/feature/feature_a");
        let feature_b = temp_dir.path().join("src/feature/feature_b");
        std::fs::create_dir_all(&feature_a).unwrap();
        std::fs::create_dir_all(&feature_b).unwrap();

        // Feature A imports from Feature B - violation
        std::fs::write(
            feature_a.join("mod.rs"),
            "use crate::feature::feature_b::something;"
        ).unwrap();

        let enforcer = ArchEnforcer::new(project_root);
        let violations = enforcer.enforce_feature_isolation().await.unwrap();

        assert_eq!(violations.len(), 1);
        assert!(violations[0].message.as_ref().unwrap().contains("feature_a"));
    }
}
