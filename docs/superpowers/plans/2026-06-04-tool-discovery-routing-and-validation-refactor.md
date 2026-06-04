# Tool Discovery, Routing, and Validation Refactor Plan

## Goal

Implement the full `Tool Discovery & Tool Routing` capability layer and redesign validation into a cleaner registry-based architecture without breaking the current `validate.js` entrypoints or repository contracts.

## Scope

- Add capability docs, discovery script, template, docs, install-cache coverage, and prompt/command integration.
- Refactor validation from a monolithic implementation into smaller modules with a lightweight validator registry.
- Preserve the existing CLI contract for `node validate.js`, target profile validation, and target goal validation.

## Affected Files And Systems

- `validate.js`
- `lib/validate.js`
- `install-cache.js`
- `lib/install-cache.js`
- `commands/`
- `prompt-templates/`
- `templates/`
- `test/run-tests.js`
- new `tool-capabilities/`
- new `scripts/discover-tools.js`
- new `docs/tool-discovery-and-routing.md`

## Ordered Tasks

1. Extract validation contracts, utilities, and mode runners into a new `lib/validate/` module tree.
2. Preserve public `validate.js` exports through a compatibility-focused index module.
3. Add validator coverage for tool capability docs, discovery script, template existence, and discovery command execution.
4. Add the tool capability registry markdown files and routing guidance.
5. Implement `scripts/discover-tools.js` using Node built-ins only with JSON and markdown output modes.
6. Integrate tool discovery and routing guidance into command docs and prompt templates.
7. Extend install cache exports and tests to include the new capability layer.
8. Add focused tests for discovery output, optional-tool behavior, routing contracts, and cache inclusion.

## Verification Strategy

- `npm ci`
- `node validate.js`
- `npm test`
- `node scripts/discover-tools.js`
- `node scripts/discover-tools.js --markdown`
- `cd examples/dogfood-tiny-node-api && npm test`
- `cd ../../site && npm ci && npm run build`

## Rollback Considerations

- Keep the top-level `validate.js` entrypoint unchanged.
- Preserve legacy export names used by `test/run-tests.js`.
- Prefer additive docs/template changes over destructive rewrites.

## Approval Status

status: approved
approved_by: user
approved_at: 2026-06-04
notes: User approved full implementation and explicitly requested a cleaner validation redesign.
