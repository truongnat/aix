# Code packaging — versions

## Python

- **`requires-python`** in `pyproject` vs CI matrix; manylinux ABI for wheels.

## Base images

- `python:3.12-slim` digest pin for reproducible builds.

## GitHub Actions

- `actions/setup-python`, `docker/build-push-action` majors — note breaking releases.

## Node (when shipping JS)

- Align `engines` with CI Node version; `npm publish` **provenance** per org policy — **`multi-ecosystem-packaging-notes.md`**.
