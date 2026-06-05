# v1.0.1 Release Design

## Goal

Prepare the next publishable npm release as `v1.0.1`, aligned with the current repo state and the recently refreshed README and landing page.

## Release Type

Patch release.

This release is documentation, presentation, and release-packaging polish. It does not introduce a new workflow contract, provider support tier, or runtime behavior boundary.

## Included

- Version bump from `1.0.0` to `1.0.1`
- New `CHANGELOG.md` entry for `1.0.1`
- New `docs/v1.0.1-release-notes.md`
- Updated latest-release references in README, docs index, and site UI
- Release checklist update for `v1.0.1`
- Verification for version metadata plus packaging dry-run

## Not Included

- No new provider claims
- No command contract changes
- No runtime support expansion
- No release automation

## User-Facing Framing

`v1.0.1` should be presented as:

- README clarity and positioning improvements
- landing page polish
- walkthrough video integration
- release metadata alignment for the next npm publish

## Verification

- Metadata regression test for version/release-note consistency
- `npm test`
- `npm run build` in `site/`
- `npm pack --dry-run`
