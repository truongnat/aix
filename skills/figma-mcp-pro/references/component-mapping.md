# Figma → Code Component Mapping

## Mapping Strategy

### 1. Inventory Phase
- **Figma side**: Extract all component instances and variants
- **Code side**: Catalog available components in library
- **Gap analysis**: Identify missing or misaligned components

### 2. Matching Phase
```
Figma Component      Code Component    Props Mapping
Button/Primary    →  Button          → variant="primary"
Button/Secondary  →  Button          → variant="secondary"
Input/Text        →  Input           → type="text"
Card/Default      →  Card            → —
```

### 3. Customization Phase
- **No match**: Create new component or use generic wrapper
- **Partial match**: Document prop mappings and customizations
- **Multiple variants**: Normalize to single component with variants

## Common Patterns

### Buttons
```
Figma: Button/Primary, Button/Secondary, Button/Danger
Code:  <Button variant="primary" | "secondary" | "danger">
```

### Cards
```
Figma: Card/Default, Card/Elevated, Card/Outline
Code:  <Card variant="default" | "elevated" | "outline">
```

### Forms
```
Figma: Input/Text, Input/Password, Input/Email
Code:  <Input type="text" | "password" | "email">
```

## Decision Tree

**Is there an exact match in code component library?**
- Yes → Map directly with variant/props
- No → Check for partial match
  - Partial → Document customization path
  - None → Create new component or use HTML

## Anti-Patterns

❌ **Create new component for every variant**
- Too many components, hard to maintain

✅ **Use props and variants to express design**
- Single Button component with `variant` prop

❌ **Ignore responsive behavior**
- Components look wrong on mobile

✅ **Map breakpoints and document stack behavior**
- 3-col → 1-col behavior explicit

## Documentation

For each mapped component, document:
- Figma component path
- Code component import
- Props mapping table
- Known deviations
- Responsive behavior
