use serde::{Deserialize, Serialize};
use serde_json::Value;

use crate::skill::capability::ConfidenceLevel;

/// Typed input wrapper for skill execution
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SkillInput {
    Text(String),
    Json(Value),
    Number(f64),
    Boolean(bool),
}

impl From<SkillOutput> for SkillInput {
    fn from(output: SkillOutput) -> Self {
        match output {
            SkillOutput::Text(s) => SkillInput::Text(s),
            SkillOutput::Json(v) => SkillInput::Json(v),
            SkillOutput::Number(n) => SkillInput::Number(n),
            SkillOutput::Boolean(b) => SkillInput::Boolean(b),
        }
    }
}

impl SkillInput {
    #[allow(dead_code)]
    pub fn from_text(text: &str) -> Self {
        SkillInput::Text(text.to_string())
    }

    pub fn as_text(&self) -> Option<&str> {
        match self {
            SkillInput::Text(s) => Some(s),
            _ => None,
        }
    }

    #[allow(dead_code)]
    pub fn io_type(&self) -> super::capability::SkillIOType {
        match self {
            SkillInput::Text(_) => super::capability::SkillIOType::Text,
            SkillInput::Json(_) => super::capability::SkillIOType::Json,
            SkillInput::Number(_) => super::capability::SkillIOType::Number,
            SkillInput::Boolean(_) => super::capability::SkillIOType::Boolean,
        }
    }
}

/// Typed output wrapper for skill execution
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SkillOutput {
    Text(String),
    Json(Value),
    Number(f64),
    Boolean(bool),
}

impl SkillOutput {
    pub fn text(value: impl Into<String>) -> Self {
        SkillOutput::Text(value.into())
    }

    #[allow(dead_code)]
    pub fn json(value: Value) -> Self {
        SkillOutput::Json(value)
    }

    #[allow(dead_code)]
    pub fn number(value: f64) -> Self {
        SkillOutput::Number(value)
    }

    pub fn boolean(value: bool) -> Self {
        SkillOutput::Boolean(value)
    }

    pub fn as_text(&self) -> Option<&str> {
        match self {
            SkillOutput::Text(s) => Some(s),
            _ => None,
        }
    }

    #[allow(dead_code)]
    pub fn io_type(&self) -> super::capability::SkillIOType {
        match self {
            SkillOutput::Text(_) => super::capability::SkillIOType::Text,
            SkillOutput::Json(_) => super::capability::SkillIOType::Json,
            SkillOutput::Number(_) => super::capability::SkillIOType::Number,
            SkillOutput::Boolean(_) => super::capability::SkillIOType::Boolean,
        }
    }

    /// Wrap output with confidence scoring (The Dial pattern)
    pub fn with_confidence(
        self,
        confidence: f32,
        reasoning: Option<String>,
    ) -> super::capability::SkillResult {
        use serde_json::Value;
        let output = match self {
            SkillOutput::Text(s) => Value::String(s),
            SkillOutput::Json(v) => v,
            SkillOutput::Number(n) => Value::Number(serde_json::Number::from_f64(n).unwrap_or(serde_json::Number::from(0))),
            SkillOutput::Boolean(b) => Value::Bool(b),
        };
        super::capability::SkillResult {
            output,
            confidence,
            confidence_level: ConfidenceLevel::from_score(confidence),
            reasoning,
            warnings: Vec::new(),
            metadata: None,
        }
    }
}
