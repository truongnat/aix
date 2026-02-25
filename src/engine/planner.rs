use crate::engine::budget::ExecutionBudget;
use crate::engine::registry::{DomainRegistry, QualifiedSkill};
use crate::engine::routing::RoutingPolicy;
use crate::engine::security::DomainSecurityPolicy;
use crate::skill::capability::{SideEffectClass, TrustTier};
use crate::workflow::loader::parse_markdown_content;
use crate::workflow::model::Workflow;
use anyhow::{anyhow, Context, Result};
use reqwest::Client;
use serde_json::json;
use std::cmp::Ordering;
use std::collections::{BTreeSet, HashSet};
use std::sync::Arc;

pub struct Planner {
    domain_registry: Arc<DomainRegistry>,
    client: Client,
    ollama_url: String,
    model: String,
}

impl Planner {
    pub fn new(domain_registry: Arc<DomainRegistry>) -> Self {
        Self {
            domain_registry,
            client: Client::new(),
            ollama_url: "http://127.0.0.1:11434/api/generate".to_string(),
            model: "qwen3:8b".to_string(),
        }
    }

    #[allow(dead_code)]
    pub fn with_model(mut self, model: String) -> Self {
        self.model = model;
        self
    }

    #[allow(dead_code)]
    pub fn get_model(&self) -> &str {
        &self.model
    }

    pub async fn plan(&self, domain: &str, goal: &str) -> Result<Workflow> {
        let mut skills = self.domain_registry.list_skills(domain)?;
        skills.sort_by(|a, b| a.name().cmp(b.name()));

        // Build skills description
        let mut skills_desc = String::new();
        for skill in skills {
            let cap = skill.capability();
            skills_desc.push_str(&format!(
                "- {}: {} (Input: {:?}, Output: {:?})\n",
                skill.name(),
                cap.description,
                cap.input_type,
                cap.output_type
            ));
        }

        let system_prompt = format!(
            "You are a workflow planner for the Antigravity engine.\n\
             Your goal is to generate a workflow in Markdown format based on the user's goal and available skills.\n\n\
             AVAILABLE SKILLS in domain '{}':\n{}\n\
             MARKDOWN FORMAT RULES:\n\
             1. Start with '# Workflow: <name>'\n\
             2. Include 'Domain: {}'\n\
             3. Define steps with '## Step: <id>'\n\
             4. Each step must have 'Skill: <name>'\n\
             5. Each step must have 'Input: <content>'\n\
             6. Use 'DependsOn: <id1>, <id2>' for dependencies.\n\
             7. Use '{{{{step_id}}}}' to reference outputs of previous steps.\n\
             8. Use 'Condition: {{{{step_id}}}} == true' for conditional execution.\n\n\
             Example output:\n\
             # Workflow: my-auto-workflow\n\
             Domain: {}\n\n\
             ## Step: s1\n\
             Skill: echo\n\
             Input: Hello World\n\n\
             Only output the Markdown content. Do not include markdown code block backticks. Do not include explanations.",
            domain, skills_desc, domain, domain
        );

        let response = self
            .client
            .post(&self.ollama_url)
            .json(&json!({
                "model": self.model,
                "prompt": format!("Goal: {}\n\n{}", goal, system_prompt),
                "stream": false
            }))
            .send()
            .await
            .context("Failed to connect to Ollama. Ensure it is running at localhost:11434")?;

        let json: serde_json::Value = response.json().await?;
        let markdown = json["response"].as_str().ok_or_else(|| {
            if let Some(err) = json.get("error") {
                anyhow!("Ollama error: {}", err)
            } else {
                anyhow!("Invalid response format from Ollama: {:?}", json)
            }
        })?;

        // Clean up markdown if LLM included backticks
        let clean_markdown = markdown
            .trim()
            .trim_start_matches("```markdown")
            .trim_start_matches("```")
            .trim_end_matches("```")
            .trim();

        let mut workflow = parse_markdown_content(clean_markdown)?;

        // Set goal and target_type for adaptive re-planning.
        workflow.meta.goal = Some(goal.to_string());
        workflow.meta.target_type = Some("Text".to_string());
        workflow.meta.routing_policy = Some(RoutingPolicy::for_single_domain(domain));

        // Validate LLM output against deterministic type engine.
        let validator = crate::engine::validator::WorkflowValidator::new(&self.domain_registry);
        validator
            .validate(&workflow)
            .context("LLM generated an invalid workflow plan (Type Mismatch)")?;

        Ok(workflow)
    }
}

