# Responsive Design Strategy

## Breakpoint Mapping

### Standard Web Breakpoints
```
Mobile:  0–640px (sm)
Tablet:  641–1024px (md)
Desktop: 1025px+ (lg)
```

### Figma to Code
- **Figma board 1**: Mobile layout (640px frame)
- **Figma board 2**: Tablet layout (1024px frame)
- **Figma board 3**: Desktop layout (1440px frame)

## Layout Patterns

### Stack Pattern
```
Desktop: Horizontal (3-col grid)
Tablet:  Horizontal (2-col grid)
Mobile:  Vertical (1-col stack)
```

### Hide/Show Pattern
```
Desktop: Show all sections
Tablet:  Hide non-critical sidebar
Mobile:  Hide secondary navigation
```

### Resize Pattern
```
Desktop: Font 24px
Tablet:  Font 20px
Mobile:  Font 16px
```

## Implementation in Code

### Tailwind
```tsx
<div className="grid grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
  {/* Responsive grid */}
</div>
```

### CSS Grid
```css
.grid {
  grid-template-columns: repeat(3, 1fr);
}

@media (max-width: 1024px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
```

## Verification

- [ ] Mobile layout renders correctly at 375px
- [ ] Tablet layout at 768px
- [ ] Desktop layout at 1440px
- [ ] Touch targets ≥44x44px on mobile
- [ ] Text readable without zoom
- [ ] Images scale proportionally
- [ ] No horizontal scroll overflow
