// Integration tests for the formal verifier with built-in verification tools
//
// These tests demonstrate how the formal verifier works with all built-in
// verification tools in realistic scenarios.

#[cfg(test)]
mod tests {
    use crate::platform::tier3_trust_verification::{
        Artifact, Claim, DefaultFormalVerifier, FormalVerifier,
    };
    use crate::platform::tier3_trust_verification::formal_verifier::ClaimType;
    use crate::platform::tier3_trust_verification::verifiers::{
        AllTestsPassVerifier, CodeCoverageVerifier, NoSQLInjectionVerifier, NoSecretsVerifier,
    };

    #[test]
    fn test_formal_verifier_with_all_verifiers() {
        // Create and configure formal verifier
        let mut verifier = DefaultFormalVerifier::new();

        // Register all built-in verifiers
        verifier.register_verifier(Box::new(NoSQLInjectionVerifier::new())).unwrap();
        verifier.register_verifier(Box::new(AllTestsPassVerifier::new())).unwrap();
        verifier.register_verifier(Box::new(CodeCoverageVerifier::new())).unwrap();
        verifier.register_verifier(Box::new(NoSecretsVerifier::new())).unwrap();

        // Test SQL injection verification
        let sql_claim = Claim::new(
            "sql_check",
            ClaimType::NoSQLInjection,
            "test_agent",
            0.95,
        ).unwrap();

        let safe_sql = Artifact::from_inline(
            "source_code",
            "query!(\"SELECT * FROM users WHERE id = ?\", id)",
        );

        let result = verifier.verify_claim(sql_claim, &safe_sql).unwrap();
        assert!(result.verified);
        assert_eq!(result.verifier_tool, "NoSQLInjectionVerifier");

        // Test all tests pass verification
        let test_claim = Claim::new(
            "test_check",
            ClaimType::AllTestsPass,
            "test_agent",
            0.90,
        ).unwrap();

        let test_code = Artifact::from_inline(
            "source_code",
            "#[test]\nfn test_add() { assert_eq!(2 + 2, 4); }",
        );

        let result = verifier.verify_claim(test_claim, &test_code).unwrap();
        assert!(result.verified);
        assert_eq!(result.verifier_tool, "AllTestsPassVerifier");

        // Test code coverage verification
        let coverage_claim = Claim::new(
            "coverage_check",
            ClaimType::CodeCoverage { threshold: 50.0 },
            "test_agent",
            0.85,
        ).unwrap();

        let coverage_code = Artifact::from_inline(
            "source_code",
            "fn add(a: i32, b: i32) -> i32 { a + b }\n#[test]\nfn test() { assert_eq!(add(1,1), 2); }",
        );

        let result = verifier.verify_claim(coverage_claim, &coverage_code).unwrap();
        assert!(result.verified);
        assert_eq!(result.verifier_tool, "CodeCoverageVerifier");

        // Test secrets verification
        let secrets_claim = Claim::new(
            "secrets_check",
            ClaimType::NoSecrets,
            "test_agent",
            0.99,
        ).unwrap();

        let secure_code = Artifact::from_inline(
            "source_code",
            "let password = env::var(\"DB_PASSWORD\").unwrap();",
        );

        let result = verifier.verify_claim(secrets_claim, &secure_code).unwrap();
        assert!(result.verified);
        assert_eq!(result.verifier_tool, "NoSecretsVerifier");
    }

    #[test]
    fn test_security_pipeline_scenario() {
        // Simulate a complete security verification pipeline
        let mut verifier = DefaultFormalVerifier::new();
        verifier.register_verifier(Box::new(NoSQLInjectionVerifier::new())).unwrap();
        verifier.register_verifier(Box::new(NoSecretsVerifier::new())).unwrap();

        let code = r#"
            fn authenticate_user(username: String) -> Result<User> {
                let password = env::var("DB_PASSWORD")?;
                let query = "SELECT * FROM users WHERE username = ?";
                database.query(query, &[username])
            }
        "#;

        let artifact = Artifact::from_inline("source_code", code);

        // Verify no SQL injection
        let sql_claim = Claim::new(
            "security_sql",
            ClaimType::NoSQLInjection,
            "security_agent",
            0.95,
        ).unwrap();

        let result = verifier.verify_claim(sql_claim, &artifact).unwrap();
        assert!(result.verified, "SQL injection check should pass");

        // Verify no secrets
        let secrets_claim = Claim::new(
            "security_secrets",
            ClaimType::NoSecrets,
            "security_agent",
            0.99,
        ).unwrap();

        let result = verifier.verify_claim(secrets_claim, &artifact).unwrap();
        assert!(result.verified, "Secrets check should pass");
    }

