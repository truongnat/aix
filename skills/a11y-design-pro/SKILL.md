---
name: a11y-design-pro
description: Use this skill whenever the user wants to work with accessible and inclusive design, WCAG compliance, accessibility testing, or inclusive design practices. This includes implementing accessible UI components, WCAG 2.1/2.2 compliance, accessibility testing with screen readers, keyboard navigation, color contrast optimization, ARIA attributes, semantic HTML, and inclusive design for diverse users. If the user mentions accessibility, WCAG, inclusive design, or accessible UI components, use this skill.
license: MIT
metadata:
  short-description: "Accessibility — WCAG compliance, inclusive design, ARIA, keyboard navigation, screen readers"
---

## Boundary

This skill handles accessibility and inclusive design tasks including WCAG compliance, accessibility testing, keyboard navigation, screen reader optimization, color contrast, ARIA attributes, semantic HTML, and inclusive design for diverse users. It focuses on using accessibility tools (axe, WAVE, Lighthouse, screen readers, accessibility APIs) and WCAG guidelines. It does NOT cover general UI/UX design principles or visual design aesthetics.

## When to use

Use this skill when:
- Implementing WCAG 2.1/2.2 compliant UI components
- Testing accessibility with screen readers (NVDA, JAWS, VoiceOver)
- Optimizing keyboard navigation and focus management
- Checking color contrast ratios for accessibility
- Adding ARIA attributes to dynamic content
- Creating semantic HTML structures
- Designing for diverse user needs (visual, motor, cognitive)
- Implementing accessible forms and interactive elements
- Testing with accessibility tools (axe, WAVE, Lighthouse)

DO NOT use this skill for:
- General UI/UX design principles (use ui-design-brain-pro)
- Visual design aesthetics (use design-system-pro)
- Responsive design (use frontend-design-pro)
- Design system components (use design-system-pro)

## Workflow

1. **Identify accessibility requirements** (WCAG level, user needs, legal requirements)
2. **Audit current accessibility** using automated tools and manual testing
3. **Implement semantic HTML** structure and landmarks
4. **Add ARIA attributes** for dynamic content and widgets
5. **Optimize keyboard navigation** (focus order, visible focus, skip links)
6. **Ensure color contrast** meets WCAG AA/AAA standards
7. **Test with screen readers** (NVDA, JAWS, VoiceOver)
8. **Validate with accessibility tools** (axe, WAVE, Lighthouse)
9. **Document accessibility features** and testing results

### Operating principles

- **Follow WCAG 2.1/2.2 guidelines** for compliance
- **Test with real assistive technologies**, not just automated tools
- **Design for keyboard-first** navigation
- **Provide alternative text** for all non-text content
- **Ensure sufficient color contrast** (4.5:1 for AA, 7:1 for AAA)
- **Use semantic HTML** for proper structure
- **Add ARIA attributes** only when necessary
- **Test with diverse users** including those with disabilities

## Suggested response format

```
Accessibility Task: [WCAG compliance / testing / implementation]
WCAG Level: [A / AA / AAA]
Target Users: [visual / motor / cognitive / hearing impairments]
Tools Used: [axe, WAVE, Lighthouse, screen readers]
Audit Results: [accessibility issues found]
Implementation: [accessibility features implemented]
Testing Results: [screen reader, keyboard navigation test results]
Compliance Status: [compliant / needs improvement]
Recommendations: [next steps for accessibility improvements]
```

## Resources in this skill

- **WCAG Guidelines**: WCAG 2.1, WCAG 2.2
- **Accessibility Tools**: axe, WAVE, Lighthouse, Pa11y
- **Screen Readers**: NVDA, JAWS, VoiceOver, TalkBack
- **Accessibility APIs**: ARIA, Accessible Rich Internet Applications
- **Reference Documentation**: REFERENCE.md for advanced accessibility techniques

## Quick example

**Check color contrast:**

```
1. Use axe DevTools or WAVE to test color contrast
2. Check all text and interactive elements
3. Verify contrast ratios meet WCAG AA (4.5:1) or AAA (7:1)
4. Identify failing elements
5. Adjust colors to meet requirements
6. Re-test to verify compliance
```

## Checklist before calling the skill done

- [ ] WCAG compliance level is specified
- [ ] Target user disabilities are identified
- [ ] Accessibility tools are available
- [ ] Screen readers are installed for testing
- [ ] Color contrast requirements are understood
- [ ] ARIA attributes are documented
- [ ] Keyboard navigation requirements are defined
- [ ] Testing plan is established

---

# Accessibility Design Guide

## Overview

This guide covers essential accessibility and inclusive design techniques using WCAG guidelines and accessibility tools. For advanced accessibility techniques and real-world examples, see REFERENCE.md.

## Quick Start

```javascript
// Check color contrast
const contrastRatio = getContrastRatio(foregroundColor, backgroundColor);
const wcagAA = contrastRatio >= 4.5;
const wcagAAA = contrastRatio >= 7.0;

// Add ARIA attribute
button.setAttribute('aria-expanded', 'false');
button.setAttribute('aria-controls', 'menu-id');
```

