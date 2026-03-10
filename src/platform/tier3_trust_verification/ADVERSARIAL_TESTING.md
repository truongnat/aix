# Adversarial Testing Guide

## Overview

The Adversarial Tester is a red team agent that proactively attacks implementer outputs before review. It executes attacks based on configurable profiles, detects vulnerabilities, provides remediation recommendations, and learns from successful attacks to improve future coverage.

## Architecture

### Core Components

1. **AdversarialTester Trait**: Main interface for adversarial testing
2. **DefaultAdversarialTester**: Default implementation with learning capabilities
3. **AttackVector Trait**: Plugin interface for custom attack implementations
4. **Built-in Attack Vectors**: SQL Injection, XSS, Hardcoded Secrets

### Key Features

- **Configurable Attack Intensity**: Light, Moderate, Aggressive
- **Time-Budgeted Execution**: Respects time constraints
- **Plugin Architecture**: Easy to add custom attack vectors
- **Learning System**: Learns from successful attacks
- **Comprehensive Reporting**: Detailed vulnerability reports with remediation

## Usage Examples

### Basic Usage

```rust
use agentic_sdlc::platform::tier3_trust_verification::{
    DefaultAdversarialTester, AdversarialTester, AttackProfile, AttackIntensity,
    Artifact, SQLInjectionAttackVector, XSSAttackVector, HardcodedSecretsAttackVector,
};

// Create adversarial tester
let mut tester = DefaultAdversarialTester::new();

// Register built-in attack vectors
tester.register_attack_vector(Box::new(SQLInjectionAttackVector::new()))?;
tester.register_attack_vector(Box::new(XSSAttackVector::new()))?;
tester.register_attack_vector(Box::new(HardcodedSecretsAttackVector::new()))?;

// Create artifact to test
let code = r#"
    fn query_user(id: &str) {
        let query = format!("SELECT * FROM users WHERE id = '{}'", id);
        execute(query);
    }
"#;
let artifact = Artifact::from_inline("source_code", code);

// Configure attack profile
let profile = AttackProfile::new(AttackIntensity::Moderate, 60_000); // 1 minute

// Execute attack
let report = tester.attack(&artifact, profile)?;

// Review results
println!("Vulnerabilities found: {}", report.vulnerabilities_found.len());
println!("Attack attempts: {}", report.attack_attempts);
println!("Success rate: {:.2}%", report.success_rate * 100.0);

for vuln in &report.vulnerabilities_found {
    println!("\n{:?} - {}", vuln.severity, vuln.vulnerability_type);
    println!("Location: {}", vuln.location);
    println!("Exploit: {}", vuln.exploit_proof);
    println!("Remediation: {}", vuln.remediation);
}

for recommendation in &report.recommendations {
    println!("\nRecommendation: {}", recommendation);
}
```

### Attack Intensity Levels

#### Light Intensity
- Basic vulnerability checks
- Fast execution
- Minimal false positives
- Suitable for quick checks during development

```rust
let profile = AttackProfile::new(AttackIntensity::Light, 30_000); // 30 seconds
```

#### Moderate Intensity (Default)
- Comprehensive testing
- Balanced speed and coverage
- Suitable for CI/CD pipelines

```rust
let profile = AttackProfile::new(AttackIntensity::Moderate, 60_000); // 1 minute
```

#### Aggressive Intensity
- Exhaustive testing with edge cases
- Slower execution
- Maximum coverage
- Suitable for pre-release security audits

```rust
let profile = AttackProfile::new(AttackIntensity::Aggressive, 300_000); // 5 minutes
```

### Targeted Attack Vectors

You can specify which attack vectors to use:

```rust
// Only test for SQL injection
let profile = AttackProfile::new(AttackIntensity::Moderate, 60_000)
    .with_vector("sql_injection");

// Test for multiple specific vectors
let profile = AttackProfile::new(AttackIntensity::Aggressive, 120_000)
    .with_vector("sql_injection")
    .with_vector("xss")
    .with_vector("hardcoded_secrets");
```

### Learning from Attacks

The adversarial tester learns from successful attacks to improve future coverage:

```rust
// After finding vulnerabilities, teach the tester
for vuln in &report.vulnerabilities_found {
    tester.learn_from_attack(vuln)?;
}

// The tester now has improved pattern recognition for future attacks
```

