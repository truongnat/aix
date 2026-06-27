---
name: android-pro
description: >-
  Expert Android development covering Kotlin, Jetpack Compose, Coroutines, Flow,
  and modern architecture patterns (MVVM, MVI).
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

# Android Pro

Expert-level orchestration of native Android applications. Focuses on the Kotlin ecosystem, Jetpack Compose, and modern reactive programming.

## Boundary

**`android-pro`** covers Kotlin language (Coroutines, Flow, Sealed Classes), Jetpack Compose (Declarative UI), Android Architecture Components (ViewModel, Room, Navigation), and Hilt/Dagger for DI. It does NOT cover cross-platform frameworks (use `react-native-pro` or `flutter-pro` for that).

## When to use

- Building modern, high-performance Android apps using Jetpack Compose.
- Implementing reactive data flows using Kotlin Flow and Coroutines.
- Designing modular Android architectures (MVVM, MVI, Clean Architecture).
- Integrating Android-specific features (Widgets, Notifications, CameraX).

## Workflow

1. **Project Setup**: Initialize with Android Studio and Gradle (Kotlin DSL).
2. **UI Design**: Build declarative interfaces using Jetpack Compose and `remember`/`mutableStateOf`.
3. **Architecture**: Implement MVVM/MVI to separate UI from business logic.
4. **Networking/Data**: Use `Retrofit` and `Room` for persistence.
5. **Concurrency**: Orchestrate async tasks using `Coroutines` and `Flow`.
6. **Testing**: Write unit tests with JUnit/MockK and UI tests with Compose Test.

### Operating principles

- **Compose-First**: Use Jetpack Compose for all new UI development.
- **Null Safety**: Leverage Kotlin's null safety to prevent NullPointerExceptions.
- **Reactive Streams**: Use Flow for predictable, reactive data streams.
- **Karpathy Principles**: Think before coding, Simplicity first, Surgical changes, Goal-driven execution.

## Suggested response format (STRICT)

Your response MUST follow this structure:

```xml
<Role>
Senior Android Engineer.
</Role>

<Feature>
[Android Component/Feature Description]
</Feature>

<Implementation>
[Clean, modern Kotlin/Compose code Artifact]
</Implementation>

<Verification>
[Step-by-step verification plan with Compose Test examples]
</Verification>
```

## Resources in this skill

| Topic | Reference |
|-------|-----------|
| Android Roadmap | [roadmap.sh/android](https://roadmap.sh/android) |
| Android Developers Documentation | [developer.android.com/docs](https://developer.android.com/docs) |
| Jetpack Compose Guide | [developer.android.com/jetpack/compose](https://developer.android.com/jetpack/compose) |
| Kotlin Coroutines | [kotlinlang.org/docs/coroutines-overview.html](https://kotlinlang.org/docs/coroutines-overview.html) |

## Quick example

**Feature:** A simple Composable with async state using Flow.

```kotlin
@Composable
func UserScreen(viewModel: UserViewModel = viewModel()) {
    val username by viewModel.username.collectAsState()
    
    Text(text = "Hello, $username")
}

// In ViewModel
val username: StateFlow<String> = flow {
    emit(fetchUsername())
}.stateIn(viewModelScope, SharingStarted.WhileSubscribed(), "Loading...")
```

## Checklist before calling the skill done

- [ ] **Think Before Coding**: Composable hierarchy and state hoisting planned.
- [ ] **Simplicity First**: Leveraged Compose's built-in components and modifiers.
- [ ] **Surgical Changes**: Only updated relevant Composables or ViewModels.
- [ ] **Goal-Driven Execution**: Verified with Compose Preview and Instrumentation tests.
- [ ] Coroutines used with appropriate Dispatchers (IO/Main).
- [ ] Dependency Injection (Hilt) implemented for services and repositories.
- [ ] Material 3 design standards and accessibility guidelines followed.
