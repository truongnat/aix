# Material Design 3 (Material You) — Key Patterns for Developers

## Navigation Components

Choosing the right nav component is non-negotiable for form factor compatibility.

**NavigationBar (bottom)**
- Use for: 3–5 top-level destinations on phones
- Do NOT use more than 5 destinations — use NavigationDrawer instead
- Always visible; does not hide on scroll (unlike M2 behavior)
- Each destination requires a label + icon; active item uses filled icon variant
- `NavigationBar` + `NavigationBarItem` in Compose

**NavigationRail (side, tablets/foldables)**
- Use for: same 3–5 destinations on screens ≥600dp wide
- Sits on the leading edge; content fills remaining width
- Can optionally show a FAB above the rail items
- Switch between NavigationBar and NavigationRail by checking `WindowWidthSizeClass`

**NavigationDrawer (modal or permanent)**
- Modal drawer: for >5 destinations or secondary navigation on phones
- Permanent drawer: always-visible on large screens (≥840dp)
- Do not use a drawer as the primary nav on a phone if you have fewer than 6 destinations — it hides information

**Adaptive pattern:**
```kotlin
when (windowSizeClass.widthSizeClass) {
    Compact -> NavigationBar
    Medium -> NavigationRail
    Expanded -> PermanentNavigationDrawer
}
```

---

## Dynamic Color — Material You Color System

Material You generates a color scheme from the user's wallpaper (Android 12+). The scheme has 5 key color roles plus surface variants.

**Primary palette:** actions, key UI elements
- `primary`: buttons, active states
- `onPrimary`: content on primary backgrounds
- `primaryContainer`: tonal backgrounds (chips, selected states)
- `onPrimaryContainer`: content on primaryContainer

**Secondary palette:** supporting, less prominent
- `secondary` / `onSecondary` / `secondaryContainer` / `onSecondaryContainer`

**Tertiary palette:** accents, contrast with primary+secondary
- `tertiary` / `onTertiary` / `tertiaryContainer` / `onTertiaryContainer`

**Error palette:** errors and warnings
- `error` / `onError` / `errorContainer` / `onErrorContainer`

**Surface & background:**
- `surface`: base card/sheet backgrounds
- `surfaceVariant`: lower-contrast surface (input backgrounds)
- `surfaceTint`: primary color at low opacity for tonal elevation
- `outline`: borders, dividers
- `outlineVariant`: lower-contrast borders

**Access in Compose:**
```kotlin
MaterialTheme.colorScheme.primary
MaterialTheme.colorScheme.primaryContainer
```

**Fallback for pre-Android 12:** define a static baseline scheme in `Color.kt`; use `dynamicLightColorScheme()` only when `Build.VERSION.SDK_INT >= Build.VERSION_CODES.S`.

---

## Elevation Model: Tonal vs Shadow

M3 replaces M2's shadow-based elevation with a **tonal elevation** system.

**Tonal elevation:**
- Adds `surfaceTint` (primary color) at increasing opacity as elevation increases
- Level 0 → no tint; Level 5 → visibly tinted
- Used by default for all M3 surfaces: cards, dialogs, menus
- Conveys hierarchy through color, not shadow

**Shadow elevation:**
- Still used for components that need to appear physically lifted (FAB, bottom sheet)
- Do not use shadow alone without tonal tinting in M3 — combine them
- High-shadow + no-tint = M2 look (inconsistent with M3)

**When to use which:**
| Scenario                        | Elevation type           |
|---------------------------------|--------------------------|
| Cards on a surface              | Tonal only               |
| FAB                             | Tonal + shadow           |
| Bottom sheet                    | Tonal + shadow           |
| Dialogs                         | Tonal + shadow           |
| Chips, menus, tooltips          | Tonal only               |

---

## Typography Scale

M3 typography uses 5 roles with 3 sizes each. All sizes in `sp` (scales with user font preferences).

| Role        | Large | Medium | Small |
|-------------|-------|--------|-------|
| Display     | 57sp  | 45sp   | 36sp  |
| Headline    | 32sp  | 28sp   | 24sp  |
| Title       | 22sp  | 16sp   | 14sp  |
| Body        | 16sp  | 14sp   | 12sp  |
| Label       | 14sp  | 12sp   | 11sp  |

