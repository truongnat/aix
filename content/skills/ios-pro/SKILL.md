---
name: ios-pro
description: >-
  Expert iOS development covering Swift, SwiftUI, Swift Concurrency, Combine,
  and native architecture patterns (MVVM, Composable Architecture).
x-kind: domain
x-version: 0.1.0
x-roles: []
x-tags: []
x-compatible:
  - claude
  - cursor
  - codex
  - gemini
---

# iOS Pro

Expert-level orchestration of native iOS applications. Focuses on the Swift ecosystem, SwiftUI, and modern concurrency.

## Boundary

**`ios-pro`** covers Swift language (Generics, Protocols, Macros), SwiftUI (Declarative UI, State management), Swift Concurrency (`async`/`await`, Actors), Combine (Reactive streams), and iOS frameworks (Core Data, SwiftData, Networking). It does NOT cover cross-platform frameworks (use `react-native-pro` or `flutter-pro` for that).

## When to use

- Building high-performance, native iOS apps using SwiftUI.
- Implementing complex, thread-safe logic using Swift Concurrency and Actors.
- Designing modular iOS architectures (MVVM, TCA).
- Integrating deep system features (Widgets, Push Notifications, App Intents).

## Workflow

1. **Project Setup**: Initialize with Xcode and Swift Package Manager (SPM).
2. **UI Design**: Build declarative interfaces using SwiftUI and `@State`/`@Binding`.
3. **Architecture**: Implement MVVM or TCA to separate logic from UI.
4. **Networking/Data**: Use `URLSession` and `SwiftData`/`Core Data` for persistence.
5. **Concurrency**: Orchestrate async tasks using `async/await` and Task groups.
6. **Testing**: Write unit tests with XCTest and UI tests.

### Operating principles

- **SwiftUI-First**: Use SwiftUI for all new UI development unless UIKit is required for legacy support.
- **Safety via Types**: Leverage Swift's strong type system and Optionals to prevent crashes.
- **Concurrency Safety**: Use Actors to protect shared mutable state.
- **Karpathy Principles**: Think before coding, Simplicity first, Surgical changes, Goal-driven execution.

## Suggested response format (STRICT)

Your response MUST follow this structure:

```xml
<Role>
Senior iOS Engineer.
</Role>

<Feature>
[iOS Component/Feature Description]
</Feature>

<Implementation>
[Clean, modern Swift/SwiftUI code Artifact]
</Implementation>

<Verification>
[Step-by-step verification plan with XCTest examples]
</Verification>
```

## Resources in this skill

| Topic | Reference |
|-------|-----------|
| iOS Roadmap | [roadmap.sh/ios](https://roadmap.sh/ios) |
| Apple Developer Documentation | [developer.apple.com/documentation](https://developer.apple.com/documentation/) |
| SwiftUI Tutorials | [developer.apple.com/tutorials/swiftui](https://developer.apple.com/tutorials/swiftui/) |
| Swift Concurrency | [docs.swift.org/swift-book/documentation/the-swift-programming-language/concurrency](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/concurrency/) |

## Quick example

**Feature:** A simple SwiftUI view with async data fetching.

```swift
import SwiftUI

struct UserView: View {
    @State private var username: String = "Loading..."

    var body: some View {
        Text(username)
            .task {
                username = await fetchUsername()
            }
    }

    func fetchUsername() async -> String {
        // ... async networking logic
        return "Alice"
    }
}
```

## Checklist before calling the skill done

- [ ] **Think Before Coding**: View hierarchy and data flow (State/Observable) planned.
- [ ] **Simplicity First**: Built-in SwiftUI modifiers used over custom implementations.
- [ ] **Surgical Changes**: Only updated relevant Views or ViewModels.
- [ ] **Goal-Driven Execution**: Verified with Xcode Preview and XCTest.
- [ ] Swift Concurrency (`async/await`) used correctly for networking.
- [ ] Memory management (ARC) and retain cycles (weak self) handled.
- [ ] Accessibility labels and traits included for UI elements.
