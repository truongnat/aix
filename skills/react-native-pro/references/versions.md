# React Native / Expo — version notes

Confirm **`react-native`**, **`expo`**, and **`expo-sdk`** from `package.json`. APIs and New Architecture defaults change across releases.

| Check when upgrading | Risk |
|---------------------|------|
| **Expo SDK** | Breaking changes in config plugins, modules |
| **React Native major** | Native template, Hermes, Fabric |
| **Reanimated / gesture** | Match versions per library matrix |
| **iOS / Android min SDK** | Store requirements |

**When NOT to assume:** Blog posts without SDK version — use [Expo changelog](https://expo.dev/changelog) and [RN upgrade helper](https://react-native-community.github.io/upgrade-helper/).
