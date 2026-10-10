# Expo native UI and platform verification matrix

Use this matrix after the compact workflow when the task involves a high-risk claim. Fixtures must use synthetic identifiers and redacted values. The domain skill produces evidence; `sk-tester` executes tests, `sk-review`/`sk-review-pr` records findings, and `sk-verify-pro` owns the final `pass`/`block`/`defer` decision.

| Scenario | Expected result | Evidence | Failure/limitation | Next owner |
|---|---|---|---|---|
| iOS/Android parity | The same action has equivalent semantics on iOS and Android with platform-specific affordances documented. | Device/simulator screenshots plus interaction assertions. | Web parity is checked separately. | sk-tester -> sk-verify-pro |
| Web behavior | Web keyboard and pointer interaction reaches the same accessible state without native-only assumptions. | Browser test and accessibility tree snapshot. | Unsupported native APIs are surfaced as limitations. | sk-review -> sk-verify-pro |
| Safe area | Content and primary controls remain inside insets across notch and gesture-navigation devices. | Screenshots at representative inset profiles and bounds assertion. | Do not validate only on a flat simulator. | sk-tester -> sk-verify-pro |
| Dynamic type | Large text settings preserve readable hierarchy without clipping or hidden actions. | Large-font screenshots and text measurement assertions. | Unverified locales remain a limitation. | sk-a11y-design-pro -> sk-verify-pro |
| Labels/focus | Every actionable control has an accessible label and predictable focus order. | Accessibility inspector output and focus traversal log. | Visual presence is not evidence of accessibility. | sk-review -> sk-verify-pro |
| Dark mode | Contrast and semantic colors remain valid when the system theme changes. | Theme screenshots, contrast report, token trace. | Hard-coded colors block pass. | sk-tester -> sk-verify-pro |
| Reduced motion | Reduced-motion preference disables nonessential animation while preserving state transitions. | Preference fixture and transition assertion. | Do not remove essential progress feedback. | sk-verify-pro |
| Keyboard/touch target | Keyboard does not cover focused inputs and touch targets meet the product minimum. | Keyboard screenshots, hit-area measurements and device matrix. | Small-target exceptions require explicit product decision. | sk-review -> sk-verify-pro |

## Verification response shape

Return exactly:

- **Claim:** the bounded domain claim being assessed.
- **Criteria:** scenario rows and acceptance thresholds.
- **Evidence:** paths, commands, fixture IDs, timestamps and reviewer findings.
- **Limitations:** untested environments, assumptions, stale inputs or residual risk.
- **Next owner:** `sk-tester`, `sk-review`, `sk-review-pr`, the named domain owner, or `sk-verify-pro`.

Do not claim final release status from this matrix; hand the packet to `sk-verify-pro`.
