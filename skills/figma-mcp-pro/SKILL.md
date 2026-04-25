---
name: figma-mcp-pro
description: |
  Figma design-to-code workflow with MCP server integration.
  Pixel-perfect implementation from Figma designs using structured workflow.
  Design system component discovery, variable extraction, and incremental screen building.
  
  Use when implementing Figma designs in code, connecting design system components,
  or building screens section-by-section from design files.
when_to_use:
  - Implementing Figma designs in code
  - Connecting Figma components to code
  - Extracting design tokens from Figma
  - Building screens from Figma mockups
  - Auditing implemented UI against Figma
  - Generating responsive layouts from designs
  - Converting design system to code
when_not_to_use:
  - No Figma file access
  - Conceptual designs without specs
  - Rushed prototyping without design review
inputs:
  - figma_file: Figma file URL or ID
  - node_id: Specific frame/component node
  - design_system: Existing component library
  - target_tech: React, Vue, HTML/CSS, etc.
outputs:
  - implementation_plan: Section-by-section breakdown
  - component_mapping: Figma → Code component links
  - token_extraction: Colors, typography, spacing
  - generated_code: Framework-specific implementation
---

## Workflow

Apply **Karpathy principles** throughout.

1. **Confirm** Figma context → verify: [file access, node ID, design system].
2. **State assumptions** about responsive behavior, component availability, tech stack.
3. **Apply** section-by-section approach; full page only when justified.
4. **Make surgical changes** — one section at a time, verify, continue.
5. **Define success criteria** (pixel-perfect, responsive, maintainable); verify.
6. **Respond** with implementation plan, component mapping, generated code.

## Operating principles

1. **Think Before Coding** — State assumptions: responsive strategy, component reuse, tech constraints.
2. **Simplicity First** — One section at a time; full page only when justified.
3. **Surgical Changes** — Section-by-section implementation, verify each.
4. **Goal-Driven Execution** — Pixel-perfect, responsive, maintainable; verify with design.

### Figma-to-Code Workflow

**Phase 1: Discovery**
```
1. Access Figma file via MCP
2. Identify design system components
3. Extract design tokens (colors, typography, spacing)
4. Map Figma components to code components
5. Understand responsive breakpoints
```

**Phase 2: Planning**
```
1. Break screen into sections
2. Prioritize sections (hero → content → footer)
3. Identify reusable patterns
4. Plan component hierarchy
5. Define responsive strategy
```

**Phase 3: Implementation**
```
1. Build section-by-section
2. Verify each section against Figma
3. Implement responsive behavior
4. Add interactions and states
5. Accessibility audit
```

**Phase 4: Verification**
```
1. Visual regression against Figma
2. Responsive testing
3. Accessibility check
4. Performance audit
5. Design review
```

### MCP Server Integration

**Capabilities:**
- `get_file` — Access Figma file structure
- `get_node` — Extract specific component/frame
- `get_component_set` — Access design system components
- `get_variables` — Extract design tokens
- `search_design_system` — Find existing components

**Token extraction:**
```javascript
// Colors
const colors = {
  primary: '#3b82f6',
  secondary: '#64748b',
  background: '#ffffff',
  text: '#0f172a',
}

// Typography
const typography = {
  heading: {
    fontFamily: 'Inter',
    fontSize: '24px',
    fontWeight: 600,
    lineHeight: 1.2,
  },
  body: {
    fontFamily: 'Inter',
    fontSize: '16px',
    fontWeight: 400,
    lineHeight: 1.5,
  },
}

// Spacing
const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
}
```

### Component Mapping

**Strategy:**
```
Figma Component → Code Component
├── Button/Primary → <Button variant="primary">
├── Card/Default → <Card>
├── Input/Text → <Input type="text">
└── Icon/Arrow → <Icon name="arrow-right">
```

**Reuse over rebuild:**
- Check existing design system first
- Map to closest available component
- Customize via props, not new components
- Document mapping decisions

