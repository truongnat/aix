# Failure modes — detection and mitigation

| Failure | Why | Detect | Mitigate |
|---------|-----|--------|----------|
| **Lost Promise** | `forEach` + async, unhandled rejection | Incomplete writes | `for…of`, `Promise.all`, explicit `catch` — **`anti-patterns.md`** |
| **Race on shared mutable state** | Microtask vs timer reorder | Flaky CI | Serialize or isolate state — **`tips-and-tricks.md`** |
| **`this` lost** | Method extracted | Wrong undefined/sender | Arrow vs `bind` — **`edge-cases.md`** |
| **Prototype pollution** | Recursive merge keys | CVE patterns | Freeze schema, deny `__proto__` keys — **`security-pro`** |
| **Float equality** | Binary FP | Penny drift | Integer cents / Decimal lib / epsilon — **`edge-cases.md`** |
| **`Date` parsing** | Local vs UTC ambiguity | Wrong day boundary | ISO strings + explicit TZ — **`edge-cases.md`** |
| **JSON pitfalls** | `undefined` dropped | Silent data loss | Normalize before stringify — **`edge-cases.md`** |
| **ESM/CJS dual package** | Wrong export surface | Wrong import shape | `exports` map + tests — **`decision-tree.md`** |
| **semver native addon skew** | Node ABI vs binary | Crash on deploy | Pin engines; CI matrix — **`versions.md`** |
