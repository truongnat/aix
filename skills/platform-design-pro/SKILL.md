---
name: platform-design-pro
description: "Cross-platform design system expertise covering iOS Human Interface\
  \ Guidelines (HIG), \nAndroid Material Design 3, and Web platform best practices.\n\
  450+ rules for Apple platforms (iOS, iPadOS, macOS, watchOS, visionOS, tvOS), \n\
  Android, and Web with WCAG 2.2 compliance.\n\nUse when building native mobile apps,\
  \ cross-platform apps, or need platform-specific \ndesign guidance with accessibility\
  \ compliance.\n"
metadata:
  content-language: en
  level: professional
---

## Boundary

[Define boundary with related skills]

## When to use

- Building iOS apps (SwiftUI, UIKit)
- Building Android apps (Jetpack Compose, XML)
- Building cross-platform (React Native, Flutter)
- Building macOS, watchOS, visionOS, tvOS apps
- Designing responsive web interfaces
- Reviewing platform compliance
- Choosing navigation patterns for platform
- Implementing platform-specific gestures

## When not to use

- Web-only projects without native elements
- Pure design exploration without platform constraints
- Highly custom UIs that break all conventions

## Required inputs

- **platform**: iOS, Android, Web, or cross-platform
- **device_type**: Phone, tablet, desktop, watch, TV, AR
- **framework**: SwiftUI, UIKit, Jetpack Compose, React Native, Flutter
- **feature_type**: Navigation, forms, gestures, accessibility

## Expected output

- **platform_guidelines**: Specific HIG/Material rules
- **component_patterns**: Platform-native components
- **gesture_specs**: Touch, pointer, voice interactions
- **accessibility_requirements**: WCAG 2.2 compliance notes


## Workflow

Apply **Karpathy principles** throughout.

1. **Confirm** platform context → verify: [iOS/Android/Web, device type, framework].
2. **State assumptions** about user expectations, platform conventions, accessibility needs.
3. **Apply** platform-native pattern first; cross-platform only when justified.
4. **Make surgical changes** — only touch platform-specific elements.
5. **Define success criteria** (native feel, accessible, performant); verify.
6. **Respond** with platform guidelines, component patterns, gesture specs.

## Operating principles

1. **Think Before Coding** — State assumptions: platform conventions, user expectations, device constraints.
2. **Simplicity First** — Native pattern first; custom only when justified.
3. **Surgical Changes** — Only modify platform-specific components.
4. **Goal-Driven Execution** — Native feel, accessible, performant; verify with platform checklist.

### Platform Philosophy

**Platform-native over cross-platform:**
- Users have platform-specific expectations
- Native patterns perform better
- Accessibility built into native components

**Cross-platform considerations:**
- Abstract common patterns
- Platform-specific adaptations
- Don't force iOS patterns on Android

### Platform Coverage

**Apple Ecosystem:**
- **iOS:** iPhone, Dynamic Island, gestures, Touch ID/Face ID
- **iPadOS:** Multitasking, Stage Manager, pointer support, keyboard
- **macOS:** Menu bar, toolbar, window management, keyboard shortcuts
- **watchOS:** Glanceable, Digital Crown, complications, Always On
- **visionOS:** Spatial UI, eye/hand input, windows/volumes, immersion
- **tvOS:** Focus-based, Siri Remote, 10-foot UI

**Android:**
- **Material Design 3:** Dynamic color, Material You, components
- **Form factors:** Phone, tablet, foldable, Wear OS

**Web:**
- **Responsive:** Mobile-first, progressive enhancement
- **Accessibility:** WCAG 2.2 AA compliance
- **Performance:** Core Web Vitals

## Suggested response format

### For iOS component:

```markdown
## iOS Component: [Name]

### HIG Reference
**Section:** [HIG section]
**Rule:** [Specific guideline]

### Implementation (SwiftUI)
```swift
// Code here
```

### Platform Considerations
- **Dynamic Type:** Supports accessibility sizes
- **Dark Mode:** Automatic with .preferredColorScheme
- **VoiceOver:** Label, hint, trait

### iOS-specific Behaviors
- **Gestures:** Swipe, pinch, pull-to-refresh
- **Haptics:** Impact, notification, selection
```

