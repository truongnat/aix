# Mobile Pack

## Purpose

Route Flutter, React Native, and native mobile work toward the most relevant core skills, commands, and checks.

## When To Use

- Flutter, React Native, iOS, or Android tasks
- permissions, login flows, guest flows, offline behavior
- app lifecycle or platform-specific behavior

## Recommended Core Skills

- `mapping-codebase`
- `writing-plans`
- `executing-plans`
- `verification`
- `code-review`

## Recommended Commands

- `harness-map`
- `harness-discuss`
- `harness-plan`
- `harness-run`
- `harness-verify`

## Key Checks

- platform-specific behavior
- permissions and lifecycle handling
- offline, guest, and login flows
- widget or navigation regressions

## Common Failure Modes

| Failure | Symptom | Detection |
| --- | --- | --- |
| Permission path gap | happy path works, denial path crashes or dead-ends | simulator/device permission toggle |
| Lifecycle regression | app resumes into broken or stale state | background and resume manual check |
| Offline flow break | login or cached views fail without network | network-disabled device or simulator run |
| Navigation regression | back stack, deep link, or modal flow breaks | targeted manual flow or integration test |
| Platform mismatch | Android works, iOS breaks, or vice versa | check both platform-specific code paths |

## Verification Expectations

- targeted tests where available
- simulator or device checks when relevant
- manual flow validation for login, guest, and lifecycle-sensitive behavior

## Verification Strategy

- Run the smallest targeted test suite that covers the changed screen or module.
- Manually verify permission-denied, offline, and resume scenarios when affected.
- Check guest, login, or onboarding flows when auth-sensitive UI changed.
- Record which platform paths were checked and which remain gaps.
- Capture device or simulator evidence for lifecycle-sensitive fixes.

## Anti-Rationalization

| Shortcut agents take | Counter |
| --- | --- |
| "It works on iOS, Android is probably fine" | Platform-specific code paths diverge often; verify the affected platform explicitly. |
| "Permissions are a manual QA problem" | If the change touches the permission path, it is part of engineering verification. |
| "Offline is edge-case only" | Offline and resume bugs are common mobile regressions; check them when affected. |
| "The simulator is enough for every case" | Some lifecycle and permission behaviors need device-aware evidence or an explicit gap note. |

## When Not To Use

- backend-only work
- infra-only work
- documentation-only changes

## Notes

Mobile work often needs explicit manual flow checks even when automated tests exist.
