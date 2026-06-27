# Quality validation and guardrails (anti-hallucination)

## APIs and versions

- [ ] **Flutter / Dart major** — Deprecated APIs (`Navigator` patterns, older `mounted` checks) differ; say **“for Flutter X.Y verify docs”** instead of guessing signatures — **`versions.md`**.
- [ ] **Package APIs** (`go_router`, `riverpod`) change between majors — cite **migration guides** when suggesting renames.

## Snippets

- [ ] **`context.mounted`** — Prefer for **StatefulWidget** post-await (Flutter 3.7+); if user is on older SDK, show **`if (!mounted) return`** alternative — **`widgets.md`**.
- [ ] Do **not** invent **`pubspec.yaml`** package versions — use placeholders or ask lockfile.

## Claims

- [ ] **“Impeller fixes all jank”** — false; profile first — **`failure-modes-detection-mitigation.md`**.
- [ ] **Security** — Do not assert “encrypted at rest” without **`flutter_secure_storage`** or Keychain/Keystore patterns — **`security-pro`**.

## Platform

- [ ] Avoid **hard-coded iOS-only** symbols in shared code without `Platform.isIOS` / theme checks — **`edge-cases.md`**.
