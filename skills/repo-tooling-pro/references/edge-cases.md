# Repo tooling edge cases

- **Batch query OOM** — Very large embedding batches + many long prompts can spike RAM; split queries across runs or reduce concurrent work.

- **Wrong cwd** — Commands assume **repo root** as working directory; run from project root so paths to `knowledge-base/` and `config.md` resolve.

- **Missing index** — `query-kb` / `query-kb-batch` fail if **`build-kb`** was not run or artifacts are stale.

- **Windows console** — Prefer **UTF-8** terminal for paths and JSON; PowerShell encoding quirks can garble output when piping.

- **Template skill** — `list-skills` may include `examples/skill-template` with flags; **`validate-skills`** behavior matches tool help for template inclusion.

- **`dist/` missing** — Run **`npm install`** and **`npm run build`** (see root **`package.json`**) so `dist/tools.js` exists before invoking CLI.

- **Interrupted `build-kb` / `index-project`** — Partial artifacts can confuse `verify-kb` or queries; clean output dir or re-run full build per **`scripts/README.md`** — **`failure-modes-detection-mitigation.md`**.
