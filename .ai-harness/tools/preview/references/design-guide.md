# Preview Design Guide

The preview engine does **not** ship fixed page templates. You (the agent) generate
the page body HTML dynamically for each question or result, following this guide.
The engine only wraps your HTML in a minimal shell (offline Tailwind + callback
glue) and captures the response.

## The two contracts you must honor

These are the only hard requirements. Everything else is your design freedom.

**Choice page (for `askVisualQuestion`)**
- Every option must have a clickable element carrying `data-choice="<id>"`, where
  `<id>` matches an `id` you passed in `choices`.
- Clicking it posts that id back and shows the "recorded" banner automatically.

**Confirm page (for `confirmVisualResult`)**
- Include one element with `id="confirm"` and one with `id="reject"`.
- Confirm posts `{confirmed:true}`; reject prompts for a reason and posts it.

## Aesthetic direction: soft elevated, with liquid glass as an option

The engine (shell + server) only does transport — it has no opinion on look and
feel. Everything below is guideline for *you* to apply inside `bodyHtml`; nothing
here is injected automatically. Pick per page based on what the content is.

**Default — soft elevated (opaque):** chosen directly by the maintainer
(2026-06-21) via this engine's own `askVisualQuestion`. Use this for anything
data-dense — tables, comparisons, reports. Rounded-2xl, `bg-white`, lifted shadow,
tinted badges, dark-gradient primary actions, hover lift.

**Opt-in — liquid glass (translucent):** for pages where the visual treatment
itself is part of what's being judged (a UI mockup, a hero confirm screen). You
must add the ambient color blobs yourself (see below) — without them behind it, a
glass card just looks like gray fog. Don't reach for this as the default; reach
for it when translucency is actually the point.

**Palette (both variants):** `stone` neutrals for page/text, `emerald` for
positive, `red` for negative, `amber` for warning, `sky` for informational. One
accent at a time per card — don't mix accents on the same card.

**Page shell — write this yourself, the engine doesn't add it:**
```html
<main class="mx-auto max-w-5xl px-6 py-12">
  <p class="mb-2 text-xs font-medium uppercase tracking-wide text-stone-400">Harness · <!-- context --></p>
  <h1 class="mb-8 text-3xl font-semibold tracking-tighter text-stone-900"><!-- title --></h1>
  <!-- content -->
</main>
```

**Card, soft-elevated (default):**
```html
<article class="group rounded-2xl bg-white p-6 shadow-lg ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl">
  <header class="mb-1 text-xs font-medium uppercase tracking-wide text-stone-400">Label</header>
  <h2 class="mb-5 text-xl font-semibold tracking-tight text-stone-900">Heading</h2>
  <!-- body -->
</article>
```

**Card, liquid glass (opt-in) — requires the ambient blobs below in the same page:**
```html
<!-- include once per page, before your content, if you're opting into glass -->
<div class="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
  <div class="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl"></div>
  <div class="absolute top-1/3 -right-20 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl"></div>
  <div class="absolute -bottom-20 left-1/3 h-64 w-64 rounded-full bg-amber-100/40 blur-3xl"></div>
</div>

<article class="glass-panel group rounded-2xl p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl">
  <header class="mb-1 text-xs font-medium uppercase tracking-wide text-stone-400">Label</header>
  <h2 class="mb-5 text-xl font-semibold tracking-tight text-stone-900">Heading</h2>
  <!-- body -->
</article>
```
`.glass-panel`/`.glass-panel-strong` (bundled component classes, see `styles.css`)
already include the translucent background, blur, and ring — don't layer
`bg-white`, `shadow-lg`, or `ring-1 ring-black/5` on top of them, that's the
opaque variant's recipe, not glass's. Use `.glass-panel-strong` for the single
most important surface on a glass page (a hero card, the main confirm panel).

Don't mix variants on the same page — a page is either soft-elevated or liquid
glass, not cards of both kinds side by side.

