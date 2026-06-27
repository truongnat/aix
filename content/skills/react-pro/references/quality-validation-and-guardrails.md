# Quality validation and guardrails (React)

## Contents

1. [Version and API honesty](#version-and-api-honesty)
2. [Rules of Hooks](#rules-of-hooks)
3. [SSR and testing](#ssr-and-testing)
4. [Review checklist](#review-checklist)

---

## Version and API honesty

- Confirm **`react` / `react-dom`** major from `package.json` before suggesting APIs (e.g. `use`, `useEffectEvent`, concurrent defaults).
- **Do not invent** hook names, compiler directives, or framework-specific file conventions — cite [react.dev](https://react.dev/) or the meta-framework docs.
- Next.js / Remix **layer rules** on top of React — defer to **`nextjs-pro`** when uncertain.

---

## Rules of Hooks

- Hooks only at **top level** of React functions; never conditional — **`anti-patterns.md`**.
- Custom hooks should **compose** built-in hooks clearly; name with `use` prefix.

---

## SSR and testing

- Tests should respect **server vs client** environment (`@testing-library/react` + SSR utilities where needed).
- Hydration-sensitive code: add **integration** check (or manual) for first paint vs post-hydration — **`edge-cases.md`**.

---

## Review checklist

- [ ] Effect deps exhaustive or explicitly documented exceptions.
- [ ] List `key` stable when list mutates.
- [ ] No unsafe `dangerouslySetInnerHTML` or unfiltered `...props` to DOM — **`security-pro`** when in doubt.
- [ ] Async UI has loading / error / empty states — **`ui-ux-design.md`**.
