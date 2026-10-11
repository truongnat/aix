---
name: accessibility-compliance
description: Implement WCAG 2.2 compliant interfaces with mobile accessibility, inclusive design patterns, and assistive technology support. Use when auditing accessibility, implementing ARIA patterns, building for screen readers, or ensuring inclusive user experiences.
metadata:
  kind: "domain"
  version: "0.1.0"
  tags: "frontend,ui,ux,visual-design"
  roles: "designer,frontend"
  compatible: "claude,cursor,codex,gemini"

---

# Accessibility Compliance

## Boundary

This skill owns **accessibility compliance, WCAG-oriented implementation and audits**. It does not own **brand art direction or general frontend architecture**; hand off those concerns to the relevant domain skill.

## When not to use

- When the request is outside the boundary above or requires a different primary owner.
- When a shared design-system, accessibility, or framework contract already governs the decision and should lead.

## Required inputs

- Target users, product goal, platform/device constraints, and existing assets.
- Current implementation or visual references, quality criteria, and known accessibility requirements.
- Desired output type, scope of change, and verification evidence expected.

## Cross-skill handoffs

- `sk-design-system-pro` / `sk-design-system-pro` for tokens, themes, and reusable component governance.
- `sk-accessibility-compliance` for WCAG, keyboard, screen-reader, and assistive-technology requirements.
- `sk-frontend-patterns` / `sk-web-component-design` for implementation and component API decisions.
- `sk-frontend-design-pro` / `sk-ux-design-pro` for product-level visual direction and interaction design.

Master accessibility implementation to create inclusive experiences that work for everyone, including users with disabilities.

## When to Use This Skill

- Implementing WCAG 2.2 Level AA or AAA compliance
- Building screen reader accessible interfaces
- Adding keyboard navigation to interactive components
- Implementing focus management and focus trapping
- Creating accessible forms with proper labeling
- Supporting reduced motion and high contrast preferences
- Building mobile accessibility features (iOS VoiceOver, Android TalkBack)
- Conducting accessibility audits and fixing violations

## Detailed patterns and worked examples

Detailed pattern documentation lives in `references/details.md`. Read that file when the navigation tier above is insufficient.

## Best Practices

1. **Use Semantic HTML**: Prefer native elements over ARIA when possible
2. **Test with Real Users**: Include people with disabilities in user testing
3. **Keyboard First**: Design interactions to work without a mouse
4. **Don't Disable Focus Styles**: Style them, don't remove them
5. **Provide Text Alternatives**: All non-text content needs descriptions
6. **Support Zoom**: Content should work at 200% zoom
7. **Announce Changes**: Use live regions for dynamic content
8. **Respect Preferences**: Honor prefers-reduced-motion and prefers-contrast

## Common Issues

- **Missing alt text**: Images without descriptions
- **Poor color contrast**: Text hard to read against background
- **Keyboard traps**: Focus stuck in component
- **Missing labels**: Form inputs without associated labels
- **Auto-playing media**: Content that plays without user initiation
- **Inaccessible custom controls**: Recreating native functionality poorly
- **Missing skip links**: No way to bypass repetitive content
- **Focus order issues**: Tab order doesn't match visual order

## Testing Tools

- **Automated**: axe DevTools, WAVE, Lighthouse
- **Manual**: VoiceOver (macOS/iOS), NVDA/JAWS (Windows), TalkBack (Android)
- **Simulators**: NoCoffee (vision), Silktide (various disabilities)

## Output

Produce an accessibility audit or implementation artifact with WCAG target, findings by severity, affected paths/components, evidence, remediation, and verification steps.

Use `references/audit-and-remediation-matrix.md` to triage severity, reproduce issues, run manual assistive-technology checks, assign remediation, and prove regression fixes.

## Example

Automated axe/pa11y audit as the first pass before manual review:

```bash
# Run axe-core against a built page — catches contrast, labels, ARIA misuse
npx pa11y --standard WCAG2AA --reporter json http://localhost:3000/checkout
# In-browser axe for a full violation report with element targets
npx axe http://localhost:3000/checkout --exit
# CI gate: fail the build on any critical violation
npx pa11y --threshold 0 http://localhost:3000/checkout
```
