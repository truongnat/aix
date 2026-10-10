# CLI — integration map

| Skill | When |
|-------|------|
| **`code-packaging-pro`** | Entry points, `bin`, publish, semver for argv contract |
| **`security-pro`** | Secrets (env vs argv), dangerous defaults, path traversal |
| **`testing-pro`** | Golden `--help`, subprocess tests, exit code assertions |
| **`javascript-pro`** | Node `bin`, ESM/CJS, shebang, `npx` behavior |
| **`typescript-pro`** | Typed argv boundaries if using TS for CLI |
| **`docker-pro`** | CLI inside container (TTY, `-i`, PATH), exec non-interactive |
| **`repo-tooling-pro`** | Internal repo scripts vs shipped user-facing CLIs |

**Boundary:** **`cli-pro`** owns **argv UX**, **stdio/exit contracts**, **signals/pipes**, **completions conceptually**; runtime-specific APIs stay in language skills and parse libraries’ docs.