    #[test]
    fn test_quality_pipeline_scenario() {
        // Simulate a complete quality verification pipeline
        let mut verifier = DefaultFormalVerifier::new();
        verifier.register_verifier(Box::new(AllTestsPassVerifier::new())).unwrap();
        verifier.register_verifier(Box::new(CodeCoverageVerifier::new())).unwrap();

        let code = r#"
            fn calculate_total(items: &[i32]) -> i32 {
                items.iter().sum()
            }

            #[test]
            fn test_calculate_total() {
                assert_eq!(calculate_total(&[1, 2, 3]), 6);
            }

            #[test]
            fn test_empty_list() {
                assert_eq!(calculate_total(&[]), 0);
            }
        "#;

        let artifact = Artifact::from_inline("source_code", code);

        // Verify all tests pass
        let test_claim = Claim::new(
            "quality_tests",
            ClaimType::AllTestsPass,
            "quality_agent",
            0.90,
        ).unwrap();

        let result = verifier.verify_claim(test_claim, &artifact).unwrap();
        assert!(result.verified, "All tests should pass");

        // Verify code coverage
        let coverage_claim = Claim::new(
            "quality_coverage",
            ClaimType::CodeCoverage { threshold: 60.0 },
            "quality_agent",
            0.85,
        ).unwrap();

        let result = verifier.verify_claim(coverage_claim, &artifact).unwrap();
        assert!(result.verified, "Coverage should meet threshold");
    }

    #[test]
    fn test_verification_failure_scenarios() {
        let mut verifier = DefaultFormalVerifier::new();
        verifier.register_verifier(Box::new(NoSQLInjectionVerifier::new())).unwrap();
        verifier.register_verifier(Box::new(NoSecretsVerifier::new())).unwrap();

        // Test SQL injection vulnerability detection
        let vulnerable_code = Artifact::from_inline(
            "source_code",
            r#"execute("SELECT * FROM users WHERE id = " + user_id)"#,
        );

        let sql_claim = Claim::new(
            "sql_vuln",
            ClaimType::NoSQLInjection,
            "test_agent",
            0.95,
        ).unwrap();

        let result = verifier.verify_claim(sql_claim, &vulnerable_code).unwrap();
        assert!(!result.verified, "Should detect SQL injection vulnerability");

        // Test hardcoded secret detection
        let insecure_code = Artifact::from_inline(
            "source_code",
            r#"let api_key = "sk-1234567890abcdef";"#,
        );

        let secrets_claim = Claim::new(
            "secrets_vuln",
            ClaimType::NoSecrets,
            "test_agent",
            0.99,
        ).unwrap();

        let result = verifier.verify_claim(secrets_claim, &insecure_code).unwrap();
        assert!(!result.verified, "Should detect hardcoded secret");
    }

    #[test]
    fn test_verifier_not_registered() {
        let verifier = DefaultFormalVerifier::new();

        let claim = Claim::new(
            "test_claim",
            ClaimType::NoSQLInjection,
            "test_agent",
            0.95,
        ).unwrap();

        let artifact = Artifact::from_inline("source_code", "fn main() {}");

        let result = verifier.verify_claim(claim, &artifact);
        assert!(result.is_err(), "Should fail when no verifier is registered");
    }

    #[test]
    fn test_multiple_verifiers_same_type() {
        // Test that the first matching verifier is used
        let mut verifier = DefaultFormalVerifier::new();
        
        verifier.register_verifier(Box::new(NoSQLInjectionVerifier::new())).unwrap();
        verifier.register_verifier(Box::new(NoSQLInjectionVerifier::new())).unwrap();

        let claim = Claim::new(
            "test_claim",
            ClaimType::NoSQLInjection,
            "test_agent",
            0.95,
        ).unwrap();

        let artifact = Artifact::from_inline(
            "source_code",
            "query!(\"SELECT * FROM users WHERE id = ?\", id)",
        );

        let result = verifier.verify_claim(claim, &artifact);
        assert!(result.is_ok(), "Should work with multiple verifiers of same type");
    }

    #[test]
    fn test_artifact_with_metadata() {
        let mut verifier = DefaultFormalVerifier::new();
        verifier.register_verifier(Box::new(NoSecretsVerifier::new())).unwrap();

        let artifact = Artifact::from_inline("source_code", "let x = 42;")
            .with_metadata("language", "rust")
            .with_metadata("version", "1.0")
            .with_metadata("author", "test_agent");

        let claim = Claim::new(
            "test_claim",
            ClaimType::NoSecrets,
            "test_agent",
            0.99,
        ).unwrap();

        let result = verifier.verify_claim(claim, &artifact).unwrap();
        assert!(result.verified);
    }

    #[test]
    fn test_verification_result_timestamps() {
        let mut verifier = DefaultFormalVerifier::new();
        verifier.register_verifier(Box::new(NoSecretsVerifier::new())).unwrap();

        let claim = Claim::new(
            "test_claim",
            ClaimType::NoSecrets,
            "test_agent",
            0.99,
        ).unwrap();

        let artifact = Artifact::from_inline("source_code", "let x = 42;");

        let result = verifier.verify_claim(claim, &artifact).unwrap();
        
        // Timestamp should be set
        assert!(result.timestamp_ms > 0);
    }
}
