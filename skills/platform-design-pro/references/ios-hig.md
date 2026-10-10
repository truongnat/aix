# iOS Human Interface Guidelines — Key Rules for Developers

## Navigation Patterns

Three distinct models — choosing wrong one breaks user expectations.

**NavigationStack (push/pop)**
- For hierarchical content: list → detail → sub-detail
- Back button is automatic; never override the back button label with "Back"
- Use `NavigationLink` in SwiftUI or `UINavigationController.pushViewController`
- Suitable when the user drills into content and needs a trail to retrace

**TabBar (peer navigation)**
- For switching between 2–5 equal-priority sections of the app
- Never hide the tab bar when the user pushes into a child view — it stays visible
- Tabs represent modes, not actions; don't put "New Post" as a tab
- `UITabBarController` / SwiftUI `TabView`

**Modal (task-based)**
- For self-contained tasks that interrupt the main flow: compose email, add item, settings sheet
- Always provide a clear dismissal path (Done / Cancel / swipe down)
- Presenting a modal mid-navigation stack is valid; presenting a navigation stack inside a modal is acceptable only when the task requires it
- Avoid stacking multiple modals — one at a time

**Rule of thumb:** if the user needs the back button to undo, use push. If the user is switching contexts, use tab. If the user is completing a task, use modal.

---

## Touch Target Minimum: 44×44pt

- Apple's minimum is 44×44pt regardless of visual size
- A 20pt icon button must have a 44×44pt tappable area around it
- On a 3× screen (iPhone 15 Pro), 44pt = 132px physical pixels
- Implement with `.contentShape(Rectangle())` in SwiftUI or `UIEdgeInsets` hit area expansion in UIKit
- Never place interactive elements closer than ~8pt edge-to-edge (combined with their hit areas)

---

## Safe Area Insets

**Top — notch / Dynamic Island**
- iPhone 14+: Dynamic Island sits at top center, safe area top = 59pt
- iPhone SE (3rd gen): no notch, safe area top = 20pt (status bar only)
- Never place interactive controls behind the Dynamic Island

**Bottom — home indicator**
- iPhones without a home button: safe area bottom = 34pt
- Content scrolling behind it is fine; fixed controls must clear it
- In SwiftUI: use `.ignoresSafeArea(.container, edges: .bottom)` only for backgrounds, not controls
- In UIKit: `view.safeAreaInsets.bottom` — add this to any fixed bottom bar's height

**Code pattern (UIKit):**
```swift
let bottomInset = view.safeAreaInsets.bottom
bottomBarConstraint.constant = 16 + bottomInset
```

**Code pattern (SwiftUI):**
```swift
.safeAreaInset(edge: .bottom) {
    BottomActionBar()
}
```

---

## iOS Typography — SF Pro

**System font:** SF Pro Text (body sizes) and SF Pro Display (title sizes ≥20pt)
- Never bundle SF Pro — it is a system font, use `.systemFont(ofSize:weight:)` or `.font(.body)` in SwiftUI

**Dynamic Type size scale (default sizes):**
| Style         | Default Size | SwiftUI Token      |
|---------------|-------------|--------------------|
| largeTitle    | 34pt        | `.largeTitle`      |
| title         | 28pt        | `.title`           |
| title2        | 22pt        | `.title2`          |
| title3        | 20pt        | `.title3`          |
| headline      | 17pt semibold | `.headline`      |
| body          | 17pt        | `.body`            |
| callout       | 16pt        | `.callout`         |
| subheadline   | 15pt        | `.subheadline`     |
| footnote      | 13pt        | `.footnote`        |
| caption       | 12pt        | `.caption`         |
| caption2      | 11pt        | `.caption2`        |

**Always support Dynamic Type.** Test at Accessibility → Larger Text → maximum size. Use `UIFontMetrics` in UIKit to scale custom fonts. In SwiftUI, `.font(.body)` scales automatically.

---

## Bottom Sheet vs Full-Screen Modal

**Bottom sheet (UISheetPresentationController / `.sheet`)**
- Use for: supplementary actions, filters, quick info, share sheets
- Supports detents: `.medium` (half screen) and `.large` (near full)
- User can dismiss with swipe down — don't disable this without a strong reason
- Wrong use: complex multi-step flows that need their own navigation

**Full-screen modal (`.fullScreenCover` / `modalPresentationStyle: .fullScreen`)**
- Use for: immersive experiences (camera, video playback), onboarding, multi-step tasks that own the whole screen
- Must provide an explicit close/cancel button — no swipe-to-dismiss by default
- Appropriate when the task cannot be partially completed

**Decision rule:** if the user might want to glance back at content underneath, use a sheet. If the task demands full attention and a defined exit, use full-screen.

---

## Swipe Gestures — Don't Interfere

- Back swipe (screen-edge pan from left): owned by `UINavigationController` — never intercept it
- Swipe-to-dismiss on modals: owned by the sheet — adding `UIScrollView` inside requires careful `panGestureRecognizer` configuration
- Horizontal scroll views near the screen edge conflict with the back swipe — keep horizontal scroll content away from the leading 20pt edge or use `UIScrollView.contentInsetAdjustmentBehavior`
- Custom swipe gestures on table rows (swipeActions in SwiftUI) are fine; they don't conflict with back swipe

---

## Haptic Feedback

Use `UIImpactFeedbackGenerator`, `UINotificationFeedbackGenerator`, `UISelectionFeedbackGenerator`.

**When to use:**
- `.light` impact: toggles, small selections
- `.medium` impact: confirms a significant action (add to cart, send)
- `.heavy` impact: destructive confirmation, error state
- `.success` / `.warning` / `.error` notifications: task completion results
- Selection feedback: picker scrolling, segment changes

**When NOT to use:**
- Haptics on every tap — reserve for meaningful moments
- Rapid repeated haptics — feels broken
- Haptics for purely visual decorations

Always call `prepare()` before triggering to reduce latency.

---

## App Icon and Launch Screen

**App icon sizes required:**
- 1024×1024px for App Store (no alpha channel, no rounded corners — Apple applies mask)
- Xcode generates all sizes from the 1024px asset via the App Icon asset catalog
- No text smaller than can be read at 29×29px; icons must be recognizable at small sizes

**Launch screen:**
- Use a LaunchScreen storyboard or `UILaunchScreen` Info.plist key — not a static image
- Mirror the initial UI layout to reduce perceived load time
- Never show a splash screen with animation — Apple rejects loading screens that delay content

---

## SF Symbols

- Over 5,000 symbols designed to match SF Pro metrics
- Usage: `Image(systemName: "heart.fill")` in SwiftUI, `UIImage(systemName:)` in UIKit
- Always use `symbolRenderingMode` to match the design intent: `.monochrome`, `.hierarchical`, `.palette`, `.multicolor`
- Scale with text using `.imageScale(.large)` or `UIImage.SymbolConfiguration`
- Custom symbols must follow the SF Symbols template (available in the SF Symbols app) for correct weight matching
- Do not modify SF Symbol paths in design tools — export as SVG from the SF Symbols app

---

## Common Pitfalls

- Hard-coding font sizes instead of Dynamic Type styles
- Placing buttons in the bottom safe area without accounting for home indicator
- Using `.fullScreenCover` for flows that should be sheets (traps users)
- Conflicting gesture recognizers causing back-swipe failures
- Forgetting that `TabView` tab items must use SF Symbols or simple images — not text-only
