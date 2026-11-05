# Human-in-the-Loop

## Approval gates

- **When**: Destructive actions (delete, modify, send email, transfer funds).
- **UI**: Modal or inline card with action summary + Approve / Reject / Edit buttons.
- **Timeout**: If no response in N minutes, auto-reject or escalate.

## Correction loops

- **When**: Agent output needs refinement before application.
- **UI**: Editable preview with Accept / Edit / Regenerate options.
- **State**: User edits are fed back to the agent as additional context.

## Override

- **When**: User wants to bypass the agent and act manually.
- **UI**: Clear "Manual mode" toggle or button.
- **State**: Agent pauses; user takes control; can resume later.

## Best practices

- Make approval gates visually prominent and hard to miss.
- Show what will happen if approved (preview, diff, or summary).
- Log all HITL interactions for audit and compliance.
