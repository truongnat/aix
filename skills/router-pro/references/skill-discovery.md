# Skill Discovery — How router-pro finds and ranks skills

## Discovery sources (in priority order)

1. **`knowledge-base/embeddings/skill_index.json`** — primary; built by `node dist/tools.js build-skill-index`. Contains name, description, triggers, when_to_use, and references for all 70+ skills.
2. **`skills/` directory scan** — fallback when index is absent or stale. Read each `SKILL.md` frontmatter directly.

## Matching algorithm

```
score(skill, query) =
  trigger_exact_match   × 3   (query contains a trigger keyword verbatim)
  + trigger_partial_match × 1  (query contains a word from a trigger phrase)
  + description_overlap  × 1  (query words appear in description)
  + domain_alignment     × 2  (query domain matches skill metadata.domain)
```

Top-N skills (default N=3) are returned in descending score order.

## Tie-breaking

When scores are equal, prefer:
1. Skills with `level: professional` or `level: advanced` over `foundation`.
2. More specific domain (e.g. `auth` > `backend`) when request is domain-specific.
3. Skills with `references/` (richer content) over bare SKILL.md skills.

## Keeping the index fresh

The index is rebuilt automatically after `npx install` and `npx add`. For local authoring:
```bash
npm run build-skill-index
```

Run after adding, renaming, or substantially editing any skill's frontmatter or trigger list.

## Stack-aware routing (router-pro)

Before scoring or naming **framework** skills, resolve **stack context** (see `SKILL.md` — Stack context resolution).

1. **Collect signals**: `pubspec.yaml` / `.dart` → Flutter; `next.config.*` → Next; `package.json` with Vite/CRA and no Next → React web; user-stated stack.
2. **Filter ineligible skills**: for a Flutter task, do not output `react-pro` or `nextjs-pro` for the **app/UI** layer. For a React SPA task, do not output `flutter-pro` for UI.
3. **Optional scoring tweak** (when building a ranked list): add a **stack match bonus** to the domain skill that matches the resolved stack, and **down-rank** skills that are known-wrong stack for the same layer (e.g. `react-pro` when `pubspec.yaml` is present and the task is `lib/**` UI).

**Example (correct):** "Fix Riverpod provider in `lib/features/calendar/...`" + `pubspec.yaml` in repo → top app skill **`flutter-pro`**, plus `testing-pro` if tests are in `test/**`.

**Example (wrong):** Same query but recommended route lists **`react-pro`** for the UI — **reject**; replace with **`flutter-pro`**.

## Multi-skill routing

When a query spans multiple domains, pick the **right** app-layer skill for the stack, then add cross-cutting skills.

- **Web React (non-Next) example:** "secure the React login form" → `react-pro` (UI) + `auth-pro` (session/token) + `security-pro` (XSS/CSP).
- **Flutter example:** "secure login form in Flutter" → `flutter-pro` + `auth-pro` + `security-pro`.

State ownership boundaries so skills don't overlap in the response. Prefer 2–3 skills max; more creates noise.
