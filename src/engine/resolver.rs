use std::collections::HashMap;

use crate::skill::io::{SkillInput, SkillOutput};
use anyhow::{anyhow, Result};

/// Resolve step references in input strings.
/// Syntax: {{step_id}} - references the output of a previous step.
/// If the input is EXACTLY {{step_id}}, returns the raw output of that step.
/// Otherwise, interpolates into a string.
pub fn resolve_input(
    raw_input: &str,
    step_results: &HashMap<String, SkillOutput>,
    completed_steps: &std::collections::HashSet<String>,
) -> Result<SkillInput> {
    let trimmed = raw_input.trim();

    // Check for exact reference pattern: {{id}}
    if trimmed.starts_with("{{")
        && trimmed.ends_with("}}")
        && !trimmed[2..trimmed.len() - 2].contains("{{")
    {
        let reference = &trimmed[2..trimmed.len() - 2].trim();

        if !step_results.contains_key(*reference) {
            return Err(anyhow!("Reference to unknown step '{}'", reference));
        }

        if !completed_steps.contains(*reference) {
            return Err(anyhow!(
                "Cannot reference step '{}' - it has not been executed yet.",
                reference
            ));
        }

        let output = step_results.get(*reference).unwrap();
        // Return raw output as input
        return Ok(SkillInput::from(output.clone()));
    }

    // String interpolation case
    let mut resolved = raw_input.to_string();
    let mut start_idx = 0;
    while let Some(start) = resolved[start_idx..].find("{{") {
        let start = start_idx + start;
        if let Some(end) = resolved[start..].find("}}") {
            let end = start + end;
            let reference = &resolved[start + 2..end].trim();

            if !step_results.contains_key(*reference) {
                return Err(anyhow!("Reference to unknown step '{}'", reference));
            }

            if !completed_steps.contains(*reference) {
                return Err(anyhow!(
                    "Cannot reference step '{}' - not yet executed.",
                    reference
                ));
            }

            let output = step_results.get(*reference).unwrap();
            let text = output.as_text().ok_or_else(|| {
                anyhow!(
                    "Cannot interpolate non-text output from step '{}' into a string",
                    reference
                )
            })?;

            resolved = format!("{}{}{}", &resolved[..start], text, &resolved[end + 2..]);
            start_idx = start;
        } else {
            break;
        }
    }

    Ok(SkillInput::Text(resolved))
}
