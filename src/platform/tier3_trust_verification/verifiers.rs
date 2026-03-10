// Built-in verification tools
//
// This module provides concrete implementations of the ToolVerifier trait for common
// security and quality checks. These verifiers can be used to validate agent claims
// about code security, test coverage, and credential scanning.

use super::formal_verifier::{
    Artifact, ArtifactContent, Claim, ClaimType, ToolVerifier, VerificationResult,
};
use crate::platform::{types::Evidence, PlatformError, Result};

/// NoSQLInjection verifier using SAST integration
///
/// This verifier checks for SQL injection vulnerabilities in code artifacts.
/// In a production implementation, this would integrate with actual SAST tools
/// like SQLMap, Semgrep, or similar static analysis tools.
pub struct NoSQLInjectionVerifier;

impl NoSQLInjectionVerifier {
    pub fn new() -> Self {
        Self
    }

    /// Simulate SAST analysis for SQL injection vulnerabilities
    fn analyze_for_sql_injection(&self, content: &str) -> Result<Vec<String>> {
        let mut vulnerabilities = Vec::new();

        // Simple pattern matching for demonstration
        // In production, this would use a real SAST tool
        let dangerous_patterns = [
            "execute(\"SELECT",
            "execute('SELECT",
            "query(\"SELECT",
            "query('SELECT",
            ".raw(\"",
            ".raw('",
            "format!(\"SELECT",
        ];

        for (line_num, line) in content.lines().enumerate() {
            for pattern in &dangerous_patterns {
                if line.contains(pattern) && !line.contains("?") && !line.contains("$") {
                    // Potential SQL injection if no parameterization detected
                    vulnerabilities.push(format!(
                        "Line {}: Potential SQL injection - unparameterized query detected",
                        line_num + 1
                    ));
                }
            }
        }

        Ok(vulnerabilities)
    }
}

impl Default for NoSQLInjectionVerifier {
    fn default() -> Self {
        Self::new()
    }
}

impl ToolVerifier for NoSQLInjectionVerifier {
    fn name(&self) -> &str {
        "NoSQLInjectionVerifier"
    }