## Suggested response format

```markdown
## Figma Implementation: [Screen Name]

### Source
**Figma File:** [URL]
**Frame:** [Node ID]
**Last Modified:** [Date]

### Design System Analysis
**Components Found:**
- Button/Primary → maps to <Button>
- Card/Default → maps to <Card>
- Input/Text → maps to <Input>

**Tokens Extracted:**
- Colors: 12 semantic tokens
- Typography: 6 text styles
- Spacing: 8 spacing values

### Implementation Plan

#### Section 1: Hero
**Figma Node:** #123:456
**Components:** Heading, CTA Button, Image
**Responsive:** Stack on mobile

#### Section 2: Features
**Figma Node:** #789:012
**Components:** 3x Cards, Icons
**Responsive:** 3-col → 1-col

### Generated Code

#### Section 1: Hero
```tsx
// Code implementation
```

### Verification Checklist
- [ ] Pixel-perfect match
- [ ] Responsive behavior
- [ ] All states implemented
- [ ] Accessibility compliant
```

## Quick examples

### Example 1: Landing Page from Figma

**User:** "Implement this landing page from Figma"

**Agent workflow:**
1. **Confirm:** Figma URL, node access, React project
2. **State assumptions:** Responsive breakpoints, component library available
3. **Apply:** Section-by-section (hero first)
4. **Surgical:** Hero section only, verify, then continue
5. **Goal:** Pixel-perfect, responsive, uses design system

**Output:**
- Design tokens extracted
- Component mappings documented
- Hero section code
- Plan for remaining sections

### Example 2: Design System Audit

**User:** "Map our Figma design system to code components"

**Agent workflow:**
1. **Confirm:** Figma component library access
2. **State assumptions:** Existing code component library
3. **Apply:** Map Figma variants to code props
4. **Surgical:** One component at a time
5. **Goal:** Complete mapping, documentation

**Output:**
```markdown
| Figma Component | Code Component | Props Mapping |
|-----------------|--------------|---------------|
| Button/Primary  | Button       | variant="primary" |
| Button/Secondary| Button       | variant="secondary" |
| Card/Default    | Card         | — |
| Input/Text      | Input        | type="text" |
```

### Example 3: Token Extraction

**User:** "Extract all design tokens from this Figma file"

**Agent:** Extract and organize:
- Primitive tokens (colors, spacing)
- Semantic tokens (primary, background)
- Component tokens (button-padding, card-radius)
- Typography scale
- Elevation/shadows

## References

- `/skills/figma-mcp-pro/references/mcp-commands.md` — MCP server capabilities
- `/skills/figma-mcp-pro/references/token-extraction.md` — Token organization
- `/skills/figma-mcp-pro/references/component-mapping.md` — Mapping strategies
- `/skills/figma-mcp-pro/references/responsive-strategy.md` — Breakpoint handling
- `/skills/figma-mcp-pro/references/verification.md` — Visual regression testing

## Checklist

### Pre-implementation
- [ ] Figma file access confirmed
- [ ] Node IDs identified
- [ ] Design system components catalogued
- [ ] Responsive strategy defined

### Implementation
- [ ] **Karpathy Principles Verification:**
  - [ ] Assumptions stated (responsive, components, tech)
  - [ ] Section-by-section approach (full page only when justified)
  - [ ] Surgical changes (one section, verify, continue)
  - [ ] Success criteria defined (pixel-perfect, responsive)
- [ ] Design tokens extracted
- [ ] Components mapped to code
- [ ] Section implemented
- [ ] Responsive behavior added

### Verification
- [ ] Pixel-perfect match with Figma
- [ ] All breakpoints tested
- [ ] Interactions/states implemented
- [ ] Accessibility audit passed
- [ ] Performance acceptable
- [ ] Design review completed

### Documentation
- [ ] Component mapping documented
- [ ] Token structure explained
- [ ] Responsive behavior noted
- [ ] Known deviations listed
