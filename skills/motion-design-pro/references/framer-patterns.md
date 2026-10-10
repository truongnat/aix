# Framer Motion Patterns

## Variants System — Parent/Child Orchestration

Variants let parent components coordinate child animations without prop drilling.

```tsx
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,     // delay between each child
      delayChildren: 0.2,        // wait before first child starts
      when: "beforeChildren",    // parent animates in before children begin
    },
  },
  exit: {
    opacity: 0,
    transition: { when: "afterChildren", staggerChildren: 0.05, staggerDirection: -1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { ease: [0, 0, 0.2, 1], duration: 0.4 } },
  exit: { y: -10, opacity: 0 },
};

function AnimatedList({ items }) {
  return (
    <motion.ul variants={containerVariants} initial="hidden" animate="visible" exit="exit">
      {items.map(item => (
        <motion.li key={item.id} variants={itemVariants}>
          {item.label}
        </motion.li>
      ))}
    </motion.ul>
  );
}
```

Child components automatically inherit `initial`, `animate`, and `exit` from the parent — no need to repeat them on each `motion.li`.

---

## AnimatePresence — Enter/Exit with mode="wait"

```tsx
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: { ease: [0, 0, 0.2, 1], duration: 0.35 } },
  exit:    { opacity: 0, x: -20, transition: { ease: [0.4, 0, 1, 1], duration: 0.25 } },
};

function Router({ currentPage }) {
  return (
    // mode="wait": exit completes before enter starts — prevents overlap
    // mode="sync": enter and exit happen simultaneously (good for crossfades)
    // mode="popLayout": removes exiting element from layout flow immediately
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={currentPage}           // key change triggers exit of old, enter of new
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {pages[currentPage]}
      </motion.div>
    </AnimatePresence>
  );
}

// Modal with AnimatePresence
function Modal({ isOpen, onClose, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="modal"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

---

## Layout Animations with layoutId — Shared Element Transitions

```tsx
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const cards = [
  { id: "a", title: "Card A", color: "#4f46e5" },
  { id: "b", title: "Card B", color: "#0891b2" },
];

function GalleryToDetail() {
  const [selected, setSelected] = useState(null);

  return (
    <>
      <div className="grid">
        {cards.map(card => (
          <motion.div
            key={card.id}
            layoutId={card.id}          // same layoutId = shared element
            className="card"
            style={{ background: card.color }}
            onClick={() => setSelected(card)}
          >
            <motion.h2 layoutId={`${card.id}-title`}>{card.title}</motion.h2>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div className="overlay">
            <motion.div
              layoutId={selected.id}   // GSAP would need manual FLIP — Framer does it automatically
              className="detail-card"
              style={{ background: selected.color }}
            >
              <motion.h2 layoutId={`${selected.id}-title`}>{selected.title}</motion.h2>
              <motion.button onClick={() => setSelected(null)} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                Close
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// List reorder with layout prop
function ReorderableList({ items }) {
  return items.map(item => (
    <motion.div key={item.id} layout>  {/* layout prop auto-animates position changes */}
      {item.name}
    </motion.div>
  ));
}
```

---

## Gesture Handlers with useMotionValue

```tsx
import { motion, useMotionValue, useTransform } from "framer-motion";

function DraggableCard() {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-150, 0, 150], [-20, 0, 20]);
  const opacity = useTransform(x, [-150, -100, 0, 100, 150], [0, 1, 1, 1, 0]);

  return (
    <motion.div
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: -150, right: 150 }}
      dragElastic={0.15}
      whileDrag={{ scale: 1.05, cursor: "grabbing" }}
      onDragEnd={(event, info) => {
        if (Math.abs(info.offset.x) > 100) {
          handleSwipe(info.offset.x > 0 ? "right" : "left");
        }
      }}
    />
  );
}

// Hover/tap with variants
function Button({ children, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.03, y: -1 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
    >
      {children}
    </motion.button>
  );
}
```

---

## useInView Hook Pattern

```tsx
import { useInView } from "framer-motion";
import { useRef } from "react";

function FadeInSection({ children }) {
  const ref = useRef(null);
  // once: true — animate in once, never reset (use false for repeat on scroll)
  const isInView = useInView(ref, { once: true, margin: "-100px 0px" });

  return (
    <div ref={ref}>
      <motion.div
        animate={isInView ? "visible" : "hidden"}
        variants={{
          hidden: { opacity: 0, y: 30 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0, 0, 0.2, 1] } },
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
```

---

## Motion Values and useTransform for Scroll-Linked Animation

```tsx
import { useScroll, useTransform, useSpring, motion } from "framer-motion";
import { useRef } from "react";

function ParallaxHero() {
  const ref = useRef(null);

  // useScroll scoped to a container element
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],  // [when element enters, when element leaves]
  });

  // Map scroll progress 0→1 to y position 0→-150px
  const rawY = useTransform(scrollYProgress, [0, 1], [0, -150]);
  // Add spring smoothing to the raw motion value
  const y = useSpring(rawY, { stiffness: 100, damping: 30, restDelta: 0.001 });
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div ref={ref} className="hero">
      <motion.div style={{ y, opacity }} className="hero-content">
        <h1>Headline</h1>
      </motion.div>
    </div>
  );
}
```

---

## Reusable Animation Presets

```tsx
// animations.ts — shared presets across the app

export const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { ease: [0, 0, 0.2, 1], duration: 0.4 },
};

export const slideInRight = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 40 },
  transition: { ease: [0, 0, 0.2, 1], duration: 0.35 },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.92 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.92 },
  transition: { type: "spring", stiffness: 350, damping: 28 },
};

// Usage — spread the preset
function Card() {
  return (
    <motion.div {...fadeInUp}>
      Content
    </motion.div>
  );
}

// Or combine with viewport trigger
function InViewCard() {
  return (
    <motion.div
      {...fadeInUp}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: "-80px" }}
    >
      Content
    </motion.div>
  );
}
```
