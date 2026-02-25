use std::collections::HashMap;

use crate::skill::io::SkillOutput;
use anyhow::{anyhow, Result};

/// Evaluate a condition string like "{{step_id}} == true" or "{{step_id}} == false"
pub fn evaluate_condition(
    condition: &str,
    step_results: &HashMap<String, SkillOutput>,
) -> Result<bool> {
    let condition = condition.trim();

    // Parse "{{step_id}} == true" or "{{step_id}} == false"
    if let Some(pos) = condition.find("==") {
        let left = condition[..pos].trim();
        let right = condition[pos + 2..].trim();

        // Extract step_id from {{step_id}}
        if !left.starts_with("{{") || !left.ends_with("}}") {
            return Err(anyhow!("Invalid condition syntax: expected {{step_id}}"));
        }

        let step_id = &left[2..left.len() - 2];

        // Look up the step result
        let output = step_results
            .get(step_id)
            .ok_or_else(|| anyhow!("Condition references unknown step '{}'", step_id))?;

        // Check it's a boolean
        if let SkillOutput::Boolean(b) = output {
            match right {
                "true" => return Ok(*b),
                "false" => return Ok(!*b),
                _ => {
                    return Err(anyhow!(
                        "Invalid condition: expected 'true' or 'false', got '{}'",
                        right
                    ))
                }
            }
        } else {
            return Err(anyhow!(
                "Condition step '{}' must output Boolean, got {:?}",
                step_id,
                output.io_type()
            ));
        }
    }

    Err(anyhow!("Invalid condition syntax: {}", condition))
}
