# Session Memory Architecture Implementation Plan

## Goal

Implement Step 3A of the session memory architecture:

- make session-based file memory the working default
- introduce root router artifacts for `.harness`
- route workflow command contracts through the active session
- add migration guidance for legacy flat layouts
- validate and test the new memory surface

## Scope

Included:

- new and updated templates for root router and session artifacts
- command and prompt-template updates for active-session routing
- docs for session memory and migration
- validation updates for the new templates and routing language
- focused tests for the new memory structure and docs

Not included:

- required Neo4j support
- graph sync implementation
- full product CLI `memory` commands unless they turn out to be very small

## Affected Files And Systems

- `templates/`
- `commands/harness-start.md`
- `commands/harness-map.md`
- `commands/harness-plan.md`
- `commands/harness-run.md`
- `commands/harness-verify.md`
- `commands/harness-ship.md`
- `prompt-templates/`
- `docs/target-repo-validation.md`
- `docs/session-memory.md`
- `docs/memory-migration.md`
- `lib/validate/`
- `test/run-tests.js`

## Ordered Tasks

1. Add failing or expectation-setting tests for session memory templates, docs, and active-session routing references.
2. Add root router, session, and durable-memory templates, plus config template.
3. Update command and prompt-template contracts to route through `.harness/STATE.md` and session-local artifact paths.
4. Add docs for session memory and migration, and refresh related validation docs where needed.
5. Extend validation to require the new memory templates and command-doc routing behavior.
6. Run `node validate.js`, `npm test`, dogfood test, and site build; fix regressions until green.

## Verification Strategy

- `node validate.js`
- `npm test`
- `cd examples/dogfood-tiny-node-api && npm test`
- `cd ../../site && npm run build`

## Rollback Considerations

- Preserve top-level `validate.js` entrypoint and validator public exports.
- Keep new memory behavior as contract/documentation changes unless executable migration logic is explicitly added.
- Avoid deleting durable root artifacts unless they are already removed from the active surface and replaced intentionally.

## Approval Status

status: approved
approved_by: user
approved_at: 2026-06-04
notes: User reviewed the session-memory spec and asked to implement Step 3A.
