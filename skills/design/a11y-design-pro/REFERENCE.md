# Accessibility Design Reference

## Advanced Accessibility Techniques

This reference provides advanced techniques and real-world examples for implementing accessible and inclusive design.

## Table of Contents

1. [WCAG 2.2 Deep Dive](#wcag-22-deep-dive)
2. [Screen Reader Testing](#screen-reader-testing)
3. [Advanced ARIA Patterns](#advanced-aria-patterns)
4. [Accessibility Automation](#accessibility-automation)
5. [Real-World Examples](#real-world-examples)

## WCAG 2.2 Deep Dive

### New Success Criteria in WCAG 2.2

#### 2.4.11 Focus Not Obscured (Level AA)
- **Requirement**: When a component receives focus, it must not be hidden by other content
- **Implementation**: Use z-index and positioning to ensure focus visibility

```css
/* Ensure focused elements are visible above other content */
:focus-visible {
  z-index: 100;
  outline: 3px solid #005fcc;
  outline-offset: 2px;
}

/* Skip to content link */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #000;
  color: #fff;
  padding: 8px;
  z-index: 100;
  transition: top 0.3s;
}

.skip-link:focus {
  top: 0;
}
```

#### 2.4.12 Focus Appearance (Level AAA)
- **Requirement**: Focus indicator must be visible and have contrast ratio of at least 3:1
- **Implementation**: Ensure focus indicators meet contrast requirements

```css
/* High-contrast focus indicator */
:focus-visible {
  outline: 3px solid #005fcc;
  outline-offset: 2px;
  background-color: rgba(0, 95, 204, 0.1);
}

/* Ensure focus indicator has sufficient contrast */
```

#### 2.4.13 Focus Appearance (Level AA)
- **Requirement**: Focus indicator must be at least 2px thick
- **Implementation**: Ensure minimum focus indicator size

```css
:focus-visible {
  outline: 2px solid #005fcc;
  outline-offset: 2px;
}
```

#### 2.5.8 Dragging Movements (Level A)
- **Requirement**: Provide alternatives to dragging movements
- **Implementation**: Add keyboard alternatives for drag-and-drop

```javascript
// Keyboard alternative for drag-and-drop
function setupKeyboardDragAndDrop(element) {
  let isDragging = false;
  let position = { x: 0, y: 0 };

  element.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      isDragging = !isDragging;
      element.setAttribute('aria-pressed', isDragging);
      
      if (isDragging) {
        element.setAttribute('aria-grabbed', 'true');
      } else {
        element.setAttribute('aria-grabbed', 'false');
      }
    }
    
    if (isDragging) {
      switch (e.key) {
        case 'ArrowUp':
          position.y -= 10;
          break;
        case 'ArrowDown':
          position.y += 10;
          break;
        case 'ArrowLeft':
          position.x -= 10;
          break;
        case 'ArrowRight':
          position.x += 10;
          break;
        case 'Escape':
          isDragging = false;
          element.setAttribute('aria-grabbed', 'false');
          break;
      }
      
      element.style.transform = `translate(${position.x}px, ${position.y}px)`;
      e.preventDefault();
    }
  });
}
```

#### 2.5.9 Target Size (Level AAA)
- **Requirement**: Touch targets must be at least 44x44 pixels
- **Implementation**: Ensure minimum touch target size

```css
/* Minimum touch target size */
button, a, input, select, textarea {
  min-width: 44px;
  min-height: 44px;
  padding: 12px;
}

/* For small icons, increase touch area */
.icon-button {
  position: relative;
}

.icon-button::before {
  content: '';
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
}
```

## Screen Reader Testing

### NVDA (Windows)

#### Testing Checklist
```markdown
- [ ] Navigation works with Tab key
- [ ] All interactive elements are announced
- [ ] Form labels are announced correctly
- [ ] Error messages are announced
- [ ] Dynamic content updates are announced
- [ ] Skip links work correctly
- [ ] Landmarks are announced
- [ ] Tables are navigable correctly
```

#### NVDA Commands
```
Tab/Shift+Tab: Navigate through elements
H: Jump to heading
1-6: Jump to heading level
B: Jump to button
L: Jump to list
I: Jump to list item
D: Jump to landmark
R: Next region
NVDA+F1: Announce current element
NVDA+F7: Element properties
NVDA+F8: Object navigation
```

### VoiceOver (macOS/iOS)

#### Testing Checklist
```markdown
- [ ] Navigation works with VoiceOver gestures
- [ ] All interactive elements are announced
- [ ] Form labels are announced correctly
- [ ] Error messages are announced
- [ ] Dynamic content updates are announced
- [ ] Skip links work correctly
- [ ] Landmarks are announced
- [ ] Tables are navigable correctly
```

#### VoiceOver Commands
```
Swipe right: Next element
Swipe left: Previous element
Double-tap: Activate element
Two-finger tap: Stop speech
Three-finger swipe up: Read from top
Three-finger swipe down: Read from current position
Three-finger swipe left: Previous page
Three-finger swipe right: Next page
Rotor: Change navigation mode (Cmd+U)
```

### JAWS (Windows)

#### Testing Checklist
```markdown
- [ ] Navigation works with Tab key
- [ ] All interactive elements are announced
- [ ] Form labels are announced correctly
- [ ] Error messages are announced
- [ ] Dynamic content updates are announced
- [ ] Skip links work correctly
- [ ] Landmarks are announced
- [ ] Tables are navigable correctly
```

#### JAWS Commands
```
Tab/Shift+Tab: Navigate through elements
H: Jump to heading
1-6: Jump to heading level
B: Jump to button
L: Jump to list
I: Jump to list item
R: Next region
Insert+F1: Announce current element
Insert+F2: Quick settings
Insert+F7: Element properties
```

## Advanced ARIA Patterns

### Tabbed Interface
```html
<div role="tablist" aria-label="Product tabs">
  <button role="tab" aria-selected="true" aria-controls="panel-1" id="tab-1">
    Description
  </button>
  <button role="tab" aria-selected="false" aria-controls="panel-2" id="tab-2">
    Reviews
  </button>
  <button role="tab" aria-selected="false" aria-controls="panel-3" id="tab-3">
    Specifications
  </button>
</div>

<div role="tabpanel" id="panel-1" aria-labelledby="tab-1">
  <!-- Panel 1 content -->
</div>

<div role="tabpanel" id="panel-2" aria-labelledby="tab-2" hidden>
  <!-- Panel 2 content -->
</div>

<div role="tabpanel" id="panel-3" aria-labelledby="tab-3" hidden>
  <!-- Panel 3 content -->
</div>
```

```javascript
function setupTabInterface() {
  const tabs = document.querySelectorAll('[role="tab"]');
  const panels = document.querySelectorAll('[role="tabpanel"]');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Deselect all tabs
      tabs.forEach(t => {
        t.setAttribute('aria-selected', 'false');
      });
      
      // Hide all panels
      panels.forEach(p => {
        p.hidden = true;
      });
      
      // Select clicked tab
      tab.setAttribute('aria-selected', 'true');
      
      // Show corresponding panel
      const panelId = tab.getAttribute('aria-controls');
      const panel = document.getElementById(panelId);
      panel.hidden = false;
    });
    
    // Keyboard navigation
    tab.addEventListener('keydown', (e) => {
      const tabsArray = Array.from(tabs);
      const currentIndex = tabsArray.indexOf(tab);
      
      let newIndex;
      switch (e.key) {
        case 'ArrowRight':
          newIndex = (currentIndex + 1) % tabsArray.length;
          break;
        case 'ArrowLeft':
          newIndex = (currentIndex - 1 + tabsArray.length) % tabsArray.length;
          break;
        case 'Home':
          newIndex = 0;
          break;
        case 'End':
          newIndex = tabsArray.length - 1;
          break;
        default:
          return;
      }
      
      tabsArray[newIndex].focus();
      e.preventDefault();
    });
  });
}
```

### Accordion
```html
<div class="accordion">
  <h3>
    <button aria-expanded="false" aria-controls="section-1">
      Section 1
    </button>
  </h3>
  <div id="section-1" hidden>
    <!-- Section 1 content -->
  </div>
  
  <h3>
    <button aria-expanded="false" aria-controls="section-2">
      Section 2
    </button>
  </h3>
  <div id="section-2" hidden>
    <!-- Section 2 content -->
  </div>
</div>
```

```javascript
function setupAccordion() {
  const buttons = document.querySelectorAll('.accordion button');
  
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const isExpanded = button.getAttribute('aria-expanded') === 'true';
      const panelId = button.getAttribute('aria-controls');
      const panel = document.getElementById(panelId);
      
      button.setAttribute('aria-expanded', !isExpanded);
      panel.hidden = isExpanded;
    });
    
    // Keyboard navigation
    button.addEventListener('keydown', (e) => {
      const buttonsArray = Array.from(buttons);
      const currentIndex = buttonsArray.indexOf(button);
      
      let newIndex;
      switch (e.key) {
        case 'ArrowDown':
          newIndex = (currentIndex + 1) % buttonsArray.length;
          break;
        case 'ArrowUp':
          newIndex = (currentIndex - 1 + buttonsArray.length) % buttonsArray.length;
          break;
        case 'Home':
          newIndex = 0;
          break;
        case 'End':
          newIndex = buttonsArray.length - 1;
          break;
        default:
          return;
      }
      
      buttonsArray[newIndex].focus();
      e.preventDefault();
    });
  });
}
```

### Modal Dialog
```html
<button id="open-modal">Open Modal</button>

<div id="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" hidden>
  <h2 id="modal-title">Modal Title</h2>
  <p>Modal content goes here.</p>
  <button id="close-modal">Close</button>
</div>
```

```javascript
function setupModal() {
  const modal = document.getElementById('modal');
  const openButton = document.getElementById('open-modal');
  const closeButton = document.getElementById('close-modal');
  const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];
  const previousFocus = document.activeElement;
  
  function openModal() {
    modal.hidden = false;
    firstFocusable.focus();
    
    // Trap focus
    modal.addEventListener('keydown', trapFocus);
  }
  
  function closeModal() {
    modal.hidden = true;
    previousFocus.focus();
    modal.removeEventListener('keydown', trapFocus);
  }
  
  function trapFocus(e) {
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
      } else if (!e.shiftKey && document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
      }
    }
    
    if (e.key === 'Escape') {
      closeModal();
    }
  }
  
  openButton.addEventListener('click', openModal);
  closeButton.addEventListener('click', closeModal);
}
```

## Accessibility Automation

### Automated Testing with axe-core

```javascript
import { AxeBuilder } from '@axe-core/react';
import { render } from '@testing-library/react';

describe('Accessibility', () => {
  it('should not have accessibility violations', async () => {
    const { container } = render(<YourComponent />);
    
    const results = await new AxeBuilder({ container }).analyze();
    
    expect(results.violations).toHaveLength(0);
  });
});
```

### CI/CD Integration

```yaml
# GitHub Actions
name: Accessibility Tests
on: [push, pull_request]

jobs:
  accessibility:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run build
      - run: npm run test:a11y
      - uses: dequelabs/axe-core-action@v3
        with:
          url: https://your-site.com
```

### Lighthouse CI

```javascript
// lighthouse.config.js
module.exports = {
  extends: 'lighthouse:default',
  settings: {
    onlyCategories: ['accessibility'],
    budgets: [
      {
        path: '/*.js',
        maxSize: 100 * 1024
      }
    ]
  }
};
```

```bash
# Run Lighthouse CI
lhci autorun --collect.url="http://localhost:3000" --assert.preset="lighthouse:recommended"
```

## Real-World Examples

### Case Study: BBC Accessibility

```javascript
// BBC's approach to accessibility
class BBCAccessibility {
  constructor() {
    this.skipLinks = this.createSkipLinks();
    this.liveRegions = this.setupLiveRegions();
    this.focusManagement = this.setupFocusManagement();
  }
  
  createSkipLinks() {
    // Create skip links for main content areas
    const skipLinks = [
      { target: 'main-content', text: 'Skip to main content' },
      { target: 'navigation', text: 'Skip to navigation' },
      { target: 'search', text: 'Skip to search' }
    ];
    
    return skipLinks.map(link => {
      const element = document.createElement('a');
      element.href = `#${link.target}`;
      element.textContent = link.text;
      element.className = 'skip-link';
      document.body.insertBefore(element, document.body.firstChild);
      return element;
    });
  }
  
  setupLiveRegions() {
    // Set up live regions for dynamic content
    const regions = {
      'notifications': 'polite',
      'alerts': 'assertive',
      'status': 'polite'
    };
    
    Object.entries(regions).forEach(([id, politeness]) => {
      const region = document.getElementById(id);
      if (region) {
        region.setAttribute('aria-live', politeness);
      }
    });
  }
  
  setupFocusManagement() {
    // Manage focus for dynamic content
    let previousFocus = null;
    
    return {
      saveFocus: () => {
        previousFocus = document.activeElement;
      },
      restoreFocus: () => {
        if (previousFocus) {
          previousFocus.focus();
        }
      }
    };
  }
}
```

### Case Study: Government Digital Service

```javascript
// GDS accessibility patterns
class GDSAccessibility {
  static createAccessibleForm(formId) {
    const form = document.getElementById(formId);
    
    // Add proper labels
    form.querySelectorAll('input, select, textarea').forEach(input => {
      const label = document.createElement('label');
      label.htmlFor = input.id;
      label.textContent = input.getAttribute('aria-label') || input.placeholder;
      input.parentNode.insertBefore(label, input);
    });
    
    // Add error messages
    form.querySelectorAll('input[required]').forEach(input => {
      const error = document.createElement('span');
      error.id = `${input.id}-error`;
      error.className = 'error-message';
      error.setAttribute('role', 'alert');
      error.setAttribute('aria-live', 'polite');
      input.setAttribute('aria-describedby', error.id);
      input.parentNode.appendChild(error);
    });
    
    return form;
  }
  
  static createAccessibleTable(tableId) {
    const table = document.getElementById(tableId);
    
    // Add caption
    const caption = document.createElement('caption');
    caption.textContent = table.getAttribute('aria-label') || 'Table';
    table.insertBefore(caption, table.firstChild);
    
    // Add scope to headers
    table.querySelectorAll('th').forEach(th => {
      th.setAttribute('scope', 'col');
    });
    
    return table;
  }
}
```

## Resources

### Documentation
- [WCAG 2.2 Guidelines](https://www.w3.org/WAI/WCAG22/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Accessibility Guidelines](https://webaim.org/guidelines/)

### Tools
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE Browser Extension](https://wave.webaim.org/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Pa11y](https://github.com/pa11y/pa11y)

### Screen Readers
- [NVDA](https://www.nvaccess.org/)
- [JAWS](https://www.freedomscientific.com/products/software/jaws/)
- [VoiceOver](https://www.apple.com/accessibility/voiceover/)

### Communities
- [WebAIM Forum](https://webaim.org/forum/)
- [A11y Project](https://www.a11yproject.com/)
- [Accessibility Slack](https://a11y.slack.com/)
