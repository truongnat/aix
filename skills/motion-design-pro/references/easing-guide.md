# Easing Functions Reference

## Easing Taxonomy

**Linear** — constant velocity throughout. Objects in real life never move this way — they accelerate or decelerate. Use only for truly continuous motion (progress bars, loaders, shimmer). In UI transitions it reads as robotic and cheap.

**Ease-in** — starts slow, ends fast. Feels like the object is being pulled away or falling. Use for elements exiting the screen — the acceleration into offscreen feels purposeful and the user doesn't see the abrupt end.

**Ease-out** — starts fast, ends slow. Feels like the object is arriving and settling. This is the most natural easing for elements entering the screen because it mimics physical deceleration.

**Ease-in-out** — slow at both ends, fast in the middle. Use for elements that move within the viewport (e.g., a sidebar sliding from left to right, a card repositioning in a grid). The symmetry respects both the origin and the destination.

**Spring** — overshoots the target and oscillates back. Conveys energy, responsiveness, playfulness. Use judiciously — excessive spring reads as toy-like. Works well for: buttons responding to tap, elements snapping into place, drag-and-drop drop targets.

**Bounce** — like spring but the oscillation stays positive (element bounces against the floor). Rarely appropriate for professional UI. Use only in gamified or explicitly playful interfaces.

---

## Named Easing Presets

### GSAP Power Curve Family

| Preset | Direction | Character |
|---|---|---|
| `power1.out` | ease-out | gentle deceleration, almost linear |
| `power2.out` | ease-out | standard UI entry, clear deceleration |
| `power3.out` | ease-out | strong deceleration, dramatic but controlled |
| `power4.out` | ease-out | very fast entry, dramatic landing — use for hero reveals |
| `power1.in` | ease-in | slow exit start |
| `power2.inOut` | ease-in-out | smooth reposition |
| `expo.out` | ease-out | extremely fast initial velocity, gentle landing |
| `expo.in` | ease-in | slow wind-up then shoots out |
| `back.out(1.5)` | ease-out + overshoot | slight bounce-back at end — playful but usable |
| `back.in(1.5)` | ease-in + pre-wind | anticipation before exit |
| `elastic.out(1, 0.3)` | spring-like | strong spring, 2-3 oscillations — very playful |
| `circ.out` | ease-out | derived from circle curve, rounder deceleration than power4 |
| `sine.inOut` | ease-in-out | very gentle S-curve, almost imperceptible at extremes |

```js
// GSAP usage
gsap.to(".box", { x: 200, ease: "power2.out" });
gsap.to(".box", { x: 200, ease: "expo.out" });
gsap.to(".box", { x: 200, ease: "back.out(1.7)" }); // 1.7 = overshoot amount
gsap.to(".box", { x: 200, ease: "elastic.out(1, 0.4)" }); // amplitude, period
```

---

## Cubic-Bezier Cheat Sheet

The four values `(x1, y1, x2, y2)` define the two control points of a cubic bezier curve. The curve always starts at `(0,0)` and ends at `(1,1)`.

```
ease:               cubic-bezier(0.25, 0.1, 0.25, 1.0)
  Gentle entry and exit. Browser default. Not precise enough for intentional design.

ease-out:           cubic-bezier(0, 0, 0.2, 1)          [Material: easeOut]
  Fast entry, slow exit. Best for elements appearing on screen.
  The user's eye catches movement immediately, then settles naturally.

ease-in:            cubic-bezier(0.4, 0, 1, 1)           [Material: easeIn]
  Slow entry, fast exit. Use exclusively for disappearing elements.
  The sharp exit means the user never sees the "snap" at the end.

standard:           cubic-bezier(0.4, 0, 0.2, 1)         [Material: standard]
  Asymmetric ease-in-out. Heavier deceleration. Good for repositioning within screen.

expo-out:           cubic-bezier(0.16, 1, 0.3, 1)
  Dramatic deceleration. Nearly instant travel, extended landing.
  Use for: hero text reveals, large panels entering, premium feel.

expo-in:            cubic-bezier(0.7, 0, 1, 1)
  Long wind-up then explosive exit. Use for: elements being dismissed dramatically.

back-out:           cubic-bezier(0.34, 1.56, 0.64, 1)
  Slight overshoot past destination then settles. Spring-like without oscillation.
  Use for: tooltips appearing, menu items, interactive feedback.

custom-spring-soft: cubic-bezier(0.175, 0.885, 0.32, 1.275)
  More overshoot. Feels bouncier. Use for: modals, popovers, game-adjacent UI.
```

