# CSS Animations Reference

## Keyframe Animation Patterns

```css
/* fadeIn — universal element entrance */
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* slideUp — content reveal from below */
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* slideDown — dropdown/notification entrance */
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-12px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* pulse — draw attention without jarring motion */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
}

/* spin — loading indicators */
@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

/* scaleIn — modal, popover, tooltip entrance */
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.92); }
  to   { opacity: 1; transform: scale(1); }
}

/* shimmer — skeleton loading state */
@keyframes shimmer {
  from { background-position: -200% center; }
  to   { background-position: 200% center; }
}

.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}

/* Usage */
.modal    { animation: scaleIn 0.25s cubic-bezier(0, 0, 0.2, 1) both; }
.spinner  { animation: spin 0.8s linear infinite; }
.hero-text { animation: slideUp 0.5s cubic-bezier(0, 0, 0.2, 1) both; }
```

---

## Transition Timing Function Reference

```css
/* Linear — robotic, avoid for UI. Use only for continuous loops (spin, shimmer) */
transition-timing-function: linear;

/* ease — browser default. OK for simple cases, not precise enough for polish */
transition-timing-function: ease;
/* equivalent: cubic-bezier(0.25, 0.1, 0.25, 1) */

/* ease-out — elements entering the screen. Fast start, gentle landing */
/* Most natural for UI elements appearing */
transition-timing-function: cubic-bezier(0, 0, 0.2, 1);  /* Material: easeOut */
transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1); /* expo-out: dramatic deceleration */

/* ease-in — elements leaving the screen. Slow start, accelerates to exit */
/* Abrupt at the end — users shouldn't notice it because the element is gone */
transition-timing-function: cubic-bezier(0.4, 0, 1, 1);   /* Material: easeIn */
transition-timing-function: cubic-bezier(0.7, 0, 1, 1);   /* aggressive ease-in */

/* ease-in-out — elements that move within the screen (reordering, repositioning) */
transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);  /* Material: standard */
transition-timing-function: cubic-bezier(0.45, 0, 0.55, 1); /* symmetric, smooth */

/* spring-like (CSS-only approximation) */
transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1); /* slight overshoot */
transition-timing-function: cubic-bezier(0.175, 0.885, 0.32, 1.275); /* bounce back */

/* Practical custom easings by use case */
:root {
  --ease-smooth:  cubic-bezier(0.4, 0, 0.2, 1);   /* repositioning, reorder */
  --ease-enter:   cubic-bezier(0, 0, 0.2, 1);      /* elements entering */
  --ease-exit:    cubic-bezier(0.4, 0, 1, 1);      /* elements leaving */
  --ease-spring:  cubic-bezier(0.34, 1.56, 0.64, 1); /* playful bounce */
  --ease-expo:    cubic-bezier(0.16, 1, 0.3, 1);   /* dramatic entrance */
}
```

---

## GPU Acceleration: Rendering Layers

**Triggers layout (most expensive — avoid animating):**
- `width`, `height`, `margin`, `padding`, `border`, `top`, `left`, `right`, `bottom`
- `font-size`, `line-height`, `display`, `position`
- Anything that changes the document flow

**Triggers paint (expensive — animate with caution):**
- `background-color`, `color`, `box-shadow`, `border-radius`
- `outline`, `visibility`, `background-image`

**Triggers composite only (cheap — safe to animate at 60fps):**
- `transform: translate/scale/rotate`
- `opacity`
- `filter: blur/brightness` (usually composited, verify with DevTools)
- `clip-path` (often composited, but can cause repaint on some browsers)

```css
/* Safe: only triggers composite */
.card {
  transition: transform 0.2s var(--ease-enter), opacity 0.2s var(--ease-enter);
}
.card:hover {
  transform: translateY(-4px) scale(1.02);
  opacity: 0.95;
}

/* Risky: triggers layout recalculation on every frame */
.card-bad {
  transition: height 0.3s ease; /* never do this for animation */
}
```

---

## prefers-reduced-motion Pattern

```css
/* Always define animations inside the motion-safe block,
   not the other way around. Reduced motion is the baseline. */

.animated-element {
  /* Default: no animation — works for all users */
  opacity: 1;
  transform: none;
}

@media (prefers-reduced-motion: no-preference) {
  /* Opt into animation only when user hasn't requested reduction */
  .animated-element {
    animation: slideUp 0.4s var(--ease-enter) both;
  }

  .parallax-bg {
    will-change: transform;
    transition: transform 0.1s linear;
  }
}

/* For JS animations, read the preference */
```

```js
const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

gsap.to(".hero", {
  y: prefersReduced ? 0 : -50,    // skip parallax for reduced motion
  opacity: 1,
  duration: prefersReduced ? 0.01 : 0.6,
});
```

---

## CSS Animation with Custom Properties for Runtime Control

```css
/* Define animation properties as custom properties
   so they can be overridden per-component or via JS */
:root {
  --anim-duration: 0.4s;
  --anim-delay: 0s;
  --anim-distance: 20px;
  --anim-easing: cubic-bezier(0, 0, 0.2, 1);
}

@keyframes reveal {
  from {
    opacity: 0;
    transform: translateY(var(--anim-distance));
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.reveal {
  animation: reveal var(--anim-duration) var(--anim-easing) var(--anim-delay) both;
}

/* Per-instance override via inline style or class */
.reveal--slow  { --anim-duration: 0.8s; }
.reveal--far   { --anim-distance: 40px; }
```

```js
// JS control: set delay based on index without touching JS animation libs
document.querySelectorAll(".reveal").forEach((el, i) => {
  el.style.setProperty("--anim-delay", `${i * 0.08}s`);
});
```

---

## Stagger with CSS animation-delay

```css
/* Static stagger: known number of items */
.list-item:nth-child(1) { animation-delay: 0ms; }
.list-item:nth-child(2) { animation-delay: 80ms; }
.list-item:nth-child(3) { animation-delay: 160ms; }
.list-item:nth-child(4) { animation-delay: 240ms; }
.list-item:nth-child(5) { animation-delay: 320ms; }

/* Or with a loop in Sass/CSS preprocessor */
@for $i from 1 through 10 {
  .list-item:nth-child(#{$i}) {
    animation-delay: #{($i - 1) * 60}ms;
  }
}

.list-item {
  animation: slideUp 0.4s cubic-bezier(0, 0, 0.2, 1) both;
}
```

For dynamic lists (unknown count), use the JS inline style approach shown above.

---

## clip-path Animation Pattern (Reveal Effect)

```css
/* Reveal text from bottom: clip slides up to expose content */
@keyframes clipReveal {
  from { clip-path: inset(100% 0 0 0); }
  to   { clip-path: inset(0% 0 0 0); }
}

/* Reveal from left: wipe right */
@keyframes wipeRight {
  from { clip-path: inset(0 100% 0 0); }
  to   { clip-path: inset(0 0% 0 0); }
}

/* Circle reveal from center */
@keyframes circleReveal {
  from { clip-path: circle(0% at 50% 50%); }
  to   { clip-path: circle(150% at 50% 50%); }
}

.headline-word {
  display: inline-block;
  animation: clipReveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
}

/* Morphing clip-path for hover state */
.card-image {
  clip-path: inset(0 0 0 0 round 8px);
  transition: clip-path 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.card:hover .card-image {
  clip-path: inset(4px 4px 4px 4px round 16px);
}
```

**Trade-off:** `clip-path` animations on complex paths can cause paint in Firefox/Safari. Always validate with DevTools paint flashing before shipping. Prefer `inset()` and `circle()` over `polygon()` for performance.
