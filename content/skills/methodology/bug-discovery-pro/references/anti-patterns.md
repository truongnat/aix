# Bug discovery — anti-patterns

## Claiming 100% coverage

- False confidence.
- **Fix:** Candidates + confidence + falsification tests.

## Stale graph trust

- Wrong impact after big refactor.
- **Fix:** Re-index before deep impact analysis.

## Fix without repro

- Regressions repeat.
- **Fix:** Minimal repro or recorded logs.

## Ignoring dynamic imports

- Graph blind spots — document limitation.
