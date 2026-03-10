//! PinchTab Skill - Browser Automation Skill
//!
//! This skill provides browser automation capabilities using PinchTab.

use crate::engine::context::ExecutionContext;
use crate::skill::capability::{SkillCapability, SkillIOType, CapabilityPermissions, SideEffectClass};
use crate::skill::io::{SkillInput, SkillOutput};
use crate::skill::Skill;
use anyhow::{anyhow, Result};
use async_trait::async_trait;
use serde::{Deserialize, Serialize};

/// PinchTab skill for browser automation
pub struct PinchTabSkill;

impl PinchTabSkill {
    pub fn new() -> Self {
        Self
    }

    fn execute_action(&self, input: &PinchTabInput) -> Result<String> {
        use std::process::Command;

        let mut cmd = Command::new("pinchtab");

        match input.action {
            PinchTabAction::Launch => {
                cmd.arg("instance").arg("launch");
                if input.headless.unwrap_or(true) {
                    cmd.arg("--headless");
                }
                if let Some(profile) = &input.profile {
                    cmd.arg("--profile").arg(profile);
                }
            }
            PinchTabAction::Navigate => {
                cmd.arg("nav");
                if let Some(url) = &input.url {
                    cmd.arg(url);
                } else {
                    return Err(anyhow!("URL required for navigate action"));
                }
            }
            PinchTabAction::Snapshot => {
                cmd.arg("snap");
                if let Some(tab_id) = &input.tab_id {
                    cmd.arg("-i").arg(tab_id);
                }
            }
            PinchTabAction::Click => {
                cmd.arg("click");
                if let Some(element_id) = &input.element_id {
                    cmd.arg(element_id);
                } else {
                    return Err(anyhow!("Element ID required for click action"));
                }
            }
            PinchTabAction::Fill => {
                cmd.arg("fill");
                if let Some(element_id) = &input.element_id {
                    cmd.arg(element_id);
                } else {
                    return Err(anyhow!("Element ID required for fill action"));
                }
                if let Some(value) = &input.value {
                    cmd.arg(value);
                }
            }
            PinchTabAction::ExtractText => {
                cmd.arg("text");
                if let Some(tab_id) = &input.tab_id {
                    cmd.arg("-i").arg(tab_id);
                }
            }
            PinchTabAction::Screenshot => {
                cmd.arg("screenshot");
                if let Some(tab_id) = &input.tab_id {
                    cmd.arg("-i").arg(tab_id);
                }
                if let Some(path) = &input.output_path {
                    cmd.arg("-o").arg(path);
                }
            }
            PinchTabAction::Close => {
                cmd.arg("instance").arg("close");
                if let Some(tab_id) = &input.tab_id {
                    cmd.arg("-i").arg(tab_id);
                }
            }
        }

        let output = cmd.output().map_err(|e| anyhow!("Failed to execute: {}", e))?;

        if output.status.success() {
            Ok(String::from_utf8_lossy(&output.stdout).to_string())
        } else {
            Err(anyhow!(String::from_utf8_lossy(&output.stderr).to_string()))
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PinchTabInput {
    pub action: PinchTabAction,
    pub url: Option<String>,
    pub tab_id: Option<String>,
    pub element_id: Option<String>,
    pub value: Option<String>,
    pub profile: Option<String>,
    pub headless: Option<bool>,
    pub output_path: Option<String>,
}

impl Default for PinchTabInput {
    fn default() -> Self {
        Self {
            action: PinchTabAction::Snapshot,
            url: None,
            tab_id: None,
            element_id: None,
            value: None,
            profile: None,
            headless: Some(true),
            output_path: None,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum PinchTabAction {
    Launch,
    Navigate,
    Snapshot,
    Click,
    Fill,
    ExtractText,
    Screenshot,
    Close,
}

#[async_trait]
impl Skill for PinchTabSkill {
    fn name(&self) -> &str {
        "browser_automation"
    }

    fn capability(&self) -> SkillCapability {
        SkillCapability::new(
            "browser_automation",
            "Browser automation using PinchTab for web scraping, testing, and interaction",
            SkillIOType::Json,
            SkillIOType::Text,
            CapabilityPermissions::new(
                false,
                false,
                true,
                false,
                true,
            ),
            SideEffectClass::ExternalMutation,
        )
    }

    async fn execute(&self, input: SkillInput, _ctx: &mut ExecutionContext) -> Result<SkillOutput> {
        let json_value = match input {
            SkillInput::Json(v) => v,
            _ => return Err(anyhow!("Expected JSON input")),
        };

        let pinch_input: PinchTabInput = serde_json::from_value(json_value)?;
        let result = self.execute_action(&pinch_input)?;
        Ok(SkillOutput::text(result))
    }
}
