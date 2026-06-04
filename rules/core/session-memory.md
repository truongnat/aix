## Session Memory

Files are the source of truth.

Read order for harness work:

1. `.ai-harness/activation.md`
2. `.harness/STATE.md`
3. Active session under `.harness/sessions/`
4. Matching command contract under `.ai-harness/commands/` or `.ai-harness/runtime-commands/`
5. Matching prompt template under `.ai-harness/prompt-templates/` when present

Do not treat provider conversation format as harness state.
