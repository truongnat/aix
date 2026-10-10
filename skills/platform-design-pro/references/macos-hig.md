# macOS Human Interface Guidelines — Desktop App Patterns

## Window Chrome: The Three-Panel Layout

macOS apps organize content with up to three panels. Understanding when to use each prevents over-engineering.

**Sidebar (source list / navigator)**
- Leading panel: lists categories, folders, items that drive the main content area
- Two types:
  - *Source list*: icon + label rows, used in Finder, Mail, Notes — for primary navigation
  - *Regular sidebar*: can contain richer controls, used in System Settings
- Width: typically 200–260pt; user-resizable
- Use `NSOutlineView` (AppKit) or `NavigationSplitView` with `.sidebar` column style (SwiftUI)
- Should never be the only way to navigate (keyboard shortcuts required)

**Content area (center)**
- Primary work area — always visible, takes remaining width
- Can be a list, a canvas, a form, or a split within itself

**Inspector / Detail panel (trailing)**
- Optional right panel for contextual info about the selection
- Do not show it by default unless inspection is the primary workflow
- Xcode's right panel, Keynote's inspector are canonical examples
- Toggle via toolbar button; persist the state in `UserDefaults`

**Combined pattern:** Sidebar + Content is sufficient for most apps. Add inspector only when contextual metadata is substantial and frequently used.

---

## Controls: Button Hierarchy

macOS buttons have a strict visual hierarchy. Violating it creates visual noise.

**Default / Primary button**
- Blue fill, keyboard shortcut is Return
- Only one per window/dialog
- Label: verb phrase ("Save", "Send Message", not "OK")

**Secondary button**
- Bordered, no fill
- Used for alternative actions adjacent to the primary

**Tertiary / Borderless**
- No border, no fill
- For low-emphasis actions that don't need visual weight
- Common in toolbars, headers

**Pull-down menu button**
- Combines a label with a chevron — reveals a menu of related actions
- Use when a single button would need 3+ variants (e.g., "Export as PDF/PNG/TIFF")
- Not a split button (which has a separate click target and dropdown target)

**Destructive buttons**
- Use the `hasDestructiveAction` modifier or red tint for irreversible actions
- Place them away from the default button — accidental clicks are catastrophic on desktop

---

## Menu Bar

macOS apps have a global menu bar. This is not optional — it is required for Mac Catalyst and AppKit apps.

**Standard menu structure:**
`AppName | File | Edit | View | Window | Help`

- `AppName` menu: About, Preferences/Settings (⌘,), Services, Hide (⌘H), Quit (⌘Q)
- Never put app-critical actions only in contextual menus — they must also appear in the menu bar
- All destructive operations need a menu bar entry with a keyboard shortcut

**Keyboard shortcut conventions:**
- ⌘Z = Undo, ⌘⇧Z = Redo (always)
- ⌘C/X/V = Copy/Cut/Paste
- ⌘S = Save, ⌘⇧S = Save As
- ⌘W = Close window, ⌘Q = Quit
- ⌘, = Preferences/Settings (expected by every macOS user)
- ⌘F = Find
- Function-specific shortcuts: use ⌘ + letter for primary, ⌘⇧ + letter for variant, ⌥⌘ + letter for advanced
- Never override system shortcuts — ⌘Space, ⌘Tab, ⌘` are reserved

---

## Trackpad Gestures macOS Apps Must Respect

macOS users expect these gestures to work in any app:

- **Two-finger scroll**: always enable for scrollable content
- **Pinch to zoom**: expected in any content where zooming makes sense (maps, images, PDFs)
- **Two-finger swipe back/forward**: browser-style navigation; honor it in document-based apps
- **Three-finger drag**: system window management — do not intercept
- **Double-tap to zoom**: in WebKit views, this resets zoom level
- **Smart zoom** (double-tap with two fingers): fit-to-width or fit-to-screen

**In SwiftUI:** `.gesture(MagnificationGesture())` for pinch, `ScrollView` for two-finger scroll (automatic).
**In AppKit:** override `scrollWheel(_:)` and `magnifyWithEvent(_:)` carefully.

---

## Sidebar Patterns: Source List vs Regular

**Source list:**
- Icon (16pt SF Symbol) + text label rows
- Collapsible group headers (⌄ disclosure triangles)
- Selection state changes the main content
- Never put complex controls inside source list rows
- Used by: Finder, Mail, Notes, Reminders, Music

**Regular sidebar:**
- Can contain sliders, steppers, pickers, groupings
- More like a settings panel than a navigator
- Used by: System Settings, Keynote (inspector variant)

**Rule:** if the sidebar is driving navigation ("show me these items"), use source list. If it's configuring something ("set these properties"), use a regular sidebar or inspector.

---

## Typography: SF Pro Display vs SF Pro Text

**SF Pro Text:** body sizes — optimized for 17pt and below
- Better letter spacing at small sizes
- Use for: body copy, labels, form fields, menus

**SF Pro Display:** display sizes — optimized for 20pt and above
- Tighter letter spacing at large sizes, optically corrected
- Use for: window titles, hero text, large headings

**In code:** the system automatically serves the correct variant when you use system fonts:
```swift
// AppKit
NSFont.systemFont(ofSize: 13)      // → SF Pro Text
NSFont.systemFont(ofSize: 28)      // → SF Pro Display

