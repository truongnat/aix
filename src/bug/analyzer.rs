use super::types::{BugSignals, LoadedBugInput};
use regex::Regex;
use std::collections::BTreeSet;

pub(crate) fn analyze_input(input: &LoadedBugInput) -> BugSignals {
    let file_regex = Regex::new(
        r"(?P<path>[A-Za-z0-9_./-]+\.(rs|go|ts|tsx|js|jsx|py|java|kt|swift|dart|sql|yml|yaml|json|md))",
    )
    .expect("file regex");
    let api_regex =
        Regex::new(r"(/[A-Za-z0-9._~!$&'()*+,;=:@%-]+){1,}").expect("api regex");
    let db_regex =
        Regex::new(r"\b(select|insert|update|delete|from|where|join|table|column|index|migration)\b")
            .expect("db regex");

    let mut signals = BugSignals::default();
    let mut languages = BTreeSet::new();

    for raw_line in &input.lines {
        let line = raw_line.trim();
        if line.is_empty() {
            continue;
        }

        if signals.title.is_none() {
            if let Some(title) = extract_title(line) {
                signals.title = Some(title);
            }
        }

        if contains_japanese(line) {
            languages.insert("ja".to_string());
            push_unique(&mut signals.japanese_lines, line.to_string(), 4);
        }
        if contains_vietnamese_markers(line) {
            languages.insert("vi".to_string());
        }
        if line.is_ascii() {
            languages.insert("en".to_string());
        }

        if is_error_or_log_line(line) {
            signals.has_logs = true;
            push_unique(&mut signals.evidence, line.to_string(), 6);
        }

        if looks_like_summary(line) {
            push_unique(&mut signals.summary, cleanup_line(line), 3);
        }
        if looks_like_current_behavior(line) {
            push_unique(&mut signals.current_behavior, cleanup_line(line), 4);
        }
        if looks_like_expected_behavior(line) {
            push_unique(&mut signals.expected_behavior, cleanup_line(line), 4);
        }
        if looks_like_repro_step(line) {
            push_unique(&mut signals.reproduction_steps, cleanup_line(line), 5);
        }
        if looks_like_impact(line) {
            push_unique(&mut signals.impact, cleanup_line(line), 4);
        }

        for cap in file_regex.captures_iter(line) {
            push_unique(
                &mut signals.file_paths,
                cap["path"].trim_matches(&['`', '"', '\''][..]).to_string(),
                6,
            );
        }
        for cap in api_regex.captures_iter(line) {
            let value = cap[0].to_string();
            if value.len() > 1
                && value.matches('/').count() >= 1
                && !looks_like_file_path_endpoint(&value)
            {
                push_unique(&mut signals.api_points, value, 6);
            }
        }
        if db_regex.is_match(&line.to_ascii_lowercase()) {
            push_unique(
                &mut signals.db_points,
                "Check DB query, schema, and migration assumptions".to_string(),
                3,
            );
        }
        if let Some(signature) = extract_error_signature(line) {
            push_unique(&mut signals.error_signatures, signature, 5);
        }
    }

    if signals.summary.is_empty() {
        if let Some(title) = signals.title.as_ref() {
            signals.summary.push(title.clone());
        } else {
            signals
                .summary
                .push("Input contains a bug/ticket report that needs structured triage.".to_string());
        }
    }
    if signals.current_behavior.is_empty() {
        if !signals.error_signatures.is_empty() {
            signals.current_behavior.push(format!(
                "Observed failure signatures: {}.",
                signals.error_signatures.join(", ")
            ));
        } else {
            signals
                .current_behavior
                .push("Current behavior is not stated explicitly in the input.".to_string());
        }
    }
    if signals.expected_behavior.is_empty() {
        signals
            .missing_information
            .push("Expected behavior is not clearly stated.".to_string());
    }
    if signals.reproduction_steps.is_empty() {
        signals
            .missing_information
            .push("Reproduction steps are incomplete or missing.".to_string());
    }
    if signals.file_paths.is_empty() {
        signals
            .missing_information
            .push("No concrete file/module path is referenced.".to_string());
    }
    if signals.api_points.is_empty() && signals.db_points.is_empty() && !signals.has_logs {
        signals
            .missing_information
            .push("No logs, API endpoint, or DB clue is present for technical tracing.".to_string());
    }

    build_root_cause(&mut signals);
    build_investigation_points(&mut signals);
    build_impact(&mut signals);
    signals.risk_level = determine_risk_level(&signals);
    signals.languages = languages.into_iter().collect();

    signals
}

fn extract_title(line: &str) -> Option<String> {
    if let Some(stripped) = line.strip_prefix('#') {
        let title = stripped.trim();
        if !title.is_empty() {
            return Some(title.to_string());
        }
    }
    if !is_error_or_log_line(line) && line.len() <= 120 {
        return Some(cleanup_line(line));
    }
    None
}

