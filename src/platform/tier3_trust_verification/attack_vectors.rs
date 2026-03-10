// Built-in attack vectors for adversarial testing
//
// This module provides concrete implementations of the AttackVector trait for common
// security testing scenarios. These attack vectors can be used to proactively discover
// vulnerabilities in agent-generated code and configurations.

use super::adversarial_tester::{AttackIntensity, AttackVector, Vulnerability};
use super::formal_verifier::{Artifact, ArtifactContent};
use crate::platform::{types::Severity, PlatformError, Result};

/// SQL Injection attack vector
///
/// This attack vector attempts to find SQL injection vulnerabilities by analyzing
/// database query patterns and testing for common injection techniques.
pub struct SQLInjectionAttackVector;

impl SQLInjectionAttackVector {
    pub fn new() -> Self {
        Self
    }

    /// Analyze code for SQL injection vulnerabilities
    fn find_sql_injection_vulnerabilities(
        &self,
        content: &str,
        intensity: AttackIntensity,
    ) -> Vec<Vulnerability> {
        let mut vulnerabilities = Vec::new();

        // Patterns that indicate potential SQL injection
        let dangerous_patterns = match intensity {
            AttackIntensity::Light => vec![
                (
                    "execute(\"SELECT",
                    "Direct string concatenation in SQL query",
                ),
                ("query(\"SELECT", "Direct string concatenation in SQL query"),
            ],
            AttackIntensity::Moderate => vec![
                (
                    "execute(\"SELECT",
                    "Direct string concatenation in SQL query",
                ),
                (
                    "execute('SELECT",
                    "Direct string concatenation in SQL query",
                ),
                ("query(\"SELECT", "Direct string concatenation in SQL query"),
                ("query('SELECT", "Direct string concatenation in SQL query"),
                (".raw(\"", "Raw SQL query without parameterization"),
                (".raw('", "Raw SQL query without parameterization"),
            ],
            AttackIntensity::Aggressive => vec![
                (
                    "execute(\"SELECT",
                    "Direct string concatenation in SQL query",
                ),
                (
                    "execute('SELECT",
                    "Direct string concatenation in SQL query",
                ),
                ("query(\"SELECT", "Direct string concatenation in SQL query"),
                ("query('SELECT", "Direct string concatenation in SQL query"),
                (".raw(\"", "Raw SQL query without parameterization"),
                (".raw('", "Raw SQL query without parameterization"),
                ("format!(\"SELECT", "String formatting in SQL query"),
                ("format!('SELECT", "String formatting in SQL query"),
                ("+ \"SELECT", "String concatenation in SQL query"),
                ("+ 'SELECT", "String concatenation in SQL query"),
            ],
        };

        for (line_num, line) in content.lines().enumerate() {
            for (pattern, description) in &dangerous_patterns {
                if line.contains(pattern) {
                    // Check if parameterization is used
                    let has_params = line.contains('?') || line.contains('$');

                    if !has_params {
                        let severity = if line.contains("user") || line.contains("input") {
                            Severity::Critical
                        } else {
                            Severity::High
                        };

                        vulnerabilities.push(Vulnerability::new(
                            severity,
                            "SQL Injection",
                            format!("line {}", line_num + 1),
                            format!("Pattern '{}' found without parameterization: {}", pattern, line.trim()),
                            format!("Use parameterized queries or prepared statements. Replace direct string concatenation with placeholders (? or $1, $2, etc.). Description: {}", description),
                        ));
                    }
                }
            }
        }

        vulnerabilities
    }
}

impl Default for SQLInjectionAttackVector {
    fn default() -> Self {
        Self::new()
    }
}

impl AttackVector for SQLInjectionAttackVector {
    fn name(&self) -> &str {
        "sql_injection"
    }

    fn description(&self) -> &str {
        "Tests for SQL injection vulnerabilities in database queries"
    }

    fn execute(
        &self,
        artifact: &Artifact,
        intensity: AttackIntensity,
    ) -> Result<Vec<Vulnerability>> {
        let content = match &artifact.content {
            ArtifactContent::Inline(text) => text.clone(),
            ArtifactContent::Path(path) => {
                return Err(PlatformError::InvalidInput(format!(
                    "File reading not yet implemented for path: {}",
                    path
                )));
            }
            ArtifactContent::Binary(_) => {
                return Err(PlatformError::InvalidInput(
                    "Binary artifacts not supported for SQL injection analysis".to_string(),
                ));
            }
        };

        Ok(self.find_sql_injection_vulnerabilities(&content, intensity))
    }

