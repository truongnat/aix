# Layout Principles - Asymmetry & Grid-Breaking

## Asymmetry Techniques

### Golden Ratio Grids
```css
.golden-grid {
  display: grid;
  grid-template-columns: 1fr 1.618fr; /* 38.2% : 61.8% */
  gap: 2rem;
}

.reverse-golden {
  grid-template-columns: 1.618fr 1fr;
}
```

### Offset Elements
```css
.offset-card {
  position: relative;
}
.offset-card::before {
  content: '';
  position: absolute;
  top: 1rem;
  left: -1rem;
  width: 100%;
  height: 100%;
  background: var(--color-accent);
  z-index: -1;
}
```

### Diagonal Flow
```css
.diagonal-section {
  clip-path: polygon(0 5%, 100% 0, 100% 95%, 0 100%);
  padding: 8rem 0;
}
```

## Overlap & Layering

### Text Over Image
```css
.hero {
  position: relative;
  display: grid;
  place-items: center;
}
.hero-image {
  grid-area: 1 / 1;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.hero-content {
  grid-area: 1 / 1;
  z-index: 1;
  text-align: center;
}
```

### Floating Cards
```css
.floating-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}
.floating-card:nth-child(2) {
  transform: translateY(2rem);
}
.floating-card:nth-child(3) {
  transform: translateY(-1rem);
}
```

### Broken Grid
```css
.broken-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1rem;
}
.broken-item-1 {
  grid-column: 1 / 7;
}
.broken-item-2 {
  grid-column: 5 / 11; /* Overlaps with item-1 */
  z-index: 1;
}
```

## Negative Space

### Generous Padding
```css
.section-spacious {
  padding: 6rem 0; /* Not 2rem or 3rem */
}

@media (min-width: 768px) {
  .section-spacious {
    padding: 10rem 0;
  }
}
```

### Isolated Elements
```css
.isolate-center {
  display: grid;
  place-items: center;
  min-height: 80vh;
  padding: 4rem;
}
.isolate-content {
  max-width: 60ch;
  text-align: center;
}
```

## Container Queries

```css
.card-grid {
  container-type: inline-size;
  display: grid;
  gap: 1rem;
}

@container (min-width: 400px) {
  .card-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@container (min-width: 700px) {
  .card-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

## Responsive Patterns

### Mobile-First Breakpoints
```css
/* Base: Mobile */
.grid {
  display: grid;
  gap: 1rem;
}

/* Tablet */
@media (min-width: 640px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

### Fluid Typography
```css
.fluid-headline {
  font-size: clamp(2rem, 5vw + 1rem, 4rem);
}
```

## Grid Systems

### 12-Column Foundation
```css
.grid-12 {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1.5rem;
}

.span-6 { grid-column: span 6; }
.span-4 { grid-column: span 4; }
.span-3 { grid-column: span 3; }

.start-2 { grid-column-start: 2; }
.start-3 { grid-column-start: 3; }
```

### Masonry (CSS Grid)
```css
.masonry {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  grid-auto-rows: 10px;
  gap: 1rem;
}

.masonry-item:nth-child(2n) {
  grid-row: span 2;
}
.masonry-item:nth-child(3n) {
  grid-row: span 3;
}
```

## Visual Rhythm

### Alternating Layouts
```
Section 1: Image Left | Text Right
Section 2: Text Left | Image Right
Section 3: Image Left | Text Right
...
```

### Z-Pattern Reading
```css
.z-pattern {
  display: grid;
  grid-template-areas:
    "a . b"
    ". c ."
    "d . e";
}
```

## Accessibility

- **Focus indicators:** Visible on all interactive elements
- **Skip links:** Jump to main content
- **Touch targets:** Minimum 44x44px
- **Line length:** 60-75 characters max
- **Line height:** 1.5-1.7 for body text
