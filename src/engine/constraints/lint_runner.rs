//! Lint Runner Module
//!
//! Integrates clippy, custom SDLC linters, and provides fix commands.

use crate::engine::constraints::{
    ConstraintResult, ConstraintStatus, FixCommand, GateResult, Violation,
};
use anyhow::{anyhow, Result};
use std::path::Path;
use std::process::Command;

/// Lint runner for running various linters
pub struct LintRunner {
    project_root: String,
}

impl LintRunner {
    pub fn new(project_root: &str) -> Self {
        Self {
            project_root: project_root.to_string(),
        }
    }

    /// Run all configured linters
    pub async fn run_all(&self) -> Result<ConstraintResult> {
        let mut all_violations = Vec::new();
        let mut all_commands = Vec::new();

        // Run cargo clippy
        match self.run_clippy().await {
            Ok((violations, commands)) => {
                let has_violations = !violations.is_empty();
                all_violations.extend(violations);
                if has_violations {
                    all_commands.extend(commands);
                }
            }
            Err(e) => {
                return Ok(ConstraintResult {
                    status: ConstraintStatus::Blocked,
                    violations: vec![Violation {
                        rule: "lint.clippy".to_string(),
                        file: String::new(),
                        message: Some(format!("Clippy failed to run: {}", e)),
                        fix: None,
                    }],
                    commands: Vec::new(),
                    gate_result: GateResult::Reject,
                    next_step: None,
                });
            }
        }

        // Run custom SDLC linter
        match self.run_sdlc_linter().await {
            Ok((violations, commands)) => {
                all_violations.extend(violations);
                all_commands.extend(commands);
            }
            Err(e) => {
                eprintln!("SDLC linter error: {}", e);
            }
        }

        // Check for formatting
        match self.check_formatting().await {
            Ok(violations) => {
                let has_violations = !violations.is_empty();
                all_violations.extend(violations);
                if has_violations {
                    all_commands.push(FixCommand {
                        step: "lint".to_string(),
                        command: "cargo fmt".to_string(),
                    });
                }
            }
            Err(e) => {
                eprintln!("Formatting check error: {}", e);
            }
        }

        let status = if all_violations.is_empty() {
            ConstraintStatus::Pass
        } else {
            ConstraintStatus::Violation
        };

        let gate_result = if all_violations.is_empty() {
            GateResult::Approve
        } else {
            GateResult::Reject
        };

        Ok(ConstraintResult {
            status,
            violations: all_violations,
            commands: all_commands,
            gate_result,
            next_step: Some("CLI cho merge/PR".to_string()),
        })
    }

    /// Run cargo clippy with warnings as errors
    async fn run_clippy(&self) -> Result<(Vec<Violation>, Vec<FixCommand>)> {
        let output = Command::new("cargo")
            .args([
                "clippy",
                "--all-targets",
                "--all-features",
                "--",
                "-D",
                "warnings",
                "-D",
                "clippy::all",
                "-W",
                "clippy::pedantic",
            ])
            .current_dir(&self.project_root)
            .output()
            .map_err(|e| anyhow!("Failed to run clippy: {}", e))?;

        let _stdout = String::from_utf8_lossy(&output.stdout);
        let stderr = String::from_utf8_lossy(&output.stderr);

        let violations = parse_clippy_output(&stderr);

        let commands = if !violations.is_empty() {
            vec![FixCommand {
                step: "lint".to_string(),
                command: "cargo fix --allow-dirty --allow-staged".to_string(),
            }]
        } else {
            Vec::new()
        };

        Ok((violations, commands))
    }

