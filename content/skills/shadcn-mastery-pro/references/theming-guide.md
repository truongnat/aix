# Theming Guide: CSS Variables, Dark Mode, and Customization

shadcn's theming system is built on CSS custom properties scoped to `:root` and `.dark`. Everything flows from these variables — change them once, the entire UI updates.

---

## The Full CSS Variable System

Defined in `globals.css`, these variables cover every semantic color slot:

```css
@layer base {
  :root {
    --background: 0 0% 100%;         /* page background */
    --foreground: 222.2 84% 4.9%;    /* default text color */

    --card: 0 0% 100%;               /* Card background */
    --card-foreground: 222.2 84% 4.9%;

    --popover: 0 0% 100%;            /* Popover/Dropdown background */
    --popover-foreground: 222.2 84% 4.9%;

    --primary: 222.2 47.4% 11.2%;    /* primary buttons, links */
    --primary-foreground: 210 40% 98%;

    --secondary: 210 40% 96.1%;      /* secondary buttons, tags */
    --secondary-foreground: 222.2 47.4% 11.2%;

    --muted: 210 40% 96.1%;          /* muted backgrounds (e.g. disabled) */
    --muted-foreground: 215.4 16.3% 46.9%; /* subdued text */

    --accent: 210 40% 96.1%;         /* hover states, highlights */
    --accent-foreground: 222.2 47.4% 11.2%;

    --destructive: 0 84.2% 60.2%;    /* delete buttons, error states */
    --destructive-foreground: 210 40% 98%;

    --border: 214.3 31.8% 91.4%;     /* input borders, dividers */
    --input: 214.3 31.8% 91.4%;      /* input border specifically */
    --ring: 222.2 84% 4.9%;          /* focus ring color */
    --radius: 0.5rem;                 /* border-radius base */
  }
}
```

---

## Why HSL (Not Hex)

The values use space-separated HSL channels **without** the `hsl()` wrapper:

```css
/* stored as channels only: */
--primary: 222.2 47.4% 11.2%;

/* consumed with opacity support: */
background-color: hsl(var(--primary) / 0.8);
```

This enables Tailwind's opacity modifier syntax to work with CSS variables. With hex values, `bg-primary/50` would not function. The channel format is what makes `text-primary/80`, `border-primary/20`, etc. possible throughout your Tailwind classes.

---

## Dark Mode

### Class Strategy (default, recommended)
```js
// tailwind.config.ts
export default {
  darkMode: "class",  // toggle via .dark on <html>
}
```

Switching themes programmatically:
```tsx
// Simple toggle
document.documentElement.classList.toggle("dark")

// With next-themes (recommended for Next.js)
import { useTheme } from "next-themes"
const { setTheme } = useTheme()
setTheme("dark")   // or "light" or "system"
```

Setup with next-themes:
```tsx
// providers.tsx
import { ThemeProvider } from "next-themes"
export function Providers({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  )
}
```

### Media Strategy (simpler, less control)
```js
darkMode: "media"  // follows OS preference, no JS toggle needed
```

Trade-off: media strategy is zero-config but you cannot offer a manual toggle. Class strategy adds ~2KB (next-themes) but gives full user control. Almost all production apps use class strategy.

---

## Extending the Theme with Custom Semantic Tokens

Add your own variables alongside shadcn's in `globals.css`:

```css
:root {
  /* existing shadcn vars ... */

  /* custom semantic tokens */
  --brand: 262.1 83.3% 57.8%;         /* your brand purple */
  --brand-foreground: 0 0% 100%;
  --success: 142.1 70.6% 45.3%;
  --success-foreground: 0 0% 100%;
  --warning: 47.9 95.8% 53.1%;
  --warning-foreground: 26 83.3% 14.1%;
}

.dark {
  --brand: 263.4 70% 50.4%;
  --success: 142.1 76.2% 36.3%;
  --warning: 47.9 95.8% 53.1%;
}
```

Then register in `tailwind.config.ts`:
```ts
extend: {
  colors: {
    brand: {
      DEFAULT: "hsl(var(--brand))",
      foreground: "hsl(var(--brand-foreground))",
    },
    success: {
      DEFAULT: "hsl(var(--success))",
      foreground: "hsl(var(--success-foreground))",
    },
  },
}
```

Now `bg-brand`, `text-success`, `border-warning` all work and respect dark mode automatically.

---

## The `cn()` Utility

shadcn ships with a `cn()` helper at `@/lib/utils`:

```ts
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

`clsx` handles conditional classes. `twMerge` resolves Tailwind conflicts (last write wins):

```tsx
// Without cn(), "p-4" and "p-2" would both appear in the string — p-4 would win
// by DOM order, which is unpredictable. twMerge resolves this correctly:
cn("p-4 text-sm", condition && "p-2", "text-lg")
// → "p-2 text-lg"  (later values override earlier conflicting ones)

// Practical use: letting consumers override base styles
function Badge({ className, ...props }) {
  return <div className={cn("rounded-full px-2 py-0.5 text-xs", className)} {...props} />
}
// Consumer can pass className="bg-red-500" and it merges cleanly
```

---

## `cva()` for Multi-Variant Components

Class Variance Authority (`cva`) is the pattern shadcn uses internally for components like `Button`:

```ts
import { cva, type VariantProps } from "class-variance-authority"

const alertVariants = cva(
  // base classes always applied:
  "relative w-full rounded-lg border p-4 text-sm",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive: "border-destructive/50 text-destructive bg-destructive/10",
        success: "border-success/50 text-success bg-success/10",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface AlertProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {}

function Alert({ className, variant, ...props }: AlertProps) {
  return <div className={cn(alertVariants({ variant }), className)} {...props} />
}
```

This gives you type-safe variant props. `VariantProps<typeof alertVariants>` extracts the prop types automatically — no manual type duplication.

---

## Adding Variants Without Modifying shadcn Source

Since shadcn copies components into your project, you CAN edit them directly. But for new variants that extend existing components, prefer a wrapper to avoid conflicts on future updates:

```tsx
// components/ui/button-extended.tsx
import { Button, type ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Extend with a new variant by passing specific classNames
export function GhostDangerButton({ className, ...props }: ButtonProps) {
  return (
    <Button
      variant="ghost"
      className={cn("text-destructive hover:bg-destructive/10 hover:text-destructive", className)}
      {...props}
    />
  )
}
```

For systematic new variants, add them directly to the `buttonVariants` cva in `button.tsx` — you own that file.

---

## globals.css Layer Order

The correct structure in `globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* shadcn CSS variables */
    --background: 0 0% 100%;
    /* ... all variables ... */
  }

  .dark {
    --background: 222.2 84% 4.9%;
    /* ... dark overrides ... */
  }

  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

Critical: CSS variables must be inside `@layer base` so they have the correct specificity and can be overridden by utilities. If you put them outside the layer, specificity issues will cause variables to not apply in some contexts. The `*` border reset using `@apply border-border` ensures all borders inherit the theme color by default.
