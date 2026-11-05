# Radix UI Primitives Catalog

Radix UI provides unstyled, accessible components. shadcn wraps most of them with Tailwind-based styling. This catalog covers what each primitive gives you, when it's the right tool, and whether shadcn already wraps it.

---

## Primitive Reference Table

| Primitive | WAI-ARIA Pattern | Key Props | Use Instead of div When | shadcn Wrapper |
|-----------|-----------------|-----------|------------------------|----------------|
| **Dialog** | `dialog` role, `aria-modal` | `open`, `onOpenChange`, `modal` | You need a focus-trapped overlay that blocks background interaction | `Dialog`, `DialogContent`, `DialogTrigger` |
| **AlertDialog** | `alertdialog` role | `open`, `onOpenChange` | Confirming destructive actions — cannot be dismissed by clicking outside | `AlertDialog`, `AlertDialogAction`, `AlertDialogCancel` |
| **Popover** | `dialog` role (non-modal) | `open`, `onOpenChange`, `side`, `align`, `sideOffset` | Floating content anchored to a trigger without blocking interaction | `Popover`, `PopoverContent`, `PopoverTrigger` |
| **Tooltip** | `tooltip` role | `delayDuration`, `side`, `align` | Short text hints on hover/focus — do NOT use for interactive content | `Tooltip`, `TooltipContent`, `TooltipTrigger` |
| **HoverCard** | `dialog` role (non-modal) | `openDelay`, `closeDelay` | Rich preview cards on hover (user profiles, link previews) | `HoverCard`, `HoverCardContent`, `HoverCardTrigger` |
| **DropdownMenu** | `menu` role | `open`, `onOpenChange`, `modal` | Action menus triggered from a button — keyboard navigable | `DropdownMenu`, `DropdownMenuContent`, `DropdownMenuItem` |
| **ContextMenu** | `menu` role | `onOpenChange` | Right-click action menus — same as DropdownMenu but right-click triggered | `ContextMenu`, `ContextMenuContent`, `ContextMenuItem` |
| **NavigationMenu** | `navigation` landmark | `value`, `onValueChange`, `delayDuration` | Top-level site navigation with flyout submenus | `NavigationMenu`, `NavigationMenuList`, `NavigationMenuItem` |
| **Select** | `listbox` role | `value`, `onValueChange`, `defaultValue`, `disabled` | Single-select from a list of options — replaces native `<select>` | `Select`, `SelectContent`, `SelectItem`, `SelectTrigger` |
| **Combobox** | `combobox` role (via Command) | Composed from `Command` + `Popover` | Searchable select — when the list is long or filterable | Composed pattern (see component-patterns.md) |
| **Checkbox** | `checkbox` role | `checked`, `onCheckedChange`, `indeterminate` | Toggling boolean values — provides indeterminate state that native checkbox lacks | `Checkbox` |
| **RadioGroup** | `radiogroup` role | `value`, `onValueChange`, `orientation` | Selecting one option from a set — semantically linked to radio inputs | `RadioGroup`, `RadioGroupItem` |
| **Switch** | `switch` role | `checked`, `onCheckedChange`, `disabled` | Binary on/off settings — visually distinct from checkbox | `Switch` |
| **Slider** | `slider` role | `value`, `onValueChange`, `min`, `max`, `step`, `orientation` | Range input — provides thumb(s), track, keyboard support | `Slider` |
| **Toggle** | `button` role with `aria-pressed` | `pressed`, `onPressedChange`, `variant`, `size` | Stateful button (bold, italic in editors) | `Toggle` |
| **ToggleGroup** | `group` role + `button` children | `type` (`single`\|`multiple`), `value`, `onValueChange` | Button groups where one or many can be active | `ToggleGroup`, `ToggleGroupItem` |
| **Accordion** | `region` + button pattern | `type` (`single`\|`multiple`), `collapsible`, `value` | Expandable content sections — FAQ, settings groups | `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent` |
| **Tabs** | `tablist` + `tab` + `tabpanel` | `value`, `onValueChange`, `orientation` | Switching between related content panels | `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` |
| **Toast** | `status` role (live region) | `open`, `onOpenChange`, `duration` | Transient feedback messages — do not use for critical errors | `Toast` (or prefer Sonner integration) |
| **Avatar** | `img` role with fallback | `src`, fallback text | User images with graceful fallback when image fails | `Avatar`, `AvatarImage`, `AvatarFallback` |
| **Label** | Associates with form element | `htmlFor` | All form inputs — provides accessible name and click-to-focus | `Label` |
| **Progress** | `progressbar` role | `value`, `max` | Determinate progress — use `aria-valuetext` for screen readers | `Progress` |
| **ScrollArea** | Scrollable region | `type` (`auto`\|`always`\|`hover`\|`scroll`) | Custom-styled scrollbars cross-platform — Radix normalizes scrollbar behavior | `ScrollArea`, `ScrollBar` |
| **Separator** | `separator` role | `orientation`, `decorative` | Visual dividers — set `decorative` if purely visual (no semantic meaning) | `Separator` |

---

## Decision Framework

**Use the Radix/shadcn component when:**
- You need keyboard navigation (arrow keys, Home/End, Escape)
- The ARIA pattern requires managing focus (Dialog traps it, Select moves it to the list)
- The component has state that screen readers must announce
- You need consistent cross-browser behavior (scrollbars, native select styling)

**A plain `<div>` is sufficient when:**
- It's purely decorative with no interaction
- You're composing your own custom pattern not covered by a primitive
- You need full control over the ARIA roles (then add them manually)

---

## Primitives Not Yet in shadcn (use Radix directly)

- **`@radix-ui/react-form`** — basic field validation primitives (shadcn uses react-hook-form instead)
- **`@radix-ui/react-toolbar`** — grouped action controls (build from Toggle + ToggleGroup)
- **`@radix-ui/react-menubar`** — desktop-style menu bars (shadcn has Menubar in newer versions)

---

## Installation Note

When shadcn wraps a primitive, you do NOT install the Radix package directly:
```bash
# Do this:
npx shadcn@latest add dialog

# Not this (unless you need something unstyled):
npm install @radix-ui/react-dialog
```
shadcn copies the component source into your project — you own and can modify it.