    fn verify(&self, claim: &Claim, artifact: &Artifact) -> Result<VerificationResult> {
        if claim.claim_type != ClaimType::NoSQLInjection {
            return Err(PlatformError::InvalidInput(
                "NoSQLInjectionVerifier only supports NoSQLInjection claims".to_string(),
            ));
        }

        let content = match &artifact.content {
            ArtifactContent::Inline(text) => text.clone(),
            ArtifactContent::Path(path) => {
                // In production, read the file
                // For now, return error indicating file reading needed
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

        let vulnerabilities = self.analyze_for_sql_injection(&content)?;

        if vulnerabilities.is_empty() {
            Ok(VerificationResult::success(
                self.name(),
                vec![Evidence::SASTReport(
                    "No SQL injection vulnerabilities detected".to_string(),
                )],
            ))
        } else {
            let report = format!(
                "SQL injection vulnerabilities found:\n{}",
                vulnerabilities.join("\n")
            );
            Ok(VerificationResult::failure(
                self.name(),
                vec![Evidence::SASTReport(report)],
            ))
        }
    }

    fn supports_claim_type(&self, claim_type: &ClaimType) -> bool {
        matches!(claim_type, ClaimType::NoSQLInjection)
    }
}

/// AllTestsPass verifier using test runner integration
///
/// This verifier checks that all tests in a codebase pass successfully.
/// In a production implementation, this would integrate with test runners
/// like cargo test, pytest, jest, etc.
pub struct AllTestsPassVerifier;

impl AllTestsPassVerifier {
    pub fn new() -> Self {
        Self
    }

    /// Simulate running tests
    fn run_tests(&self, content: &str) -> Result<TestResults> {
        // Simple simulation for demonstration
        // In production, this would execute actual test commands

        let test_count = content.matches("#[test]").count();

        // Simulate test execution
        // Check for obvious test failures in comments or assertions
        let failed_tests = content
            .lines()
            .filter(|line| {
                line.contains("// FAIL")
                    || line.contains("assert!(false")
                    || line.contains("panic!")
            })
            .count();

        Ok(TestResults {
            total: test_count,
            passed: test_count.saturating_sub(failed_tests),
            failed: failed_tests,
            skipped: 0,
        })
    }
}

impl Default for AllTestsPassVerifier {
    fn default() -> Self {
        Self::new()
    }
}

impl ToolVerifier for AllTestsPassVerifier {
    fn name(&self) -> &str {
        "AllTestsPassVerifier"
    }

    fn verify(&self, claim: &Claim, artifact: &Artifact) -> Result<VerificationResult> {
        if claim.claim_type != ClaimType::AllTestsPass {
            return Err(PlatformError::InvalidInput(
                "AllTestsPassVerifier only supports AllTestsPass claims".to_string(),
            ));
        }

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
                    "Binary artifacts not supported for test execution".to_string(),
                ));
            }
        };

        let results = self.run_tests(&content)?;

        let report = format!(
            "Test Results: {} total, {} passed, {} failed, {} skipped",
            results.total, results.passed, results.failed, results.skipped
        );

        if results.failed == 0 && results.total > 0 {
            Ok(VerificationResult::success(
                self.name(),
                vec![Evidence::TestReport(report)],
            ))
        } else if results.total == 0 {
            Ok(VerificationResult::failure(
                self.name(),
                vec![Evidence::TestReport("No tests found".to_string())],
            ))
        } else {
            Ok(VerificationResult::failure(
                self.name(),
                vec![Evidence::TestReport(report)],
            ))
        }
    }

    fn supports_claim_type(&self, claim_type: &ClaimType) -> bool {
        matches!(claim_type, ClaimType::AllTestsPass)
    }
}

#[derive(Debug)]
struct TestResults {
    total: usize,
    passed: usize,
    failed: usize,
    skipped: usize,
}

/// CodeCoverage verifier with threshold checking
///
/// This verifier measures code coverage and checks if it meets a specified threshold.
/// In a production implementation, this would integrate with coverage tools like
/// tarpaulin, coverage.py, istanbul, etc.
pub struct CodeCoverageVerifier;

impl CodeCoverageVerifier {
    pub fn new() -> Self {
        Self
    }

    /// Simulate measuring code coverage
    fn measure_coverage(&self, content: &str) -> Result<CoverageMetrics> {
        // Simple simulation for demonstration
        // In production, this would use actual coverage tools

        let total_lines = content
            .lines()
            .filter(|line| {
                let trimmed = line.trim();
                !trimmed.is_empty()
                    && !trimmed.starts_with("//")
                    && !trimmed.starts_with("/*")
                    && !trimmed.starts_with('*')
            })
            .count();

        // Simulate coverage by checking for test markers
        let test_markers = content.matches("#[test]").count();
        let covered_lines = if test_markers > 0 {
            // Assume each test covers ~10 lines on average
            (test_markers * 10).min(total_lines)
        } else {
            0
        };

        let percentage = if total_lines > 0 {
            (covered_lines as f64 / total_lines as f64) * 100.0
        } else {
            0.0
        };

        Ok(CoverageMetrics {
            total_lines,
            covered_lines,
            percentage,
        })
    }
}

impl Default for CodeCoverageVerifier {
    fn default() -> Self {
        Self::new()
    }
}

impl ToolVerifier for CodeCoverageVerifier {
    fn name(&self) -> &str {
        "CodeCoverageVerifier"
    }