**Status badge (pill, tinted by status):**
```html
<div class="flex items-center justify-between rounded-xl bg-emerald-50 px-3 py-2 ring-1 ring-emerald-600/20">
  <span class="text-sm text-stone-700">claude</span>
  <span class="rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-emerald-700 shadow-sm">installed</span>
</div>
<!-- swap emerald -> red/amber/sky for other statuses -->
```

**Primary button (gradient + shadow, for the choice/confirm trigger itself):**
```html
<button data-choice="<id>" class="rounded-xl bg-gradient-to-br from-stone-900 to-stone-700 px-5 py-2.5 text-sm font-medium text-white shadow-md transition hover:shadow-lg active:scale-95">
  Choose this
</button>
```

**Secondary button (reject / less prominent action):**
```html
<button id="reject" class="rounded-xl border border-stone-300 bg-white px-5 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-100 active:scale-95">
  Reject — something's off
</button>
```

**Layout for comparisons:** `grid gap-6 md:grid-cols-2` (2 options) or
`md:grid-cols-3` (3 options). Don't go past 3 side by side — stack instead.

**Selection feedback:** handled for you — the engine's CSS adds lift + shadow + a
faint ring to whatever `data-choice` element gets clicked (`.is-selected`). Don't
build your own selected-state styling.

## Spacing system

A consistent rhythm, not ad hoc numbers. Use these by role, not by feel:

