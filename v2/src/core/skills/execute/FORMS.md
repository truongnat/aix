# Execute — Form-Filling Guide

How to use `scripts/log-task.sh` against `assets/task-log-template.md` to satisfy the `Output Contract` in `SKILL.md`.

## One row per task attempt

Log a row every time a task's verification step actually runs — including a failed attempt. A log with only passing rows hides how many tries it took.

## Evidence column

Name the concrete proof: a test name and result, a command and its output, not "checked manually" unless that really is all that's possible for this task.

## Status column

Use exactly one of: `done`, `failed`, `blocked`. Don't invent softer statuses ("mostly done", "should be fine") — those belong in `verify`'s claim language, not in this log.

## Validation

A log entry is acceptable only if it names a real verification step and an evidence note, not a restatement of the task description.
