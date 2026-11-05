# Accessibility — WCAG AA Compliance Patterns

## Contrast Ratios

WCAG 2.1 Level AA requirements:

| Text type                    | Minimum ratio | Notes                                     |
|-----------------------------|---------------|-------------------------------------------|
| Normal text (< 18px normal, < 14px bold) | 4.5:1 | Most body copy and UI labels     |
| Large text (18px+ normal, 14px+ bold)    | 3:1   | Headings, display text           |
| UI components (borders, icons)           | 3:1   | Input borders, focus rings, icons |
| Disabled elements                        | exempt | Does not need to meet contrast   |

Common failures:
- `text-slate-400` on white: 2.5:1 — FAILS
- `text-slate-500` on white: 3.9:1 — FAILS for body, passes for large text
- `text-slate-600` on white: 5.9:1 — PASSES
- `text-blue-400` on white: 3.0:1 — FAILS for body, borderline for large

---

## Quick Contrast Check in Browser DevTools

1. Open DevTools → Elements panel
2. Click on any text element
3. In Styles panel, click the color swatch next to the text color property
4. The color picker shows the contrast ratio automatically — a badge shows AA/AAA pass/fail
5. For non-text elements: inspect the element's border or icon color the same way

Chrome DevTools also has an "Accessibility" tab in the Elements panel that shows the full accessibility tree, roles, and computed properties for any element.

---

## Touch Targets — 44×44px Minimum

Apple HIG requires 44×44px touch targets. WCAG 2.5.5 (Level AAA) recommends 44×44px; WCAG 2.5.8 (Level AA, WCAG 2.2) requires 24×24px minimum. Aim for 44×44px.

**The problem:** small icons (16px, 20px) are visually correct but untappable on mobile.

**Solution: invisible padding with `min-w` and `min-h`:**

```html
<!-- Icon-only button with 44px touch target -->
<button
  class="
    inline-flex items-center justify-center
    min-w-[44px] min-h-[44px]
    rounded-md
    text-slate-500 hover:text-slate-900
    focus-visible:ring-2 focus-visible:ring-blue-600
  "
  aria-label="Close"
>
  <!-- Visual icon is only 20px -->
  <svg class="h-5 w-5" ...>...</svg>
</button>
```

Alternatively, use padding to inflate the hit area:

```html
<button class="p-[12px]" aria-label="Settings">
  <svg class="h-5 w-5">...</svg>
  <!-- Total: 20 + 24 = 44px in each dimension -->
</button>
```

---

## Focus Management

### Modal Focus Trap

When a modal opens, focus must be trapped inside it. When it closes, focus must return to the element that triggered it.

```tsx
// Using @radix-ui/react-dialog handles this automatically.
// If implementing manually:

function Modal({ isOpen, onClose, triggerRef }) {
  const modalRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    // Move focus into modal
    const focusable = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    focusable?.[0]?.focus();

    // Trap Tab key
    function handleKeyDown(e) {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key !== 'Tab') return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Return focus on close
  useEffect(() => {
    if (!isOpen) triggerRef.current?.focus();
  }, [isOpen]);
}
```

### Skip Navigation Link

Place this as the very first element in `<body>`. Hidden by default, visible on focus:

```html
<a
  href="#main-content"
  class="
    sr-only focus:not-sr-only
    focus:fixed focus:top-4 focus:left-4
    focus:z-50 focus:px-4 focus:py-2
    focus:bg-white focus:text-blue-600
    focus:rounded focus:shadow-lg
    focus:ring-2 focus:ring-blue-600
  "
>
  Skip to main content
</a>

<!-- ... nav, header ... -->

<main id="main-content" tabindex="-1">
  <!-- page content -->
</main>
```

`tabindex="-1"` on `<main>` allows programmatic focus (`.focus()`) without adding it to the tab order.

---

## ARIA Roles — When to Use Them

The correct answer is almost always: **use the native HTML element** instead of adding a role.

