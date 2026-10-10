# Automated Accessibility Testing

## axe-core

### Jest + Testing Library

```bash
npm install --save-dev @axe-core/react jest-axe
```

```javascript
// component.test.jsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

test('Button has no accessibility violations', async () => {
  const { container } = render(<Button>Submit</Button>);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Playwright

```bash
npm install --save-dev @axe-core/playwright
```

```javascript
// a11y.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('Homepage has no critical a11y violations', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  const critical = results.violations.filter(v => v.impact === 'critical');
  expect(critical).toHaveLength(0);
});
```

### Storybook (a11y addon)

```bash
npm install --save-dev @storybook/addon-a11y
```

```javascript
// .storybook/main.js
module.exports = { addons: ['@storybook/addon-a11y'] };

// Story — disable specific rule if intentional
export default {
  parameters: {
    a11y: {
      config: { rules: [{ id: 'color-contrast', enabled: false }] }
    }
  }
};
```

## Lighthouse CI

```bash
npm install --save-dev @lhci/cli
```

```yaml
# lighthouserc.yml
ci:
  collect:
    url: ['http://localhost:3000/', 'http://localhost:3000/about']
  assert:
    preset: lighthouse:recommended
    assertions:
      accessibility: ['error', { minScore: 0.9 }]
  upload:
    target: temporary-public-storage
```

```bash
# Run in CI
lhci autorun
```

## Pa11y (CLI, no code changes needed)

```bash
npm install -g pa11y pa11y-ci
```

```bash
# Single page
pa11y https://example.com --standard WCAG2AA

# Multiple pages via config
pa11y-ci --sitemap https://example.com/sitemap.xml
```

```json
// .pa11yci
{
  "defaults": {
    "standard": "WCAG2AA",
    "timeout": 10000,
    "wait": 500
  },
  "urls": [
    "http://localhost:3000/",
    "http://localhost:3000/about"
  ]
}
```

## GitHub Actions CI gate

```yaml
# .github/workflows/a11y.yml
name: Accessibility
on: [push, pull_request]

jobs:
  a11y:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm run build
      - run: npx serve dist &
      - run: sleep 3
      - run: npx pa11y-ci --config .pa11yci
```

## Rule tags reference

| Tag | Meaning |
|-----|---------|
| `wcag2a` | WCAG 2.x Level A |
| `wcag2aa` | WCAG 2.x Level AA |
| `wcag21aa` | WCAG 2.1 Level AA additions |
| `wcag22aa` | WCAG 2.2 Level AA additions |
| `best-practice` | Non-WCAG best practices |
| `experimental` | Rules in preview |

## What automated tools cannot catch

These always require manual testing:

- Meaningful reading order (logical DOM sequence)
- Focus management quality (where focus goes on interaction)
- Error message clarity (is the message helpful?)
- Screen reader announcement quality
- Cognitive load and comprehension
- Colour meaning (colour-only information)
- Complex table relationships
- PDF and document accessibility