#[allow(dead_code)]
#[derive(Debug, Clone)]
pub struct TypeNode {
    pub type_name: String,
}

#[allow(dead_code)]
#[derive(Clone)]
pub struct SkillEdge {
    pub skill_name: String,
    pub input_type: String,
    pub output_type: String,
}

pub struct PlanningGoal {
    pub target_type: String,
    pub original_goal: String,
}

#[derive(Debug, Clone, Default)]
struct PlanProjection {
    total_cost: u32,
    total_latency_ms: u32,
    total_steps: usize,
    side_effect_score: u32,
    trust_tier_score: u32,
    isolation_cost_penalty: u32,
}

impl PlanProjection {
    fn fits_within_budget(&self, budget: &ExecutionBudget) -> bool {
        self.total_cost <= budget.max_total_cost
            && self.total_latency_ms <= budget.max_total_latency_ms
            && self.total_steps <= budget.max_steps
    }
}

#[derive(Debug, Clone, Default)]
struct PlanCandidate {
    steps: Vec<PlannedStep>,
    projection: PlanProjection,
    domains_used: BTreeSet<String>,
    last_domain: Option<String>,
}

impl PlanCandidate {
    fn root_domain(&self) -> &str {
        self.steps
            .last()
            .map(|step| step.qualified_skill.domain.as_str())
            .unwrap_or("")
    }

    fn root_skill_name(&self) -> &str {
        self.steps
            .last()
            .map(|step| step.qualified_skill.skill.as_str())
            .unwrap_or("")
    }

    fn signature(&self) -> String {
        self.steps
            .iter()
            .map(|step| step.qualified_skill.canonical_id())
            .collect::<Vec<_>>()
            .join("->")
    }
}

pub struct DeterministicPlanner {
    domain_registry: Arc<DomainRegistry>,
}

impl DeterministicPlanner {
    pub fn new(domain_registry: Arc<DomainRegistry>) -> Self {
        Self { domain_registry }
    }

    #[allow(dead_code)]
    pub fn plan_with_context(
        &self,
        domain: &str,
        goal: &PlanningGoal,
        context: &crate::engine::context::ExecutionContext,
    ) -> Result<Workflow> {
        self.plan_with_context_and_budget(domain, goal, context, &ExecutionBudget::unbounded())
    }

    pub fn plan_with_context_and_budget(
        &self,
        domain: &str,
        goal: &PlanningGoal,
        context: &crate::engine::context::ExecutionContext,
        budget: &ExecutionBudget,
    ) -> Result<Workflow> {
        self.plan_with_context_and_budget_and_routing(
            domain,
            goal,
            context,
            budget,
            &RoutingPolicy::for_single_domain(domain),
        )
    }

    pub fn plan_with_context_and_budget_and_routing(
        &self,
        default_domain: &str,
        goal: &PlanningGoal,
        context: &crate::engine::context::ExecutionContext,
        budget: &ExecutionBudget,
        routing_policy: &RoutingPolicy,
    ) -> Result<Workflow> {
        self.plan_with_context_and_budget_and_routing_and_security(
            default_domain,
            goal,
            context,
            budget,
            routing_policy,
            &DomainSecurityPolicy::default(),
        )
    }

    pub fn plan_with_context_and_budget_and_routing_and_security(
        &self,
        default_domain: &str,
        goal: &PlanningGoal,
        context: &crate::engine::context::ExecutionContext,
        budget: &ExecutionBudget,
        routing_policy: &RoutingPolicy,
        security_policy: &DomainSecurityPolicy,
    ) -> Result<Workflow> {
        println!(
            "🧠 Deterministic Re-Planning for goal: {}",
            goal.original_goal
        );

        // Find input from context memory in deterministic key order.
        let mut memory_keys: Vec<_> = context.memory.keys().cloned().collect();
        memory_keys.sort();
        let literal_input = memory_keys
            .into_iter()
            .filter_map(|key| {
                context
                    .memory
                    .get(&key)
                    .and_then(|value| value.as_text())
                    .map(|text| text.to_string())
            })
            .next()
            .unwrap_or_else(|| "10".to_string());

        self.synthesize_with_budget_and_routing_and_security(
            default_domain,
            &goal.target_type,
            &literal_input,
            budget,
            routing_policy,
            security_policy,
        )
    }

