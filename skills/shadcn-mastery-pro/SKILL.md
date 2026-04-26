---
name: shadcn-mastery-pro
description: |
  Deep expertise in shadcn/ui components, patterns, and best practices.
  Knows every primitive, block, and customization technique.
  Generates accessible, composable, well-structured React components.

  Use when building with shadcn/ui, customizing themes, or creating
  component libraries based on Radix primitives.

  Triggers: "shadcn", "shadcn/ui", "Radix", "Tailwind component", "component variant", "cva", "theme tokens", "compose dialog", "button primitive", "asChild".
metadata:
  short-description: shadcn/ui — Radix primitives, cva variants, theming, composition, accessibility
  content-language: en
  domain: ui-library
  level: professional
---

# shadcn Mastery (professional)

## Boundary

**`shadcn-mastery-pro`** owns **shadcn/ui component patterns** — Radix UI primitives, cva-based variants, CSS variable theming, copy-paste component architecture, and Tailwind-driven styling. **`ui-stack-pro`** owns design token governance and the 8px grid/60-30-10 color rules that shadcn components should conform to. **`frontend-design-pro`** owns overall aesthetic direction and font/color choices layered on top of the component foundation. **`react-pro`** owns React-level concerns (hooks, performance, server components) when they interact with shadcn usage.

## When to use

- Building with shadcn/ui
- Customizing shadcn components
- Creating new components following shadcn patterns
- Theme customization (colors, radius, etc.)
- Need accessible React components
- Building design systems on shadcn

## When not to use

- Not using React/Tailwind
- Need Vue/Angular components
- Building from scratch without component library

## Required inputs

- **component_type**: Button, Dialog, Table, etc.
- **customization**: Theme, size, variant requirements
- **composition**: How components work together
- **accessibility**: ARIA, keyboard nav requirements

## Expected output

- **component_code**: shadcn/ui compatible code
- **theme_config**: CSS variables and Tailwind config
- **composition_pattern**: How to combine primitives
- **accessibility_notes**: ARIA labels, roles, etc.


## Workflow

Apply **Karpathy principles** throughout.

1. **Confirm** component requirements → verify: [type, variant, composition needs].
2. **State assumptions** about theme, size constraints, usage context.
3. **Apply** minimum shadcn primitive; compose only when justified.
4. **Make surgical changes** — only touch component variants requested.
5. **Define success criteria** (accessible, composable, themed); verify.
6. **Respond** with component code, theme tokens, and composition examples.

### Operating principles

1. **Think Before Coding** — State assumptions: theme context, size needs, composition pattern.
2. **Simplicity First** — Start with primitive; add composition only when needed.
3. **Surgical Changes** — Only modify the requested component/variant.
4. **Goal-Driven Execution** — Verify accessible, composable, themed correctly.

### shadcn/ui Philosophy

**Primitives, not components:**
- Unstyled, accessible Radix primitives
- You own the styling (Tailwind)
- Copy-paste, not npm install
- Composable architecture

**Key Principles:**
- Accessibility built-in (Radix)
- Customizable via Tailwind
- TypeScript by default
- Client-side interactivity

### Component Architecture

**Structure:**
```
ui/
├── button.tsx         # Primitive + variants
├── button-group.tsx   # Composition pattern
├── button-with-icon.tsx # Extended pattern
```

**Pattern:**
```tsx
// Primitive with variants
const buttonVariants = cva(
  "inline-flex items-center justify-center...",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        destructive: "bg-destructive text-destructive-foreground",
        outline: "border border-input bg-background",
        secondary: "bg-secondary text-secondary-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
      },
    },
  }
);
```

### Theme Tokens

```css
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --card: 0 0% 100%;
  --card-foreground: 240 10% 3.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 240 10% 3.9%;
  --primary: 240 5.9% 10%;
  --primary-foreground: 0 0% 98%;
  --secondary: 240 4.8% 95.9%;
  --secondary-foreground: 240 5.9% 10%;
  --muted: 240 4.8% 95.9%;
  --muted-foreground: 240 3.8% 46.1%;
  --accent: 240 4.8% 95.9%;
  --accent-foreground: 240 5.9% 10%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 0 0% 98%;
  --border: 240 5.9% 90%;
  --input: 240 5.9% 90%;
  --ring: 240 5.9% 10%;
  --radius: 0.5rem;
}
```

### Installation Commands

```bash
# Add shadcn/ui to project
npx shadcn@latest init

# Add components
npx shadcn@latest add button
npx shadcn@latest add dialog card table

# Add theme
npx shadcn@latest add https://github.com/username/theme.json
```

## Suggested response format

```markdown
## Component: [Name]

### Installation
```bash
npx shadcn@latest add [component]
```

### Code
```tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const variants = cva("...")

export interface Props extends VariantProps<typeof variants> {
  // Component-specific props
}

export function Component({ className, variant, size, ...props }: Props) {
  return <div className={cn(variants({ variant, size }), className)} {...props} />
}
```

### Usage
```tsx
<Component variant="default" size="lg">
  Content
</Component>
```

### Composition
[How to compose with other primitives]

### Accessibility
[ARIA labels, roles, keyboard behavior]
```

## Quick example

### Example 1: Custom Button with Icon

**User:** "Button with icon that doesn't shift on load"

```tsx
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap...",
  {
    variants: {
      variant: { /* ... */ },
      size: { /* ... */ },
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

### Example 2: Composed Card with Form

```tsx
<Card>
  <CardHeader>
    <CardTitle>Login</CardTitle>
    <CardDescription>Enter your credentials</CardDescription>
  </CardHeader>
  <CardContent>
    <form>
      <div className="grid gap-4">
        <Input placeholder="Email" type="email" />
        <Input placeholder="Password" type="password" />
        <Button>Sign In</Button>
      </div>
    </form>
  </CardContent>
  <CardFooter>
    <p>Don't have an account? <a href="/signup">Sign up</a></p>
  </CardFooter>
</Card>
```

## Resources in this skill

- `/skills/shadcn-mastery-pro/references/primitives-catalog.md` — All Radix primitives
- `/skills/shadcn-mastery-pro/references/component-patterns.md` — Common compositions
- `/skills/shadcn-mastery-pro/references/theming-guide.md` — CSS variables, dark mode
- `/skills/shadcn-mastery-pro/references/blocks-catalog.md` — Pre-built sections

## Checklist before calling the skill done

### Component creation
- [ ] Uses Radix primitive (if interactive)
- [ ] cva for variants
- [ ] cn() for class merging
- [ ] forwardRef for ref forwarding
- [ ] displayName set
- [ ] TypeScript types exported

### Styling
- [ ] Uses CSS variables (--primary, --background, etc.)
- [ ] Responsive with Tailwind classes
- [ ] Dark mode compatible
- [ ] Focus visible styles

### Accessibility
- [ ] **Karpathy Principles Verification:**
  - [ ] Assumptions stated (usage context, composition needs)
  - [ ] Minimum primitive applied (compose only when justified)
  - [ ] Surgical changes only (requested component only)
  - [ ] Success criteria defined (accessible, composable)
- [ ] Keyboard navigation works
- [ ] ARIA labels where needed
- [ ] Color contrast verified
- [ ] Focus trap for modals/dialogs

### Composition
- [ ] asChild pattern for flexibility
- [ ] Composes with other primitives
- [ ] Slots for content projection
