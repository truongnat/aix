# TypeScript — Tips and tricks

## `satisfies` operator

```ts
// Validates shape without widening the type
const palette = {
  red: [255, 0, 0],
  green: '#00ff00',
} satisfies Record<string, string | number[]>;

// palette.red is number[], not string | number[]
palette.red.map(x => x * 2); // OK
```

## `as const` for literal narrowing

```ts
const ROUTES = {
  home: '/',
  about: '/about',
} as const;

type Route = typeof ROUTES[keyof typeof ROUTES]; // '/' | '/about'
```

## Discriminated unions + exhaustive check

```ts
type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'rect'; w: number; h: number };

function area(s: Shape): number {
  switch (s.kind) {
    case 'circle': return Math.PI * s.radius ** 2;
    case 'rect': return s.w * s.h;
    default: {
      const _exhaustive: never = s; // compile error if case missing
      return _exhaustive;
    }
  }
}
```

## Type guards and predicates

```ts
function isString(x: unknown): x is string {
  return typeof x === 'string';
}

// Assertion function (throws if not)
function assertString(x: unknown): asserts x is string {
  if (typeof x !== 'string') throw new TypeError('Expected string');
}
```

## Module augmentation

```ts
// augment a library type in a .d.ts file
declare module 'express' {
  interface Request {
    user?: { id: string; role: string };
  }
}
```

## Branded types (nominal typing)

```ts
type UserId = string & { readonly __brand: 'UserId' };
function toUserId(s: string): UserId { return s as UserId; }
// Prevents mixing UserId with plain string in function signatures
```
