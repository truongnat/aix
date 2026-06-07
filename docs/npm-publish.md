# npm Publish

## Package

- **name:** `ai-engineering-harness`
- **bin:** `ai-engineering-harness`, `aih` → `./bin/aih.js`
- **registry:** https://www.npmjs.com/package/ai-engineering-harness

## What ships in the tarball

Controlled by `files` in `package.json`:

- `bin/`, `dist/`, `runtime/`, capability dirs, `docs/`
- `aih.sh`, `install.sh`, `aih.ps1`, install scripts
- `README.md`, `PACK.md`, `LICENSE`, etc.

**Not** included: `test/`, `examples/`, local dogfood directories.

Verify before publish:

```bash
npm pack --dry-run
npm publish --dry-run
```

If npm reports `You cannot publish over the previously published versions`, the fix is to bump `package.json` to a new version first. Republishing the same version is not allowed.

## Publish (maintainers)

```bash
node bin/validate.js
npm test
npm pack --dry-run
npm publish --dry-run
npm view ai-engineering-harness version
```

Version bumps and real npm publication are owned by the main-branch
`changesets` release workflow:

- `.github/workflows/release.yml` runs `changesets/action`
- `npm run release` publishes with `npm publish --provenance`
- `.github/workflows/publish.yml` is limited to the GitHub Release on `v*` tags

Use the manual commands above as preflight checks, dry-runs, and emergency
maintainer fallback. They are no longer the primary publish path.

Smoke test:

```bash
npx --yes ai-engineering-harness@latest install --provider cursor --yes --dry-run
```

## Consumer install

```bash
npx ai-engineering-harness install
```

GitHub specifier (pre-publish or pinned dev):

```bash
npx --yes github:truongnat/ai-engineering-harness install
```

## Release ownership

- npm publication is automated from the main-branch release workflow
- GitHub Releases are created from the tag workflow
- Maintainers still run validation and dry-run checks locally before merging a release PR
