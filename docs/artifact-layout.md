# Artifact Layout

Host repositories should keep harness artifacts in `.harness/`.

## Expected Layout

```text
.harness/
  PROJECT.md
  REQUIREMENTS.md
  ROADMAP.md
  DECISIONS.md
  HAZARDS.md
  INDEX.md
  STATE.md
  CONTEXT.md
  GOAL.md
  DISCUSSION.md
  PLAN.md
  TASKS.md
  REVIEW.md
  VERIFY.md
  SHIP.md
  REMEMBER.md
  goals/
  *.local.md
```

## Artifact Roles

- `PROJECT.md`: stable project identity, mission, constraints, and quality bar
- `REQUIREMENTS.md`: active requirements and success criteria
- `ROADMAP.md`: phase and direction
- `DECISIONS.md`: durable project decisions that future work should recall
- `HAZARDS.md`: recurring risks, fragile areas, and regression-prone paths
- `INDEX.md`: reusable commands, verification recipes, and memory lookup pointers
- `STATE.md`: current status and next action
- `CONTEXT.md`: relevant files, systems, and risks
- `GOAL.md`: the active task goal
- `DISCUSSION.md`: clarified tradeoffs and decisions before planning
- `PLAN.md`: ordered execution plan
- `TASKS.md`: live task tracking
- `REVIEW.md`: findings and residual risk
- `VERIFY.md`: evidence and verification status
- `SHIP.md`: final summary and handoff
- `REMEMBER.md`: goal-level durable lessons before promotion into shared memory

## Memory Split

- `MEMORY.md` remains the profile-level memory policy when a repository uses the harness workflow.
- `DECISIONS.md`, `HAZARDS.md`, and `INDEX.md` are the operational shared-memory artifacts that command workflows should recall directly.
- goal-level `REMEMBER.md` remains the place for per-goal lessons before promoting durable items upward.

## Local And Sensitive Data

- `.harness/*.local.md` is for local-only notes that should not become shared operating state.
- Do not store secrets, credentials, tokens, customer data, or private business data in any harness artifact.

## Layout Principle

Artifacts should live next to the code they govern so agents and humans can review them in the same repository without extra infrastructure.
