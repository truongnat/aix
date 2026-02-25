use crate::engine::context::ExecutionContext;
use crate::skill::capability::{
    CapabilityPermissions, SideEffectClass, SkillCapability, SkillIOType,
};
use crate::skill::io::{SkillInput, SkillOutput};
use crate::skill::Skill;
use anyhow::Result;
use async_trait::async_trait;

pub struct EchoSkill;

impl EchoSkill {
    pub fn new() -> Self {
        Self
    }
}

impl Default for EchoSkill {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl Skill for EchoSkill {
    fn name(&self) -> &str {
        "echo"
    }

    fn capability(&self) -> SkillCapability {
        SkillCapability::new(
            "echo",
            "Echos the input back as output",
            SkillIOType::Text,
            SkillIOType::Text,
            CapabilityPermissions::none(),
            SideEffectClass::Pure,
        )
        .with_cost(1)
        .with_latency(10)
    }

    async fn execute(&self, input: SkillInput, _ctx: &mut ExecutionContext) -> Result<SkillOutput> {
        let text = input.as_text().unwrap_or_default();
        Ok(SkillOutput::text(format!("Echo: {}", text)))
    }
}
