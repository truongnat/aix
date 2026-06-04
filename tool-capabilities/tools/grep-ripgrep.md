# grep / ripgrep

## Purpose

Search code and text quickly across the repository.

## Detect

```bash
rg --version
git grep -n "TODO" AGENTS.md
grep --version
```

## Use When

- finding symbols, commands, or docs
- mapping dependencies by import patterns
- locating validation or prompt references

## Do Not Use When

- a stronger structure-aware tool is available and clearly better
- the task only requires a single known file

## Example Commands

```bash
rg "harness-run"
git grep -n "TOOL_CONTEXT"
grep -R "markitdown" .
```

## Fallback

- scan a smaller known directory manually
- ask the user for the exact path when search scope is unclear

## Blocking Conditions

- block only when repository search is essential and no local text-search command is available