    fn verify(&self, claim: &Claim, artifact: &Artifact) -> Result<VerificationResult> {
        let threshold = match &claim.claim_type {
            ClaimType::CodeCoverage { threshold } => *threshold,
            _ => {
                return Err(PlatformError::InvalidInput(
                    "CodeCoverageVerifier only supports CodeCoverage claims".to_string(),
                ));
            }
        };

        if !(0.0..=100.0).contains(&threshold) {
            return Err(PlatformError::InvalidInput(
                "Coverage threshold must be between 0.0 and 100.0".to_string(),
            ));
        }

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
                    "Binary artifacts not supported for coverage analysis".to_string(),
                ));
            }
        };

        let metrics = self.measure_coverage(&content)?;

        let report = format!(
            "Coverage: {:.2}% ({}/{} lines covered), Threshold: {:.2}%",
            metrics.percentage, metrics.covered_lines, metrics.total_lines, threshold
        );

        if metrics.percentage >= threshold {
            Ok(VerificationResult::success(
                self.name(),
                vec![Evidence::CoverageReport(report)],
            ))
        } else {
            Ok(VerificationResult::failure(
                self.name(),
                vec![Evidence::CoverageReport(report)],
            ))
        }
    }

    fn supports_claim_type(&self, claim_type: &ClaimType) -> bool {
        matches!(claim_type, ClaimType::CodeCoverage { .. })
    }
}

#[derive(Debug)]
struct CoverageMetrics {
    total_lines: usize,
    covered_lines: usize,
    percentage: f64,
}

/// NoSecrets verifier for credential scanning
///
/// This verifier scans code for exposed secrets, credentials, API keys, and other
/// sensitive information. In a production implementation, this would integrate with
/// tools like git-secrets, truffleHog, or similar secret scanning tools.
pub struct NoSecretsVerifier;

impl NoSecretsVerifier {
    pub fn new() -> Self {
        Self
    }

    /// Scan for potential secrets in content
    fn scan_for_secrets(&self, content: &str) -> Result<Vec<SecretFinding>> {
        let mut findings = Vec::new();

        // Common secret patterns (simplified for demonstration)
        let patterns = [
            ("password", "Hardcoded password"),
            ("api_key", "API key"),
            ("api-key", "API key"),
            ("secret", "Secret"),
            ("token", "Token"),
            ("aws_access_key", "AWS access key"),
            ("aws-access-key", "AWS access key"),
            ("private_key", "Private key"),
            ("private-key", "Private key"),
            ("-----BEGIN", "Private key block"),
        ];

        for (line_num, line) in content.lines().enumerate() {
            let line_lower = line.to_lowercase();

            for (pattern, secret_type) in &patterns {
                // Simple substring matching for demonstration
                // In production, use regex or dedicated secret scanning tools
                if line_lower.contains(pattern) && line.contains('=') && line.contains('"') {
                    // Skip if it's a comment or example
                    if !line.trim().starts_with("//")
                        && !line.trim().starts_with('#')
                        && !line.contains("example")
                        && !line.contains("placeholder")
                        && !line.contains("env::var")
                    {
                        findings.push(SecretFinding {
                            line_number: line_num + 1,
                            secret_type: secret_type.to_string(),
                            context: line.trim().to_string(),
                        });
                    }
                }
            }
        }

        Ok(findings)
    }
}

impl Default for NoSecretsVerifier {
    fn default() -> Self {
        Self::new()
    }
}

impl ToolVerifier for NoSecretsVerifier {
    fn name(&self) -> &str {
        "NoSecretsVerifier"
    }

