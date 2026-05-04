//! Constraints & Guardrails Enforcement Module
//!
//! Phase 2: Lint + Architecture enforcer
//! - Integrates clippy/eslint + custom SDLC linters
//! - Enforces .agents/constraints/arch.yaml rules
//! - Security gates for internet skills

use anyhow::{anyhow, Result};
use serde::{Deserialize, Serialize};
use std::path::Path;
use std::process::Command;

pub mod arch_enforcer;
pub mod lint_runner;
pub mod security_gates;

/// Constraint check result following JSON schema spec
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum ConstraintStatus {
    Pass,
    Violation,
    Blocked,
}

/// Single violation record
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Violation {
    pub rule: String,
    pub file: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub fix: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub message: Option<String>,
}

/// Command to execute for fixing
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FixCommand {
    pub step: String,
    pub command: String,
}

/// Complete constraint check result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConstraintResult {
    pub status: ConstraintStatus,
    #[serde(skip_serializing_if = "Vec::is_empty", default)]
    pub violations: Vec<Violation>,
    #[serde(skip_serializing_if = "Vec::is_empty", default)]
    pub commands: Vec<FixCommand>,
    pub gate_result: GateResult,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub next_step: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum GateResult {
    Approve,
    Reject,
}

impl ConstraintResult {
    pub fn pass() -> Self {
        Self {
            status: ConstraintStatus::Pass,
            violations: Vec::new(),
            commands: Vec::new(),
            gate_result: GateResult::Approve,
            next_step: Some("merge".to_string()),
        }
    }

    pub fn violation(rule: &str, file: &str, message: &str) -> Self {
        Self {
            status: ConstraintStatus::Violation,
            violations: vec![Violation {
                rule: rule.to_string(),
                file: file.to_string(),
                message: Some(message.to_string()),
                fix: None,
            }],
            commands: vec![FixCommand {
                step: "fix".to_string(),
                command: format!("cargo fix --allow-dirty --package {}", file),
            }],
            gate_result: GateResult::Reject,
            next_step: Some("fix_violations".to_string()),
        }
    }

    pub fn blocked(reason: &str) -> Self {
        Self {
            status: ConstraintStatus::Blocked,
            violations: vec![Violation {
                rule: "security.blocked".to_string(),
                file: String::new(),
                message: Some(reason.to_owned()),
                fix: None,
            }],
            commands: Vec::new(),
            gate_result: GateResult::Reject,
            next_step: None,
        }
    }
}

/// Architecture constraints from arch.yaml
#[derive(Debug, Clone, Deserialize)]
pub struct ArchConstraints {
    pub version: String,
    pub rules: Vec<ArchRule>,
    #[serde(default)]
    pub security: SecurityConstraints,
}

#[derive(Debug, Clone, Deserialize)]
pub struct ArchRule {
    pub id: String,
    pub name: String,
    pub description: String,
    pub severity: RuleSeverity,
    pub pattern: String,
    #[serde(default)]
    pub allowed_paths: Vec<String>,
    #[serde(default)]
    pub forbidden_paths: Vec<String>,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum RuleSeverity {
    Error,
    Warning,
    Info,
}

#[derive(Debug, Clone, Default, Deserialize)]
pub struct SecurityConstraints {
    #[serde(default)]
    pub internet_skills: InternetSkillConstraints,
    #[serde(default)]
    pub db_isolation: DbIsolationConstraints,
}

#[derive(Debug, Clone, Default, Deserialize)]
pub struct InternetSkillConstraints {
    pub require_approval: bool,
    #[serde(default)]
    pub allowed_domains: Vec<String>,
    #[serde(default)]
    pub blocked_domains: Vec<String>,
}

#[derive(Debug, Clone, Default, Deserialize)]
pub struct DbIsolationConstraints {
    /// API layer must not directly access DB
    pub no_db_in_api: bool,
    /// Feature modules must be isolated
    pub feature_isolation: bool,
    /// Required repository pattern
    pub require_repository_pattern: bool,
}

/// Main constraints engine
pub struct ConstraintsEngine {
    project_root: String,
    constraints: Option<ArchConstraints>,
}

impl ConstraintsEngine {
    pub fn new(project_root: &str) -> Self {
        Self {
            project_root: project_root.to_string(),
            constraints: None,
        }
    }

    /// Load arch.yaml constraints
    pub fn load_constraints(&mut self) -> Result<()> {
        let arch_path = Path::new(&self.project_root)
            .join(".agents")
            .join("constraints")
            .join("arch.yaml");

        if !arch_path.exists() {
            // Create default constraints
            self.constraints = Some(default_constraints());
            return Ok(());
        }

        let content = std::fs::read_to_string(&arch_path)?;
        let constraints: ArchConstraints = serde_yaml::from_str(&content)
            .map_err(|e| anyhow!("Failed to parse arch.yaml: {}", e))?;

        self.constraints = Some(constraints);
        Ok(())
    }