    fn applies_to(&self, artifact_type: &str) -> bool {
        matches!(
            artifact_type,
            "source_code" | "rust_code" | "python_code" | "javascript_code" | "sql_code"
        )
    }
}

/// Cross-Site Scripting (XSS) attack vector
///
/// This attack vector attempts to find XSS vulnerabilities by analyzing
/// HTML output generation and user input handling.
pub struct XSSAttackVector;

impl XSSAttackVector {
    pub fn new() -> Self {
        Self
    }

    /// Analyze code for XSS vulnerabilities
    fn find_xss_vulnerabilities(
        &self,
        content: &str,
        intensity: AttackIntensity,
    ) -> Vec<Vulnerability> {
        let mut vulnerabilities = Vec::new();

        // Patterns that indicate potential XSS
        let dangerous_patterns = match intensity {
            AttackIntensity::Light => vec![
                ("innerHTML", "Direct HTML injection"),
                ("document.write", "Direct document write"),
            ],
            AttackIntensity::Moderate => vec![
                ("innerHTML", "Direct HTML injection"),
                ("document.write", "Direct document write"),
                ("outerHTML", "Direct HTML injection"),
                ("insertAdjacentHTML", "Direct HTML injection"),
                (".html(", "jQuery HTML injection"),
            ],
            AttackIntensity::Aggressive => vec![
                ("innerHTML", "Direct HTML injection"),
                ("document.write", "Direct document write"),
                ("outerHTML", "Direct HTML injection"),
                ("insertAdjacentHTML", "Direct HTML injection"),
                (".html(", "jQuery HTML injection"),
                ("eval(", "Code evaluation"),
                ("dangerouslySetInnerHTML", "React unsafe HTML"),
                ("v-html", "Vue unsafe HTML"),
            ],
        };

        for (line_num, line) in content.lines().enumerate() {
            for (pattern, description) in &dangerous_patterns {
                if line.contains(pattern) {
                    // Check if sanitization is present
                    let has_sanitization = line.contains("sanitize")
                        || line.contains("escape")
                        || line.contains("encode");

                    if !has_sanitization {
                        let severity = if line.contains("user") || line.contains("input") {
                            Severity::Critical
                        } else {
                            Severity::High
                        };

                        vulnerabilities.push(Vulnerability::new(
                            severity,
                            "Cross-Site Scripting (XSS)",
                            format!("line {}", line_num + 1),
                            format!("Pattern '{}' found without sanitization: {}", pattern, line.trim()),
                            format!("Sanitize user input before rendering. Use proper escaping functions or safe rendering methods. Description: {}", description),
                        ));
                    }
                }
            }
        }

        vulnerabilities
    }
}

impl Default for XSSAttackVector {
    fn default() -> Self {
        Self::new()
    }
}

impl AttackVector for XSSAttackVector {
    fn name(&self) -> &str {
        "xss"
    }

    fn description(&self) -> &str {
        "Tests for Cross-Site Scripting (XSS) vulnerabilities in HTML output"
    }

    fn execute(
        &self,
        artifact: &Artifact,
        intensity: AttackIntensity,
    ) -> Result<Vec<Vulnerability>> {
        let content = match &artifact.content {
            ArtifactContent::Inline(text) => text.clone(),
            ArtifactContent::Path(path) => {
                return Err(PlatformError::InvalidInput(format!(
                    "File reading not yet implemented for path: {}",
                    path
                )));
            }
            ArtifactContent::Binary(_) => {
                return Err(PlatformError::InvalidInput(
                    "Binary artifacts not supported for XSS analysis".to_string(),
                ));
            }
        };

        Ok(self.find_xss_vulnerabilities(&content, intensity))
    }

    fn applies_to(&self, artifact_type: &str) -> bool {
        matches!(
            artifact_type,
            "source_code" | "javascript_code" | "html" | "web_code"
        )
    }
}

