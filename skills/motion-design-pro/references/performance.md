# Animation Performance Reference

## The Three Rendering Layers

Every visual change on screen goes through up to three browser phases. Each phase is more expensive than the next:

**1. Layout (Reflow)** — recalculates element size and position. Triggered by any property that affects the document flow. The entire subtree may need recalculation. Cost: high. Can affect hundreds of elements.

Properties that trigger layout: `width`, `height`, `margin`, `padding`, `border-width`, `top`, `left`, `right`, `bottom`, `position`, `font-size`, `line-height`, `overflow`, `display`, `float`.

**2. Paint** — fills pixels within the geometry calculated by layout. Triggered by visual appearance changes that don't affect layout. Cost: medium-high, especially with large or overlapping painted areas.

Properties that trigger paint: `background-color`, `color`, `border-color`, `box-shadow`, `text-decoration`, `outline`, `visibility`, `background-image`.

**3. Composite** — moves or blends already-painted layers on the GPU. No pixel calculation needed — the GPU shuffles textures. Cost: low, can run in parallel with the main thread.

Properties that only trigger composite: `transform` (translate, scale, rotate, skew), `opacity`, `filter` (in most browsers), `will-change`.

**The rule:** only animate `transform` and `opacity`. Everything else risks jank.

---

## Safe-to-Animate Properties: transform and opacity

```css
/* Safe: compositor-only, 60fps */
.box {
  transform: translateX(0);
  opacity: 1;
  transition: transform 0.3s ease-out, opacity 0.3s ease-out;
}
.box:hover {
  transform: translateX(10px) scale(1.02);
  opacity: 0.9;
}

/* Unsafe: triggers layout on every frame */
.box-bad {
  left: 0;
  width: 100px;
  transition: left 0.3s, width 0.3s; /* layout thrash every 16ms */
}

/* Pattern: use transform instead of position properties */
/* Instead of animating left/top, use translateX/Y */
/* Instead of animating width/height, use scaleX/Y */
```

**Why transform and opacity are safe:** The browser promotes elements with these animated properties to their own compositor layer (a GPU texture). The compositor can then apply changes without touching the main thread, layout engine, or pixel painter. This is why a fade and a slide can run at 60fps even when the main thread is busy with JavaScript.

---

## will-change: When to Apply, When to Remove

```css
/* DO: apply will-change just before animation starts */
.modal {
  will-change: auto; /* default — no promotion */
}
.modal.is-animating {
  will-change: transform, opacity; /* promote right before animation */
}
.modal.is-visible {
  will-change: auto; /* remove after animation completes */
}

/* DON'T: global will-change on everything */
* { will-change: transform; } /* catastrophic memory use — creates layer for every element */

/* DON'T: permanent will-change on static elements */
.card {
  will-change: transform; /* static card never animates — wasted GPU memory */
}

/* DO: apply via JS when needed */
element.addEventListener("mouseenter", () => {
  element.style.willChange = "transform";
});
element.addEventListener("animationend", () => {
  element.style.willChange = "auto";
});
```

**Memory cost:** each promoted layer consumes GPU memory equal to its pixel area × bytes per pixel. A 1920×1080 element costs ~8MB. Promoting 50 elements = 400MB. On mobile this causes frame drops or crashes.

