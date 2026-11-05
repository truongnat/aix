# Components Catalog - 60+ UI Patterns

## Navigation Components

### Top Navigation
**Use:** Primary site navigation, 5-7 items max
**Pattern:**
```
[Logo] [Home] [Products] [About] [Contact]        [Search] [Login]
```
**Rules:**
- Highlight current page
- Collapse to hamburger on mobile
- Sticky on scroll (optional)

### Sidebar Navigation
**Use:** Dashboards, admin panels, complex apps
**Pattern:**
```
┌─────────────────────────────────────┐
│ Logo                    [Collapse ▶]│
├─────────────────────────────────────┤
│ ▶ Dashboard                         │
│   Analytics                         │
│   Reports                           │
├─────────────────────────────────────┤
│ ▶ Settings                          │
│   Profile                           │
│   Billing                           │
└─────────────────────────────────────┘
```
**Rules:**
- Collapsible sections
- Icons + labels
- Active state highlight
- Support for nested items

### Tabs
**Use:** Switching between related content views
**Types:**
- **Default:** Horizontal, underline active
- **Pill:** Rounded background active
- **Vertical:** Stacked, sidebar style

**Rules:**
- 2-6 tabs optimal
- Consistent content height (or animate)
- Keyboard: Left/Right arrows

### Breadcrumbs
**Use:** Deep hierarchies, wayfinding
**Pattern:** `Home > Category > Subcategory > Page`
**Rules:**
- Last item not clickable (current)
- Truncate middle if too long
- Schema.org markup

### Pagination
**Use:** Large datasets, SEO-friendly
**Pattern:** `Prev 1 2 3 ... 10 Next`
**Rules:**
- Show 5-7 page numbers
- Ellipsis for gaps
- First/Last optional

---

## Content Components

### Card
**Use:** Grouping related content, product displays
**Structure:**
```
┌─────────────────────────┐
│ [Image/Icon]             │
│ Title                    │
│ Description text...      │
│ [Tag] [Tag]     [Action] │
└─────────────────────────┘
```
**Variants:**
- **Default:** Image top, content below
- **Horizontal:** Image left, content right
- **Compact:** No image, minimal padding

### List
**Use:** Sequential data, homogeneous items
**Types:**
- **Simple:** Text only
- **With icon:** Icon + text
- **With action:** Text + right action
- **Selectable:** Checkbox + text

### Accordion
**Use:** Collapsible content sections, FAQs
**Pattern:**
```
▶ Section 1 (collapsed)
▼ Section 2 (expanded)
  Content visible here...
▶ Section 3 (collapsed)
```
**Rules:**
- Only one expanded at a time (optional)
- Smooth height animation
- Keyboard: Enter to toggle

### Tree
**Use:** Hierarchical data, file browsers
**Pattern:**
```
▼ Folder A
  ▶ Subfolder 1
  ▶ Subfolder 2
▶ Folder B
▶ Folder C
```
**Rules:**
- Expand/collapse on click
- Indentation shows depth
- Drag-and-drop (optional)

---

## Form Components

### Text Input
**States:** Default, Focus, Error, Disabled, Loading
**Elements:**
- Label (above or left)
- Input field
- Helper text (below)
- Error message (below, red)
- Icon (left or right)

### Select / Dropdown
**Types:**
- **Native:** `<select>` - best accessibility
- **Custom:** Searchable, multi-select, async

**Rules:**
- Clear placeholder
- Selected state visible
- Close on outside click
- Keyboard: Arrow keys, Enter to select

### Checkbox
**Pattern:**
```
☑ Label text
   Helper description (optional)
```
**Rules:**
- Clickable area includes label
- Indeterminate state for groups

### Radio
**Use:** Mutually exclusive options
**Pattern:**
```
○ Option 1
● Option 2 (selected)
○ Option 3
```

### Switch / Toggle
**Use:** Binary on/off, immediate action
**Rules:**
- Different from checkbox visually
- Label: action noun ("Notifications")
- No submit required

---

## Feedback Components