| Situation                          | Wrong                         | Right                            |
|------------------------------------|-------------------------------|----------------------------------|
| Clickable non-link                 | `<div role="button">`         | `<button>`                       |
| Navigation landmark                | `<div role="navigation">`     | `<nav>`                          |
| Main content area                  | `<div role="main">`           | `<main>`                         |
| Form field label                   | `<div id="lbl">` + aria-labelledby | `<label for="input">`      |
| Checkbox                           | `<div role="checkbox">`       | `<input type="checkbox">`        |

Use `role="button"` on a div **only** when you absolutely cannot use `<button>` (e.g., contenteditable context, third-party component APIs). When you do, you must also add `tabindex="0"` and keyboard event handlers for Enter and Space.

**Custom components that need roles:**

```html
<!-- Custom tab interface -->
<div role="tablist" aria-label="Account sections">
  <button role="tab" aria-selected="true" aria-controls="panel-1" id="tab-1">Profile</button>
  <button role="tab" aria-selected="false" aria-controls="panel-2" id="tab-2">Billing</button>
</div>
<div role="tabpanel" id="panel-1" aria-labelledby="tab-1">...</div>
```

---

## Screen Reader Patterns

### aria-label vs aria-labelledby vs aria-describedby

```html
<!-- aria-label: provide a label directly when no visible text exists -->
<button aria-label="Close dialog">
  <svg aria-hidden="true">...</svg>
</button>

<!-- aria-labelledby: point to existing visible text as the label -->
<section aria-labelledby="billing-heading">
  <h2 id="billing-heading">Billing</h2>
</section>

<!-- aria-describedby: provide supplementary description (read after label) -->
<input
  id="email"
  type="email"
  aria-describedby="email-hint email-error"
/>
<p id="email-hint">Enter your work email address.</p>
<p id="email-error" role="alert">This email is already in use.</p>
```

### Icon-only buttons — always provide a text label

```html
<!-- Wrong: screen reader reads "SVG" or nothing -->
<button>
  <svg>...</svg>
</button>

<!-- Right: label the button, hide the icon from assistive tech -->
<button aria-label="Delete item">
  <svg aria-hidden="true" focusable="false">...</svg>
</button>
```

`aria-hidden="true"` removes the element from the accessibility tree. `focusable="false"` is needed for SVGs in IE/older Edge which otherwise include SVGs in the focus order.

---

## Live Regions — Dynamic Content Announcements

When content updates without a page reload, screen readers don't automatically notice. Use `aria-live` to announce updates.

```html
<!-- Status messages (non-urgent) -->
<div aria-live="polite" aria-atomic="true" class="sr-only" id="status-announcer">
  <!-- Injected by JS: "3 results found" / "Item saved" -->
</div>

<!-- Urgent alerts (interrupts current reading) -->
<div role="alert">
  Payment failed. Please check your card details.
</div>
```

`role="alert"` is equivalent to `aria-live="assertive"` — it interrupts the screen reader. Use only for errors, not success messages.

`aria-atomic="true"` tells the reader to announce the entire region's content when any part changes, not just the changed part.

---

## Common Violations Checklist

- [ ] **Clickable div without role/keyboard support** — use `<button>` or add `role="button" tabindex="0"` + keyboard handler
- [ ] **Icon-only button without label** — add `aria-label` and `aria-hidden` on SVG
- [ ] **Missing form labels** — every `<input>` needs an associated `<label>` (via `for`/`id` or wrapping)
- [ ] **`outline: none` without focus-visible replacement** — always provide a visible focus style
- [ ] **Contrast failures** — check all text below text-slate-600 and all light colors on white
- [ ] **Images without alt text** — decorative images need `alt=""`, informative images need descriptive alt
- [ ] **Modal without focus trap** — keyboard users can tab out of the modal into the obscured page behind
- [ ] **No skip navigation link** — keyboard users must tab through entire nav on every page
- [ ] **Small touch targets on mobile** — interactive elements < 44×44px effective area
- [ ] **Color as the only differentiator** — error state must also use an icon or text, not just red color
