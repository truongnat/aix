# Skills self-review — anti-patterns

## Skipping `validate-skills`

- Broken frontmatter ships.
- **Fix:** Always run before merge.

## Trusting tiers blindly

- Heuristics miss nuance.
- **Fix:** Human read of Related skills and triggers.

## Tech refresh from blogs only

- Wrong API surface.
- **Fix:** Official docs + version pinning.

## Adding `documents/` without INDEX

- KB drift.
- **Fix:** **INDEX.md** + `build-kb` / `verify-kb` per repo rules.
