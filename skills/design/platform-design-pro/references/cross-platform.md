# Cross-Platform Design Patterns — React Native and Flutter

## What to Share vs What to Keep Platform-Native

The central tension in cross-platform development: share too much and the app feels wrong on both platforms; share too little and you've just built two apps.

**Share these:**
- Business logic, API calls, data models
- Design tokens (colors, spacing, typography scales as raw values)
- Semantic token names ("color.primary.action", "spacing.md")
- State management logic
- Validation rules
- Copy/strings (with i18n layer)
- Test utilities and mocks

**Keep platform-native:**

| Concern             | iOS native                        | Android native                    |
|---------------------|-----------------------------------|-----------------------------------|
| Navigation model    | NavigationStack / TabView         | NavBar / NavRail / NavDrawer      |
| Back gesture        | Edge swipe (leading edge)         | System back button / gesture      |
| Icon set            | SF Symbols                        | Material Symbols                  |
| Typography          | SF Pro, Dynamic Type              | Roboto / Google Sans, sp units    |
| Switches/toggles    | UISwitch (rounded, pill)          | MaterialSwitch (M3)               |
| Date picker         | WheelDatePicker / calendar        | MaterialDatePicker (calendar)     |
| Pull to refresh     | UIRefreshControl (above list)     | SwipeRefreshLayout (spinner icon) |
| Loading indicator   | UIActivityIndicatorView (spinner) | CircularProgressIndicator         |
| Haptics             | UIImpactFeedbackGenerator         | HapticFeedback / VibrationEffect  |

**The rule:** anything the user's muscle memory expects to behave a specific way — navigation, back, pickers, toggles — use the native pattern. Shared cross-platform components here create "uncanny valley" interfaces.

---

## React Native: Platform.OS Branching

`Platform.OS` returns `'ios'`, `'android'`, or `'web'`. Use it for targeted platform differences.

**Inline branching (for single values):**
```typescript
import { Platform, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'ios' ? 20 : 0,
    elevation: Platform.OS === 'android' ? 4 : 0,
    shadowColor: Platform.OS === 'ios' ? '#000' : undefined,
  }
});
```

**Platform.select (for multiple values):**
```typescript
const hitSlop = Platform.select({
  ios: { top: 10, bottom: 10, left: 10, right: 10 },
  android: { top: 8, bottom: 8, left: 8, right: 8 },
  default: undefined,
});
```

**Platform-specific files (best for large divergence):**
```
Button.ios.tsx       ← loaded only on iOS
Button.android.tsx   ← loaded only on Android
Button.tsx           ← fallback / web
```
Import as `import Button from './Button'` — Metro/Webpack resolves the right file automatically. Prefer this over `if/else` when the component structure differs significantly.

**When NOT to branch:**
- Don't branch for styling choices that could be unified (padding, colors)
- Don't branch to implement platform behavior — use the native component library
- Excessive branching is a sign the abstraction is wrong; consider platform-specific screens

---

## React Native: SafeAreaProvider

Every React Native app must handle notches, Dynamic Island, and home indicators via `react-native-safe-area-context`.

**Setup (root of app):**
```tsx
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
```

**Usage in screens:**
```tsx
import { SafeAreaView } from 'react-native-safe-area-context';

// Option 1: SafeAreaView wrapper (applies insets as padding)
function Screen() {
  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
      <Content />
    </SafeAreaView>
  );
}

// Option 2: useSafeAreaInsets hook (for manual inset application)
function BottomBar() {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingBottom: insets.bottom + 16 }}>
      <ActionButtons />
    </View>
  );
}
```

**Critical rules:**
- Never use `SafeAreaView` from `react-native` core — it's deprecated and broken on Android
- Always use `edges` prop to specify which edges need insets — don't apply top inset inside a NavigationStack (React Navigation handles that)
- For full-bleed backgrounds, use a regular `View` with `backgroundColor` + `SafeAreaView` inside

---

## Flutter: Platform Detection

Flutter exposes platform via two APIs with different purposes.

**At compile-time / build logic:**
```dart
import 'dart:io';

if (Platform.isIOS) {
  // iOS-specific behavior
} else if (Platform.isAndroid) {
  // Android-specific behavior
}
```

**At widget tree (Material vs Cupertino):**
```dart
// Check the ThemeData platform
final platform = Theme.of(context).platform;

Widget buildSwitch() {
  return switch (platform) {
    TargetPlatform.iOS || TargetPlatform.macOS =>
      CupertinoSwitch(value: value, onChanged: onChanged),
    _ =>
      Switch(value: value, onChanged: onChanged),
  };
}
```

**PlatformWidget pattern (recommended for systematic platform UI):**
```dart
class PlatformWidget extends StatelessWidget {
  final Widget Function(BuildContext) ios;
  final Widget Function(BuildContext) android;

  Widget build(BuildContext context) {
    return switch (Theme.of(context).platform) {
      TargetPlatform.iOS => ios(context),
      _ => android(context),
    };
  }
}
```

**Flutter package for this:** `flutter_platform_widgets` handles Switch, Button, AppBar, Dialog, etc. with automatic platform switching. Worth using instead of rolling your own.

---

