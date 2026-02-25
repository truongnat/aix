use crate::engine::context::ExecutionContext;
use crate::skill::capability::{SideEffectClass, SkillCapability};
use crate::skill::io::{SkillInput, SkillOutput};
use anyhow::Result;
use async_trait::async_trait;

#[derive(Debug, Clone)]
#[allow(dead_code)]
pub struct SubprocessCommand {
    pub program: String,
    pub args: Vec<String>,
    pub stdin: Option<String>,
}

#[async_trait]
pub trait Skill: Send + Sync {
    fn name(&self) -> &str;
    fn capability(&self) -> SkillCapability;
    fn is_idempotent(&self) -> bool {
        matches!(
            self.capability().side_effect_class,
            SideEffectClass::Pure | SideEffectClass::Idempotent
        )
    }
    async fn detect_already_applied(
        &self,
        _input: &SkillInput,
        _ctx: &mut ExecutionContext,
    ) -> Result<Option<SkillOutput>> {
        Ok(None)
    }
    #[allow(dead_code)]
    fn subprocess_command(&self, _input: &SkillInput) -> Option<SubprocessCommand> {
        None
    }
    async fn execute(&self, input: SkillInput, ctx: &mut ExecutionContext) -> Result<SkillOutput>;
}
