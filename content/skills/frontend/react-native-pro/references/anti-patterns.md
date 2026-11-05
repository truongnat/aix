# React Native — anti-patterns

1. **Index as `key` on dynamic lists** — Reorder/filter bugs; use stable ids (`keyExtractor`).

2. **`nodeIntegration` or exposing native secrets to JS** — Keep secrets in native/secure storage; use `react-native-pro` + platform docs.

3. **Ignoring `SafeArea` on notched devices** — Content under status bar or home indicator; test iPhone + Android gesture nav.

4. **Fat `renderItem` with new inline functions every render** — Causes unnecessary row remounts; extract row component + `useCallback` where needed.

5. **`KeyboardAvoidingView` without testing both platforms** — behavior differs; verify `keyboardVerticalOffset` and Android `windowSoftInputMode`.

6. **Assuming web CSS** — No `vh`/`vw` semantics; flex and Yoga layout differ from web.

7. **Skipping empty/loading/error states** — Blank screens confuse users and QA.

8. **Profiling in dev only** — Use release builds for perf conclusions when possible.

**When NOT to optimize:** Until you measure — avoid premature `memo` everywhere.
