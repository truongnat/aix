//! Security Gates Module
//!
//! Security gates for internet skills and sensitive operations.

use crate::engine::constraints::{
    ConstraintResult, ConstraintStatus, FixCommand, GateResult, SecurityConstraints, Violation,
};
use anyhow::Result;
use regex::Regex;
use std::path::Path;

/// Security gate checker for internet skills
pub struct SecurityGateChecker {
    project_root: String,
    constraints: SecurityConstraints,
}

impl SecurityGateChecker {
    pub fn new(project_root: &str, constraints: SecurityConstraints) -> Self {
        Self {
            project_root: project_root.to_string(),
            constraints,
        }
    }

    /// Check all security gates
    pub async fn check_all(&self) -> Result<ConstraintResult> {
        let mut all_violations = Vec::new();

        // Check internet skill security
        let internet_violations = self.check_internet_skills().await?;
        all_violations.extend(internet_violations);

        // Check for hardcoded secrets
        let secret_violations = self.check_hardcoded_secrets().await?;
        all_violations.extend(secret_violations);

        // Check for unsafe code
        let unsafe_violations = self.check_unsafe_code().await?;
        all_violations.extend(unsafe_violations);

        // Check for proper error handling
        let error_violations = self.check_error_handling().await?;
        all_violations.extend(error_violations);

        let has_violations = !all_violations.is_empty();
        let status = if has_violations {
            ConstraintStatus::Violation
        } else {
            ConstraintStatus::Pass
        };

        let gate_result = if has_violations {
            GateResult::Reject
        } else {
            GateResult::Approve
        };

        Ok(ConstraintResult {
            status,
            violations: all_violations,
            commands: if has_violations {
                vec![FixCommand {
                    step: "security".to_string(),
                    command: "Review security violations and add proper gates".to_string(),
                }]
            } else {
                Vec::new()
            },
            gate_result,
            next_step: Some("CLI cho merge/PR".to_string()),
        })
    }

    /// Check internet skills have proper security gates
    async fn check_internet_skills(&self) -> Result<Vec<Violation>> {
        let mut violations = Vec::new();

        if !self.constraints.internet_skills.require_approval {
            return Ok(violations);
        }

        let skills_dir = Path::new(&self.project_root).join("src/skills");
        if !skills_dir.exists() {
            return Ok(violations);
        }

        let network_patterns = [
            Regex::new(r"reqwest::")?,
            Regex::new(r"\.get\(")?,
            Regex::new(r"\.post\(")?,
            Regex::new(r"hyper::")?,
            Regex::new(r"curl::")?,
            Regex::new(r"std::net::TcpStream")?,
        ];

        for entry in walkdir::WalkDir::new(&skills_dir)
            .into_iter()
            .filter_map(|e| e.ok())
        {
            if entry.file_type().is_file() && entry.path().extension() == Some("rs".as_ref()) {
                let content = std::fs::read_to_string(entry.path())?;
                let relative_path = entry
                    .path()
                    .strip_prefix(&self.project_root)
                    .unwrap_or(entry.path())
                    .to_string_lossy();

                // Check for network usage
                let has_network = network_patterns.iter().any(|p| p.is_match(&content));

                if has_network {
                    // Check for security annotations
                    let has_security_annotation = content.contains("#[security_gate]")
                        || content.contains("SecurityGate")
                        || content.contains("require_network")
                        || content.contains("// SECURITY: network");

                    // Check for domain allowlist
                    let has_allowlist =
                        !self.constraints.internet_skills.allowed_domains.is_empty();
                    let checks_domains =
                        content.contains("allowed_domains") || content.contains("domain_whitelist");

                    if !has_security_annotation {
                        violations.push(Violation {
                            rule: "SEC-INET-001 [ERROR]".to_string(),
                            file: relative_path.to_string(),
                            message: Some(
                                "Internet skill missing #[security_gate] annotation".to_string(),
                            ),
                            fix: Some(
                                "Add #[security_gate] attribute or implement require_network()"
                                    .to_string(),
                            ),
                        });
                    }

                    if has_allowlist && !checks_domains {
                        violations.push(Violation {
                            rule: "SEC-INET-002 [WARNING]".to_string(),
                            file: relative_path.to_string(),
                            message: Some(
                                "Skill should validate against allowed_domains list".to_string(),
                            ),
                            fix: Some(
                                "Add domain validation against arch.yaml allowed_domains"
                                    .to_string(),
                            ),
                        });
                    }

                    // Check for blocked domains
                    for blocked in &self.constraints.internet_skills.blocked_domains {
                        if content.contains(blocked) {
                            violations.push(Violation {
                                rule: "SEC-INET-BLOCKED [ERROR]".to_string(),
                                file: relative_path.to_string(),
                                message: Some(format!(
                                    "Access to blocked domain '{}' detected",
                                    blocked
                                )),
                                fix: Some("Remove access to blocked domain".to_string()),
                            });
                        }
                    }
                }
            }
        }

        Ok(violations)
    }

