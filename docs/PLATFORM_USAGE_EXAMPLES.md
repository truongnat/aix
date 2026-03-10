# Platform Usage Examples

**Version:** 1.0  
**Last Updated:** 2026-03-07

---

## Overview

This document provides practical usage examples for all 5 tiers of the Next-Level Platform Improvements.

---

## Table of Contents

- [Tier 1: Execution Intelligence](#tier-1-execution-intelligence)
- [Tier 2: Multi-Agent Coordination](#tier-2-multi-agent-coordination)
- [Tier 3: Trust & Verification](#tier-3-trust--verification)
- [Tier 4: Organizational Scale](#tier-4-organizational-scale)
- [Tier 5: Ecosystem](#tier-5-ecosystem)
- [Complete Examples](#complete-examples)

---

## Tier 1: Execution Intelligence

### Example 1: Adaptive Replanning on Test Failure

Automatically recover from test failures by replanning.

```rust
use agentic_sdlc::platform::tier1_execution_intelligence::*;
use agentic_sdlc::platform::PlatformConfig;

fn main() -> Result<()> {
    // Enable adaptive planning
    let config = PlatformConfig {
        features: FeatureFlags {
            adaptive_planning: true,
            ..Default::default()
        },
        tier1_execution_intelligence: Tier1Config {
            max_replans: 5,
            confidence_threshold: 0.7,
            ..Default::default()
        },
        ..PlatformConfig::default_disabled()
    };
    
    let planner = DefaultAdaptivePlanner::new(&config.tier1_execution_intelligence);
    
    // Generate initial plan
    let mut plan = planner.generate_plan(&workflow, &context)?;
    println!("Initial plan: {} steps", plan.steps.len());
    
    // Simulate test failure
    let trigger = ReplanTrigger::TestFailure {
        step_id: "run_tests".to_string(),
        error: "3 unit tests failed".to_string(),
    };
    
    // Automatically replan
    plan = planner.replan(&plan, &trigger)?;
    println!("Replanned: {} steps (added debugging)", plan.steps.len());
    
    // New plan includes debugging and fix steps
    assert!(plan.steps.iter().any(|s| s.name.contains("debug")));
    assert_eq!(plan.plan_version, 2);
    
    Ok(())
}
```

### Example 2: Causal Tracing for Audit

Track decision causality for compliance.

```rust
use agentic_sdlc::platform::tier1_execution_intelligence::*;

fn main() -> Result<()> {
    let mut tracer = DefaultCausalTracer::new();
    
    // Log decisions throughout workflow
    tracer.log_decision(Decision {
        decision_id: "dec_001".to_string(),
        timestamp_ms: current_timestamp(),
        decision_type: DecisionType::StepSelection,
        inputs: vec![DataSource::UserInput("feature spec".to_string())],
        rationale: "Selected implementation step based on spec".to_string(),
        confidence: 0.95,
    })?;
    
    tracer.log_step_trigger(
        &"implement_feature".to_string(),
        TriggerCause::DependencyResolved {
            dependency_step: "analyze_spec".to_string(),
        },
    )?;
    
    tracer.log_output_derivation(
        &StepOutput {
            step_id: "implement_feature".to_string(),
            output: "feature code".to_string(),
        },
        vec![
            DataSource::StepOutput("analyze_spec".to_string()),
            DataSource::UserInput("feature spec".to_string()),
        ],
    )?;
    
    // Export causal graph for audit
    let graph = tracer.export_causal_graph()?;
    println!("Causal graph: {} nodes, {} edges", 
             graph.nodes.len(), graph.edges.len());
    
    // Verify acyclicity
    assert!(is_acyclic(&graph));
    
    Ok(())
}
```

### Example 3: Production Feedback Integration

Learn from production signals to improve workflows.

```rust
use agentic_sdlc::platform::tier1_execution_intelligence::*;
use std::time::Duration;

fn main() -> Result<()> {
    let mut collector = DefaultFeedbackCollector::new();
    
    // Ingest production signals
    collector.ingest_signal(ProductionSignal {
        signal_id: "sig_001".to_string(),
        timestamp_ms: current_timestamp(),
        signal_type: SignalType::ErrorRate {
            service: "api".to_string(),
            rate: 0.05,
        },
        severity: Severity::Medium,
        metadata: HashMap::from([
            ("endpoint".to_string(), "/users".to_string()),
        ]),
    })?;
    
    collector.ingest_signal(ProductionSignal {
        signal_id: "sig_002".to_string(),
        timestamp_ms: current_timestamp(),
        signal_type: SignalType::UserFeedback {
            rating: 2,
            comment: "Response too slow".to_string(),
        },
        severity: Severity::High,
        metadata: HashMap::new(),
    })?;
    
    // Aggregate signals over time window
    let summary = collector.aggregate_signals(Duration::from_secs(3600))?;
    println!("Error rate: {:.2}%", summary.error_rate * 100.0);
    println!("Avg user rating: {:.1}", summary.avg_user_rating);
    
    // Get recommendations
    let recommendations = collector.get_recommendations("workflow_123")?;
    for rec in recommendations {
        println!("Recommendation: {} (confidence: {:.2})", 
                 rec.rationale, rec.confidence);
    }
    
    Ok(())
}
```

---

## Tier 2: Multi-Agent Coordination

### Example 1: Multi-Agent Negotiation

Resolve disagreements between agents systematically.

```rust
use agentic_sdlc::platform::tier2_multi_agent::*;

fn main() -> Result<()> {
    let mut negotiation = DefaultNegotiationProtocol::new();
    
    // Initiate negotiation
    let topic = NegotiationTopic {
        topic_id: "api_design".to_string(),
        subject: "REST vs GraphQL for user API".to_string(),
        participants: vec!["architect".to_string(), "implementer".to_string()],
        deadline_ms: current_timestamp() + 3600_000, // 1 hour
    };
    
    let session = negotiation.initiate_negotiation(topic)?;
    
    // Architect submits position
    negotiation.submit_position(
        &session.session_id,
        "architect",
        Position {
            agent_id: "architect".to_string(),
            stance: Stance::Approve,
            arguments: vec![
                Argument::new("GraphQL provides better flexibility"),
                Argument::new("Single endpoint simplifies deployment"),
            ],
            evidence: vec![],
        },
    )?;
    
    // Implementer submits counter-position
    negotiation.submit_position(
        &session.session_id,
        "implementer",
        Position {
            agent_id: "implementer".to_string(),
            stance: Stance::Conditional {
                conditions: vec![
                    "Add caching layer for performance".to_string(),
                    "Provide REST fallback for legacy clients".to_string(),
                ],
            },
            arguments: vec![
                Argument::new("GraphQL has learning curve for team"),
                Argument::new("Need caching to avoid N+1 queries"),
            ],
            evidence: vec![],
        },
    )?;
    
    // Resolve negotiation
    let resolution = negotiation.resolve(&session.session_id)?;
    println!("Resolution: {:?}", resolution.outcome);
    println!("Consensus level: {:.2}", resolution.consensus_level);
    println!("Final decision: {}", resolution.final_decision);
    
    Ok(())
}
```


### Example 2: Shared Memory with CRDT

Enable concurrent agent collaboration with automatic conflict resolution.

```rust
use agentic_sdlc::platform::tier2_multi_agent::*;

fn main() -> Result<()> {
    let mut memory = DefaultSharedMemory::new();
    
    // Agent 1 writes counter
    memory.write(
        "task_count",
        MemoryValue {
            data: serde_json::json!(5),
            version: 1,
            last_modified_by: "agent1".to_string(),
            timestamp_ms: current_timestamp(),
            crdt_metadata: CRDTMetadata::GCounter {
                counts: HashMap::from([("agent1".to_string(), 5)]),
            },
        },
        "agent1",
    )?;
    
    // Agent 2 concurrently increments counter
    memory.write(
        "task_count",
        MemoryValue {
            data: serde_json::json!(3),
            version: 1,
            last_modified_by: "agent2".to_string(),
            timestamp_ms: current_timestamp(),
            crdt_metadata: CRDTMetadata::GCounter {
                counts: HashMap::from([("agent2".to_string(), 3)]),
            },
        },
        "agent2",
    )?;
    
    // Automatic merge (G-Counter takes max of each agent's count)
    let conflicts = memory.merge()?;
    assert!(conflicts.is_empty()); // No conflicts!
    
    // Read merged value
    let value = memory.read("task_count")?.unwrap();
    println!("Merged count: {}", value.data); // 8 (5 + 3)
    
    Ok(())
}
```

### Example 3: Agent Marketplace

Discover and compose specialized agent teams.

```rust
use agentic_sdlc::platform::tier2_multi_agent::*;

fn main() -> Result<()> {
    let mut marketplace = DefaultAgentMarketplace::new();
    
    // Register specialized agents
    marketplace.register_agent(AgentProfile {
        agent_id: "security_expert".to_string(),
        name: "Security Expert".to_string(),
        specialization: vec!["security".to_string(), "audit".to_string()],
        capabilities: vec![
            Capability::SecurityAudit,
            Capability::VulnerabilityScanning,
        ],
        trust_tier: TrustTier::Trusted,
        performance_metrics: PerformanceMetrics {
            success_rate: 0.98,
            avg_duration_ms: 5000,
            total_executions: 150,
            user_rating: 4.8,
        },
        pricing: PricingModel::PerExecution { cost: 0.50 },
    })?;
    
    // Search for agents
    let agents = marketplace.search_agents(SearchCriteria {
        required_skills: vec!["security".to_string()],
        min_rating: 4.5,
        max_cost: Some(1.0),
        trust_tier: Some(TrustTier::Trusted),
    })?;
    
    println!("Found {} security agents", agents.len());
    
    // Compose team for task
    let task = Task {
        required_capabilities: vec![
            Capability::SecurityAudit,
            Capability::CodeReview,
        ],
        budget: 5.0,
    };
    
    let team = marketplace.compose_team(&task)?;
    println!("Composed team: {:?}", team);
    
    Ok(())
}
```

---

## Tier 3: Trust & Verification

### Example 1: Formal Verification

Verify agent claims with deterministic tools.

```rust
use agentic_sdlc::platform::tier3_trust_verification::*;

fn main() -> Result<()> {
    let verifier = DefaultFormalVerifier::new();
    
    // Agent claims code has no SQL injection
    let claim = Claim {
        claim_id: "sec_001".to_string(),
        claim_type: ClaimType::NoSQLInjection,
        asserted_by: "implementer".to_string(),
        confidence: 0.95,
    };
    
    let artifact = Artifact::from_file("src/database.rs")?;
    
    // Verify claim
    let result = verifier.verify_claim(&claim, &artifact)?;
    
    if result.verified {
        println!("✓ Claim verified: No SQL injection found");
    } else {
        println!("✗ Claim rejected: Vulnerabilities detected");
        for evidence in result.evidence {
            println!("  - {}", evidence);
        }
    }
    
    Ok(())
}
```

### Example 2: Adversarial Testing

Proactively attack outputs to find vulnerabilities.

```rust
use agentic_sdlc::platform::tier3_trust_verification::*;

fn main() -> Result<()> {
    let tester = DefaultAdversarialTester::new();
    
    // Configure attack profile
    let profile = AttackProfile {
        intensity: AttackIntensity::Moderate,
        time_budget_ms: 300_000, // 5 minutes
        attack_vectors: vec![
            "sql_injection".to_string(),
            "xss".to_string(),
            "path_traversal".to_string(),
        ],
    };
    
    let artifact = Artifact::from_file("src/api.rs")?;
    
    // Execute attacks
    let report = tester.attack(&artifact, profile)?;
    
    println!("Attack Report:");
    println!("  Attempts: {}", report.attack_attempts);
    println!("  Success rate: {:.1}%", report.success_rate * 100.0);
    println!("  Vulnerabilities: {}", report.vulnerabilities_found.len());
    
    for vuln in report.vulnerabilities_found {
        println!("\n  [{:?}] {}", vuln.severity, vuln.vulnerability_type);
        println!("  Location: {}", vuln.location);
        println!("  Exploit: {}", vuln.exploit_proof);
        println!("  Fix: {}", vuln.remediation);
    }
    
    Ok(())
}
```

### Example 3: Cryptographic Commitment

Sign decisions for non-repudiation.

```rust
use agentic_sdlc::platform::tier3_trust_verification::*;

fn main() -> Result<()> {
    let commitment = DefaultCommitmentService::new();
    
    // Sign critical decision
    let decision = Decision {
        decision_id: "release_approval".to_string(),
        timestamp_ms: current_timestamp(),
        decision_type: DecisionType::ReleaseApproval,
        inputs: vec![],
        rationale: "All tests passed, security verified".to_string(),
        confidence: 1.0,
    };
    
    let signed = commitment.sign_decision(&decision, &"release_manager".to_string())?;
    
    println!("Decision signed:");
    println!("  Algorithm: {}", signed.signature.algorithm);
    println!("  Timestamp: {}", signed.signature.timestamp_ms);
    println!("  Signer: {}", signed.certificate.agent_id);
    
    // Verify signature
    let valid = commitment.verify_signature(&signed)?;
    assert!(valid);
    
    // Get audit trail
    let trail = commitment.get_audit_trail("workflow_123")?;
    println!("\nAudit trail: {} signed decisions", trail.len());
    
    Ok(())
}
```

---

## Tier 4: Organizational Scale

### Example 1: Cost Tracking and ROI

Track workflow costs and calculate ROI.

```rust
use agentic_sdlc::platform::tier4_organizational::*;

fn main() -> Result<()> {
    let mut cost_tracker = DefaultCostTracker::new();
    
    // Track LLM token usage
    cost_tracker.track_usage(ResourceUsage {
        resource_type: ResourceType::LLMTokens {
            provider: "openai".to_string(),
            model: "gpt-4".to_string(),
        },
        quantity: 15_000.0, // tokens
        unit_cost: 0.00003, // $0.03 per 1K tokens
        timestamp_ms: current_timestamp(),
        step_id: "code_generation".to_string(),
    })?;
    
    // Track compute time
    cost_tracker.track_usage(ResourceUsage {
        resource_type: ResourceType::ComputeTime { cpu_ms: 45_000 },
        quantity: 45.0, // seconds
        unit_cost: 0.0001, // $0.0001 per second
        timestamp_ms: current_timestamp(),
        step_id: "code_generation".to_string(),
    })?;
    
    // Generate cost report
    let report = cost_tracker.get_cost_report("workflow_123")?;
    println!("Cost Report:");
    println!("  Total: ${:.2}", report.total_cost);
    println!("  Duration: {}ms", report.duration_ms);
    println!("\nBreakdown by resource:");
    for (resource, cost) in &report.breakdown {
        println!("  {:?}: ${:.2}", resource, cost);
    }
    
    // Calculate ROI
    let roi = cost_tracker.calculate_roi(
        "workflow_123",
        8.0 * 50.0, // 8 hours at $50/hour
    )?;
    
    println!("\nROI Analysis:");
    println!("  Automation cost: ${:.2}", roi.automation_cost);
    println!("  Manual cost: ${:.2}", roi.manual_cost);
    println!("  Time saved: {:.1} hours", roi.time_saved_hours);
    println!("  ROI: {:.1}%", roi.roi_percentage);
    
    Ok(())
}
```

### Example 2: Human-in-the-Loop with SLA

Escalate ambiguity to humans with deadlines.

```rust
use agentic_sdlc::platform::tier4_organizational::*;

fn main() -> Result<()> {
    let mut human_review = DefaultHumanReviewService::new();
    
    // Request human review
    let request = ReviewRequest {
        request_id: "rev_001".to_string(),
        workflow_id: "feature_x".to_string(),
        step_id: "security_decision".to_string(),
        ambiguity: AmbiguityType::RiskDecision {
            risk_level: Severity::High,
        },
        context: HashMap::from([
            ("issue".to_string(), "Potential data exposure".to_string()),
            ("impact".to_string(), "Customer PII at risk".to_string()),
        ]),
        sla_deadline_ms: current_timestamp() + 1800_000, // 30 minutes
        timeout_policy: TimeoutPolicy::Block,
    };
    
    let review_id = human_review.request_review(request)?;
    println!("Review requested: {}", review_id);
    
    // Check status periodically
    loop {
        let status = human_review.check_status(&review_id)?;
        
        match status {
            ReviewStatus::Pending => {
                println!("Waiting for human decision...");
                std::thread::sleep(Duration::from_secs(10));
            }
            ReviewStatus::Completed { decision } => {
                println!("Human decision: {}", decision.decision);
                println!("Rationale: {}", decision.rationale);
                println!("Reviewer: {}", decision.reviewer_id);
                break;
            }
            ReviewStatus::TimedOut => {
                println!("Review timed out - applying timeout policy");
                let action = human_review.handle_timeout(&review_id)?;
                println!("Timeout action: {:?}", action);
                break;
            }
        }
    }
    
    Ok(())
}
```

### Example 3: Multi-Tenant Isolation

Isolate workflows for different teams.

```rust
use agentic_sdlc::platform::tier4_organizational::*;

fn main() -> Result<()> {
    let mut isolation = DefaultTenantIsolation::new();
    
    // Create isolated tenant
    let tenant_config = TenantConfig {
        tenant_id: TenantId::new("team_alpha".to_string())?,
        name: "Team Alpha".to_string(),
        resource_limits: ResourceLimits {
            max_concurrent_workflows: 10,
            max_storage_mb: 1024,
            max_cost_per_month: 500.0,
        },
        isolation_level: IsolationLevel::Hard,
    };
    
    let tenant_id = isolation.create_tenant(tenant_config)?;
    println!("Created tenant: {}", tenant_id.0);
    
    // Get isolated context
    let context = isolation.get_isolated_context(&tenant_id)?;
    println!("Isolated context:");
    println!("  State path: {:?}", context.state_path);
    println!("  Memory namespace: {}", context.memory_namespace);
    println!("  Audit log: {:?}", context.audit_log_path);
    
    // Enforce boundaries
    let operation = Operation::WriteFile {
        path: "data.txt".to_string(),
    };
    
    isolation.enforce_boundaries(&tenant_id, &operation)?;
    println!("Operation allowed");
    
    // Try cross-tenant access (should fail)
    let bad_operation = Operation::WriteFile {
        path: "../other_tenant/data.txt".to_string(),
    };
    
    match isolation.enforce_boundaries(&tenant_id, &bad_operation) {
        Ok(_) => println!("ERROR: Cross-tenant access allowed!"),
        Err(e) => println!("Cross-tenant access blocked: {}", e),
    }
    
    Ok(())
}
```

---

## Tier 5: Ecosystem

### Example 1: Performance Benchmarking

Measure and compare workflow performance.

```rust
use agentic_sdlc::platform::tier5_ecosystem::*;

fn main() -> Result<()> {
    let benchmark_service = DefaultBenchmarkService::new();
    
    // Define benchmark
    let benchmark = Benchmark {
        benchmark_id: "code_quality".to_string(),
        name: "Code Quality Benchmark".to_string(),
        category: "quality".to_string(),
        test_cases: vec![
            TestCase {
                name: "simple_function".to_string(),
                input: "Generate a function to add two numbers".to_string(),
            },
            TestCase {
                name: "complex_algorithm".to_string(),
                input: "Implement quicksort algorithm".to_string(),
            },
        ],
        metrics: vec![
            MetricDefinition {
                name: "correctness".to_string(),
                metric_type: MetricType::Quality { scale: 1.0 },
                higher_is_better: true,
            },
            MetricDefinition {
                name: "time_to_completion".to_string(),
                metric_type: MetricType::TimeToCompletion,
                higher_is_better: false,
            },
        ],
    };
    
    // Run benchmark
    let result = benchmark_service.run_benchmark(benchmark)?;
    println!("Benchmark Results:");
    for (metric, value) in &result.metrics {
        println!("  {}: {:.2}", metric, value);
    }
    
    // Compare with previous results
    let comparison = benchmark_service.compare_results(vec![result, previous_result])?;
    println!("\nComparison:");
    println!("  Improvement: {:.1}%", comparison.improvement_percentage);
    
    Ok(())
}
```

See [Complete Examples](#complete-examples) for end-to-end workflows using multiple tiers.
