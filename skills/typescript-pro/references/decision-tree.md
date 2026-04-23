# Decision tree — TypeScript

## `satisfies` vs type annotation vs `as`

```
Need to check an object matches type but keep literal inference?
└── `satisfies` (preferred for config-like objects)

Need to name a variable’s type explicitly and widen is OK?
└── `: Type` annotation

Only escape hatch for impossible narrowing (with comment)?
└── `as` — last resort
```

## Monorepo: composite and project references

```
Multiple packages with shared types?
├── `composite` + project references — incremental builds
└── Single `tsconfig` — OK for small repos; watch path/`rootDir` surprises
```

## Narrowing strategy

```
Value is union?
├── Discriminant field (`kind: 'a' | 'b'`) → switch with exhaustiveness (`never`)
├── typeof / instanceof → use guards
└── External input → validate at boundary (schema) → typed output
```

## When to use `any`

```
Default:
└── Avoid; use `unknown` + narrowing

Escape hatch:
└── Comment why; ticket to remove; isolate to boundary module
```
