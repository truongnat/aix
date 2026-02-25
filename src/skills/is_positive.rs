use crate::engine::context::ExecutionContext;
use crate::skill::capability::{
    CapabilityPermissions, SideEffectClass, SkillCapability, SkillIOType,
};
use crate::skill::io::{SkillInput, SkillOutput};
use crate::skill::Skill;
use anyhow::{anyhow, Result};
use async_trait::async_trait;

/// Skill that checks if a number is positive
pub struct IsPositiveSkill;

impl IsPositiveSkill {
    pub fn new() -> Self {
        Self
    }
}

impl Default for IsPositiveSkill {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl Skill for IsPositiveSkill {
    fn name(&self) -> &str {
        "is_positive"
    }

    fn capability(&self) -> SkillCapability {
        SkillCapability::new(
            "is_positive",
            "Returns true if input number is positive",
            SkillIOType::Number,
            SkillIOType::Boolean,
            CapabilityPermissions::none(),
            SideEffectClass::Pure,
        )
        .with_cost(2)
        .with_latency(20)
    }

    async fn execute(&self, input: SkillInput, _ctx: &mut ExecutionContext) -> Result<SkillOutput> {
        let num = match input {
            SkillInput::Number(n) => n,
            SkillInput::Text(t) => t
                .trim()
                .parse()
                .map_err(|_| anyhow!("Failed to parse '{}' as number", t))?,
            _ => return Err(anyhow!("Expected Number input, got {:?}", input)),
        };

        Ok(SkillOutput::boolean(num > 0.0))
    }
}