**Usage guidelines:**
- `displayLarge`: hero text, splash screens — rarely used in functional UI
- `headlineMedium`: section titles, card headers
- `titleLarge`: app bar titles
- `bodyLarge`: primary body text — the default for readable content
- `bodyMedium`: secondary text, descriptions
- `labelLarge`: button labels (M3 default for buttons)
- `labelSmall`: captions, timestamps, metadata

**In Compose:**
```kotlin
Text(text, style = MaterialTheme.typography.bodyLarge)
```

---

## Key M3 Components

**FAB (Floating Action Button)**
- `FloatingActionButton`: primary action (medium size)
- `SmallFloatingActionButton`: secondary or contextual actions
- `ExtendedFloatingActionButton`: when text label adds clarity; collapses on scroll
- Color: `primaryContainer` background, `onPrimaryContainer` icon — not `primary`
- Placement: bottom-end; move to bottom-center only on very narrow screens

**Cards**
- `ElevatedCard`: tonal elevation, subtle shadow — default for most content cards
- `FilledCard`: `surfaceVariant` background, no elevation — for grouped/list content
- `OutlinedCard`: border only, no elevation — for selectable or low-emphasis content
- Never use all three card types in the same screen

**Chips**
- `AssistChip`: suggestions, actions — does not represent state
- `FilterChip`: toggleable, represents applied filters
- `InputChip`: represents entered values (email tags, selected options)
- `SuggestionChip`: dynamic recommendations (search suggestions)
- Touch target: 32dp chip height + sufficient padding to reach 48dp tap area

---

## Touch Target Minimum: 48×48dp

- All interactive components must have a 48×48dp touch target
- Visual size can be smaller (e.g., 24dp icon) — use padding or `Modifier.minimumTouchTargetSize()` in Compose
- `Modifier.minimumTouchTargetSize()` is automatically applied by most M3 components
- For custom components, explicitly add it

---

## Shape System

M3 uses a shape scale with corner radius tokens:

| Token        | Default radius | Used by                            |
|--------------|---------------|------------------------------------|
| ExtraSmall   | 4dp           | Chips, text fields (corner)        |
| Small        | 8dp           | Snackbars, menus, tooltip          |
| Medium       | 12dp          | Cards, dialogs                     |
| Large        | 16dp          | Bottom sheets, navigation drawers  |
| ExtraLarge   | 28dp          | FABs, extended FABs                |
| Full         | 50%           | Badges, radio buttons              |

Custom shapes must use `RoundedCornerShape` with these tokens for visual consistency. Do not invent intermediate values.

---

## Motion: M3 Transitions

M3 defines 4 transition patterns for navigating between screens/components.

**Container transform**
- Morphs one element (card, FAB) into a destination screen
- Use when: tapping a card to open detail, FAB expanding to a compose screen
- Creates a direct visual link between trigger and destination

**Shared axis**
- X-axis: horizontal swipe between peers (onboarding pages, tabs)
- Y-axis: vertical scroll-linked transitions (drill down)
- Z-axis: zoom in/out for parent-child (folder → contents)

**Fade through**
- Fade out old content, fade in new — no directional relationship
- Use when: switching bottom nav tabs with unrelated content

**Fade**
- Simple fade for appearing/disappearing elements
- Use for: tooltips, snackbars, overlays that have no spatial relationship

**Duration guidance:**
- Simple components (snackbars, tooltips): 200ms
- Full-screen transitions: 300–400ms
- Never exceed 500ms for UI transitions

---

## Common Pitfalls

- Using M2 `MaterialTheme.colors` API instead of M3 `MaterialTheme.colorScheme`
- Skipping `dynamicColorScheme` check for SDK version
- Using `primary` color for FAB background (should be `primaryContainer` in M3)
- Mixing NavigationBar and NavigationDrawer on the same screen size class
- Hard-coding `sp` values instead of referencing `MaterialTheme.typography` tokens
- Applying shadow elevation without tonal elevation in M3 surfaces
