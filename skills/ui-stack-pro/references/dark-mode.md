# Dark Mode — Implementation, Tokens, and Common Bugs

## Strategy: CSS Class on `<html>`

Tailwind's `darkMode: 'class'` is the correct approach for production apps. It gives you:
- Manual toggle support
- No flash on load (when implemented correctly)
- SSR compatibility

```js
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  // ...
}
```

```html
<!-- Light mode -->
<html>

<!-- Dark mode -->
<html class="dark">
```

All dark variants are then written as `dark:bg-slate-900` etc. The class on `<html>` cascades to all children.

---

## System Preference Detection

Detect the user's OS preference with the `prefers-color-scheme` media query:

```js
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
```

Listen for changes (user changes system setting while app is open):

```js
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  if (!localStorage.getItem('theme')) {
    // Only auto-update if user hasn't set a manual preference
    document.documentElement.classList.toggle('dark', e.matches);
  }
});
```

---

## Manual Toggle — React Pattern with Hydration Safety

The critical issue with dark mode in Next.js / SSR: the server doesn't know the user's localStorage preference. Rendering with the wrong theme causes a flash (FOUT — Flash of Unstyled Theme).

```tsx
// hooks/useTheme.ts
import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('system');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('theme') as Theme | null;
    if (saved) {
      setTheme(saved);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      // system
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    }
    localStorage.setItem('theme', theme);
  }, [theme, mounted]);

  return { theme, setTheme, mounted };
}
```

**Preventing FOUT — the inline script approach:**
Add this blocking script to `<head>` before any other scripts. It runs synchronously before the page paints:

```html
<script>
  (function() {
    var theme = localStorage.getItem('theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (theme === 'dark' || (!theme && prefersDark)) {
      document.documentElement.classList.add('dark');
    }
  })();
</script>
```

This must be a raw inline script — no async, no defer, no module. It blocks rendering just long enough to set the class before paint.

---

## Token Mapping — Light to Dark Pairs

```css
:root {
  --color-background:   #ffffff;
  --color-surface-1:    #f8fafc;
  --color-surface-2:    #f1f5f9;
  --color-text-primary: #0f172a;
  --color-text-muted:   #94a3b8;
  --color-border:       #e2e8f0;
  --color-primary:      #2563eb;
}

.dark {
  --color-background:   #0f172a;   /* slate-950 */
  --color-surface-1:    #1e293b;   /* slate-800 */
  --color-surface-2:    #334155;   /* slate-700 */
  --color-text-primary: #f1f5f9;   /* slate-100 */
  --color-text-muted:   #64748b;   /* slate-500 — lighter value, dark bg */
  --color-border:       #334155;   /* slate-700 */
  --color-primary:      #3b82f6;   /* blue-500 — lighter for dark bg contrast */
}
```

Use these tokens everywhere instead of raw Tailwind colors. Then dark mode is automatic.

---

## What Changes in Dark Mode (Surface Hierarchy)

In light mode, elevation is expressed by going lighter (card is white on a gray-50 background).
In dark mode, elevation goes the other way — higher surfaces are lighter, not darker.

```
Light:  page bg (gray-50) → card (white) → popover (white + shadow)
Dark:   page bg (slate-950) → card (slate-900) → popover (slate-800)
```

The mistake: making cards darker than the page background in dark mode. This visually "sinks" content rather than lifting it.

Elevation tokens in dark mode:
```
--color-surface-1: #0f172a  (page — darkest)
--color-surface-2: #1e293b  (card — slightly lighter)
--color-surface-3: #334155  (popover — lighter still)
```

---

## Images in Dark Mode

Options, ranked by quality:

1. **Provide separate dark image** — best quality, most work
   ```html
   <img class="block dark:hidden" src="/hero-light.png" alt="...">
   <img class="hidden dark:block" src="/hero-dark.png" alt="...">
   ```

2. **CSS filter for photos** — reduces brightness and adjusts contrast so white backgrounds don't blind in dark mode
   ```css
   .dark img:not([data-no-filter]) {
     filter: brightness(0.85) contrast(1.05);
   }
   ```

3. **SVG with `currentColor`** — SVG icons that use `fill="currentColor"` or `stroke="currentColor"` adapt automatically to text color. Use this for all icon assets.

Never leave a bright white illustration or screenshot unmodified in dark mode. It defeats the purpose and causes visual jarring.

---

## Shadows in Dark Mode

Light box shadows (`shadow-md`, `shadow-lg`) are nearly invisible on dark backgrounds. Dark-on-dark shadows don't read.

Replace with:

```html
<!-- Light mode: shadow works fine -->
<!-- Dark mode: use border + glow -->
<div class="
  shadow-lg dark:shadow-none
  dark:border dark:border-slate-700
  dark:ring-1 dark:ring-white/10
">
```

For popovers/dropdowns in dark mode, a subtle inner glow or slightly lighter border creates the elevation cue that shadows provided in light mode.

---

## Common Dark Mode Bugs

**Flash of wrong theme (FOUT):**
Cause: reading localStorage in `useEffect` — too late, component has already painted.
Fix: use the inline blocking `<script>` in `<head>` as described above.

**Hard-coded hex values:**
```html
<!-- Bug: won't adapt to dark mode -->
<div style="background: #ffffff; color: #000000">

<!-- Fix: use CSS variables or Tailwind dark: variants -->
<div class="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
```

**Tailwind color classes instead of semantic tokens:**
`bg-slate-100` in dark mode should become `bg-slate-800` — but if you didn't use tokens, you must hunt down every hardcoded class. Token system prevents this.

**Dark mode not applied to portals/modals:**
React portals render outside the main DOM tree. Ensure your portal target (e.g., `document.body`) is inside `<html class="dark">`. This is automatic if the class is on `<html>`.

**Transparent/alpha colors in dark mode:**
`rgba(0,0,0,0.05)` reads as a tinted surface in light mode but becomes invisible on dark backgrounds. Replace with explicit dark-mode values: `bg-black/5 dark:bg-white/5`.
