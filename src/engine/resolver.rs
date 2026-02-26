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
            let text = skill_output_to_interpolated_text(output);

            resolved = format!("{}{}{}", &resolved[..start], text, &resolved[end + 2..]);
            start_idx = start;
        } else {
            break;
        }
    }

    Ok(SkillInput::Text(resolved))
}

fn skill_output_to_interpolated_text(output: &SkillOutput) -> String {
    match output {
        SkillOutput::Text(value) => value.clone(),
        SkillOutput::Json(value) => value.to_string(),
        SkillOutput::Number(value) => value.to_string(),
        SkillOutput::Boolean(value) => value.to_string(),
    }
}

#[cfg(test)]
mod tests {
    use super::resolve_input;
    use crate::skill::io::SkillOutput;
    use serde_json::json;
    use std::collections::{HashMap, HashSet};

    #[test]
    fn interpolation_supports_json_output_by_stringifying() {
        let results = HashMap::from([("scan".to_string(), SkillOutput::json(json!({"count": 2})))]);
        let completed = HashSet::from(["scan".to_string()]);
        let resolved = resolve_input("conflicts={{scan}}", &results, &completed).expect("resolve");
        assert_eq!(resolved.as_text(), Some("conflicts={\"count\":2}"));
    }
}