### Getting Attack Strategies

Query available attack strategies for a specific artifact type:

```rust
let strategies = tester.get_attack_strategies("source_code")?;

for strategy in strategies {
    println!("Strategy: {}", strategy.name);
    println!("Description: {}", strategy.description);
    println!("Vectors: {:?}", strategy.vectors);
}
```

## Built-in Attack Vectors

### SQL Injection Attack Vector

Tests for SQL injection vulnerabilities in database queries.

**Detects:**
- Direct string concatenation in SQL queries
- Unparameterized queries
- String formatting in SQL
- Raw SQL execution without placeholders

**Example vulnerable code:**
```rust
let query = format!("SELECT * FROM users WHERE id = '{}'", user_id);
execute(query);
```

**Remediation:**
```rust
execute("SELECT * FROM users WHERE id = ?", &[user_id]);
```

### XSS Attack Vector

Tests for Cross-Site Scripting vulnerabilities in HTML output.

**Detects:**
- Direct HTML injection (innerHTML, outerHTML)
- Unsafe document writes
- jQuery HTML injection
- React dangerouslySetInnerHTML
- Vue v-html without sanitization

**Example vulnerable code:**
```javascript
document.getElementById('user').innerHTML = userName;
```

**Remediation:**
```javascript
document.getElementById('user').textContent = userName;
// or
document.getElementById('user').innerHTML = sanitize(userName);
```

### Hardcoded Secrets Attack Vector

Tests for hardcoded credentials, API keys, and sensitive information.

**Detects:**
- Hardcoded passwords
- API keys and tokens
- Private keys
- AWS/GitHub credentials
- Authentication secrets

**Example vulnerable code:**
```rust
const API_KEY = "sk-1234567890abcdef";
```

**Remediation:**
```rust
let api_key = env::var("API_KEY")?;
```

## Creating Custom Attack Vectors

Implement the `AttackVector` trait to create custom attack vectors:

```rust
use agentic_sdlc::platform::tier3_trust_verification::{
    AttackVector, AttackIntensity, Vulnerability, Artifact,
};
use agentic_sdlc::platform::{Result, types::Severity};

pub struct CustomAttackVector;

impl AttackVector for CustomAttackVector {
    fn name(&self) -> &str {
        "custom_attack"
    }

    fn description(&self) -> &str {
        "Custom security testing for specific vulnerabilities"
    }

    fn execute(
        &self,
        artifact: &Artifact,
        intensity: AttackIntensity,
    ) -> Result<Vec<Vulnerability>> {
        let mut vulnerabilities = Vec::new();

        // Implement your attack logic here
        // Analyze the artifact and detect vulnerabilities

        Ok(vulnerabilities)
    }

    fn applies_to(&self, artifact_type: &str) -> bool {
        // Specify which artifact types this vector applies to
        artifact_type == "source_code"
    }
}

// Register the custom vector
tester.register_attack_vector(Box::new(CustomAttackVector))?;
```

## Integration with Workflow Engine

### Pre-Review Security Check

```rust
// Before human review, run adversarial testing
let artifact = Artifact::from_inline("source_code", agent_output);
let profile = AttackProfile::new(AttackIntensity::Moderate, 60_000);

let report = tester.attack(&artifact, profile)?;

if !report.vulnerabilities_found.is_empty() {
    // Block review and request fixes
    return Err(PlatformError::AdversarialTestFailed(
        format!("Found {} vulnerabilities", report.vulnerabilities_found.len())
    ));
}
```

### CI/CD Pipeline Integration

```rust
// In CI/CD pipeline
let profile = AttackProfile::new(AttackIntensity::Aggressive, 300_000);
let report = tester.attack(&artifact, profile)?;

// Fail build if critical vulnerabilities found
let critical_count = report.vulnerabilities_found
    .iter()
    .filter(|v| matches!(v.severity, Severity::Critical))
    .count();

if critical_count > 0 {
    eprintln!("CRITICAL: {} critical vulnerabilities found!", critical_count);
    std::process::exit(1);
}
```

### Continuous Learning

