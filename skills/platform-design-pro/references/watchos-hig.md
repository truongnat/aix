# watchOS Human Interface Guidelines — Complications and Glanceability

## The Glanceability Principle: 2-Second Rule

watchOS design is defined by a single constraint: the user raises their wrist, reads information, and lowers it within 2–5 seconds. Everything about watchOS design follows from this.

**Design implications:**
- Show the most critical piece of information instantly — no loading states for the primary value
- Avoid requiring scroll to see essential content
- Never require the user to tap to get the answer to "what time is X" or "am I on track"
- Progressive disclosure is fine for secondary detail, but the primary metric must be above the fold

**Anti-patterns:**
- Splash screens or loading spinners on app launch
- Dashboards with 6+ metrics that require the user to parse before finding their value
- Multi-step interactions for anything that could be one tap or a complication glance

---

## Watch Face Complications

Complications are the primary touchpoint for watchOS apps. An app without a meaningful complication has very low engagement.

**Complication families:**

| Family          | Size                    | Content capacity             |
|-----------------|-------------------------|------------------------------|
| Corner          | Corner of Infograph face | Small text + gauge or icon   |
| Circular        | Small circle            | Icon + short text            |
| Rectangular     | Wide rectangle          | Header + body text + icon    |
| Graphic Corner  | Infograph corner        | Gauge with image             |
| Graphic Circular| Circle (Infograph)      | Gauge, image, or stack       |
| Graphic Rectangular| Wide (Infograph)    | Full-color image + text      |
| Extra Large     | Large face              | Single large value           |

**Data limits per family:**
- Circular: ~2–4 characters visible at glance; or one icon
- Rectangular: ~1 line header + 2 lines body (40 chars total realistic)
- Corner: 1 short label + gauge or image

**ClockKit / WidgetKit for watchOS:**
- watchOS 9+: complications use WidgetKit (`Widget`, `TimelineProvider`, `TimelineEntry`)
- Provide a full timeline — system refreshes on schedule, not on demand
- `@Environment(\.widgetFamily)` to render per-family layouts
- Complication refresh budget: ~50 refreshes/day. Prioritize predictable data (schedules, countdowns) over live-fetched data

**Design rules:**
- One complication = one piece of information. Don't cram.
- Use `Text` with `Date` format for countdowns — system renders them correctly
- Tapping a complication should deep-link to the relevant content, not the app home screen

---

## Navigation: Page-Based vs Hierarchical

Apple recommends page-based navigation for most watchOS apps.

**Page-based (swipe left/right between peers)**
- Best for: a small set of equal-importance views (activity summary, heart rate, workout)
- User swipes horizontally — fast, low effort
- Limit to 3–5 pages; more than that and users don't discover them
- In SwiftUI: `TabView` with `.tabViewStyle(.page)`

**Hierarchical (push/pop into detail)**
- Use when data is genuinely nested: workout history → specific workout → lap splits
- Keep hierarchies shallow: max 2–3 levels deep
- Back button is small — provide swipe-back as well
- `NavigationStack` in SwiftUI watchOS

**Apple's recommendation:**
- If your content fits on 3–4 pages: page-based
- If the content is a list of items with detail: hierarchical
- Never mix both deeply — choose one primary model

---

## List Layouts

Lists are the workhorse of watchOS content display.

- Use `List` in SwiftUI — it handles the watchOS-specific scroll inertia and crown integration automatically
- Row height: minimum 44pt effective touch target
- Keep row content to: leading icon + primary label + optional trailing value
- Avoid secondary lines in list rows — space is too limited
- Group related items with `Section` headers; keep section headers short (1–2 words)
- Use `.listItemTint` for row accent colors (adapts to watch face accent)

**What not to put in lists:**
- Multi-line body text — this is not a reading app
- More than 2 pieces of information per row
- Destructive swipe actions on items the user will frequently need

---

## Digital Crown Integration

The Digital Crown is a primary input method — design for it explicitly.

**Scroll:** any `ScrollView` or `List` automatically uses the Crown for vertical scroll. This is free; don't suppress it.

