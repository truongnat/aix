# Failure modes — detection and mitigation

| Failure | Why | Detect | Mitigate |
|---------|-----|--------|----------|
| **`setState` after dispose** | Async gap | Assertion / zombie UI | `mounted` / `context.mounted`; cancel subs — **`widgets.md`**, **`edge-cases.md`** |
| **Unbounded height overflow** | `Column` + `ListView` without flex | RenderFlex overflow | `Expanded`, `shrinkWrap`, `CustomScrollView` — **`anti-patterns.md`** |
| **List jank** | Full list build, heavy `build` | Timeline frames > 16 ms | `ListView.builder`, keys, `RepaintBoundary` sparingly — **`tips-and-tricks.md`** |
| **Memory leak** | Stream/TextEditingController not disposed | DevTools memory climb | `dispose` cleanup — **`widgets.md`** |
| **Plugin/version skew** | Flutter upgrade without pod/gradle sync | Build fails native | `flutter pub upgrade`; clean pods — **`versions.md`** |
| **Wrong platform branch** | Assumes Android-only API | Crash on iOS/web | `defaultTargetPlatform`, `kIsWeb` guards — **`edge-cases.md`** |
| **Golden flake** | Font/video surface diff | CI intermittent | `--update-goldens` discipline; stable fonts — **`testing-pro`** |
| **Web CORS prod-only break** | Dev proxy hides CORS | Works local, fails prod | Fix server headers; don’t strip in Flutter only — **`edge-cases.md`** |
| **Secure storage misuse** | Tokens in `SharedPreferences` | Audit | `flutter_secure_storage` — **`integration-map.md`** |
| **Obfuscation without symbols** | Unreadable crash reports | Crash stacks useless | Save symbol mapping — **`versions.md`** |
