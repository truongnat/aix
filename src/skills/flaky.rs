use crate::engine::context::ExecutionContext;
use crate::skill::capability::{
    CapabilityPermissions, SideEffectClass, SkillCapability, SkillIOType,
};
use crate::skill::io::{SkillInput, SkillOutput};
use crate::skill::Skill;
use anyhow::{anyhow, Result};
use async_trait::async_trait;

/// A skill that fails N times before succeeding (based on input)
/// Input format: "fail_count:text_to_echo"
/// This version: always parses fail_count fresh, doesn't track state
pub struct FlakySkill;

impl FlakySkill {
    pub fn new() -> Self {
        Self
    }
}

impl Default for FlakySkill {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl Skill for FlakySkill {
    fn name(&self) -> &str {
        "flaky"
    }

    fn capability(&self) -> SkillCapability {
        SkillCapability::new(
            "flaky",
            "A skill that fails N times before succeeding. Input: 'fail_count:text'",
            SkillIOType::Text,
            SkillIOType::Text,
            CapabilityPermissions::none(),
            SideEffectClass::Pure,
        )
        .with_cost(5)
        .with_latency(50)
    }

    async fn execute(&self, input: SkillInput, _ctx: &mut ExecutionContext) -> Result<SkillOutput> {
        let text = input.as_text().unwrap_or_default();

        let parts: Vec<&str> = text.splitn(2, ':').collect();
        if parts.len() != 2 {
            return Err(anyhow!("Invalid input format. Expected 'fail_count:text'"));
        }

        let fail_count: i32 = parts[0]
            .trim()
            .parse()
            .map_err(|_| anyhow!("Invalid fail count: {}", parts[0]))?;

        let output_text = parts[1].trim();

        // Always fail if fail_count > 0 - let executor handle retry
        if fail_count > 0 {
            Err(anyhow!(
                "FlakySkill: Simulated failure (fails {} more times)",
                fail_count
            ))
        } else {
            Ok(SkillOutput::text(format!(
                "Flaky succeeded: {}",
                output_text
            )))
        }
    }
}
