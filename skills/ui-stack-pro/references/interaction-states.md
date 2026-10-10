# Interaction States — 5-State Model

## The 5 States and Their Communication

Every interactive element communicates its status through visual state changes. Missing states create confusion or inaccessibility.

| State    | User signal                                      | Primary visual change              |
|----------|--------------------------------------------------|------------------------------------|
| Default  | "This is interactive, nothing special"           | Base styles                        |
| Hover    | "You are about to interact with this"            | Lightness/color shift, cursor      |
| Focus    | "This element is keyboard-targeted"              | Visible outline ring               |
| Active   | "You are currently pressing this"                | Scale or brightness shift          |
| Disabled | "This is not interactive right now"              | Opacity, cursor change             |

A clickable div with no hover, focus, or active state is a usability failure. Users cannot tell if it responded to their interaction.

---

## State-by-State Implementation

### Default
Base styles — no modification. This is your reference point.

```html
<button class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-semibold">
  Submit
</button>
```

### Hover
10–15% lightness shift. Transition smoothly.

- Solid buttons: darken background by one Tailwind step (600 → 700)
- Ghost/outline buttons: add tinted background (transparent → primary-50)
- Links: underline appears or color shifts

```html
<!-- Solid primary button -->
<button class="bg-blue-600 hover:bg-blue-700 transition-colors duration-200 ...">

<!-- Ghost button -->
<button class="bg-transparent hover:bg-blue-50 text-blue-600 border border-blue-600 ...">

<!-- Destructive -->
<button class="bg-red-600 hover:bg-red-700 ...">
```

Cursor must be `cursor-pointer` on all interactive elements that are not native links or buttons. (Native `<a>` and `<button>` already have pointer cursor in most browsers.)

### Focus
2px ring offset, ring color = brand accent. Keyboard users must see this.

```html
<button class="
  focus-visible:outline-none
  focus-visible:ring-2
  focus-visible:ring-blue-600
  focus-visible:ring-offset-2
  ...
">
```

`ring-offset-2` creates a small gap between the element and the ring — this prevents the ring from blending into the element's own background color.

Never do `outline: none` without providing a `focus-visible` ring replacement. This is a WCAG 2.4.7 failure.

### Active
Pressed state. 200ms or less — it should feel snappy, not slow.

```html
<button class="active:scale-95 active:brightness-90 transition-transform duration-100 ...">
```

For buttons: `scale-95` (5% scale-down) is the standard. Avoid going below `scale-90` — it reads as glitchy on small elements.

For nav items: background shift is sufficient, no scale needed.

### Disabled

```html
<button
  disabled
  class="opacity-40 cursor-not-allowed pointer-events-none bg-blue-600 text-white ..."
>
```

Three rules for disabled:
1. `opacity-40` (not 50%) — 50% often looks like a valid lighter variant, not disabled
2. `cursor-not-allowed` — communicates non-interactability
3. `pointer-events-none` — prevents click events leaking through (important for wrapped elements)

Do not change the button shape or layout when disabling — the disabled version should be visually recognizable as the same element.

---

## focus-visible vs focus

This distinction matters for keyboard-only accessibility without penalizing mouse users:

```css
/* Old approach — shows ring on ALL interactions including mouse click */
button:focus {
  outline: 2px solid blue;
}

/* Modern approach — shows ring ONLY when navigated via keyboard */
button:focus-visible {
  outline: 2px solid blue;
  outline-offset: 2px;
}

button:focus:not(:focus-visible) {
  outline: none;
}
```

In Tailwind, use `focus-visible:ring-2` instead of `focus:ring-2`. The difference: clicking a button with a mouse won't show the ring (less visual noise), but tabbing to it will (accessibility maintained).

---

## Full Button — All 5 States in Tailwind

```html
<button
  class="
    inline-flex items-center justify-center
    px-4 py-2 rounded-md
    text-sm font-semibold text-white
    bg-blue-600

    hover:bg-blue-700
    hover:cursor-pointer

    focus-visible:outline-none
    focus-visible:ring-2
    focus-visible:ring-blue-600
    focus-visible:ring-offset-2

    active:scale-95
    active:brightness-90

    disabled:opacity-40
    disabled:cursor-not-allowed
    disabled:pointer-events-none

    transition-all duration-150
  "
>
  Submit
</button>
```

---

## Form Input States

Input fields have a different state model — replace active/hover with error:

| State   | Border color  | Ring             | Tailwind                                      |
|---------|---------------|------------------|-----------------------------------------------|
| Default | slate-300     | none             | `border border-slate-300`                     |
| Focus   | blue-500      | ring-2 blue-500  | `focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20` |
| Error   | red-500       | ring-2 red-500   | `border-red-500 ring-2 ring-red-500/20`       |
| Disabled| slate-200     | none, bg-slate-50| `border-slate-200 bg-slate-50 cursor-not-allowed` |

The ring on inputs should use `/20` opacity — a transparent ring rather than a solid one. This is less aggressive than button focus rings since inputs are expected to be focused during normal form use.

Error state should be applied via JavaScript (not CSS-only :invalid) to avoid triggering before the user has interacted with the field.

---

## Loading State — The 6th Quasi-State

Loading is not one of the 5 standard states but appears constantly in product UI. Three patterns:

### Skeleton (preferred for content areas)
Replace content with animated gray blocks matching the content's shape. Do not show spinners in place of card content.

```html
<div class="animate-pulse">
  <div class="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
  <div class="h-4 bg-slate-200 rounded w-1/2"></div>
</div>
```

### Spinner (for button actions)
Replace button label + icon with a spinner. Keep button size fixed to prevent layout shift.

```html
<button disabled class="...">
  <svg class="animate-spin h-4 w-4 mr-2" ...>...</svg>
  Saving...
</button>
```

### Opacity (for in-place loading)
Reduce content opacity to 50% while overlaying a spinner. Good for table refreshes.

Rule of thumb: skeleton for first load, spinner for user-triggered actions, opacity for background refreshes.