/// Hardcoded secrets attack vector
///
/// This attack vector attempts to find hardcoded credentials, API keys,
/// and other sensitive information in code.
pub struct HardcodedSecretsAttackVector;

impl HardcodedSecretsAttackVector {
    pub fn new() -> Self {
        Self
    }

    /// Analyze code for hardcoded secrets
    fn find_hardcoded_secrets(
        &self,
        content: &str,
        intensity: AttackIntensity,
    ) -> Vec<Vulnerability> {
        let mut vulnerabilities = Vec::new();

        // Patterns that indicate potential secrets
        let secret_patterns = match intensity {
            AttackIntensity::Light => vec![
                ("password", "Hardcoded password"),
                ("api_key", "Hardcoded API key"),
            ],
            AttackIntensity::Moderate => vec![
                ("password", "Hardcoded password"),
                ("api_key", "Hardcoded API key"),
                ("secret", "Hardcoded secret"),
                ("token", "Hardcoded token"),
                ("private_key", "Hardcoded private key"),
            ],
            AttackIntensity::Aggressive => vec![
                ("password", "Hardcoded password"),
                ("api_key", "Hardcoded API key"),
                ("secret", "Hardcoded secret"),
                ("token", "Hardcoded token"),
                ("private_key", "Hardcoded private key"),
                ("access_key", "Hardcoded access key"),
                ("auth", "Hardcoded authentication"),
                ("credential", "Hardcoded credential"),
                ("AWS_", "AWS credential"),
                ("GITHUB_", "GitHub token"),
            ],
        };

        for (line_num, line) in content.lines().enumerate() {
            let line_lower = line.to_lowercase();

            for (pattern, description) in &secret_patterns {
                if line_lower.contains(pattern) {
                    // Check if it's an assignment with a string value
                    let has_assignment =
                        line.contains('=') && (line.contains('"') || line.contains('\''));

                    // Skip if it's a comment or environment variable reference
                    let is_comment = line.trim().starts_with("//") || line.trim().starts_with('#');
                    let is_env_var = line.contains("env::var")
                        || line.contains("getenv")
                        || line.contains("process.env");

                    if has_assignment && !is_comment && !is_env_var {
                        vulnerabilities.push(Vulnerability::new(
                            Severity::Critical,
                            "Hardcoded Secret",
                            format!("line {}", line_num + 1),
                            format!("Potential hardcoded secret found: {}", line.trim()),
                            format!("Remove hardcoded secrets. Use environment variables, secret management systems (e.g., AWS Secrets Manager, HashiCorp Vault), or configuration files excluded from version control. Description: {}", description),
                        ));
                    }
                }
            }
        }

        vulnerabilities
    }
}

impl Default for HardcodedSecretsAttackVector {
    fn default() -> Self {
        Self::new()
    }
}

impl AttackVector for HardcodedSecretsAttackVector {
    fn name(&self) -> &str {
        "hardcoded_secrets"
    }

    fn description(&self) -> &str {
        "Tests for hardcoded credentials, API keys, and sensitive information"
    }

    fn execute(
        &self,
        artifact: &Artifact,
        intensity: AttackIntensity,
    ) -> Result<Vec<Vulnerability>> {
        let content = match &artifact.content {
            ArtifactContent::Inline(text) => text.clone(),
            ArtifactContent::Path(path) => {
                return Err(PlatformError::InvalidInput(format!(
                    "File reading not yet implemented for path: {}",
                    path
                )));
            }
            ArtifactContent::Binary(_) => {
                return Err(PlatformError::InvalidInput(
                    "Binary artifacts not supported for secrets analysis".to_string(),
                ));
            }
        };

        Ok(self.find_hardcoded_secrets(&content, intensity))
    }