    #[allow(dead_code)]
    pub fn synthesize(
        &self,
        domain: &str,
        target_type: &str,
        literal_input: &str,
    ) -> Result<Workflow> {
        self.synthesize_with_budget(
            domain,
            target_type,
            literal_input,
            &ExecutionBudget::unbounded(),
        )
    }

    pub fn synthesize_with_budget(
        &self,
        domain: &str,
        target_type: &str,
        literal_input: &str,
        budget: &ExecutionBudget,
    ) -> Result<Workflow> {
        self.synthesize_with_budget_and_routing(
            domain,
            target_type,
            literal_input,
            budget,
            &RoutingPolicy::for_single_domain(domain),
        )
    }

    pub fn synthesize_with_budget_and_routing(
        &self,
        default_domain: &str,
        target_type: &str,
        literal_input: &str,
        budget: &ExecutionBudget,
        routing_policy: &RoutingPolicy,
    ) -> Result<Workflow> {
        self.synthesize_with_budget_and_routing_and_security(
            default_domain,
            target_type,
            literal_input,
            budget,
            routing_policy,
            &DomainSecurityPolicy::default(),
        )
    }

    pub fn synthesize_with_budget_and_routing_and_security(
        &self,
        default_domain: &str,
        target_type: &str,
        literal_input: &str,
        budget: &ExecutionBudget,
        routing_policy: &RoutingPolicy,
        security_policy: &DomainSecurityPolicy,
    ) -> Result<Workflow> {
        println!(
            "🧠 Deterministic Synthesis: Target '{}' from Input '{}'",
            target_type, literal_input
        );

        let visited_types = HashSet::new();

        // Backward resolve from target type across all domains.
        let candidates = self.resolve_type_candidates(
            target_type,
            &visited_types,
            routing_policy,
            security_policy,
        )?;
        let best_plan =
            self.select_best_plan(candidates, budget, routing_policy, security_policy)?;
        println!(
            "  [Plan Generated] Total Projected Cost: {}, Latency: {}ms, Steps: {}",
            best_plan.projection.total_cost,
            best_plan.projection.total_latency_ms,
            best_plan.projection.total_steps
        );

        let mut plan_steps = best_plan.steps;
        if let Some(first) = plan_steps.first_mut() {
            first.input = literal_input.to_string();
        }

        let workflow_name = format!("type-synthesized-{}", target_type.to_lowercase());
        let mut steps = Vec::new();

        for (i, p) in plan_steps.into_iter().enumerate() {
            let id = format!("s{}", i + 1);
            let mut step = crate::workflow::model::WorkflowStep::new(
                &id,
                &p.qualified_skill.canonical_id(),
                &p.input,
            );
            if i > 0 {
                step.depends_on = vec![format!("s{}", i)];
                step.input = format!("{{{{s{}}}}}", i);
            }
            steps.push(step);
        }

        let workflow_domain = steps
            .first()
            .and_then(|s| s.skill.split_once('.').map(|(d, _)| d.to_string()))
            .unwrap_or_else(|| default_domain.to_string());

        Ok(Workflow {
            meta: crate::workflow::model::WorkflowMeta {
                name: workflow_name,
                domain: Some(workflow_domain),
                goal: Some(target_type.to_string()),
                target_type: Some(target_type.to_string()),
                routing_policy: Some(routing_policy.clone()),
                security_policy: Some(security_policy.clone()),
                resource_budget: None,
                projected_cost: Some(best_plan.projection.total_cost),
                projected_latency_ms: Some(best_plan.projection.total_latency_ms),
                projected_steps: Some(best_plan.projection.total_steps),
            },
            steps,
        })
    }

