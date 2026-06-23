# Skills

Skills define reusable agent capabilities for this harness. Each skill has a narrow purpose, explicit boundaries, a lightweight workflow, and a predictable output contract.

## Included Skills

- `using-harness`
- `mapping-codebase`
- `discussing-goals`
- `brainstorming`
- `writing-plans`
- `executing-plans`
- `using-git-worktrees`
- `test-driven-development`
- `code-review`
- `requesting-code-review`
- `verification`
- `verification-before-completion`
- `remembering`
- `debugging-investigation`
- `security-review`
- `writing-skills`

## Design Rules

- Skills should be specific enough to guide behavior.
- Skills should say when they apply and when they do not.
- Skills should avoid hidden runtime assumptions.
- Skills should emit clear outputs that fit the templates in this repository.
- Skills should follow the prompt format standard in
  [`PROMPT_FORMAT_STANDARD.md`](PROMPT_FORMAT_STANDARD.md).

## Skill Packs

Skill packs are routing aids that help agents choose a relevant domain starting point.

- Packs do not replace the core skills.
- Packs should remain small.
- Domain-specific deep skills can be added later only when justified.
- Project-local generated domain skills may be written into `.harness/skills/` after init.
- `prompt-templates/domain-analysis.md` defines the strict JSON analysis contract for init-time domain selection.

Packs:

- [Frontend](packs/frontend.md)
- [Backend](packs/backend.md)
- [Mobile](packs/mobile.md)
- [DevOps](packs/devops.md)
- [Debugging](packs/debugging.md)
- [Data & AI](packs/data-ai.md)
- [Security](packs/security.md)
- [Cloud](packs/cloud.md)

## Skill Authoring

- [Skill Authoring Rules](SKILL_AUTHORING_RULES.md)
- [Skill System](../docs/skill-system.md)
- [Skill Template](../templates/SKILL.md)

Core skills are mandatory behavior aids. Skill packs are routing aids. Future domain skills must follow the authoring rules and should only be added when the need is recurring, distinct, and worth keeping long term.

Do not grow this repository into a large skill dump.
