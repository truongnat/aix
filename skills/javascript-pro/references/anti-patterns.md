# JavaScript — anti-patterns

## Implicit coercion in conditionals

- **Problem:** `if (value)` treats `0`, `''`, `NaN` as false; business logic may need explicit checks.
- **Fix:** Compare to `null`/`undefined` explicitly or use `Number.isFinite`, length checks, etc.

## Floating `Promise` work

- **Problem:** `doSomethingAsync()` without `await`/return loses errors and ordering guarantees.
- **Fix:** Return the Promise or `await`; use void operator only with documented fire-and-forget + error handler.

## Mutating function arguments

- **Problem:** Surprise side effects for callers; breaks under concurrency.
- **Fix:** Copy objects/arrays at boundaries or document mutation contract.

## `this` in callbacks

- **Problem:** Classic event handler / `map` callback loses intended receiver.
- **Fix:** Arrow for lexical `this`, or `.bind`, or pass explicit context parameter.

## Mega try/catch

- **Problem:** Swallows errors; hides which step failed.
- **Fix:** Narrow try blocks; rethrow with context; use error codes.

## JSON as deep-clone for large graphs

- **Problem:** Loses `Date`, `Map`, `undefined`; CPU and memory spikes.
- **Fix:** Structured clone (where available) or explicit serializers.