fn cleanup_line(line: &str) -> String {
    line.trim_start_matches(['-', '*', '>', '#', ' '])
        .trim()
        .to_string()
}

fn looks_like_summary(line: &str) -> bool {
    let lower = line.to_ascii_lowercase();
    lower.contains("summary")
        || lower.contains("issue")
        || lower.contains("bug")
        || line.contains("概要")
        || line.contains("不具合")
        || line.contains("問題")
}

fn looks_like_current_behavior(line: &str) -> bool {
    let lower = line.to_ascii_lowercase();
    lower.contains("current")
        || lower.contains("actual")
        || lower.contains("observed")
        || lower.contains("error")
        || lower.contains("failed")
        || line.contains("現象")
        || line.contains("事象")
        || line.contains("エラー")
}

fn looks_like_expected_behavior(line: &str) -> bool {
    let lower = line.to_ascii_lowercase();
    lower.contains("expected")
        || lower.contains("should")
        || lower.contains("expect")
        || line.contains("期待")
        || line.contains("あるべき")
        || line.contains("想定")
}

fn looks_like_repro_step(line: &str) -> bool {
    let lower = line.to_ascii_lowercase();
    lower == "reproduction"
        || lower == "repro"
        || lower.contains("steps")
        || (lower.contains("repro") && line.contains(':'))
        || line.contains("再現")
        || line.contains("手順")
        || Regex::new(r"^\d+[.)]\s+").expect("step regex").is_match(line)
}

fn looks_like_impact(line: &str) -> bool {
    let lower = line.to_ascii_lowercase();
    !looks_like_expected_behavior(line)
        && (lower.contains("impact")
            || Regex::new(r"\bprod(uction)?\b")
                .expect("impact prod regex")
                .is_match(&lower)
            || lower.contains("customer")
            || lower.contains("payment")
            || lower.contains("blocker")
            || line.contains("影響")
            || line.contains("顧客"))
}

fn is_error_or_log_line(line: &str) -> bool {
    let lower = line.to_ascii_lowercase();
    lower.contains("error")
        || lower.contains("exception")
        || lower.contains("traceback")
        || lower.contains("stack trace")
        || lower.contains(" 500 ")
        || lower.contains(" 404 ")
        || lower.contains("[error]")
        || lower.contains("[warn]")
        || lower.contains("nullpointer")
        || Regex::new(r"\b[45]\d{2}\b").expect("status regex").is_match(line)
}

fn extract_error_signature(line: &str) -> Option<String> {
    let trimmed = line.trim();
    if trimmed.is_empty() {
        return None;
    }
    if trimmed.contains("NullPointer") {
        return Some("NullPointer".to_string());
    }
    if trimmed.contains("undefined") {
        return Some("Undefined value access".to_string());
    }
    if Regex::new(r"\b500\b").expect("500 regex").is_match(trimmed) {
        return Some("HTTP 500".to_string());
    }
    if Regex::new(r"\b404\b").expect("404 regex").is_match(trimmed) {
        return Some("HTTP 404".to_string());
    }
    if trimmed.to_ascii_lowercase().contains("timeout") {
        return Some("Timeout".to_string());
    }
    if trimmed.to_ascii_lowercase().contains("sql") {
        return Some("SQL failure".to_string());
    }
    None
}

fn contains_japanese(line: &str) -> bool {
    line.chars().any(|ch| {
        ('\u{3040}'..='\u{30ff}').contains(&ch) || ('\u{4e00}'..='\u{9faf}').contains(&ch)
    })
}

fn contains_vietnamese_markers(line: &str) -> bool {
    line.contains('ă')
        || line.contains('â')
        || line.contains('ê')
        || line.contains('ô')
        || line.contains('ơ')
        || line.contains('ư')
        || line.contains('đ')
}

fn looks_like_file_path_endpoint(value: &str) -> bool {
    let lower = value.to_ascii_lowercase();
    let normalized = Regex::new(r":\d+$")
        .expect("line suffix regex")
        .replace(&lower, "")
        .to_string();
    [
        ".rs", ".go", ".ts", ".tsx", ".js", ".jsx", ".py", ".java", ".kt", ".swift", ".dart",
        ".sql", ".json", ".yml", ".yaml", ".md",
    ]
    .iter()
    .any(|suffix| normalized.ends_with(suffix))
}

