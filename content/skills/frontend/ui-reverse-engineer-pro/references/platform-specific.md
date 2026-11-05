# Platform-Specific Guidance

## React / Next.js

**Prioritize:**
- Clear flex/grid layout
- Explicit spacing tokens
- Early component separation
- Design system integration (shadcn if aligned)

**Key considerations:**
- Server Components vs Client Components
- Responsive breakpoints (mobile-first approach)
- Accessibility (ARIA labels, keyboard navigation)
- Performance (lazy loading, code splitting)

**Common patterns:**
- `flex`, `grid`, `gap` for layout
- `p-`, `m-`, `px-`, `py-` for spacing
- `text-` classes for typography
- Component composition over nesting

---

## React Native

**Prioritize:**
- Strong visual hierarchy
- Even spacing throughout
- Avoid over-forcing web style
- Check vertical rhythm
- SafeArea for mobile edges

**Key considerations:**
- Platform-specific conventions (iOS vs Android)
- Touch targets (44pt minimum)
- Keyboard avoidance
- Safe area handling (notch, home indicator)
- Performance (FlatList vs ScrollView)

**Common patterns:**
- `View`, `Text`, `Image` as base components
- `StyleSheet` for organized styles
- `useWindowDimensions` for responsive
- `SafeAreaView` for edge handling
- Platform-specific components (`Platform.OS`)

---

## Flutter

**Prioritize:**
- Clean widget tree
- Proper use of `Column`, `Row`, `Padding`, `SizedBox`, `Expanded`
- Don't hardcode everything per screenshot
- Separate widget by section first, style after

**Key considerations:**
- Widget composition
- State management (setState, provider, bloc)
- Platform adaptations (Material vs Cupertino)
- Performance (const widgets, rebuild optimization)
- Accessibility (Semantics widget)

**Common patterns:**
- `Column` / `Row` for layout
- `Padding` / `SizedBox` for spacing
- `Expanded` / `Flexible` for flex behavior
- `Container` for styling
- Platform-specific themes

---

## Web (HTML/CSS)

**Prioritize:**
- Semantic HTML
- CSS Grid/Flexbox
- Mobile-first responsive
- CSS variables for theming

**Key considerations:**
- Browser compatibility
- Accessibility (semantic markup, ARIA)
- Performance (CSS optimization)
- Responsive design (breakpoints)

**Common patterns:**
- Semantic elements (`header`, `main`, `section`, `article`)
- CSS Grid for 2D layouts
- Flexbox for 1D layouts
- CSS custom properties for tokens
- Media queries for responsive

---

## Cross-Platform Considerations

**Spacing:**
- Use relative units where possible
- Platform-specific spacing adjustments
- Touch target considerations on mobile

**Typography:**
- Platform font stacks
- Readable sizes on mobile
- Line height adjustments

**Components:**
- Platform-specific components (tabs, navigation)
- Touch vs click interactions
- Platform conventions (back button, menus)

**Performance:**
- Platform-specific optimization
- Lazy loading strategies
- Bundle size considerations
