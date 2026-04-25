# Interaction States - 5-State Model

## The 5 States

Every interactive element must support:

1. **Default** — Initial state
2. **Hover** — Mouse over
3. **Active/Pressed** — Click/tap in progress
4. **Focus** — Keyboard navigation
5. **Disabled** — Unavailable for interaction

---

## State Definitions

### 1. Default State
**Visual:** Normal appearance
**Behavior:** Ready for interaction
**Accessibility:** None specific

```css
.btn {
  background: var(--color-primary);
  color: var(--color-on-primary);
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
}
```

### 2. Hover State
**Visual:** Subtle change indicating interactivity
**Behavior:** Cursor changes, slight elevation or color shift
**Timing:** Immediate (< 100ms)

```css
.btn:hover {
  background: var(--color-primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
```

**Guidelines:**
- Must be noticeable but subtle
- Never hide information on hover only
- Works for mouse, not touch

### 3. Active/Pressed State
**Visual:** Pressed down appearance
**Behavior:** Immediate feedback on click/tap
**Timing:** Instant

```css
.btn:active {
  background: var(--color-primary-active);
  transform: translateY(0) scale(0.98);
  box-shadow: none;
}
```

**Touch devices:**
- Show state for ~100ms after tap
- Prevents accidental double-taps

### 4. Focus State
**Visual:** Clear indicator for keyboard users
**Requirement:** Must be visible (WCAG 2.4.7)
**Implementation:**

```css
.btn:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: 2px;
}

/* Remove default outline, add custom */
.btn:focus {
  outline: none;
}
```

**Never:**
- Remove focus indicator without replacement
- Use `:focus` alone (affects mouse clicks)
- Make focus indicator too subtle

### 5. Disabled State
**Visual:** Grayed out, reduced opacity
**Behavior:** No interaction possible
**Cursor:** `not-allowed`

```css
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: var(--color-muted);
}

/* Prevent hover effects on disabled */
.btn:disabled:hover {
  transform: none;
  box-shadow: none;
}
```

**Accessibility:**
- Include `aria-disabled="true"` if not using `disabled` attribute
- Explain why disabled (tooltip or helper text)
- Consider loading state instead when possible

---

## Component-Specific States

### Form Inputs

**Text Input:**
```css
.input {
  border: 2px solid var(--color-border);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input:hover {
  border-color: var(--color-border-hover);
}

.input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-focus);
}

.input:disabled {
  background: var(--color-muted);
  cursor: not-allowed;
}
```

**Checkbox/Radio:**
- Visual checkmark/circle fill
- Focus: Ring around entire control
- Disabled: Grayed with label

### Cards

```css
.card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.15);
}

.card:active {
  transform: translateY(-2px);
}
```

### Links

```css
.link {
  color: var(--color-primary);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s;
}

.link:hover {
  border-bottom-color: currentColor;
}

.link:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.link:visited {
  color: var(--color-visited);
}
```

## Loading States

### Button Loading
```css
.btn-loading {
  position: relative;
  color: transparent;
}

.btn-loading::after {
  content: '';
  position: absolute;
  width: 1rem;
  height: 1rem;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

### Skeleton Loading
```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-muted) 25%,
    var(--color-muted-light) 50%,
    var(--color-muted) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

## State Accessibility

### Focus Management
```javascript
// Trap focus in modal
function trapFocus(element) {
  const focusable = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  
  element.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
}
```

### ARIA States
```html
<!-- Toggle button -->
<button aria-pressed="false" id="toggle">
  Dark Mode
</button>

<script>
  toggle.addEventListener('click', () => {
    const pressed = toggle.getAttribute('aria-pressed') === 'true';
    toggle.setAttribute('aria-pressed', !pressed);
  });
</script>

<!-- Expandable section -->
<button aria-expanded="false" aria-controls="content">
  Show More
</button>
<div id="content" hidden>
  Hidden content
</div>
```

## State Checklist

### Implementation
- [ ] Default state designed
- [ ] Hover state implemented
- [ ] Active/pressed state implemented
- [ ] Focus state visible (3px outline minimum)
- [ ] Disabled state styled
- [ ] Loading state (if applicable)

### Testing
- [ ] Test with mouse
- [ ] Test with keyboard (Tab, Enter, Space)
- [ ] Test on touch devices
- [ ] Test with screen reader
- [ ] Verify focus indicator visibility

### Accessibility
- [ ] Focus order logical
- [ ] No focus traps (except modals)
- [ ] Disabled elements clearly marked
- [ ] Loading states announced to screen readers
