# Frontend Pack

## Purpose

Route UI and browser-facing work toward the most relevant core skills, commands, and checks.

## When To Use

- UI, React, Next.js, forms, component behavior
- client-side state and loading/error UX
- responsive behavior or visual regressions

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

- component boundaries
- accessibility basics
- loading and error states
- responsive behavior
- user-visible regressions

## Common Failure Modes

| Failure | Symptom | Detection |
| --- | --- | --- |
| Missing loading state | UI freezes or flashes empty content | manual interaction or component test |
| Missing error state | network failure shows broken UI or silent no-op | force failing fetch or mocked error response |
| Accessibility regression | keyboard or screen-reader flow breaks | tab order, labels, and semantic role checks |
| Responsive breakage | layout clips, overlaps, or becomes unusable on narrow screens | mobile viewport check |
| State desync | UI looks updated but underlying state is stale | interaction test plus assertion on final state |

## Verification Expectations

- targeted tests where available
- typecheck or lint if the host repo uses them
- manual or visual checks when behavior is UI-heavy

## Verification Strategy

- Test the changed component or route at the narrowest useful level.
- Check loading, success, empty, and error states for any async UI change.
- Verify keyboard navigation and accessible labels on interactive elements.
- Check at least one mobile-width and one desktop-width layout when visuals changed.
- Record manual or visual evidence when automated coverage cannot prove the UI behavior.

## Anti-Rationalization

| Shortcut agents take | Counter |
| --- | --- |
| "The component renders, so it is fine" | Render success says nothing about loading, error, or keyboard behavior. |
| "Responsive issues can wait" | User-visible breakage on mobile is still a regression; check it now. |
| "Accessibility is a follow-up" | If the change touched interaction, accessibility is part of correctness. |
| "A screenshot is enough" | Static screenshots do not prove state transitions or interaction behavior. |

## When Not To Use

- backend-only or infrastructure-only tasks
- purely process or documentation work with no UI surface

## Notes

Use this pack as a routing guide, then apply the core harness skills and command loop.