    fn verify(&self, claim: &Claim, artifact: &Artifact) -> Result<VerificationResult> {
        if claim.claim_type != ClaimType::NoSecrets {
            return Err(PlatformError::InvalidInput(
                "NoSecretsVerifier only supports NoSecrets claims".to_string(),
            ));
        }

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
                    "Binary artifacts not supported for secret scanning".to_string(),
                ));
            }
        };

        let findings = self.scan_for_secrets(&content)?;

        if findings.is_empty() {
            Ok(VerificationResult::success(
                self.name(),
                vec![Evidence::ToolOutput(
                    "No secrets or credentials detected".to_string(),
                )],
            ))
        } else {
            let report = format!(
                "Secrets detected:\n{}",
                findings
                    .iter()
                    .map(|f| format!("Line {}: {} - {}", f.line_number, f.secret_type, f.context))
                    .collect::<Vec<_>>()
                    .join("\n")
            );
            Ok(VerificationResult::failure(
                self.name(),
                vec![Evidence::ToolOutput(report)],
            ))
        }
    }

    fn supports_claim_type(&self, claim_type: &ClaimType) -> bool {
        matches!(claim_type, ClaimType::NoSecrets)
    }
}

#[derive(Debug)]
struct SecretFinding {
    line_number: usize,
    secret_type: String,
    context: String,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_no_sql_injection_verifier_clean_code() {
        let verifier = NoSQLInjectionVerifier::new();
        let claim =
            Claim::new("test_claim", ClaimType::NoSQLInjection, "test_agent", 0.95).unwrap();

        let artifact = Artifact::from_inline(
            "source_code",
            r#"
            fn get_user(id: i32) -> User {
                query!("SELECT * FROM users WHERE id = ?", id)
            }
            "#,
        );

        let result = verifier.verify(&claim, &artifact).unwrap();
        assert!(result.verified);
    }

    #[test]
    fn test_no_sql_injection_verifier_vulnerable_code() {
        let verifier = NoSQLInjectionVerifier::new();
        let claim =
            Claim::new("test_claim", ClaimType::NoSQLInjection, "test_agent", 0.95).unwrap();

        let artifact = Artifact::from_inline(
            "source_code",
            r#"
            fn get_user(id: String) -> User {
                execute("SELECT * FROM users WHERE id = " + id)
            }
            "#,
        );

        let result = verifier.verify(&claim, &artifact).unwrap();
        assert!(!result.verified);
    }

    #[test]
    fn test_all_tests_pass_verifier_passing_tests() {
        let verifier = AllTestsPassVerifier::new();
        let claim = Claim::new("test_claim", ClaimType::AllTestsPass, "test_agent", 0.95).unwrap();

        let artifact = Artifact::from_inline(
            "source_code",
            r#"
            #[test]
            fn test_addition() {
                assert_eq!(2 + 2, 4);
            }

            #[test]
            fn test_subtraction() {
                assert_eq!(5 - 3, 2);
            }
            "#,
        );

        let result = verifier.verify(&claim, &artifact).unwrap();
        assert!(result.verified);
    }

    #[test]
    fn test_all_tests_pass_verifier_failing_tests() {
        let verifier = AllTestsPassVerifier::new();
        let claim = Claim::new("test_claim", ClaimType::AllTestsPass, "test_agent", 0.95).unwrap();

        let artifact = Artifact::from_inline(
            "source_code",
            r#"
            #[test]
            fn test_addition() {
                assert_eq!(2 + 2, 4);
            }

            #[test]
            fn test_failure() {
                // FAIL: This test should fail
                assert!(false);
            }
            "#,
        );

        let result = verifier.verify(&claim, &artifact).unwrap();
        assert!(!result.verified);
    }

    #[test]
    fn test_all_tests_pass_verifier_no_tests() {
        let verifier = AllTestsPassVerifier::new();
        let claim = Claim::new("test_claim", ClaimType::AllTestsPass, "test_agent", 0.95).unwrap();

        let artifact = Artifact::from_inline(
            "source_code",
            r#"
            fn add(a: i32, b: i32) -> i32 {
                a + b
            }
            "#,
        );

        let result = verifier.verify(&claim, &artifact).unwrap();
        assert!(!result.verified);
    }

