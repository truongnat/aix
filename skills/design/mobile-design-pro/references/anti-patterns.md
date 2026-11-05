# Mobile design — anti-patterns

## Desktop layout shrunk to phone

- Tiny touch targets; hover assumptions.
- **Fix:** 44pt min targets; gesture-first patterns.

## Ignoring safe areas

- Notch/home indicator overlap.
- **Fix:** Respect insets; test on real devices.

## Motion without reduce-motion

- Accessibility failure.
- **Fix:** System setting respect; alternative static UI.

## Copy-paste Material onto iOS

- Uncanny UX; review HIG vs Material where it matters.
