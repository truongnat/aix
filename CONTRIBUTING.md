# Contributing to agentic-sdlc

## Prerequisites

- Rust 1.75+ (`rustup update stable`)
- Cargo

## Getting Started

```bash
git clone https://github.com/truongnat/agentic-sdlc.git
cd agentic-sdlc
cargo build
cargo test
```

## How to Contribute

1. **Fork** this repo
2. Create a branch: `git checkout -b feature/your-feature`
3. Make changes and add tests
4. Run: `cargo test && cargo clippy`
5. Commit using Conventional Commits: `feat:`, `fix:`, `docs:`, `chore:`
6. Open a **Pull Request** against `main`

## Project Structure

- `src/` — Core runtime engine
- `docs/` — Documentation
- `tests/` — Integration tests

## Code Standards

- Run `cargo fmt` before committing
- Fix all `cargo clippy` warnings
- Add tests for new features

## Questions?

Open an issue or start a Discussion.
