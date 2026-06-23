## Interactive Discussion (Discuss Phase)

`harness-discuss` is a **collaborative, multi-turn** phase. It is not a hard gate stop.

When goal, scope, or approach is still forming:

1. Synthesize what you already know from artifacts first.
2. For deliberative decisions (feature, approach, solution), use **three-option scoring** per `rules/core/option-scoring.md` before asking the user to choose.
3. Ask the **minimum** targeted question(s) needed to continue.
4. Read `.ai-harness/provider-interaction.md` and **invoke** the listed structured choice tool for this install's provider (`AskQuestion` on Cursor, `AskUserQuestion` on Claude Code).
5. Wait for the tool result, then continue discuss — update `DISCUSSION.md` and ask the next question or recommend `harness-plan`.
6. Use markdown-only A/B/C prompts only when no structured tool is listed or the tool is absent from the active tool list.

Do **not** use `### Blocked` for normal discuss clarifications (feature choice, scope tradeoffs, approach preference).

Use `### Blocked` in discuss only when:

- no goal or artifact exists and Session Start has not run
- the user must choose between materially different directions and explicit approval is required before planning
- required product judgment cannot proceed even after one round of questions

After the user answers a discuss question, **continue the discuss workflow** in the next turn. Do not treat the question as a terminal stop.