    /// Check for hardcoded secrets/tokens
    async fn check_hardcoded_secrets(&self) -> Result<Vec<Violation>> {
        let mut violations = Vec::new();

        let secret_patterns = [
            (
                Regex::new(r#"(?i)api[_-]?key\s*[=:].*?["'][^"']{16,}["']"#)?,
                "API key",
            ),
            (
                Regex::new(r#"(?i)token\s*[=:].*?["'][^"']{16,}["']"#)?,
                "token",
            ),
            (
                Regex::new(r#"(?i)password\s*[=:].*?["'][^"']{8,}["']"#)?,
                "password",
            ),
            (
                Regex::new(r#"(?i)secret\s*[=:].*?["'][^"']{8,}["']"#)?,
                "secret",
            ),
            (
                Regex::new(r#"BEGIN\s+(RSA|EC|DSA|OPENSSH)\s+PRIVATE\s+KEY"#)?,
                "private key",
            ),
        ];

        let src_path = Path::new(&self.project_root).join("src");

        for entry in walkdir::WalkDir::new(&src_path)
            .into_iter()
            .filter_map(|e| e.ok())
        {
            if entry.file_type().is_file() && entry.path().extension() == Some("rs".as_ref()) {
                let content = std::fs::read_to_string(entry.path())?;
                let relative_path = entry
                    .path()
                    .strip_prefix(&self.project_root)
                    .unwrap_or(entry.path())
                    .to_string_lossy();

                for (pattern, secret_type) in &secret_patterns {
                    if pattern.is_match(&content) {
                        violations.push(Violation {
                            rule: "SEC-SECRET [CRITICAL]".to_string(),
                            file: relative_path.to_string(),
                            message: Some(format!("Potential hardcoded {} detected", secret_type)),
                            fix: Some(
                                "Use environment variables or secure secret storage".to_string(),
                            ),
                        });
                    }
                }
            }
        }

        Ok(violations)
    }

    /// Check for unsafe code usage
    async fn check_unsafe_code(&self) -> Result<Vec<Violation>> {
        let mut violations = Vec::new();

        let src_path = Path::new(&self.project_root).join("src");

        for entry in walkdir::WalkDir::new(&src_path)
            .into_iter()
            .filter_map(|e| e.ok())
        {
            if entry.file_type().is_file() && entry.path().extension() == Some("rs".as_ref()) {
                let content = std::fs::read_to_string(entry.path())?;
                let relative_path = entry
                    .path()
                    .strip_prefix(&self.project_root)
                    .unwrap_or(entry.path())
                    .to_string_lossy();

                // Check for unsafe blocks
                if content.contains("unsafe {") || content.contains("unsafe fn") {
                    // Check for justification comment
                    let has_justification = content.contains("// SAFETY:")
                        || content.contains("/// SAFETY:")
                        || content.contains("// safety:");

                    if !has_justification {
                        violations.push(Violation {
                            rule: "SEC-UNSAFE [WARNING]".to_string(),
                            file: relative_path.to_string(),
                            message: Some("Unsafe code without SAFETY comment".to_string()),
                            fix: Some(
                                "Add // SAFETY: comment explaining why unsafe is necessary"
                                    .to_string(),
                            ),
                        });
                    }
                }
            }
        }

        Ok(violations)
    }

    /// Check for proper error handling
    async fn check_error_handling(&self) -> Result<Vec<Violation>> {
        let mut violations = Vec::new();

        let src_path = Path::new(&self.project_root).join("src");

        for entry in walkdir::WalkDir::new(&src_path)
            .into_iter()
            .filter_map(|e| e.ok())
        {
            if entry.file_type().is_file() && entry.path().extension() == Some("rs".as_ref()) {
                let content = std::fs::read_to_string(entry.path())?;
                let relative_path = entry
                    .path()
                    .strip_prefix(&self.project_root)
                    .unwrap_or(entry.path())
                    .to_string_lossy();

                // Check for unwrap() in non-test code
                if !relative_path.contains("test") && !relative_path.contains("tests") {
                    let unwrap_count = content.matches(".unwrap()").count();
                    let _expect_count = content.matches(".expect(").count();

                    if unwrap_count > 5 {
                        violations.push(Violation {
                            rule: "SEC-ERR-001 [WARNING]".to_string(),
                            file: relative_path.to_string(),
                            message: Some(format!(
                                "Found {} unwrap() calls - consider proper error handling",
                                unwrap_count
                            )),
                            fix: Some(
                                "Replace unwrap() with ? operator or proper error handling"
                                    .to_string(),
                            ),
                        });
                    }

                    // Check for empty expects
                    if content.contains(".expect(\"\")") || content.contains(".expect(\"TODO\")") {
                        violations.push(Violation {
                            rule: "SEC-ERR-002 [WARNING]".to_string(),
                            file: relative_path.to_string(),
                            message: Some(
                                "Empty or placeholder expect() message found".to_string(),
                            ),
                            fix: Some("Add descriptive error message to expect()".to_string()),
                        });
                    }
                }
            }
        }

        Ok(violations)
    }

    /// Validate a specific skill's security posture
    pub async fn validate_skill(&self, skill_path: &Path) -> Result<Vec<Violation>> {
        let mut violations = Vec::new();

        if !skill_path.exists() {
            return Ok(violations);
        }

        let content = std::fs::read_to_string(skill_path)?;
        let relative_path = skill_path
            .strip_prefix(&self.project_root)
            .unwrap_or(skill_path)
            .to_string_lossy();

        // Check if it's an internet skill
        let is_internet_skill =
            content.contains("reqwest") || content.contains("http") || content.contains("network");

        if is_internet_skill {
            // Required security elements
            let checks = vec![
                ("capability()", content.contains("fn capability")),
                ("trust_tier", content.contains("trust_tier")),
                ("permissions", content.contains("permissions")),
            ];

            for (check, present) in checks {
                if !present {
                    violations.push(Violation {
                        rule: "SEC-SKILL [ERROR]".to_string(),
                        file: relative_path.to_string(),
                        message: Some(format!("Internet skill missing required: {}", check)),
                        fix: Some(format!("Add {} to skill implementation", check)),
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
    async fn test_check_internet_skills() {
        let temp_dir = TempDir::new().unwrap();
        let project_root = temp_dir.path().to_str().unwrap();

        let skills_dir = temp_dir.path().join("src/skills");
        std::fs::create_dir_all(&skills_dir).unwrap();

        // Create skill without security gate
        std::fs::write(
            skills_dir.join("http_skill.rs"),
            "use reqwest::Client; fn fetch() { Client::new().get(\"http://api.example.com\"); }",
        )
        .unwrap();

        let constraints = SecurityConstraints {
            internet_skills: crate::engine::constraints::InternetSkillConstraints {
                require_approval: true,
                allowed_domains: vec!["api.example.com".to_string()],
                blocked_domains: vec![],
            },
            db_isolation: Default::default(),
        };

        let checker = SecurityGateChecker::new(project_root, constraints);
        let violations = checker.check_internet_skills().await.unwrap();

        assert_eq!(violations.len(), 2); // Missing annotation + missing domain check
        assert!(violations[0].rule.contains("SEC-INET"));
    }

    #[tokio::test]
    async fn test_check_hardcoded_secrets() {
        let temp_dir = TempDir::new().unwrap();
        let project_root = temp_dir.path().to_str().unwrap();

        let src_dir = temp_dir.path().join("src");
        std::fs::create_dir_all(&src_dir).unwrap();

        // File with hardcoded API key
        std::fs::write(
            src_dir.join("config.rs"),
            r#"const API_KEY: &str = "sk-1234567890abcdef";"#,
        )
        .unwrap();

        let constraints = SecurityConstraints::default();
        let checker = SecurityGateChecker::new(project_root, constraints);
        let violations = checker.check_hardcoded_secrets().await.unwrap();

        assert_eq!(violations.len(), 1);
        assert!(violations[0].rule.contains("SECRET"));
    }
}
