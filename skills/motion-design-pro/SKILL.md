---
name: motion-design-pro
description: |
  Expert in animation, micro-interactions, and choreographed motion.
  GSAP, Framer Motion, CSS animations with performance optimization.
  Creates delightful, purposeful animations that enhance UX.

  Use when adding motion to interfaces, creating page transitions,
  scroll animations, or complex choreographed sequences.
metadata:
  short-description: UI animation — GSAP, Framer Motion, CSS keyframes, scroll triggers, performance
  content-language: en
  domain: ui-animation
  level: professional
---

# Motion Design (professional)

## Boundary

**`motion-design-pro`** owns **animation implementation** — GSAP timelines, Framer Motion variants, CSS keyframes, ScrollTrigger, micro-interactions, and 60fps performance patterns. **`frontend-design-pro`** owns the broader visual aesthetic and decides when motion is warranted as part of design direction. **`platform-design-pro`** owns platform-specific gesture and haptic feedback on iOS/Android. Reduced-motion accessibility is a shared concern with any skill that produces interactive UI.

## When to use

- Page load animations
- Scroll-triggered animations
- Micro-interactions (hover, click states)
- Page transitions
- Complex choreographed sequences
- Loading states and skeletons
- Gesture-based interactions

## When not to use

- Users prefer reduced motion
- Performance-critical paths
- Simple UI without animation needs
- Accessibility-first interfaces (without fallbacks)

## Required inputs

- **animation_type**: Page load, scroll, interaction, gesture
- **technology**: GSAP, Framer Motion, CSS
- **performance**: 60fps target, reduced-motion support
- **user_experience**: Purpose, timing, easing

## Expected output

- **animation_code**: GSAP/Framer/CSS implementation
- **timing_spec**: Durations, delays, easings
- **performance_notes**: Optimization strategies
- **fallback_strategy**: Reduced motion support


## Workflow

Apply **Karpathy principles** throughout.

1. **Confirm** animation purpose → verify: [type, technology, performance needs].
2. **State assumptions** about user device capabilities, motion preferences.
3. **Apply** minimum animation first; complex choreography only when justified.
4. **Make surgical changes** — only touch animation properties, not layout.
5. **Define success criteria** (60fps, purposeful, accessible); verify.
6. **Respond** with animation code, timing spec, performance notes.

## Operating principles

1. **Think Before Coding** — State assumptions: device capability, motion preference, purpose.
2. **Simplicity First** — Start with CSS; escalate to GSAP/Framer only when needed.
3. **Surgical Changes** — Animate only transform/opacity, never layout properties.
4. **Goal-Driven Execution** — Verify 60fps, purposeful, accessible with reduced-motion.

### Motion Philosophy

**Purposeful, not decorative:**
- Guide attention
- Provide feedback
- Show relationships
- Delight (sparingly)

**Performance Rules:**
- Animate: `transform`, `opacity`
- Avoid: `width`, `height`, `top`, `left`, `margin`, `padding`
- Use: `will-change` sparingly
- Respect: `prefers-reduced-motion`

**Timing Guidelines:**
| Type | Duration | Use Case |
|------|----------|----------|
| Micro | 150ms | Button states, toggles |
| Standard | 300ms | Card hover, modals |
| Complex | 500ms | Page transitions |
| Ambient | 2-10s | Background, gradients |

### Technology Selection

**CSS Animations:**
- Simple hover states
- Infinite loops
- Best performance
- Native reduced-motion support

**Framer Motion:**
- React projects
- Gesture handling
- Layout animations
- AnimatePresence for mount/unmount

**GSAP:**
- Complex timelines
- ScrollTrigger
- Morphing, drawing
- Precise control

## Suggested response format

```markdown
## Animation: [Name]

### Purpose
[What this animation achieves]

### Technology
[CSS / Framer Motion / GSAP]

### Implementation
```tsx
// Code here
```

### Timing
- Duration: [X]ms
- Easing: [easing function]
- Delay: [X]ms (if staggered)

### Performance
- Properties animated: [transform/opacity]
- will-change: [applied/removed after]

### Accessibility
- Reduced motion fallback: [description]
- prefers-reduced-motion: [implementation]
```

## Quick examples

### Example 1: Page Load Stagger (Framer Motion)

```tsx
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1] // ease-out
    }
  }
}

export function Hero() {
  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <motion.h1 variants={item}>Headline</motion.h1>
      <motion.p variants={item}>Subtitle</motion.p>
      <motion.button variants={item}>CTA</motion.button>
    </motion.div>
  )
}
```

### Example 2: Scroll Trigger (GSAP)

```tsx
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function Feature() {
  const ref = useRef(null)
  
  useEffect(() => {
    const el = ref.current
    
    gsap.fromTo(el, 
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
          toggleActions: "play none none reverse"
        }
      }
    )
    
    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill())
    }
  }, [])
  
  return <div ref={ref}>Content</div>
}
```

### Example 3: Micro-interaction (CSS)

```css
.btn-magnetic {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.btn-magnetic:hover {
  transform: scale(1.05);
}

.btn-magnetic:active {
  transform: scale(0.95);
}

/* Magnetic effect with JS */
const handleMouseMove = (e) => {
  const btn = e.currentTarget
  const rect = btn.getBoundingClientRect()
  const x = e.clientX - rect.left - rect.width / 2
  const y = e.clientY - rect.top - rect.height / 2
  
  btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`
}
```

## References

- `/skills/motion-design-pro/references/gsap-patterns.md` — Timelines, ScrollTrigger
- `/skills/motion-design-pro/references/framer-patterns.md` — Gestures, AnimatePresence
- `/skills/motion-design-pro/references/css-animations.md` — Keyframes, performance
- `/skills/motion-design-pro/references/easing-guide.md` — Cubic-bezier values
- `/skills/motion-design-pro/references/performance.md` — 60fps optimization

## Checklist

### Before implementing
- [ ] Animation purpose defined
- [ ] Technology chosen (CSS/Framer/GSAP)
- [ ] Device capability assumptions stated
- [ ] Reduced motion strategy planned

### Implementation
- [ ] **Karpathy Principles Verification:**
  - [ ] Assumptions stated (device, purpose, timing)
  - [ ] Minimum animation applied (complex only when justified)
  - [ ] Surgical changes (transform/opacity only)
  - [ ] Success criteria (60fps, purposeful, accessible)
- [ ] Only animate transform/opacity
- [ ] will-change applied and removed
- [ ] Duration 150-600ms appropriate
- [ ] Easing function chosen purposefully

### Accessibility
- [ ] prefers-reduced-motion media query
- [ ] Content accessible without animation
- [ ] No seizure-inducing flashes

### Performance
- [ ] 60fps target met
- [ ] No layout thrashing
- [ ] GPU-accelerated properties only
- [ ] Cleanup on unmount (remove listeners, kill tweens)
