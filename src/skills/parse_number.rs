use crate::engine::context::ExecutionContext;
use crate::skill::capability::{
    CapabilityPermissions, SideEffectClass, SkillCapability, SkillIOType,
};
use crate::skill::io::{SkillInput, SkillOutput};
use crate::skill::Skill;
use anyhow::{anyhow, Result};
use async_trait::async_trait;

/// Skill that parses text into a number
pub struct ParseNumberSkill;

impl ParseNumberSkill {
    pub fn new() -> Self {
        Self
    }
}

#[async_trait]
impl Skill for ParseNumberSkill {
    fn name(&self) -> &str {
        "parse_number"
    }

    fn capability(&self) -> SkillCapability {
        SkillCapability::new(
            "parse_number",
            "Parses a text string into a numeric value",
            SkillIOType::Text,
            SkillIOType::Number,
            CapabilityPermissions::none(),
            SideEffectClass::Pure,
        )
        .with_cost(3)
        .with_latency(30)
    }

    async fn execute(&self, input: SkillInput, _ctx: &mut ExecutionContext) -> Result<SkillOutput> {
        let text = input
            .as_text()
            .ok_or_else(|| anyhow!("Expected text input"))?;
        let num: f64 = text
            .trim()
            .parse()
            .map_err(|_| anyhow!("Failed to parse '{}' as number", text))?;
        Ok(SkillOutput::number(num))
    }
}