**When to use it:**
- Elements about to animate that the browser doesn't know about in advance
- Scroll-linked elements if you see jank (test first, don't add speculatively)
- After verifying in DevTools that layer promotion helps

---

## requestAnimationFrame Pattern for JS Animations

```js
// Correct rAF loop — time-based, not frame-rate-dependent
let startTime = null;
let rafId = null;

function animate(timestamp) {
  if (!startTime) startTime = timestamp;
  const elapsed = timestamp - startTime;
  const duration = 600; // ms
  const progress = Math.min(elapsed / duration, 1);

  // Apply easing
  const eased = easeOutCubic(progress);
  element.style.transform = `translateX(${eased * 200}px)`;

  if (progress < 1) {
    rafId = requestAnimationFrame(animate);
  }
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

// Start
rafId = requestAnimationFrame(animate);

// Cleanup — critical to prevent memory leaks
function stop() {
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = null;
    startTime = null;
  }
}

// Common mistake: multiple rAF loops without cleanup
// Each orphaned loop runs forever, blocking frame budget
```

**Key principle:** rAF fires before the browser repaints — you get one chance per frame to update state. Doing DOM reads inside a rAF loop causes forced synchronous layout ("layout thrashing"):

```js
// Layout thrash — reads and writes interleaved
function badLoop(timestamp) {
  elements.forEach(el => {
    const width = el.offsetWidth;     // READ — forces layout
    el.style.width = width + 1 + "px"; // WRITE — invalidates layout
  });
  requestAnimationFrame(badLoop);
}

// Correct — batch reads, then writes
function goodLoop(timestamp) {
  const widths = elements.map(el => el.offsetWidth); // batch READ
  elements.forEach((el, i) => {
    el.style.transform = `scaleX(${widths[i] / 100})`; // batch WRITE (no layout)
  });
  requestAnimationFrame(goodLoop);
}
```

---

## Chrome DevTools: Reading the FPS Graph and Identifying Jank

**Opening Performance tab:**
1. DevTools → Performance tab
2. Check "Screenshots" for visual reference
3. Click Record, perform the interaction, stop
4. Look at the Frames row and Main thread flame chart

**Reading the FPS graph:**
- Green bars = frames rendered. Taller bar = higher FPS
- Red bars = long frames (>16ms budget). These are jank
- Target: consistent green bars near 60fps line
- Dropped frames show as gaps

**Identifying jank in the flame chart:**
- Long purple bars = Layout (recalculate style + layout)
- Long green bars = Paint
- Long yellow bars = JavaScript execution
- "Forced reflow" warnings = you're reading layout properties after writing — classic thrash

**Flame chart workflow:**
1. Find a red/long frame in the Frames row
2. Click it to zoom in on the Main thread timeline
3. Look for the longest task — hover to see the call stack
4. "Recalculate Style" followed by "Layout" = a property change triggered reflow
5. Click the initiator link to find the offending line of JS/CSS

**Layer panel:**
- DevTools → More tools → Layers
- Shows which elements have been promoted to GPU layers
- Yellow highlight = layer. Too many = memory problem.

---

## Intersection Observer vs ScrollTrigger for Scroll Performance

```js
// Intersection Observer — built-in browser API, zero dependencies
// Best for: simple enter/exit triggers, lazy loading, analytics events

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target); // stop watching after first trigger
      }
    });
  },
  {
    root: null,          // observe relative to viewport
    threshold: 0.15,     // trigger when 15% of element is visible
    rootMargin: "-50px", // shrink viewport by 50px on all sides
  }
);

document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

// ScrollTrigger — GSAP plugin, more powerful but adds weight (~16KB gzipped)
// Best for: scrub animations, pinning, complex scroll sequences, horizontal scroll

// Rule of thumb:
// - "animate when element enters viewport once" → IntersectionObserver
// - "animate proportionally to scroll position" → ScrollTrigger
// - "pin an element and animate its children through a scroll sequence" → ScrollTrigger
// - "lazy load images or fire analytics" → IntersectionObserver
```

**Performance trade-off:** Scroll event listeners on the main thread fire every scroll tick and can block rendering. Both `IntersectionObserver` and `ScrollTrigger` (with scrub) use requestAnimationFrame internally to debounce updates. Never attach scroll animations directly to `window.addEventListener("scroll", ...)` without rAF throttling.

---

## Cleanup Checklist

Before unmounting a component or navigating away, verify each item is cleaned up:

```js
// React cleanup pattern
useEffect(() => {
  // 1. GSAP context — kills all tweens and ScrollTriggers created inside
  const ctx = gsap.context(() => { ... }, ref);

  // 2. Intersection Observer
  const observer = new IntersectionObserver(...);
  elements.forEach(el => observer.observe(el));

  // 3. requestAnimationFrame
  let rafId = requestAnimationFrame(loop);

  // 4. Event listeners
  window.addEventListener("resize", onResize);
  document.addEventListener("keydown", onKeyDown);

  // 5. Framer Motion — handled automatically by unmounting motion components

  return () => {
    ctx.revert();                    // 1. kill GSAP
    observer.disconnect();           // 2. kill IntersectionObserver
    cancelAnimationFrame(rafId);     // 3. cancel rAF
    window.removeEventListener("resize", onResize);    // 4. remove listeners
    document.removeEventListener("keydown", onKeyDown);
  };
}, []);
```

**Symptoms of missed cleanup:**
- Memory usage grows over time (open Task Manager or DevTools Memory tab)
- Animations play after the component is gone (console errors about setting state on unmounted components)
- Scroll events fire after navigation
- FPS drops gradually after repeated route changes

---

## Lighthouse Animation Score Factors

Lighthouse doesn't have an explicit "animation score" — animation quality contributes to these audits:

**Total Blocking Time (TBT):** Long JavaScript tasks (>50ms) on the main thread block animations. Heavy animation libraries loaded synchronously hurt TBT. Import GSAP asynchronously or use dynamic imports for route-specific animations.

**Cumulative Layout Shift (CLS):** Animations that change layout properties (`width`, `height`, `top`, `margin`) during page load cause CLS. Use `transform` instead. Also: avoid animating elements that are part of the critical rendering path before they settle.

**Largest Contentful Paint (LCP):** If your hero image or headline is the LCP element and you're fading it in from `opacity: 0`, Lighthouse may not count it as painted until after the animation. Use `opacity: 0` on a wrapper, not the LCP element itself. Or delay the animation until after LCP is reported.

```js
// Defer non-critical animations until after LCP
if ("PerformanceObserver" in window) {
  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    // LCP has been reported — safe to start decorative animations
    initScrollAnimations();
    observer.disconnect();
  });
  observer.observe({ type: "largest-contentful-paint", buffered: true });
} else {
  // Fallback for browsers without PerformanceObserver
  window.addEventListener("load", initScrollAnimations);
}
```

**Performance budget:** Animation JS (GSAP full build ~27KB gzipped, Framer Motion ~47KB) is real weight. Use tree-shaking to import only what you need:
```js
import { gsap } from "gsap";                    // core only
import { ScrollTrigger } from "gsap/ScrollTrigger"; // add plugins individually
```