// SwiftUI
Text("Title").font(.largeTitle)    // → SF Pro Display automatically
Text("Body").font(.body)           // → SF Pro Text automatically
```

**Monospace:** SF Mono for code, terminal output, fixed-width data.

---

## Document-Based vs Single-Window Architecture

**Document-based app:**
- Multiple windows, each tied to a file (`NSDocument` subclass)
- File menu with New, Open, Open Recent, Close, Save, Revert
- Supports iCloud and autosave automatically via AppKit
- Examples: TextEdit, Preview, Pages, Xcode
- Use when the app creates or edits distinct, saveable files

**Single-window app:**
- One main window (possibly with multiple panels)
- Manages its own data model — not file-based
- Examples: Music, Calendar, Reminders, System Settings
- Use for utilities, viewers, communication apps, tools with no discrete "documents"

**Hybrid:** apps can open auxiliary windows (Quick Look, inspector popouts) even if single-window at heart.

---

## Vibrancy Effects: NSVisualEffectView

Vibrancy blends UI elements with content behind them — sidebars, menus, sheets.

**When to use:**
- Sidebars: `.sidebar` material — dark translucent, shows wallpaper and windows behind
- Popovers and menus: automatic via `NSPopover` and `NSMenu`
- Tool palettes, HUDs: `.hudWindow` appearance
- Sheet backgrounds: `.sheet` material

**When NOT to use:**
- Main content area — vibrancy in the editor/canvas is distracting
- Over media playback — causes visual interference
- As decoration on arbitrary views without a meaningful layering context

**In SwiftUI:**
```swift
.background(.regularMaterial)    // frosted glass
.background(.thickMaterial)      // more opaque
.background(.sidebar)            // sidebar-appropriate translucency
```

---

## Toolbar Buttons

macOS toolbars are highly customizable — users can rearrange them (right-click → Customize Toolbar).

- Icon-only toolbar buttons are acceptable **with a tooltip** — always set `toolTip`
- Labels below icons are optional; use them for less-familiar actions
- Do not put primary workflow actions only in the toolbar — they must also be in the menu bar
- Use `NSToolbarItem` (AppKit) or `.toolbar { }` modifier (SwiftUI)
- Symbol size: 16pt SF Symbols for toolbar; `symbolConfiguration = .init(pointSize: 16)`
- Toggle items (sidebar toggle, inspector toggle) use `.toggleSidebar` standard toolbar item

**Customization:** support `NSToolbarItem.Identifier` properly so user customization persists across launches.

---

## Common Pitfalls

- Building iOS-style tabs at the bottom of a macOS window (tab bars belong at the top in macOS)
- Missing ⌘, for Settings — macOS users expect it
- Source list rows with embedded buttons (delete, share) — use contextual menus instead
- Using `UINavigationController` patterns ported to Mac Catalyst without adaptation
- Ignoring the menu bar entirely — required for Mac App Store distribution
- Applying iOS-style modal sheets that cover the full window — macOS sheets attach to the top of the window, not full-screen
