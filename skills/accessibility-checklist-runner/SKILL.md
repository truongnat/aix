---
name: accessibility-checklist-runner
description: "Run a practical accessibility checklist over a web/app UI: keyboard navigation, focus visibility, form labels, contrast, alt text, heading structure, dynamic announcements, and state readability. Use when a tester needs a structured manual a11y pass without deep WCAG auditing, or wants issues documented with evidence and severity."
metadata:
  kind: "domain"
  version: "0.2.0"
  tags: "qa,accessibility,a11y,checklist"
---

# Accessibility Checklist Runner

## Timestamp and artifact convention
As soon as this skill starts, capture the current timestamp in the user's/project's timezone, formatted `YYYY-MM-DD HH:mm:ss Z`.

If checklist files are created, store them under:

```text
artifacts/YYYY-MM-DD/accessibility-checklist-runner/HHmmss-page-or-flow/
```

Every artifact must record `Session timestamp`, the page/flow reviewed, which checklist groups ran, found issues, and evidence. All main chat output must also show `Session timestamp`.

## Goal
Give a manual tester a real-world accessibility smoke pass — catching the issues users with keyboards, screen readers, or low vision actually hit — without requiring WCAG-expert-level knowledge or claiming formal compliance.

## Before you start — scope the pass
Confirm (or ask, max 2 questions):
- Which page, screen, or flow is in scope, and on which environment/build.
- Any known context: is this a logged-in area, a form-heavy flow, a marketing page?

## Checklist

### 1. Keyboard operation
- Tab order follows the visual/logical order — no jumping between distant sections.
- Every interactive element is reachable and operable by keyboard alone: buttons, links, menus, tabs, dialogs, custom dropdowns, carousels.
- No keyboard traps (user can Tab/Shift+Tab/Escape out of menus, dialogs, embedded widgets).
- Enter/Space activate; arrow keys work inside composite widgets (menus, tab lists, sliders); Escape closes dialogs and popups.
- "Skip to main content" link exists and works on pages with heavy navigation.

### 2. Focus visibility
- A clearly visible focus indicator on every focusable element — flag elements where focus is invisible or nearly invisible (often removed via `outline: none` without a replacement).
- Focus is moved correctly: after opening a modal, focus lands inside it; after closing, focus returns to the trigger.

### 3. Forms
- Every input, select, and textarea has a programmatically associated label (not just a placeholder — placeholder is not a label).
- Required fields are indicated in a way that is not color-only.
- Error messages are text, appear near the field, and identify which field failed and why.
- Related controls are grouped (radio sets, checkbox groups have a group label).

### 4. Contrast and color
- Text and interactive elements have sufficient contrast (rough rule: 4.5:1 for normal text, 3:1 for large text and UI components). If you cannot measure, say "manual visual estimate" — do not state a ratio you did not measure.
- Information is not conveyed by color alone: error states, required markers, chart series, status badges must have a text/icon/shape cue as well.

### 5. Images and icons
- Informative images have meaningful `alt` text; decorative images have empty `alt=""` (not missing alt, which makes screen readers announce the filename).
- Icon-only buttons have an accessible name (`aria-label`, visually hidden text, or `title` at minimum).
- Flag suspicious alts: `alt="image"`, `alt="photo.jpg"`, `alt="alt text"`.

### 6. Structure and headings
- Headings follow a sensible hierarchy (no jumping h1 → h4, no empty headings used for styling).
- One `<main>` landmark; nav in `<nav>`; footer in `<footer>` where checkable.
- Dialogs have an accessible title; tables used for data have header cells, not just styled `<div>`s.

### 7. Dynamic content
- Toasts, inline validation, loading spinners, and dynamically inserted content are announced or at least do not silently appear off-screen for assistive tech. If you cannot run a screen reader, mark as "needs screen-reader verification" rather than guessing.
- New content does not unexpectedly change context: no auto-submit on select change, no surprise navigation on focus.

### 8. States and zoom
- Disabled, loading, empty, and error states remain understandable: disabled does not mean invisible; a spinner has text like "Loading…" not just animation.
- Zoom the page to 200% (or use browser text-resize): content must not overlap, clip, or require horizontal scrolling for reading.

## How to run the pass
1. Keyboard pass first — put the mouse aside and complete the flow with Tab/Shift+Tab/Enter/Escape/arrows only. Note exactly where you get stuck.
2. Zoom/contrast pass — 200% zoom, then a visual contrast scan.
3. Forms pass — if the scope contains forms.
4. Quick structural check — DevTools Elements panel or a browser extension to inspect labels/alt/headings; you do not need a paid tool.
5. For every failure, capture evidence: screenshot, the element's DOM snippet, and the exact keystroke sequence that exposes the issue.

## Severity scale
- `Blocker`: a core task is impossible without a mouse — cannot submit the form, cannot open/close the modal, trapped focus.
- `High`: operable but painful or confusing — invisible focus, unlabeled inputs, errors announced nowhere.
- `Medium`: friction but workaround exists — awkward tab order, weak (but visible) focus.
- `Low`: polish — minor heading-order oddity, decorative image with noisy alt.

## Output format

```text
Session timestamp: [YYYY-MM-DD HH:mm:ss Z]
Page/flow: [screen or flow name] — [environment/build]
Method: [manual keyboard + visual | + DevTools inspection]

| Group | Check | Result | Issue | Severity | Evidence |
|---|---|---|---|---|---|
| Keyboard | Tab through checkout form | FAIL | Focus trapped in card-number iframe | Blocker | repro keys, screenshot |

Summary:
- Blocker/High: [...]
- Medium/Low: [...]
- Needs dev/design confirmation: [...]
- Not verified (needs tool/screen reader): [...]
```

## Anti-patterns
- Claiming "WCAG compliant" or "passes WCAG" from a manual checklist — this is a smoke pass, not an audit.
- Reporting "no contrast issues" without measuring or at least stating it was a visual estimate.
- Listing "screen reader broken" without running one; if untested, file under "needs screen-reader verification."
- Flagging only automated-check findings — real keyboard and focus issues usually do not show up in DOM scans.
