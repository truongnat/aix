# Flutter — version notes

Read **`environment.sdk`** / `pubspec.yaml` and [Flutter release notes](https://docs.flutter.dev/release/release-notes).

| Topic | Verify when bumping |
|-------|---------------------|
| **Dart SDK** | Language features and null-safety defaults |
| **Breaking changes** | `ThemeData`, Material 3 defaults |
| **Packages** | `go_router`, `riverpod`, etc. — follow their compatibility table |
| **Impeller** | Rendering backend flags per platform |

**When NOT to upgrade mid-release:** Freeze SDK for shipping branch; upgrade on a dedicated branch with full `flutter test` + golden runs.
