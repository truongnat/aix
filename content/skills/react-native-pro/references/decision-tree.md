# React Native — decision trees

## Expo managed vs bare workflow

```
Need custom native code not in Expo modules ecosystem?
├── Yes → Bare / prebuild; own native projects
└── No → Managed Expo; faster iteration for many apps
```

## FlatList vs FlashList

```
Very long lists, scroll jank after profiling?
├── Yes → Try FlashList (Shopify) after measuring
└── No → FlatList with tuned `windowSize` / `maxToRenderPerBatch` often enough
```

## React Navigation vs Expo Router

```
File-based routes and web parity important?
├── Expo Router (Expo projects)
└── React Navigation classic stack/tab — explicit navigators
```

## Hermes on or off

```
Default on modern RN/Expo — keep Hermes unless a blocking native module issue — then verify compatibility matrix
```

## OTA (EAS Update) vs new store build

```
Change touches native code, permissions, entitlements, or new native dependency?
├── Yes → new binary + store submission — **`edge-cases.md`**
└── No → JS/asset-only may ship via OTA; verify runtime compatibility matrix — **`versions.md`**
```

## Further reading

- [tips-and-tricks.md](tips-and-tricks.md), [edge-cases.md](edge-cases.md)
