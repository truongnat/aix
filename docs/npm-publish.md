# npm Publish

## Package

- **name:** `ai-engineering-harness`
- **bin:** `ai-engineering-harness`, `aih` → `./bin/aih.js`
- **registry:** https://www.npmjs.com/package/ai-engineering-harness

## What ships in the tarball

Controlled by `files` in `package.json`:

- `bin/`, `lib/`, `runtime/`, capability dirs, `docs/`
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
node validate.js
npm test
npm version patch   # or minor, as appropriate
npm pack --dry-run
npm publish --dry-run
npm publish --access public --auth-type=web
npm view ai-engineering-harness version
```

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

## Do not publish automatically from CI

Publishing is a manual maintainer step after validation and version bump.
