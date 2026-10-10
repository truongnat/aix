# Mobile UX constraints system model

## Layers (mental map)

```text
Hardware (screen size, notch, hinge, sensors)
    → OS chrome (status bar, nav bar, keyboard, gestures)
        → App layout (safe area, scroll regions)
            → Content & controls (targets, typography scale)
```

**Design choices at inner layers** cannot violate outer constraints — **`touch-layout-safe-areas-and-density.md`**.

## Reach and posture

| Zone | Typical use |
|------|-------------|
| **Natural thumb arc** | Primary actions on phone one-handed |
| **Stretch zone** | Secondary / destructive with care — **`anti-patterns.md`** |

## Platform vocabulary

| Term | Notes |
|------|--------|
| **Safe area** | Insets from hardware + system UI — differs iOS/Android — **`navigation-and-platform-ios-android.md`** |
| **Density** | dp/pt vs physical pixels — **`versions.md`** |

## Native vs web surface

- **Native app** — System back, sheets, **no hover** — do not paste **desktop web** patterns — **`integration-map.md`** (`**design-system-pro`** for browser-only patterns).