    fn applies_to(&self, artifact_type: &str) -> bool {
        // Applies to all source code types
        artifact_type.contains("code") || artifact_type == "configuration"
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sql_injection_vector_basic() {
        let vector = SQLInjectionAttackVector::new();
        let code = r#"
            fn query_user(id: &str) {
                let query = format!("SELECT * FROM users WHERE id = '{}'", id);
                execute(query);
            }
        "#;

        let artifact = Artifact::from_inline("source_code", code);
        let vulns = vector.execute(&artifact, AttackIntensity::Light).unwrap();

        // Should not find vulnerability with Light intensity (format! not in Light patterns)
        assert_eq!(vulns.len(), 0);
    }

    #[test]
    fn test_sql_injection_vector_aggressive() {
        let vector = SQLInjectionAttackVector::new();
        let code = r#"
            fn query_user(id: &str) {
                let query = format!("SELECT * FROM users WHERE id = '{}'", id);
                execute(query);
            }
        "#;

        let artifact = Artifact::from_inline("source_code", code);
        let vulns = vector
            .execute(&artifact, AttackIntensity::Aggressive)
            .unwrap();

        // Should find vulnerability with Aggressive intensity
        assert!(!vulns.is_empty());
        assert_eq!(vulns[0].vulnerability_type, "SQL Injection");
    }

    #[test]
    fn test_sql_injection_with_parameterization() {
        let vector = SQLInjectionAttackVector::new();
        let code = r#"
            fn query_user(id: &str) {
                execute("SELECT * FROM users WHERE id = ?", &[id]);
            }
        "#;

        let artifact = Artifact::from_inline("source_code", code);
        let vulns = vector
            .execute(&artifact, AttackIntensity::Aggressive)
            .unwrap();

        // Should not find vulnerability when parameterization is used
        assert_eq!(vulns.len(), 0);
    }

    #[test]
    fn test_xss_vector() {
        let vector = XSSAttackVector::new();
        let code = r#"
            function displayUser(name) {
                document.getElementById('user').innerHTML = name;
            }
        "#;

        let artifact = Artifact::from_inline("javascript_code", code);
        let vulns = vector
            .execute(&artifact, AttackIntensity::Moderate)
            .unwrap();

        assert!(!vulns.is_empty());
        assert_eq!(vulns[0].vulnerability_type, "Cross-Site Scripting (XSS)");
    }

    #[test]
    fn test_xss_with_sanitization() {
        let vector = XSSAttackVector::new();
        let code = r#"
            function displayUser(name) {
                document.getElementById('user').innerHTML = sanitize(name);
            }
        "#;

        let artifact = Artifact::from_inline("javascript_code", code);
        let vulns = vector
            .execute(&artifact, AttackIntensity::Moderate)
            .unwrap();

        // Should not find vulnerability when sanitization is used
        assert_eq!(vulns.len(), 0);
    }

    #[test]
    fn test_hardcoded_secrets_vector() {
        let vector = HardcodedSecretsAttackVector::new();
        let code = r#"
            const API_KEY = "sk-1234567890abcdef";
            const password = "my_secret_password";
        "#;

        let artifact = Artifact::from_inline("source_code", code);
        let vulns = vector
            .execute(&artifact, AttackIntensity::Moderate)
            .unwrap();

        assert!(vulns.len() >= 2);
        assert!(vulns
            .iter()
            .any(|v| v.vulnerability_type == "Hardcoded Secret"));
    }

    #[test]
    fn test_hardcoded_secrets_env_var() {
        let vector = HardcodedSecretsAttackVector::new();
        let code = r#"
            let api_key = env::var("API_KEY").unwrap();
            let password = std::env::var("PASSWORD").unwrap();
        "#;

        let artifact = Artifact::from_inline("source_code", code);
        let vulns = vector
            .execute(&artifact, AttackIntensity::Moderate)
            .unwrap();

        // Should not find vulnerability when using environment variables
        assert_eq!(vulns.len(), 0);
    }

    #[test]
    fn test_vector_applies_to() {
        let sql_vector = SQLInjectionAttackVector::new();
        assert!(sql_vector.applies_to("source_code"));
        assert!(sql_vector.applies_to("rust_code"));
        assert!(!sql_vector.applies_to("image"));

        let xss_vector = XSSAttackVector::new();
        assert!(xss_vector.applies_to("javascript_code"));
        assert!(xss_vector.applies_to("html"));
        assert!(!xss_vector.applies_to("binary"));

        let secrets_vector = HardcodedSecretsAttackVector::new();
        assert!(secrets_vector.applies_to("source_code"));
        assert!(secrets_vector.applies_to("configuration"));
        assert!(secrets_vector.applies_to("python_code"));
    }
}