    /// Run custom SDLC linter for agentic-sdlc specific rules
    async fn run_sdlc_linter(&self) -> Result<(Vec<Violation>, Vec<FixCommand>)> {
        let mut violations = Vec::new();
        let mut commands = Vec::new();

        // Check for workflow YAML validity
        let workflow_dir = Path::new(&self.project_root).join("workflows");
        if workflow_dir.exists() {
            for entry in std::fs::read_dir(&workflow_dir)? {
                let entry = entry?;
                let path = entry.path();
                if path
                    .extension()
                    .map(|e| e == "yaml" || e == "yml")
                    .unwrap_or(false)
                {
                    if let Ok(content) = std::fs::read_to_string(&path) {
                        if let Err(e) = serde_yaml::from_str::<serde_yaml::Value>(&content) {
                            violations.push(Violation {
                                rule: "sdlc.workflow.yaml".to_string(),
                                file: path.to_string_lossy().to_string(),
                                message: Some(format!("Invalid workflow YAML: {}", e)),
                                fix: Some("Fix YAML syntax".to_string()),
                            });
                        }
                    }
                }
            }
        }

        // Check for proper skill metadata
        let skills_dir = Path::new(&self.project_root).join("src/skills");
        if skills_dir.exists() {
            for entry in std::fs::read_dir(&skills_dir)? {
                let entry = entry?;
                let path = entry.path();
                if path.extension().map(|e| e == "rs").unwrap_or(false) {
                    let content = std::fs::read_to_string(&path)?;

                    // Check if skill implements required methods
                    if content.contains("impl Skill for") {
                        if !content.contains("fn capability") {
                            violations.push(Violation {
                                rule: "sdlc.skill.capability".to_string(),
                                file: path.to_string_lossy().to_string(),
                                message: Some("Skill missing capability() method".to_string()),
                                fix: Some(
                                    "Add capability() method returning SkillCapability".to_string(),
                                ),
                            });
                        }

                        if !content.contains("fn name") {
                            violations.push(Violation {
                                rule: "sdlc.skill.name".to_string(),
                                file: path.to_string_lossy().to_string(),
                                message: Some("Skill missing name() method".to_string()),
                                fix: Some("Add name() method".to_string()),
                            });
                        }
                    }
                }
            }
        }

        if !violations.is_empty() {
            commands.push(FixCommand {
                step: "lint".to_string(),
                command: "Review and fix SDLC violations".to_string(),
            });
        }

        Ok((violations, commands))
    }

    /// Check code formatting
    async fn check_formatting(&self) -> Result<Vec<Violation>> {
        let output = Command::new("cargo")
            .args(["fmt", "--", "--check"])
            .current_dir(&self.project_root)
            .output()
            .map_err(|e| anyhow!("Failed to run cargo fmt: {}", e))?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            let violations = stderr
                .lines()
                .filter(|l| l.contains("Diff") || l.contains("left"))
                .map(|l| Violation {
                    rule: "fmt".to_string(),
                    file: l.to_string(),
                    message: Some("File is not formatted".to_string()),
                    fix: Some("Run: cargo fmt".to_string()),
                })
                .collect();
            return Ok(violations);
        }

        Ok(Vec::new())
    }

    /// Apply automatic fixes
    pub async fn apply_fixes(&self) -> Result<Vec<String>> {
        let mut applied_fixes = Vec::new();

        // Try cargo fix first
        let fix_output = Command::new("cargo")
            .args(["fix", "--allow-dirty", "--allow-staged", "--lib"])
            .current_dir(&self.project_root)
            .output()?;

        if fix_output.status.success() {
            applied_fixes.push("Applied cargo fix".to_string());
        }

        // Then format
        let fmt_output = Command::new("cargo")
            .args(["fmt"])
            .current_dir(&self.project_root)
            .output()?;

        if fmt_output.status.success() {
            applied_fixes.push("Applied cargo fmt".to_string());
        }

        Ok(applied_fixes)
    }
}

fn parse_clippy_output(output: &str) -> Vec<Violation> {
    let mut violations = Vec::new();
    let mut current_file: String;

    for line in output.lines() {
        // Parse clippy output format: file.rs:line:col: severity: message
        if let Some(pos) = line.find(": error:") {
            let file_part = &line[..pos];
            let message = &line[pos + 8..];
            current_file = file_part.split(':').next().unwrap_or("").to_string();

            violations.push(Violation {
                rule: "clippy".to_string(),
                file: current_file.clone(),
                message: Some(message.trim().to_string()),
                fix: Some("cargo fix --allow-dirty".to_string()),
            });
        } else if let Some(pos) = line.find(": warning:") {
            let file_part = &line[..pos];
            let message = &line[pos + 10..];
            current_file = file_part.split(':').next().unwrap_or("").to_string();

            violations.push(Violation {
                rule: "clippy.warning".to_string(),
                file: current_file.clone(),
                message: Some(message.trim().to_string()),
                fix: Some("cargo fix --allow-dirty".to_string()),
            });
        }
    }

    violations
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_clippy_error() {
        let output = "src/main.rs:10:5: error: unused variable: `x`\n  |\n  |     let x = 5;\n";
        let violations = parse_clippy_output(output);
        assert_eq!(violations.len(), 1);
        assert_eq!(violations[0].file, "src/main.rs");
    }

    #[test]
    fn test_parse_clippy_warning() {
        let output = "src/lib.rs:20:10: warning: unused import";
        let violations = parse_clippy_output(output);
        assert_eq!(violations.len(), 1);
        assert_eq!(violations[0].rule, "clippy.warning");
    }
}
