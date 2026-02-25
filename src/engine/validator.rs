use crate::engine::registry::DomainRegistry;
use crate::workflow::model::Workflow;
use anyhow::{anyhow, Result};
use std::collections::HashMap;

pub struct WorkflowValidator<'a> {
    domain_registry: &'a DomainRegistry,
}

impl<'a> WorkflowValidator<'a> {
    pub fn new(domain_registry: &'a DomainRegistry) -> Self {
        Self { domain_registry }
    }

    pub fn validate(&self, workflow: &Workflow) -> Result<()> {
        let default_domain = workflow
            .meta
            .domain
            .as_deref()
            .ok_or_else(|| anyhow!("Workflow has no domain"))?;
        let routing_policy = workflow.meta.routing_policy.as_ref();
        let security_policy = workflow.meta.security_policy.as_ref();

        let mut step_outputs = HashMap::new();

        // 1. Check all skills exist and collect types
        for step in &workflow.steps {
            let (qualified, skill) = self
                .domain_registry
                .resolve_skill_reference(default_domain, &step.skill)?;

            if let Some(policy) = routing_policy {
                if !policy.allows_domain(&qualified.domain) {
                    return Err(anyhow!(
                        "Step '{}' uses disallowed domain '{}' (skill '{}')",
                        step.id,
                        qualified.domain,
                        qualified.canonical_id()
                    ));
                }
            }

            let cap = skill.capability();
            if let Some(policy) = security_policy {
                if !policy.allows_declared_permissions(&cap.permissions) {
                    let denied = policy.denied_declared_actions(&cap.permissions).join(", ");
                    return Err(anyhow!(
                        "Step '{}' (skill '{}') declares permissions [{}] disallowed by security policy",
                        step.id,
                        qualified.canonical_id(),
                        denied
                    ));
                }
                if !policy.allows_trust_tier(cap.trust_tier) {
                    return Err(anyhow!(
                        "Step '{}' (skill '{}') requires trust tier '{:?}' beyond policy max '{:?}'",
                        step.id,
                        qualified.canonical_id(),
                        cap.trust_tier,
                        policy.max_trust_tier
                    ));
                }
            }
            step_outputs.insert(step.id.clone(), cap.output_type);
        }

        // 2. Validate data flow / type compatibility
        for step in &workflow.steps {
            let (_qualified, skill) = self
                .domain_registry
                .resolve_skill_reference(default_domain, &step.skill)?;
            let cap = skill.capability();
            let target_input_type = cap.input_type;

            // Simple type check for {{step_id}} references
            if step.input.trim().starts_with("{{") && step.input.trim().ends_with("}}") {
                let trimmed = step.input.trim();
                let ref_id = &trimmed[2..trimmed.len() - 2].trim();

                if let Some(source_output_type) = step_outputs.get(*ref_id) {
                    if format!("{:?}", source_output_type) != format!("{:?}", target_input_type) {
                        return Err(anyhow!(
                            "Type mismatch in step '{}': skill '{}' expects {:?}, but step '{}' provides {:?}",
                            step.id, step.skill, target_input_type, ref_id, source_output_type
                        ));
                    }
                }
            } else {
                // Literal input check
                // For now, only Text skills can take literal inputs from the MD loader
                // unless we add more sophisticated literal parsing.
                if format!("{:?}", target_input_type).to_lowercase() != "text" {
                    return Err(anyhow!(
                        "Step '{}' (skill '{}') requires {:?} input, but received literal text. Use a conversion skill first.",
                        step.id, step.skill, target_input_type
                    ));
                }
            }
        }

        println!("✅ Workflow validation passed: Type Flow is Sound.");
        Ok(())
    }
}