    #[test]
    fn test_code_coverage_verifier_meets_threshold() {
        let verifier = CodeCoverageVerifier::new();
        let claim = Claim::new(
            "test_claim",
            ClaimType::CodeCoverage { threshold: 50.0 },
            "test_agent",
            0.95,
        )
        .unwrap();

        let artifact = Artifact::from_inline(
            "source_code",
            r#"
            fn add(a: i32, b: i32) -> i32 {
                a + b
            }

            #[test]
            fn test_add() {
                assert_eq!(add(2, 2), 4);
            }
            "#,
        );

        let result = verifier.verify(&claim, &artifact).unwrap();
        assert!(result.verified);
    }

    #[test]
    fn test_code_coverage_verifier_below_threshold() {
        let verifier = CodeCoverageVerifier::new();
        let claim = Claim::new(
            "test_claim",
            ClaimType::CodeCoverage { threshold: 90.0 },
            "test_agent",
            0.95,
        )
        .unwrap();

        let artifact = Artifact::from_inline(
            "source_code",
            r#"
            fn add(a: i32, b: i32) -> i32 {
                a + b
            }

            fn subtract(a: i32, b: i32) -> i32 {
                a - b
            }

            fn multiply(a: i32, b: i32) -> i32 {
                a * b
            }

            #[test]
            fn test_add() {
                assert_eq!(add(2, 2), 4);
            }
            "#,
        );

        let result = verifier.verify(&claim, &artifact).unwrap();
        assert!(!result.verified);
    }

    #[test]
    fn test_no_secrets_verifier_clean_code() {
        let verifier = NoSecretsVerifier::new();
        let claim = Claim::new("test_claim", ClaimType::NoSecrets, "test_agent", 0.95).unwrap();

        let artifact = Artifact::from_inline(
            "source_code",
            r#"
            fn connect_to_db() {
                let password = env::var("DB_PASSWORD").unwrap();
                Database::connect(&password)
            }
            "#,
        );

        let result = verifier.verify(&claim, &artifact).unwrap();
        assert!(result.verified);
    }

    #[test]
    fn test_no_secrets_verifier_with_secrets() {
        let verifier = NoSecretsVerifier::new();
        let claim = Claim::new("test_claim", ClaimType::NoSecrets, "test_agent", 0.95).unwrap();

        let artifact = Artifact::from_inline(
            "source_code",
            r#"
            fn connect_to_db() {
                let password = "super_secret_password_123";
                Database::connect(password)
            }
            "#,
        );

        let result = verifier.verify(&claim, &artifact).unwrap();
        assert!(!result.verified);
    }

    #[test]
    fn test_verifier_wrong_claim_type() {
        let verifier = NoSQLInjectionVerifier::new();
        let claim = Claim::new("test_claim", ClaimType::AllTestsPass, "test_agent", 0.95).unwrap();

        let artifact = Artifact::from_inline("source_code", "fn main() {}");

        let result = verifier.verify(&claim, &artifact);
        assert!(result.is_err());
    }

    #[test]
    fn test_verifier_supports_claim_type() {
        let sql_verifier = NoSQLInjectionVerifier::new();
        assert!(sql_verifier.supports_claim_type(&ClaimType::NoSQLInjection));
        assert!(!sql_verifier.supports_claim_type(&ClaimType::AllTestsPass));

        let test_verifier = AllTestsPassVerifier::new();
        assert!(test_verifier.supports_claim_type(&ClaimType::AllTestsPass));
        assert!(!test_verifier.supports_claim_type(&ClaimType::NoSQLInjection));

        let coverage_verifier = CodeCoverageVerifier::new();
        assert!(coverage_verifier.supports_claim_type(&ClaimType::CodeCoverage { threshold: 80.0 }));
        assert!(!coverage_verifier.supports_claim_type(&ClaimType::NoSecrets));

        let secrets_verifier = NoSecretsVerifier::new();
        assert!(secrets_verifier.supports_claim_type(&ClaimType::NoSecrets));
        assert!(!secrets_verifier.supports_claim_type(&ClaimType::NoXSS));
    }
}
