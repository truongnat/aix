# GSAP Animation Patterns

## Basic Timeline with Labels and Callbacks

```js
import gsap from "gsap";

const tl = gsap.timeline({
  defaults: { ease: "power2.out", duration: 0.6 },
  onComplete: () => console.log("timeline done"),
  onUpdate: () => updateProgressBar(tl.progress()),
});

tl.from(".hero-headline", { y: 40, opacity: 0 }, "start")
  .from(".hero-sub", { y: 30, opacity: 0 }, "start+=0.15")
  .from(".hero-cta", { scale: 0.9, opacity: 0 }, "start+=0.3")
  .addLabel("content-in", "+=0.2")
  .from(".feature-card", { y: 60, opacity: 0, stagger: 0.1 }, "content-in")
  .call(() => trackEvent("hero_animated"), [], "content-in");

// Pause and resume on user action
document.querySelector(".pause-btn").addEventListener("click", () => {
  tl.paused() ? tl.play() : tl.pause();
});
```

Labels let you anchor subsequent tweens without recalculating offsets. Use `"label+=0.2"` for relative positioning from a label.

---

## ScrollTrigger Setup

```js
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

// Basic scroll-linked animation
gsap.to(".progress-bar", {
  scaleX: 1,
  ease: "none",
  scrollTrigger: {
    trigger: "body",
    start: "top top",      // when top of trigger hits top of viewport
    end: "bottom bottom",  // when bottom of trigger hits bottom of viewport
    scrub: true,           // tie animation progress to scroll position
  },
});

// Pinned section with snap
gsap.to(".panel-container", {
  x: () => -(document.querySelector(".panel-container").scrollWidth - window.innerWidth),
  ease: "none",
  scrollTrigger: {
    trigger: ".horizontal-section",
    pin: true,
    scrub: 1,              // scrub: number adds smoothing lag (seconds)
    snap: {
      snapTo: 1 / (panelCount - 1),
      duration: { min: 0.2, max: 0.3 },
      ease: "power1.inOut",
    },
    start: "top top",
    end: () => "+=" + document.querySelector(".panel-container").scrollWidth,
  },
});

// Toggle class on enter/leave
ScrollTrigger.create({
  trigger: ".sticky-nav",
  start: "top top",
  onEnter: () => nav.classList.add("scrolled"),
  onLeaveBack: () => nav.classList.remove("scrolled"),
});
```

**Common trigger position strings:**
| String | Meaning |
|---|---|
| `"top top"` | top of element meets top of viewport |
| `"top center"` | top of element meets center of viewport |
| `"top 80%"` | top of element is 80% down the viewport |
| `"bottom top"` | bottom of element meets top of viewport |
| `"center center"` | centers align — good for parallax mid-points |
| `"top top+=64"` | top of element, with 64px offset (e.g. sticky nav height) |

---

## Stagger Pattern for List Reveals

```js
// Simple stagger from ScrollTrigger
gsap.from(".blog-card", {
  y: 50,
  opacity: 0,
  duration: 0.5,
  stagger: 0.08,
  ease: "power2.out",
  scrollTrigger: {
    trigger: ".blog-grid",
    start: "top 75%",
    once: true,          // only animate in, don't replay on scroll back
  },
});

// Advanced stagger with grid layout awareness
gsap.from(".grid-item", {
  scale: 0.85,
  opacity: 0,
  duration: 0.4,
  stagger: {
    amount: 0.6,         // total stagger spread across all items
    from: "center",      // start from center outward
    grid: [3, 4],        // 3 rows × 4 cols — stagger radiates from center cell
    ease: "power1.inOut",
  },
});
```

---

## Morphing / DrawSVG Pattern

```js
import { MorphSVGPlugin, DrawSVGPlugin } from "gsap/all";
gsap.registerPlugin(MorphSVGPlugin, DrawSVGPlugin);

// DrawSVG: animate stroke drawing in
gsap.from(".path-line", {
  drawSVG: "0%",          // start fully hidden
  duration: 1.5,
  ease: "power2.inOut",
  stagger: 0.2,
});

// MorphSVG: shape-shift between two paths
const morphTl = gsap.timeline({ repeat: -1, yoyo: true });
morphTl.to("#shape-a", {
  morphSVG: "#shape-b",   // target path (same number of points, or GSAP subdivides)
  duration: 1,
  ease: "power1.inOut",
});

// Practical: hamburger → close icon
function toggleMenu(open) {
  gsap.to("#line-top",    { morphSVG: open ? "#close-top" : "#line-top", duration: 0.3 });
  gsap.to("#line-middle", { opacity: open ? 0 : 1, duration: 0.15 });
  gsap.to("#line-bottom", { morphSVG: open ? "#close-bottom" : "#line-bottom", duration: 0.3 });
}
```

---

## Cleanup Pattern (Kill Tweens on Unmount)

```js
// React: using useEffect cleanup
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

function AnimatedSection() {
  const ref = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // All tweens/ScrollTriggers created here are scoped to ctx
      gsap.from(".item", { y: 30, opacity: 0, stagger: 0.1 });

      ScrollTrigger.create({
        trigger: ref.current,
        start: "top 80%",
        onEnter: () => gsap.to(".item", { color: "var(--accent)" }),
      });
    }, ref); // scope to the ref element

    return () => ctx.revert(); // kills all tweens + ScrollTriggers in ctx
  }, []);

  return <section ref={ref}><div className="item">...</div></section>;
}

// Vanilla JS: manual cleanup
const tweens = [];
const triggers = [];

function init() {
  tweens.push(gsap.to(".box", { x: 100, repeat: -1 }));
  triggers.push(ScrollTrigger.create({ trigger: ".section", ... }));
}

function destroy() {
  tweens.forEach(t => t.kill());
  triggers.forEach(t => t.kill());
  tweens.length = 0;
  triggers.length = 0;
}
```

---

## Batch Animation for Performance

Use `ScrollTrigger.batch()` when animating many independent elements — avoids creating one ScrollTrigger per element.

```js
// Without batch: creates N ScrollTriggers (expensive)
document.querySelectorAll(".card").forEach(card => {
  ScrollTrigger.create({ trigger: card, ... }); // don't do this
});

// With batch: one shared observer, efficient
ScrollTrigger.batch(".card", {
  onEnter: (elements) => {
    gsap.from(elements, {
      y: 40,
      opacity: 0,
      duration: 0.5,
      stagger: 0.05,
      ease: "power2.out",
    });
  },
  onLeave: (elements) => {
    gsap.set(elements, { opacity: 0, y: -20 });
  },
  onEnterBack: (elements) => {
    gsap.to(elements, { opacity: 1, y: 0, duration: 0.4 });
  },
  start: "top 85%",
  batchMax: 5,           // max elements triggered per batch tick
});

// Refresh after dynamic content changes
ScrollTrigger.refresh();
```

**When to use batch vs context:**
- `batch()`: list items, cards, repeated elements that share the same animation
- `context()`: scoped component cleanup (React/Vue lifecycle)
- Both can coexist — batch inside a context is valid
