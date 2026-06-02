# Demo Harness Build: Flutter Google Login

This directory is an example output of `harness-build` for the north-star request:

“Add Google login to a Flutter app while preserving guest mode.”

It is not a real Flutter app. It is a markdown-only harness profile example with no secrets, tokens, credentials, customer data, or private business data.

## Read Order

1. [PROJECT.md](PROJECT.md)
2. [HARNESS.md](HARNESS.md)
3. [TEAM.md](TEAM.md)
4. [SKILLS.md](SKILLS.md)
5. [WORKFLOW.md](WORKFLOW.md)
6. [GATES.md](GATES.md)
7. [MEMORY.md](MEMORY.md)
8. [goals/google-login/GOAL.md](goals/google-login/GOAL.md)
9. [goals/google-login/PLAN.md](goals/google-login/PLAN.md)
10. [goals/google-login/TASKS.md](goals/google-login/TASKS.md)
11. [goals/google-login/VERIFY.md](goals/google-login/VERIFY.md)
12. [goals/google-login/REMEMBER.md](goals/google-login/REMEMBER.md)

## Example Layout vs Target Repo Layout

This directory lives under `examples/harness-build/flutter-google-login/` in the **source pack** for demonstration and documentation.

In a **real target repository** after install:

- create profile artifacts under `.harness/` (not under `examples/`)
- create goal artifacts under `.harness/goals/<goal-id>/` (not under `examples/.../goals/`)

`node validate.js --target <path>` checks `.harness/` contracts in the target repo. It does not validate this example tree path.

See [docs/harness-example-to-target-layout.md](../../../docs/harness-example-to-target-layout.md) for the full mapping table.

Example section shapes may be richer than the heading contracts required in target `.harness/` files. Normalize to validator contracts when adopting.

## What This Shows

- a project-specific harness profile
- selected skill packs and core skills
- a chosen team pattern with justification
- a feature workflow
- memory rules for auth and guest-mode work
- quality gates and expected evidence
- one goal-level artifact set for the Google login feature
