# Discussion

## Goal Clarification

Add Google login as an optional sign-in path without degrading or hiding the existing guest experience.

## Constraints

- Guest mode must remain available from the same sign-in surface.
- No backend redesign is in scope for this change.
- The app must still work for users who never authenticate.

## Options Considered

### Option 1

- Summary: Replace guest mode with mandatory Google login.
- Tradeoffs: Simpler auth story, but violates the preserved guest-mode requirement.

### Option 2

- Summary: Add Google login alongside the current guest entry point.
- Tradeoffs: Slightly more UI and auth wiring, but preserves current product behavior.

## Agreed Direction

Use option 2. Keep "Continue as guest" visible and unchanged while adding a separate "Continue with Google" path.

## Open Questions

- [ ] Does the signed-in path need any one-time onboarding after Google auth?