| Role | Classes |
|---|---|
| Page margin | `px-6 py-12` on the outer `<main>` |
| Card padding | `p-6` (use `p-5` only for denser, secondary cards) |
| Gap between cards in a comparison | `gap-6` (`gap-8` if there's room to breathe) |
| Gap between stacked items inside a card | `space-y-2.5` for tight lists, `space-y-3` for looser ones |
| Space below eyebrow label → title | `mb-2` (eyebrow), `mb-8` (title → content) |
| Inline icon/dot to text | `gap-1.5` |

Don't introduce a one-off value (`p-7`, `mt-9`) when a role above already covers
the case — consistency across pages matters more than a perfect pixel fit.

## Border, ring & dividers — pick the right one

Three distinct tools, not interchangeable:

- **Card edges → `ring-1 ring-black/5` + `shadow-lg`.** Never `border` on a card in
  this style; a hard border looks flat next to the soft shadow.
- **Tinted containers (status rows, callouts) → `ring-1 ring-{color}-600/20`**
  (or `ring-{color}-200`), matching the background tint.
- **List/table row separators → `border-b border-stone-100`** (or `divide-y
  divide-stone-100` on the container instead of per-row borders). This is the one
  place a hard hairline is correct — it's a divider, not an edge.

## Background treatment

- **Page:** `bg-gradient-to-b from-stone-50 to-white` on `<body>` — handled by the
  shell already, don't redeclare it.
- **Cards:** solid `bg-white`. Don't tint a card's own background; let the ring/shadow
  carry the elevation.
- **Status containers/badges:** tinted (`bg-emerald-50`, `bg-red-50`, etc.) — the
  background *is* the status signal, paired with a matching ring.
- **Primary buttons:** `bg-gradient-to-br from-stone-900 to-stone-700` — the one
  place a gradient belongs. Don't gradient cards, page backgrounds, or secondary
  buttons.

## Motion

- **Entrance is automatic.** The shell wraps your body in `.animate-rise-in`
  (fade + rise, 0.4s) — you never add an entrance animation yourself.
- **Hover lift on cards/primary actions:** `transition-all duration-300
  hover:-translate-y-0.5 hover:shadow-xl` (cards) or `hover:shadow-lg` (buttons,
  smaller lift since they're already small).
- **Press feedback on every clickable trigger:** add `active:scale-95` alongside
  the hover classes so clicks feel responsive even before the callback resolves.
- **Selection feedback is automatic** (see above) — don't animate it yourself.
- Keep durations short (`duration-150` small UI bits, `duration-300` cards). Nothing
  in this system should run past 300ms.

## Icons: Lucide (bundled offline)

The engine bundles **Lucide** (`/lucide.js`, ~2000 icons, auto-initialized by the
shell). Write an `<i>` tag with `data-lucide="<name>"`; the shell replaces it with
real inline SVG after load.

```html
<i data-lucide="users" class="h-5 w-5 text-stone-500"></i>
<i data-lucide="check-circle" class="h-5 w-5 text-emerald-600"></i>
```

Size and color it like text — `h-4 w-4` / `h-5 w-5` / `h-6 w-6`, `text-{color}`
(Lucide icons inherit `currentColor` by default). Common names you'll reach for:
`check`, `x`, `check-circle`, `x-circle`, `alert-circle`, `alert-triangle`, `info`,
`chevron-right`, `chevron-down`, `arrow-right`, `user`, `users`, `database`,
`server`, `settings`, `search`, `home`, `bell`, `clock`, `calendar`, `mail`,
`lock`, `shield`, `star`, `trash`, `pencil`, `plus`, `minus`, `eye`, `download`,
`upload`, `refresh-cw`, `loader-circle`. Use exact Lucide names (kebab-case); an
unknown name silently renders nothing, so stick to well-known ones above rather
than guessing.

## Real diagrams: Mermaid (bundled offline)

For genuine structural diagrams — ER diagrams, flowcharts, sequence diagrams —
don't fake it with boxes and borders. The engine bundles **Mermaid** (`/mermaid.js`,
loaded and auto-initialized by the shell). Just write a `<pre class="mermaid">`
block with Mermaid syntax; it renders to real SVG with proper connector lines.

```html
<div class="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-black/5">
  <pre class="mermaid">
erDiagram
  CUSTOMERS ||--o{ ORDERS : places
  ORDERS ||--|{ ORDER_ITEMS : contains
  PRODUCTS ||--o{ ORDER_ITEMS : "ordered as"
  CUSTOMERS {
    uuid id PK
    text email
  }
  ORDERS {
    uuid id PK
    uuid customer_id FK
    text status
  }
  </pre>
</div>
```

Use this for: ER diagrams (`erDiagram`), flow/sequence of a process
(`flowchart TD`, `sequenceDiagram`), state machines (`stateDiagram-v2`). Don't use
it for things that are really just a list or a comparison table — Mermaid is for
when the *shape of the relationships* is the point. The theme is pre-set to
`neutral` to match the rest of the page; don't override Mermaid's theme per diagram.

## Charts: also Mermaid

For numeric/statistical charts, don't add a separate charting library — Mermaid
already covers it:

```html
<pre class="mermaid">
pie title Provider install share
  "claude" : 62
  "codex" : 38
</pre>
```

Use `pie` for proportions, `xychart-beta` for bar/line series. Reach for a real
chart, not a hand-built bar made of `<div>` widths — it won't be accurate or
scale-labeled.

## UI mockups: the window-frame pattern

When the thing being decided or confirmed is itself a UI design (a screen, a
component, a layout), wrap it in a window chrome so it reads as a mockup of a
real screen, not as a report about one:

```html
<div class="overflow-hidden rounded-2xl shadow-xl ring-1 ring-black/5">
  <div class="flex items-center gap-1.5 bg-stone-100 px-4 py-2.5">
    <span class="h-2.5 w-2.5 rounded-full bg-red-400"></span>
    <span class="h-2.5 w-2.5 rounded-full bg-amber-400"></span>
    <span class="h-2.5 w-2.5 rounded-full bg-emerald-400"></span>
  </div>
  <div class="bg-white p-6">
    <!-- the actual mockup content: build it from this same vocabulary -->
  </div>
</div>
```

Use one window frame per option/state being compared, inside the normal
`grid gap-6 md:grid-cols-2/3` layout — same rules as any other comparison.

## UI mockups: mobile phone frame

For a mobile app screen specifically, use a phone bezel instead of the browser
window chrome:

```html
<div class="mx-auto max-w-xs overflow-hidden rounded-3xl bg-stone-900 p-2 shadow-xl ring-1 ring-black/5">
  <div class="overflow-hidden rounded-2xl bg-white">
    <div class="flex items-center justify-between px-4 py-2 text-xs font-medium text-stone-900">
      <span>9:41</span>
      <span>●●●</span>
    </div>
    <div class="p-4">
      <!-- the actual screen content: build it from this same vocabulary -->
    </div>
  </div>
</div>
```

`max-w-xs` keeps it phone-narrow; the dark `bg-stone-900` outer frame plus a
lighter inner `rounded-2xl` is the bezel. Don't go further (notches, side
buttons) — the status bar row is enough to read as "a phone screen," anything
more is decoration that doesn't help the decision.