fn build_root_cause(signals: &mut BugSignals) {
    if signals
        .error_signatures
        .iter()
        .any(|item| item.contains("HTTP 500"))
    {
        push_unique(
            &mut signals.suspected_root_cause,
            "Server-side handler is failing after request reaches the backend.".to_string(),
            4,
        );
    }
    if signals
        .error_signatures
        .iter()
        .any(|item| item.contains("HTTP 404"))
    {
        push_unique(
            &mut signals.suspected_root_cause,
            "Route mapping, environment path, or referenced resource may be missing.".to_string(),
            4,
        );
    }
    if !signals.file_paths.is_empty() {
        push_unique(
            &mut signals.suspected_root_cause,
            format!(
                "Bug likely sits near the referenced implementation paths: {}.",
                signals.file_paths.join(", ")
            ),
            4,
        );
    }
    if !signals.db_points.is_empty() {
        push_unique(
            &mut signals.suspected_root_cause,
            "Data mismatch, query assumptions, or migration drift may be involved.".to_string(),
            4,
        );
    }
    if signals.suspected_root_cause.is_empty() {
        signals
            .suspected_root_cause
            .push("Input suggests a behavior mismatch, but the technical trigger is still unclear.".to_string());
    }
}

fn build_investigation_points(signals: &mut BugSignals) {
    for path in signals.file_paths.iter().take(4) {
        push_unique(
            &mut signals.investigation_points,
            format!("Inspect implementation around `{}`.", path),
            8,
        );
    }
    for api in signals.api_points.iter().take(3) {
        push_unique(
            &mut signals.investigation_points,
            format!("Verify request/response contract for endpoint `{}`.", api),
            8,
        );
    }
    if !signals.db_points.is_empty() {
        push_unique(
            &mut signals.investigation_points,
            "Check DB records, query parameters, and recent schema/migration changes.".to_string(),
            8,
        );
    }
    if !signals.error_signatures.is_empty() {
        push_unique(
            &mut signals.investigation_points,
            format!(
                "Trace the first failing point behind signatures: {}.",
                signals.error_signatures.join(", ")
            ),
            8,
        );
    }
    if signals.investigation_points.is_empty() {
        signals
            .investigation_points
            .push("Start by reproducing locally and capturing the first deterministic failing step.".to_string());
    }
}

fn build_impact(signals: &mut BugSignals) {
    if signals.impact.is_empty() {
        if signals
            .error_signatures
            .iter()
            .any(|item| item.contains("HTTP 500"))
        {
            signals
                .impact
                .push("Request is failing at runtime and likely blocks the affected user flow.".to_string());
        } else if signals
            .error_signatures
            .iter()
            .any(|item| item.contains("HTTP 404"))
        {
            signals
                .impact
                .push("Feature cannot reach the expected route/resource, so the flow is partially broken.".to_string());
        } else {
            signals
                .impact
                .push("User-facing behavior is inconsistent and needs confirmation of blast radius.".to_string());
        }
    }
}

fn determine_risk_level(signals: &BugSignals) -> String {
    let joined = format!(
        "{} {} {}",
        signals.summary.join(" ").to_ascii_lowercase(),
        signals.impact.join(" ").to_ascii_lowercase(),
        signals.evidence.join(" ").to_ascii_lowercase()
    );
    if joined.contains("payment")
        || joined.contains("auth")
        || joined.contains("login")
        || signals
            .error_signatures
            .iter()
            .any(|item| item == "HTTP 500")
    {
        return "High".to_string();
    }
    if signals
        .error_signatures
        .iter()
        .any(|item| item == "HTTP 404" || item == "Timeout")
    {
        return "Medium".to_string();
    }
    "Low".to_string()
}

fn push_unique(target: &mut Vec<String>, value: String, max: usize) {
    if value.is_empty() || target.iter().any(|existing| existing == &value) {
        return;
    }
    if target.len() < max {
        target.push(value);
    }
}

#[cfg(test)]
mod tests {
    use super::analyze_input;
    use crate::bug::types::LoadedBugInput;

    #[test]
    fn detects_logs_and_errors() {
        let input = LoadedBugInput {
            path: "sample.md".into(),
            raw: "GET /api/orders 500 Internal Server Error\nstack trace\n".to_string(),
            lines: vec![
                "GET /api/orders 500 Internal Server Error".to_string(),
                "stack trace".to_string(),
            ],
        };

        let signals = analyze_input(&input);
        assert!(signals.has_logs);
        assert!(signals.error_signatures.iter().any(|item| item == "HTTP 500"));
        assert!(signals.api_points.iter().any(|item| item == "/api/orders"));
    }

    #[test]
    fn extracts_japanese_ticket_lines() {
        let input = LoadedBugInput {
            path: "sample.md".into(),
            raw: "不具合概要: 決済時に500エラーが発生します\n期待結果: 正常に完了すること\n".to_string(),
            lines: vec![
                "不具合概要: 決済時に500エラーが発生します".to_string(),
                "期待結果: 正常に完了すること".to_string(),
            ],
        };

        let signals = analyze_input(&input);
        assert!(!signals.japanese_lines.is_empty());
        assert!(signals.languages.iter().any(|lang| lang == "ja"));
        assert!(!signals.expected_behavior.is_empty());
    }
}
