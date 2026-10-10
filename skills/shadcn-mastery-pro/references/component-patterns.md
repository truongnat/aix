# Component Composition Patterns

Practical patterns for building complex UI from shadcn primitives. Each pattern documents the real trade-offs, not just the happy path.

---

## Compound Components (Card family)

shadcn components are designed for composition. Card is the clearest example:

```tsx
<Card>
  <CardHeader>
    <CardTitle>Invoice #1042</CardTitle>
    <CardDescription>Due March 15, 2026</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Amount: $1,200.00</p>
  </CardContent>
  <CardFooter className="flex justify-end gap-2">
    <Button variant="outline">Download</Button>
    <Button>Pay Now</Button>
  </CardFooter>
</Card>
```

Each sub-component is a styled `div` — no hidden state. You can skip any part, reorder them, or add your own sections in between without breaking anything.

---

## Controlled vs Uncontrolled Dialog

**Uncontrolled** — simplest, let Radix manage open state:
```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button>Open</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader><DialogTitle>Edit Profile</DialogTitle></DialogHeader>
    {/* form here */}
  </DialogContent>
</Dialog>
```

**Controlled** — required when you need to open/close from external logic (form submit, keyboard shortcut, navigation):
```tsx
const [open, setOpen] = useState(false)

async function handleSubmit() {
  await save()
  setOpen(false) // close on success
}

<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild>
    <Button onClick={() => setOpen(true)}>Edit</Button>
  </DialogTrigger>
  <DialogContent>
    <form onSubmit={handleSubmit}>...</form>
  </DialogContent>
</Dialog>
```

Trade-off: uncontrolled is less code; controlled is required any time the close condition is async or external.

---

## Form Integration: react-hook-form + Zod + shadcn Form

Install once per project: `npm install react-hook-form @hookform/resolvers zod`

```tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"

const schema = z.object({
  email: z.string().email("Invalid email"),
  role: z.enum(["admin", "member"]),
})
type FormValues = z.infer<typeof schema>

export function InviteForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", role: "member" },
  })

  function onSubmit(values: FormValues) {
    // values are type-safe and validated
    console.log(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage /> {/* shows zod error automatically */}
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          Send Invite
        </Button>
      </form>
    </Form>
  )
}
```

Key insight: `FormField` is a thin wrapper around `Controller`. `FormMessage` reads from `formState.errors` automatically via context — you don't pass errors manually.

---

## DataTable: TanStack Table + shadcn Table

```tsx
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function DataTable({ columns, data }) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map(headerGroup => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map(header => (
              <TableHead key={header.id}>
                {flexRender(header.column.columnDef.header, header.getContext())}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map(row => (
          <TableRow key={row.id}>
            {row.getVisibleCells().map(cell => (
              <TableCell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

TanStack Table handles sorting, filtering, pagination logic. shadcn Table provides only the styled HTML table elements. They have no coupling — you wire them together manually, which also means you control exactly what features you add.

---

## Combobox with Search (Command + Popover)

The most requested pattern — not a single component, composed from two:

```tsx
const [open, setOpen] = useState(false)
const [value, setValue] = useState("")

<Popover open={open} onOpenChange={setOpen}>
  <PopoverTrigger asChild>
    <Button variant="outline" role="combobox" aria-expanded={open} className="w-[200px] justify-between">
      {value ? frameworks.find(f => f.value === value)?.label : "Select framework..."}
      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
    </Button>
  </PopoverTrigger>
  <PopoverContent className="w-[200px] p-0">
    <Command>
      <CommandInput placeholder="Search framework..." />
      <CommandList>
        <CommandEmpty>No framework found.</CommandEmpty>
        <CommandGroup>
          {frameworks.map(framework => (
            <CommandItem
              key={framework.value}
              value={framework.value}
              onSelect={(current) => {
                setValue(current === value ? "" : current)
                setOpen(false)
              }}
            >
              <Check className={cn("mr-2 h-4 w-4", value === framework.value ? "opacity-100" : "opacity-0")} />
              {framework.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  </PopoverContent>
</Popover>
```

---

## Multi-Select from Combobox

Change the value state to an array and don't close on select:
```tsx
const [selected, setSelected] = useState<string[]>([])

onSelect={(current) => {
  setSelected(prev =>
    prev.includes(current) ? prev.filter(v => v !== current) : [...prev, current]
  )
  // don't call setOpen(false) — keep popover open for multiple selections
}}
```

Render selected items as badges in the trigger button. Use `ScrollArea` if the badge list overflows.

---

## Date Picker (Calendar + Popover)

```tsx
const [date, setDate] = useState<Date | undefined>()

<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline" className={cn("w-[240px] justify-start text-left font-normal", !date && "text-muted-foreground")}>
      <CalendarIcon className="mr-2 h-4 w-4" />
      {date ? format(date, "PPP") : "Pick a date"}
    </Button>
  </PopoverTrigger>
  <PopoverContent className="w-auto p-0" align="start">
    <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
  </PopoverContent>
</Popover>
```

For date ranges, use `mode="range"` and a `DateRange` state. Calendar is built on `react-day-picker` — most customization is via `react-day-picker` props passed through.

---

## Sheet vs Dialog

| Concern | Dialog | Sheet |
|---------|--------|-------|
| Appears | Center of screen | Slides from edge (top/right/bottom/left) |
| Best for | Confirmations, short forms | Filters, detail panels, mobile nav |
| Width | Fixed (sm/md/lg/xl/full) | Full height, configurable width via `className` |
| Mobile | Can feel cramped | Natural — full-height drawer feels native |

Sheet uses the same Radix Dialog primitive underneath, so it has the same focus trap and ARIA behavior. Prefer Sheet for anything that shows alongside content rather than blocking it.

---

## Toast: Sonner vs shadcn useToast

**shadcn useToast** (built-in): manages a toast queue in state, renders via `<Toaster />`. Limited styling flexibility. Good enough for basic success/error messages.

**Sonner** (recommended for most projects):
```bash
npx shadcn@latest add sonner
```
```tsx
// layout.tsx
import { Toaster } from "@/components/ui/sonner"
<Toaster richColors position="top-right" />

// anywhere in your app
import { toast } from "sonner"
toast.success("Profile updated")
toast.error("Failed to save", { description: error.message })
toast.promise(saveProfile(), { loading: "Saving...", success: "Done", error: "Failed" })
```

Sonner is the clear winner for UX: stacking, swipe-to-dismiss, promise API, rich colors. Use `useToast` only if you're on an older shadcn setup that hasn't added Sonner.
