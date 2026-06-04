# git-nexus

## Purpose

Use an optional git history or repository context tool when it is installed.

## Detect

```bash
git-nexus --help
git-nexus-cli --help
```

## Use When

- history-aware review needs more context than plain git commands
- the environment already includes the tool

## Do Not Use When

- standard git commands are enough
- the tool is not installed

## Example Commands

```bash
git-nexus --help
git-nexus-cli --help
```

## Fallback

- use `git log`, `git diff`, and `git blame`

## Blocking Conditions

- never block solely because `git-nexus` is unavailable
