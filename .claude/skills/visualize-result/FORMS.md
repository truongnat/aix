# Visualize-Result — Form-Filling Guide

How to build the call to `confirmVisualResult` (from `.ai-harness/tools/preview`) so it satisfies the `Output Contract` in `SKILL.md`. You generate the HTML; this guide covers the inputs and the contract you must honor.

## title

What is being confirmed, specifically. "New --help output matches the plan" — not "Confirm".

## bodyHtml

The comparison page you generate, following `.ai-harness/tools/preview/references/design-guide.md`:

- Show the **expected** state (from the plan/brief, verbatim where possible) and the **actual** state (real captured output), side by side — don't paraphrase either into something easier to match.
- Use real captured content, not summaries — command output, rendered file, the actual diff.
- Include one `id="confirm"` control and one `id="reject"` control; the engine wires them. Reject prompts the user for a reason automatically.
- Use only the bundled class vocabulary. Don't add `<style>`, external stylesheets, `<head>`, scripts, or a done banner — the engine's shell provides those.

## Recording the decision

`confirmVisualResult` resolves with `{ confirmed, reason? }`. Record it in the artifact the calling skill reads next — the plan's `Confirmation` checklist, or a verify report — as an explicit yes/no plus the reason on a no. A decision that only exists in chat history is not recorded.

## Validation

A run is acceptable only if both expected and actual were shown from real content, the body had `#confirm` and `#reject`, and an explicit `{ confirmed, reason? }` got recorded.
