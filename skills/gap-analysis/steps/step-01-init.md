# Initialize task

Confirm the requested mode, scope, inputs, task id, and output path. Inspect available project artifacts before making assumptions. Create `artifacts/<task-id>/PROGRESS.md` and mark this phase `in_progress`.

## Completion check

- Record the facts and evidence produced in this phase.
- Keep the output under `artifacts/<task-id>/` unless the user specifies another path.
- Stop with `blocked` when required input or verification is missing.