    /// Run all constraint checks
    pub fn check_all(&self) -> Result<ConstraintResult> {
        let mut violations = Vec::new();
        let mut all_commands = Vec::new();

        // Run clippy
        match self.run_clippy() {
            Ok(clippy_result) => {
                violations.extend(clippy_result.violations);
                all_commands.extend(clippy_result.commands);
            }
            Err(e) => {
                return Ok(ConstraintResult::blocked(&format!("Clippy failed: {}", e)));
            }
        }

        // Check architecture rules
        if let Some(constraints) = &self.constraints {
            let arch_result = self.check_architecture(constraints)?;
            violations.extend(arch_result.violations);
            all_commands.extend(arch_result.commands);
        }

        // Security gates
        let security_result = self.check_security_gates()?;
        violations.extend(security_result.violations);

        let status = if violations.is_empty() {
            ConstraintStatus::Pass
        } else {
            ConstraintStatus::Violation
        };

        let gate_result = if violations.is_empty() {
            GateResult::Approve
        } else {
            GateResult::Reject
        };

        Ok(ConstraintResult {
            status,
            violations,
            commands: all_commands,
            gate_result,
            next_step: Some("CLI cho merge/PR".to_string()),
        })
    }

    fn run_clippy(&self) -> Result<ConstraintResult> {
        let output = Command::new("cargo")
            .args(["clippy", "--all-targets", "--", "-D", "warnings"])
            .current_dir(&self.project_root)
            .output()?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            let violations = parse_clippy_output(&stderr);

            return Ok(ConstraintResult {
                status: ConstraintStatus::Violation,
                violations,
                commands: vec![FixCommand {
                    step: "lint".to_string(),
                    command: "cargo fix --allow-dirty".to_string(),
                }],
                gate_result: GateResult::Reject,
                next_step: Some("fix_clippy".to_string()),
            });
        }

        Ok(ConstraintResult::pass())
    }

    fn check_architecture(&self, constraints: &ArchConstraints) -> Result<ConstraintResult> {
        let mut violations = Vec::new();

        for rule in &constraints.rules {
            let rule_violations = self.check_arch_rule(rule)?;
            violations.extend(rule_violations);
        }

        // Check DB isolation
        if constraints.security.db_isolation.no_db_in_api {
            let db_violations = self.check_db_isolation()?;
            violations.extend(db_violations);
        }

        let status = if violations.is_empty() {
            ConstraintStatus::Pass
        } else {
            ConstraintStatus::Violation
        };

        let gate_result = if violations.is_empty() {
            GateResult::Approve
        } else {
            GateResult::Reject
        };

        Ok(ConstraintResult {
            status,
            violations,
            commands: vec![FixCommand {
                step: "enforce".to_string(),
                command: "cargo fix --allow-dirty".to_string(),
            }],
            gate_result,
            next_step: Some("fix_arch".to_string()),
        })
    }

    fn check_arch_rule(&self, rule: &ArchRule) -> Result<Vec<Violation>> {
        let mut violations = Vec::new();

        let output = Command::new("rg")
            .args(["--type", "rust", "-n", &rule.pattern, &self.project_root])
            .output();

        if let Ok(output) = output {
            let stdout = String::from_utf8_lossy(&output.stdout);
            for line in stdout.lines() {
                if let Some((file, _)) = line.split_once(':') {
                    let relative_path = file.trim_start_matches(&self.project_root);

                    // Check if path is allowed
                    let is_allowed = rule.allowed_paths.iter().any(|p| relative_path.contains(p));
                    let is_forbidden = rule
                        .forbidden_paths
                        .iter()
                        .any(|p| relative_path.contains(p));

                    if !is_allowed || is_forbidden {
                        violations.push(Violation {
                            rule: rule.id.clone(),
                            file: file.to_string(),
                            message: Some(rule.description.clone()),
                            fix: Some(format!("cargo fix --allow-dirty --file {}", file)),
                        });
                    }
                }
            }
        }

        Ok(violations)
    }

