// Adversarial Tester - red team agent for proactive vulnerability discovery
//
// This module implements a red team agent that actively tries to break implementer
// agent outputs before review. It executes attacks based on configurable profiles,
// detects vulnerabilities, provides remediation recommendations, and learns from
// successful attacks to improve future coverage.

use crate::platform::{
    types::{current_timestamp_ms, Severity},
    PlatformError, Result,
};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::{Arc, RwLock};

use super::formal_verifier::Artifact;

/// Attack intensity levels
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum AttackIntensity {
    /// Light attacks - basic vulnerability checks
    Light,
    /// Moderate attacks - comprehensive testing
    Moderate,
    /// Aggressive attacks - exhaustive testing with edge cases
    Aggressive,
}

/// Attack profile configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AttackProfile {
    /// Intensity level for attacks
    pub intensity: AttackIntensity,
    /// Time budget for attack execution in milliseconds
    pub time_budget_ms: u64,
    /// Specific attack vectors to use (empty means all available)
    pub attack_vectors: Vec<String>,
}

impl AttackProfile {
    /// Create a new attack profile
    pub fn new(intensity: AttackIntensity, time_budget_ms: u64) -> Self {
        Self {
            intensity,
            time_budget_ms,
            attack_vectors: Vec::new(),
        }
    }

    /// Add a specific attack vector
    pub fn with_vector(mut self, vector: impl Into<String>) -> Self {
        self.attack_vectors.push(vector.into());
        self
    }

    /// Set specific attack vectors
    pub fn with_vectors(mut self, vectors: Vec<String>) -> Self {
        self.attack_vectors = vectors;
        self
    }
}

impl Default for AttackProfile {
    fn default() -> Self {
        Self::new(AttackIntensity::Moderate, 60_000) // 1 minute default
    }
}

/// Vulnerability discovered during adversarial testing
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Vulnerability {
    /// Severity level of the vulnerability
    pub severity: Severity,
    /// Type of vulnerability (e.g., "SQL Injection", "XSS", "Buffer Overflow")
    pub vulnerability_type: String,
    /// Location in the artifact where vulnerability was found
    pub location: String,
    /// Proof of exploit demonstrating the vulnerability
    pub exploit_proof: String,
    /// Recommended remediation steps
    pub remediation: String,
}

impl Vulnerability {
    /// Create a new vulnerability
    pub fn new(
        severity: Severity,
        vulnerability_type: impl Into<String>,
        location: impl Into<String>,
        exploit_proof: impl Into<String>,
        remediation: impl Into<String>,
    ) -> Self {
        Self {
            severity,
            vulnerability_type: vulnerability_type.into(),
            location: location.into(),
            exploit_proof: exploit_proof.into(),
            remediation: remediation.into(),
        }
    }
}

/// Report generated after adversarial testing
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AttackReport {
    /// Vulnerabilities discovered during testing
    pub vulnerabilities_found: Vec<Vulnerability>,
    /// Total number of attack attempts made
    pub attack_attempts: u32,
    /// Success rate (vulnerabilities found / attempts)
    pub success_rate: f64,
    /// General recommendations for improving security
    pub recommendations: Vec<String>,
    /// Timestamp when the attack was performed
    pub timestamp_ms: u64,
    /// Time taken for the attack in milliseconds
    pub duration_ms: u64,
}

impl AttackReport {
    /// Create a new attack report
    pub fn new(
        vulnerabilities_found: Vec<Vulnerability>,
        attack_attempts: u32,
        duration_ms: u64,
    ) -> Self {
        let success_rate = if attack_attempts > 0 {
            vulnerabilities_found.len() as f64 / attack_attempts as f64
        } else {
            0.0
        };

        Self {
            vulnerabilities_found,
            attack_attempts,
            success_rate,
            recommendations: Vec::new(),
            timestamp_ms: current_timestamp_ms(),
            duration_ms,
        }
    }

    /// Add a recommendation to the report
    pub fn with_recommendation(mut self, recommendation: impl Into<String>) -> Self {
        self.recommendations.push(recommendation.into());
        self
    }

    /// Add multiple recommendations
    pub fn with_recommendations(mut self, recommendations: Vec<String>) -> Self {
        self.recommendations.extend(recommendations);
        self
    }
}

/// Attack strategy for a specific artifact type
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AttackStrategy {
    /// Name of the strategy
    pub name: String,
    /// Artifact types this strategy applies to
    pub artifact_types: Vec<String>,
    /// Description of the strategy
    pub description: String,
    /// Attack vectors used in this strategy
    pub vectors: Vec<String>,
}