    fn resolve_type_candidates(
        &self,
        target_type: &str,
        visited: &HashSet<String>,
        routing_policy: &RoutingPolicy,
        security_policy: &DomainSecurityPolicy,
    ) -> Result<Vec<PlanCandidate>> {
        let normalized_target = normalize_type(target_type);
        if visited.contains(&normalized_target) {
            return Err(anyhow!(
                "Cycle detected in type graph for type '{}'",
                target_type
            ));
        }

        if normalized_target == "text" {
            return Ok(vec![PlanCandidate::default()]);
        }

        let mut current_visited = visited.clone();
        current_visited.insert(normalized_target.clone());

        let mut producers = Vec::new();
        for domain in self.domain_registry.list_domains() {
            if !routing_policy.allows_domain(&domain) {
                continue;
            }
            let mut skills = self.domain_registry.list_skills(&domain)?;
            skills.sort_by(|a, b| a.name().cmp(b.name()));
            for skill in skills {
                let cap = skill.capability();
                if !security_policy.allows_declared_permissions(&cap.permissions) {
                    continue;
                }
                if !security_policy.allows_trust_tier(cap.trust_tier) {
                    continue;
                }
                if normalize_type(&format!("{:?}", cap.output_type)) == normalized_target {
                    producers.push((domain.clone(), skill));
                }
            }
        }

        let mut candidates = Vec::new();

        for (domain, producer) in producers {
            let cap = producer.capability();
            let input_type = normalize_type(&format!("{:?}", cap.input_type));

            let sub_plans = match self.resolve_type_candidates(
                &input_type,
                &current_visited,
                routing_policy,
                security_policy,
            ) {
                Ok(res) => res,
                Err(_) => continue,
            };

            for sub_plan in sub_plans {
                let mut next = sub_plan.clone();
                let qualified = QualifiedSkill::new(&domain, producer.name());
                let mut extra_cost = cap.estimated_cost;
                if !next.domains_used.contains(&domain) {
                    extra_cost = extra_cost.saturating_add(routing_policy.domain_overhead(&domain));
                }
                if next
                    .last_domain
                    .as_ref()
                    .map(|prev| prev != &domain)
                    .unwrap_or(false)
                {
                    extra_cost = extra_cost.saturating_add(routing_policy.cross_domain_penalty);
                }
                if security_policy.strict_mode
                    && cap.side_effect_class == SideEffectClass::ExternalMutation
                {
                    extra_cost =
                        extra_cost.saturating_add(security_policy.external_mutation_penalty);
                }
                extra_cost = extra_cost.saturating_add(cap.trust_tier.isolation_penalty());

                next.projection.total_cost = next.projection.total_cost.saturating_add(extra_cost);
                next.projection.total_latency_ms = next
                    .projection
                    .total_latency_ms
                    .saturating_add(cap.estimated_latency_ms);
                next.projection.total_steps = next.projection.total_steps.saturating_add(1);
                next.projection.side_effect_score = next
                    .projection
                    .side_effect_score
                    .saturating_add(match cap.side_effect_class {
                        SideEffectClass::Pure => 0,
                        SideEffectClass::Idempotent => 1,
                        SideEffectClass::ExternalMutation => 2,
                    });
                next.projection.trust_tier_score =
                    next.projection
                        .trust_tier_score
                        .saturating_add(match cap.trust_tier {
                            TrustTier::Trusted => 0,
                            TrustTier::Constrained => 2,
                            TrustTier::Untrusted => 6,
                        });
                next.projection.isolation_cost_penalty = next
                    .projection
                    .isolation_cost_penalty
                    .saturating_add(cap.trust_tier.isolation_penalty());
                next.domains_used.insert(domain.clone());
                next.last_domain = Some(domain.clone());
                next.steps.push(PlannedStep {
                    qualified_skill: qualified,
                    input: String::new(),
                });
                candidates.push(next);
            }
        }

        if candidates.is_empty() {
            Err(anyhow!(
                "No producer found for required type '{}' under routing policy",
                target_type
            ))
        } else {
            Ok(candidates)
        }
    }

    fn select_best_plan(
        &self,
        mut candidates: Vec<PlanCandidate>,
        budget: &ExecutionBudget,
        routing_policy: &RoutingPolicy,
        security_policy: &DomainSecurityPolicy,
    ) -> Result<PlanCandidate> {
        let mut feasible: Vec<PlanCandidate> = candidates
            .iter()
            .filter(|candidate| candidate.projection.fits_within_budget(budget))
            .cloned()
            .collect();

        feasible.sort_by(|a, b| Self::compare_candidates(a, b, routing_policy, security_policy));
        if let Some(best) = feasible.into_iter().next() {
            return Ok(best);
        }

        candidates.sort_by(|a, b| Self::compare_candidates(a, b, routing_policy, security_policy));
        if let Some(best) = candidates.first() {
            return Err(anyhow!(
                "No deterministic plan fits budget. Best candidate: cost={}, latency={}ms, steps={}. Budget: cost<={}, latency<={}ms, steps<={}",
                best.projection.total_cost,
                best.projection.total_latency_ms,
                best.projection.total_steps,
                budget.max_total_cost,
                budget.max_total_latency_ms,
                budget.max_steps
            ));
        }

        Err(anyhow!("No deterministic plan candidates were generated."))
    }

