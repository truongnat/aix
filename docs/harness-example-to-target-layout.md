# Harness Example To Target Layout

## Purpose

Explain how source-pack examples under `examples/` relate to the `.harness/` layout that target repositories must use for structural validation.

## Why Examples Use examples/

The harness source pack keeps demonstration profiles and goals under `examples/` so:

- the source repository can validate its own teaching material
- adopters can read a full shape without installing first
- dogfood and docs can point at a north-star scenario (for example flutter-google-login)

Examples are not the installed operating layout for a real product repository.

## Target Repo Layout

In a target repository after install:

- profile artifacts live under `.harness/` at the repository root
- goal artifacts live under `.harness/goals/<goal-id>/`
- `AGENTS.md` and installed commands, skills, workflows, patterns, and templates live at the paths copied by `install.js`

Structural validation with `node validate.js --target <path>` checks this target layout, not the `examples/` tree.

## Mapping Table

Use this table when translating [flutter-google-login](../examples/harness-build/flutter-google-login/) (or similar examples) into a target repo.

| Example path (source pack) | Target repo path |
|---|---|
| `examples/harness-build/flutter-google-login/HARNESS.md` | `.harness/HARNESS.md` |
| `examples/harness-build/flutter-google-login/TEAM.md` | `.harness/TEAM.md` |
| `examples/harness-build/flutter-google-login/SKILLS.md` | `.harness/SKILLS.md` |
| `examples/harness-build/flutter-google-login/WORKFLOW.md` | `.harness/WORKFLOW.md` |
| `examples/harness-build/flutter-google-login/GATES.md` | `.harness/GATES.md` |
| `examples/harness-build/flutter-google-login/MEMORY.md` | `.harness/MEMORY.md` |
| `examples/harness-build/flutter-google-login/goals/google-login/GOAL.md` | `.harness/goals/google-login/GOAL.md` |
| `examples/harness-build/flutter-google-login/goals/google-login/PLAN.md` | `.harness/goals/google-login/PLAN.md` |
| `examples/harness-build/flutter-google-login/goals/google-login/TASKS.md` | `.harness/goals/google-login/TASKS.md` |
| `examples/harness-build/flutter-google-login/goals/google-login/VERIFY.md` | `.harness/goals/google-login/VERIFY.md` |
| `examples/harness-build/flutter-google-login/goals/google-login/REMEMBER.md` | `.harness/goals/google-login/REMEMBER.md` |

## Common Mistakes

- copying example files into the target repo without moving them under `.harness/`
- expecting `node validate.js` inside the target repo when `validate.js` was not installed (run from the source pack with `--target`)
- using example-only section shapes that do not match validator heading contracts (normalize to `.harness/` contracts)
- treating the source pack `examples/` directory as the product work tree

## Validation Commands

Run from the **harness source pack** root:

```bash
node validate.js --target ../my-project --profile-only
node validate.js --target ../my-project --goal <goal-id>
```

See [target-repo-validation.md](target-repo-validation.md) and [install-to-profile-walkthrough.md](install-to-profile-walkthrough.md).
