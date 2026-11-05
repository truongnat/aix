# TypeScript — Type system depth

## Generics

```ts
// Constrain with extends
function first<T extends readonly unknown[]>(arr: T): T[0] { return arr[0]; }

// infer inside conditional type
type UnpackPromise<T> = T extends Promise<infer U> ? U : T;

// Default type parameter
type Maybe<T = unknown> = T | null | undefined;
```

## Mapped types

```ts
type Mutable<T> = { -readonly [K in keyof T]: T[K] };
type Optional<T> = { [K in keyof T]+?: T[K] };
type Nullable<T> = { [K in keyof T]: T[K] | null };
```

## Conditional types

```ts
// Distributive over unions
type ToArray<T> = T extends unknown ? T[] : never;
// string[] | number[] for ToArray<string | number>

// Non-distributive (wrap in tuple)
type ToArrayNonDist<T> = [T] extends [unknown] ? T[] : never;
// (string | number)[] for ToArrayNonDist<string | number>
```

## Template literal types

```ts
type EventName<T extends string> = `on${Capitalize<T>}`;
type ClickEvent = EventName<'click'>; // "onClick"

type DeepKeys<T> = T extends object
  ? { [K in keyof T]-?: K extends string
      ? T[K] extends object ? `${K}.${DeepKeys<T[K]>}` : K
      : never }[keyof T]
  : never;
```

## Key utility types

| Utility | Usage |
|---------|-------|
| `Partial<T>` | All props optional |
| `Required<T>` | All props required |
| `Readonly<T>` | All props readonly |
| `Pick<T, K>` | Subset of keys |
| `Omit<T, K>` | Exclude keys |
| `Record<K, V>` | Key-value map |
| `Exclude<T, U>` | Remove union members |
| `Extract<T, U>` | Keep union members |
| `NonNullable<T>` | Remove null/undefined |
| `ReturnType<F>` | Function return type |
| `Parameters<F>` | Function params tuple |
| `Awaited<T>` | Unwrap Promise |
| `InstanceType<C>` | Constructor instance type |