## Design Token Sharing

Design tokens are the bridge between design system and platform implementations.

**Token hierarchy:**
```
Primitive tokens:    blue-500: #3B82F6
Semantic tokens:     color.action.primary: {blue-500}
Component tokens:    button.background.default: {color.action.primary}
```

**Sharing strategy:**
1. Define all tokens in a single source (Figma Tokens, Style Dictionary, or a JSON file)
2. Generate platform-specific outputs from that source

**Style Dictionary output example:**
```json
// tokens.json (source)
{
  "color": {
    "primary": { "value": "#3B82F6" },
    "error": { "value": "#EF4444" }
  },
  "spacing": {
    "md": { "value": "16" }
  }
}
```

Generates:
- `tokens.ts` for React Native: `export const colorPrimary = '#3B82F6'`
- `AppColors.swift` for iOS: `static let primary = Color(hex: "#3B82F6")`
- `AppColors.kt` for Android: `val Primary = Color(0xFF3B82F6)`
- `tokens.css` for Web: `--color-primary: #3B82F6;`

**What tokens don't share:** spacing unit interpretation (pt vs dp vs px), typography tokens (font names differ per platform), shadow tokens (elevation model differs).

---

## Navigation Libraries

**React Native: React Navigation**
- `@react-navigation/native` is the de-facto standard
- Stack: `@react-navigation/native-stack` — native iOS/Android nav animations
- Tabs: `@react-navigation/bottom-tabs`
- Drawer: `@react-navigation/drawer`
- Deep linking: configured via `linking` prop on `NavigationContainer`

```typescript
// Type-safe navigation (recommended)
type RootStackParamList = {
  Home: undefined;
  Profile: { userId: string };
};
```

**Flutter: go_router**
- Declarative URL-based routing (`GoRouter`)
- Supports deep linking, nested navigation, redirects
- Replaces the older `Navigator` 2.0 API with simpler API

```dart
final router = GoRouter(routes: [
  GoRoute(path: '/', builder: (_, __) => HomeScreen()),
  GoRoute(
    path: '/profile/:id',
    builder: (_, state) => ProfileScreen(id: state.pathParameters['id']!),
  ),
]);
```

**Web: React Router**
- v6+ with `createBrowserRouter` and `<Outlet />` for nested layouts
- Shares URL patterns with React Navigation (both support deep links)
- If building a Next.js web companion: use Next.js App Router, not React Router

---

## Icon Systems

Icons are the most visible platform differentiator. Do not unify them.

**iOS: SF Symbols**
- Only available on Apple platforms — do not attempt to replicate on Android/Web
- React Native: `@expo/vector-icons` wraps SF Symbols via `MaterialIcons` fallback — use it for iOS and a different set for Android
- In RN with Expo: `Ionicons` is designed to visually match SF Symbols on iOS and Material on Android

**Android: Material Symbols**
- `google_fonts` package provides Material Symbols in Flutter
- React Native: `MaterialCommunityIcons` from `react-native-vector-icons`
- Variable font: weight, fill, grade, optical size are adjustable

**Web: Heroicons / Lucide**
- `lucide-react`: consistent stroke icon set, MIT license, ~1000 icons
- `@heroicons/react`: Tailwind-aligned, two styles (outline/solid)
- Do not use SF Symbols or Material Symbols on Web — licensing and rendering differ

**Cross-platform icon strategy:**
- Define an icon name abstraction: `icon="settings"` → resolves to `gear` (SF Symbols) / `settings` (Material) / `Settings` (Lucide)
- Map manually for the ~50 icons your app actually uses — automated mapping is unreliable

---

## Testing Across Platforms

**React Native: Detox (E2E)**
- Gray-box testing — interacts with native views
- Runs on real simulators/emulators
- Write once, run on iOS and Android (same test file, different device targets)
- Setup is complex; worth it for critical flows (login, checkout)

```javascript
describe('Login flow', () => {
  it('should log in with valid credentials', async () => {
    await element(by.id('email-input')).typeText('user@test.com');
    await element(by.id('login-button')).tap();
    await expect(element(by.id('home-screen'))).toBeVisible();
  });
});
```

**Flutter: Integration tests**
- `flutter_test` + `integration_test` package
- Runs on real device or emulator
- Same test code runs on iOS and Android

```dart
testWidgets('login flow', (tester) async {
  await tester.pumpWidget(MyApp());
  await tester.enterText(find.byKey(Key('email')), 'user@test.com');
  await tester.tap(find.byKey(Key('login-button')));
  await tester.pumpAndSettle();
  expect(find.byKey(Key('home-screen')), findsOneWidget);
});
```

**Web: Playwright**
- Cross-browser E2E: Chromium, Firefox, WebKit
- Auto-waits; no `sleep()` needed
- Component testing (`@playwright/experimental-ct-react`) for isolated component tests

**Testing strategy:**
- Unit tests: platform-agnostic business logic — test once
- Component tests: per-platform (Detox/Flutter/Playwright) — test the native rendering
- E2E flows: critical paths only — expensive to maintain, high signal
- Visual regression: `jest-image-snapshot` (RN) or `golden tests` (Flutter) for pixel-level comparisons
