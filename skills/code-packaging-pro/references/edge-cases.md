# Edge cases

## Repository layout

- **Monorepo** — multiple `pyproject` roots; **paths** and **working-directory** in Actions must match.
- **Editable installs** (`pip install -e`) — Behavior differs from wheel in CI; document test strategy — **`testing-pro`**.

## Native / ABI

- **Native** extensions — **manylinux** wheels vs **source** builds; **Docker** builds on Linux may hide **macOS**-only link failures — run matrix or **cibuildwheel**.
- **`musl` vs glibc** — Alpine images vs manylinux wheels mismatch — **`failure-modes-detection-mitigation.md`**.

## Indexes and auth

- **Private** PyPI — **auth** in CI (**`security-pro`**); never log **tokens**.
- **Extra index URL** ordering — Unexpected dependency resolution — pin tooling versions.

## Environment quirks

- **PEP 668** (externally managed env) — `pip install` fails on Debian/Ubuntu Python — use **venv**, **official python image**, or **`UV_SYSTEM_PYTHON`** patterns per tool docs.
- **PEP 723** single-file scripts — Packaging story differs from library — don’t confuse with wheel release.

## Docker

- **BuildKit secrets** vs legacy `DOCKER_BUILDKIT=0` — Different secret mount behavior — document CI default.
- **Platforms** — `linux/amd64` build on ARM Mac with emulation — Slow + subtle bugs — **`versions.md`**.
- **`latest` digest drift** — Same workflow, different libc tomorrow — pin digest for reproducibility.

## Releases

- **yanked** packages on PyPI — Consumers break — pin transitive ranges carefully in apps.

## Regulatory / air-gapped

- Offline index mirror — Separate promote step — **`deployment-pro`**.
