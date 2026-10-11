---
name: i18n-checklist-runner
description: "Run an internationalization/localization checklist over a multi-language product. Use when a tester verifies translations, string lengths, date/time and currency formats, timezones, special/Unicode characters, pluralization, collation, and layout breakage across locales."
metadata:
  kind: "domain"
  version: "0.2.0"
  tags: "qa,i18n,l10n,localization,checklist"
---

# I18n Checklist Runner

## Timestamp and artifact convention
As soon as this skill starts, capture the current timestamp in the user's/project's timezone, formatted `YYYY-MM-DD HH:mm:ss Z`.

If checklist files are created, store them under:

```text
artifacts/YYYY-MM-DD/i18n-checklist-runner/HHmmss-locale-or-feature/
```

Every artifact must record `Session timestamp`, locale, feature, which checklist groups ran, issues, and evidence.

## Goal
Help a tester systematically catch the multi-language and locale defects that are easiest to miss — the ones that only appear in German-length strings, Japanese input, or a timezone that isn't the developer's.

## Scope questions first
Before running, establish (ask if not provided):
- Which **locales** are in scope? Test all supported, or a representative subset?
- Which **locale standard** governs formats — CLDR defaults, or a product-specific style guide? (Never impose a standard if the product has its own guideline; ask or state the assumption.)
- Is **RTL** supported?

## Checklist

### Translation coverage
- Untranslated strings still showing the source language.
- Hard-coded text not going through the i18n system (often buttons, error messages, alt text, placeholders).
- **Raw keys leaking to UI**: `user.profile.save_button` rendered literally.
- Concatenated strings whose word order is wrong in other languages ("You have " + n + " messages" — a classic i18n bug).
- Mixed-language UI: some labels translated, neighbors not.

### Text expansion and layout
- Translated strings 30–50% longer than English breaking layout: clipped buttons, truncated labels, overflowing tables, wrapped mid-word.
- Check the longest supported language (German/Finnish/Vietnamese diacritics stack vertically) against fixed-width components.
- Pseudo-localization check if available: `[!!! Ŝâmple ŧext !!!]` instantly reveals hard-coded text and truncation.

### Date, time, timezone
- Format matches locale: `31/12/2026` vs `12/31/2026` vs `2026-12-31` — an ambiguous `03/04/2026` is a bug waiting to happen.
- 12h vs 24h clock, AM/PM markers, week starting Sunday vs Monday.
- Timezone correctness: does a date stored in UTC render in the user's local zone? Does a "today" boundary flip correctly?
- DST transitions if the product schedules anything.

### Numbers, currency, units
- Decimal/thousands separators: `1,234.56` (en-US) vs `1.234,56` (de-DE) vs `1 234,56` (fr-FR).
- Currency symbol position and code (`100 €` vs `€100`), never assume the amount is in the same currency across locales.
- Negative number formatting, percent placement, rounding behavior.
- Input parsing: does the form ACCEPT the user's local format, or reject `1,5` as invalid?

### Unicode and character handling
- Accented characters in all fields (Vietnamese: `Nguyễn Văn An`), CJK input, emoji in names/comments.
- Sorting and search with accents: does searching `nguyen` find `Nguyễn`? Is sort order locale-aware (e.g. `ä` near `a` in German)?
- RTL rendering if supported: layout mirrors, punctuation placement, mixed-direction text (`bidi` issues).

### Pluralization and grammar
- Correct plural forms — some languages have more than two (Russian: 1, 2–4, 5+; Vietnamese has none).
- Gendered grammar where applicable.
- Interpolated values placed correctly for each language's sentence structure.

### Locale-dependent validation
- Names (no "letters only" regex rejecting `José` or `Müller`), addresses, postal codes (format varies wildly), phone numbers (length, `+` prefix).

### Export and files
- CSV/PDF/email preserve encoding — accented text must not come out as `Nguy?n` or mojibake.
- Exported dates/numbers keep either the user's locale or a documented standard — state which is expected.

## Output format

```text
Session timestamp: [YYYY-MM-DD HH:mm:ss Z]
Locale: [vi-VN / de-DE / ja-JP / ...]
Feature: [screen/flow]

| Group | Check | Result | Issue | Severity | Evidence |
|---|---|---|---|---|---|
| Layout | Submit button label | FAIL | "Absenden" clipped to "Absen…" | High | screenshot |

To confirm:
- Which locales are in scope?
- Which standard governs date/currency format?
- Is RTL supported?
```

## Anti-patterns
- Testing only English + one "other" language and calling it i18n coverage.
- Treating "shows translated text" as pass — a translated string that breaks layout or truncates mid-word is still a defect.
- For Vietnamese specifically: always test with accented data and with strings longer than the English original.
