# shadcn Blocks Catalog

Blocks are full page sections — not individual components. They combine multiple shadcn components into production-ready UI patterns that you copy into your project and own entirely.

---

## Blocks vs Components

| | Components | Blocks |
|--|-----------|--------|
| Granularity | Single UI element (Button, Input, Card) | Full page section (dashboard sidebar, auth form) |
| Install command | `npx shadcn@latest add button` | `npx shadcn@latest add block/dashboard-01` |
| Files created | 1 component file | Multiple files (layout, subcomponents, data) |
| Purpose | Primitive for composition | Starting point for a real page |
| Modification | Extend/wrap | Copy and edit directly |

Blocks are designed to be scaffolding — expect to delete ~30% of what they generate and reshape the rest to your domain.

---

## Available Block Categories

### Dashboard Blocks (`dashboard-01` through `dashboard-07`)
Sidebar navigation + header + main content area with charts and data tables. Variants cover:
- Collapsible sidebar (icon-only collapsed state)
- Top navigation bar instead of sidebar
- Nested sidebar navigation groups
- Breadcrumb header pattern

### Authentication Blocks (`login-01` through `login-04`)
- Split-screen login (form left, image/brand right)
- Centered card login
- Register with email + password
- Forgot password / magic link form

### Settings Blocks (`settings-01`)
Vertical tabs + card sections layout for account/profile settings pages.

### Chart Blocks (`chart-bar-*`, `chart-line-*`, `chart-area-*`, `chart-pie-*`)
Pre-built chart components using Recharts with shadcn card wrappers, tooltips, and legends.

### Calendar Blocks
Full calendar view with event list, built on react-day-picker.

---

## Installing Blocks

```bash
# List available blocks
npx shadcn@latest list blocks

# Add a specific block
npx shadcn@latest add block/dashboard-01

# This creates files in your project — inspect before using:
# app/(dashboard)/layout.tsx
# components/app-sidebar.tsx
# components/nav-main.tsx
# components/nav-user.tsx
# etc.
```

After adding, run your dev server and navigate to the block's route to see it. Then gut and rebuild from there.

---

## Recharts + shadcn Chart Components

shadcn wraps Recharts with consistent theming via CSS variables. Install:
```bash
npx shadcn@latest add chart
```

### BarChart Example
```tsx
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const chartData = [
  { month: "Jan", desktop: 186, mobile: 80 },
  { month: "Feb", desktop: 305, mobile: 200 },
]

const chartConfig = {
  desktop: { label: "Desktop", color: "hsl(var(--chart-1))" },
  mobile: { label: "Mobile", color: "hsl(var(--chart-2))" },
}

export function SalesChart() {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
        <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}
```

`ChartContainer` handles responsive sizing and injects the config's color variables (`--color-desktop`, etc.) into scope. `ChartTooltipContent` reads the config to render correct labels and colors automatically.

Available chart CSS variables: `--chart-1` through `--chart-5` in `:root` and `.dark`.

### Chart Type Reference
| Chart | Recharts Component | Best For |
|-------|--------------------|----------|
| Bar | `BarChart` + `Bar` | Comparing categories |
| Line | `LineChart` + `Line` | Trends over time |
| Area | `AreaChart` + `Area` | Volume/cumulative trends |
| Pie | `PieChart` + `Pie` | Part-to-whole proportions |
| Radar | `RadarChart` + `Radar` | Multi-axis comparisons |

---

## Dashboard Layout Pattern

The core structure from `dashboard-01`:

```tsx
// app/(dashboard)/layout.tsx
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export default function DashboardLayout({ children }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-4" />
          <Breadcrumb>{/* dynamic breadcrumbs */}</Breadcrumb>
        </header>
        <main className="flex-1 p-4">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
```

`SidebarProvider` manages open/collapsed state across the layout. `SidebarInset` is the main content area that resizes as the sidebar collapses. The sidebar state persists in a cookie by default — users return to the same state.

---

## Authentication Forms Pattern

```tsx
// login form with validation
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export function LoginForm() {
  const form = useForm({ resolver: zodResolver(loginSchema) })

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Enter your credentials to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl><Input type="email" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl><Input type="password" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
```

---

## Settings Layout Pattern

```tsx
// Tabs for major sections, Cards for grouped settings
<div className="container max-w-4xl py-8">
  <div className="mb-6">
    <h1 className="text-2xl font-bold">Settings</h1>
    <p className="text-muted-foreground">Manage your account preferences</p>
  </div>
  <Tabs defaultValue="profile">
    <TabsList className="mb-6">
      <TabsTrigger value="profile">Profile</TabsTrigger>
      <TabsTrigger value="notifications">Notifications</TabsTrigger>
      <TabsTrigger value="billing">Billing</TabsTrigger>
    </TabsList>
    <TabsContent value="profile" className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your name and email address</CardDescription>
        </CardHeader>
        <CardContent>{/* profile form fields */}</CardContent>
        <CardFooter><Button>Save changes</Button></CardFooter>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="destructive">Delete account</Button>
        </CardContent>
      </Card>
    </TabsContent>
  </Tabs>
</div>
```

---

## Full DataTable with Filters, Pagination, Row Selection

```tsx
// Column definition with select checkbox
const columns: ColumnDef<Payment>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={v => table.toggleAllPageRowsSelected(!!v)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox checked={row.getIsSelected()} onCheckedChange={v => row.toggleSelected(!!v)} />
    ),
    enableSorting: false,
  },
  { accessorKey: "status", header: "Status" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "amount", header: "Amount" },
]

// Table with filter input + pagination
export function PaymentsTable() {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState({})

  const table = useReactTable({
    data, columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    state: { sorting, columnFilters, rowSelection },
  })

  return (
    <div>
      <div className="flex items-center gap-4 py-4">
        <Input
          placeholder="Filter by email..."
          value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
          onChange={e => table.getColumn("email")?.setFilterValue(e.target.value)}
          className="max-w-sm"
        />
        {Object.keys(rowSelection).length > 0 && (
          <Button variant="destructive" size="sm">
            Delete {Object.keys(rowSelection).length} selected
          </Button>
        )}
      </div>
      {/* Table render (see component-patterns.md) */}
      <div className="flex items-center justify-between py-4">
        <span className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} selected
        </span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Previous</Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next</Button>
        </div>
      </div>
    </div>
  )
}
```

---

## When to Use Blocks vs Components

**Use a block when:**
- Starting a new page type (dashboard, auth, settings, marketing landing)
- You want to see a reference implementation before building your own
- The layout pattern is common enough that reinventing it wastes time

**Build from components when:**
- The UI doesn't match any existing block
- You have an existing layout and need to add one section
- A block would require deleting more than 50% of what it generates (just build it)
- Your design system deviates significantly from shadcn's default visual style

The golden rule: blocks save 30–60 minutes on layout wiring. After that, you're on your own and the block becomes noise. Copy what you need and delete the rest immediately — don't leave unused block code in your codebase.
