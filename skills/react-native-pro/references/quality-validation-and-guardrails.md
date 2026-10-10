# Quality validation and guardrails (React Native)

## Contents

1. [Version and API honesty](#version-and-api-honesty)
2. [Device and build matrix](#device-and-build-matrix)
3. [Accessibility minimum](#accessibility-minimum)
4. [Review checklist](#review-checklist)

---

## Version and API honesty

- Read **`react-native`**, **`expo`**, and key libs (**`react-native-reanimated`**, **`react-navigation`** / **Expo Router**) from `package.json` before recommending APIs.
- **Do not invent** props, config plugin names, or EAS keys — link to [Expo](https://docs.expo.dev/) / [RN](https://reactnative.dev/) docs for the user’s major version.
- Blog snippets without SDK context are **unsafe** to copy — **`versions.md`**.

---

## Device and build matrix

- Validate non-trivial UI on **both iOS and Android** and at least **one small phone** + **notch** device class.
- **Release** builds differ from **Debug** (perf, Hermes, dev menus) — reproduce serious perf bugs in **Release** on device — **`edge-cases.md`**.

---

## Accessibility minimum

- Tappable elements: **`accessibilityLabel`** (and **`accessibilityRole`** where it helps); respect font scaling when product requires — **`ui-ux-design.md`**.
- Do not rely on color alone for state — contrast for text on images — **`design-system-pro`** for tokens if shared.

---

## Review checklist

- [ ] SDK/RN versions stated or read from repo.
- [ ] Platform differences (iOS vs Android) called out when behavior diverges.
- [ ] Lists: stable keys; images bounded; no obvious list anti-patterns — **`anti-patterns.md`**.
- [ ] No fabricated API names or Expo config without doc anchor — **`versions.md`**.
