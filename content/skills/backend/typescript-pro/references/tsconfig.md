# TypeScript — Compiler configuration

## Recommended base tsconfig

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true
  }
}
```

## Module system matrix

| Environment | `module` | `moduleResolution` | Notes |
|-------------|----------|--------------------|-------|
| Node ESM | `NodeNext` | `NodeNext` | Requires `.js` extensions in imports |
| Node CJS | `CommonJS` | `Node` | Default Node; no extension needed |
| Vite/webpack | `ESNext` | `Bundler` | Bundler handles extensions |
| Browser lib | `ESNext` | `Bundler` | |

## Strict flags breakdown

| Flag | What it enables |
|------|----------------|
| `strictNullChecks` | `null`/`undefined` distinct from other types |
| `strictFunctionTypes` | Contravariant function param checking |
| `strictBindCallApply` | Type-safe `.bind/.call/.apply` |
| `strictPropertyInitialization` | Class props must be set in constructor |
| `noImplicitAny` | Error on implicit `any` |
| `noImplicitThis` | Error on untyped `this` |
| `useUnknownInCatchVariables` | Catch var is `unknown` not `any` |

## Path aliases (requires bundler support)

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"]
    }
  }
}
```

Always pair with `vite.config.ts` `resolve.alias` or `tsconfig-paths` for Node.

## `isolatedModules` requirements

- All files must be modules (have at least one `import`/`export`)
- Use `import type` for type-only imports
- No `const enum` (use plain `enum` or `as const` objects)
- No namespace merging across files