impl AttackStrategy {
    /// Create a new attack strategy
    pub fn new(
        name: impl Into<String>,
        artifact_types: Vec<String>,
        description: impl Into<String>,
    ) -> Self {
        Self {
            name: name.into(),
            artifact_types,
            description: description.into(),
            vectors: Vec::new(),
        }
    }

    /// Add an attack vector to the strategy
    pub fn with_vector(mut self, vector: impl Into<String>) -> Self {
        self.vectors.push(vector.into());
        self
    }
}

/// Trait for attack vector implementations
pub trait AttackVector: Send + Sync {
    /// Name of this attack vector
    fn name(&self) -> &str;

    /// Description of what this attack vector tests
    fn description(&self) -> &str;

    /// Execute the attack against an artifact
    fn execute(
        &self,
        artifact: &Artifact,
        intensity: AttackIntensity,
    ) -> Result<Vec<Vulnerability>>;

    /// Check if this vector applies to the given artifact type
    fn applies_to(&self, artifact_type: &str) -> bool;
}

/// Main adversarial tester trait
pub trait AdversarialTester {
    /// Execute attacks against an artifact
    fn attack(&self, target: &Artifact, attack_profile: AttackProfile) -> Result<AttackReport>;

    /// Register a new attack vector
    fn register_attack_vector(&mut self, vector: Box<dyn AttackVector>) -> Result<()>;

    /// Get attack strategies for a specific artifact type
    fn get_attack_strategies(&self, artifact_type: &str) -> Result<Vec<AttackStrategy>>;

    /// Learn from a successful attack to improve future coverage
    fn learn_from_attack(&mut self, vulnerability: &Vulnerability) -> Result<()>;
}

/// Learning data from successful attacks
#[derive(Debug, Clone, Serialize, Deserialize)]
struct AttackLearning {
    /// Vulnerability type that was discovered
    vulnerability_type: String,
    /// How many times this type has been found
    occurrence_count: u32,
    /// Common patterns in successful attacks
    patterns: Vec<String>,
    /// Timestamp of last occurrence
    last_seen_ms: u64,
}

/// Default implementation of the adversarial tester
pub struct DefaultAdversarialTester {
    /// Registered attack vectors
    vectors: Arc<RwLock<Vec<Box<dyn AttackVector>>>>,
    /// Learning data from successful attacks
    learning_data: Arc<RwLock<HashMap<String, AttackLearning>>>,
}