## Embedding real images

If you have a real screenshot or rendered image on disk (not something you're
generating), pass it through `images` rather than trying to inline it as a data
URI:

```ts
askVisualQuestion({
  title: '...',
  images: { 'before.png': '/abs/path/before.png', 'after.png': '/abs/path/after.png' },
  bodyHtml: `... <img src="/local/before.png" class="rounded-xl shadow-md ring-1 ring-black/5" /> ...`,
});
```

Keys are arbitrary names you choose; reference them as `/local/<name>` in
`bodyHtml`. Only PNG/JPEG/GIF/WEBP/SVG are served, and only the exact names you
declared — there is no general file route.

## Use only the bundled class vocabulary

The offline `tailwind.css` is precompiled and only contains classes known at build
time, so two rules keep your dynamic HTML from rendering unstyled:

1. **Colors:** every shade (50–950) of every standard Tailwind family is bundled —
   neutrals `slate` `gray` `zinc` `neutral` `stone` and accents `red` `rose`
   `orange` `amber` `yellow` `lime` `green` `emerald` `teal` `cyan` `sky` `blue`
   `indigo` `violet` `purple` `fuchsia` `pink` — for `text-` `bg-` `border-`
   `ring-` (plus `hover:bg-`/`hover:border-`). This list comes from
   `../safelist-colors.html`, generated by `scripts/gen-safelist.ts`. Stick to the
   `stone`/`emerald`/`red`/`amber`/`sky` set above for the soft-elevated look —
   other families exist for one-off needs, not as a new default palette.
2. **No arbitrary bracket values**, with one exception already bundled
   (`hover:scale-[1.01]`). Things like `text-[13px]`, `w-[200px]` are JIT-only and
   are **not** in the offline bundle — they render unstyled. Use scale classes
   (`text-sm`, `w-64`). Effects available: `shadow-sm` through `shadow-2xl`,
   `rounded` through `rounded-3xl`, `ring-black/5`, `ring-black/10`,
   `bg-black/5`, `bg-white/60` `/70` `/80`, `backdrop-blur-sm/md/lg`,
   `bg-gradient-to-{b,r,br}` with `from-`/`via-`/`to-stone-{50,100,700,900}` and
   `to-white`, `-translate-y-0.5/-1`, `hover:-translate-y-0.5/-1`. Layout/spacing
   utilities are in `../safelist.html`.

If you genuinely need a class that isn't bundled, add it to `safelist.html` (or
`scripts/gen-safelist.ts` for colors) and rebuild with `npm run build:preview-css`.
Never add inline `<style>` blocks or external stylesheet links.

## What the engine handles for you

- The `<head>`, the offline Tailwind link, the viewport meta.
- The "✓ recorded, close this tab" banner (`#done`) — don't build your own.
- The selected-state styling on the clicked `data-choice` element.
- Wiring clicks to the callback, the nonce, the port, the browser launch, and the
  terminal fallback. You never write `fetch`, ports, or selection logic.
