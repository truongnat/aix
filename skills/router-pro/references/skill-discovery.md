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

## Multi-skill routing

When a query spans multiple domains (e.g. "secure the React login form"):
- Return the top skill per relevant domain: `react-pro` (UI layer) + `auth-pro` (session/token layer) + `security-pro` (XSS/CSP layer).
- State ownership boundaries so skills don't overlap in the response.
- Prefer 2–3 skills max; more creates noise.
