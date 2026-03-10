//! Defuddle Skill - Web Content Extraction Skill
//!
//! This skill extracts main content from web pages by removing clutter.

use crate::engine::context::ExecutionContext;
use crate::skill::capability::{SkillCapability, SkillIOType, CapabilityPermissions, SideEffectClass};
use crate::skill::io::{SkillInput, SkillOutput};
use crate::skill::Skill;
use anyhow::{anyhow, Result};
use async_trait::async_trait;
use serde::{Deserialize, Serialize};

/// Defuddle skill for web content extraction
pub struct DefuddleSkill;

impl DefuddleSkill {
    pub fn new() -> Self {
        Self
    }

    fn execute_action(&self, input: &DefuddleInput) -> Result<String> {
        use std::process::Command;

        let mut cmd = Command::new("defuddle");

        cmd.arg("parse");

        // Input source: file path or URL
        if let Some(source) = &input.source {
            cmd.arg(source);
        } else if let Some(url) = &input.url {
            cmd.arg(url);
        } else {
            return Err(anyhow!("Source or URL required for parse action"));
        }

        // Output format
        if input.markdown {
            cmd.arg("--markdown");
        }
        if input.json {
            cmd.arg("--json");
        }

        // Extract specific property
        if let Some(property) = &input.property {
            cmd.arg("-p").arg(property);
        }

        // Output file
        if let Some(output) = &input.output {
            cmd.arg("-o").arg(output);
        }

        // Debug mode
        if input.debug {
            cmd.arg("--debug");
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
pub struct DefuddleInput {
    pub source: Option<String>,
    pub url: Option<String>,
    pub markdown: bool,
    pub json: bool,
    pub property: Option<String>,
    pub output: Option<String>,
    pub debug: bool,
}

impl Default for DefuddleInput {
    fn default() -> Self {
        Self {
            source: None,
            url: None,
            markdown: false,
            json: false,
            property: None,
            output: None,
            debug: false,
        }
    }
}

#[async_trait]
impl Skill for DefuddleSkill {
    fn name(&self) -> &str {
        "web_content_extraction"
    }

    fn capability(&self) -> SkillCapability {
        SkillCapability::new(
            "web_content_extraction",
            "Extract main content from web pages using Defuddle",
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

        let defuddle_input: DefuddleInput = serde_json::from_value(json_value)?;
        let result = self.execute_action(&defuddle_input)?;
        Ok(SkillOutput::text(result))
    }
}
