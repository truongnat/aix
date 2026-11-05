# Design Token Extraction

## Token Categories

### Primitive Tokens
- **Colors**: Base palette (red-50 through red-900)
- **Typography**: Font families, sizes, weights
- **Spacing**: Spacing scale (4px, 8px, 16px, etc.)
- **Border radius**: Corner radius values
- **Shadows**: Elevation system (shadow-sm, shadow-md, etc.)

### Semantic Tokens
- **Brand**: `primary`, `secondary`, `accent`
- **Status**: `success`, `warning`, `error`, `info`
- **Neutral**: `background`, `surface`, `text`, `border`
- **Interaction**: `hover`, `active`, `disabled`, `focus`

### Component Tokens
- Button: padding, height, border-radius
- Card: padding, shadow, border
- Input: height, padding, border

## Extraction Process

1. **Access Figma design variables** via MCP `get_variables()`
2. **Parse local styles** (named styles in Figma)
3. **Extract typography scales** from text styles
4. **Collect color palette** including semantic mappings
5. **Document spacing scale** and breakpoints

## Output Format

### CSS Variables
```css
:root {
  --color-primary: #3b82f6;
  --color-secondary: #64748b;
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --font-family-base: 'Inter';
}
```

### TypeScript (design tokens)
```typescript
export const tokens = {
  colors: {
    primary: '#3b82f6',
    secondary: '#64748b',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
  },
  typography: {
    base: {
      fontFamily: 'Inter',
      fontSize: '16px',
      lineHeight: 1.5,
    },
  },
};
```

### Tailwind Config
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        secondary: '#64748b',
      },
      spacing: {
        xs: '4px',
        sm: '8px',
      },
    },
  },
};
```

## Best Practices

- **Use semantic names**, not colors (primary vs blue-500)
- **Document token usage** (when to use which tokens)
- **Version tokens** when making updates
- **Validate completeness** against design spec
- **Automate extraction** with build tools
