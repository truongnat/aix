# Color Palettes - Distinctive Combinations

## Deep & Warm

### Burgundy Luxe
```css
--color-bg: #fafaf9;        /* Warm white */
--color-text: #1c1917;      /* Stone 900 */
--color-primary: #7c2d12;     /* Deep burgundy */
--color-accent: #f59e0b;      /* Amber gold */
--color-muted: #78716c;       /* Stone 500 */
```
**Use:** Luxury brands, wine, artisanal products

### Forest Academy
```css
--color-bg: #f0fdf4;        /* Mint cream */
--color-text: #14532d;        /* Dark green */
--color-primary: #15803d;     /* Forest green */
--color-accent: #ea580c;      /* Burnt orange */
--color-muted: #65a30d;       /* Lime */
```
**Use:** Education, sustainability, outdoors

## Bold & Modern

### Electric Coral
```css
--color-bg: #fafafa;        /* Neutral white */
--color-text: #0a0a0a;      /* Near black */
--color-primary: #f97316;     /* Bright orange */
--color-accent: #ec4899;      /* Hot pink */
--color-muted: #737373;       /* Neutral 500 */
```
**Use:** Tech startups, creative agencies, Gen Z brands

### Midnight Navy
```css
--color-bg: #0f172a;        /* Slate 900 */
--color-text: #f8fafc;        /* Slate 50 */
--color-primary: #38bdf8;     /* Sky blue */
--color-accent: #a855f7;      /* Purple */
--color-muted: #64748b;       /* Slate 500 */
```
**Use:** SaaS, developer tools, futuristic

## Soft & Approachable

### Peach Sorbet
```css
--color-bg: #fff7ed;        /* Orange 50 */
--color-text: #431407;        /* Orange 950 */
--color-primary: #f97316;     /* Orange 500 */
--color-accent: #fbbf24;      /* Amber 400 */
--color-muted: #fdba74;       /* Orange 300 */
```
**Use:** Wellness, food, lifestyle

### Lavender Mist
```css
--color-bg: #faf5ff;        /* Purple 50 */
--color-text: #3b0764;        /* Purple 950 */
--color-primary: #9333ea;     /* Purple 600 */
--color-accent: #06b6d4;      /* Cyan 500 */
--color-muted: #c084fc;       /* Purple 300 */
```
**Use:** Beauty, spirituality, creative tools

## Dark Mode Excellence

### Obsidian Pro
```css
--color-bg: #09090b;        /* Zinc 950 */
--color-text: #fafafa;        /* Zinc 50 */
--color-primary: #22d3ee;     /* Cyan 400 */
--color-accent: #f472b6;      /* Pink 400 */
--color-muted: #52525b;       /* Zinc 600 */
--color-elevated: #18181b;    /* Zinc 900 - cards */
```

### Dark Forest
```css
--color-bg: #022c22;        /* Emerald 950 */
--color-text: #ecfdf5;        /* Emerald 50 */
--color-primary: #34d399;     /* Emerald 400 */
--color-accent: #fbbf24;      /* Amber 400 */
--color-muted: #059669;       /* Emerald 600 */
--color-elevated: #064e3b;    /* Emerald 900 */
```

## Gradient Patterns

### Mesh Gradient (CSS)
```css
background: 
  radial-gradient(at 40% 20%, hsla(28,100%,74%,1) 0, transparent 50%),
  radial-gradient(at 80% 0%, hsla(189,100%,56%,1) 0, transparent 50%),
  radial-gradient(at 0% 50%, hsla(340,100%,76%,1) 0, transparent 50%),
  radial-gradient(at 80% 50%, hsla(340,100%,76%,1) 0, transparent 50%),
  radial-gradient(at 0% 100%, hsla(22,100%,77%,1) 0, transparent 50%),
  radial-gradient(at 80% 100%, hsla(242,100%,70%,1) 0, transparent 50%),
  radial-gradient(at 0% 0%, hsla(343,100%,76%,1) 0, transparent 50%);
```

### Noise Texture Overlay
```css
.texture {
  position: relative;
}
.texture::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  opacity: 0.03;
  pointer-events: none;
}
```

## Accessibility Guidelines

- **Contrast ratio:** 4.5:1 minimum for normal text, 3:1 for large text
- **Color alone:** Never use color as the only indicator
- **Dark mode:** Test all palettes in both modes
- **Color blindness:** Use patterns/textures, not just hue

## Tools

- [Adobe Color](https://color.adobe.com) - Color wheel + harmony rules
- [Coolors](https://coolors.co) - Palette generator
- [Color Hunt](https://colorhunt.co) - Trending palettes
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) - Accessibility
