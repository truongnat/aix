# Accessibility Anti-patterns

## 1. Using ARIA instead of semantic HTML

**Symptom**: `<div role="button" tabindex="0">` instead of `<button>`.
**Fix**: Use native HTML elements first. `<button>` gives you role, keyboard interaction, and focus for free. `<div role="button">` requires you to manually re-implement all of that.

## 2. Missing focus management on modal dialogs

**Symptom**: User opens a modal, Tab continues traversing the page behind it.
**Fix**: On open, move focus to the first interactive element inside the modal. Trap Tab/Shift+Tab within the modal. On close, restore focus to the trigger element.

## 3. `aria-hidden="true"` on focusable elements

**Symptom**: `<button aria-hidden="true">Close</button>` — keyboard users can still focus it but screen readers ignore it.
**Fix**: Never put `aria-hidden` on focusable elements. Either make the element non-focusable (`tabindex="-1"`) or remove the `aria-hidden`.

## 4. Empty or generic alt text on informative images

**Symptom**: `<img src="chart.png" alt="image">` or `alt=""` on a chart that conveys data.
**Fix**: `alt=""` is correct only for decorative images. Informative images need descriptive alt text. Charts need either inline data or a linked data table.

## 5. Relying solely on automated tools

**Symptom**: "We passed axe, so we're WCAG compliant."
**Fix**: Automated tools catch ~30–50% of real issues. Manual keyboard testing and screen reader walkthroughs are mandatory for any form, modal, or dynamic interaction.

## 6. Dynamic content without `aria-live`

**Symptom**: A form shows an error message but screen reader users don't hear it because focus didn't move there.
**Fix**: Add `aria-live="polite"` to status regions. Use `aria-live="assertive"` only for genuine errors that interrupt the user.

## 7. Tab order that doesn't match visual order

**Symptom**: `tabindex="5"` scattered through the DOM; tab order jumps around.
**Fix**: Never use positive `tabindex` values. Remove them all; rely on DOM source order. Fix the DOM order if the visual order is wrong.

## 8. Focus styles removed

**Symptom**: `*:focus { outline: none; }` in a global CSS reset — invisible focus for keyboard users.
**Fix**: Use `:focus-visible` instead of `:focus` for custom styles so mouse users don't see outlines but keyboard users do. Minimum 2px outline, 3:1 contrast ratio (WCAG 2.2).

## 9. Colour as the only information channel

**Symptom**: Red = error, green = success, no other indicator.
**Fix**: Add an icon, text label, or pattern alongside colour. 8% of men have red-green colour blindness.

## 10. Skipping heading levels

**Symptom**: `<h1>` followed by `<h4>` — visual size is fine but logical structure is broken.
**Fix**: Headings must be sequential (h1 → h2 → h3). Screen reader users navigate by heading; gaps break the document outline.
