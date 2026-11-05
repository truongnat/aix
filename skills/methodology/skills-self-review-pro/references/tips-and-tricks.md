# Tips and tricks

- Run **`node dist/tools.js analyze-skills --self-review`** before a **release** or **large skill PR**; attach output to the PR or save as `skill-self-review.md`.
- Maintainer entry point: **`skills/README.md`** section **Bundle audit** and root **`README.md`** Quick start.
- Pair with **`node dist/tools.js verify-kb`** after **`knowledge-base/documents/`** edits so RAG stays aligned.
- Keep a **golden list** of skills that **should** stay `low` (pure prose) — do not force scripts on every skill.
