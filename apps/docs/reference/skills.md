# Skills Catalog

The canonical library currently contains 160 `SKILL.md` files organized in 9 categories under `content/skills/`.
Generate the current machine-local catalog instead of relying on a copied list of names:

```bash
node packages/cli/dist/index.js skills validate
node packages/cli/dist/index.js skills list
node packages/cli/dist/index.js skills show <frontmatter-name>
```

`catalog.json` contains names, descriptions, kinds, roles and compatibility metadata. It is
local generated output and may contain machine-specific paths; do not commit it.

Examples of current process skills: `discussing-pro`, `planning-pro`, `ttd-pro`,
`executing-pro`, `code-review-pro`, `verify-pro`, `remember-pro`. Domain examples include
`api-design-pro`, `typescript-pro`, `react-pro`, `nestjs-pro`, and `postgresql-pro`.

Root `skills/*.md` files are legacy mirrors. Author changes in canonical content; the host
plugin reads that content directly, while `aix install` emits provider-specific configuration.
