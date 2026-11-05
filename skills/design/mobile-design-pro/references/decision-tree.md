# Mobile design — decision tree

## Platform

- **iOS + Android parity** vs **platform-native patterns** — pick per screen criticality.

## Navigation

- **Tab vs stack vs modal** — depth and task flow drive choice.

## Density

- **One-handed reach** vs **information density** — test on small device first.

## Phone vs tablet

```
Need master-detail simultaneous on large width?
├── Tablet / large phone landscape → Split view patterns per platform — **`navigation-and-platform-ios-android.md`**
└── Phone-first → Avoid hiding critical nav only in sidebar
```
