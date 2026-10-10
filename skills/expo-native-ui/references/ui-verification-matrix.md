# Expo native UI verification matrix

Use this reference before shipping a screen or reusable component. Verify behavior on the supported iOS, Android, and web targets; document intentional platform differences.

## UI and accessibility cases

| Area | Expected result |
|---|---|
| Safe area and keyboard | Content and controls remain reachable with notches, insets, and keyboard open |
| Dynamic type/font scaling | Text remains readable without clipping or overlap |
| Dark mode/high contrast | Semantic colors maintain contrast and state meaning |
| Screen reader | Labels, roles, values, focus order, and error announcements are meaningful |
| Touch targets | Interactive controls meet the project’s minimum target and have visible pressed state |
| Reduced motion | Nonessential motion is reduced or disabled without losing state feedback |
| Loading/error/empty | Each state is visible, actionable, and does not shift layout unexpectedly |
| Orientation/responsive | Layout works at supported widths and orientations |
| Platform behavior | iOS, Android, and web differences are tested or explicitly documented |
| Visual regression | Key states are compared against approved screenshots or design criteria |

## Evidence checklist

Capture target SDK, device/simulator size, color scheme, font scale, accessibility settings, state fixture, and known deviations. Pair visual checks with semantic/accessibility checks; a screenshot alone cannot prove keyboard, focus, or screen-reader behavior.

## Verification packet examples

| Case | Claim and criteria | Evidence required | Status rule |
|---|---|---|---|
| Supported target set | Safe area, keyboard, dynamic type, semantics, touch targets, motion, states, and responsive layout work on supported targets | Device matrix, semantic assertions, state fixtures, and approved visual comparison | `pass` only when intentional deviations are documented and accepted |
| Keyboard/focus failure | Form remains reachable and announces errors correctly | Device/accessibility run showing keyboard, focus order, and announcement result | `block` when a screenshot passes but semantic or keyboard criteria fail |
| Visual approval pending | Automated semantics pass and final visual review is still required | Automated report plus named reviewer/question | `defer` until the named human decision is recorded |

Package `Claim`, `Criteria`, `Evidence`, `Coverage map`, `Limitations`, `Decision`, and `Next owner` for `sk-verify-pro`.