```rust
// After each attack, learn from findings
for vuln in &report.vulnerabilities_found {
    tester.learn_from_attack(vuln)?;
}

// Periodically analyze learning data
// (In a real implementation, this would use ML or pattern matching)
```

## Attack Report Structure

```rust
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
```

## Vulnerability Structure

```rust
pub struct Vulnerability {
    /// Severity level (Low, Medium, High, Critical)
    pub severity: Severity,
    
    /// Type of vulnerability (e.g., "SQL Injection", "XSS")
    pub vulnerability_type: String,
    
    /// Location in the artifact where vulnerability was found
    pub location: String,
    
    /// Proof of exploit demonstrating the vulnerability
    pub exploit_proof: String,
    
    /// Recommended remediation steps
    pub remediation: String,
}
```

## Best Practices

### 1. Start with Light Intensity
Begin with light intensity during development for fast feedback:
```rust
let profile = AttackProfile::new(AttackIntensity::Light, 30_000);
```

### 2. Use Moderate for CI/CD
Use moderate intensity in CI/CD pipelines for balanced coverage:
```rust
let profile = AttackProfile::new(AttackIntensity::Moderate, 60_000);
```

### 3. Reserve Aggressive for Pre-Release
Use aggressive intensity for thorough pre-release security audits:
```rust
let profile = AttackProfile::new(AttackIntensity::Aggressive, 300_000);
```

### 4. Register All Relevant Vectors
Register all attack vectors that apply to your codebase:
```rust
tester.register_attack_vector(Box::new(SQLInjectionAttackVector::new()))?;
tester.register_attack_vector(Box::new(XSSAttackVector::new()))?;
tester.register_attack_vector(Box::new(HardcodedSecretsAttackVector::new()))?;
// Add custom vectors as needed
```

### 5. Act on Recommendations
Always review and act on the recommendations in the attack report:
```rust
for recommendation in &report.recommendations {
    println!("TODO: {}", recommendation);
}
```

### 6. Enable Learning
Enable the learning system to improve detection over time:
```rust
for vuln in &report.vulnerabilities_found {
    tester.learn_from_attack(vuln)?;
}
```

## Performance Considerations

- **Time Budget**: Set appropriate time budgets based on your use case
  - Development: 30-60 seconds
  - CI/CD: 1-2 minutes
  - Pre-release: 5-10 minutes

- **Parallel Execution**: Attack vectors run sequentially within time budget
  - Future enhancement: parallel execution for faster results

- **Caching**: Consider caching results for unchanged artifacts
  - Reduces redundant testing
  - Speeds up CI/CD pipelines

## Security Considerations

- **Sandboxing**: Attack vectors should be sandboxed to prevent escape
- **Resource Limits**: Enforce memory and CPU limits for attack execution
- **Audit Logging**: Log all attack attempts for security audit
- **Access Control**: Restrict who can run adversarial tests
- **Result Storage**: Securely store vulnerability reports

## Future Enhancements

1. **ML-Based Learning**: Use machine learning for pattern recognition
2. **Parallel Execution**: Run attack vectors in parallel
3. **Dynamic Attack Generation**: Generate attacks based on code structure
4. **Integration with SAST Tools**: Integrate with commercial SAST tools
5. **Fuzzing Support**: Add fuzzing capabilities for input validation
6. **Network Attack Vectors**: Add vectors for API and network vulnerabilities
7. **Container Security**: Add vectors for container and deployment security

## Requirements Validation

This implementation satisfies the following requirements from the design:

- **Requirement 8.1**: ✅ Execute attacks based on configured attack profile
- **Requirement 8.2**: ✅ Attempt to exploit artifact using registered attack vectors
- **Requirement 8.3**: ✅ Record vulnerabilities with severity, type, location, exploit proof, and remediation
- **Requirement 8.4**: ✅ Generate attack report with vulnerabilities, attempts, and success rate
- **Requirement 8.5**: ✅ Support registration of custom attack vectors through plugin interface
- **Requirement 8.6**: ✅ Learn from successful attacks to improve future coverage

## Related Components

- **Formal Verifier**: Deterministic verification of security claims
- **Commitment Service**: Cryptographic signing of security decisions
- **Human Review Service**: Escalation of security concerns to humans
- **Cost Tracker**: Track cost of adversarial testing operations
