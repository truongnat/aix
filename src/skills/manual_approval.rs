use crate::engine::context::ExecutionContext;
use crate::engine::workflow_engine::state_store::{ManualApprovalDecisionKind, WorkflowStateStore};
use crate::skill::capability::{
    CapabilityPermissions, SideEffectClass, SkillCapability, SkillIOType, TrustTier,
};
use crate::skill::io::{SkillInput, SkillOutput};
use crate::skill::Skill;
use anyhow::{anyhow, Result};
use async_trait::async_trait;
use serde_json::json;

pub struct ManualApprovalSkill;

#[async_trait]
impl Skill for ManualApprovalSkill {
    fn name(&self) -> &str {
        "manual_approval"
    }

    fn capability(&self) -> SkillCapability {
        SkillCapability::new(
            self.name(),
            "Pause workflow until operator explicitly approves/rejects a step",
            SkillIOType::Text,
            SkillIOType::Json,
            CapabilityPermissions::new(false, false, false, false, false),
            SideEffectClass::Pure,
        )
        .with_trust_tier(TrustTier::Constrained)
    }

    async fn execute(&self, input: SkillInput, ctx: &mut ExecutionContext) -> Result<SkillOutput> {
        let instruction = normalize_instruction(&input);
        let instance_id = ctx.workflow_instance_id.trim();
        if instance_id.is_empty() {
            return Err(anyhow!(
                "manual_approval requires workflow_instance_id in execution context"
            ));
        }

        let store = WorkflowStateStore::new(&ctx.project_root)?;
        let decision = store.load_manual_approval_decision(instance_id, &ctx.step_id)?;
        let Some(decision) = decision else {
            return Ok(SkillOutput::json(json!({
                "status": "pending",
                "approved": false,
                "pause_workflow": true,
                "instance_id": instance_id,
                "step_id": ctx.step_id,
                "instruction": instruction,
                "message": "Awaiting manual approval. Run: antigrav workflow approve <instance_id> --step <step_id>"
            })));
        };

        match decision.decision {
            ManualApprovalDecisionKind::Approved => Ok(SkillOutput::json(json!({
                "status": "approved",
                "approved": true,
                "pause_workflow": false,
                "instance_id": decision.instance_id,
                "step_id": decision.step_id,
                "approver": decision.approver,
                "note": decision.note,
                "decided_at_ms": decision.decided_at_ms,
                "instruction": instruction,
            }))),
            ManualApprovalDecisionKind::Rejected => {
                let mut message = format!(
                    "manual approval rejected for step '{}' by '{}': workflow cannot proceed",
                    decision.step_id, decision.approver
                );
                if let Some(note) = decision.note.as_deref() {
                    if !note.trim().is_empty() {
                        message.push_str(" (");
                        message.push_str(note.trim());
                        message.push(')');
                    }
                }
                Err(anyhow!(message))
            }
        }
    }
}

fn normalize_instruction(input: &SkillInput) -> String {
    match input {
        SkillInput::Text(value) => value.trim().to_string(),
        SkillInput::Json(value) => value
            .get("instruction")
            .or_else(|| value.get("message"))
            .and_then(|v| v.as_str())
            .map(|v| v.trim().to_string())
            .filter(|v| !v.is_empty())
            .unwrap_or_else(|| "Manual approval required".to_string()),
        SkillInput::Number(value) => format!("Manual approval required ({})", value),
        SkillInput::Boolean(value) => format!("Manual approval required ({})", value),
    }
}

#[cfg(test)]
mod tests {
    use super::normalize_instruction;
    use crate::skill::io::SkillInput;
    use serde_json::json;

    #[test]
    fn normalizes_instruction_from_text_and_json() {
        let text = normalize_instruction(&SkillInput::Text("  approve release gate  ".to_string()));
        assert_eq!(text, "approve release gate");

        let json_input = normalize_instruction(&SkillInput::Json(json!({
            "instruction": "  require human go/no-go "
        })));
        assert_eq!(json_input, "require human go/no-go");
    }
}