**Zoom / Picker:** `Picker` in SwiftUI uses the Crown when focused. Use `.focusable()` and `.digitalCrownRotation()` for custom controls.

**Crown rotation for custom input:**
```swift
@State private var crownValue = 0.0

SomeView()
    .focusable()
    .digitalCrownRotation(
        $crownValue,
        from: 0,
        through: 100,
        by: 1,
        sensitivity: .medium,
        isContinuous: false,
        isHapticFeedbackEnabled: true
    )
```

**Haptic feedback on Crown:** enable it for discrete steps (pickers, value selection). Disable for continuous scrolling.

**When to use Crown rotation vs tap:**
- Adjusting a continuous value (volume, workout intensity, timer): Crown
- Selecting from a list of named options: Crown with Picker
- Confirming an action: tap (not Crown press — the Crown press is owned by the system)

---

## Typography on watchOS

watchOS has very constrained typography options.

**Available fonts:**
- **SF Compact**: the watchOS-specific variant of SF Pro, optimized for small circular screens — tighter letter spacing
- **SF Compact Rounded**: for body text that needs to be friendlier, used in Activity rings labels
- No custom fonts loaded from the app bundle in most complication contexts

**Realistic size limits:**
| Context            | Max point size | Notes                          |
|--------------------|---------------|-------------------------------|
| Complication value | 36–52pt       | Depends on family              |
| List row primary   | 15–17pt       | `.body` or `.headline`         |
| List row secondary | 12–13pt       | `.footnote` or `.caption`      |
| Button label       | 15pt          | Must be readable with gloves   |

**Rules:**
- Support Dynamic Type: some Watch users have accessibility text sizes enabled
- Never go below 12pt for anything the user needs to read
- Prefer `.bold` weight for metrics and values — thin weights disappear at small sizes

---

## Color on watchOS

watchOS has a dark background (black OLED) — design for dark mode as the primary mode.

**System colors:** use `Color.red`, `Color.green`, `Color.blue` (system adaptive) — these automatically adjust to the watch face accent color when used in complications.

**Background colors:**
- Default background: black (`.black`) — maximizes battery life on OLED
- Do NOT use white or light backgrounds for full-screen content — harsh on wrist
- Colored backgrounds: acceptable for modals, confirmation screens, not for main content

**Complications:**
- Use `.accentColor` / `Color.accentColor` so complications adapt to the user's chosen watch face tint
- Do not hard-code complication colors — they must work on all watch faces (white, colored, dark)

**Contrast:** text on black background — use white or systemYellow/systemGreen for values. Light gray for secondary labels (`Color(UIColor.secondaryLabel)`).

---

## App Lifecycle: Background Tasks

watchOS aggressively suspends apps. Design accordingly.

**Extended runtime sessions (foreground required):**
- Workout session: keeps app running during active workout, enables heart rate monitoring
- Navigation session: keeps app active for turn-by-turn
- Mindfulness session: for meditation/breathing apps
- Must use `WKExtendedRuntimeSession`

**Background app refresh:**
- Budget: ~1 refresh per hour
- Use for complication updates, health data sync, notification preparation
- `WKApplicationRefreshBackgroundTask` — complete quickly (under 15 seconds of CPU)

**Network requests:**
- Use `URLSession` background configuration for data fetches
- `WKURLSessionRefreshBackgroundTask` handles response when app is suspended
- Avoid synchronous network calls on launch — they block the UI on a slow Watch connection

**Design implication:** do not design features that require continuous background connectivity. Assume the app is suspended most of the time; only foreground session types get CPU during wrist-up.

---

## Common Pitfalls

- Treating the Watch as a phone companion that requires the phone to be nearby (design for standalone Watch use)
- Over-crowding complications with data that changes every second (refresh budget is limited)
- Building hierarchical navigation 4+ levels deep (users get lost; wrist fatigue is real)
- Forgetting the Digital Crown on list-heavy screens (not calling `.focusable()` when needed)
- Using SF Pro instead of SF Compact (subtle but impacts rendering at small sizes)
- Dark-gray backgrounds that look different from black on OLED (use pure `.black`)
