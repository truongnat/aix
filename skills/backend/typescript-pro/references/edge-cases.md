# TypeScript — Edge cases

**Related:** checker/boundary model — [typescript-typechecking-and-boundaries-system-model.md](typescript-typechecking-and-boundaries-system-model.md), [failure-modes-detection-mitigation.md](failure-modes-detection-mitigation.md).

## Excess property checks

Only triggered on fresh object literals:

```ts
type Point = { x: number };
const p: Point = { x: 1, y: 2 }; // Error: excess 'y'
const obj = { x: 1, y: 2 };
const p2: Point = obj; // OK — obj is not a fresh literal
```

## Variance under strictFunctionTypes

```ts
type Handler = (e: MouseEvent) => void;
// (e: Event) => void is assignable to Handler (contravariant param)
// (e: PointerEvent) => void is NOT assignable (narrower param)
```

## `noUncheckedIndexedAccess`

```ts
const arr: string[] = ['a', 'b'];
const first = arr[0]; // string | undefined (not just string)
if (first !== undefined) first.toUpperCase(); // safe
```

## Circular type aliases

```ts
// Works via interface (structural)
interface Tree { value: number; children: Tree[] }
// Type alias needs indirection for recursive types
type JSONValue = string | number | boolean | null | JSONValue[] | { [k: string]: JSONValue };
```

## `infer` position matters

```ts
// Covariant position (return type) — works as expected
type ReturnOf<F> = F extends (...args: any[]) => infer R ? R : never;

// Contravariant position — infers intersection
type Params<F> = F extends (...args: infer P) => any ? P : never;
```

## Declaration merging pitfalls

```ts
// interface merges with same-name interface
interface Foo { a: string }
interface Foo { b: number } // OK — merged
// type alias CANNOT be merged
type Bar = { a: string };
type Bar = { b: number }; // Error: Duplicate identifier
```

## `never` propagation in unions

```ts
type A = 'x' | never; // 'x' — never is identity in unions
type B = 'x' & never; // never — never annihilates in intersections
```

## Class field initialization with `strictPropertyInitialization`

```ts
class Svc {
  conn!: Connection; // Definite assignment assertion — use only if init is guaranteed by framework
  // Better: constructor(conn: Connection) { this.conn = conn; }
}
```
