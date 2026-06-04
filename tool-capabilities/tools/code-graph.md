# code graph

## Purpose

Provide repository-structure understanding beyond plain text search.

## Detect

```bash
joern --help
src version
repograph --help
```

## Use When

- repository structure matters more than raw text matches
- dependency or ownership boundaries are unclear
- cross-file navigation needs stronger context

## Do Not Use When

- the repo is small enough for file tree plus search
- no graph tool is installed

## Example Commands

```bash
joern --help
src version
repograph --help
```

## Fallback

- inspect the file tree
- scan imports, requires, and exports with `rg`

## Blocking Conditions

- do not block by default; fall back to file tree plus import scan unless the user explicitly requires graph-based analysis