    fn compare_candidates(
        a: &PlanCandidate,
        b: &PlanCandidate,
        routing_policy: &RoutingPolicy,
        security_policy: &DomainSecurityPolicy,
    ) -> Ordering {
        let a_score = Self::candidate_score(a, security_policy);
        let b_score = Self::candidate_score(b, security_policy);

        b_score
            .cmp(&a_score)
            .then_with(|| {
                a.projection
                    .side_effect_score
                    .cmp(&b.projection.side_effect_score)
            })
            .then_with(|| {
                a.projection
                    .total_latency_ms
                    .cmp(&b.projection.total_latency_ms)
            })
            .then_with(|| a.projection.total_steps.cmp(&b.projection.total_steps))
            .then_with(|| a.projection.total_cost.cmp(&b.projection.total_cost))
            .then_with(|| {
                routing_policy
                    .preferred_rank(a.root_domain())
                    .cmp(&routing_policy.preferred_rank(b.root_domain()))
            })
            .then_with(|| a.root_domain().cmp(b.root_domain()))
            .then_with(|| a.root_skill_name().cmp(b.root_skill_name()))
            .then_with(|| a.signature().cmp(&b.signature()))
    }

    fn candidate_score(candidate: &PlanCandidate, security_policy: &DomainSecurityPolicy) -> i64 {
        let utility = 10_000_i64;
        let side_effect_penalty = if security_policy.strict_mode {
            i64::from(candidate.projection.side_effect_score) * 50
        } else {
            i64::from(candidate.projection.side_effect_score) * 20
        };
        let trust_penalty = i64::from(candidate.projection.trust_tier_score) * 50;
        let isolation_cost_penalty = i64::from(candidate.projection.isolation_cost_penalty) * 30;
        let resource_cost_penalty = i64::from(candidate.projection.total_cost) * 100
            + i64::from(candidate.projection.total_latency_ms)
            + i64::try_from(candidate.projection.total_steps).unwrap_or(i64::MAX) * 25;

        utility
            - side_effect_penalty
            - trust_penalty
            - isolation_cost_penalty
            - resource_cost_penalty
    }
}

fn normalize_type(type_name: &str) -> String {
    type_name.trim().to_lowercase()
}

#[derive(Debug, Clone)]
pub struct PlannedStep {
    pub qualified_skill: QualifiedSkill,
    pub input: String,
}

#[cfg(test)]
#[allow(clippy::field_reassign_with_default)]
mod tests {
    use super::*;
    use crate::engine::context::ExecutionContext;
    use crate::engine::registry::DomainRegistry;
    use crate::engine::security::DomainSecurityPolicy;
    use crate::skill::capability::{
        CapabilityPermissions, SideEffectClass, SkillCapability, SkillIOType,
    };
    use crate::skill::io::{SkillInput, SkillOutput};
    use crate::skill::Skill;
    use async_trait::async_trait;

    struct MockSkill {
        name: String,
        input: SkillIOType,
        output: SkillIOType,
        cost: u32,
        latency: u32,
        permissions: CapabilityPermissions,
        side_effect_class: SideEffectClass,
        trust_tier: TrustTier,
    }

    impl MockSkill {
        fn new(name: &str, input: SkillIOType, output: SkillIOType, cost: u32) -> Self {
            Self {
                name: name.to_string(),
                input,
                output,
                cost,
                latency: 1,
                permissions: CapabilityPermissions::none(),
                side_effect_class: SideEffectClass::Pure,
                trust_tier: TrustTier::Trusted,
            }
        }

        fn with_permissions(mut self, permissions: CapabilityPermissions) -> Self {
            self.permissions = permissions;
            self
        }

        fn with_side_effect_class(mut self, side_effect_class: SideEffectClass) -> Self {
            self.side_effect_class = side_effect_class;
            self
        }

        fn with_trust_tier(mut self, trust_tier: TrustTier) -> Self {
            self.trust_tier = trust_tier;
            self
        }
    }

    #[async_trait]
    impl Skill for MockSkill {
        fn name(&self) -> &str {
            &self.name
        }

        fn capability(&self) -> SkillCapability {
            SkillCapability::new(
                &self.name,
                "mock",
                self.input,
                self.output,
                self.permissions,
                self.side_effect_class,
            )
            .with_cost(self.cost)
            .with_latency(self.latency)
            .with_trust_tier(self.trust_tier)
        }