## WCAG Compliance

### WCAG 2.1 Principles (POUR)
- **Perceivable**: Information must be presented in ways users can perceive
- **Operable**: Interface components must be operable by users
- **Understandable**: Information and operation must be understandable
- **Robust**: Content must be robust enough to be interpreted by assistive technologies

### WCAG 2.2 New Success Criteria
- **Focus Not Obscured**: Ensure focus is not obscured by other content
- **Focus Appearance**: Ensure focus indicator is visible
- **Dragging Movements**: Provide alternatives to dragging
- **Target Size**: Ensure touch targets are at least 44x44 pixels

## Semantic HTML

### Landmarks
```html
<header role="banner">
  <nav role="navigation" aria-label="Main navigation">
    <!-- Navigation links -->
  </nav>
</header>

<main role="main">
  <!-- Main content -->
</main>

<aside role="complementary">
  <!-- Sidebar content -->
</aside>

<footer role="contentinfo">
  <!-- Footer content -->
</footer>
```

### Headings Structure
```html
<h1>Main page title</h1>
  <h2>Section title</h2>
    <h3>Subsection title</h3>
  <h2>Another section</h2>
```

## ARIA Attributes

### ARIA Roles
```html
<!-- Navigation menu -->
<nav role="navigation" aria-label="Main menu">
  <ul>
    <li><a href="/">Home</a></li>
    <li><a href="/about">About</a></li>
  </ul>
</nav>

<!-- Modal dialog -->
<div role="dialog" aria-modal="true" aria-labelledby="dialog-title">
  <h2 id="dialog-title">Dialog title</h2>
  <p>Dialog content</p>
</div>
```

### ARIA States and Properties
```html
<!-- Expandable menu -->
<button aria-expanded="false" aria-controls="menu-id">
  Menu
</button>
<ul id="menu-id" hidden>
  <li><a href="/">Home</a></li>
  <li><a href="/about">About</a></li>
</ul>

<!-- Progress indicator -->
<div role="progressbar" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100">
  50% complete
</div>
```

## Keyboard Navigation

### Focus Management
```javascript
// Set focus to element
element.focus();

// Trap focus in modal
function trapFocus(element) {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  element.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
      } else if (!e.shiftKey && document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
      }
    }
  });
}
```

### Skip Links
```html
<a href="#main-content" class="skip-link">
  Skip to main content
</a>

<main id="main-content">
  <!-- Main content -->
</main>
```

## Color Contrast

### Calculate Contrast Ratio
```javascript
function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(color1, color2) {
  const lum1 = getLuminance(color1.r, color1.g, color1.b);
  const lum2 = getLuminance(color2.r, color2.g, color2.b);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}
```

### Check WCAG Compliance
```javascript
function checkWCAGCompliance(contrastRatio, level = 'AA') {
  const thresholds = {
    A: 3.0,
    AA: 4.5,
    AAA: 7.0
  };
  return contrastRatio >= thresholds[level];
}
```

## Screen Reader Testing

### NVDA (Windows)
- Download NVDA from nvaccess.org
- Test with NVDA + Firefox
- Use NVDA + Chrome for web testing
- Test keyboard navigation with NVDA

### VoiceOver (macOS/iOS)
- Enable VoiceOver: Cmd + F5
- Test with Safari on macOS
- Test with Safari on iOS
- Use rotor for navigation (Cmd + U)

### JAWS (Windows)
- Download JAWS from Freedom Scientific
- Test with JAWS + IE/Edge
- Test with JAWS + Firefox

## Accessibility Tools

### axe DevTools
```javascript
// Run axe-core programmatically
import axe from 'axe-core';

const results = await axe.run(document.body);
console.log(results.violations);
```

### Lighthouse
```bash
# Run Lighthouse accessibility audit
lighthouse https://example.com --view --only-categories=accessibility
```

### WAVE
- Use WAVE browser extension
- Test with WAVE online tool
- Review WAVE errors and alerts

## Accessible Forms

### Form Labels
```html
<label for="name">Name:</label>
<input type="text" id="name" name="name" required>

<!-- Radio buttons -->
<fieldset>
  <legend>Choose an option:</legend>
  <input type="radio" id="option1" name="options" value="1">
  <label for="option1">Option 1</label>
  
  <input type="radio" id="option2" name="options" value="2">
  <label for="option2">Option 2</label>
</fieldset>
```

### Error Messages
```html
<div role="alert" aria-live="polite">
  Please fill in all required fields
</div>
```

## Quick Reference

| Task | Best Tool | Key Feature |
|------|-----------|-------------|
| Automated Testing | axe, Lighthouse | Fast, comprehensive |
| Visual Testing | WAVE | Visual feedback |
| Screen Reader Testing | NVDA, VoiceOver | Real-world testing |
| Color Contrast | WebAIM Contrast Checker | WCAG compliance |
| Keyboard Testing | Manual | Focus management |

## Next Steps

- For advanced accessibility techniques, see REFERENCE.md
- For WCAG 2.2 guidelines, consult W3C documentation
- For accessibility testing, explore screen reader documentation
