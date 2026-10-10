# Anti-Slop Checklist - Design Review

## Typography Review

### ❌ Red Flags
- [ ] Using Inter, Roboto, or Arial for headings
- [ ] Space Grotesk (currently overused by AI)
- [ ] System fonts as display
- [ ] More than 2 font families
- [ ] No font loading strategy (FOIT/FOUT)

### ✅ Pass Criteria
- [ ] Display font has personality/character
- [ ] Body font is highly readable
- [ ] Proper font weights (400, 600, 700)
- [ ] Font loading uses `font-display: swap`
- [ ] Webfont files < 50KB each

## Color Review

### ❌ Red Flags
- [ ] Purple gradient on white background
- [ ] Evenly distributed palette (no dominant)
- [ ] Timid, washed-out colors
- [ ] Relying on color alone for meaning
- [ ] Poor contrast ratios

### ✅ Pass Criteria
- [ ] Dominant color + sharp accent
- [ ] CSS variables for all colors
- [ ] Light + dark mode defined
- [ ] Contrast ratio 4.5:1 minimum
- [ ] Color blindness friendly (patterns/textures)

## Motion Review

### ❌ Red Flags
- [ ] Random scattered micro-interactions
- [ ] No orchestration
- [ ] Too fast (< 150ms) or too slow (> 1000ms)
- [ ] Animating width/height/top/left
- [ ] Ignoring prefers-reduced-motion

### ✅ Pass Criteria
- [ ] Page load has staggered reveals
- [ ] One high-impact moment
- [ ] 150-300ms for interactions
- [ ] Only animate transform/opacity
- [ ] Respects reduced-motion preference

## Layout Review

### ❌ Red Flags
- [ ] Rigid symmetrical grid everywhere
- [ ] No negative space
- [ ] Cards all same height
- [ ] Everything aligned perfectly
- [ ] No grid-breaking elements

### ✅ Pass Criteria
- [ ] Intentional asymmetry
- [ ] Generous negative space
- [ ] Overlapping elements
- [ ] Diagonal flow or broken grid
- [ ] Visual hierarchy through position

## Visual Details Review

### ❌ Red Flags
- [ ] Flat design (no depth)
- [ ] No texture or grain
- [ ] Generic shadows
- [ ] Default browser styling
- [ ] No custom touches

### ✅ Pass Criteria
- [ ] Texture or grain overlays
- [ ] Gradient meshes or subtle patterns
- [ ] Dramatic, layered shadows
- [ ] Custom cursors (optional)
- [ ] Decorative borders or details

## Overall Impression

### ❌ AI Slop Detected If:
- [ ] Looks like a generic template
- [ ] Could be from any AI generator
- [ ] No distinctive personality
- [ ] Safe, boring choices throughout
- [ ] Client says "it looks AI-generated"

### ✅ Distinctive Design If:
- [ ] Memorable at first glance
- [ ] Clear aesthetic direction
- [ ] Bold choices that pay off
- [ ] Appropriate for brand/purpose
- [ ] "This looks custom-designed"

## Quick Reference: Banned Fonts

| Font | Why Banned | Alternative |
|------|------------|-------------|
| Inter | Overused everywhere | Source Sans 3 |
| Roboto | Android default | Open Sans |
| Arial | System font | Helvetica Neue (if licensed) |
| Space Grotesk | Currently AI cliché | Outfit, DM Sans |
| System UI | Boring default | Any distinctive font |

## Quick Reference: Banned Patterns

| Pattern | Why Banned | Alternative |
|---------|------------|-------------|
| Purple→white gradient | AI signature | Any other color combo |
| 3-column equal cards | Template look | Asymmetric grid |
| Perfect center alignment | Lazy composition | Intentional offset |
| Rounded corners everywhere | Generic soft | Mix sharp + rounded |
| Full-width hero + 3 features | Startup template | Custom structure |

## Scoring

| Category | Weight | Score |
|----------|--------|-------|
| Typography | 25% | /100 |
| Color | 25% | /100 |
| Motion | 20% | /100 |
| Layout | 20% | /100 |
| Details | 10% | /100 |
| **Total** | **100%** | **/100** |

**Grade:**
- 90-100: Excellent (no slop detected)
- 70-89: Good (minor issues)
- 50-69: Needs work (some slop)
- <50: Major slop (redesign needed)
