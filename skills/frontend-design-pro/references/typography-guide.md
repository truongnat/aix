# Typography Guide - Curated Font Pairings

## Display + Body Combinations

### Elegant / Editorial
| Display | Body | Use Case |
|---------|------|----------|
| Playfair Display | Source Sans 3 | Luxury, fashion, editorial |
| Cormorant Garamond | Nunito | Literary, academic |
| Libre Baskerville | Inter* | *Only acceptable body exception |
| Spectral | Work Sans | Modern editorial |

### Bold / Impactful
| Display | Body | Use Case |
|---------|------|----------|
| Bebas Neue | PT Sans | Bold headlines, posters |
| Oswald | Open Sans | Corporate with edge |
| Montserrat (bold weights) | Roboto Slab | Tech, startup |
| Archivo Black | IBM Plex Sans | Brutalist, maximalist |

### Playful / Friendly
| Display | Body | Use Case |
|---------|------|----------|
| Fredoka One | Nunito | Children's products |
| Comfortaa | Lato | Wellness, lifestyle |
| Righteous | Rubik | Gaming, entertainment |
| Space Grotesk* | *Avoid - overused by AI |

### Technical / Modern
| Display | Body | Use Case |
|---------|------|----------|
| JetBrains Mono | Plus Jakarta Sans | Developer tools |
| Fira Code | Inter* | Code-focused products |
| DM Mono | DM Sans | Minimal tech |
| SF Mono* | System* | *Avoid - too generic |

## Variable Fonts (Recommended)

```css
/* Single file, multiple weights/widths */
@font-face {
  font-family: 'Inter Variable';
  src: url('Inter-Variable.woff2') format('woff2-variations');
  font-weight: 100 900;
  font-display: swap;
}

/* Usage */
.headline { font-weight: 800; }
.body { font-weight: 400; }
```

## Google Fonts Loading

```html
<!-- Optimal: Preconnect + async load -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Source+Sans+3:wght@400;600&display=swap" rel="stylesheet">
```

## Typography Scale

```css
/* Major Third (1.25) - Safe for web */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
--text-5xl: 3rem;      /* 48px */
--text-6xl: 3.75rem;   /* 60px */

/* Golden Ratio (1.618) - More dramatic */
--text-display: 6.854rem; /* 110px - for hero */
```

## Anti-Slop Checklist

- [ ] Not using Inter, Roboto, or Arial as display
- [ ] Not using Space Grotesk (currently overused)
- [ ] Display font has personality/character
- [ ] Body font is readable at 16px
- [ ] Contrast ratio 4.5:1 minimum
- [ ] Font loading optimized (swap)
