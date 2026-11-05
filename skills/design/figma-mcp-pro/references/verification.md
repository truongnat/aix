# Verification & Testing

## Pixel-Perfect Comparison

### Visual Regression Testing
- Use tools: Percy, Chromatic, or manual screenshot comparison
- Capture implementation at same breakpoints as Figma
- Compare side-by-side pixel-by-pixel

### Tolerance Thresholds
- Colors: Exact match (0px difference)
- Spacing: ±1px tolerance
- Typography: Exact font/size/weight/line-height
- Images: Natural scaling, no distortion

## Responsive Testing

### Breakpoint Verification
- Test at 375px (mobile), 768px (tablet), 1440px (desktop)
- Verify each breakpoint matches corresponding Figma board
- Check touch targets ≥44x44px minimum
- Test horizontal scroll — should not occur

### Device Testing
- Chrome DevTools device emulation
- Actual device testing (if possible)
- Both portrait and landscape orientation (mobile)

## Accessibility Audit

- [ ] Semantic HTML (heading hierarchy, landmarks)
- [ ] ARIA labels where necessary
- [ ] Color contrast ≥4.5:1 for normal text
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Images have alt text
- [ ] Form labels associated with inputs

## Interaction Testing

- [ ] Hover states match design
- [ ] Active/focus states visible
- [ ] Transitions/animations smooth
- [ ] Click targets responsive
- [ ] Form submission works
- [ ] Error states display correctly

## Performance Checklist

- [ ] Core Web Vitals: LCP <2.5s, FID <100ms, CLS <0.1
- [ ] Images optimized (WebP, correct size)
- [ ] CSS/JS minified
- [ ] No console errors
- [ ] Load time acceptable

## Sign-Off

- [ ] Visual match against Figma (pixel-perfect)
- [ ] Responsive behavior verified (3+ breakpoints)
- [ ] Accessibility passes WCAG AA
- [ ] Interactions complete and smooth
- [ ] Performance acceptable
- [ ] Design review completed and approved