---

## Framer Motion Spring Combos

Spring animations in Framer Motion are physics-based — no duration, just stiffness/damping/mass.

```tsx
// Snappy UI response — buttons, toggles, interactive elements
type: "spring", stiffness: 500, damping: 35

// Natural settle — cards, panels, most general UI
type: "spring", stiffness: 300, damping: 30

// Slow, weighty — large modals, full-screen transitions
type: "spring", stiffness: 150, damping: 25

// Bouncy — explicit playfulness, game UI, onboarding
type: "spring", stiffness: 400, damping: 15    // low damping = more oscillation

// Near-instant with minimal spring — micro-interactions
type: "spring", stiffness: 700, damping: 50    // fast and barely oscillates

// Adding mass makes motion feel heavier/slower (default mass: 1)
type: "spring", stiffness: 300, damping: 30, mass: 1.5   // heavier
type: "spring", stiffness: 300, damping: 30, mass: 0.5   // lighter/faster
```

**Debugging springs:** if oscillation looks wrong, adjust damping first. Too much bounce = increase damping. Too stiff/instant = decrease stiffness.

---

## When to Use Which Easing (by Interaction Type)

| Interaction | Recommended Easing | Why |
|---|---|---|
| Element entering viewport | `ease-out` / `expo.out` | Natural deceleration, eye catches fast movement |
| Element exiting viewport | `ease-in` | Accelerates away, user misses the abrupt stop |
| Button hover/focus | `ease-out` or spring `stiffness: 500` | Immediate response, settled feeling |
| Button tap/press | Spring `stiffness: 500, damping: 30` | Physical feel |
| Modal opening | Spring `stiffness: 300, damping: 28` or `back.out` | Weight + subtle bounce |
| Modal closing | `ease-in`, shorter duration | Dismissed — gets out of the way fast |
| Drawer/sidebar slide | `ease-in-out` / `standard` | Moves within screen, needs both ends |
| Page transition (enter) | `expo.out` | Premium feel, fast travel |
| Page transition (exit) | `ease-in`, 0.25s | Quick exit so new page doesn't wait |
| Reorder / sort | `ease-in-out`, 0.3–0.4s | Smooth positional swap |
| Notification toast | `back.out(1.4)` | Snaps in with slight bounce, reads as alert |
| Progress bar (scrub) | `linear` (for scrub), `ease-out` for fill | Scrub must track 1:1, fill feels satisfying |
| Hover card reveal | `ease-out`, 0.15–0.2s | Fast response to user intent |
| Scroll-linked parallax | `linear` for tie to scroll value | 1:1 scroll tracking — easing would feel off |

---

## Anti-Patterns

**Linear animation on UI transitions.** Never use `linear` for elements entering or exiting. It reads as a prototype, not a product. Even `ease` (the browser default) is better — but neither is intentional.

**Excessive bounce/elastic on functional UI.** Elastic and heavy bounce easings work in games and playful apps. In enterprise dashboards, analytics tools, or productivity apps they read as unpolished and distract from the content.

**Ease-in on entering elements.** Elements that ease-in appear to slowly materialize — the eye doesn't register the motion start and it feels sluggish. Always use ease-out (or spring) for entrances.

**Mismatched easing across a system.** When buttons use spring, modals use linear, and page transitions use ease, the app feels incoherent. Define 3–5 easing tokens (enter, exit, standard, spring, interactive) and use them consistently.

**Duration too long + non-linear easing.** A 700ms `expo.out` transition means the element spends most of its time barely moving. Duration and easing compound. Longer duration → gentler easing. Shorter duration → more dramatic easing.
