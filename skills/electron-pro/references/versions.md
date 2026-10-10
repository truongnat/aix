# Electron — version notes

Pin **`electron`** in `package.json` and follow [Electron breaking changes](https://www.electronjs.org/docs/latest/breaking-changes) per major.

| Topic | Check |
|-------|--------|
| **Chromium / Node** | Bundled versions per Electron release |
| **Deprecated APIs** | `remote`, old `webPreferences` names |
| **Native modules** | Rebuild (`electron-rebuild`) for ABI |
| **Electron ≥ 28+** | Verify security defaults in release notes |

**When NOT to upgrade Electron:** Without retesting native addons and signing pipeline.