### Alert
**Types:**
- **Info:** Blue, neutral information
- **Success:** Green, action completed
- **Warning:** Yellow, attention needed
- **Error:** Red, blocking issue

**Pattern:**
```
┌─────────────────────────────────────────┐
│ ⚠️  Warning: Your subscription expires   │
│     in 3 days. [Renew now]        [✕]   │
└─────────────────────────────────────────┘
```

### Toast / Notification
**Use:** Non-blocking feedback, auto-dismiss
**Positions:** Top-right, top-center, bottom-right, bottom-center
**Rules:**
- Auto-dismiss in 3-5 seconds
- Pause on hover
- Stacked (max 3-5 visible)
- Progress bar showing remaining time

### Modal / Dialog
**Use:** Critical decisions, complex forms requiring focus
**Structure:**
```
┌──────────────────────────────┐
│ Title                 [✕]  │
├──────────────────────────────┤
│ Content...                   │
│                              │
├──────────────────────────────┤
│                [Cancel] [OK] │
└──────────────────────────────┘
```
**Rules:**
- Focus trap inside
- Close on Escape, outside click, X button
- Scroll lock on body
- Centered or top-aligned

### Tooltip
**Use:** Brief context on hover, icon explanations
**Rules:**
- Max 2 lines
- Never hide critical info
- Position: top, bottom, left, right (auto-flip)
- Delay: 300ms show, 0ms hide

### Popover
**Use:** Richer content than tooltip, interactive
**Difference from tooltip:** Can contain buttons, links, forms

### Progress
**Types:**
- **Linear:** Horizontal bar
- **Circular:** Ring/spinner
- **Steps:** Multi-step wizard indicator

### Skeleton
**Use:** Loading state, content shape preview
**Rules:**
- Match final content layout
- Animate shimmer or pulse
- Reduce layout shift

---

## Data Display Components

### Table
**Structure:**
```
┌──────┬──────────┬─────────┬────────┐
│  ☑   │ Name  ▲  │ Status  │ Action │
├──────┼──────────┼─────────┼────────┤
│  ☑   │ John     │ Active  │  Edit  │
│  ☐   │ Jane     │ Pending │  Edit  │
└──────┴──────────┴─────────┴────────┘
```
**Features:**
- Sortable headers
- Row selection
- Pagination or infinite scroll
- Column resizing (optional)
- Sticky headers

### Data Grid
**Use:** Large datasets, Excel-like interaction
**Features:**
- Cell editing
- Column filtering
- Row/column freezing
- Virtualization for performance

### Statistic / Metric
**Use:** Dashboard numbers, KPIs
**Pattern:**
```
Label
  1,234
  ▲ 12% vs last month
```

---

## Special Components

### Empty State
**Use:** No data to display
**Structure:**
- Illustration (optional)
- Headline ("No projects yet")
- Description ("Create your first project...")
- CTA button ("Create project")

### Loading State
**Types:**
- **Spinner:** Indeterminate, unknown duration
- **Skeleton:** Determinate shape, better UX
- **Progress:** Known duration or steps

### Error State
**Use:** Failed to load data
**Structure:**
- Error illustration/icon
- "Something went wrong"
- Retry button
- Contact support (optional)

### Divider
**Use:** Visual separation
**Types:**
- **Horizontal:** Section breaks
- **Vertical:** Side-by-side content
- **With text:** "OR", "Section Name"

### Avatar
**Use:** User representation
**Sizes:** xs, sm, md, lg, xl
**Fallback:** Initials if no image

### Badge / Tag
**Use:** Status, category, count
**Types:**
- **Status:** dot + text ("Active")
- **Count:** number in circle
- **Tag:** removable label

---

## Component Selection Guide

| Need | Component | Avoid |
|------|-----------|-------|
| Site navigation | Top nav, sidebar | Dropdown-only |
| Page sections | Tabs | Accordion |
| Product list | Card grid | Table |
| Data editing | Table, form | Card list |
| User feedback | Toast, alert | Modal for everything |
| Confirmation | Modal | Alert banner |
| Progress | Step indicator | Multiple spinners |
| Settings | Sidebar + content | Nested tabs |
