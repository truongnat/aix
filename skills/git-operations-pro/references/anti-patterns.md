# Git — anti-patterns (support tier)

1. **`git add .` without review** — Stages secrets, debug files, or entire `dist/`; use `git status` + `git diff --staged` before commit.

2. **Force-push to `main`** — Breaks CI, other devs, and audit trail; use **revert** unless rare emergency with team agreement.

3. **Giant commits** — Thousands of lines mixed refactor + feature; impossible to review and bisect; prefer small logical commits.

4. **Commit messages like “fix” or “updates”** — No searchable history; use Conventional Commits + **what** + **why**.

5. **Resolving conflicts by picking random hunks** — Introduces logic bugs; understand each conflict.

6. **Storing secrets in repo** — API keys, `.env` with real values; use **`security-pro`** patterns; rotate if leaked.

7. **Long-lived branches diverging from `main`** — Merge or rebase frequently; painful mega-merges at the end.

8. **Using `git push -f` without `--force-with-lease`** — Can overwrite others’ work; `--force-with-lease` is safer when policy allows force.

9. **Ignoring `.gitignore` hygiene** — Committing `node_modules`, build artifacts, IDE files; clutters history and size.

10. **Bisect on flaky tests** — Yields wrong “bad” commit; stabilize or skip flaky tests first with **`testing-pro`**.

**When NOT to nitpick commit style:** Emergency hotfix — minimal process; follow up with cleanup PR if needed.
