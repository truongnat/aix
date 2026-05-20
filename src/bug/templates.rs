use super::types::{BugSignals, LoadedBugInput};

pub(crate) fn render_analysis(input: &LoadedBugInput, signals: &BugSignals) -> String {
    let mut out = Vec::new();
    out.push(format!(
        "Summary\n{}\n",
        numbered_block(&signals.summary, "Ticket needs structured bug triage.")
    ));
    out.push(format!(
        "Current behavior\n{}\n",
        numbered_block(
            &signals.current_behavior,
            "Current behavior is not stated explicitly in the input."
        )
    ));
    out.push(format!(
        "Expected behavior\n{}\n",
        numbered_block(
            &signals.expected_behavior,
            "Expected behavior is not stated explicitly in the input."
        )
    ));
    out.push(format!(
        "Reproduction steps\n{}\n",
        numbered_block(
            &signals.reproduction_steps,
            "Reproduction steps need to be confirmed with the reporter."
        )
    ));
    out.push(format!(
        "Impact\n{}\n",
        numbered_block(&signals.impact, "Impact still needs blast-radius confirmation.")
    ));
    out.push(format!(
        "Suspected root cause\n{}\n",
        numbered_block(
            &signals.suspected_root_cause,
            "Root cause is not yet clear from the input."
        )
    ));
    out.push(format!(
        "Evidence from input\n{}\n",
        numbered_block(
            &signals.evidence,
            "No explicit logs or error signatures were captured in the input."
        )
    ));
    out.push(format!(
        "Missing information\n{}\n",
        numbered_block(
            &signals.missing_information,
            "Input already contains the minimum information for first-pass investigation."
        )
    ));
    out.push(format!(
        "Suggested investigation points\n{}\n",
        numbered_block(
            &signals.investigation_points,
            "Start from local reproduction and add a precise failing trace."
        )
    ));
    out.push(format!("Risk level\n1. {}\n", signals.risk_level));
    out.push(format!(
        "Context\n1. Source file: `{}`\n2. Detected languages: {}\n3. Local deterministic mode: enabled by default\n",
        input.path.display(),
        if signals.languages.is_empty() {
            "unknown".to_string()
        } else {
            signals.languages.join(", ")
        }
    ));
    out.join("\n")
}

pub(crate) fn render_plan(_input: &LoadedBugInput, signals: &BugSignals) -> String {
    let mut out = Vec::new();
    out.push(format!(
        "Step-by-step investigation\n{}\n",
        numbered_from_iter(
            [
                "Reproduce the issue using the original ticket conditions and preserve the first failing request/log.",
                "Confirm whether the failure is frontend-only, backend-only, or contract mismatch between both sides.",
                "Trace the first failing module, endpoint, or query before proposing a fix.",
                "Implement the smallest fix that restores expected behavior, then rerun the affected path.",
            ]
        )
    ));
    out.push(format!(
        "Files/modules likely to check\n{}\n",
        numbered_block(
            &signals.file_paths,
            "No file paths are referenced yet; start from the entrypoint that owns the failing flow."
        )
    ));
    out.push(format!(
        "DB/API/log points to verify\n{}\n",
        numbered_block(
            &merge_for_checks(signals),
            "Need concrete request logs, endpoint traces, or DB checks to narrow the failure."
        )
    ));
    out.push(format!(
        "Proposed fix direction\n{}\n",
        numbered_block(
            &signals.suspected_root_cause,
            "Fix direction should stay minimal and focused on the first verified failing point."
        )
    ));
    out.push(format!(
        "Validation checklist\n{}\n",
        numbered_from_iter([
            "Original repro path passes.",
            "Relevant logs no longer show the same signature.",
            "Related edge case around empty/null/missing data is covered.",
            "A focused test or deterministic manual check is added.",
        ])
    ));
    out.push(format!("Regression risk\n1. {}\n", signals.risk_level));
    out.push(format!(
        "Suggested priority\n1. {}\n",
        if signals.risk_level == "High" {
            "P1 - blocks a critical flow or indicates backend failure."
        } else if signals.risk_level == "Medium" {
            "P2 - should be handled soon because the flow is partially broken."
        } else {
            "P3 - can be scheduled after confirming business impact."
        }
    ));
    out.join("\n")
}