### For Android component:

```markdown
## Android Component: [Name]

### Material Design 3 Reference
**Component:** [Material component]
**Tokens:** [Color, typography, shape tokens]

### Implementation (Jetpack Compose)
```kotlin
// Code here
```

### Platform Considerations
- **Dynamic Color:** Material You theming
- **Form Factors:** Phone, tablet, foldable adaptations
- **TalkBack:** Content description, focus
```

## Quick examples

### Example 1: iOS Tab Bar

**User:** "Create iOS tab bar with 5 items"

**Agent workflow:**
1. **Confirm:** iOS, SwiftUI, iPhone
2. **State assumptions:** Bottom navigation, 5 sections, icons + labels
3. **Apply:** HIG Tab Bar pattern
4. **Surgical:** Only tab bar, not entire app structure
5. **Goal:** Native feel, accessible, respects safe area

**Output:**
```swift
TabView {
    HomeView()
        .tabItem {
            Label("Home", systemImage: "house")
        }
    // ... 4 more tabs
}
```
**Rules:**
- 3-5 tabs max
- Use SF Symbols
- First tab is always home
- "More" tab for overflow

### Example 2: Android Navigation Drawer

**User:** "Add Material Design navigation drawer"

**Agent workflow:**
1. **Confirm:** Android, Jetpack Compose, phone
2. **State assumptions:** Top-level destinations, 6-10 items
3. **Apply:** Material Navigation Drawer pattern
4. **Surgical:** Drawer only, integrates with existing scaffold
5. **Goal:** Material compliance, accessible, performant

**Output:**
```kotlin
ModalNavigationDrawer(
    drawerContent = {
        ModalDrawerSheet {
            // Drawer items
        }
    }
) {
    // Screen content
}
```

### Example 3: Cross-platform Navigation Decision

**User:** "Should I use tabs or drawer for this app?"

**Agent:** Platform comparison:
- iOS: Bottom tabs (HIG preference)
- Android: Drawer or bottom nav (both acceptable)
- Cross-platform: Bottom nav with platform styling

## References

- `/skills/platform-design-pro/references/ios-hig.md` — iPhone, iPad guidelines
- `/skills/platform-design-pro/references/android-material.md` — Material Design 3
- `/skills/platform-design-pro/references/macos-hig.md` — Desktop app guidelines
- `/skills/platform-design-pro/references/watchos-hig.md` — Watch complications
- `/skills/platform-design-pro/references/visionos-hig.md` — Spatial UI
- `/skills/platform-design-pro/references/web-wcag.md` — Accessibility guidelines
- `/skills/platform-design-pro/references/cross-platform.md` — React Native, Flutter patterns

## Checklist

### Platform verification
- [ ] Correct platform identified (iOS/Android/Web)
- [ ] Device type appropriate (phone/tablet/watch/TV)
- [ ] Framework considered (SwiftUI, Compose, RN)

### Native compliance
- [ ] **Karpathy Principles Verification:**
  - [ ] Assumptions stated (platform, device, conventions)
  - [ ] Native pattern applied (custom only when justified)
  - [ ] Surgical changes only (platform elements only)
  - [ ] Success criteria defined (native feel, accessible)
- [ ] Follows HIG or Material guidelines
- [ ] Uses platform-native components
- [ ] Respects platform conventions (gestures, navigation)

### Accessibility
- [ ] VoiceOver/TalkBack labels
- [ ] Dynamic Type support
- [ ] Sufficient contrast (WCAG 2.2)
- [ ] Minimum touch targets (44pt iOS, 48dp Android)

### Platform-specific
**iOS:**
- [ ] SF Symbols used
- [ ] Respects safe area
- [ ] Supports Dynamic Type
- [ ] Haptics implemented

**Android:**
- [ ] Material You tokens
- [ ] Dynamic color supported
- [ ] Elevation/shadows correct
- [ ] Ripple feedback

**Web:**
- [ ] Responsive breakpoints
- [ ] Progressive enhancement
- [ ] Keyboard navigation
- [ ] Reduced motion respected