impl DefaultAdversarialTester {
    /// Create a new adversarial tester
    pub fn new() -> Self {
        Self {
            vectors: Arc::new(RwLock::new(Vec::new())),
            learning_data: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    /// Get applicable attack vectors for an artifact
    fn get_applicable_vectors(&self, artifact: &Artifact) -> Result<Vec<String>> {
        let vectors = self.vectors.read().map_err(|e| {
            PlatformError::InternalError(format!("Failed to acquire vectors lock: {}", e))
        })?;

        let applicable: Vec<String> = vectors
            .iter()
            .filter(|v| v.applies_to(&artifact.artifact_type))
            .map(|v| v.name().to_string())
            .collect();

        Ok(applicable)
    }

    /// Generate recommendations based on vulnerabilities found
    fn generate_recommendations(&self, vulnerabilities: &[Vulnerability]) -> Vec<String> {
        let mut recommendations = Vec::new();

        // Count vulnerabilities by severity
        let critical_count = vulnerabilities
            .iter()
            .filter(|v| matches!(v.severity, Severity::Critical))
            .count();
        let high_count = vulnerabilities
            .iter()
            .filter(|v| matches!(v.severity, Severity::High))
            .count();

        if critical_count > 0 {
            recommendations.push(format!(
                "CRITICAL: {} critical vulnerabilities found. Immediate remediation required.",
                critical_count
            ));
        }

        if high_count > 0 {
            recommendations.push(format!(
                "HIGH: {} high-severity vulnerabilities found. Prioritize remediation.",
                high_count
            ));
        }

        // Group by vulnerability type
        let mut type_counts: HashMap<String, usize> = HashMap::new();
        for vuln in vulnerabilities {
            *type_counts
                .entry(vuln.vulnerability_type.clone())
                .or_insert(0) += 1;
        }

        for (vuln_type, count) in type_counts.iter() {
            if *count > 1 {
                recommendations.push(format!(
                    "Pattern detected: {} instances of {} vulnerabilities. Consider systematic review.",
                    count, vuln_type
                ));
            }
        }

        // Add general recommendations if vulnerabilities found
        if !vulnerabilities.is_empty() {
            recommendations.push("Run formal verification tools to validate fixes.".to_string());
            recommendations.push(
                "Consider adding automated security tests to prevent regression.".to_string(),
            );
        }

        recommendations
    }
}

impl Default for DefaultAdversarialTester {
    fn default() -> Self {
        Self::new()
    }
}

impl AdversarialTester for DefaultAdversarialTester {
    fn attack(&self, target: &Artifact, attack_profile: AttackProfile) -> Result<AttackReport> {
        let start_time = current_timestamp_ms();
        let mut vulnerabilities = Vec::new();
        let mut attack_attempts = 0u32;

        let vectors = self.vectors.read().map_err(|e| {
            PlatformError::InternalError(format!("Failed to acquire vectors lock: {}", e))
        })?;

        // Determine which vectors to use
        let vectors_to_use: Vec<&Box<dyn AttackVector>> =
            if attack_profile.attack_vectors.is_empty() {
                // Use all applicable vectors
                vectors
                    .iter()
                    .filter(|v| v.applies_to(&target.artifact_type))
                    .collect()
            } else {
                // Use only specified vectors
                vectors
                    .iter()
                    .filter(|v| {
                        attack_profile
                            .attack_vectors
                            .contains(&v.name().to_string())
                            && v.applies_to(&target.artifact_type)
                    })
                    .collect()
            };

        if vectors_to_use.is_empty() {
            return Err(PlatformError::AdversarialTestFailed(format!(
                "No applicable attack vectors found for artifact type: {}",
                target.artifact_type
            )));
        }

        // Execute attacks with time budget
        let time_per_vector = attack_profile.time_budget_ms / vectors_to_use.len() as u64;

        for vector in vectors_to_use {
            let vector_start = current_timestamp_ms();

            // Check if we've exceeded time budget
            if current_timestamp_ms() - start_time >= attack_profile.time_budget_ms {
                break;
            }

            attack_attempts += 1;

            // Execute the attack vector
            match vector.execute(target, attack_profile.intensity) {
                Ok(found_vulns) => {
                    vulnerabilities.extend(found_vulns);
                }
                Err(e) => {
                    // Log error but continue with other vectors
                    eprintln!("Attack vector {} failed: {}", vector.name(), e);
                }
            }

            // Respect time budget per vector
            let elapsed = current_timestamp_ms() - vector_start;
            if elapsed < time_per_vector {
                // In a real implementation, we might want to do more thorough testing
                // For now, we just continue to the next vector
            }
        }

        let duration_ms = current_timestamp_ms() - start_time;

        // Generate recommendations
        let recommendations = self.generate_recommendations(&vulnerabilities);

        Ok(
            AttackReport::new(vulnerabilities, attack_attempts, duration_ms)
                .with_recommendations(recommendations),
        )
    }

    fn register_attack_vector(&mut self, vector: Box<dyn AttackVector>) -> Result<()> {
        let mut vectors = self.vectors.write().map_err(|e| {
            PlatformError::InternalError(format!("Failed to acquire vectors lock: {}", e))
        })?;

        vectors.push(vector);
        Ok(())
    }

    fn get_attack_strategies(&self, artifact_type: &str) -> Result<Vec<AttackStrategy>> {
        let vectors = self.vectors.read().map_err(|e| {
            PlatformError::InternalError(format!("Failed to acquire vectors lock: {}", e))
        })?;

        let mut strategies = Vec::new();

        // Group vectors by artifact type
        let applicable_vectors: Vec<&Box<dyn AttackVector>> = vectors
            .iter()
            .filter(|v| v.applies_to(artifact_type))
            .collect();

        if !applicable_vectors.is_empty() {
            // Create a comprehensive strategy for this artifact type
            let strategy = AttackStrategy::new(
                format!("{}_comprehensive", artifact_type),
                vec![artifact_type.to_string()],
                format!(
                    "Comprehensive security testing for {} artifacts",
                    artifact_type
                ),
            );

            let strategy = applicable_vectors
                .iter()
                .fold(strategy, |s, v| s.with_vector(v.name()));

            strategies.push(strategy);
        }

        Ok(strategies)
    }

    fn learn_from_attack(&mut self, vulnerability: &Vulnerability) -> Result<()> {
        let mut learning = self.learning_data.write().map_err(|e| {
            PlatformError::InternalError(format!("Failed to acquire learning data lock: {}", e))
        })?;

        let entry = learning
            .entry(vulnerability.vulnerability_type.clone())
            .or_insert_with(|| AttackLearning {
                vulnerability_type: vulnerability.vulnerability_type.clone(),
                occurrence_count: 0,
                patterns: Vec::new(),
                last_seen_ms: 0,
            });

        entry.occurrence_count += 1;
        entry.last_seen_ms = current_timestamp_ms();

        // Extract patterns from the exploit proof
        // In a real implementation, this would use ML or pattern matching
        // For now, we just store the location as a pattern
        if !entry.patterns.contains(&vulnerability.location) {
            entry.patterns.push(vulnerability.location.clone());
        }

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_attack_profile_creation() {
        let profile = AttackProfile::new(AttackIntensity::Moderate, 60_000);
        assert_eq!(profile.intensity, AttackIntensity::Moderate);
        assert_eq!(profile.time_budget_ms, 60_000);
        assert!(profile.attack_vectors.is_empty());
    }

    #[test]
    fn test_attack_profile_with_vectors() {
        let profile = AttackProfile::new(AttackIntensity::Aggressive, 120_000)
            .with_vector("sql_injection")
            .with_vector("xss");

        assert_eq!(profile.attack_vectors.len(), 2);
        assert!(profile
            .attack_vectors
            .contains(&"sql_injection".to_string()));
    }

    #[test]
    fn test_vulnerability_creation() {
        let vuln = Vulnerability::new(
            Severity::High,
            "SQL Injection",
            "line 42",
            "SELECT * FROM users WHERE id = '1' OR '1'='1'",
            "Use parameterized queries",
        );

        assert_eq!(vuln.severity, Severity::High);
        assert_eq!(vuln.vulnerability_type, "SQL Injection");
        assert_eq!(vuln.location, "line 42");
    }

    #[test]
    fn test_attack_report_creation() {
        let vulns = vec![Vulnerability::new(
            Severity::High,
            "SQL Injection",
            "line 42",
            "exploit",
            "fix",
        )];

        let report = AttackReport::new(vulns, 10, 5000);
        assert_eq!(report.vulnerabilities_found.len(), 1);
        assert_eq!(report.attack_attempts, 10);
        assert_eq!(report.success_rate, 0.1);
        assert_eq!(report.duration_ms, 5000);
    }

    #[test]
    fn test_attack_report_success_rate() {
        let report = AttackReport::new(vec![], 0, 1000);
        assert_eq!(report.success_rate, 0.0);

        let vulns = vec![
            Vulnerability::new(Severity::High, "test", "loc", "exp", "rem"),
            Vulnerability::new(Severity::Medium, "test2", "loc2", "exp2", "rem2"),
        ];
        let report = AttackReport::new(vulns, 4, 1000);
        assert_eq!(report.success_rate, 0.5);
    }

    #[test]
    fn test_attack_strategy_creation() {
        let strategy = AttackStrategy::new(
            "web_security",
            vec!["web_app".to_string()],
            "Web application security testing",
        )
        .with_vector("sql_injection")
        .with_vector("xss");

        assert_eq!(strategy.name, "web_security");
        assert_eq!(strategy.vectors.len(), 2);
    }

    #[test]
    fn test_adversarial_tester_creation() {
        let tester = DefaultAdversarialTester::new();
        assert!(tester.vectors.read().unwrap().is_empty());
        assert!(tester.learning_data.read().unwrap().is_empty());
    }

    // Mock attack vector for testing
    struct MockAttackVector {
        name: String,
        artifact_types: Vec<String>,
        should_find_vuln: bool,
    }

    impl AttackVector for MockAttackVector {
        fn name(&self) -> &str {
            &self.name
        }

        fn description(&self) -> &str {
            "Mock attack vector for testing"
        }

        fn execute(
            &self,
            _artifact: &Artifact,
            _intensity: AttackIntensity,
        ) -> Result<Vec<Vulnerability>> {
            if self.should_find_vuln {
                Ok(vec![Vulnerability::new(
                    Severity::High,
                    "Mock Vulnerability",
                    "test location",
                    "mock exploit",
                    "mock remediation",
                )])
            } else {
                Ok(vec![])
            }
        }

        fn applies_to(&self, artifact_type: &str) -> bool {
            self.artifact_types.contains(&artifact_type.to_string())
        }
    }

    #[test]
    fn test_register_attack_vector() {
        let mut tester = DefaultAdversarialTester::new();

        let vector = Box::new(MockAttackVector {
            name: "test_vector".to_string(),
            artifact_types: vec!["source_code".to_string()],
            should_find_vuln: false,
        });

        assert!(tester.register_attack_vector(vector).is_ok());
        assert_eq!(tester.vectors.read().unwrap().len(), 1);
    }

    #[test]
    fn test_attack_execution() {
        let mut tester = DefaultAdversarialTester::new();

        let vector = Box::new(MockAttackVector {
            name: "test_vector".to_string(),
            artifact_types: vec!["source_code".to_string()],
            should_find_vuln: true,
        });

        tester.register_attack_vector(vector).unwrap();

        let artifact = Artifact::from_inline("source_code", "fn main() {}");
        let profile = AttackProfile::new(AttackIntensity::Moderate, 60_000);

        let report = tester.attack(&artifact, profile);
        assert!(report.is_ok());

        let report = report.unwrap();
        assert_eq!(report.vulnerabilities_found.len(), 1);
        assert_eq!(report.attack_attempts, 1);
    }

    #[test]
    fn test_attack_with_no_applicable_vectors() {
        let tester = DefaultAdversarialTester::new();

        let artifact = Artifact::from_inline("unknown_type", "content");
        let profile = AttackProfile::new(AttackIntensity::Moderate, 60_000);

        let report = tester.attack(&artifact, profile);
        assert!(report.is_err());
    }

    #[test]
    fn test_get_attack_strategies() {
        let mut tester = DefaultAdversarialTester::new();

        let vector = Box::new(MockAttackVector {
            name: "test_vector".to_string(),
            artifact_types: vec!["source_code".to_string()],
            should_find_vuln: false,
        });

        tester.register_attack_vector(vector).unwrap();

        let strategies = tester.get_attack_strategies("source_code");
        assert!(strategies.is_ok());

        let strategies = strategies.unwrap();
        assert_eq!(strategies.len(), 1);
        assert!(strategies[0].vectors.contains(&"test_vector".to_string()));
    }

    #[test]
    fn test_learn_from_attack() {
        let mut tester = DefaultAdversarialTester::new();

        let vuln = Vulnerability::new(
            Severity::High,
            "SQL Injection",
            "line 42",
            "exploit",
            "remediation",
        );

        assert!(tester.learn_from_attack(&vuln).is_ok());

        let learning = tester.learning_data.read().unwrap();
        assert!(learning.contains_key("SQL Injection"));
        assert_eq!(learning.get("SQL Injection").unwrap().occurrence_count, 1);
    }

    #[test]
    fn test_learn_from_multiple_attacks() {
        let mut tester = DefaultAdversarialTester::new();

        let vuln1 = Vulnerability::new(
            Severity::High,
            "SQL Injection",
            "line 42",
            "exploit1",
            "remediation",
        );

        let vuln2 = Vulnerability::new(
            Severity::Critical,
            "SQL Injection",
            "line 84",
            "exploit2",
            "remediation",
        );

        tester.learn_from_attack(&vuln1).unwrap();
        tester.learn_from_attack(&vuln2).unwrap();

        let learning = tester.learning_data.read().unwrap();
        let sql_learning = learning.get("SQL Injection").unwrap();
        assert_eq!(sql_learning.occurrence_count, 2);
        assert_eq!(sql_learning.patterns.len(), 2);
    }

    #[test]
    fn test_generate_recommendations() {
        let tester = DefaultAdversarialTester::new();

        let vulns = vec![
            Vulnerability::new(
                Severity::Critical,
                "SQL Injection",
                "line 42",
                "exploit",
                "fix",
            ),
            Vulnerability::new(Severity::High, "XSS", "line 100", "exploit", "fix"),
            Vulnerability::new(Severity::High, "XSS", "line 200", "exploit", "fix"),
        ];

        let recommendations = tester.generate_recommendations(&vulns);
        assert!(!recommendations.is_empty());

        // Should have critical warning
        assert!(recommendations.iter().any(|r| r.contains("CRITICAL")));

        // Should have pattern detection for XSS
        assert!(recommendations
            .iter()
            .any(|r| r.contains("Pattern detected") && r.contains("XSS")));
    }
}