pub(crate) fn render_reply(input: &LoadedBugInput, signals: &BugSignals) -> String {
    let summary = signals
        .summary
        .first()
        .cloned()
        .unwrap_or_else(|| "The issue is under investigation.".to_string());
    let current = signals
        .current_behavior
        .first()
        .cloned()
        .unwrap_or_else(|| "Observed behavior still needs confirmation.".to_string());
    let missing = signals
        .missing_information
        .first()
        .cloned()
        .unwrap_or_else(|| "No blocking clarification at the moment.".to_string());

    format!(
        "Vietnamese summary\n1. Bọn mình đã tiếp nhận ticket từ `{}`.\n2. Tóm tắt nhanh: {}.\n3. Hiện tại đang thấy: {}.\n4. Bước tiếp theo là tái hiện lỗi, kiểm tra log/API/DB liên quan, rồi chốt hướng fix nhỏ nhất.\n\nJapanese business-style reply\n1. ご連絡ありがとうございます。本件を確認しました。\n2. 現時点では「{}」という事象を把握しています。\n3. まず再現条件と関連ログを確認し、影響範囲と根本原因を切り分けます。\n4. 追加で必要な情報が判明した場合は、改めてご連絡いたします。\n\nShort confirmation message\n1. Đã nhận ticket và đang điều tra. Sẽ update ngay khi chốt được reproduction và root cause.\n\nClarification questions if needed\n1. {}\n2. Nếu có thể, vui lòng gửi thêm log đầy đủ, request payload, và bước tái hiện chính xác.",
        input.path.display(),
        summary,
        current,
        current,
        missing
    )
}

pub(crate) fn render_prompt(_input: &LoadedBugInput, signals: &BugSignals) -> String {
    let summary = signals.summary.join(" ");
    let current = signals.current_behavior.join(" ");
    let expected = if signals.expected_behavior.is_empty() {
        "Expected behavior needs confirmation from the ticket reporter.".to_string()
    } else {
        signals.expected_behavior.join(" ")
    };

    format!(
        "You are fixing a bug in the current repository.\n\nBug summary\n{}\n\nCurrent behavior\n{}\n\nExpected behavior\n{}\n\nInvestigation target\n{}\n\nFix constraints\n- Keep the fix minimal and deterministic.\n- Do not add unrelated refactors.\n- Preserve existing commands and workflows.\n- Prefer adding focused tests for the verified bug path.\n\nAcceptance criteria\n- The original failure path behaves as expected.\n- The root cause is addressed, not hidden.\n- Existing affected commands/tests still pass.\n- Any new test or validation clearly covers the reported scenario.\n\nTest checklist\n- Reproduce before fix.\n- Verify after fix.\n- Check nearby regression path.\n- Confirm logs/errors no longer show the same signature.\n",
        if summary.is_empty() {
            "Ticket requires bug triage before implementation.".to_string()
        } else {
            summary
        },
        current,
        expected,
        numbered_inline(&signals.investigation_points, "Start from the first deterministic failing step.")
    )
}

fn numbered_block(items: &[String], fallback: &str) -> String {
    if items.is_empty() {
        return format!("1. {}", fallback);
    }
    numbered_from_iter(items.iter().map(String::as_str))
}

fn numbered_inline(items: &[String], fallback: &str) -> String {
    if items.is_empty() {
        fallback.to_string()
    } else {
        items.join(" ")
    }
}

fn numbered_from_iter<I, S>(items: I) -> String
where
    I: IntoIterator<Item = S>,
    S: AsRef<str>,
{
    let mut out = Vec::new();
    for (index, item) in items.into_iter().enumerate() {
        out.push(format!("{}. {}", index + 1, item.as_ref()));
    }
    out.join("\n")
}

fn merge_for_checks(signals: &BugSignals) -> Vec<String> {
    let mut items = Vec::new();
    items.extend(signals.api_points.iter().map(|item| format!("API: `{}`", item)));
    items.extend(signals.db_points.iter().cloned());
    items.extend(
        signals
            .error_signatures
            .iter()
            .map(|item| format!("Log/Error signature: {}", item)),
    );
    items
}

#[cfg(test)]
mod tests {
    use super::{render_analysis, render_prompt};
    use crate::bug::analyzer::analyze_input;
    use crate::bug::types::LoadedBugInput;

    #[test]
    fn analyze_output_contains_required_sections() {
        let input = LoadedBugInput {
            path: "sample.md".into(),
            raw: "# Bug\nCurrent: API returns 500\nExpected: success\n".to_string(),
            lines: vec![
                "# Bug".to_string(),
                "Current: API returns 500".to_string(),
                "Expected: success".to_string(),
            ],
        };
        let signals = analyze_input(&input);
        let rendered = render_analysis(&input, &signals);
        for section in [
            "Summary",
            "Current behavior",
            "Expected behavior",
            "Reproduction steps",
            "Impact",
            "Suspected root cause",
            "Evidence from input",
            "Missing information",
            "Suggested investigation points",
            "Risk level",
        ] {
            assert!(rendered.contains(section), "missing section {}", section);
        }
    }

    #[test]
    fn prompt_output_contains_acceptance_criteria() {
        let input = LoadedBugInput {
            path: "sample.md".into(),
            raw: "GET /api/orders 500".to_string(),
            lines: vec!["GET /api/orders 500".to_string()],
        };
        let signals = analyze_input(&input);
        let rendered = render_prompt(&input, &signals);
        assert!(rendered.contains("Acceptance criteria"));
        assert!(rendered.contains("Test checklist"));
    }
}