    fn check_db_isolation(&self) -> Result<Vec<Violation>> {
        let mut violations = Vec::new();

        // Pattern: Database access in API layer
        let db_patterns = ["rusqlite", "tokio_postgres", "sqlx", "Connection", "Pool"];

        for pattern in &db_patterns {
            let output = Command::new("rg")
                .args([
                    "--type",
                    "rust",
                    "-n",
                    pattern,
                    &format!("{}/src/api", self.project_root),
                ])
                .output();

            if let Ok(output) = output {
                let stdout = String::from_utf8_lossy(&output.stdout);
                for line in stdout.lines() {
                    if let Some((file, _)) = line.split_once(':') {
                        violations.push(Violation {
                            rule: "ARCH-001".to_string(),
                            file: file.to_string(),
                            message: Some("Database access not allowed in API layer".to_string()),
                            fix: Some("Move DB access to repository layer".to_string()),
                        });
                    }
                }
            }
        }

        Ok(violations)
    }

    fn check_security_gates(&self) -> Result<ConstraintResult> {
        let mut violations = Vec::new();

        // Check internet skill security
        let skills_dir = Path::new(&self.project_root).join("src/skills");
        if skills_dir.exists() {
            for entry in std::fs::read_dir(&skills_dir)? {
                let entry = entry?;
                let path = entry.path();
                if path.extension().map(|e| e == "rs").unwrap_or(false) {
                    let content = std::fs::read_to_string(&path)?;

                    // Check for network calls without proper gates
                    if content.contains("reqwest") || content.contains("http") {
                        let has_security_gate = content.contains("SecurityGate")
                            || content.contains("security_policy")
                            || content.contains("require_network");

                        if !has_security_gate {
                            violations.push(Violation {
                                rule: "SEC-001".to_string(),
                                file: path.to_string_lossy().to_string(),
                                message: Some("Internet skill missing security gate".to_string()),
                                fix: Some("Add SecurityGate annotation".to_string()),
                            });
                        }
                    }
                }
            }
        }

        let status = if violations.is_empty() {
            ConstraintStatus::Pass
        } else {
            ConstraintStatus::Violation
        };

        let gate_result = if violations.is_empty() {
            GateResult::Approve
        } else {
            GateResult::Reject
        };

        Ok(ConstraintResult {
            status,
            violations,
            commands: Vec::new(),
            gate_result,
            next_step: Some("fix_security".to_string()),
        })
    }
}

fn parse_clippy_output(stderr: &str) -> Vec<Violation> {
    let mut violations = Vec::new();

    for line in stderr.lines() {
        if line.contains("error:") || line.contains("warning:") {
            if let Some((location, message)) = line.split_once("error:") {
                let file = location.split(':').next().unwrap_or("").to_string();
                violations.push(Violation {
                    rule: "clippy".to_string(),
                    file,
                    message: Some(message.trim().to_string()),
                    fix: Some("cargo fix --allow-dirty".to_string()),
                });
            }
        }
    }

    violations
}

fn default_constraints() -> ArchConstraints {
    ArchConstraints {
        version: "1.0".to_string(),
        rules: vec![
            ArchRule {
                id: "ARCH-001".to_string(),
                name: "No DB in API".to_string(),
                description: "API layer must not directly access database".to_string(),
                severity: RuleSeverity::Error,
                pattern: "rusqlite|tokio_postgres|sqlx".to_string(),
                allowed_paths: vec!["repository".to_string(), "db".to_string()],
                forbidden_paths: vec!["api".to_string(), "handler".to_string()],
            },
            ArchRule {
                id: "ARCH-002".to_string(),
                name: "Feature Isolation".to_string(),
                description: "Feature modules must be isolated".to_string(),
                severity: RuleSeverity::Error,
                pattern: "use crate::(?!feature)".to_string(),
                allowed_paths: vec![],
                forbidden_paths: vec!["feature".to_string()],
            },
        ],
        security: SecurityConstraints {
            internet_skills: InternetSkillConstraints {
                require_approval: true,
                allowed_domains: vec![],
                blocked_domains: vec!["localhost:22".to_string()],
            },
            db_isolation: DbIsolationConstraints {
                no_db_in_api: true,
                feature_isolation: true,
                require_repository_pattern: true,
            },
        },
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_constraint_result_pass() {
        let result = ConstraintResult::pass();
        assert!(matches!(result.status, ConstraintStatus::Pass));
        assert!(matches!(result.gate_result, GateResult::Approve));
    }

    #[test]
    fn test_constraint_result_violation() {
        let result = ConstraintResult::violation("RULE-1", "src/main.rs", "Test violation");
        assert!(matches!(result.status, ConstraintStatus::Violation));
        assert!(matches!(result.gate_result, GateResult::Reject));
        assert_eq!(result.violations.len(), 1);
    }

    #[test]
    fn test_default_constraints() {
        let constraints = default_constraints();
        assert_eq!(constraints.version, "1.0");
        assert!(!constraints.rules.is_empty());
        assert!(constraints.security.db_isolation.no_db_in_api);
    }
}
