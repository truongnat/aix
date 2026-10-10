# Layout Patterns - Responsive Design Guidelines

## Grid Systems

### 12-Column Grid
**Use:** Complex layouts, dashboards, admin panels
**Breakpoints:**
- Mobile: 4 columns
- Tablet: 8 columns  
- Desktop: 12 columns

```css
.container {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1.5rem;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
}

.col-6 { grid-column: span 6; }
.col-4 { grid-column: span 4; }
.col-3 { grid-column: span 3; }
.col-12 { grid-column: span 12; }

@media (max-width: 768px) {
  .col-6, .col-4, .col-3 {
    grid-column: span 12;
  }
}
```

### CSS Grid Auto-Fit
**Use:** Card grids, galleries, equal-sized items
```css
.auto-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}
```

### Flexbox Patterns
**Horizontal layout:**
```css
.flex-row {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.flex-row-wrap {
  flex-wrap: wrap;
}

.flex-space-between {
  justify-content: space-between;
}
```

**Vertical stack:**
```css
.flex-col {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
```

## Responsive Breakpoints

### Standard Breakpoints
```css
/* Mobile first */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
```

### Container Queries
**Use:** Component-level responsiveness
```css
.card-container {
  container-type: inline-size;
}

@container (min-width: 400px) {
  .card {
    flex-direction: row;
  }
}
```

## Spacing Patterns

### 8px Grid System
```
4px   — tight
8px   — compact
16px  — standard
24px  — relaxed
32px  — spacious
48px  — section
64px  — major section
```

### Consistent Spacing
```css
/* Margin utilities */
.m-0 { margin: 0; }
.m-1 { margin: 0.25rem; }  /* 4px */
.m-2 { margin: 0.5rem; }   /* 8px */
.m-4 { margin: 1rem; }     /* 16px */
.m-6 { margin: 1.5rem; }   /* 24px */
.m-8 { margin: 2rem; }     /* 32px */
```

## Common Layouts

### Sidebar + Content
```
┌────────────────────────────┐
│ Sidebar  │  Main Content   │
│  240px   │   flexible      │
│          │                 │
│          │                 │
└────────────────────────────┘
```

```css
.layout-sidebar {
  display: grid;
  grid-template-columns: 240px 1fr;
  min-height: 100vh;
}

@media (max-width: 768px) {
  .layout-sidebar {
    grid-template-columns: 1fr;
  }
  .sidebar {
    display: none; /* Or transform to overlay */
  }
}
```

### Header + Content
```css
.layout-header {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.header {
  position: sticky;
  top: 0;
  z-index: 10;
}

.main {
  flex: 1;
  padding: 2rem;
}
```

### Card Grid
```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

/* For equal height cards */
.card-grid > * {
  display: flex;
  flex-direction: column;
}
```

## Responsive Patterns

### Mobile-First Approach
1. Start with mobile layout
2. Add complexity at larger breakpoints
3. Use `min-width` media queries

### Content Priority
**Mobile:** Stack vertically, most important content first
**Tablet:** 2-column where appropriate
**Desktop:** Full layout with all features

### Touch Target Sizes
- Minimum: 44×44px (iOS), 48×48dp (Android)
- Comfortable: 48×48px minimum
- Spacing between targets: 8px minimum

## Layout Anti-Patterns

### ❌ Avoid
- Fixed widths that break on mobile
- Horizontal scroll on mobile
- Too many breakpoints (>5)
- Inconsistent spacing
- Content wider than viewport

### ✅ Do
- Fluid layouts with max-width
- Mobile-first CSS
- Consistent 8px grid
- Test on actual devices
- Use container queries for components
