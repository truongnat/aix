# Flutter — decision trees

## State management choice (simplified)

```
App-wide async data + caching?
├── Riverpod / Bloc / Provider patterns — pick team standard
└── Ephemeral UI only → StatefulWidget + local state
```

## go_router vs Navigator 2

```
Deep linking and declarative routes required?
├── go_router (or team’s chosen solution)
└── Small app → Navigator may suffice
```

## List performance

```
Huge list, scroll performance issues?
├── ListView.builder / SliverList + keys
└── Still slow after profiling → consider item extent, rebuild scope
```

## Web vs mobile first

```
Primary users on web?
├── Layout and input differ — test `kIsWeb` paths
└── Mobile-first — still verify tablet breakpoints
```

## Standalone Flutter vs add-to-app

```
Embedding Flutter in existing native shell (iOS/Android)?
├── Define engine/cache lifecycle contract with native team; module boundaries
└── Pure Flutter app → simpler default architecture
```

## Further reading

- [widgets.md](widgets.md), [tips-and-tricks.md](tips-and-tricks.md)

