# Security Policy

## Supported Versions

| Version | Supported |
| ------- | --------- |
| 1.1.x   | Yes       |
| 1.0.x   | Security fixes only |
| < 1.0   | No        |

## Reporting Security Issues

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via GitHub's private vulnerability reporting:

1. Go to the [Security tab](https://github.com/truongnat/ai-engineering-harness/security) of this repository
2. Click **Report a vulnerability**
3. Provide a detailed description of the issue

You should receive a response within 72 hours. If for some reason you do not, please follow up to ensure we received your original report.

Please include the following information in your report:

- Type of issue (e.g., command injection, path traversal, regex denial of service)
- Full paths of source file(s) related to the issue
- Step-by-step instructions to reproduce the issue
- Impact assessment of the issue

## Disclosure Timeline

- **Day 0**: Vulnerability reported
- **Day 3**: Acknowledgment sent to reporter
- **Day 14**: Fix developed and tested
- **Day 21**: Patch release published
- **Day 30**: Public disclosure (coordinated with reporter)

## Artifact Content Restrictions

**All harness artifacts (`.harness/`, `docs/`, `AGENTS.md`, etc.) MUST NOT contain:**

- Credentials, tokens, secrets, API keys, or `.env` values
- Customer data or private business information
- Temporary logs or transient discussion noise

**Rationale:** These artifacts are intended for durability and reuse. If a lesson is useful but sensitive, summarize the pattern or approach without preserving the sensitive details.

## Dependency Policy

- Direct dependencies are kept minimal (currently 1 runtime dependency: `@clack/prompts`)
- `npm audit` runs in CI on every pull request
- Critical or high-severity dependency vulnerabilities are patched within 7 days
- Dependabot is enabled for automated dependency updates

## Security Design Decisions

- CLI commands use `spawnSync` with `shell: false` (except Windows fallback) and reject shell metacharacters
- The telemetry server binds to `127.0.0.1` only and validates payload schema before storage
- Policy engine regex patterns are length-bounded and cached with eviction
- No `eval()`, `Function()`, or `vm.runInNewContext()` is used anywhere in the codebase
