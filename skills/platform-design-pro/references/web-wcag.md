# WCAG 2.1 AA Compliance Guide for Web UI

## The 4 WCAG Principles (POUR)

Every WCAG criterion maps to one of four principles. Understanding the principle explains the intent behind the rule.

**Perceivable:** information and UI components must be presentable to users in ways they can perceive. If a user can't see it (visual impairment), can they hear it? If they can't hear it, can they read it?

**Operable:** UI components and navigation must be operable. If a user can't use a mouse, can they use a keyboard? If they can't use a keyboard, can they use a switch?

**Understandable:** information and operation must be understandable. Is the language clear? Do errors explain what went wrong and how to fix it?

**Robust:** content must be robust enough to be interpreted by current and future user agents. Does it work with assistive technologies? Is the HTML semantically valid?

Failures at POUR are always diagnostic: "this fails because it's not perceivable" points directly to the fix.

---

## Level AA Requirements (The Target for Most Products)

### 1.4.3 — Contrast Minimum

**Rule:** text must have a 4.5:1 contrast ratio against its background. Large text (18pt+ or 14pt+ bold) needs only 3:1.

**Large text definition:**
- Normal weight: 18pt (24px) or larger
- Bold weight: 14pt (~18.67px) or larger

**What counts:**
- Body text, labels, links, button text: 4.5:1
- Placeholder text in inputs: 4.5:1 (it's real text)
- Text over images: must meet ratio against all possible background regions
- Logo text: exempt
- Decorative text (purely visual, no information): exempt

**Testing:** Figma's Contrast plugin, Chrome DevTools accessibility panel, or `https://webaim.org/resources/contrastchecker/`.

**Common failure:** light gray body text (`#999` on white = 2.85:1 — fails). Minimum viable gray on white: `#767676` (4.54:1).

---

### 1.4.4 — Resize Text

**Rule:** text can be resized up to 200% without loss of content or functionality, without assistive technology.

**What this means in practice:**
- Browser zoom at 200% must not cause horizontal scrolling at standard viewport widths
- Do not use `max-height` on text containers that clips text at 200%
- `overflow: hidden` on text containers with fixed heights fails this
- Fixed-pixel font sizes combined with fixed-pixel containers fail this

**Correct approach:**
- Use `rem` for font sizes (scales with browser font setting)
- Use `min-height` instead of `height` for text containers
- Test by going to browser settings, setting base font to 32px (200% of 16px), then checking every screen

---

### 2.1.1 — Keyboard Accessible

**Rule:** all functionality available via mouse must also be available via keyboard.

**Core keyboard contract:**
- Tab: moves focus forward through interactive elements
- Shift+Tab: moves focus backward
- Enter/Space: activates buttons, links, checkboxes
- Arrow keys: navigate within components (menus, radio groups, tabs, sliders)
- Escape: closes dialogs, menus, tooltips

**Custom component requirements:**
- A custom dropdown? It needs Enter to open, Arrow keys to navigate options, Enter to select, Escape to close
- A drag-and-drop list? It needs keyboard reordering (e.g., Space to pick up, Arrow to move, Space to drop)
- A date picker? Full keyboard navigation within the calendar grid

**Test:** unplug the mouse, complete your app's core user flow. If you get stuck, something fails 2.1.1.

---

### 2.4.3 — Focus Order

**Rule:** if a page can be navigated sequentially, the focus order must preserve meaning and operability.

**The problem:** CSS and JavaScript can visually reorder elements while the DOM order (which Tab follows) stays different. This creates disorienting experiences for keyboard users.

**Rules:**
- DOM order should match visual reading order
- Modals: when a modal opens, focus must move inside it. When it closes, focus must return to the trigger element
- Dynamic content: when new content appears (toast, error message), focus should go to it if it requires action
- Skip links: provide a "Skip to main content" link as the first focusable element

**Common failure:** a modal dialog that appears visually centered, but tab focus is still cycling through the background content behind it.

---

### 2.4.7 — Focus Visible

**Rule:** any keyboard-operable interface has a visible focus indicator.

**Common failure:** `outline: none` or `outline: 0` in CSS. This was added by designers who disliked the default browser focus ring — it breaks keyboard navigation for everyone who uses it.

**Correct approach:**
```css
/* Remove default outline only if you replace it */
:focus {
  outline: none;
}
:focus-visible {
  outline: 3px solid #0066FF;
  outline-offset: 2px;
  border-radius: 2px;
}
```

- Use `:focus-visible` (not `:focus`) to hide the ring for mouse clicks while keeping it for keyboard
- Focus ring must have 3:1 contrast against adjacent colors (WCAG 2.2 raises this to non-color change)
- Minimum: visible. Better: 3px solid, high-contrast color, offset from element edge

---

### 3.2.3 — Consistent Navigation

**Rule:** navigation mechanisms that appear on multiple pages appear in the same relative order each time.

**What this means:**
- Top nav: same items, same order on all pages
- Sidebar: same structure; don't add items on some pages and remove on others
- Footer: same across pages

**What is allowed:**
- Highlighting the current page item in nav
- Expanding/collapsing nav sections (the sections remain in the same order)
- Breadcrumbs reflecting current location

**Common failure:** a mobile nav drawer that has different items on the product page vs the account page.

---

### 4.1.2 — Name, Role, Value

**Rule:** all UI components have an accessible name, a role that can be determined programmatically, and state/values that can be set and reported.

**Name:** what the screen reader announces as the label
- Buttons: visible label text (preferred), `aria-label`, or `aria-labelledby`
- Inputs: associated `<label>` element (not placeholder — placeholder is not a name)
- Icons with no text: `aria-label` on the button wrapping the icon
- Images: `alt` attribute

**Role:** the semantic purpose
- Use semantic HTML elements: `<button>`, `<nav>`, `<main>`, `<header>`, `<dialog>`
- Custom components: use ARIA roles — `role="dialog"`, `role="listbox"`, `role="option"`
- `<div onclick>` with no role = invisible to screen readers

**Value/state:**
- Toggles: `aria-pressed="true/false"`
- Expandable: `aria-expanded="true/false"`
- Selected in list: `aria-selected="true"`
- Invalid input: `aria-invalid="true"` + linked error message via `aria-describedby`

**Quick test:** install a screen reader (VoiceOver on Mac: Cmd+F5). Tab through your form. Does it announce "Email, text field" or "text field"? Does clicking a toggle announce its new state?

---

## Testing Tools

**axe DevTools (browser extension)**
- Scans the rendered DOM for WCAG violations
- Categorizes by impact: critical, serious, moderate, minor
- Links each violation to the WCAG criterion
- Free core, paid version adds guided testing
- Run it on every page state, including: empty state, error state, loading state, filled form

**Lighthouse (Chrome DevTools)**
- Accessibility audit built into Chrome
- Score 0–100; aim for 90+ (100 is achievable with effort)
- Does not catch everything (contrast over images, keyboard traps) — supplement with axe
- Run in Incognito to avoid extension interference

**VoiceOver (macOS / iOS)**
- macOS: Cmd+F5 to toggle; navigate with Tab and arrow keys in web browser
- iOS: Settings → Accessibility → VoiceOver; swipe right to move through elements
- Test: can you complete the core flow without seeing the screen?

**NVDA (Windows, free)**
- The most widely used screen reader for Windows
- Test in Firefox for maximum NVDA compatibility
- Key test: does your custom dropdown announce options as you navigate?

---

## Common Failures and Fixes

| Failure                               | Fix                                                            |
|---------------------------------------|----------------------------------------------------------------|
| `outline: none` on focused elements   | Use `:focus-visible` with a visible replacement style          |
| `<div>` click handlers                | Replace with `<button>` or add `role`, `tabindex`, keyboard handler |
| Icon-only buttons with no label       | Add `aria-label="Close"` to the button                        |
| Placeholder used as input label       | Add a real `<label>` element; placeholder is supplemental      |
| Color as the only error indicator     | Add text error message; don't rely on red border alone         |
| `4.5:1` contrast not met              | Darken text color; don't lighten — lightening reduces contrast |
| Modal doesn't trap focus              | Use `focus-trap` library or `inert` attribute on background    |
| Missing `alt` on informative images   | Add descriptive `alt` text; decorative images get `alt=""`     |
| `aria-label` on non-interactive element | Move `aria-label` to the interactive element (button, link)  |
| Auto-playing video with audio         | Add pause control; or don't autoplay audio (1.4.2)            |
| Table without headers                 | Add `<th scope="col">` and `<th scope="row">`                  |
| Missing `lang` attribute on `<html>`  | Add `<html lang="en">` — screen readers use this for pronunciation |

---

## WCAG 2.2 Preview (Beyond AA)

WCAG 2.2 is published and increasingly required. Key additions:

- **2.4.11 Focus Appearance (AA):** Focus indicator must have minimum size (perimeter) and contrast — not just "visible"
- **2.4.12 Focus Not Obscured (AA):** Sticky headers/footers must not fully hide focused elements
- **2.5.7 Dragging Movements (AA):** All drag-to-operate functionality needs a pointer alternative
- **2.5.8 Target Size Minimum (AA):** Interactive targets minimum 24×24px (weaker than iOS's 44pt but a floor)
- **3.2.6 Consistent Help (AA):** Help mechanisms (chat, phone, FAQ) appear in consistent location across pages

Start auditing for 2.2 now — it will become the expected baseline within 2 years.
