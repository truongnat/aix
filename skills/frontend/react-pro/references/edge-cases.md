# React Edge Cases & Surprises

## Common Gotchas

### 1. Stale Closure in Effects

**Problem:** Effect callback captures outdated variable values
```javascript
// ❌ Stale closure
useEffect(() => {
  const handler = () => console.log(count);
  window.addEventListener('click', handler);
  return () => window.removeEventListener('click', handler);
  // count is missing from dependency array!
}, []);
```

**Fix:** Include all dependencies
```javascript
useEffect(() => {
  const handler = () => console.log(count);
  window.addEventListener('click', handler);
  return () => window.removeEventListener('click', handler);
}, [count]); // ✓ Now count is tracked
```

### 2. Infinite Render Loops

**Problem:** Effect creates new value that triggers another effect
```javascript
// ❌ Infinite loop
function Component() {
  const obj = { a: 1 }; // New object every render
  useEffect(() => {
    console.log(obj);
  }, [obj]); // Dependency changes every render
}
```

**Fix:** Memoize or move outside component
```javascript
const obj = { a: 1 }; // Outside component

function Component() {
  useEffect(() => {
    console.log(obj);
  }, [obj]); // ✓ Stable reference
}
```

### 3. Hydration Mismatch

**Problem:** Server renders different HTML than client
```javascript
// ❌ Server and client render differently
function Component() {
  const [mounted, setMounted] = useState(false);
  return <div>{mounted ? 'Client' : 'Server'}</div>;
}
```

**Fix:** Use useEffect to render after hydration
```javascript
function Component() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null; // Don't render during hydration
  return <div>Client</div>;
}
```

### 4. Missing Key Prop in Lists

**Problem:** Component state gets mixed up when list reorders
```javascript
// ❌ No key or index as key
{items.map((item, index) => (
  <Item key={index} data={item} />
))}
```

**Fix:** Use stable, unique identifier
```javascript
// ✓ Stable unique key
{items.map((item) => (
  <Item key={item.id} data={item} />
))}
```

### 5. Race Conditions in Effects

**Problem:** Async effect doesn't cancel when component unmounts
```javascript
// ❌ Race condition
useEffect(() => {
  fetch('/api/data')
    .then(res => res.json())
    .then(data => setState(data));
    // If component unmounts, setState called on unmounted component
}, []);
```

**Fix:** Cancel async work on cleanup
```javascript
useEffect(() => {
  let isMounted = true;
  fetch('/api/data')
    .then(res => res.json())
    .then(data => {
      if (isMounted) setState(data); // ✓ Check before setState
    });
  return () => { isMounted = false; };
}, []);
```

### 6. Array/Object in Dependency Arrays

**Problem:** New array/object created every render breaks memoization
```javascript
// ❌ Re-renders on every parent render
function Parent() {
  return <Child items={[1, 2, 3]} />;
}

function Child({ items }) {
  const total = useMemo(() => {
    return items.reduce((a, b) => a + b, 0);
  }, [items]); // items is new every time!
}
```

**Fix:** Memoize array/object or move outside
```javascript
// ✓ Stable reference
const ITEMS = [1, 2, 3];

function Parent() {
  return <Child items={ITEMS} />;
}
```

## When to Use Each Hook

| Hook | Purpose | When to Use |
|------|---------|------------|
| `useState` | Local state | Simple values that change |
| `useEffect` | Side effects | API calls, subscriptions, DOM updates |
| `useContext` | Global state | Theme, auth, avoiding prop drilling |
| `useReducer` | Complex state | Multiple related values, complex logic |
| `useMemo` | Expensive computation | Heavy calculations, memoizing objects |
| `useCallback` | Function memoization | Passing functions to memoized children |
| `useRef` | Persistent mutable value | DOM refs, timers, previous values |
| `useLayoutEffect` | Sync side effects | Measure DOM, layout effects |

## Performance Traps

1. **Unnecessary re-renders** — Check React DevTools Profiler
2. **Large bundles** — Use code splitting, lazy loading
3. **Unoptimized images** — Use `<Image>` in Next.js or `srcset`
4. **Missing `key` prop** — Causes state loss and poor performance
5. **All state at top level** — Split into smaller components
