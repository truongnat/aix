# Motion Patterns - Orchestrated Animations

## Page Load Choreography

### Staggered Reveal (CSS)
```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-element {
  animation: fadeInUp 0.6s ease-out backwards;
}

.hero-element:nth-child(1) { animation-delay: 0ms; }
.hero-element:nth-child(2) { animation-delay: 100ms; }
.hero-element:nth-child(3) { animation-delay: 200ms; }
.hero-element:nth-child(4) { animation-delay: 300ms; }
```

### Staggered Reveal (Framer Motion)
```tsx
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

<motion.div variants={container} initial="hidden" animate="show">
  {items.map(i => <motion.div key={i} variants={item} />)}
</motion.div>
```

## Hover & Interaction

### Magnetic Button (CSS)
```css
.btn-magnetic {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.btn-magnetic:hover {
  transform: scale(1.05);
}
.btn-magnetic:active {
  transform: scale(0.98);
}
```

### Card Lift
```css
.card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.15);
}
```

### Text Reveal on Hover
```css
.link-reveal {
  position: relative;
}
.link-reveal::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: currentColor;
  transition: width 0.3s ease;
}
.link-reveal:hover::after {
  width: 100%;
}
```

## Scroll-Triggered

### Intersection Observer (Vanilla JS)
```javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
```

```css
.reveal {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.reveal.is-visible {
  opacity: 1;
  transform: translateY(0);
}
```

### Parallax (CSS-only)
```css
.parallax-container {
  perspective: 1px;
  height: 100vh;
  overflow-x: hidden;
  overflow-y: auto;
}
.parallax-layer {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}
.parallax-back {
  transform: translateZ(-1px) scale(2);
}
.parallax-front {
  transform: translateZ(0);
}
```

## Micro-interactions

### Loading States
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
.loading {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
.spinner {
  animation: spin 1s linear infinite;
}
```

### Success Checkmark
```css
@keyframes checkmark {
  0% { stroke-dashoffset: 24; }
  100% { stroke-dashoffset: 0; }
}
.checkmark path {
  stroke-dasharray: 24;
  stroke-dashoffset: 24;
  animation: checkmark 0.4s ease forwards;
  animation-delay: 0.2s;
}
```

## Timing Functions

```css
/* Easing presets */
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
--ease-smooth: cubic-bezier(0.25, 0.1, 0.25, 1);
```

## Duration Guidelines

| Type | Duration | Use Case |
|------|----------|----------|
| Micro | 150ms | Button states, toggles |
| Standard | 300ms | Card hover, modals |
| Complex | 500-600ms | Page transitions |
| Ambient | 2-10s | Background gradients |

## Performance Rules

- ✅ **Animate only:** `transform`, `opacity`
- ❌ **Avoid:** `width`, `height`, `top`, `left` (triggers layout)
- ✅ **Use:** `will-change` sparingly, remove after animation
- ✅ **Prefers-reduced-motion:** Always respect user preference

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Libraries

- **Framer Motion** - React gestures + animations
- **GSAP** - Complex timelines, ScrollTrigger
- **Lottie** - After Effects → JSON animations
- **CSS Animations** - Simple effects, best performance
