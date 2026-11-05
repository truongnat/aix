# Flutter — anti-patterns

1. **`setState` after `await` without `mounted` check** — Crashes or silent bugs; use `mounted` / cancel pattern.

2. **God widgets** — Thousands of lines in one `build`; split by widget class for rebuild isolation.

3. **Ignoring platform differences** — Web vs mobile input, desktop window constraints; test targets.

4. **Unbounded `ListView` in unbounded parent** — Layout exceptions; use `shrinkWrap` or `CustomScrollView` correctly.

5. **Blocking UI isolate with heavy sync work** — Jank; move to `compute` / isolates.

6. **Hard-coded colors outside `ThemeData`** — Breaks dark mode and design system.

7. **GlobalKeys everywhere** — Hard to reason; prefer `ValueKey` and state lifting.

8. **Skipping semantics** — Screen reader failures in production.

**When NOT to extract widgets:** Truly one-off UI with no reuse — avoid over-abstraction.
