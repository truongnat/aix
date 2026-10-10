# Accessibility audit and remediation matrix

| Priority | Example | Required evidence |
|---|---|---|
| Blocker | Keyboard trap, inaccessible primary action, severe name/role/value failure | Reproduction, affected flow, fix, keyboard/screen-reader retest |
| High | Missing form association, incorrect focus return, contrast failure on essential text | WCAG criterion, screenshot/AT evidence, regression test |
| Medium | Heading/landmark order, redundant label, non-critical announcement issue | Semantic inspection and targeted test |
| Low | Enhancement for clarity or preference support | Rationale and follow-up owner |

Audit sequence: inventory templates/components, run automated scan, manually test keyboard and focus, test at least one screen reader, check zoom/reflow and contrast, triage by user impact, fix root component, then rerun the same scenarios. Record tool/browser/AT versions and do not claim full compliance from an automated score alone.