        async fn execute(
            &self,
            _input: SkillInput,
            _ctx: &mut ExecutionContext,
        ) -> Result<SkillOutput> {
            Ok(SkillOutput::text("ok"))
        }
    }

    #[test]
    fn choose_min_cost_across_domains() {
        let mut registry = DomainRegistry::new();
        registry.register_domain("alpha");
        registry.register_domain("beta");
        registry
            .register_skill(
                "alpha",
                Arc::new(MockSkill::new(
                    "make_bool",
                    SkillIOType::Text,
                    SkillIOType::Boolean,
                    5,
                )),
            )
            .unwrap();
        registry
            .register_skill(
                "beta",
                Arc::new(MockSkill::new(
                    "make_bool",
                    SkillIOType::Text,
                    SkillIOType::Boolean,
                    2,
                )),
            )
            .unwrap();

        let planner = DeterministicPlanner::new(Arc::new(registry));
        let workflow = planner
            .synthesize_with_budget_and_routing(
                "alpha",
                "boolean",
                "1",
                &ExecutionBudget::default(),
                &RoutingPolicy::default(),
            )
            .unwrap();

        assert_eq!(workflow.steps[0].skill, "beta.make_bool");
    }

    #[test]
    fn equal_cost_uses_lexicographic_domain_tiebreak() {
        let mut registry = DomainRegistry::new();
        registry.register_domain("alpha");
        registry.register_domain("beta");
        registry
            .register_skill(
                "alpha",
                Arc::new(MockSkill::new(
                    "make_bool",
                    SkillIOType::Text,
                    SkillIOType::Boolean,
                    3,
                )),
            )
            .unwrap();
        registry
            .register_skill(
                "beta",
                Arc::new(MockSkill::new(
                    "make_bool",
                    SkillIOType::Text,
                    SkillIOType::Boolean,
                    3,
                )),
            )
            .unwrap();

        let planner = DeterministicPlanner::new(Arc::new(registry));
        let workflow = planner
            .synthesize_with_budget_and_routing(
                "alpha",
                "boolean",
                "1",
                &ExecutionBudget::default(),
                &RoutingPolicy::default(),
            )
            .unwrap();

        assert_eq!(workflow.steps[0].skill, "alpha.make_bool");
    }

    #[test]
    fn disallowed_domain_is_rejected() {
        let mut registry = DomainRegistry::new();
        registry.register_domain("alpha");
        registry.register_domain("beta");
        registry
            .register_skill(
                "beta",
                Arc::new(MockSkill::new(
                    "make_bool",
                    SkillIOType::Text,
                    SkillIOType::Boolean,
                    1,
                )),
            )
            .unwrap();

        let planner = DeterministicPlanner::new(Arc::new(registry));
        let mut policy = RoutingPolicy::default();
        policy.allowed_domains = Some(std::iter::once("alpha".to_string()).collect());

        let err = planner
            .synthesize_with_budget_and_routing(
                "alpha",
                "boolean",
                "1",
                &ExecutionBudget::default(),
                &policy,
            )
            .unwrap_err();

        assert!(err.to_string().contains("No producer found"));
    }

    #[test]
    fn cross_domain_penalty_can_change_selection() {
        let mut registry = DomainRegistry::new();
        registry.register_domain("alpha");
        registry.register_domain("beta");

        // Direct path: alpha.text_to_bool (cost 5)
        registry
            .register_skill(
                "alpha",
                Arc::new(MockSkill::new(
                    "text_to_bool",
                    SkillIOType::Text,
                    SkillIOType::Boolean,
                    5,
                )),
            )
            .unwrap();

        // Two-step cross-domain path: alpha.text_to_number (1) -> beta.number_to_bool (1)
        registry
            .register_skill(
                "alpha",
                Arc::new(MockSkill::new(
                    "text_to_number",
                    SkillIOType::Text,
                    SkillIOType::Number,
                    1,
                )),
            )
            .unwrap();
        registry
            .register_skill(
                "beta",
                Arc::new(MockSkill::new(
                    "number_to_bool",
                    SkillIOType::Number,
                    SkillIOType::Boolean,
                    1,
                )),
            )
            .unwrap();

        let planner = DeterministicPlanner::new(Arc::new(registry));

        let no_penalty = planner
            .synthesize_with_budget_and_routing(
                "alpha",
                "boolean",
                "1",
                &ExecutionBudget::default(),
                &RoutingPolicy::default(),
            )
            .unwrap();
        assert_eq!(no_penalty.steps.len(), 2);
        assert_eq!(no_penalty.steps[1].skill, "beta.number_to_bool");

        let mut with_penalty = RoutingPolicy::default();
        with_penalty.cross_domain_penalty = 5;
        let with_penalty = planner
            .synthesize_with_budget_and_routing(
                "alpha",
                "boolean",
                "1",
                &ExecutionBudget::default(),
                &with_penalty,
            )
            .unwrap();
        assert_eq!(with_penalty.steps.len(), 1);
        assert_eq!(with_penalty.steps[0].skill, "alpha.text_to_bool");
    }

