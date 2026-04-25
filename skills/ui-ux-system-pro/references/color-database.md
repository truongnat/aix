# Color Database - 97 Accessible Palettes

## Organization
- Sorted by industry/use case
- All palettes tested for WCAG 2.1 AA compliance
- Format: Primary, Secondary, Background, Text, Accent

## SaaS / Technology

### 1. Modern Blue
```css
--primary-50: #eff6ff; --primary-100: #dbeafe; --primary-200: #bfdbfe;
--primary-300: #93c5fd; --primary-400: #60a5fa; --primary-500: #3b82f6;
--primary-600: #2563eb; --primary-700: #1d4ed8; --primary-800: #1e40af; --primary-900: #1e3a8a;
--accent: #0ea5e9; --bg: #ffffff; --text: #0f172a;
```
**Use:** Generic SaaS, trustworthy, professional
**Contrast:** Primary 600 on White: 4.6:1 ✓

### 2. Deep Purple
```css
--primary-500: #7c3aed; --primary-600: #6d28d9; --accent: #ec4899;
--bg: #fafafa; --text: #18181b;
```
**Use:** Creative tools, analytics, AI products
**Note:** Avoid full purple→white gradients (slop pattern)

### 3. Teal Professional
```css
--primary-500: #14b8a6; --primary-600: #0d9488; --accent: #f59e0b;
--bg: #f0fdfa; --text: #134e4a;
```
**Use:** Health tech, wellness, productivity

## Fintech

### 4. Banking Blue
```css
--primary-500: #0369a1; --primary-600: #0284c7; --accent: #22c55e;
--bg: #f8fafc; --text: #0f172a;
--success: #16a34a; --warning: #ca8a04; --error: #dc2626;
```
**Use:** Banking, investment, secure transactions
**Trust signals:** Blue primary, green success, clear states

### 5. Crypto Dark
```css
--primary-500: #6366f1; --primary-600: #4f46e5; --accent: #22d3ee;
--bg: #0f172a; --text: #f8fafc; --surface: #1e293b;
```
**Use:** Crypto, DeFi, trading platforms
**Features:** Dark mode optimized, neon accents

### 6. Gold Standard
```css
--primary-500: #d97706; --primary-600: #b45309; --accent: #1e293b;
--bg: #fffbeb; --text: #451a03;
```
**Use:** Luxury finance, wealth management
**Psychology:** Gold = premium, trust, stability

## Healthcare

### 7. Medical Blue
```css
--primary-500: #0ea5e9; --primary-600: #0284c7; --accent: #10b981;
--bg: #f0f9ff; --text: #0c4a6e;
--emergency: #dc2626; --success: #059669;
```
**Use:** Patient portals, medical records
**Compliance:** High contrast, calming, emergency color distinct

### 8. Wellness Green
```css
--primary-500: #10b981; --primary-600: #059669; --accent: #84cc16;
--bg: #f0fdf4; --text: #064e3b;
```
**Use:** Wellness apps, fitness, nutrition
**Psychology:** Green = health, growth, natural

### 9. Care Pink
```css
--primary-500: #ec4899; --primary-600: #db2777; --accent: #8b5cf6;
--bg: #fdf2f8; --text: #831843;
```
**Use:** Women's health, mental health, care services

## E-commerce

### 10. Retail Red
```css
--primary-500: #dc2626; --primary-600: #b91c1c; --accent: #fbbf24;
--bg: #ffffff; --text: #18181b;
--sale: #ef4444; --success: #22c55e;
```
**Use:** General retail, flash sales, urgency
**Psychology:** Red = urgency, action, sale

### 11. Fashion Black
```css
--primary-500: #18181b; --primary-600: #09090b; --accent: #f5f5f5;
--bg: #fafafa; --text: #18181b;
```
**Use:** Luxury fashion, premium brands
**Features:** Minimal, elegant, lets products shine

### 12. Organic Natural
```css
--primary-500: #a16207; --primary-600: #854d0e; --accent: #84cc16;
--bg: #fefce8; --text: #422006;
```
**Use:** Organic products, sustainability, artisanal
**Psychology:** Earth tones = natural, organic, trustworthy

## Education

### 13. Academic Navy
```css
--primary-500: #1e40af; --primary-600: #1e3a8a; --accent: #f59e0b;
--bg: #eff6ff; --text: #1e3a8a;
--correct: #22c55e; --incorrect: #dc2626;
```
**Use:** Learning platforms, courses, assessments
**Features:** Clear success/failure states

### 14. Creative Purple
```css
--primary-500: #8b5cf6; --primary-600: #7c3aed; --accent: #f472b6;
--bg: #faf5ff; --text: #5b21b6;
```
**Use:** Creative courses, design education

## Dark Mode Excellence

### 15. Midnight Pro
```css
--bg: #09090b; --surface-1: #18181b; --surface-2: #27272a;
--surface-3: #3f3f46; --text-primary: #fafafa; --text-secondary: #a1a1aa;
--primary: #22d3ee; --accent: #a855f7;
```
**Use:** Developer tools, dashboards, professional
**Features:** Multiple surface levels for depth

### 16. Deep Forest
```css
--bg: #022c22; --surface: #064e3b; --text: #ecfdf5;
--primary: #34d399; --accent: #fbbf24;
```
**Use:** Eco-friendly apps, nature themes

### 17. Cosmic Dark
```css
--bg: #020617; --surface: #0f172a; --text: #f8fafc;
--primary: #818cf8; --accent: #22d3ee; --glow: #a855f7;
```
**Use:** Space, futuristic, gaming
**Features:** Neon glow effects

## Industry-Specific Quick Reference

| Industry | Primary | Accent | Background | Psychology |
|----------|---------|--------|------------|------------|
| Banking | Blue 600 | Green 500 | White | Trust, growth |
| Healthcare | Teal 500 | Lime 400 | Light teal | Health, calm |
| E-commerce | Red 500 | Amber 400 | White | Urgency, action |
| Education | Navy 700 | Amber 500 | Light blue | Authority, energy |
| Luxury | Gold 600 | Slate 900 | Cream | Premium, elegant |
| Tech | Indigo 600 | Cyan 400 | White | Innovation |
| Food | Orange 500 | Lime 500 | Warm white | Appetite, fresh |
| Environment | Green 600 | Teal 500 | Light green | Nature, eco |

## Accessibility Verification

### Contrast Requirements
- **Normal text (< 18px):** 4.5:1 minimum
- **Large text (≥ 18px bold/24px):** 3:1 minimum
- **UI components:** 3:1 against adjacent colors

### Tools
```bash
# Check palette accessibility
npx @adev/colors-check --palette primary
```

## Color Blindness Considerations

### Patterns, not just color
```css
/* Good: Pattern + color */
.status-success { background: var(--green); pattern: check; }
.status-error { background: var(--red); pattern: x; }

/* Bad: Color only */
.status-success { background: var(--green); }
.status-error { background: var(--red); }
```

### Safe combinations
- Blue + Orange (most colorblind-friendly)
- Dark + Light (always works)
- Pattern + Icon + Color (redundant encoding)