    #[test]
    fn security_policy_filters_unsafe_skill_when_safe_alternative_exists() {
        let mut registry = DomainRegistry::new();
        registry.register_domain("alpha");
        registry
            .register_skill(
                "alpha",
                Arc::new(
                    MockSkill::new("unsafe_bool", SkillIOType::Text, SkillIOType::Boolean, 1)
                        .with_permissions(CapabilityPermissions::new(
                            false, false, true, false, false,
                        ))
                        .with_side_effect_class(SideEffectClass::ExternalMutation),
                ),
            )
            .unwrap();
        registry
            .register_skill(
                "alpha",
                Arc::new(MockSkill::new(
                    "safe_bool",
                    SkillIOType::Text,
                    SkillIOType::Boolean,
                    2,
                )),
            )
            .unwrap();

        let mut policy = DomainSecurityPolicy::default();
        policy.override_permissions =
            Some(CapabilityPermissions::new(true, true, false, true, true));

        let planner = DeterministicPlanner::new(Arc::new(registry));
        let workflow = planner
            .synthesize_with_budget_and_routing_and_security(
                "alpha",
                "boolean",
                "1",
                &ExecutionBudget::default(),
                &RoutingPolicy::default(),
                &policy,
            )
            .unwrap();

        assert_eq!(workflow.steps.len(), 1);
        assert_eq!(workflow.steps[0].skill, "alpha.safe_bool");
    }

    #[test]
    fn planner_avoids_high_cost_skill_when_cheaper_alternative_exists() {
        let mut registry = DomainRegistry::new();
        registry.register_domain("alpha");
        registry
            .register_skill(
                "alpha",
                Arc::new(MockSkill::new(
                    "expensive_bool",
                    SkillIOType::Text,
                    SkillIOType::Boolean,
                    25,
                )),
            )
            .unwrap();
        registry
            .register_skill(
                "alpha",
                Arc::new(MockSkill::new(
                    "cheap_bool",
                    SkillIOType::Text,
                    SkillIOType::Boolean,
                    2,
                )),
            )
            .unwrap();

        let planner = DeterministicPlanner::new(Arc::new(registry));
        let workflow = planner
            .synthesize_with_budget_and_routing(
                "alpha",
                "boolean",
                "1",
                &ExecutionBudget::default(),
                &RoutingPolicy::default(),
            )
            .unwrap();

        assert_eq!(workflow.steps.len(), 1);
        assert_eq!(workflow.steps[0].skill, "alpha.cheap_bool");
    }

    #[test]
    fn planner_prefers_trusted_over_untrusted_when_costs_equal() {
        let mut registry = DomainRegistry::new();
        registry.register_domain("alpha");
        registry
            .register_skill(
                "alpha",
                Arc::new(
                    MockSkill::new("trusted_bool", SkillIOType::Text, SkillIOType::Boolean, 3)
                        .with_trust_tier(TrustTier::Trusted),
                ),
            )
            .unwrap();
        registry
            .register_skill(
                "alpha",
                Arc::new(
                    MockSkill::new("untrusted_bool", SkillIOType::Text, SkillIOType::Boolean, 3)
                        .with_trust_tier(TrustTier::Untrusted),
                ),
            )
            .unwrap();

        let planner = DeterministicPlanner::new(Arc::new(registry));
        let workflow = planner
            .synthesize_with_budget_and_routing_and_security(
                "alpha",
                "boolean",
                "1",
                &ExecutionBudget::default(),
                &RoutingPolicy::default(),
                &DomainSecurityPolicy::default(),
            )
            .unwrap();

        assert_eq!(workflow.steps[0].skill, "alpha.trusted_bool");
    }
}
